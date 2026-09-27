import { databaseData, SessionError } from '../sessions/session.service.js';

/**
 * Computes deterministic metadata indicators for custom question assessment.
 * PRD: For bank-only mode, metadata indicators can be computed deterministically.
 *
 * @param {string} prompt
 * @param {string} level
 * @param {Array<string>} topics
 * @returns {Object}
 */
export function computeMetadataIndicators(prompt, level, topics) {
  const trimmed = prompt.trim();
  const charLength = trimmed.length;
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const hasQuestionMark = trimmed.endsWith('?') || trimmed.includes('?');
  const isLengthSufficient = charLength >= 50;
  const isBoundedLength = charLength <= 600;

  // Topic keyword heuristics
  const topicKeywords = {
    apis: ['api', 'endpoint', 'rest', 'http', 'request', 'post', 'status', 'header'],
    databases: ['database', 'index', 'table', 'sql', 'query', 'postgres', 'transaction', 'shard'],
    concurrency: ['concurrency', 'race', 'lock', 'thread', 'atomic', 'worker', 'deadlock', 'mutex'],
    reliability: ['reliability', 'timeout', 'retry', 'circuit', 'breaker', 'health', 'cache', 'log', 'fail'],
    project_tradeoffs: ['tradeoff', 'trade-off', 'deadline', 'priority', 'scale', 'migration', 'debt', 'decision'],
  };

  const lower = trimmed.toLowerCase();
  const matchedKeywords = [];
  for (const topic of topics) {
    const keywords = topicKeywords[topic] || [];
    for (const kw of keywords) {
      if (lower.includes(kw)) matchedKeywords.push(kw);
    }
  }

  const topicMatchConfidence = Math.min(1.0, (matchedKeywords.length * 0.3) + 0.4);

  // Level suitability heuristic
  const isIntermediateComplexity = lower.includes('distributed') || lower.includes('cluster') ||
    lower.includes('sharding') || lower.includes('idempotency') || lower.includes('architecture');
  const levelFit = level === 'intermediate' ? (isIntermediateComplexity ? 0.9 : 0.7) : (isIntermediateComplexity ? 0.5 : 0.85);

  const clarityScore = (hasQuestionMark ? 0.4 : 0.1) + (isLengthSufficient && isBoundedLength ? 0.6 : 0.3);

  return {
    charCount: charLength,
    wordCount,
    hasQuestionMark,
    isLengthSufficient,
    isBoundedLength,
    matchedKeywords,
    topicMatchConfidence: Math.round(topicMatchConfidence * 100) / 100,
    clarityScore: Math.round(clarityScore * 100) / 100,
    levelFit: Math.round(levelFit * 100) / 100,
    readinessStatus: hasQuestionMark && isLengthSufficient && isBoundedLength ? 'ready_for_review' : 'needs_revision',
  };
}

/**
 * Creates a deterministic draft rewrite suggestion for the proposed question.
 *
 * @param {string} prompt
 * @returns {string}
 */
export function generateDraftRewrite(prompt) {
  let rewrite = prompt.trim();
  if (!rewrite.endsWith('?') && !rewrite.endsWith('.')) {
    rewrite += '?';
  }
  return rewrite;
}

/**
 * Creates and persists a question assessment record.
 * Stays in 'draft' status until reviewed by an administrator.
 *
 * @param {Object} client
 * @param {string} userId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createQuestionAssessment(client, userId, data) {
  const metadata = computeMetadataIndicators(data.proposedQuestion, data.experienceLevel, data.requiredTopicTags);
  const rewrite = generateDraftRewrite(data.proposedQuestion);

  const row = {
    expert_owner: userId,
    target_role: data.targetRole || 'backend_developer',
    experience_level: data.experienceLevel,
    required_topic_tags: data.requiredTopicTags,
    proposed_question: data.proposedQuestion.trim(),
    assessment_status: 'draft', // Always draft initially; never automatically published
    metadata_indicators: metadata,
    draft_rewrite: rewrite,
    rubric_version: 1,
    source: 'expert',
  };

  const res = await client.from('question_assessments').insert(row).select().single();
  return databaseData(res);
}

/**
 * Retrieves a question assessment by ID.
 *
 * @param {Object} client
 * @param {string} userId
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getQuestionAssessment(client, userId, id) {
  const res = await client
    .from('question_assessments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  const assessment = databaseData(res);
  if (!assessment) {
    throw new SessionError(404, 'ASSESSMENT_NOT_FOUND', 'Question assessment not found');
  }

  // Only expert owner or admin may view
  if (assessment.expert_owner !== userId) {
    const adminCheck = await client
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!adminCheck?.data) {
      throw new SessionError(403, 'FORBIDDEN', 'Access to this question assessment is restricted');
    }
  }

  return assessment;
}
