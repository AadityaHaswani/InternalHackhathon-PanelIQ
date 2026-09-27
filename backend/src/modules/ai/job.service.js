import { databaseData } from '../sessions/session.service.js';
import { evaluateAnswerWithAI } from './ai-evaluation.service.js';

/**
 * Enqueues a new background AI job for evaluation.
 *
 * @param {Object} client
 * @param {{
 *   sessionId: string,
 *   turnId: string,
 *   answerId: string,
 *   jobType?: 'evaluation' | 'follow_up' | 'retry_evaluation',
 *   rubricVersion?: number
 * }} params
 * @returns {Promise<Object>}
 */
export async function enqueueAIJob(client, params) {
  const insertData = {
    session_id: params.sessionId,
    turn_id: params.turnId,
    answer_id: params.answerId,
    job_type: params.jobType || 'evaluation',
    status: 'pending',
    attempts: 0,
    max_attempts: 3,
    rubric_version: params.rubricVersion || 1,
  };

  const res = await client.from('ai_jobs').insert(insertData).select().single();
  return databaseData(res);
}

/**
 * Claims the next available or expired lease job atomically.
 *
 * @param {Object} client
 * @param {string} workerId
 * @param {number} [leaseDurationSeconds=60]
 * @returns {Promise<Object|null>}
 */
export async function claimNextAIJob(client, workerId, leaseDurationSeconds = 60) {
  try {
    const rpcRes = await client.rpc('claim_next_ai_job', {
      p_worker_id: workerId,
      p_lease_seconds: leaseDurationSeconds,
    });
    const jobs = databaseData(rpcRes);
    if (Array.isArray(jobs) && jobs.length > 0) {
      return jobs[0];
    }
  } catch {
    // If RPC is unavailable (e.g. in test mocks), fallback to direct query
    const now = new Date().toISOString();
    const candidateRes = await client
      .from('ai_jobs')
      .select('*')
      .or(`status.eq.pending,and(status.eq.claimed,lease_expires_at.lt.${now})`)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    const candidate = databaseData(candidateRes);
    if (!candidate) return null;

    const leaseExpiry = new Date(Date.now() + leaseDurationSeconds * 1000).toISOString();
    const updateRes = await client
      .from('ai_jobs')
      .update({
        status: 'claimed',
        lease_owner: workerId,
        lease_expires_at: leaseExpiry,
        attempts: (candidate.attempts || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', candidate.id)
      .select()
      .single();

    return databaseData(updateRes);
  }

  return null;
}

/**
 * Executes a claimed AI job with safe session deletion handling and idempotency.
 *
 * @param {Object} client
 * @param {Object} job
 * @param {AIFallbackEngine} [engine]
 * @returns {Promise<{ success: boolean, job: Object, error?: string }>}
 */
export async function executeAIJob(client, job, engine = null) {
  // 1. Completed jobs must never execute twice
  if (job.status === 'completed') {
    return { success: true, job, error: 'Job already completed' };
  }

  // 2. Late AI results after deleted sessions must be ignored safely
  const sessionRes = await client
    .from('sessions')
    .select('id,status')
    .eq('id', job.session_id)
    .maybeSingle();

  const session = databaseData(sessionRes);
  if (!session) {
    await client
      .from('ai_jobs')
      .update({
        status: 'failed',
        error: 'Session deleted; late AI result safely ignored',
        lease_owner: null,
        lease_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    return { success: false, job, error: 'Session was deleted; result discarded safely' };
  }

  // 3. Fetch turn and answer data
  const turnRes = await client
    .from('session_turns')
    .select('id,prompt,question_snapshot,stage')
    .eq('id', job.turn_id)
    .maybeSingle();
  const turn = databaseData(turnRes);

  const answerRes = await client
    .from('answers')
    .select('id,answer_text,state')
    .eq('id', job.answer_id)
    .maybeSingle();
  const answer = databaseData(answerRes);

  if (!turn || !answer || answer.state === 'skipped' || !answer.answer_text) {
    await client
      .from('ai_jobs')
      .update({
        status: 'completed',
        result: { skipped: true },
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id);
    return { success: true, job };
  }

  // 4. Run AI Evaluation
  const evalContext = {
    sessionId: job.session_id,
    turnId: job.turn_id,
    answerId: job.answer_id,
    answerText: answer.answer_text,
    questionPrompt: turn.prompt || turn.question_snapshot?.prompt || '',
    expectedConcepts: turn.question_snapshot?.expected_concepts || [],
    rubricAnchors: turn.question_snapshot?.rubric_anchors || {},
    rubricVersion: job.rubric_version || 1,
  };

  const evalResult = await evaluateAnswerWithAI(client, evalContext, engine);

  if (evalResult.success) {
    // 5. Mark job completed atomically
    const updateRes = await client
      .from('ai_jobs')
      .update({
        status: 'completed',
        result: { evaluations: evalResult.evaluations },
        provider: evalResult.provider,
        model: evalResult.model,
        lease_owner: null,
        lease_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id)
      .select()
      .single();

    return { success: true, job: databaseData(updateRes) };
  }

  // 6. Failure: update job attempts or mark failed
  const isFailed = (job.attempts || 1) >= (job.max_attempts || 3);
  const failRes = await client
    .from('ai_jobs')
    .update({
      status: isFailed ? 'failed' : 'pending',
      error: evalResult.error || 'Evaluation failed',
      lease_owner: null,
      lease_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', job.id)
    .select()
    .single();

  return {
    success: false,
    job: databaseData(failRes),
    error: evalResult.error,
  };
}
