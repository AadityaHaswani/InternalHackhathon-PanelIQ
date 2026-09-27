import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { selectPlan, stagePlan } from '../src/modules/sessions/session-plan.js';

const seed = JSON.parse(fs.readFileSync(new URL('../supabase/seeds/backend-developer.questions.json', import.meta.url)));
// Test fixtures model publication AFTER human review. Real seeds stay draft.
const questions = seed.map((q) => ({ id: q.id, question_id: q.id, domain: 'computer_science',
  experience_level: q.level, stage: q.stage, topics: q.topics, role_slugs: ['backend_developer'], status: 'published' }));
const roles = [{ slug: 'backend_developer', domain: 'computer_science', label: 'Backend Developer' }];
const profile = { display_name: 'Demo', domain: 'computer_science', experience_level: 'junior', target_role: 'backend_developer' };

test('sample coverage supports two disjoint eight-turn plans for each level', () => {
  assert.equal(seed.length, 32);
  assert.equal(new Set(seed.map((q) => q.id)).size, 32);
  assert.equal(new Set(seed.map((q) => q.prompt)).size, 32);
  for (const level of ['junior', 'intermediate']) {
    let remaining = questions;
    for (let attempt = 0; attempt < 2; attempt++) {
      const ids = selectPlan(remaining, { ...profile, experience_level: level }, roles, () => 0);
      const plan = ids.map((id) => questions.find((q) => q.id === id));
      assert.deepEqual(plan.map((q) => q.stage), stagePlan);
      assert.equal(new Set(ids).size, 8);
      assert.ok(plan.every((q) => q.experience_level === level && q.domain === profile.domain && q.role_slugs.includes(profile.target_role)));
      remaining = remaining.filter((q) => !ids.includes(q.id));
    }
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

test('seed remains unpublished and separates private concepts from public versions', () => {
  const sql = fs.readFileSync(new URL('../supabase/migrations/202609270003_backend_question_drafts.sql', import.meta.url), 'utf8');
  const embedded = JSON.parse(sql.split('$seed$')[1]);
  assert.deepEqual(embedded, seed);
  assert.match(sql, /'draft',q->>'followUp'/);
  assert.match(sql, /insert into public.question_keys/);
  assert.ok(seed.every((q) => q.concepts.length >= 3 && q.prompt.length > 50));
});
