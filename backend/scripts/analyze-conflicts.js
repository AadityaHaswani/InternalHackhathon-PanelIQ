import fs from 'node:fs';

const origSql = fs.readFileSync('supabase/migrations/202609270003_backend_question_drafts.sql', 'utf8');
const origMatch = origSql.match(/"id":\s*"([^"]+)"/g) || [];
const origIds = origMatch.map(m => m.match(/"id":\s*"([^"]+)"/)[1]);

const seed = JSON.parse(fs.readFileSync('supabase/seeds/backend-developer.questions.json', 'utf8'));
const seedIds = seed.map(q => q.id);

// Extract only the IDs inside the new_seed array of 202609270005
const expSql = fs.readFileSync('supabase/migrations/202609270005_question_bank_expansion.sql', 'utf8');
// Find lines matching "id": "..." within new_seed
const newSeedBlock = expSql.substring(expSql.indexOf('with new_seed as'), expSql.indexOf('inserted as'));
const expMatch = newSeedBlock.match(/"id":\s*"([^"]+)"/g) || [];
const expIds = expMatch.map(m => m.match(/"id":\s*"([^"]+)"/)[1]);

console.log('Original migration 202609270003 IDs count:', origIds.length);
console.log('Seed IDs count:', seedIds.length);
console.log('Expansion migration 202609270005 new_seed IDs count:', expIds.length);

const origSet = new Set(origIds);
const genuinelyNewInSeed = seedIds.filter(id => !origSet.has(id));
console.log('\nGenuinely new IDs in seed (not in 202609270003) - count:', genuinelyNewInSeed.length);
console.log(genuinelyNewInSeed);

const conflictingIdsInMigration = expIds.filter(id => origSet.has(id));
console.log('\nConflicting IDs in 202609270005 that were already in 202609270003 - count:', conflictingIdsInMigration.length);
console.log(conflictingIdsInMigration);

const nonConflictingIdsInMigration = expIds.filter(id => !origSet.has(id));
console.log('\nGenuinely new IDs currently in 202609270005 - count:', nonConflictingIdsInMigration.length);
console.log(nonConflictingIdsInMigration);
