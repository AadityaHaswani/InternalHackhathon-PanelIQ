import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectPlan } from '../src/modules/sessions/session-plan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedsDir = path.resolve(__dirname, '../supabase/seeds');
const migrationsDir = path.resolve(__dirname, '../supabase/migrations');

const ALL_ROLES = [
  { slug: 'backend_developer', domain: 'computer_science', label: 'Backend Developer', active: true },
  { slug: 'frontend_engineer', domain: 'computer_science', label: 'Frontend Engineer', active: true },
  { slug: 'full_stack_engineer', domain: 'computer_science', label: 'Full Stack Engineer', active: true },
  { slug: 'system_design_engineer', domain: 'computer_science', label: 'System Design Engineer', active: true },
  { slug: 'devops_cloud_engineer', domain: 'computer_science', label: 'DevOps / Cloud Engineer', active: true },
  { slug: 'data_engineer', domain: 'computer_science', label: 'Data Engineer', active: true },
  { slug: 'qa_automation_engineer', domain: 'computer_science', label: 'QA / Automation Engineer', active: true },
];

const NEW_ROLE_FILES = [
  { role: 'frontend_engineer', file: 'frontend-engineer.questions.json' },
  { role: 'full_stack_engineer', file: 'full-stack-engineer.questions.json' },
  { role: 'system_design_engineer', file: 'system-design-engineer.questions.json' },
  { role: 'devops_cloud_engineer', file: 'devops-cloud-engineer.questions.json' },
  { role: 'data_engineer', file: 'data-engineer.questions.json' },
  { role: 'qa_automation_engineer', file: 'qa-automation-engineer.questions.json' },
];

test('multi-role question bank contains exactly 120 new questions (20 per role) with 10 junior + 10 intermediate', () => {
  const backendSeedPath = path.join(seedsDir, 'backend-developer.questions.json');
  assert.ok(fs.existsSync(backendSeedPath));
  const backendQuestions = JSON.parse(fs.readFileSync(backendSeedPath, 'utf8'));
  assert.equal(backendQuestions.length, 48);

  const seenIds = new Set(backendQuestions.map((q) => q.id));
  const seenPrompts = new Set(backendQuestions.map((q) => q.prompt));
  const allowedTopics = new Set(['apis', 'databases', 'concurrency', 'reliability', 'project_tradeoffs']);
  const allowedStages = new Set(['icebreaker', 'technical', 'techno_managerial', 'reflection']);

  let totalNew = 0;

  for (const { role, file } of NEW_ROLE_FILES) {
    const filePath = path.join(seedsDir, file);
    assert.ok(fs.existsSync(filePath), `Seed file ${file} exists`);
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.equal(questions.length, 20, `${role} has 20 questions`);
    totalNew += questions.length;

    let jrCount = 0;
    let intCount = 0;

    for (const q of questions) {
      assert.ok(!seenIds.has(q.id), `ID ${q.id} must be unique across the bank`);
      seenIds.add(q.id);

      assert.ok(q.prompt && q.prompt.length >= 50, `Prompt in ${q.id} must be >= 50 chars`);
      assert.ok(!seenPrompts.has(q.prompt), `Prompt in ${q.id} must be unique`);
      seenPrompts.add(q.prompt);

      assert.ok(allowedStages.has(q.stage), `Stage ${q.stage} is valid`);
      assert.ok(Array.isArray(q.topics) && q.topics.length > 0);
      for (const t of q.topics) {
        assert.ok(allowedTopics.has(t), `Topic ${t} is an allowed database topic`);
      }

      assert.ok(Array.isArray(q.concepts) && q.concepts.length >= 3);
      assert.ok(q.anchors && typeof q.anchors === 'object');
      for (let s = 0; s <= 4; s++) {
        assert.ok(q.anchors[s] && q.anchors[s].length > 10, `Anchor ${s} in ${q.id} is populated`);
      }

      if (q.level === 'junior') jrCount++;
      if (q.level === 'intermediate') intCount++;
    }

    assert.equal(jrCount, 10, `${role} has exactly 10 Junior questions`);
    assert.equal(intCount, 10, `${role} has exactly 10 Intermediate questions`);
  }

  assert.equal(totalNew, 120);
  assert.equal(backendQuestions.length + totalNew, 168);
});

test('evaluators directory contains realistic Indian identities with no placeholders', () => {
  const evaluatorsPath = path.join(seedsDir, 'evaluators.json');
  assert.ok(fs.existsSync(evaluatorsPath));
  const evaluators = JSON.parse(fs.readFileSync(evaluatorsPath, 'utf8'));
  assert.ok(evaluators.length >= 10);

  const forbiddenNameRegex = /(john\s*doe|jane\s*doe|test\s*evaluator|demo\s*evaluator|admin\s*user|evaluator\s*\d+)/i;
  for (const ev of evaluators) {
    assert.ok(!forbiddenNameRegex.test(ev.displayName), `Placeholder evaluator name detected: ${ev.displayName}`);
    assert.equal(ev.role, 'evaluator');
    assert.ok(ALL_ROLES.some((r) => r.slug === ev.targetRole));
    assert.ok(ev.specialization && ev.specialization.length > 10);
  }
});

test('migration 202609270009 exists, is valid SQL, and seeds all roles, evaluators and questions', () => {
  const migrationPath = path.join(migrationsDir, '202609270009_multi_role_expansion_and_evaluators.sql');
  assert.ok(fs.existsSync(migrationPath));
  const content = fs.readFileSync(migrationPath, 'utf8');

  assert.ok(content.startsWith('-- ============================================================================'));
  assert.ok(content.includes('insert into public.interview_roles'));
  assert.ok(content.includes('insert into auth.users'));
  assert.ok(content.includes('insert into public.profiles'));
  assert.ok(content.includes('insert into public.user_roles'));
  assert.ok(content.includes('insert into public.question_versions'));
  assert.ok(content.includes('insert into public.question_keys'));
  assert.ok(!content.includes('_multi_role_seed'), 'Migration must not use temporary table _multi_role_seed');
  assert.ok(!content.toLowerCase().includes('create temp'), 'Migration must not use CREATE TEMP TABLE');
  assert.ok(!content.toLowerCase().includes('create temporary table'), 'Migration must not use CREATE TEMPORARY TABLE');
  assert.ok(content.includes('commit;'));
});

test('session plan can be generated for all 7 roles across junior and intermediate levels', () => {
  const backendQuestions = JSON.parse(fs.readFileSync(path.join(seedsDir, 'backend-developer.questions.json'), 'utf8'));
  const multiRoleQuestions = JSON.parse(fs.readFileSync(path.join(seedsDir, 'multi-role.questions.json'), 'utf8'));

  const mockDbQuestions = [
    ...backendQuestions.map((q) => ({
      id: q.id,
      question_id: q.id,
      domain: 'computer_science',
      experience_level: q.level,
      stage: q.stage,
      topics: q.topics,
      role_slugs: ['backend_developer'],
      status: 'published',
    })),
    ...multiRoleQuestions.map((q) => ({
      id: q.id,
      question_id: q.id,
      domain: 'computer_science',
      experience_level: q.level,
      stage: q.stage,
      topics: q.topics,
      role_slugs: [q.role],
      status: 'published',
    })),
  ];

  for (const role of ALL_ROLES) {
    for (const level of ['junior', 'intermediate']) {
      const profile = {
        display_name: 'Test Candidate',
        domain: 'computer_science',
        experience_level: level,
        target_role: role.slug,
      };
      const plan = selectPlan(mockDbQuestions, profile, ALL_ROLES);
      assert.equal(plan.length, 8, `Session plan for ${role.slug} (${level}) has 8 questions`);
      assert.equal(new Set(plan).size, 8, `No duplicates in ${role.slug} (${level}) plan`);
    }
  }
});
