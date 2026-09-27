import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import {
  calculateAnswerScore,
  calculateSessionScore,
  validateEvidence,
  createSkippedTurnEvaluations,
} from '../src/modules/evaluations/scoring.service.js';
import {
  addReviewOverride,
  saveEvaluationWithValidation,
} from '../src/modules/evaluations/evaluation.service.js';
import {
  releaseReport,
  getSessionReport,
} from '../src/modules/reports/report.service.js';
import {
  computeMetadataIndicators,
  generateDraftRewrite,
} from '../src/modules/questions/question-assessment.service.js';

// ============================================================================
// TASK 7 TESTS (9 to 30)
// ============================================================================

test('9. all-criteria score calculation: Correctness=4, Reasoning=2, Relevance=3, Tradeoffs=1', () => {
  const criteria = [
    { criterionId: 'correctness', rating: 4, applicable: true },
    { criterionId: 'reasoning', rating: 2, applicable: true },
    { criterionId: 'relevance', rating: 3, applicable: true },
    { criterionId: 'tradeoffs', rating: 1, applicable: true },
  ];

  const result = calculateAnswerScore(criteria);
  assert.equal(result.isPending, false);
  // Calculation: 100 * (0.40 * 1 + 0.25 * 0.5 + 0.20 * 0.75 + 0.15 * 0.25) / 1.0 = 71.25
  assert.equal(result.score, 71.25);
  assert.equal(result.applicableWeights, 1.0);
});

test('10. N/A criterion weight renormalization', () => {
  // If tradeoffs is marked not applicable:
  // Applicable weights = 0.40 + 0.25 + 0.20 = 0.85
  // Numerator = 0.40 * 1 + 0.25 * 0.5 + 0.20 * 0.75 = 0.40 + 0.125 + 0.15 = 0.675
  // score = 100 * 0.675 / 0.85 = 79.41176... -> 79.41
  const criteria = [
    { criterionId: 'correctness', rating: 4, applicable: true },
    { criterionId: 'reasoning', rating: 2, applicable: true },
    { criterionId: 'relevance', rating: 3, applicable: true },
    { criterionId: 'tradeoffs', rating: 1, applicable: false },
  ];

  const result = calculateAnswerScore(criteria);
  assert.equal(result.isPending, false);
  assert.equal(result.score, 79.41);
  assert.equal(result.applicableWeights, 0.85);
});

test('11. 0 rating produces score 0', () => {
  const criteria = [
    { criterionId: 'correctness', rating: 0, applicable: true },
    { criterionId: 'reasoning', rating: 0, applicable: true },
    { criterionId: 'relevance', rating: 0, applicable: true },
    { criterionId: 'tradeoffs', rating: 0, applicable: true },
  ];

  const result = calculateAnswerScore(criteria);
  assert.equal(result.score, 0);
  assert.equal(result.isPending, false);
});

test('12. 4 rating produces score 100, 2 rating produces score 50', () => {
  const criteriaAll4 = [
    { criterionId: 'correctness', rating: 4, applicable: true },
    { criterionId: 'reasoning', rating: 4, applicable: true },
    { criterionId: 'relevance', rating: 4, applicable: true },
    { criterionId: 'tradeoffs', rating: 4, applicable: true },
  ];
  assert.equal(calculateAnswerScore(criteriaAll4).score, 100);

  const criteriaAll2 = [
    { criterionId: 'correctness', rating: 2, applicable: true },
    { criterionId: 'reasoning', rating: 2, applicable: true },
    { criterionId: 'relevance', rating: 2, applicable: true },
    { criterionId: 'tradeoffs', rating: 2, applicable: true },
  ];
  assert.equal(calculateAnswerScore(criteriaAll2).score, 50);
});

test('13. pending criteria are not treated as zero', () => {
  const criteriaWithPending = [
    { criterionId: 'correctness', rating: 4, applicable: true },
    { criterionId: 'reasoning', rating: null, applicable: true }, // Pending
    { criterionId: 'relevance', rating: 3, applicable: true },
    { criterionId: 'tradeoffs', rating: 2, applicable: true },
  ];

  const result = calculateAnswerScore(criteriaWithPending);
  assert.equal(result.score, null);
  assert.equal(result.isPending, true);
});

test('14. provisional session score when evaluations are pending', () => {
  const answers = [
    { stage: 'technical', score: 80, isPending: false },
    { stage: 'technical', score: null, isPending: true }, // One pending
    { stage: 'techno_managerial', score: 60, isPending: false },
  ];

  const sessionScore = calculateSessionScore(answers);
  assert.equal(sessionScore.isProvisional, true);
  assert.equal(sessionScore.evaluatedCount, 2);
  assert.equal(sessionScore.requiredCount, 3);
  assert.equal(sessionScore.sessionScore, 70); // Mean of 80 and 60
});

test('15. final score only after required evaluation is complete', () => {
  const completedAnswers = [
    { stage: 'technical', score: 80, isPending: false },
    { stage: 'technical', score: 90, isPending: false },
    { stage: 'techno_managerial', score: 70, isPending: false },
  ];

  const sessionScore = calculateSessionScore(completedAnswers);
  assert.equal(sessionScore.isProvisional, false);
  assert.equal(sessionScore.evaluatedCount, 3);
  assert.equal(sessionScore.requiredCount, 3);
  assert.equal(sessionScore.sessionScore, 80);
});

test('16. skipped scored turn becomes zero with exact reason', () => {
  const skippedEvaluations = createSkippedTurnEvaluations();
  assert.equal(skippedEvaluations.length, 4);

  for (const item of skippedEvaluations) {
    assert.equal(item.rating, 0);
    assert.equal(item.applicable, true);
    assert.equal(item.rationale, 'No response submitted');
  }

  const scoreResult = calculateAnswerScore(skippedEvaluations);
  assert.equal(scoreResult.score, 0);
  assert.equal(scoreResult.isPending, false);
});

test('17. icebreaker and reflection stages are excluded from session score', () => {
  const turns = [
    { stage: 'icebreaker', score: 100, isPending: false }, // Ignored
    { stage: 'technical', score: 80, isPending: false },
    { stage: 'technical', score: 90, isPending: false },
    { stage: 'reflection', score: 0, isPending: false }, // Ignored
  ];

  const sessionScore = calculateSessionScore(turns);
  assert.equal(sessionScore.requiredCount, 2);
  assert.equal(sessionScore.evaluatedCount, 2);
  assert.equal(sessionScore.sessionScore, 85); // (80 + 90) / 2
});

test('18. invalid evidence offsets rejected', () => {
  const answer = 'We should use an atomic update in PostgreSQL to prevent overselling.';

  // Non-integer offsets
  assert.equal(validateEvidence({ start: 0.5, end: 10, excerpt: 'We' }, answer).valid, false);
  // Negative offset
  assert.equal(validateEvidence({ start: -1, end: 10, excerpt: 'We' }, answer).valid, false);
  // End < start
  assert.equal(validateEvidence({ start: 10, end: 5, excerpt: 'atomic' }, answer).valid, false);
  // End exceeds answer length
  assert.equal(validateEvidence({ start: 0, end: 9999, excerpt: 'overflow' }, answer).valid, false);
});

test('19. mismatched evidence excerpt rejected', () => {
  const answer = 'We should use an atomic update in PostgreSQL to prevent overselling.';
  const start = 17;
  const end = 30; // 'atomic update'

  // Deliberately incorrect excerpt
  const mismatch = validateEvidence({ start, end, excerpt: 'wrong quote' }, answer);
  assert.equal(mismatch.valid, false);
  assert.ok(mismatch.error.includes('does not match answer text'));
});

test('20. valid evidence accepted', () => {
  const answer = 'We should use an atomic update in PostgreSQL to prevent overselling.';
  const start = 17;
  const end = 30;
  const excerpt = answer.slice(start, end); // 'atomic update'

  const valid = validateEvidence({ start, end, excerpt }, answer);
  assert.equal(valid.valid, true);
  assert.equal(valid.error, undefined);
});

test('20b. saveEvaluationWithValidation accepts valid evidence and upserts', async () => {
  let upserted = null;
  const mockClient = {
    from: () => ({
      upsert: (data) => {
        upserted = data;
        return {
          select: () => ({
            single: async () => ({ data: { id: 'eval-1', ...data }, error: null }),
          }),
        };
      },
    }),
  };
  const res = await saveEvaluationWithValidation(
    mockClient,
    { answerId: 'a1', criterionId: 'correctness', rating: 3, evidence: { start: 0, end: 5, excerpt: 'Hello' } },
    'Hello world',
  );
  assert.equal(res.rating, 3);
  assert.equal(upserted.evidence_excerpt, 'Hello');
});

test('21. override preserves original evaluation and records review_overrides history', async () => {
  const evalId = randomUUID();
  const sessionId = randomUUID();
  const evaluatorId = randomUUID();

  let storedEvaluation = {
    id: evalId,
    session_id: sessionId,
    turn_id: randomUUID(),
    answer_id: randomUUID(),
    criterion_id: 'correctness',
    rating: 2,
    evidence_source: 'ai',
    report_revision: 1,
  };

  const storedOverrides = [];

  const mockClient = {
    from: (table) => {
      const builder = {
        select: () => builder,
        eq: (_col, _val) => builder,
        in: () => builder,
        order: () => builder,
        limit: () => builder,
        maybeSingle: async () => {
          if (table === 'evaluations') return { data: storedEvaluation };
          if (table === 'user_roles') return { data: { role: 'evaluator' } };
          if (table === 'review_assignments') return { data: { id: 'assign-1' } };
          return { data: null };
        },
        single: async () => {
          if (table === 'review_overrides') return { data: storedOverrides[0] };
          if (table === 'evaluations') return { data: storedEvaluation };
          return { data: null };
        },
        insert: (record) => {
          storedOverrides.push({ id: randomUUID(), ...record });
          return builder;
        },
        update: (patch) => {
          storedEvaluation = { ...storedEvaluation, ...patch };
          return builder;
        },
        then: (resolve) => resolve({ data: [] }),
      };
      return builder;
    },
  };

  const result = await addReviewOverride(mockClient, evaluatorId, evalId, {
    newRating: 4,
    reason: 'Candidate provided a novel caching approach that addresses the concurrency constraint.',
  });

  // 1. Original evaluation was rating 2, now updated to 4
  assert.equal(result.evaluation.rating, 4);
  assert.equal(result.evaluation.evidence_source, 'human');

  // 2. Override record preserves old_rating = 2
  assert.equal(result.override.old_rating, 2);
  assert.equal(result.override.new_rating, 4);
  assert.ok(result.override.reason.length >= 5);
  assert.equal(storedOverrides.length, 1);
});

test('22. override requires reason', async () => {
  const mockClient = { from: () => ({}) };
  await assert.rejects(
    addReviewOverride(mockClient, 'user-1', randomUUID(), { newRating: 4, reason: ' ' }),
  );
});

test('23. unauthorized non-evaluator user rejected for override', async () => {
  const evalId = randomUUID();
  const mockClient = {
    from: (table) => {
      const b = {
        select: () => b,
        eq: () => b,
        maybeSingle: async () => {
          if (table === 'evaluations') return { data: { id: evalId, session_id: randomUUID(), rating: 2 } };
          if (table === 'user_roles') return { data: null }; // No evaluator or admin
          return { data: null };
        },
      };
      return b;
    },
  };

  await assert.rejects(
    addReviewOverride(mockClient, 'candidate-user', evalId, { newRating: 3, reason: 'Valid reason string' }),
    { code: 'EVALUATOR_REQUIRED' },
  );
});

test('24. unassigned evaluator rejected for override', async () => {
  const evalId = randomUUID();
  let checkedAssignment = false;
  const mockClient = {
    from: (table) => {
      const b = {
        select: () => b,
        eq: () => b,
        maybeSingle: async () => {
          if (table === 'evaluations') return { data: { id: evalId, session_id: randomUUID(), rating: 2 } };
          if (table === 'user_roles') return { data: { role: 'evaluator' } };
          if (table === 'review_assignments') {
            checkedAssignment = true;
            return { data: null }; // Unassigned!
          }
          return { data: null };
        },
      };
      return b;
    },
  };

  await assert.rejects(
    addReviewOverride(mockClient, 'unassigned-evaluator', evalId, { newRating: 3, reason: 'Valid reason string' }),
    { code: 'ASSIGNMENT_REQUIRED' },
  );
  assert.equal(checkedAssignment, true);
});

test('25. report release blocked while scoring is pending', async () => {
  const sessionId = randomUUID();
  const turnId = randomUUID();
  const answerId = randomUUID();

  const mockClient = {
    from: (table) => {
      const b = {
        select: () => b,
        eq: () => b,
        order: () => b,
        limit: () => b,
        maybeSingle: async () => {
          if (table === 'user_roles') return { data: { role: 'admin' } };
          if (table === 'sessions') return { data: { id: sessionId, status: 'completed' } };
          return { data: null };
        },
        then: (resolve) => {
          if (table === 'session_turns') resolve({ data: [{ id: turnId, stage: 'technical', position: 1 }] });
          else if (table === 'answers') resolve({ data: [{ id: answerId, turn_id: turnId }] });
          else if (table === 'evaluations') resolve({ data: [{ answer_id: answerId, criterion_id: 'correctness', rating: null }] }); // Pending!
          else resolve({ data: [] });
        },
      };
      return b;
    },
  };

  await assert.rejects(
    releaseReport(mockClient, 'admin-id', sessionId),
    { code: 'SCORING_PENDING' },
  );
});

test('26. released report is preserved and includes release metadata', async () => {
  const sessionId = randomUUID();
  const turnId = randomUUID();
  const answerId = randomUUID();
  let savedRevision = null;

  const mockClient = {
    from: (table) => {
      const b = {
        select: () => b,
        eq: () => b,
        order: () => b,
        limit: () => b,
        maybeSingle: async () => {
          if (table === 'user_roles') return { data: { role: 'admin' } };
          if (table === 'sessions') return { data: { id: sessionId, status: 'completed' } };
          return { data: null };
        },
        single: async () => ({ data: savedRevision }),
        insert: (row) => {
          savedRevision = { id: randomUUID(), ...row };
          return b;
        },
        then: (resolve) => {
          if (table === 'session_turns') resolve({ data: [{ id: turnId, stage: 'technical', position: 1 }] });
          else if (table === 'answers') resolve({ data: [{ id: answerId, turn_id: turnId }] });
          else if (table === 'evaluations') {
            resolve({
              data: [
                { answer_id: answerId, criterion_id: 'correctness', rating: 4, applicable: true },
                { answer_id: answerId, criterion_id: 'reasoning', rating: 4, applicable: true },
                { answer_id: answerId, criterion_id: 'relevance', rating: 4, applicable: true },
                { answer_id: answerId, criterion_id: 'tradeoffs', rating: 4, applicable: true },
              ],
            });
          } else resolve({ data: [{ revision: 1 }] });
        },
      };
      return b;
    },
  };

  const released = await releaseReport(mockClient, 'admin-user', sessionId, { summary: 'Candidate approved.' });
  assert.equal(released.status, 'released');
  assert.equal(released.is_provisional, false);
  assert.equal(released.overall_score, 100);
  assert.equal(released.released_by, 'admin-user');
  assert.ok(released.released_at);
});

test('27. candidate cannot see unreleased reviewer data', async () => {
  const sessionId = randomUUID();
  const candidateId = randomUUID();

  const mockClient = {
    from: (table) => {
      const b = {
        select: () => b,
        eq: () => b,
        order: () => b,
        maybeSingle: async () => {
          if (table === 'sessions') return { data: { id: sessionId, user_id: candidateId, status: 'completed' } };
          if (table === 'user_roles') return { data: null };
          return { data: null };
        },
        then: (resolve) => resolve({ data: [] }),
      };
      return b;
    },
  };

  await assert.rejects(
    getSessionReport(mockClient, candidateId, sessionId),
    { code: 'REPORT_NOT_RELEASED' },
  );
});

test('28. report refresh does not create a new evaluation', async () => {
  let evaluationCreationCalls = 0;
  const mockClient = {
    from: (table) => {
      if (table === 'evaluations' || table === 'evaluations_insert') evaluationCreationCalls++;
      return {
        select: () => ({
          eq: () => ({
            order: () => ({
              data: [
                {
                  revision: 1,
                  status: 'released',
                  overall_score: 85,
                  released_at: new Date().toISOString(),
                },
              ],
              error: null,
            }),
            maybeSingle: async () => ({
              data: { id: 'session-1', user_id: 'user-1', status: 'completed' },
              error: null,
            }),
            data: [],
          }),
        }),
      };
    },
  };

  // Calling getSessionReport repeatedly causes 0 mutation/insert calls
  const rep = await getSessionReport(mockClient, 'user-1', 'session-1');
  assert.equal(rep.overallScore, 85);
  assert.equal(evaluationCreationCalls, 0);
});

test('29. question assessment computes metadata and stays draft', () => {
  const prompt = 'How do you design database indexing for a high-write telemetry table in PostgreSQL?';
  const metadata = computeMetadataIndicators(prompt, 'intermediate', ['databases']);

  assert.equal(metadata.hasQuestionMark, true);
  assert.equal(metadata.isLengthSufficient, true);
  assert.ok(metadata.topicMatchConfidence > 0);
  assert.equal(metadata.readinessStatus, 'ready_for_review');

  const rewrite = generateDraftRewrite(prompt);
  assert.ok(rewrite.endsWith('?'));
});
