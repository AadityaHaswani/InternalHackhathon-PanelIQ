import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import {
  createRetryAttempt,
  submitRetryAnswer,
  getRetryAttempt,
  getRetryVariants,
} from '../src/modules/retries/retry.service.js';
import { AIFallbackEngine } from '../src/modules/ai/fallback-engine.js';
import { MockProvider } from '../src/modules/ai/providers/mock.provider.js';

// ============================================================================
// TASK 9 TESTS: Retries, Variants & Rubric Comparisons (17 to 22)
// ============================================================================

test('17. retry creation: links source answer and variant from retry-variants.json', async () => {
  const userId = randomUUID();
  const sessionId = randomUUID();
  const sourceAnswerId = randomUUID();
  const turnId = randomUUID();

  const mockVariants = getRetryVariants();
  const firstVariant = mockVariants[0]; // e.g. be-j-concurrency-stock -> be-j-concurrency-counters

  let insertedRetry = null;
  const mockClient = {
    from: (table) => {
      const b = {
        select: () => b,
        eq: () => b,
        order: () => b,
        limit: () => b,
        maybeSingle: async () => {
          if (table === 'sessions') return { data: { id: sessionId, user_id: userId, status: 'completed' }, error: null };
          if (table === 'answers') return { data: { id: sourceAnswerId, session_id: sessionId, turn_id: turnId, answer_text: 'Stock check' }, error: null };
          if (table === 'answer_retries') return { data: null, error: null }; // No existing retry
          if (table === 'session_turns') {
            return {
              data: {
                id: turnId,
                stage: 'technical',
                question_snapshot: { id: firstVariant.primaryQuestionId, rubric_version: 1 },
              },
              error: null,
            };
          }
          if (table === 'question_versions') {
            return {
              data: {
                id: randomUUID(),
                question_id: firstVariant.variantQuestionId,
                version: 1,
                prompt: 'Variant question prompt',
                rubric_notes: { version: 1 },
              },
              error: null,
            };
          }
          return { data: null, error: null };
        },
        insert: (record) => {
          insertedRetry = { id: randomUUID(), ...record, created_at: new Date().toISOString() };
          return {
            select: () => ({
              single: async () => ({ data: insertedRetry, error: null }),
            }),
          };
        },
      };
      return b;
    },
  };

  const res = await createRetryAttempt(mockClient, userId, sessionId, sourceAnswerId);
  assert.ok(res.id);
  assert.equal(res.sourceAnswerId, sourceAnswerId);
  assert.equal(res.variantId, firstVariant.variantQuestionId);
  assert.equal(res.status, 'created');
  assert.equal(res.numericComparisonAllowed, true);
});

test('18. one-retry limit: multiple retry requests return existing retry attempt (idempotent)', async () => {
  const userId = randomUUID();
  const sessionId = randomUUID();
  const sourceAnswerId = randomUUID();
  const existingRetryId = randomUUID();

  let insertCount = 0;
  const mockClient = {
    from: (table) => {
      const b = {
        select: () => b,
        eq: () => b,
        maybeSingle: async () => {
          if (table === 'sessions') return { data: { id: sessionId, user_id: userId }, error: null };
          if (table === 'answers') return { data: { id: sourceAnswerId, session_id: sessionId }, error: null };
          if (table === 'answer_retries') {
            return {
              data: {
                id: existingRetryId,
                session_id: sessionId,
                source_answer_id: sourceAnswerId,
                topic: 'concurrency',
                variant_id: 'be-j-concurrency-counters',
                status: 'created',
                original_score: 50,
                retry_score: null,
                numeric_comparison_allowed: true,
                score_delta: null,
                created_at: new Date().toISOString(),
              },
              error: null,
            };
          }
          return { data: null, error: null };
        },
        insert: () => {
          insertCount++;
          return b;
        },
      };
      return b;
    },
  };

  // Calling createRetryAttempt again returns the existing retry
  const res = await createRetryAttempt(mockClient, userId, sessionId, sourceAnswerId);
  assert.equal(res.id, existingRetryId);
  assert.equal(insertCount, 0); // No second insert!
});

test('19. original answer immutability: retry answer evaluated separately from source answer', async () => {
  const userId = randomUUID();
  const sessionId = randomUUID();
  const retryId = randomUUID();
  const sourceAnswerId = randomUUID();

  let answerRowMutated = false;
  let retryRowUpdated = false;

  const mockClient = {
    from: (table) => {
      const b = {
        select: () => b,
        eq: () => b,
        upsert: () => ({ select: () => ({ data: [], error: null }) }),
        maybeSingle: async () => {
          if (table === 'answer_retries') {
            return {
              data: {
                id: retryId,
                session_id: sessionId,
                source_answer_id: sourceAnswerId,
                original_score: 50,
                original_rubric_version: 1,
                retry_rubric_version: 1,
                numeric_comparison_allowed: true,
                status: 'created',
              },
              error: null,
            };
          }
          if (table === 'sessions') return { data: { id: sessionId, user_id: userId }, error: null };
          if (table === 'question_versions') return { data: { prompt: 'How to handle counters?' }, error: null };
          return { data: null, error: null };
        },
        update: (_patch) => {
          if (table === 'answers') answerRowMutated = true;
          if (table === 'answer_retries') retryRowUpdated = true;
          return {
            eq: () => ({
              select: () => ({
                single: async () => ({
                  data: {
                    id: retryId,
                    session_id: sessionId,
                    source_answer_id: sourceAnswerId,
                    status: 'evaluated',
                    original_score: 50,
                    retry_score: 75,
                    numeric_comparison_allowed: true,
                    score_delta: 25,
                    created_at: new Date().toISOString(),
                  },
                  error: null,
                }),
              }),
            }),
          };
        },
      };
      return b;
    },
  };

  const engine = new AIFallbackEngine({ mode: 'mock' });
  const res = await submitRetryAnswer(
    mockClient,
    userId,
    retryId,
    { answerText: 'We use atomic increment operations.', idempotencyKey: 'retry-key-1' },
    engine
  );

  assert.equal(answerRowMutated, false); // Original answers table is completely untouched!
  assert.equal(retryRowUpdated, true);
  assert.equal(res.status, 'evaluated');
});

test('20. retry variant validation: arbitrary questions without approved variants rejected', async () => {
  const userId = randomUUID();
  const sessionId = randomUUID();
  const sourceAnswerId = randomUUID();

  const mockClient = {
    from: (table) => {
      const b = {
        select: () => b,
        eq: () => b,
        maybeSingle: async () => {
          if (table === 'sessions') return { data: { id: sessionId, user_id: userId }, error: null };
          if (table === 'answers') return { data: { id: sourceAnswerId, session_id: sessionId, turn_id: 't-1' }, error: null };
          if (table === 'answer_retries') return { data: null, error: null };
          if (table === 'session_turns') {
            return {
              data: {
                id: 't-1',
                question_snapshot: { id: 'arbitrary-unapproved-question-id' }, // No variant exists!
              },
              error: null,
            };
          }
          return { data: null, error: null };
        },
      };
      return b;
    },
  };

  await assert.rejects(
    createRetryAttempt(mockClient, userId, sessionId, sourceAnswerId),
    { code: 'RETRY_NOT_AVAILABLE' }
  );
});

test('21. same-rubric comparison: numeric score delta calculated when rubric versions match', async () => {
  const userId = randomUUID();
  const sessionId = randomUUID();
  const retryId = randomUUID();

  const mockRetry = {
    id: retryId,
    session_id: sessionId,
    source_answer_id: 'source-1',
    original_score: 60,
    original_rubric_version: 1,
    retry_rubric_version: 1, // Same rubric version!
    numeric_comparison_allowed: true,
    status: 'created',
  };

  const mockClient = {
    from: (table) => {
      const b = {
        select: () => b,
        eq: () => b,
        upsert: () => ({ select: () => ({ data: [], error: null }) }),
        maybeSingle: async () => {
          if (table === 'answer_retries') return { data: mockRetry, error: null };
          if (table === 'sessions') return { data: { id: sessionId, user_id: userId }, error: null };
          if (table === 'question_versions') return { data: { prompt: 'Q' }, error: null };
          return { data: null, error: null };
        },
        update: (patch) => ({
          eq: () => ({
            select: () => ({
              single: async () => ({
                data: {
                  ...mockRetry,
                  ...patch,
                  created_at: new Date().toISOString(),
                },
                error: null,
              }),
            }),
          }),
        }),
      };
      return b;
    },
  };

  // Mock engine returning all criteria = 4 -> 100 score
  const engine = new AIFallbackEngine({
    mode: 'mock',
    primaryProvider: new MockProvider({
      mockEvaluations: [
        { criterionId: 'correctness', rating: 4, applicable: true },
        { criterionId: 'reasoning', rating: 4, applicable: true },
        { criterionId: 'relevance', rating: 4, applicable: true },
        { criterionId: 'tradeoffs', rating: 4, applicable: true },
      ],
    }),
  });

  const res = await submitRetryAnswer(
    mockClient,
    userId,
    retryId,
    { answerText: 'Improved answer', idempotencyKey: 'idemp-1' },
    engine
  );

  assert.equal(res.numericComparisonAllowed, true);
  assert.equal(res.retryScore, 100);
  assert.equal(res.originalScore, 60);
  assert.equal(res.scoreDelta, 40); // 100 - 60 = 40 point improvement!
});

test('22. different-rubric comparison restriction: numeric improvement blocked when rubric versions differ', async () => {
  const userId = randomUUID();
  const sessionId = randomUUID();
  const retryId = randomUUID();

  const mockRetry = {
    id: retryId,
    session_id: sessionId,
    source_answer_id: 'source-1',
    original_score: 60,
    original_rubric_version: 1,
    retry_rubric_version: 2, // Different rubric version!
    numeric_comparison_allowed: false, // Blocked!
    status: 'created',
  };

  const mockClient = {
    from: (table) => {
      const b = {
        select: () => b,
        eq: () => b,
        upsert: () => ({ select: () => ({ data: [], error: null }) }),
        maybeSingle: async () => {
          if (table === 'answer_retries') return { data: mockRetry, error: null };
          if (table === 'sessions') return { data: { id: sessionId, user_id: userId }, error: null };
          if (table === 'question_versions') return { data: { prompt: 'Q' }, error: null };
          return { data: null, error: null };
        },
        update: (patch) => ({
          eq: () => ({
            select: () => ({
              single: async () => ({
                data: {
                  ...mockRetry,
                  ...patch,
                  created_at: new Date().toISOString(),
                },
                error: null,
              }),
            }),
          }),
        }),
      };
      return b;
    },
  };

  const engine = new AIFallbackEngine({
    mode: 'mock',
    primaryProvider: new MockProvider({
      mockEvaluations: [
        { criterionId: 'correctness', rating: 4, applicable: true },
        { criterionId: 'reasoning', rating: 4, applicable: true },
        { criterionId: 'relevance', rating: 4, applicable: true },
        { criterionId: 'tradeoffs', rating: 4, applicable: true },
      ],
    }),
  });

  const res = await submitRetryAnswer(
    mockClient,
    userId,
    retryId,
    { answerText: 'Improved answer under new rubric', idempotencyKey: 'idemp-2' },
    engine
  );

  assert.equal(res.numericComparisonAllowed, false);
  assert.equal(res.scoreDelta, null); // Strictly null!
  assert.ok(res.comparisonNote.includes('Rubric versions differ'));
});

test('22b. getRetryAttempt returns safe retry attempt DTO', async () => {
  const userId = randomUUID();
  const sessionId = randomUUID();
  const retryId = randomUUID();

  const mockRetry = {
    id: retryId,
    session_id: sessionId,
    source_answer_id: 'source-1',
    topic: 'concurrency',
    variant_id: 'be-j-concurrency-counters',
    status: 'created',
    original_score: 50,
    retry_score: null,
    numeric_comparison_allowed: true,
    score_delta: null,
    created_at: new Date().toISOString(),
  };

  const mockClient = {
    from: (table) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => {
            if (table === 'answer_retries') return { data: mockRetry, error: null };
            if (table === 'sessions') return { data: { id: sessionId, user_id: userId }, error: null };
            return { data: null, error: null };
          },
        }),
      }),
    }),
  };

  const res = await getRetryAttempt(mockClient, userId, retryId);
  assert.equal(res.id, retryId);
  assert.equal(res.topic, 'concurrency');
});
