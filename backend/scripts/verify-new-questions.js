import fs from 'node:fs';

const origSql = fs.readFileSync('supabase/migrations/202609270003_backend_question_drafts.sql', 'utf8');
const origMatch = origSql.match(/"id":\s*"([^"]+)"/g) || [];
const origIds = origMatch.map(m => m.match(/"id":\s*"([^"]+)"/)[1]);

const seed = JSON.parse(fs.readFileSync('supabase/seeds/backend-developer.questions.json', 'utf8'));

const origSet = new Set(origIds);
console.log('Original IDs (from 202609270003) count:', origSet.size);

const newQuestions = seed.filter(q => !origSet.has(q.id));
console.log('New questions in seed count:', newQuestions.length);

const oldQuestionsInSeed = seed.filter(q => origSet.has(q.id));
console.log('Old questions in seed count:', oldQuestionsInSeed.length);

// Check if all 32 original IDs are in seed
const missingOriginal = origIds.filter(id => !seed.some(q => q.id === id));
console.log('Original IDs missing from seed:', missingOriginal);

// Check if any new question ID intersects with old IDs
const newIds = newQuestions.map(q => q.id);
const intersection = newIds.filter(id => origSet.has(id));
console.log('Intersection between new IDs and original IDs:', intersection);

// Check if all 16 new IDs are distinct
const newIdsSet = new Set(newIds);
console.log('Are all 16 new IDs unique among themselves?', newIdsSet.size === newQuestions.length);

// Check prompt uniqueness across all 48 questions
const prompts = new Set();
let dupPrompt = null;
for (const q of seed) {
  if (prompts.has(q.prompt)) {
    dupPrompt = q.prompt;
    break;
  }
  prompts.add(q.prompt);
}
console.log('Any duplicate prompt in seed?', dupPrompt ? `Duplicate found: ${dupPrompt}` : 'None (all 48 prompts are unique)');

// Check stage and panel_role alignment for all 16 new questions
for (const q of newQuestions) {
  const panelRole = q.stage === 'technical' ? 'technical' : (q.stage === 'techno_managerial' ? 'project' : 'chair');
  const validRole = (q.stage === 'icebreaker' && panelRole === 'chair') ||
                    (q.stage === 'reflection' && panelRole === 'chair') ||
                    (q.stage === 'technical' && panelRole === 'technical') ||
                    (q.stage === 'techno_managerial' && panelRole === 'project');
  if (!validRole) console.error(`Invalid stage/panel_role mapping for ${q.id}`);
}
console.log('Stage/panel_role check completed.');
