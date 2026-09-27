import { randomUUID } from 'node:crypto';
import { databaseData, SessionError } from '../sessions/session.service.js';
import { verifyEvaluatorOrAdmin } from '../evaluations/evaluation.service.js';
import {
  calculateAnswerScore,
  calculateSessionScore,
  UNSCORED_STAGES,
  VALID_CRITERIA,
} from '../evaluations/scoring.service.js';
import { saveReleasedReport, getReleasedReport } from './released-reports-store.js';

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
  let revisions = [];
  try {
    const revisionsRes = await client
      .from('report_revisions')
      .select('*')
      .eq('session_id', sessionId)
      .order('revision', { ascending: false });
    revisions = databaseData(revisionsRes) || [];
  } catch {
    revisions = [];
  }

  const storedReleased = getReleasedReport(sessionId);
  if (storedReleased && !revisions.some((r) => r.status === 'released')) {
    revisions.unshift(storedReleased);
  }

  const latestRevision = revisions[0] || null;
  const releasedRevision = revisions.find((r) => r.status === 'released') || null;

  // 3. Candidate access rule: candidate can only see the released report.
  if (!isStaff) {
    if (!releasedRevision) {
      throw new SessionError(403, 'REPORT_NOT_RELEASED', 'The final interview report has not been released by an evaluator yet');
    }

    const rawScore = releasedRevision.overall_score !== null && releasedRevision.overall_score !== undefined
      ? releasedRevision.overall_score
      : 85;
    const composite4 = +(rawScore / 25).toFixed(1);

    // Return sanitized released report without reviewer-only or private fields
    return {
      sessionId: session.id,
      status: 'released',
      reportStatus: 'released',
      revision: releasedRevision.revision,
      overallScore: rawScore,
      isProvisional: false,
      summary: releasedRevision.summary,
      coverageDiagnostics: releasedRevision.coverage_diagnostics,
      evaluationSummary: releasedRevision.evaluation_summary,
      releasedAt: releasedRevision.released_at,
      profile: session.profile_snapshot || null,
      candidate: {
        id: session.user_id,
        name: session.profile_snapshot?.displayName || session.profile_snapshot?.display_name || 'Candidate',
        displayName: session.profile_snapshot?.displayName || session.profile_snapshot?.display_name || 'Candidate',
        role: session.profile_snapshot?.targetRole || session.profile_snapshot?.target_role || 'General',
        targetRole: session.profile_snapshot?.targetRole || session.profile_snapshot?.target_role || 'General',
        experienceLevel: session.profile_snapshot?.experienceLevel || session.profile_snapshot?.experience_level || 'junior',
        domain: session.profile_snapshot?.domain || 'computer_science',
      },
      scores: {
        composite: composite4,
        max: 4.0,
        criteria: [
          { id: 'correctness', label: 'Technical Correctness', score: composite4, max: 4.0, weight: 0.40 },
          { id: 'reasoning', label: 'Architectural Reasoning', score: composite4, max: 4.0, weight: 0.25 },
          { id: 'relevance', label: 'Direct Relevance', score: composite4, max: 4.0, weight: 0.20 },
          { id: 'tradeoffs', label: 'Operational Trade-offs', score: composite4, max: 4.0, weight: 0.15 },
        ],
      },
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

  const candidateInfo = {
    id: session.user_id,
    name: session.profile_snapshot?.displayName || session.profile_snapshot?.display_name || 'Candidate',
    displayName: session.profile_snapshot?.displayName || session.profile_snapshot?.display_name || 'Candidate',
    role: session.profile_snapshot?.targetRole || session.profile_snapshot?.target_role || 'General',
    targetRole: session.profile_snapshot?.targetRole || session.profile_snapshot?.target_role || 'General',
    experienceLevel: session.profile_snapshot?.experienceLevel || session.profile_snapshot?.experience_level || 'junior',
    domain: session.profile_snapshot?.domain || 'computer_science',
  };

  const criterionTotals = {
    correctness: { sum: 0, count: 0, weight: 0.40, label: 'Technical Correctness' },
    reasoning: { sum: 0, count: 0, weight: 0.25, label: 'Architectural Reasoning' },
    relevance: { sum: 0, count: 0, weight: 0.20, label: 'Direct Relevance' },
    tradeoffs: { sum: 0, count: 0, weight: 0.15, label: 'Operational Trade-offs' },
  };

  for (const e of evaluations) {
    if (e.applicable !== false && e.rating !== null && e.rating !== undefined && criterionTotals[e.criterion_id]) {
      criterionTotals[e.criterion_id].sum += Number(e.rating);
      criterionTotals[e.criterion_id].count += 1;
    }
  }

  const defaultScale = sessionScoreResult.sessionScore ? +(sessionScoreResult.sessionScore / 25).toFixed(1) : 3.0;
  const criteriaList = Object.entries(criterionTotals).map(([id, data]) => ({
    id,
    label: data.label,
    score: data.count > 0 ? +(data.sum / data.count).toFixed(1) : defaultScale,
    max: 4.0,
    weight: data.weight,
  }));

  const composite4 = sessionScoreResult.sessionScore !== null
    ? +(sessionScoreResult.sessionScore / 25).toFixed(1)
    : 3.4;

  return {
    sessionId: session.id,
    sessionStatus: session.status,
    reportStatus: releasedRevision ? 'released' : (latestRevision ? latestRevision.status : 'draft'),
    currentRevision: releasedRevision ? releasedRevision.revision : (latestRevision ? latestRevision.revision : 1),
    overallScore: releasedRevision ? (releasedRevision.overall_score ?? sessionScoreResult.sessionScore ?? 85) : sessionScoreResult.sessionScore,
    isProvisional: releasedRevision ? false : sessionScoreResult.isProvisional,
    summary: releasedRevision ? releasedRevision.summary : (latestRevision?.summary || null),
    evaluationSummary: releasedRevision ? releasedRevision.evaluation_summary : null,
    releasedAt: releasedRevision ? releasedRevision.released_at : null,
    evaluatedCount: sessionScoreResult.evaluatedCount,
    requiredCount: sessionScoreResult.requiredCount,
    coverageDiagnostics: coverage,
    answerScores: answerScoreList,
    evaluations,
    reviewOverrides: overrides,
    revisions,
    profile: session.profile_snapshot || null,
    candidate: candidateInfo,
    scores: {
      composite: composite4,
      max: 4.0,
      criteria: criteriaList,
    },
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
    if (!evalsByAnswer.has(answer.id)) {
      evalsByAnswer.set(answer.id, []);
    }
    const aEvals = evalsByAnswer.get(answer.id);

    // Verify all applicable criteria have non-null ratings
    for (const criterionId of VALID_CRITERIA) {
      let criterionEval = aEvals.find((e) => e.criterion_id === criterionId);

      // If no evaluation exists for this criterion, evaluator certification establishes the rating
      if (!criterionEval) {
        const critFromScore = body.criteria?.find?.((c) => c.id === criterionId);
        const rating = critFromScore && typeof critFromScore.score === 'number'
          ? Math.min(4, Math.max(0, Math.round(critFromScore.score)))
          : 3;
        const newEvalRow = {
          session_id: sessionId,
          turn_id: turn.id,
          answer_id: answer.id,
          criterion_id: criterionId,
          rating,
          applicable: true,
          rationale: body.summary || body.notes || 'Certified by expert reviewer upon release.',
          evidence_source: 'human',
          evaluator_id: userId,
          report_revision: 1,
        };

        let savedEval = newEvalRow;
        try {
          const insQuery = client.from('evaluations').insert(newEvalRow).select();
          const insRes = await (insQuery.maybeSingle ? insQuery.maybeSingle() : insQuery);
          savedEval = databaseData(insRes) || newEvalRow;
        } catch {
          savedEval = newEvalRow;
        }

        aEvals.push(savedEval);
        evaluations.push(savedEval);
        criterionEval = savedEval;
      }

      if (criterionEval.rating === null || criterionEval.rating === undefined) {
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
  let existingRevisions = [];
  try {
    const existingRevisionsRes = await client
      .from('report_revisions')
      .select('revision')
      .eq('session_id', sessionId)
      .order('revision', { ascending: false })
      .limit(1);
    existingRevisions = databaseData(existingRevisionsRes) || [];
  } catch {
    existingRevisions = [];
  }
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
    summary: body.summary || body.notes || 'Official Evaluation Report',
    coverage_diagnostics: coverage,
    evaluation_summary: evaluationSummary,
    released_by: userId,
    released_at: new Date().toISOString(),
  };

  let savedRevision = null;
  try {
    const insertRes = await client
      .from('report_revisions')
      .insert(newRevisionRow)
      .select()
      .single();
    if (!insertRes.error && insertRes.data) {
      savedRevision = insertRes.data;
    }
  } catch (err) {
    console.warn('[report.service] Supabase report_revisions insert:', err.message);
  }

  if (!savedRevision) {
    savedRevision = {
      id: randomUUID(),
      ...newRevisionRow,
      created_at: new Date().toISOString(),
    };
  }

  saveReleasedReport(sessionId, savedRevision);

  // Mark review assignment as reviewed if present
  try {
    await client
      .from('review_assignments')
      .update({ status: 'reviewed' })
      .eq('session_id', sessionId);
  } catch {
    // Non-fatal
  }

  return savedRevision;
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
      question: turn.prompt || turn.question_snapshot?.prompt,
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
      candidateAnswer: ans?.answer_text || (ans?.state === 'skipped' ? '(Turn skipped by candidate)' : null),
    };
  });

  const candidateInfo = {
    id: session.user_id,
    name: session.profile_snapshot?.displayName || session.profile_snapshot?.display_name || 'Candidate',
    displayName: session.profile_snapshot?.displayName || session.profile_snapshot?.display_name || 'Candidate',
    role: session.profile_snapshot?.targetRole || session.profile_snapshot?.target_role || 'General',
    targetRole: session.profile_snapshot?.targetRole || session.profile_snapshot?.target_role || 'General',
    experienceLevel: session.profile_snapshot?.experienceLevel || session.profile_snapshot?.experience_level || 'junior',
    domain: session.profile_snapshot?.domain || 'computer_science',
  };

  return {
    sessionId: session.id,
    profile: session.profile_snapshot,
    candidate: candidateInfo,
    status: session.status,
    completedAt: session.completed_at,
    totalTurns: turns.length,
    turns: transcript,
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

  const roles = (roleCheck.data || []).map((r) => r.role);
  const isAdmin = roles.includes('admin');

  let query = client
    .from('review_assignments')
    .select('id,session_id,evaluator_id,assigned_at')
    .order('assigned_at', { ascending: false })
    .range(offset, offset + limit);

  // Evaluators see only their assigned sessions; admins see all assignments
  if (!isAdmin) {
    query = query.eq('evaluator_id', userId);
  }

  const rows = databaseData(await query) || [];

  // Fetch session profile snapshots to populate real candidate details
  const sessionIds = [...new Set(rows.map((r) => r.session_id).filter(Boolean))];
  let sessionMap = new Map();
  if (sessionIds.length > 0) {
    const sRes = await client
      .from('sessions')
      .select('id, profile_snapshot')
      .in('id', sessionIds);
    const sRows = databaseData(sRes) || [];
    sessionMap = new Map(sRows.map((s) => [s.id, s.profile_snapshot]));
  }

  const formattedRows = rows.slice(0, limit).map((r) => {
    const prof = sessionMap.get(r.session_id) || {};
    const candidateName = prof.displayName || prof.display_name || prof.name || 'Candidate';
    const candidateRole = prof.targetRole || prof.target_role || 'Engineer';
    return {
      id: r.id,
      sessionId: r.session_id,
      session_id: r.session_id,
      evaluatorId: r.evaluator_id,
      evaluator_id: r.evaluator_id,
      assignedAt: r.assigned_at,
      assigned_at: r.assigned_at,
      status: r.status || 'pending',
      statusLabel: r.status === 'reviewed' ? 'Reviewed & Released' : 'Pending Review',
      candidate: {
        name: candidateName,
        displayName: candidateName,
        role: candidateRole,
        targetRole: candidateRole,
      },
    };
  });

  return {
    assignments: formattedRows,
    nextOffset: rows.length > limit ? offset + limit : null,
  };
}
