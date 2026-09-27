import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { selectPlan, stagePlan } from '../src/modules/sessions/session-plan.js';

const seed = JSON.parse(fs.readFileSync(new URL('../supabase/seeds/backend-developer.questions.json', import.meta.url)));
const scenarios = JSON.parse(fs.readFileSync(new URL('../supabase/seeds/constraint-scenarios.json', import.meta.url)));
const retryVariants = JSON.parse(fs.readFileSync(new URL('../supabase/seeds/retry-variants.json', import.meta.url)));

// Test fixtures model publication AFTER human review. Real seeds stay draft.
const questions = seed.map((q) => ({ id: q.id, question_id: q.id, domain: 'computer_science',
  experience_level: q.level, stage: q.stage, topics: q.topics, role_slugs: ['backend_developer'], status: 'published' }));
const roles = [{ slug: 'backend_developer', domain: 'computer_science', label: 'Backend Developer' }];
const profile = { display_name: 'Demo', domain: 'computer_science', experience_level: 'junior', target_role: 'backend_developer' };

test('expanded bank satisfies 40-60 target and supports three disjoint eight-turn plans per level', () => {
  assert.ok(seed.length >= 40 && seed.length <= 60, `Bank size ${seed.length} must be between 40 and 60`);
  assert.equal(seed.length, 48);
  assert.equal(new Set(seed.map((q) => q.id)).size, 48);
  assert.equal(new Set(seed.map((q) => q.prompt)).size, 48);

  for (const level of ['junior', 'intermediate']) {
    let remaining = questions;
    for (let attempt = 0; attempt < 3; attempt++) {
      const ids = selectPlan(remaining, { ...profile, experience_level: level }, roles, () => 0);
      const plan = ids.map((id) => questions.find((q) => q.id === id));
      assert.deepEqual(plan.map((q) => q.stage), stagePlan);
      assert.equal(new Set(ids).size, 8);
      assert.ok(plan.every((q) => q.experience_level === level && q.domain === profile.domain && q.role_slugs.includes(profile.target_role)));
      remaining = remaining.filter((q) => !ids.includes(q.id));
    }
    // After 3 disjoint plans (24 questions), all questions for that level are consumed
    const remainingForLevel = remaining.filter((q) => q.experience_level === level);
    assert.equal(remainingForLevel.length, 0);
  }
});

test('technical selection prefers fresh topic coverage and randomizes alternatives', () => {
  const plans = new Set();
  for (let i = 0; i < 40; i++) {
    const ids = selectPlan(questions, profile, roles);
    plans.add(ids.join(','));
    const technical = ids.map((id) => questions.find((q) => q.id === id)).filter((q) => q.stage === 'technical');
    assert.ok(new Set(technical.flatMap((q) => q.topics)).size >= 4);
  }
  assert.ok(plans.size > 1);
});

test('incomplete and unsupported profiles never silently fall back', () => {
  for (const field of Object.keys(profile)) {
    assert.throws(() => selectPlan(questions, { ...profile, [field]: null }, roles), { code: 'PROFILE_INCOMPLETE' });
  }
  for (const patch of [{ target_role: 'Backend Developer' }, { domain: 'physics' }, { experience_level: 'senior' }]) {
    assert.throws(() => selectPlan(questions, { ...profile, ...patch }, roles), { code: 'PROFILE_UNSUPPORTED' });
  }
});

test('drafts, unrelated roles and duplicate stable question IDs cannot fill a plan', () => {
  assert.throws(() => selectPlan(questions.map((q) => ({ ...q, status: 'draft' })), profile, roles), { code: 'BANK_INSUFFICIENT' });
  assert.throws(() => selectPlan(questions.map((q) => ({ ...q, role_slugs: ['data_engineer'] })), profile, roles), { code: 'BANK_INSUFFICIENT' });
  const short = questions.filter((q) => q.stage !== 'technical').concat(
    Array.from({ length: 8 }, (_, i) => ({ ...questions.find((q) => q.stage === 'technical'), id: `version-${i}` })));
  assert.throws(() => selectPlan(short, profile, roles), { code: 'BANK_INSUFFICIENT' });
});

test('seed remains unpublished, separates private concepts, and provides 0-4 scoring anchors', () => {
  const initialSql = fs.readFileSync(new URL('../supabase/migrations/202609270003_backend_question_drafts.sql', import.meta.url), 'utf8');
  const expansionSql = fs.readFileSync(new URL('../supabase/migrations/202609270005_question_bank_expansion.sql', import.meta.url), 'utf8');

  // Verify migrations insert questions with status = 'draft' and populate question_keys
  assert.match(initialSql, /'draft',q->>'followUp'/);
  assert.match(initialSql, /insert into public.question_keys/);
  assert.match(expansionSql, /'draft',\s*q->>'followUp'/);
  assert.match(expansionSql, /insert into public.question_keys/);

  // Verify all 48 questions have >= 3 concepts, prompts >= 50 chars, and 0-4 scoring anchors
  assert.ok(seed.every((q) => q.concepts.length >= 3 && q.prompt.length >= 50));
  assert.ok(seed.every((q) => q.anchors && Object.keys(q.anchors).length === 5));
});

test('constraint scenario data satisfies PRD requirements', () => {
  assert.ok(scenarios.length >= 6, `Must have at least 6 constraint scenarios, found ${scenarios.length}`);
  const seedIds = new Set(seed.map((q) => q.id));
  for (const s of scenarios) {
    assert.ok(seedIds.has(s.baselineQuestionId), `Scenario references unknown question: ${s.baselineQuestionId}`);
    assert.ok(s.changedConstraint && s.changedConstraint.length >= 20);
    assert.ok(s.followUp && s.followUp.length >= 10);
    assert.ok(s.expectedReasoningPoints && s.expectedReasoningPoints.length >= 2);
    assert.ok(s.rubricAnchors && Object.keys(s.rubricAnchors).length === 5);
  }
});

test('retry variants provide comparable question pairs across demo topics', () => {
  assert.ok(retryVariants.length >= 6, `Must have at least 6 retry variant pairs, found ${retryVariants.length}`);
  const seedIds = new Set(seed.map((q) => q.id));
  for (const v of retryVariants) {
    assert.ok(seedIds.has(v.primaryQuestionId));
    assert.ok(seedIds.has(v.variantQuestionId));
    assert.notEqual(v.primaryQuestionId, v.variantQuestionId);
    assert.ok(v.skillTested && v.skillTested.length >= 10);
  }
});
