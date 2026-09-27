import fs from 'node:fs';

// Run only when editing the un-applied sample seed. Once applied, use a NEW migration.
const questions = JSON.parse(fs.readFileSync(new URL('../supabase/seeds/backend-developer.questions.json', import.meta.url)));
const sql = `-- AI-authored sample drafts; NOT human/expert-reviewed or published.
-- A named human must review prompts AND private concepts before publication.
begin;
with seed as (
  select value as q from jsonb_array_elements($seed$${JSON.stringify(questions, null, 2)}$seed$::jsonb)
), inserted as (
  insert into public.question_versions
    (question_id,version,prompt,domain,experience_level,stage,panel_role,topics,role_slugs,difficulty,status,reviewed_follow_up)
  select q->>'id',1,q->>'prompt','computer_science',q->>'level',q->>'stage',
    case q->>'stage' when 'technical' then 'technical' when 'techno_managerial' then 'project' else 'chair' end,
    array(select jsonb_array_elements_text(q->'topics')),array['backend_developer'],
    case q->>'level' when 'junior' then 1 else 2 end,'draft',q->>'followUp'
  from seed returning id,question_id
)
insert into public.question_keys (question_version_id,expected_concepts,rubric_notes)
select inserted.id,array(select jsonb_array_elements_text(seed.q->'concepts')),
  case when seed.q->>'stage' in ('icebreaker','reflection')
    then 'Unscored context/reflection. Accept honest uncertainty; do not infer personality or employability.'
    else 'Draft guidance only. Look for the listed concepts in a coherent explanation; accept other technically sound approaches. Human review required; no scoring implemented.' end
from inserted join seed on seed.q->>'id' = inserted.question_id;
commit;
`;
fs.writeFileSync(new URL('../supabase/migrations/202609270003_backend_question_drafts.sql', import.meta.url), sql);
console.log(`Generated ${questions.length} unpublished sample drafts`);
