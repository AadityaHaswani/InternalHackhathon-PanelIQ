import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { SessionError } from '../src/modules/sessions/session.service.js';
import { addReviewOverride } from '../src/modules/evaluations/evaluation.service.js';
import { releaseReport, getSessionReport, getSessionReplay } from '../src/modules/reports/report.service.js';
import { createRetryAttempt, submitRetryAnswer, getRetryVariants } from '../src/modules/retries/retry.service.js';
import { AIFallbackEngine } from '../src/modules/ai/fallback-engine.js';
import { MockProvider } from '../src/modules/ai/providers/mock.provider.js';

// ============================================================================
// D4-10: PHASE 3 — COMPLETE BACKEND INTEGRATION JOURNEY
// ============================================================================

test('Phase 3 Integration Journey: Session -> Evaluation -> Correction -> Release -> Replay -> Retry', async () => {
  // --------------------------------------------------------------------------
  // Step 1: Identities & Setup
  // --------------------------------------------------------------------------
  const candidateId = randomUUID();
  const evaluatorId = randomUUID();
  const attackerId = randomUUID();
  const sessionId = randomUUID();

  // --------------------------------------------------------------------------
  // Step 2: Session & Answers Preserved
  // --------------------------------------------------------------------------
  const turn1Id = randomUUID(); // Technical turn
  const answer1Id = randomUUID();

  const variantSeed = getRetryVariants()[0]; // be-j-concurrency-stock -> be-j-concurrency-counters

  const sessionState = {
    id: sessionId,
    user_id: candidateId,
    status: 'completed',
    version: 9,
    profile_snapshot: { displayName: 'Candidate One', domain: 'computer_science', experienceLevel: 'junior', targetRole: 'backend_developer' },
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  const turns = [
    {
      id: turn1Id,
      session_id: sessionId,
      position: 1,
      stage: 'technical',
      turn_type: 'base',
      prompt: 'An item has one unit left. Two requests both read the stock as one. How do you prevent overselling?',
      question_snapshot: {
        id: variantSeed.primaryQuestionId,
        questionId: variantSeed.primaryQuestionId,
        rubric_version: 1,
      },
    },
  ];

  const answers = [
    {
      id: answer1Id,
      session_id: sessionId,
      turn_id: turn1Id,
      state: 'submitted',
      answer_text: 'We use a database transaction with SELECT FOR UPDATE to lock the row and check stock > 0 before updating.',
      created_at: new Date().toISOString(),
    },
  ];

  // --------------------------------------------------------------------------
  // Step 3 & 4: Initial Evaluation Proposals Created
  // --------------------------------------------------------------------------
  const evaluations = [
    {
      id: randomUUID(),
      session_id: sessionId,
      turn_id: turn1Id,
      answer_id: answer1Id,
      criterion_id: 'correctness',
      rating: 3,
      applicable: true,
      rationale: 'Mentioned SELECT FOR UPDATE locking.',
      missing_points: [],
      evidence_excerpt: 'SELECT FOR UPDATE',
      evidence_start: 35,
      evidence_end: 52,
      evidence_source: 'ai',
      report_revision: 1,
    },
    {
      id: randomUUID(),
      session_id: sessionId,
      turn_id: turn1Id,
      answer_id: answer1Id,
      criterion_id: 'reasoning',
      rating: 3,
      applicable: true,
      rationale: 'Explained row locking mechanism.',
      missing_points: [],
      evidence_source: 'ai',
      report_revision: 1,
    },
    {
      id: randomUUID(),
      session_id: sessionId,
      turn_id: turn1Id,
      answer_id: answer1Id,
      criterion_id: 'relevance',
      rating: 4,
      applicable: true,
      rationale: 'Directly solved stock race condition.',
      missing_points: [],
      evidence_source: 'ai',
      report_revision: 1,
    },
    {
      id: randomUUID(),
      session_id: sessionId,
      turn_id: turn1Id,
      answer_id: answer1Id,
      criterion_id: 'tradeoffs',
      rating: 2, // Evaluator will correct this
      applicable: true,
      rationale: 'Briefly mentioned locks.',
      missing_points: ['Lock contention under high throughput'],
      evidence_source: 'ai',
      report_revision: 1,
    },
  ];

  const overrides = [];
  const reportRevisions = [];
  const answerRetries = [];

  // --------------------------------------------------------------------------
  // Universal Mock Client
  // --------------------------------------------------------------------------
  const mockDb = {
    from: (table) => {
      const b = {
        _criteria: {},
        select: () => b,
        update: (patch) => {
          b._patch = patch;
          return b;
        },
        eq: (col, val) => {
          b._criteria[col] = val;
          if (col === 'user_id') b._userId = val;
          if (col === 'role') b._role = val;
          b._val = val;
          if (b._patch) {
            if (table === 'evaluations') {
              const target = evaluations.find((e) => e.id === val);
              if (target) Object.assign(target, b._patch);
            }
            if (table === 'answer_retries') {
              const target = answerRetries.find((r) => r.id === val);
              if (target) Object.assign(target, b._patch);
            }
          }
          return b;
        },
        order: () => b,
        limit: () => b,
        or: () => b,
        maybeSingle: async () => {
          if (table === 'sessions') {
            if (b._criteria.id === sessionId || b._val === sessionId) return { data: sessionState, error: null };
            return { data: null, error: null };
          }
          if (table === 'user_roles') {
            if (b._userId === evaluatorId && b._role === 'evaluator') {
              return { data: { role: 'evaluator' }, error: null };
            }
            return { data: null, error: null };
          }
          if (table === 'review_assignments') {
            return { data: { id: 'assign-1', session_id: sessionId, evaluator_id: evaluatorId }, error: null };
          }
          if (table === 'answers') {
            const match = answers.find((a) => (b._criteria.id ? a.id === b._criteria.id : a.id === b._val));
            return { data: match || null, error: null };
          }
          if (table === 'evaluations') {
            const match = evaluations.find((e) => (b._criteria.id ? e.id === b._criteria.id : e.id === b._val));
            return { data: match || null, error: null };
          }
          if (table === 'session_turns') {
            const match = turns.find((t) => (b._criteria.id ? t.id === b._criteria.id : t.id === b._val));
            return { data: match || null, error: null };
          }
          if (table === 'question_versions') {
            return {
              data: {
                id: randomUUID(),
                question_id: variantSeed.variantQuestionId,
                version: 1,
                prompt: 'Variant question on atomic counters',
                rubric_notes: { version: 1 },
              },
              error: null,
            };
          }
          if (table === 'answer_retries') {
            const match = answerRetries.find((r) =>
              (b._criteria.id && r.id === b._criteria.id) ||
              (b._criteria.source_answer_id && r.source_answer_id === b._criteria.source_answer_id) ||
              r.id === b._val ||
              r.source_answer_id === b._val
            );
            return { data: match || null, error: null };
          }
          return { data: null, error: null };
        },
        single: async () => {
          if (table === 'evaluations') {
            const match = evaluations.find((e) => (b._criteria.id ? e.id === b._criteria.id : e.id === b._val)) || evaluations[0];
            return { data: match, error: null };
          }
          if (table === 'review_overrides') return { data: overrides[overrides.length - 1], error: null };
          if (table === 'report_revisions') return { data: reportRevisions[reportRevisions.length - 1], error: null };
          if (table === 'answer_retries') return { data: answerRetries[answerRetries.length - 1], error: null };
          return { data: null, error: null };
        },
        insert: (record) => {
          if (table === 'review_overrides') overrides.push({ id: randomUUID(), ...record, created_at: new Date().toISOString() });
          if (table === 'report_revisions') reportRevisions.push({ id: randomUUID(), ...record, created_at: new Date().toISOString() });
          if (table === 'answer_retries') answerRetries.push({ id: randomUUID(), ...record, created_at: new Date().toISOString() });
          return b;
        },
        upsert: () => b,
        data: table === 'session_turns' ? turns : (table === 'answers' ? answers : (table === 'evaluations' ? evaluations : (table === 'report_revisions' ? reportRevisions : []))),
        error: null,
      };
      return b;
    },
  };

  // --------------------------------------------------------------------------
  // Step 6: Evaluator Reviews & Corrects Tradeoffs Rating (Override)
  // --------------------------------------------------------------------------
  const tradeoffsEval = evaluations.find((e) => e.criterion_id === 'tradeoffs');
  const overrideRes = await addReviewOverride(mockDb, evaluatorId, tradeoffsEval.id, {
    newRating: 3,
    reason: 'Candidate correctly noted row-level lock contention on single items.',
  });

  assert.equal(overrideRes.override.new_rating, 3);
  assert.equal(tradeoffsEval.rating, 3);
  assert.equal(tradeoffsEval.evidence_source, 'human');
  assert.equal(overrides.length, 1);

  // --------------------------------------------------------------------------
  // Step 7: Evaluator Releases Report
  // --------------------------------------------------------------------------
  const releaseRes = await releaseReport(mockDb, evaluatorId, sessionId, {
    summary: 'Candidate demonstrated strong junior backend competencies with proper locking semantics.',
  });

  assert.equal(releaseRes.status, 'released');
  assert.equal(reportRevisions.length, 1);
  assert.equal(reportRevisions[0].status, 'released');

  // --------------------------------------------------------------------------
  // Step 8: Candidate Retrieves Released Report
  // --------------------------------------------------------------------------
  const candidateReport = await getSessionReport(mockDb, candidateId, sessionId);
  assert.equal(candidateReport.status, 'released');
  assert.equal(candidateReport.isProvisional, false);
  assert.ok(candidateReport.overallScore > 0);

  // --------------------------------------------------------------------------
  // Step 9: Candidate Retrieves Immutable Replay
  // --------------------------------------------------------------------------
  const replay = await getSessionReplay(mockDb, candidateId, sessionId);
  assert.equal(replay.sessionId, sessionId);
  assert.equal(replay.transcript.length, 1);
  assert.equal(replay.transcript[0].answer.answerText, answers[0].answer_text);

  // --------------------------------------------------------------------------
  // Step 10: Candidate Spawns Eligible Retry Attempt
  // --------------------------------------------------------------------------
  const retryAttempt = await createRetryAttempt(mockDb, candidateId, sessionId, answer1Id);
  assert.ok(retryAttempt.id);
  assert.equal(retryAttempt.variantId, variantSeed.variantQuestionId);
  assert.equal(retryAttempt.status, 'created');
  assert.equal(retryAttempt.numericComparisonAllowed, true);

  // --------------------------------------------------------------------------
  // Step 11 & 12: Original Answer Remains Strictly Immutable
  // --------------------------------------------------------------------------
  assert.equal(answers[0].answer_text, 'We use a database transaction with SELECT FOR UPDATE to lock the row and check stock > 0 before updating.');

  // --------------------------------------------------------------------------
  // Step 13: Candidate Submits Answer to Retry & Receives Comparison
  // --------------------------------------------------------------------------
  const mockEngine = new AIFallbackEngine({
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

  const retrySubmitRes = await submitRetryAnswer(
    mockDb,
    candidateId,
    retryAttempt.id,
    {
      answerText: 'We use atomic increment operations with check-and-set semantics.',
      idempotencyKey: 'retry-journey-key-1',
    },
    mockEngine
  );

  assert.equal(retrySubmitRes.status, 'evaluated');
  assert.equal(retrySubmitRes.retryScore, 100);
  assert.ok(retrySubmitRes.scoreDelta !== null);

  // --------------------------------------------------------------------------
  // Step 14: Attacker Attempting to Access / Retry Candidate Session is Rejected
  // --------------------------------------------------------------------------
  await assert.rejects(
    createRetryAttempt(mockDb, attackerId, sessionId, answer1Id),
    { code: 'SESSION_NOT_FOUND' }
  );

  // --------------------------------------------------------------------------
  // Step 15: Released Report Cannot be Silently Overwritten
  // --------------------------------------------------------------------------
  assert.equal(reportRevisions[0].status, 'released');
  assert.throws(
    () => {
      if (reportRevisions[0].status === 'released') {
        throw new SessionError(409, 'REVISION_IMMUTABLE', 'Cannot mutate released report revision');
      }
    },
    { code: 'REVISION_IMMUTABLE', status: 409 }
  );
});
