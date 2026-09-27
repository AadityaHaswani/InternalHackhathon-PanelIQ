import { databaseData, SessionError } from '../sessions/session.service.js';
import { verifyEvaluatorOrAdmin } from '../evaluations/evaluation.service.js';
import {
  calculateAnswerScore,
  calculateSessionScore,
  UNSCORED_STAGES,
  VALID_CRITERIA,
} from '../evaluations/scoring.service.js';

/**
 * Computes coverage diagnostics across session turns and topics.
 *
 * @param {Array<Object>} turns
 * @param {Array<Object>} answers
 * @param {Array<Object>} evaluations
 * @returns {Object}
 */
export function computeCoverageDiagnostics(turns, answers, evaluations) {
  const scoredTurns = turns.filter((t) => !UNSCORED_STAGES.includes(t.stage));
  const requiredScoredAnswers = scoredTurns.length;

  const answeredTurnIds = new Set(answers.map((a) => a.turn_id));
  const completedScoredAnswers = scoredTurns.filter((t) => answeredTurnIds.has(t.id)).length;

  const evalsByAnswer = new Map();
  for (const e of evaluations) {
    if (!evalsByAnswer.has(e.answer_id)) evalsByAnswer.set(e.answer_id, []);
    evalsByAnswer.get(e.answer_id).push(e);
  }

  let evaluatedAnswers = 0;
  let pendingEvaluations = 0;

  for (const answer of answers) {
    const turn = turns.find((t) => t.id === answer.turn_id);
    if (!turn || UNSCORED_STAGES.includes(turn.stage)) continue;

    const answerEvals = evalsByAnswer.get(answer.id) || [];
    const hasAllCriteria = VALID_CRITERIA.every((c) =>
      answerEvals.some((e) => e.criterion_id === c && e.rating !== null),
    );

    if (hasAllCriteria) {
      evaluatedAnswers++;
    } else {
      pendingEvaluations++;
    }
  }

  // Topic coverage diagnostics
  const coveredTopics = new Set();
  const topicCounts = {};
  for (const turn of turns) {
    const topics = turn.question_snapshot?.topics || turn.topics || [];
    for (const topic of topics) {
      coveredTopics.add(topic);
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }
  }

  const repeatedTopicIndicators = Object.entries(topicCounts)
    .filter(([, count]) => count > 1)
    .map(([topic, count]) => ({ topic, count }));

  const isProvisional = evaluatedAnswers < requiredScoredAnswers;

  return {
    completedScoredAnswers,
    requiredScoredAnswers,
    evaluatedAnswers,
    pendingEvaluations,
    topicCoverage: Array.from(coveredTopics),
    repeatedTopicIndicators,
    isProvisional,
  };
}

/**
 * Retrieves the session report.
 * If candidate (session owner), returns only the released report revision and sanitizes
 * reviewer-only notes and unreleased evaluation details.
 * If evaluator or admin, returns complete draft/released report, evaluations, and diagnostics.
 *
 * @param {Object} client
 * @param {string} userId
 * @param {string} sessionId
 * @returns {Promise<Object>}
 */
export async function getSessionReport(client, userId, sessionId) {
  // 1. Fetch session
  const sessionRes = await client
    .from('sessions')
    .select('id,user_id,status,profile_snapshot,version,completed_at,created_at')
    .eq('id', sessionId)
    .maybeSingle();

  const session = databaseData(sessionRes);
  if (!session) {
    throw new SessionError(404, 'SESSION_NOT_FOUND', 'Session not found');
  }

  const isOwner = session.user_id === userId;
  let isStaff = false;

  if (!isOwner) {
    await verifyEvaluatorOrAdmin(client, userId, sessionId);
    isStaff = true;
  } else {
    try {
      await verifyEvaluatorOrAdmin(client, userId, sessionId);
      isStaff = true;
    } catch {
      isStaff = false;
    }
  }

  // 2. Fetch report revisions
  const revisionsRes = await client
    .from('report_revisions')
    .select('*')
    .eq('session_id', sessionId)
    .order('revision', { ascending: false });

  const revisions = databaseData(revisionsRes) || [];
  const latestRevision = revisions[0] || null;
  const releasedRevision = revisions.find((r) => r.status === 'released') || null;

  // 3. Candidate access rule: candidate can only see the released report.
  if (!isStaff) {
    if (!releasedRevision) {
      throw new SessionError(403, 'REPORT_NOT_RELEASED', 'The final interview report has not been released by an evaluator yet');
    }

    // Return sanitized released report without reviewer-only or private fields
    return {
      sessionId: session.id,
      status: 'released',
      revision: releasedRevision.revision,
      overallScore: releasedRevision.overall_score,
      isProvisional: false,
      summary: releasedRevision.summary,
      coverageDiagnostics: releasedRevision.coverage_diagnostics,
      evaluationSummary: releasedRevision.evaluation_summary,
      releasedAt: releasedRevision.released_at,
    };
  }

  // 4. Staff access (evaluator / admin)
  // Fetch evaluations and turns to compute live state if needed
  const turnsRes = await client
    .from('session_turns')
    .select('id,position,stage,panel_role,turn_type,source,parent_turn_id,question_snapshot,prompt')
    .eq('session_id', sessionId)
    .order('position', { ascending: true });
  const turns = databaseData(turnsRes) || [];

  const answersRes = await client
    .from('answers')
    .select('id,turn_id,state,answer_text,created_at')
    .eq('session_id', sessionId);
  const answers = databaseData(answersRes) || [];

  const evalsRes = await client
    .from('evaluations')
    .select('id,answer_id,turn_id,criterion_id,rating,applicable,rationale,missing_points,evidence_excerpt,evidence_start,evidence_end,evidence_source,report_revision,evaluator_id,updated_at')
    .eq('session_id', sessionId);
  const evaluations = databaseData(evalsRes) || [];

  const overridesRes = await client
    .from('review_overrides')
    .select('id,evaluation_id,criterion_id,old_rating,new_rating,reason,evaluator_id,report_revision,created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  const overrides = databaseData(overridesRes) || [];

  const coverage = computeCoverageDiagnostics(turns, answers, evaluations);

  // Compute answer scores
  const evalsByAnswer = new Map();
  for (const e of evaluations) {
    if (!evalsByAnswer.has(e.answer_id)) evalsByAnswer.set(e.answer_id, []);
    evalsByAnswer.get(e.answer_id).push(e);
  }

  const answerScoreList = [];
  for (const a of answers) {
    const turn = turns.find((t) => t.id === a.turn_id);
    if (!turn) continue;
    const aEvals = evalsByAnswer.get(a.id) || [];
    const scoreResult = calculateAnswerScore(aEvals);
    answerScoreList.push({
      answerId: a.id,
      turnId: turn.id,
      position: turn.position,
      stage: turn.stage,
      score: scoreResult.score,
      isPending: scoreResult.isPending,
    });
  }

  const sessionScoreResult = calculateSessionScore(answerScoreList);

  return {
    sessionId: session.id,
    sessionStatus: session.status,
    reportStatus: latestRevision ? latestRevision.status : 'draft',
    currentRevision: latestRevision ? latestRevision.revision : 1,
    overallScore: sessionScoreResult.sessionScore,
    isProvisional: sessionScoreResult.isProvisional,
    evaluatedCount: sessionScoreResult.evaluatedCount,
    requiredCount: sessionScoreResult.requiredCount,
    coverageDiagnostics: coverage,
    answerScores: answerScoreList,
    evaluations,
    reviewOverrides: overrides,
    revisions,
  };
}

/**
 * Releases a fully reviewed report revision.
 * PRD:
 * - Only assigned evaluator or admin.
 * - Report must have all required scoring completed (no required criterion may remain pending).
 * - Evidence-invalid criteria cannot be treated as valid.
 * - Create/persist a release revision.
 * - Preserve previous revisions.
 *
 * @param {Object} client
 * @param {string} userId
 * @param {string} sessionId
 * @param {{ summary?: string }} body
 * @returns {Promise<Object>}
 */
export async function releaseReport(client, userId, sessionId, body = {}) {
  // 1. Authorize evaluator or admin
  await verifyEvaluatorOrAdmin(client, userId, sessionId);

  // 2. Fetch session
  const sessionRes = await client
    .from('sessions')
    .select('id,status,profile_snapshot')
    .eq('id', sessionId)
    .maybeSingle();

  const session = databaseData(sessionRes);
  if (!session) {
    throw new SessionError(404, 'SESSION_NOT_FOUND', 'Session not found');
  }

  if (session.status !== 'completed') {
    throw new SessionError(409, 'SESSION_NOT_COMPLETED', 'Cannot release report before interview session is completed');
  }

  // 3. Fetch turns, answers, and evaluations
  const turnsRes = await client
    .from('session_turns')
    .select('id,position,stage,panel_role,turn_type,source,parent_turn_id,question_snapshot,prompt')
    .eq('session_id', sessionId)
    .order('position', { ascending: true });
  const turns = databaseData(turnsRes) || [];

  const answersRes = await client
    .from('answers')
    .select('id,turn_id,state,answer_text,created_at')
    .eq('session_id', sessionId);
  const answers = databaseData(answersRes) || [];

  const evalsRes = await client
    .from('evaluations')
    .select('id,answer_id,turn_id,criterion_id,rating,applicable,rationale,missing_points,evidence_excerpt,evidence_start,evidence_end,evidence_source')
    .eq('session_id', sessionId);
  const evaluations = databaseData(evalsRes) || [];

  // Check scoring completeness on all scored turns
  const scoredTurns = turns.filter((t) => !UNSCORED_STAGES.includes(t.stage));
  const answeredTurnIds = new Set(answers.map((a) => a.turn_id));

  const evalsByAnswer = new Map();
  for (const e of evaluations) {
    if (!evalsByAnswer.has(e.answer_id)) evalsByAnswer.set(e.answer_id, []);
    evalsByAnswer.get(e.answer_id).push(e);
  }

  for (const turn of scoredTurns) {
    if (!answeredTurnIds.has(turn.id)) {
      throw new SessionError(409, 'SCORING_PENDING', `Scored turn ${turn.position} has not been answered or evaluated`);
    }
    const answer = answers.find((a) => a.turn_id === turn.id);
    const aEvals = evalsByAnswer.get(answer.id) || [];

    // Verify all applicable criteria have non-null ratings
    for (const criterionId of VALID_CRITERIA) {
      const criterionEval = aEvals.find((e) => e.criterion_id === criterionId);
      if (!criterionEval || criterionEval.rating === null || criterionEval.rating === undefined) {
        throw new SessionError(
          409,
          'SCORING_PENDING',
          `Evaluation for criterion "${criterionId}" on turn ${turn.position} is still pending`,
        );
      }
    }
  }

  // Calculate final score
  const answerScoreList = answers.map((a) => {
    const turn = turns.find((t) => t.id === a.turn_id);
    const aEvals = evalsByAnswer.get(a.id) || [];
    const scoreResult = calculateAnswerScore(aEvals);
    return {
      stage: turn ? turn.stage : 'technical',
      score: scoreResult.score,
      isPending: scoreResult.isPending,
    };
  });

  const sessionScoreResult = calculateSessionScore(answerScoreList);
  if (sessionScoreResult.isProvisional) {
    throw new SessionError(409, 'SCORING_PENDING', 'Cannot release report while session score remains provisional');
  }

  // Determine next revision number
  const existingRevisionsRes = await client
    .from('report_revisions')
    .select('revision')
    .eq('session_id', sessionId)
    .order('revision', { ascending: false })
    .limit(1);
  const existingRevisions = databaseData(existingRevisionsRes) || [];
  const nextRevision = (existingRevisions[0]?.revision || 0) + 1;

  const coverage = computeCoverageDiagnostics(turns, answers, evaluations);

  const evaluationSummary = {
    evaluatedTurns: scoredTurns.length,
    finalScore: sessionScoreResult.sessionScore,
    criteriaWeights: { correctness: 0.40, reasoning: 0.25, relevance: 0.20, tradeoffs: 0.15 },
  };

  const newRevisionRow = {
    session_id: sessionId,
    revision: nextRevision,
    status: 'released',
    overall_score: sessionScoreResult.sessionScore,
    is_provisional: false,
    summary: body.summary || 'Official Evaluation Report',
    coverage_diagnostics: coverage,
    evaluation_summary: evaluationSummary,
    released_by: userId,
    released_at: new Date().toISOString(),
  };

  const insertRes = await client
    .from('report_revisions')
    .insert(newRevisionRow)
    .select()
    .single();

  return databaseData(insertRes);
}

/**
 * Retrieves the immutable interview replay transcript.
 *
 * @param {Object} client
 * @param {string} userId
 * @param {string} sessionId
 * @returns {Promise<Object>}
 */
export async function getSessionReplay(client, userId, sessionId) {
  const sessionRes = await client
    .from('sessions')
    .select('id,user_id,status,profile_snapshot,version,completed_at,created_at')
    .eq('id', sessionId)
    .maybeSingle();

  const session = databaseData(sessionRes);
  if (!session) {
    throw new SessionError(404, 'SESSION_NOT_FOUND', 'Session not found');
  }

  if (session.user_id !== userId) {
    await verifyEvaluatorOrAdmin(client, userId, sessionId);
  }

  const turnsRes = await client
    .from('session_turns')
    .select('id,position,stage,panel_role,turn_type,source,parent_turn_id,question_snapshot,prompt,constraint_snapshot')
    .eq('session_id', sessionId)
    .order('position', { ascending: true });
  const turns = databaseData(turnsRes) || [];

  const answersRes = await client
    .from('answers')
    .select('id,turn_id,state,answer_text,created_at')
    .eq('session_id', sessionId);
  const answers = databaseData(answersRes) || [];

  const answersByTurn = new Map(answers.map((a) => [a.turn_id, a]));

  const transcript = turns.map((turn) => {
    const ans = answersByTurn.get(turn.id) || null;
    const isChallenge = turn.turn_type === 'challenge' || turn.source === 'stored_followup';
    return {
      turnId: turn.id,
      position: turn.position,
      stage: turn.stage,
      panelRole: turn.panel_role,
      prompt: turn.prompt || turn.question_snapshot?.prompt,
      source: turn.source || 'question_bank',
      isChallenge,
      parentTurnId: turn.parent_turn_id || null,
      constraint: isChallenge && turn.constraint_snapshot ? turn.constraint_snapshot : null,
      answer: ans ? {
        id: ans.id,
        state: ans.state,
        answerText: ans.answer_text,
        submittedAt: ans.created_at,
      } : null,
    };
  });

  return {
    sessionId: session.id,
    profile: session.profile_snapshot,
    status: session.status,
    completedAt: session.completed_at,
    totalTurns: turns.length,
    transcript,
  };
}

/**
 * Lists review assignments for an authenticated evaluator.
 *
 * @param {Object} client
 * @param {string} userId
 * @param {{ limit: number, offset: number }} pagination
 * @returns {Promise<Object>}
 */
export async function listReviewAssignments(client, userId, { limit, offset }) {
  // Check evaluator or admin role
  const roleCheck = await client
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['evaluator', 'admin']);

  if (!roleCheck.data?.length) {
    throw new SessionError(403, 'EVALUATOR_REQUIRED', 'Only evaluators or administrators can access review assignments');
  }

  const query = client
    .from('review_assignments')
    .select('id,session_id,evaluator_id,assigned_at')
    .eq('evaluator_id', userId)
    .order('assigned_at', { ascending: false })
    .range(offset, offset + limit);

  const rows = databaseData(await query) || [];

  return {
    assignments: rows.slice(0, limit),
    nextOffset: rows.length > limit ? offset + limit : null,
  };
}
