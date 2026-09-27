/**
 * Deterministic Candidate Scoring Pipeline (Task 7 / D4-07)
 * Implements candidate rubric weights, renormalization, evidence validation,
 * and session score aggregation according to docs/prd.md.
 */

export const CRITERIA_WEIGHTS = {
  correctness: 0.40,
  reasoning: 0.25,
  relevance: 0.20,
  tradeoffs: 0.15,
};

export const VALID_CRITERIA = Object.keys(CRITERIA_WEIGHTS);
export const VALID_RATINGS = [0, 1, 2, 3, 4];
export const UNSCORED_STAGES = ['icebreaker', 'reflection'];

/**
 * Calculates score for a single answer across applicable criteria.
 * Formula: 100 * sum(weight * rating / 4) / sum(applicable weights)
 *
 * @param {Array<{ criterionId: string, rating: number|null, applicable?: boolean }>} criteriaResults
 * @returns {{ score: number|null, isPending: boolean, applicableWeights: number }}
 */
export function calculateAnswerScore(criteriaResults) {
  if (!Array.isArray(criteriaResults) || criteriaResults.length === 0) {
    return { score: null, isPending: true, applicableWeights: 0 };
  }

  let weightedSum = 0;
  let totalApplicableWeight = 0;
  let hasPending = false;

  for (const item of criteriaResults) {
    const criterionId = item.criterionId || item.criterion_id;
    const { rating, applicable = true } = item;
    const weight = CRITERIA_WEIGHTS[criterionId];
    if (weight === undefined) continue;

    if (!applicable) {
      // Renormalize: exclude from both numerator and denominator
      continue;
    }

    totalApplicableWeight += weight;

    if (rating === null || rating === undefined) {
      hasPending = true;
    } else {
      if (!VALID_RATINGS.includes(rating)) {
        throw new Error(`Invalid rating: ${rating}. Must be 0, 1, 2, 3, or 4.`);
      }
      weightedSum += weight * (rating / 4);
    }
  }

  const roundedWeights = Math.round(totalApplicableWeight * 100) / 100;

  if (totalApplicableWeight === 0) {
    return { score: null, isPending: false, applicableWeights: 0 };
  }

  if (hasPending) {
    return { score: null, isPending: true, applicableWeights: roundedWeights };
  }

  const rawScore = (100 * weightedSum) / totalApplicableWeight;
  const score = Math.round(rawScore * 100) / 100; // 2 decimal precision

  return { score, isPending: false, applicableWeights: roundedWeights };
}

/**
 * Validates answer-linked evidence character offsets and exact quotation.
 * PRD: Server MUST validate:
 * 1. offsets are integers
 * 2. start >= 0
 * 3. end >= start
 * 4. end <= answer text length
 * 5. excerpt exactly matches answer.slice(start, end)
 *
 * @param {{ start: number, end: number, excerpt: string }} evidence
 * @param {string} answerText
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateEvidence(evidence, answerText) {
  if (!evidence) {
    return { valid: false, error: 'Evidence object is required' };
  }

  const { start, end, excerpt } = evidence;

  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    return { valid: false, error: 'Evidence start and end offsets must be integers' };
  }

  if (start < 0) {
    return { valid: false, error: 'Evidence start offset cannot be negative' };
  }

  if (end < start) {
    return { valid: false, error: 'Evidence end offset cannot be less than start offset' };
  }

  const text = typeof answerText === 'string' ? answerText : '';
  if (end > text.length) {
    return { valid: false, error: `Evidence end offset (${end}) exceeds answer length (${text.length})` };
  }

  const expectedSlice = text.slice(start, end);
  if (excerpt !== expectedSlice) {
    return {
      valid: false,
      error: `Evidence excerpt does not match answer text at offsets [${start}, ${end}]. Expected "${expectedSlice}", got "${excerpt}"`,
    };
  }

  return { valid: true };
}

/**
 * Calculates overall session score from completed scored answers.
 * Formula: Mean of completed scored answers' scores.
 * Icebreakers and reflections are excluded.
 * Pending answers result in a provisional score with evaluated/required counts.
 *
 * @param {Array<{ stage: string, score: number|null, isPending: boolean }>} answerScores
 * @returns {{ sessionScore: number|null, isProvisional: boolean, evaluatedCount: number, requiredCount: number }}
 */
export function calculateSessionScore(answerScores) {
  const scoredAnswers = answerScores.filter((a) => !UNSCORED_STAGES.includes(a.stage));
  const requiredCount = scoredAnswers.length;

  const evaluated = scoredAnswers.filter((a) => !a.isPending && typeof a.score === 'number');
  const evaluatedCount = evaluated.length;

  if (requiredCount === 0) {
    return { sessionScore: null, isProvisional: false, evaluatedCount: 0, requiredCount: 0 };
  }

  const isProvisional = evaluatedCount < requiredCount;

  if (evaluatedCount === 0) {
    return { sessionScore: null, isProvisional: true, evaluatedCount: 0, requiredCount };
  }

  const sumScores = evaluated.reduce((acc, a) => acc + a.score, 0);
  const rawMean = sumScores / evaluatedCount;
  const sessionScore = Math.round(rawMean * 100) / 100;

  return {
    sessionScore,
    isProvisional,
    evaluatedCount,
    requiredCount,
  };
}

/**
 * Creates default 0 ratings for an explicitly skipped turn.
 * PRD: For a deliberately skipped scored turn, applicable criteria receive 0 with the reason
 * "No response submitted".
 *
 * @returns {Array<{ criterionId: string, rating: number, applicable: boolean, rationale: string }>}
 */
export function createSkippedTurnEvaluations() {
  return VALID_CRITERIA.map((criterionId) => ({
    criterionId,
    rating: 0,
    applicable: true,
    rationale: 'No response submitted',
  }));
}
