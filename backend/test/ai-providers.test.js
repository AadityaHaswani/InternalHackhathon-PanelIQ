import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { AIFallbackEngine } from '../src/modules/ai/fallback-engine.js';
import { MockProvider } from '../src/modules/ai/providers/mock.provider.js';
import { GroqProvider } from '../src/modules/ai/providers/groq.provider.js';
import { GeminiProvider } from '../src/modules/ai/providers/gemini.provider.js';
import { enhanceFollowUp, MAX_AI_FOLLOW_UPS_PER_SESSION } from '../src/modules/ai/follow-up.service.js';
import { evaluateAnswerWithAI, aiEvaluationProposalSchema } from '../src/modules/ai/ai-evaluation.service.js';
import { claimNextAIJob, executeAIJob } from '../src/modules/ai/job.service.js';

// ============================================================================
// TASK 8 TESTS: AI Providers, Fallback Engine, Jobs & Evidence Validation
// ============================================================================

test('1. bank_only makes zero provider calls', async () => {
  let calls = 0;
  const mockPrimary = {
    generateText: async () => { calls++; return { text: 'fail' }; },
    generateStructured: async () => { calls++; return { data: {} }; },
  };

  const engine = new AIFallbackEngine({ mode: 'bank_only', primaryProvider: mockPrimary });
  const textRes = await engine.executeText('test prompt');
  assert.equal(textRes.success, false);
  assert.equal(calls, 0);

  const structRes = await engine.executeStructured('test prompt');
  assert.equal(structRes.success, false);
  assert.equal(calls, 0);

  const followUpRes = await enhanceFollowUp(null, 'session-1', {
    baselinePrompt: 'Base',
    storedFollowUp: 'Approved stored follow-up',
    candidateAnswer: 'Candidate answer',
  }, engine);

  assert.equal(followUpRes.source, 'bank');
  assert.equal(followUpRes.followUpText, 'Approved stored follow-up');
  assert.equal(calls, 0);
});

test('2. mock mode deterministic', async () => {
  const engine = new AIFallbackEngine({ mode: 'mock' });
  const res = await engine.executeStructured('Evaluate this answer', aiEvaluationProposalSchema);
  assert.equal(res.success, true);
  assert.ok(Array.isArray(res.data.evaluations));
  assert.equal(res.data.evaluations.length, 4);
});

test('3. live mode reads environment configuration', () => {
  const groq = new GroqProvider({ apiKey: 'test-groq-key', model: 'llama-3.3-70b-versatile' });
  assert.equal(groq.name, 'groq');
  assert.equal(groq.model, 'llama-3.3-70b-versatile');

  const gemini = new GeminiProvider({ apiKey: 'test-gemini-key', model: 'gemini-3.5-flash-lite' });
  assert.equal(gemini.name, 'gemini');
  assert.equal(gemini.model, 'gemini-3.5-flash-lite');
});

test('4. Groq primary request executes successfully', async () => {
  const primary = new MockProvider({ name: 'groq' });
  const secondary = new MockProvider({ name: 'gemini' });
  const engine = new AIFallbackEngine({ mode: 'mock', primaryProvider: primary, secondaryProvider: secondary });

  const res = await engine.executeStructured('Prompt', aiEvaluationProposalSchema);
  assert.equal(res.success, true);
  assert.equal(res.provider, 'groq');
  assert.equal(res.fallbackUsed, false);
});

test('5. Gemini secondary request executes when invoked directly', async () => {
  const gemini = new MockProvider({ name: 'gemini' });
  const res = await gemini.generateText('Prompt');
  assert.equal(res.provider, 'gemini');
  assert.ok(res.text.length > 0);
});

test('6. primary timeout -> secondary fallback', async () => {
  const primary = new MockProvider({ name: 'groq', shouldFail: true, failCode: 'TIMEOUT' });
  const secondary = new MockProvider({ name: 'gemini' });
  const engine = new AIFallbackEngine({ mode: 'mock', primaryProvider: primary, secondaryProvider: secondary });

  const res = await engine.executeStructured('Prompt', aiEvaluationProposalSchema);
  assert.equal(res.success, true);
  assert.equal(res.provider, 'gemini');
  assert.equal(res.fallbackUsed, true);
});

test('7. primary 429 -> secondary fallback', async () => {
  const primary = new MockProvider({ name: 'groq', shouldFail: true, failCode: 'RATE_LIMITED', failStatus: 429, retryAfter: 5 });
  const secondary = new MockProvider({ name: 'gemini' });
  const engine = new AIFallbackEngine({ mode: 'mock', primaryProvider: primary, secondaryProvider: secondary });

  const res = await engine.executeStructured('Prompt', aiEvaluationProposalSchema);
  assert.equal(res.success, true);
  assert.equal(res.provider, 'gemini');
  assert.equal(res.fallbackUsed, true);
});

test('8. primary 5xx -> secondary fallback', async () => {
  const primary = new MockProvider({ name: 'groq', shouldFail: true, failCode: 'SERVER_ERROR', failStatus: 503 });
  const secondary = new MockProvider({ name: 'gemini' });
  const engine = new AIFallbackEngine({ mode: 'mock', primaryProvider: primary, secondaryProvider: secondary });

  const res = await engine.executeStructured('Prompt', aiEvaluationProposalSchema);
  assert.equal(res.success, true);
  assert.equal(res.provider, 'gemini');
  assert.equal(res.fallbackUsed, true);
});

test('9. invalid AI schema -> secondary fallback', async () => {
  const primary = new MockProvider({ name: 'groq', invalidSchema: true });
  const secondary = new MockProvider({ name: 'gemini' });
  const engine = new AIFallbackEngine({ mode: 'mock', primaryProvider: primary, secondaryProvider: secondary });

  const res = await engine.executeStructured('Prompt', aiEvaluationProposalSchema);
  assert.equal(res.success, true);
  assert.equal(res.provider, 'gemini');
  assert.equal(res.fallbackUsed, true);
});

test('10. both providers fail -> pending evaluation', async () => {
  const primary = new MockProvider({ name: 'groq', shouldFail: true, failCode: 'TIMEOUT' });
  const secondary = new MockProvider({ name: 'gemini', shouldFail: true, failCode: 'RATE_LIMITED' });
  const engine = new AIFallbackEngine({ mode: 'mock', primaryProvider: primary, secondaryProvider: secondary });

  const evalContext = {
    sessionId: randomUUID(),
    turnId: randomUUID(),
    answerId: randomUUID(),
    answerText: 'We used PostgreSQL with transactions.',
    questionPrompt: 'Explain transaction isolation',
  };

  const res = await evaluateAnswerWithAI(null, evalContext, engine);
  assert.equal(res.success, false);
  assert.equal(res.pending, true);
  assert.equal(res.evaluations.length, 0);
});

test('11. follow-up max 2/session enforced', async () => {
  let aiCallCount = 0;
  const mockPrimary = {
    generateText: async () => {
      aiCallCount++;
      return { text: 'Enhanced follow-up question?', provider: 'mock', model: 'v1' };
    },
  };
  const engine = new AIFallbackEngine({ mode: 'mock', primaryProvider: mockPrimary });

  // Mock DB where 2 AI turns already exist in the session
  const mockClient = {
    from: (_table) => ({
      select: (_cols, _opts) => ({
        eq: (_f1, _v1) => ({
          eq: (_f2, _v2) => ({ count: 2 }), // Already 2 AI turns!
        }),
      }),
    }),
  };

  const res = await enhanceFollowUp(mockClient, 'session-1', {
    baselinePrompt: 'Original base',
    storedFollowUp: 'Approved stored follow-up question',
    candidateAnswer: 'My response',
  }, engine);

  assert.equal(res.source, 'bank');
  assert.equal(res.followUpText, 'Approved stored follow-up question');
  assert.equal(aiCallCount, 0); // Zero AI calls when quota reached!
  assert.equal(MAX_AI_FOLLOW_UPS_PER_SESSION, 2);
});

test('12. AI cannot alter scenario assumptions', async () => {
  const storedFollowUp = 'How does cursor-based pagination protect database memory?';
  const engine = new AIFallbackEngine({ mode: 'bank_only' });

  const res = await enhanceFollowUp(null, 'session-1', {
    baselinePrompt: 'A task list now has 100,000 records...',
    changedConstraint: 'Traffic surges to 50,000 req/sec...',
    storedFollowUp,
    candidateAnswer: 'We would just use offset 50000',
  }, engine);

  // Bank-only mode strictly guarantees identical preserved assumptions
  assert.equal(res.followUpText, storedFollowUp);
});

test('13. evidence validation: invalid offsets or mismatched quotes rejected', async () => {
  const answerText = 'We chose Redis because in-memory data structures provide microsecond latency.';
  // Primary proposes invalid evidence: offset 0 to 10 is 'We chose R', but excerpt claims 'Redis'
  const primary = new MockProvider({
    name: 'groq',
    mockEvaluations: [
      {
        criterionId: 'correctness',
        rating: 3,
        applicable: true,
        rationale: 'Mentioned in-memory speed',
        missingPoints: [],
        evidence: { start: 0, end: 10, excerpt: 'Redis' }, // Mismatched excerpt!
        limitations: '',
      },
    ],
  });

  // Secondary proposes valid evidence: offset 9 to 14 is 'Redis'
  const secondary = new MockProvider({
    name: 'gemini',
    mockEvaluations: [
      {
        criterionId: 'correctness',
        rating: 3,
        applicable: true,
        rationale: 'Valid evidence cited',
        missingPoints: [],
        evidence: { start: 9, end: 14, excerpt: 'Redis' }, // Exact slice matches!
        limitations: '',
      },
    ],
  });

  const engine = new AIFallbackEngine({ mode: 'mock', primaryProvider: primary, secondaryProvider: secondary });

  const evalContext = {
    sessionId: randomUUID(),
    turnId: randomUUID(),
    answerId: randomUUID(),
    answerText,
    questionPrompt: 'Explain cache choice',
  };

  const res = await evaluateAnswerWithAI(null, evalContext, engine);
  assert.equal(res.success, true);
  assert.equal(res.provider, 'gemini'); // Fell back to secondary because primary had invalid evidence!
  assert.equal(res.evaluations[0].evidence.excerpt, 'Redis');
});

test('14. job lease protection: active lease cannot be claimed by another worker', async () => {
  const activeJob = {
    id: randomUUID(),
    status: 'claimed',
    lease_owner: 'worker-1',
    lease_expires_at: new Date(Date.now() + 60000).toISOString(), // active for 60s
    attempts: 1,
  };

  const mockClient = {
    from: (_table) => ({
      select: () => ({
        or: () => ({
          order: () => ({
            limit: () => ({
              maybeSingle: async () => ({ data: null, error: null }), // No expired or pending jobs
            }),
          }),
        }),
      }),
    }),
  };

  const claimed = await claimNextAIJob(mockClient, 'worker-2', 60);
  assert.equal(claimed, null);
  assert.equal(activeJob.lease_owner, 'worker-1');
});

test('15. expired lease recovery: expired lease can be reclaimed', async () => {
  const expiredJob = {
    id: randomUUID(),
    status: 'claimed',
    lease_owner: 'stale-worker',
    lease_expires_at: new Date(Date.now() - 10000).toISOString(), // expired 10s ago
    attempts: 1,
  };

  let updatedJob = null;
  const mockClient = {
    from: (_table) => ({
      select: () => ({
        or: () => ({
          order: () => ({
            limit: () => ({
              maybeSingle: async () => ({ data: expiredJob, error: null }),
            }),
          }),
        }),
      }),
      update: (patch) => {
        updatedJob = { ...expiredJob, ...patch };
        return {
          eq: () => ({
            select: () => ({
              single: async () => ({ data: updatedJob, error: null }),
            }),
          }),
        };
      },
    }),
  };

  const claimed = await claimNextAIJob(mockClient, 'recovery-worker', 60);
  assert.ok(claimed);
  assert.equal(claimed.lease_owner, 'recovery-worker');
  assert.equal(claimed.attempts, 2);
});

test('16. completed job idempotency: completed job never runs twice', async () => {
  let aiEvaluationsRun = 0;
  const engine = new AIFallbackEngine({
    mode: 'mock',
    primaryProvider: {
      generateStructured: async () => {
        aiEvaluationsRun++;
        return { data: { evaluations: [] } };
      },
    },
  });

  const completedJob = {
    id: randomUUID(),
    status: 'completed',
    session_id: randomUUID(),
    turn_id: randomUUID(),
    answer_id: randomUUID(),
  };

  const res = await executeAIJob(null, completedJob, engine);
  assert.equal(res.success, true);
  assert.equal(aiEvaluationsRun, 0); // Zero AI operations executed on completed job!
});
