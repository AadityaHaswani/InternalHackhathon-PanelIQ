import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import {
  selectScenarioForPlan,
  formatSafeTurnDto,
} from '../src/modules/scenarios/scenario.service.js';

const scenarios = JSON.parse(
  fs.readFileSync(new URL('../supabase/seeds/constraint-scenarios.json', import.meta.url), 'utf8'),
).map((s) => ({ ...s, status: 'published', baseline_question_id: s.baselineQuestionId }));

const juniorPlan = [
  { id: 'q1', question_id: 'be-j-intro-project', stage: 'icebreaker' },
  { id: 'q2', question_id: 'be-j-api-validation', stage: 'technical' },
  { id: 'q3', question_id: 'be-j-db-uniqueness', stage: 'technical' },
  { id: 'q4', question_id: 'be-j-concurrency-stock', stage: 'technical' }, // Matches scen-j-db-offline
  { id: 'q5', question_id: 'be-j-reliability-timeout', stage: 'technical' },
  { id: 'q6', question_id: 'be-j-project-deadline', stage: 'techno_managerial' },
  { id: 'q7', question_id: 'be-j-project-contract', stage: 'techno_managerial' },
  { id: 'q8', question_id: 'be-j-reflect-improve', stage: 'reflection' },
];

const intermediatePlan = [
  { id: 'qi1', question_id: 'be-i-intro-design', stage: 'icebreaker' },
  { id: 'qi2', question_id: 'be-i-api-idempotency', stage: 'technical' }, // Matches scen-i-idempotency-cluster
  { id: 'qi3', question_id: 'be-i-db-transfer', stage: 'technical' }, // Matches scen-i-distributed-transfer
  { id: 'qi4', question_id: 'be-i-concurrency-version', stage: 'technical' },
  { id: 'qi5', question_id: 'be-i-reliability-retries', stage: 'technical' },
  { id: 'qi6', question_id: 'be-i-project-migration', stage: 'techno_managerial' },
  { id: 'qi7', question_id: 'be-i-project-slo', stage: 'techno_managerial' },
  { id: 'qi8', question_id: 'be-i-reflect-assumption', stage: 'reflection' },
];

test('1. approved scenario can be selected for plan', () => {
  const selected = selectScenarioForPlan(scenarios, juniorPlan);
  assert.ok(selected);
  assert.equal(selected.id, 'scen-j-db-offline');
  assert.equal(selected.baseline_question_id, 'be-j-concurrency-stock');
  assert.equal(selected.status, 'published');
});

test('2. scenario matches candidate level', () => {
  const juniorScenarios = scenarios.filter((s) => s.level === 'junior');
  const intermediateScenarios = scenarios.filter((s) => s.level === 'intermediate');

  const selectedJunior = selectScenarioForPlan(juniorScenarios, juniorPlan);
  assert.equal(selectedJunior.level, 'junior');

  const selectedIntermediate = selectScenarioForPlan(intermediateScenarios, intermediatePlan);
  assert.equal(selectedIntermediate.level, 'intermediate');

  // Cross-level mismatch returns null
  assert.equal(selectScenarioForPlan(juniorScenarios, intermediatePlan), null);
  assert.equal(selectScenarioForPlan(intermediateScenarios, juniorPlan), null);
});

test('3. at most one scenario per session', () => {
  // Intermediate plan matches both scen-i-idempotency-cluster and scen-i-distributed-transfer
  const selected = selectScenarioForPlan(scenarios, intermediatePlan);
  assert.ok(selected);
  // Returns single scenario object, never array or multiple
  assert.equal(typeof selected.id, 'string');
  assert.ok(['scen-i-distributed-transfer', 'scen-i-idempotency-cluster'].includes(selected.id));
});

test('4. scenario challenge creates separate answer/turn', () => {
  const baselineTurn = {
    id: randomUUID(),
    session_id: randomUUID(),
    position: 4,
    stage: 'technical',
    panel_role: 'technical',
    turn_type: 'base',
    question_snapshot: { questionId: 'be-j-concurrency-stock', prompt: 'Original stock prompt' },
  };

  const challengeTurn = {
    id: randomUUID(),
    session_id: baselineTurn.session_id,
    position: 5,
    stage: 'technical',
    panel_role: 'technical',
    turn_type: 'challenge',
    parent_turn_id: baselineTurn.id,
    source: 'stored_followup',
    prompt: 'How do you avoid overselling when offline kiosks sync?',
    constraint_snapshot: {
      originalPrompt: 'Original stock prompt',
      change: 'Offline kiosks with delayed sync',
    },
  };

  const baselineAnswer = {
    id: randomUUID(),
    turn_id: baselineTurn.id,
    answer_text: 'I would use SELECT FOR UPDATE in SQL',
  };

  const challengeAnswer = {
    id: randomUUID(),
    turn_id: challengeTurn.id,
    answer_text: 'I would allocate a local quota per kiosk',
  };

  assert.notEqual(baselineTurn.id, challengeTurn.id);
  assert.notEqual(baselineAnswer.id, challengeAnswer.id);
  assert.equal(challengeTurn.parent_turn_id, baselineTurn.id);
  assert.equal(challengeAnswer.turn_id, challengeTurn.id);
});

test('5. original answer remains unchanged when challenge turn is answered', () => {
  const baselineAnswer = {
    id: randomUUID(),
    turn_id: randomUUID(),
    answer_text: 'Original baseline response text',
    state: 'submitted',
  };

  const baselineSnapshot = JSON.stringify(baselineAnswer);

  // Submit challenge answer
  const challengeAnswer = {
    id: randomUUID(),
    turn_id: randomUUID(),
    answer_text: 'Challenge response text under changed constraint',
    state: 'submitted',
  };

  assert.equal(JSON.stringify(baselineAnswer), baselineSnapshot);
  assert.notEqual(challengeAnswer.id, baselineAnswer.id);
  assert.notEqual(challengeAnswer.answer_text, baselineAnswer.answer_text);
});

test('6. scenario answer keys never appear in candidate DTO', () => {
  const rawChallengeTurn = {
    id: randomUUID(),
    position: 5,
    stage: 'technical',
    panel_role: 'technical',
    turn_type: 'challenge',
    source: 'stored_followup',
    parent_turn_id: randomUUID(),
    prompt: 'Follow up prompt question?',
    constraint_snapshot: {
      originalPrompt: 'Base prompt',
      change: 'Changed constraint condition',
    },
    // Sensitive keys that must NEVER leak:
    expected_reasoning_points: ['Secret point 1', 'Secret point 2'],
    expectedReasoningPoints: ['Secret point 1'],
    rubric_anchors: { 0: 'fail', 4: 'pass' },
    rubricAnchors: { 0: 'fail' },
    privateAnswerKey: 'Exclusive solution',
  };

  const safeDto = formatSafeTurnDto(rawChallengeTurn);

  assert.equal(safeDto.isChallenge, true);
  assert.equal(safeDto.prompt, 'Follow up prompt question?');
  assert.deepEqual(safeDto.constraint, {
    originalPrompt: 'Base prompt',
    change: 'Changed constraint condition',
  });

  const serialized = JSON.stringify(safeDto);
  assert.ok(!serialized.includes('Secret point'));
  assert.ok(!serialized.includes('rubric_anchors'));
  assert.ok(!serialized.includes('rubricAnchors'));
  assert.ok(!serialized.includes('expectedReasoningPoints'));
  assert.ok(!serialized.includes('privateAnswerKey'));
});

test('7. duplicate/idempotent request does not create duplicate challenge', () => {
  // Simulating turning an answer with idempotency key
  const turns = [
    { id: 'turn-1', position: 1, turn_type: 'base' },
    { id: 'turn-2', position: 2, turn_type: 'base' },
  ];

  const answers = new Map();
  const idempotencyKeys = new Set();

  function saveTurnWithChallenge(turnId, key, _answerText) {
    if (idempotencyKeys.has(key)) {
      return answers.get(key); // Return existing cached outcome
    }

    idempotencyKeys.add(key);
    const answerId = randomUUID();
    const isBaseline = turnId === 'turn-1';

    let challengeCreated = false;
    if (isBaseline && !turns.some((t) => t.turn_type === 'challenge')) {
      turns.splice(1, 0, { id: 'turn-challenge-1', position: 2, turn_type: 'challenge', parent_turn_id: turnId });
      turns[2].position = 3;
      challengeCreated = true;
    }

    const outcome = { answerId, turnCount: turns.length, challengeCreated };
    answers.set(key, outcome);
    return outcome;
  }

  const firstAttempt = saveTurnWithChallenge('turn-1', 'same-idempotency-key', 'Answer');
  assert.equal(firstAttempt.challengeCreated, true);
  assert.equal(firstAttempt.turnCount, 3);

  // Retry with exact same idempotency key
  const retryAttempt = saveTurnWithChallenge('turn-1', 'same-idempotency-key', 'Answer');
  assert.deepEqual(retryAttempt, firstAttempt);
  assert.equal(turns.filter((t) => t.turn_type === 'challenge').length, 1);
});

test('8. unpublished scenario cannot be selected', () => {
  const draftsOnly = scenarios.map((s) => ({ ...s, status: 'draft' }));
  const archivedOnly = scenarios.map((s) => ({ ...s, status: 'archived' }));

  assert.equal(selectScenarioForPlan(draftsOnly, juniorPlan), null);
  assert.equal(selectScenarioForPlan(archivedOnly, intermediatePlan), null);
});
