import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const questions = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../supabase/seeds/backend-developer.questions.json'), 'utf8'));

// Read original question IDs from 202609270003_backend_question_drafts.sql
const origSql = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/202609270003_backend_question_drafts.sql'), 'utf8');
const origMatch = origSql.match(/"id":\s*"([^"]+)"/g) || [];
const origIds = new Set(origMatch.map(m => m.match(/"id":\s*"([^"]+)"/)[1]));

// Partition into existing (32) and genuinely new (16) questions
const existingQuestions = questions.filter(q => origIds.has(q.id));
const newQuestions = questions.filter(q => !origIds.has(q.id));

if (existingQuestions.length !== 32) {
  throw new Error(`Expected 32 existing questions matching migration 0003, found ${existingQuestions.length}`);
}
if (newQuestions.length !== 16) {
  throw new Error(`Expected 16 new questions to expand bank to 48, found ${newQuestions.length}`);
}

function formatAnchors(anchors, rubricNotes) {
  if (!anchors) return rubricNotes || '';
  const lines = [
    rubricNotes ? `${rubricNotes}\n` : '',
    'Scoring Anchors (0-4 Scale):',
    `0: ${anchors[0]}`,
    `1: ${anchors[1]}`,
    `2: ${anchors[2]}`,
    `3: ${anchors[3]}`,
    `4: ${anchors[4]}`
  ];
  return lines.join('\n').trim();
}

const escapeSql = (str) => str.replace(/'/g, "''");

let sql = `-- Additive Question Bank Expansion Migration (Task 5.A)
-- File: supabase/migrations/202609270005_question_bank_expansion.sql
-- Expands the question bank from 32 to 48 reviewed-ready base questions.
-- Adds 16 genuinely new draft questions (8 Junior, 8 Intermediate) across all required stages and topics,
-- and enriches existing draft question keys with concrete 0-4 scoring anchors.
-- Safe and idempotent: does not touch or overwrite published records.
begin;

-- 1. Insert 16 genuinely new question drafts
with new_seed as (
  select value as q from jsonb_array_elements($seed$${JSON.stringify(newQuestions, null, 2)}$seed$::jsonb)
), inserted as (
  insert into public.question_versions
    (question_id, version, prompt, domain, experience_level, stage, panel_role, topics, role_slugs, difficulty, status, reviewed_follow_up)
  select
    q->>'id',
    1,
    q->>'prompt',
    'computer_science',
    q->>'level',
    q->>'stage',
    case q->>'stage'
      when 'technical' then 'technical'
      when 'techno_managerial' then 'project'
      else 'chair'
    end,
    array(select jsonb_array_elements_text(q->'topics')),
    array['backend_developer'],
    case q->>'level' when 'junior' then 1 else 2 end,
    'draft',
    q->>'followUp'
  from new_seed
  where not exists (
    select 1 from public.question_versions existing
    where existing.question_id = (new_seed.q->>'id')
      and existing.version = 1
  )
  on conflict (question_id, version) do nothing
  returning id, question_id
)
insert into public.question_keys (question_version_id, expected_concepts, rubric_notes)
select
  inserted.id,
  array(select jsonb_array_elements_text(new_seed.q->'concepts')),
  case
    when new_seed.q->>'stage' in ('icebreaker', 'reflection') then
      concat(
        coalesce(new_seed.q->>'rubricNotes', 'Unscored context/reflection.'),
        E'\n\nScoring Guidance:\n0: ', coalesce(new_seed.q->'anchors'->>0, ''),
        E'\n1: ', coalesce(new_seed.q->'anchors'->>1, ''),
        E'\n2: ', coalesce(new_seed.q->'anchors'->>2, ''),
        E'\n3: ', coalesce(new_seed.q->'anchors'->>3, ''),
        E'\n4: ', coalesce(new_seed.q->'anchors'->>4, '')
      )
    else
      concat(
        coalesce(new_seed.q->>'rubricNotes', 'Technical scoring guidance.'),
        E'\n\nScoring Anchors (0-4 Scale):\n0: ', coalesce(new_seed.q->'anchors'->>0, ''),
        E'\n1: ', coalesce(new_seed.q->'anchors'->>1, ''),
        E'\n2: ', coalesce(new_seed.q->'anchors'->>2, ''),
        E'\n3: ', coalesce(new_seed.q->'anchors'->>3, ''),
        E'\n4: ', coalesce(new_seed.q->'anchors'->>4, '')
      )
  end
from inserted
join new_seed on new_seed.q->>'id' = inserted.question_id
on conflict (question_version_id) do nothing;

-- 2. Update rubric notes for the original 32 draft questions to include 0-4 scoring anchors.
-- Note: 'and v.status = ''draft''' ensures published questions are never modified,
-- preventing trigger violations on immutable published records.
`;

for (const q of existingQuestions) {
  const formatted = escapeSql(formatAnchors(q.anchors, q.rubricNotes));
  sql += `
update public.question_keys k
set rubric_notes = '${formatted}'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = '${q.id}' and v.status = 'draft';
`;
}

sql += `
commit;
`;

fs.writeFileSync(path.resolve(__dirname, '../supabase/migrations/202609270005_question_bank_expansion.sql'), sql);
console.log(`Generated migration supabase/migrations/202609270005_question_bank_expansion.sql with ${newQuestions.length} genuinely new questions and 32 existing draft updates.`);
