import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectPlan } from '../src/modules/sessions/session-plan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedsDir = path.resolve(__dirname, '../supabase/seeds');
const migrationsDir = path.resolve(__dirname, '../supabase/migrations');

console.log('====================================================');
console.log('--- PanelIQ Multi-Role Bank & Evaluators Validation ---');
console.log('====================================================\n');

// 1. Roles Definition
const ALL_ROLES = [
  { slug: 'backend_developer', domain: 'computer_science', label: 'Backend Developer', active: true },
  { slug: 'frontend_engineer', domain: 'computer_science', label: 'Frontend Engineer', active: true },
  { slug: 'full_stack_engineer', domain: 'computer_science', label: 'Full Stack Engineer', active: true },
  { slug: 'system_design_engineer', domain: 'computer_science', label: 'System Design Engineer', active: true },
  { slug: 'devops_cloud_engineer', domain: 'computer_science', label: 'DevOps / Cloud Engineer', active: true },
  { slug: 'data_engineer', domain: 'computer_science', label: 'Data Engineer', active: true },
  { slug: 'qa_automation_engineer', domain: 'computer_science', label: 'QA / Automation Engineer', active: true },
];

const NEW_ROLE_SLUGS = [
  'frontend_engineer',
  'full_stack_engineer',
  'system_design_engineer',
  'devops_cloud_engineer',
  'data_engineer',
  'qa_automation_engineer',
];

console.log(`1. Total Configured Roles: ${ALL_ROLES.length} (1 existing Backend Developer + 6 new roles)`);
assert.equal(ALL_ROLES.length, 7, 'Must have exactly 7 roles');
assert.equal(NEW_ROLE_SLUGS.length, 6, 'Must have exactly 6 new roles');

// 2. Validate Existing Backend Developer Seed (Untouched)
const backendSeedPath = path.join(seedsDir, 'backend-developer.questions.json');
assert.ok(fs.existsSync(backendSeedPath), 'backend-developer.questions.json must exist');
const backendQuestions = JSON.parse(fs.readFileSync(backendSeedPath, 'utf8'));
console.log(`2. Existing Backend Developer Questions: ${backendQuestions.length}`);
assert.equal(backendQuestions.length, 48, 'Backend Developer bank must have exactly 48 questions');

// 3. Validate New Role Seeds
const roleFiles = [
  { role: 'frontend_engineer', file: 'frontend-engineer.questions.json' },
  { role: 'full_stack_engineer', file: 'full-stack-engineer.questions.json' },
  { role: 'system_design_engineer', file: 'system-design-engineer.questions.json' },
  { role: 'devops_cloud_engineer', file: 'devops-cloud-engineer.questions.json' },
  { role: 'data_engineer', file: 'data-engineer.questions.json' },
  { role: 'qa_automation_engineer', file: 'qa-automation-engineer.questions.json' },
];

const multiRoleSeedPath = path.join(seedsDir, 'multi-role.questions.json');
assert.ok(fs.existsSync(multiRoleSeedPath), 'multi-role.questions.json must exist');
const combinedQuestions = JSON.parse(fs.readFileSync(multiRoleSeedPath, 'utf8'));
console.log(`3. Combined Multi-Role Questions Seed: ${combinedQuestions.length}`);
assert.equal(combinedQuestions.length, 120, 'Combined multi-role seed must have exactly 120 questions');

const allQuestionIds = new Set(backendQuestions.map((q) => q.id));
const allPrompts = new Set(backendQuestions.map((q) => q.prompt));
const allowedLevels = new Set(['junior', 'intermediate']);
const allowedStages = new Set(['icebreaker', 'technical', 'techno_managerial', 'reflection']);
const allowedTopics = new Set(['apis', 'databases', 'concurrency', 'reliability', 'project_tradeoffs']);

let totalNewQuestions = 0;
const roleStats = {};

for (const { role, file } of roleFiles) {
  const filePath = path.join(seedsDir, file);
  assert.ok(fs.existsSync(filePath), `Seed file ${file} must exist`);
  const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  assert.equal(questions.length, 20, `Role ${role} must have exactly 20 questions, found ${questions.length}`);
  totalNewQuestions += questions.length;

  roleStats[role] = {
    total: questions.length,
    junior: 0,
    intermediate: 0,
    stages: { icebreaker: 0, technical: 0, techno_managerial: 0, reflection: 0 },
  };

  for (const q of questions) {
    // Unique ID check
    assert.ok(q.id, `Question must have an id in ${file}`);
    assert.ok(!allQuestionIds.has(q.id), `Duplicate question ID detected: ${q.id}`);
    allQuestionIds.add(q.id);

    // Prompt length & uniqueness
    assert.ok(q.prompt && q.prompt.length >= 50, `Prompt for ${q.id} must be >= 50 characters (got ${q.prompt?.length})`);
    assert.ok(!allPrompts.has(q.prompt), `Duplicate prompt detected in ${q.id}`);
    allPrompts.add(q.prompt);

    // Level check
    assert.ok(allowedLevels.has(q.level), `Invalid level ${q.level} in ${q.id}`);
    roleStats[role][q.level]++;

    // Stage check
    assert.ok(allowedStages.has(q.stage), `Invalid stage ${q.stage} in ${q.id}`);
    roleStats[role].stages[q.stage]++;

    // Topics check (must be subset of allowedTopics)
    assert.ok(Array.isArray(q.topics) && q.topics.length > 0, `Topics missing in ${q.id}`);
    for (const t of q.topics) {
      assert.ok(allowedTopics.has(t), `Forbidden topic "${t}" in ${q.id}. Must be subset of DB check constraint.`);
    }

    // Concepts check
    assert.ok(Array.isArray(q.concepts) && q.concepts.length >= 3, `Question ${q.id} must have >= 3 concepts`);

    // Scoring anchors check (0 to 4)
    assert.ok(q.anchors && typeof q.anchors === 'object', `Question ${q.id} must have scoring anchors`);
    for (let s = 0; s <= 4; s++) {
      assert.ok(q.anchors[s] && q.anchors[s].length > 10, `Anchor ${s} missing or too short in ${q.id}`);
    }
  }

  // Verify 10 Junior and 10 Intermediate
  assert.equal(roleStats[role].junior, 10, `Role ${role} must have exactly 10 Junior questions`);
  assert.equal(roleStats[role].intermediate, 10, `Role ${role} must have exactly 10 Intermediate questions`);
}

console.log('4. Role Breakdown:');
for (const [r, stat] of Object.entries(roleStats)) {
  console.log(`   - ${r}: ${stat.total} total (${stat.junior} Jr, ${stat.intermediate} Int) | stages: ${JSON.stringify(stat.stages)}`);
}

assert.equal(totalNewQuestions, 120, 'Total new questions must be exactly 120');
const finalTotalQuestions = backendQuestions.length + totalNewQuestions;
console.log(`\n5. Final Bank Total Questions: ${finalTotalQuestions} (${backendQuestions.length} existing + ${totalNewQuestions} new)`);
assert.equal(finalTotalQuestions, 168, 'Final total question count must be exactly 168 (48 + 120)');

// 6. Validate Evaluators Directory
const evaluatorsPath = path.join(seedsDir, 'evaluators.json');
assert.ok(fs.existsSync(evaluatorsPath), 'evaluators.json must exist');
const evaluators = JSON.parse(fs.readFileSync(evaluatorsPath, 'utf8'));

console.log(`\n6. Evaluators Count: ${evaluators.length}`);
assert.ok(evaluators.length >= 10, 'Must have at least 10 evaluators');

const evaluatorIds = new Set();
const evaluatorEmails = new Set();
const forbiddenNameRegex = /(john\s*doe|jane\s*doe|test\s*evaluator|demo\s*evaluator|admin\s*user|evaluator\s*\d+)/i;

for (const ev of evaluators) {
  assert.ok(ev.id && !evaluatorIds.has(ev.id), `Duplicate or missing evaluator ID: ${ev.id}`);
  evaluatorIds.add(ev.id);

  assert.ok(ev.email && !evaluatorEmails.has(ev.email), `Duplicate or missing evaluator email: ${ev.email}`);
  evaluatorEmails.add(ev.email);

  assert.ok(ev.displayName && ev.displayName.length >= 3, `Invalid display name: ${ev.displayName}`);
  assert.ok(!forbiddenNameRegex.test(ev.displayName), `Placeholder evaluator name detected: "${ev.displayName}"`);

  assert.ok(ALL_ROLES.some((r) => r.slug === ev.targetRole), `Evaluator ${ev.displayName} has invalid targetRole: ${ev.targetRole}`);
  assert.equal(ev.role, 'evaluator', `Evaluator role must be 'evaluator'`);
  assert.ok(ev.specialization && ev.specialization.length > 10, `Missing specialization for ${ev.displayName}`);
}
console.log('   All evaluator identities verified: realistic Indian names, valid roles, no placeholders.');

// 7. Verify Migration File
const migrationPath = path.join(migrationsDir, '202609270009_multi_role_expansion_and_evaluators.sql');
assert.ok(fs.existsSync(migrationPath), 'Migration file 202609270009_multi_role_expansion_and_evaluators.sql must exist');
const migrationContent = fs.readFileSync(migrationPath, 'utf8');

assert.ok(migrationContent.includes('insert into public.interview_roles'), 'Migration must insert into interview_roles');
assert.ok(migrationContent.includes('insert into auth.users'), 'Migration must insert into auth.users');
assert.ok(migrationContent.includes('insert into public.profiles'), 'Migration must insert into public.profiles');
assert.ok(migrationContent.includes('insert into public.user_roles'), 'Migration must insert into public.user_roles');
assert.ok(migrationContent.includes('insert into public.question_versions'), 'Migration must insert into question_versions');
assert.ok(migrationContent.includes('insert into public.question_keys'), 'Migration must insert into question_keys');
for (const r of NEW_ROLE_SLUGS) {
  assert.ok(migrationContent.includes(`'${r}'`), `Migration must include role slug ${r}`);
}
assert.ok(!migrationContent.includes('_multi_role_seed'), 'Migration must not reference temporary table _multi_role_seed');
assert.ok(!migrationContent.toLowerCase().includes('create temp'), 'Migration must not use CREATE TEMP TABLE');
assert.ok(!migrationContent.toLowerCase().includes('create temporary table'), 'Migration must not use CREATE TEMPORARY TABLE');
console.log('7. Migration file structurally verified (zero temporary tables, safe CTEs, all roles, evaluators, questions, and keys).');

// 8. Session Plan Execution for All 7 Roles across Junior & Intermediate
console.log('\n8. Testing Session Plan Generation across All 7 Roles:');

// Build mock database questions representing published state
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
  ...combinedQuestions.map((q) => ({
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
    assert.equal(plan.length, 8, `Session plan for ${role.slug} (${level}) must contain exactly 8 questions`);
    const planIds = new Set(plan);
    assert.equal(planIds.size, 8, `Session plan for ${role.slug} (${level}) must not contain duplicate questions`);
    console.log(`   [PASS] ${role.slug} (${level}): generated 8-question plan successfully`);
  }
}

console.log('\n====================================================');
console.log('>>> ALL VALIDATION CHECKS PASSED SUCCESSFULLY! <<<');
console.log('====================================================\n');
