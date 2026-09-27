import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { databaseData, SessionError } from '../sessions/session.service.js';
import { calculateAnswerScore } from '../evaluations/scoring.service.js';
import { evaluateAnswerWithAI } from '../ai/ai-evaluation.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const retryVariantsPath = path.resolve(__dirname, '../../../supabase/seeds/retry-variants.json');

/**
 * Loads approved retry variants seed.
 * @returns {Array<{ topic: string, primaryQuestionId: string, variantQuestionId: string, skillTested: string }>}
 */
export function getRetryVariants() {
  try {
    const raw = fs.readFileSync(retryVariantsPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to load retry variants seed: ${err.message}`);
  }
}

/**
 * Creates or retrieves a child retry attempt for an eligible answer.
 * Enforces:
 * - One retry per eligible answer
 * - Idempotency on repeated requests
 * - Arbitrary question/variant IDs are strictly rejected
 *
 * @param {Object} client
 * @param {string} userId
 * @param {string} sessionId
 * @param {string} sourceAnswerId
 * @returns {Promise<Object>}
 */
export async function createRetryAttempt(client, userId, sessionId, sourceAnswerId) {
  // 1. Verify session ownership
  const sessionRes = await client
    .from('sessions')
    .select('id,user_id,status,version')
    .eq('id', sessionId)
    .maybeSingle();

  const session = databaseData(sessionRes);
  if (!session || session.user_id !== userId) {
    throw new SessionError(404, 'SESSION_NOT_FOUND', 'Session not found');
  }

  // 2. Fetch source answer
  const answerRes = await client
    .from('answers')
    .select('id,session_id,turn_id,answer_text,state')
    .eq('id', sourceAnswerId)
    .eq('session_id', sessionId)
    .maybeSingle();

  const sourceAnswer = databaseData(answerRes);
  if (!sourceAnswer) {
    throw new SessionError(404, 'ANSWER_NOT_FOUND', 'Source answer not found');
  }

  // 3. Check if a retry already exists for this answer (Idempotency + One-retry rule)
  const existingRetryRes = await client
    .from('answer_retries')
    .select('*')
    .eq('source_answer_id', sourceAnswerId)
    .maybeSingle();

  const existingRetry = databaseData(existingRetryRes);
  if (existingRetry) {
    // Return existing retry record without creating a duplicate
    return formatSafeRetryDto(existingRetry);
  }

  // 4. Fetch the turn and stable question ID
  const turnRes = await client
    .from('session_turns')
    .select('id,position,stage,prompt,question_snapshot')
    .eq('id', sourceAnswer.turn_id)
    .maybeSingle();

  const turn = databaseData(turnRes);
  if (!turn) {
    throw new SessionError(404, 'TURN_NOT_FOUND', 'Source turn not found');
  }

  const primaryQuestionId = turn.question_snapshot?.id || turn.question_snapshot?.questionId;
  const variants = getRetryVariants();
  const matchedVariant = variants.find((v) => v.primaryQuestionId === primaryQuestionId);

  if (!matchedVariant) {
    throw new SessionError(400, 'RETRY_NOT_AVAILABLE', 'No approved retry variant exists for this question');
  }

  // 5. Fetch variant question details
  const variantQuestionRes = await client
    .from('question_versions')
    .select('id,question_id,version,prompt,stage,panel_role,rubric_notes')
    .eq('question_id', matchedVariant.variantQuestionId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const variantQuestion = databaseData(variantQuestionRes);
  if (!variantQuestion) {
    throw new SessionError(500, 'VARIANT_QUESTION_MISSING', 'Approved variant question content not found in bank');
  }

  // 6. Calculate original score for comparison
  const originalEvalsRes = await client
    .from('evaluations')
    .select('*')
    .eq('answer_id', sourceAnswerId);

  const originalEvals = databaseData(originalEvalsRes) || [];
  const originalScoreCalc = calculateAnswerScore(originalEvals);
  const originalScore = !originalScoreCalc.isPending && originalScoreCalc.score !== null ? originalScoreCalc.score : null;

  const originalRubricVersion = turn.question_snapshot?.rubric_version || 1;
  const retryRubricVersion = variantQuestion.rubric_notes?.version || 1;
  const numericComparisonAllowed = originalRubricVersion === retryRubricVersion;

  // 7. Insert retry record
  const insertData = {
    session_id: sessionId,
    source_answer_id: sourceAnswerId,
    topic: matchedVariant.topic,
    variant_id: matchedVariant.variantQuestionId,
    variant_question_id: matchedVariant.variantQuestionId,
    variant_question_version: variantQuestion.version,
    original_rubric_version: originalRubricVersion,
    retry_rubric_version: retryRubricVersion,
    original_score: originalScore,
    numeric_comparison_allowed: numericComparisonAllowed,
    status: 'created',
  };

  const insertRes = await client
    .from('answer_retries')
    .insert(insertData)
    .select()
    .single();

  const createdRetry = databaseData(insertRes);
  return formatSafeRetryDto({
    ...createdRetry,
    variantPrompt: variantQuestion.prompt,
    skillTested: matchedVariant.skillTested,
  });
}

/**
 * Submits an answer to a retry attempt and executes evaluation.
 *
 * @param {Object} client
 * @param {string} userId
 * @param {string} retryId
 * @param {{ answerText: string, idempotencyKey: string }} body
 * @param {AIFallbackEngine} [engine]
 * @returns {Promise<Object>}
 */
export async function submitRetryAnswer(client, userId, retryId, body, engine = null) {
  // 1. Fetch retry record
  const retryRes = await client
    .from('answer_retries')
    .select('*')
    .eq('id', retryId)
    .maybeSingle();

  const retry = databaseData(retryRes);
  if (!retry) {
    throw new SessionError(404, 'RETRY_NOT_FOUND', 'Retry attempt not found');
  }

  // 2. Verify ownership
  const sessionRes = await client
    .from('sessions')
    .select('id,user_id')
    .eq('id', retry.session_id)
    .maybeSingle();

  const session = databaseData(sessionRes);
  if (!session || session.user_id !== userId) {
    throw new SessionError(404, 'SESSION_NOT_FOUND', 'Session not found');
  }

  if (retry.status === 'evaluated') {
    return formatSafeRetryDto(retry);
  }

  // 3. Fetch variant question content
  const variantQRes = await client
    .from('question_versions')
    .select('id,prompt,rubric_notes')
    .eq('question_id', retry.variant_question_id)
    .eq('version', retry.variant_question_version)
    .maybeSingle();

  const variantQ = databaseData(variantQRes);

  // 4. Run Evaluation on retry answer
  const evalContext = {
    sessionId: retry.session_id,
    turnId: retry.retry_turn_id || retry.source_answer_id,
    answerId: retry.id,
    answerText: body.answerText,
    questionPrompt: variantQ?.prompt || '',
    expectedConcepts: [],
    rubricAnchors: {},
    rubricVersion: retry.retry_rubric_version,
  };

  const evalResult = await evaluateAnswerWithAI(client, evalContext, engine);

  let retryScore = null;
  let scoreDelta = null;

  if (evalResult.success && evalResult.evaluations.length > 0) {
    const calc = calculateAnswerScore(evalResult.evaluations);
    if (!calc.isPending && calc.score !== null) {
      retryScore = calc.score;
      if (retry.numeric_comparison_allowed && retry.original_score !== null) {
        scoreDelta = Number((retryScore - retry.original_score).toFixed(2));
      }
    }
  }

  // 5. Update retry record
  const updateRes = await client
    .from('answer_retries')
    .update({
      status: 'evaluated',
      retry_score: retryScore,
      score_delta: scoreDelta,
      provider: evalResult.provider,
      model: evalResult.model,
      updated_at: new Date().toISOString(),
    })
    .eq('id', retryId)
    .select()
    .single();

  const updated = databaseData(updateRes);
  return formatSafeRetryDto({
    ...updated,
    evaluations: evalResult.evaluations,
  });
}

/**
 * Retrieves retry attempt details.
 *
 * @param {Object} client
 * @param {string} userId
 * @param {string} retryId
 * @returns {Promise<Object>}
 */
export async function getRetryAttempt(client, userId, retryId) {
  const retryRes = await client
    .from('answer_retries')
    .select('*')
    .eq('id', retryId)
    .maybeSingle();

  const retry = databaseData(retryRes);
  if (!retry) {
    throw new SessionError(404, 'RETRY_NOT_FOUND', 'Retry attempt not found');
  }

  const sessionRes = await client
    .from('sessions')
    .select('id,user_id')
    .eq('id', retry.session_id)
    .maybeSingle();

  const session = databaseData(sessionRes);
  if (!session || session.user_id !== userId) {
    throw new SessionError(404, 'SESSION_NOT_FOUND', 'Session not found');
  }

  return formatSafeRetryDto(retry);
}

/**
 * Formats clean, safe retry DTO for candidate output.
 * @private
 */
function formatSafeRetryDto(retry) {
  const dto = {
    id: retry.id,
    sessionId: retry.session_id,
    sourceAnswerId: retry.source_answer_id,
    topic: retry.topic,
    variantId: retry.variant_id,
    status: retry.status,
    originalScore: retry.original_score !== null ? Number(retry.original_score) : null,
    retryScore: retry.retry_score !== null ? Number(retry.retry_score) : null,
    numericComparisonAllowed: retry.numeric_comparison_allowed,
    scoreDelta: retry.score_delta !== null ? Number(retry.score_delta) : null,
    createdAt: retry.created_at,
  };

  if (retry.variantPrompt) {
    dto.variantPrompt = retry.variantPrompt;
  }
  if (retry.skillTested) {
    dto.skillTested = retry.skillTested;
  }
  if (!retry.numeric_comparison_allowed) {
    dto.comparisonNote = 'Rubric versions differ between attempts; numeric score improvement is not claimed.';
  }

  return dto;
}
