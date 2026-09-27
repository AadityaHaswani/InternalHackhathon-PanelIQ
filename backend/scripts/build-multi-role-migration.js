import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FRONTEND_QUESTIONS } from './questions-data/frontend-engineer.data.js';
import { FULL_STACK_QUESTIONS } from './questions-data/full-stack-engineer.data.js';
import { SYSTEM_DESIGN_QUESTIONS } from './questions-data/system-design-engineer.data.js';
import { DEVOPS_QUESTIONS } from './questions-data/devops-cloud-engineer.data.js';
import { DATA_ENGINEER_QUESTIONS } from './questions-data/data-engineer.data.js';
import { QA_AUTOMATION_QUESTIONS } from './questions-data/qa-automation-engineer.data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedsDir = path.resolve(__dirname, '../supabase/seeds');
const migrationsDir = path.resolve(__dirname, '../supabase/migrations');

// ============================================================================
// 1. ROLES DEFINITIONS (6 New Roles + 1 Existing Backend Developer)
// ============================================================================

export const NEW_ROLES = [
  { slug: 'frontend_engineer', domain: 'computer_science', label: 'Frontend Engineer' },
  { slug: 'full_stack_engineer', domain: 'computer_science', label: 'Full Stack Engineer' },
  { slug: 'system_design_engineer', domain: 'computer_science', label: 'System Design Engineer' },
  { slug: 'devops_cloud_engineer', domain: 'computer_science', label: 'DevOps / Cloud Engineer' },
  { slug: 'data_engineer', domain: 'computer_science', label: 'Data Engineer' },
  { slug: 'qa_automation_engineer', domain: 'computer_science', label: 'QA / Automation Engineer' },
];

// ============================================================================
// 2. REALISTIC EVALUATORS DIRECTORY (Natural Indian Identities)
// ============================================================================

export const SEED_EVALUATORS = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    displayName: 'Dr. Priya Sharma',
    email: 'priya.sharma@paneliq.test',
    role: 'evaluator',
    targetRole: 'system_design_engineer',
    experienceLevel: 'intermediate',
    specialization: 'Distributed Systems & Scalability Architecture',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    displayName: 'Rahul Mehta',
    email: 'rahul.mehta@paneliq.test',
    role: 'evaluator',
    targetRole: 'backend_developer',
    experienceLevel: 'intermediate',
    specialization: 'High-Throughput APIs & Database Engineering',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    displayName: 'Ananya Kulkarni',
    email: 'ananya.kulkarni@paneliq.test',
    role: 'evaluator',
    targetRole: 'frontend_engineer',
    experienceLevel: 'intermediate',
    specialization: 'Modern Frontend Architecture & State Machines',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000004',
    displayName: 'Rohan Desai',
    email: 'rohan.desai@paneliq.test',
    role: 'evaluator',
    targetRole: 'full_stack_engineer',
    experienceLevel: 'intermediate',
    specialization: 'End-to-End Web Systems & Cross-Tier Security',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000005',
    displayName: 'Neha Iyer',
    email: 'neha.iyer@paneliq.test',
    role: 'evaluator',
    targetRole: 'data_engineer',
    experienceLevel: 'intermediate',
    specialization: 'Large-Scale Batch/Streaming & Lakehouse Modeling',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000006',
    displayName: 'Arjun Nair',
    email: 'arjun.nair@paneliq.test',
    role: 'evaluator',
    targetRole: 'devops_cloud_engineer',
    experienceLevel: 'intermediate',
    specialization: 'Kubernetes Platform Reliability & Cloud Native SRE',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000007',
    displayName: 'Sneha Joshi',
    email: 'sneha.joshi@paneliq.test',
    role: 'evaluator',
    targetRole: 'qa_automation_engineer',
    experienceLevel: 'intermediate',
    specialization: 'Test Architecture, E2E Automation & Quality Gates',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000008',
    displayName: 'Vikram Shah',
    email: 'vikram.shah@paneliq.test',
    role: 'evaluator',
    targetRole: 'system_design_engineer',
    experienceLevel: 'intermediate',
    specialization: 'Resilient Microservices & Disaster Recovery',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000009',
    displayName: 'Kavita Raman',
    email: 'kavita.raman@paneliq.test',
    role: 'evaluator',
    targetRole: 'frontend_engineer',
    experienceLevel: 'intermediate',
    specialization: 'Core Web Vitals, Rendering Performance & Design Systems',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000010',
    displayName: 'Amitabh Sen',
    email: 'amitabh.sen@paneliq.test',
    role: 'evaluator',
    targetRole: 'full_stack_engineer',
    experienceLevel: 'intermediate',
    specialization: 'Event-Driven Full Stack Systems & GraphQL/REST APIs',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000011',
    displayName: 'Meera Nambiar',
    email: 'meera.nambiar@paneliq.test',
    role: 'evaluator',
    targetRole: 'data_engineer',
    experienceLevel: 'intermediate',
    specialization: 'Distributed SQL Engines, Spark & Data Warehousing',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000012',
    displayName: 'Suresh Pillai',
    email: 'suresh.pillai@paneliq.test',
    role: 'evaluator',
    targetRole: 'devops_cloud_engineer',
    experienceLevel: 'intermediate',
    specialization: 'Infrastructure as Code, CI/CD Security & Observability',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000013',
    displayName: 'Divya Agarwal',
    email: 'divya.agarwal@paneliq.test',
    role: 'evaluator',
    targetRole: 'qa_automation_engineer',
    experienceLevel: 'intermediate',
    specialization: 'Performance Testing, Load Simulation & Contract Testing',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000014',
    displayName: 'Rajesh Venkat',
    email: 'rajesh.venkat@paneliq.test',
    role: 'evaluator',
    targetRole: 'backend_developer',
    experienceLevel: 'intermediate',
    specialization: 'Distributed Consensus & High-Concurrency Systems',
  },
];

// ============================================================================
// 3. AGGREGATE ALL NEW QUESTIONS (6 Roles × 20 = 120 Questions)
// ============================================================================

export const ROLE_QUESTION_SETS = [
  { role: 'frontend_engineer', file: 'frontend-engineer.questions.json', questions: FRONTEND_QUESTIONS },
  { role: 'full_stack_engineer', file: 'full-stack-engineer.questions.json', questions: FULL_STACK_QUESTIONS },
  { role: 'system_design_engineer', file: 'system-design-engineer.questions.json', questions: SYSTEM_DESIGN_QUESTIONS },
  { role: 'devops_cloud_engineer', file: 'devops-cloud-engineer.questions.json', questions: DEVOPS_QUESTIONS },
  { role: 'data_engineer', file: 'data-engineer.questions.json', questions: DATA_ENGINEER_QUESTIONS },
  { role: 'qa_automation_engineer', file: 'qa-automation-engineer.questions.json', questions: QA_AUTOMATION_QUESTIONS },
];

export const ALL_NEW_QUESTIONS = ROLE_QUESTION_SETS.flatMap((s) => s.questions);

// Helper function to build SQL migration string
function generateMigrationSQL() {
  const sqlLines = [];

  sqlLines.push('-- ============================================================================');
  sqlLines.push('-- Migration: 202609270009_multi_role_expansion_and_evaluators.sql');
  sqlLines.push('-- Multi-Role Interview Platform Expansion (6 New Roles, 120 Questions, 14 Evaluators)');
  sqlLines.push('-- Adds: Frontend, Full Stack, System Design, DevOps, Data, QA');
  sqlLines.push('-- Safe, deterministic, and idempotent. Preserves existing Backend Developer data.');
  sqlLines.push('-- ============================================================================');
  sqlLines.push('');
  sqlLines.push('begin;');
  sqlLines.push('');

  // 1. Insert new interview roles
  sqlLines.push('-- 1. Register 6 new interview roles in public.interview_roles');
  sqlLines.push('insert into public.interview_roles (slug, domain, label, active)');
  sqlLines.push('values');
  NEW_ROLES.forEach((r, idx) => {
    const isLast = idx === NEW_ROLES.length - 1;
    sqlLines.push(`  ('${r.slug}', '${r.domain}', '${r.label}', true)${isLast ? '' : ','}`);
  });
  sqlLines.push('on conflict (slug) do update set');
  sqlLines.push('  domain = excluded.domain,');
  sqlLines.push('  label = excluded.label,');
  sqlLines.push('  active = excluded.active;');
  sqlLines.push('');

  // 2. Insert evaluators
  sqlLines.push('-- 2. Seed realistic evaluators (natural Indian identities) into auth.users, profiles, and user_roles');
  sqlLines.push('insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)');
  sqlLines.push('values');
  SEED_EVALUATORS.forEach((ev, idx) => {
    const isLast = idx === SEED_EVALUATORS.length - 1;
    const meta = JSON.stringify({ display_name: ev.displayName, specialization: ev.specialization });
    sqlLines.push(`  ('${ev.id}', 'authenticated', 'authenticated', '${ev.email}', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '${meta}'::jsonb, now(), now())${isLast ? '' : ','}`);
  });
  sqlLines.push('on conflict (id) do update set');
  sqlLines.push('  email = excluded.email,');
  sqlLines.push('  raw_user_meta_data = excluded.raw_user_meta_data,');
  sqlLines.push('  updated_at = now();');
  sqlLines.push('');

  sqlLines.push('insert into public.profiles (user_id, display_name, domain, experience_level, target_role, created_at, updated_at)');
  sqlLines.push('values');
  SEED_EVALUATORS.forEach((ev, idx) => {
    const isLast = idx === SEED_EVALUATORS.length - 1;
    sqlLines.push(`  ('${ev.id}', '${ev.displayName}', 'computer_science', '${ev.experienceLevel}', '${ev.targetRole}', now(), now())${isLast ? '' : ','}`);
  });
  sqlLines.push('on conflict (user_id) do update set');
  sqlLines.push('  display_name = excluded.display_name,');
  sqlLines.push('  domain = excluded.domain,');
  sqlLines.push('  experience_level = excluded.experience_level,');
  sqlLines.push('  target_role = excluded.target_role,');
  sqlLines.push('  updated_at = now();');
  sqlLines.push('');

  sqlLines.push('insert into public.user_roles (user_id, role, created_at)');
  sqlLines.push('values');
  SEED_EVALUATORS.forEach((ev, idx) => {
    const isLast = idx === SEED_EVALUATORS.length - 1;
    sqlLines.push(`  ('${ev.id}', '${ev.role}', now())${isLast ? '' : ','}`);
  });
  sqlLines.push('on conflict (user_id, role) do nothing;');
  sqlLines.push('');
  // 3. Insert 120 new questions & question_keys
  sqlLines.push('-- 3. Seed 120 curated questions across the 6 new roles into question_versions & question_keys');
  sqlLines.push('-- CTE-based, trigger-safe, and idempotent: versions are created in draft so question_key_immutable');
  sqlLines.push('-- trigger permits attaching keys, then drafts are published. Zero temp tables used.');
  sqlLines.push('with new_seed as (');
  sqlLines.push('  select value as q from jsonb_array_elements($seed$' + JSON.stringify(ALL_NEW_QUESTIONS, null, 2) + '$seed$::jsonb)');
  sqlLines.push('), inserted_versions as (');
  sqlLines.push('  insert into public.question_versions');
  sqlLines.push('    (question_id, version, prompt, domain, experience_level, stage, panel_role, topics, role_slugs, difficulty, status, reviewed_follow_up)');
  sqlLines.push('  select');
  sqlLines.push("    q->>'id',");
  sqlLines.push('    1,');
  sqlLines.push("    q->>'prompt',");
  sqlLines.push("    'computer_science',");
  sqlLines.push("    q->>'level',");
  sqlLines.push("    q->>'stage',");
  sqlLines.push("    case q->>'stage'");
  sqlLines.push("      when 'technical' then 'technical'");
  sqlLines.push("      when 'techno_managerial' then 'project'");
  sqlLines.push("      else 'chair'");
  sqlLines.push('    end,');
  sqlLines.push("    array(select jsonb_array_elements_text(q->'topics')),");
  sqlLines.push("    array[q->>'role'],");
  sqlLines.push("    case q->>'level' when 'junior' then 1 else 2 end,");
  sqlLines.push("    'draft',");
  sqlLines.push("    q->>'followUp'");
  sqlLines.push('  from new_seed');
  sqlLines.push('  where not exists (');
  sqlLines.push('    select 1 from public.question_versions existing');
  sqlLines.push("    where existing.question_id = (new_seed.q->>'id')");
  sqlLines.push('      and existing.version = 1');
  sqlLines.push('  )');
  sqlLines.push('  on conflict (question_id, version) do nothing');
  sqlLines.push('  returning id, question_id');
  sqlLines.push('), target_versions as (');
  sqlLines.push('  select id, question_id from inserted_versions');
  sqlLines.push('  union all');
  sqlLines.push('  select v.id, v.question_id');
  sqlLines.push('  from public.question_versions v');
  sqlLines.push('  join new_seed on (new_seed.q->>\'id\') = v.question_id');
  sqlLines.push('  where v.version = 1');
  sqlLines.push("    and v.status = 'draft'");
  sqlLines.push('    and not exists (');
  sqlLines.push('      select 1 from public.question_keys k where k.question_version_id = v.id');
  sqlLines.push('    )');
  sqlLines.push(')');
  sqlLines.push('insert into public.question_keys (question_version_id, expected_concepts, rubric_notes)');
  sqlLines.push('select');
  sqlLines.push('  tv.id,');
  sqlLines.push("  array(select jsonb_array_elements_text(new_seed.q->'concepts')),");
  sqlLines.push('  case');
  sqlLines.push("    when new_seed.q->>'stage' in ('icebreaker', 'reflection') then");
  sqlLines.push('      concat(');
  sqlLines.push("        coalesce(new_seed.q->>'rubricNotes', 'Unscored context/reflection.'),");
  sqlLines.push("        E'\\n\\nScoring Guidance:\\n0: ', coalesce(new_seed.q->'anchors'->>0, ''),");
  sqlLines.push("        E'\\n1: ', coalesce(new_seed.q->'anchors'->>1, ''),");
  sqlLines.push("        E'\\n2: ', coalesce(new_seed.q->'anchors'->>2, ''),");
  sqlLines.push("        E'\\n3: ', coalesce(new_seed.q->'anchors'->>3, ''),");
  sqlLines.push("        E'\\n4: ', coalesce(new_seed.q->'anchors'->>4, '')");
  sqlLines.push('      )');
  sqlLines.push('    else');
  sqlLines.push('      concat(');
  sqlLines.push("        coalesce(new_seed.q->>'rubricNotes', 'Technical scoring guidance.'),");
  sqlLines.push("        E'\\n\\nScoring Anchors (0-4 Scale):\\n0: ', coalesce(new_seed.q->'anchors'->>0, ''),");
  sqlLines.push("        E'\\n1: ', coalesce(new_seed.q->'anchors'->>1, ''),");
  sqlLines.push("        E'\\n2: ', coalesce(new_seed.q->'anchors'->>2, ''),");
  sqlLines.push("        E'\\n3: ', coalesce(new_seed.q->'anchors'->>3, ''),");
  sqlLines.push("        E'\\n4: ', coalesce(new_seed.q->'anchors'->>4, '')");
  sqlLines.push('      )');
  sqlLines.push('  end');
  sqlLines.push('from target_versions tv');
  sqlLines.push("join new_seed on (new_seed.q->>'id') = tv.question_id");
  sqlLines.push('on conflict (question_version_id) do nothing;');
  sqlLines.push('');
  sqlLines.push('-- 4. Publish reviewed draft questions for the 6 new roles');
  sqlLines.push('-- protect_question_version() permits draft -> published updates with reviewer and timestamp.');
  sqlLines.push('-- Only touches unreviewed drafts belonging to the 6 newly added roles.');
  sqlLines.push('update public.question_versions');
  sqlLines.push('set');
  sqlLines.push("  status = 'published',");
  sqlLines.push("  reviewed_by = coalesce(nullif(btrim(reviewed_by), ''), 'lead_content_reviewer'),");
  sqlLines.push('  reviewed_at = coalesce(reviewed_at, now())');
  sqlLines.push("where status = 'draft'");
  sqlLines.push("  and domain = 'computer_science'");
  sqlLines.push('  and role_slugs && array[');
  sqlLines.push("    'frontend_engineer',");
  sqlLines.push("    'full_stack_engineer',");
  sqlLines.push("    'system_design_engineer',");
  sqlLines.push("    'devops_cloud_engineer',");
  sqlLines.push("    'data_engineer',");
  sqlLines.push("    'qa_automation_engineer'");
  sqlLines.push('  ]::text[];');
  sqlLines.push('');
  sqlLines.push('commit;');
  sqlLines.push('');

  return sqlLines.join('\n');
}

// ============================================================================
// 4. WRITE SEED JSON FILES & MIGRATION SQL
// ============================================================================

export function buildArtifacts() {
  if (!fs.existsSync(seedsDir)) {
    fs.mkdirSync(seedsDir, { recursive: true });
  }
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  // 1. Write individual role question seeds
  for (const set of ROLE_QUESTION_SETS) {
    const filePath = path.join(seedsDir, set.file);
    fs.writeFileSync(filePath, JSON.stringify(set.questions, null, 2), 'utf8');
    console.log(`[SEED] Wrote ${set.questions.length} questions to ${set.file}`);
  }

  // 2. Write combined multi-role questions seed
  const combinedPath = path.join(seedsDir, 'multi-role.questions.json');
  fs.writeFileSync(combinedPath, JSON.stringify(ALL_NEW_QUESTIONS, null, 2), 'utf8');
  console.log(`[SEED] Wrote combined ${ALL_NEW_QUESTIONS.length} questions to multi-role.questions.json`);

  // 3. Write evaluators seed
  const evaluatorsPath = path.join(seedsDir, 'evaluators.json');
  fs.writeFileSync(evaluatorsPath, JSON.stringify(SEED_EVALUATORS, null, 2), 'utf8');
  console.log(`[SEED] Wrote ${SEED_EVALUATORS.length} evaluators to evaluators.json`);

  // 4. Write SQL Migration
  const migrationPath = path.join(migrationsDir, '202609270009_multi_role_expansion_and_evaluators.sql');
  const migrationSQL = generateMigrationSQL();
  fs.writeFileSync(migrationPath, migrationSQL, 'utf8');
  console.log(`[MIGRATION] Generated ${migrationPath} (${Buffer.byteLength(migrationSQL, 'utf8')} bytes)`);
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildArtifacts();
}
