import { databaseData, SessionError } from '../sessions/session.service.js';
import { validateEvidence } from './scoring.service.js';

/**
 * Checks whether a user is an authorized evaluator (assigned to this session) or an admin.
 *
 * @param {Object} client - Supabase client
 * @param {string} userId - Auth user ID
 * @param {string} sessionId - Session UUID
 * @returns {Promise<{ isAuthorized: boolean, role: string }>}
 */
export async function verifyEvaluatorOrAdmin(client, userId, sessionId) {
  // 1. Check if user is admin
  const adminCheck = await client
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  if (adminCheck?.data?.role === 'admin') {
    return { isAuthorized: true, role: 'admin' };
  }

  // 2. Check if user has evaluator role
  const evaluatorRole = await client
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'evaluator')
    .maybeSingle();

  if (evaluatorRole?.data?.role !== 'evaluator') {
    throw new SessionError(403, 'EVALUATOR_REQUIRED', 'Only evaluators or administrators may access this resource');
  }

  // 3. If session ID provided, check assignment
  if (sessionId) {
    const assignment = await client
      .from('review_assignments')
      .select('id')
      .eq('session_id', sessionId)
      .eq('evaluator_id', userId)
      .maybeSingle();

    if (!assignment?.data) {
      throw new SessionError(403, 'ASSIGNMENT_REQUIRED', 'You are not assigned to review this interview session');
    }
  }

  return { isAuthorized: true, role: 'evaluator' };
}

/**
 * Records a human reviewer override for an evaluation criterion.
 * Preserves the original evaluation and records an append-only entry in review_overrides.
 *
 * @param {Object} client
 * @param {string} userId
 * @param {string} evaluationId
 * @param {{ oldRating?: number, newRating: number, reason: string, expectedRevision?: number }} body
 * @returns {Promise<Object>}
 */
export async function addReviewOverride(client, userId, evaluationId, body) {
  // 1. Fetch target evaluation
  const evaluationRes = await client
    .from('evaluations')
    .select('id,session_id,turn_id,answer_id,criterion_id,rating,report_revision,evidence_source')
    .eq('id', evaluationId)
    .maybeSingle();

  const evalRow = databaseData(evaluationRes);
  if (!evalRow) {
    throw new SessionError(404, 'EVALUATION_NOT_FOUND', 'Evaluation record not found');
  }

  // 2. Verify evaluator assignment or admin
  await verifyEvaluatorOrAdmin(client, userId, evalRow.session_id);

  // 3. Verify revision if specified
  if (body.expectedRevision && body.expectedRevision !== evalRow.report_revision) {
    throw new SessionError(409, 'REVISION_CONFLICT', 'The evaluation has been modified in another revision');
  }

  const currentRating = evalRow.rating;
  const newRating = body.newRating;

  // 4. Insert append-only review_override
  const overrideInsert = await client.from('review_overrides').insert({
    evaluation_id: evalRow.id,
    session_id: evalRow.session_id,
    criterion_id: evalRow.criterion_id,
    old_rating: currentRating,
    new_rating: newRating,
    reason: body.reason,
    evaluator_id: userId,
    report_revision: evalRow.report_revision,
  }).select().single();

  const overrideRecord = databaseData(overrideInsert);

  // 5. Update evaluation with new rating and human source
  const evalUpdate = await client
    .from('evaluations')
    .update({
      rating: newRating,
      evidence_source: 'human',
      evaluator_id: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', evalRow.id)
    .select()
    .single();

  const updatedEval = databaseData(evalUpdate);

  return {
    evaluation: updatedEval,
    override: overrideRecord,
  };
}

/**
 * Saves an evaluation with strict evidence validation.
 *
 * @param {Object} client
 * @param {Object} evaluationData
 * @param {string} answerText
 * @returns {Promise<Object>}
 */
export async function saveEvaluationWithValidation(client, evaluationData, answerText) {
  if (evaluationData.evidence) {
    const validation = validateEvidence(evaluationData.evidence, answerText);
    if (!validation.valid) {
      throw new SessionError(400, 'INVALID_EVIDENCE', validation.error);
    }
  }

  const insertData = {
    answer_id: evaluationData.answerId,
    criterion_id: evaluationData.criterionId,
    rating: evaluationData.rating,
    applicable: evaluationData.applicable ?? true,
    rationale: evaluationData.rationale || '',
    missing_points: evaluationData.missingPoints || [],
    evidence_excerpt: evaluationData.evidence?.excerpt || null,
    evidence_start: evaluationData.evidence?.start ?? null,
    evidence_end: evaluationData.evidence?.end ?? null,
    evidence_source: evaluationData.source || 'ai',
    report_revision: evaluationData.reportRevision || 1,
  };

  const res = await client
    .from('evaluations')
    .upsert(insertData, { onConflict: 'answer_id,criterion_id,report_revision' })
    .select()
    .single();

  return databaseData(res);
}
