import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedsDir = path.resolve(__dirname, '../supabase/seeds');
const questionsPath = path.join(seedsDir, 'backend-developer.questions.json');
const scenariosPath = path.join(seedsDir, 'constraint-scenarios.json');
const variantsPath = path.join(seedsDir, 'retry-variants.json');

console.log('--- PanelIQ Question Bank Validation (Task 5.A) ---\n');

// 1. Validate Base Questions
assert.ok(fs.existsSync(questionsPath), 'backend-developer.questions.json must exist');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

console.log(`1. Total Questions: ${questions.length}`);
assert.ok(questions.length >= 40 && questions.length <= 60, `Question count (${questions.length}) must be between 40 and 60`);

// Check ID and prompt uniqueness
const ids = new Set();
const prompts = new Set();
const allowedLevels = new Set(['junior', 'intermediate']);
const allowedStages = new Set(['icebreaker', 'technical', 'techno_managerial', 'reflection']);
const allowedTopics = new Set(['apis', 'databases', 'concurrency', 'reliability', 'project_tradeoffs']);

const levelCounts = { junior: 0, intermediate: 0 };
const stageCounts = { icebreaker: 0, technical: 0, techno_managerial: 0, reflection: 0 };
const topicCounts = {};
for (const t of allowedTopics) topicCounts[t] = 0;

let scoredWithAnchors = 0;

for (const q of questions) {
  assert.ok(q.id, 'Every question must have an id');
  assert.ok(!ids.has(q.id), `Duplicate question id found: ${q.id}`);
  ids.add(q.id);

  assert.ok(q.prompt && q.prompt.length >= 50, `Prompt for ${q.id} must be >= 50 characters`);
  assert.ok(!prompts.has(q.prompt), `Duplicate prompt found: ${q.id}`);
  prompts.add(q.prompt);

  assert.ok(allowedLevels.has(q.level), `Invalid level for ${q.id}: ${q.level}`);
  levelCounts[q.level]++;

  assert.ok(allowedStages.has(q.stage), `Invalid stage for ${q.id}: ${q.stage}`);
  stageCounts[q.stage]++;

  assert.ok(Array.isArray(q.topics) && q.topics.length > 0, `Topics missing or empty for ${q.id}`);
  for (const topic of q.topics) {
    assert.ok(allowedTopics.has(topic), `Unknown topic "${topic}" in ${q.id}`);
    topicCounts[topic]++;
  }

  assert.ok(Array.isArray(q.concepts) && q.concepts.length >= 3, `Expected at least 3 concepts for ${q.id}`);

  // Check 0-4 scoring anchors
  if (q.anchors) {
    for (let score = 0; score <= 4; score++) {
      assert.ok(q.anchors[score] && q.anchors[score].length > 10, `Anchor for score ${score} missing or too short in ${q.id}`);
    }
    scoredWithAnchors++;
  }
}

console.log('   Level breakdown:', JSON.stringify(levelCounts));
console.log('   Stage breakdown:', JSON.stringify(stageCounts));
console.log('   Topic mentions:', JSON.stringify(topicCounts));
console.log(`   Questions with 0-4 scoring anchors: ${scoredWithAnchors} / ${questions.length}`);
assert.equal(scoredWithAnchors, questions.length, 'Every question must have 0-4 scoring anchors');

// 2. Validate Constraint Scenarios
assert.ok(fs.existsSync(scenariosPath), 'constraint-scenarios.json must exist');
const scenarios = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));
console.log(`\n2. Constraint Scenarios: ${scenarios.length}`);
assert.ok(scenarios.length >= 6, `At least 6 constraint scenarios required, found ${scenarios.length}`);

const scenarioIds = new Set();
for (const s of scenarios) {
  assert.ok(s.id && !scenarioIds.has(s.id), `Duplicate or missing scenario id: ${s.id}`);
  scenarioIds.add(s.id);
  assert.ok(ids.has(s.baselineQuestionId), `Scenario ${s.id} references missing baseline question: ${s.baselineQuestionId}`);
  assert.ok(s.baselinePrompt && s.baselinePrompt.length > 20, `Missing baseline prompt in scenario ${s.id}`);
  assert.ok(s.changedConstraint && s.changedConstraint.length > 20, `Missing changed constraint in scenario ${s.id}`);
  assert.ok(s.followUp && s.followUp.length > 10, `Missing follow-up in scenario ${s.id}`);
  assert.ok(Array.isArray(s.expectedReasoningPoints) && s.expectedReasoningPoints.length >= 2, `Scenario ${s.id} needs >= 2 reasoning points`);
  assert.ok(s.rubricAnchors && Object.keys(s.rubricAnchors).length === 5, `Scenario ${s.id} must have 0-4 rubric anchors`);
}
console.log('   All constraint scenarios structurally valid with 0-4 anchors and valid baseline question links.');

// 3. Validate Retry Variants
assert.ok(fs.existsSync(variantsPath), 'retry-variants.json must exist');
const variants = JSON.parse(fs.readFileSync(variantsPath, 'utf8'));
console.log(`\n3. Retry Variants: ${variants.length} pairs`);
assert.ok(variants.length >= 6, `At least 6 retry variant pairs required, found ${variants.length}`);

for (const v of variants) {
  assert.ok(v.topic, 'Variant missing topic');
  assert.ok(ids.has(v.primaryQuestionId), `Variant references missing primary question: ${v.primaryQuestionId}`);
  assert.ok(ids.has(v.variantQuestionId), `Variant references missing variant question: ${v.variantQuestionId}`);
  assert.notEqual(v.primaryQuestionId, v.variantQuestionId, `Primary and variant cannot be identical: ${v.primaryQuestionId}`);
  assert.ok(v.skillTested && v.skillTested.length > 10, 'Missing skillTested in variant');
}
console.log('   All retry variant pairs reference valid, distinct questions from the bank.');

console.log('\nSUCCESS: All question bank data integrity checks PASSED.\n');
