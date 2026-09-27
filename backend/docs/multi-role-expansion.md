# PanelIQ Multi-Role Expansion & Seed Guide

This document details the expansion of the PanelIQ question bank and evaluator directory from a single-role (`backend_developer`) platform into a realistic, production-ready **multi-role interview platform**.

---

## 1. Role Catalog (7 Roles Total)

All roles belong to domain `computer_science` in `public.interview_roles` and are selectable in candidate profile settings and onboarding.

| Role Slug | Display Label | Experience Levels | Total Questions |
| :--- | :--- | :--- | :--- |
| `backend_developer` | Backend Developer *(existing)* | Junior, Intermediate | 48 *(untouched)* |
| `frontend_engineer` | Frontend Engineer *(new)* | Junior, Intermediate | 20 (10 Jr / 10 Int) |
| `full_stack_engineer` | Full Stack Engineer *(new)* | Junior, Intermediate | 20 (10 Jr / 10 Int) |
| `system_design_engineer` | System Design Engineer *(new)* | Junior, Intermediate | 20 (10 Jr / 10 Int) |
| `devops_cloud_engineer` | DevOps / Cloud Engineer *(new)* | Junior, Intermediate | 20 (10 Jr / 10 Int) |
| `data_engineer` | Data Engineer *(new)* | Junior, Intermediate | 20 (10 Jr / 10 Int) |
| `qa_automation_engineer` | QA / Automation Engineer *(new)* | Junior, Intermediate | 20 (10 Jr / 10 Int) |
| **Total** | | | **168 questions** |

---

## 2. Question Distribution per New Role

Each of the 6 new roles contains exactly **20 reviewed-ready questions** with the following stage and level distribution:

- **10 Junior Questions:**
  - 1 Icebreaker (`chair` panel role)
  - 5 Technical (`technical` panel role)
  - 3 Techno-Managerial (`project` panel role)
  - 1 Reflection (`chair` panel role)
- **10 Intermediate Questions:**
  - 1 Icebreaker (`chair` panel role)
  - 5 Technical (`technical` panel role)
  - 3 Techno-Managerial (`project` panel role)
  - 1 Reflection (`chair` panel role)
- **Total per Role:** 20 questions (2 Icebreaker, 10 Technical, 6 Techno-Managerial, 2 Reflection).

### Schema Adherence & Metadata Quality
- **Topics Constraint:** Strictly belongs to `array['apis', 'databases', 'concurrency', 'reliability', 'project_tradeoffs']` (enforced by DB check constraint).
- **Prompt Length:** All prompts are $\ge$ 50 characters, realistic, and unique across the bank.
- **Expected Concepts:** Every question contains $\ge$ 3 explicit evaluation concepts in `question_keys.expected_concepts`.
- **Scoring Anchors:** 100% of questions include concrete, observable `0`, `1`, `2`, `3`, and `4` scoring rubric anchors formatted directly in `question_keys.rubric_notes`.
- **Session Plan Compatibility:** Every role and level has sufficient depth to generate 8-turn interview sessions via `selectPlan` without running out of stage or topic alternatives.

---

## 3. Seed Evaluator Directory (Natural Indian Identities)

Fourteen realistic evaluators are seeded into `auth.users`, `public.profiles`, and `public.user_roles` with `role = 'evaluator'`. No generic placeholder names (e.g. John Doe, Test Evaluator) are used.

| Evaluator Name | Target Role / Domain | Specialization | Seed User ID |
| :--- | :--- | :--- | :--- |
| **Dr. Priya Sharma** | `system_design_engineer` | Distributed Systems & Scalability Architecture | `e0000000-0000-0000-0000-000000000001` |
| **Rahul Mehta** | `backend_developer` | High-Throughput APIs & Database Engineering | `e0000000-0000-0000-0000-000000000002` |
| **Ananya Kulkarni** | `frontend_engineer` | Modern Frontend Architecture & State Machines | `e0000000-0000-0000-0000-000000000003` |
| **Rohan Desai** | `full_stack_engineer` | End-to-End Web Systems & Cross-Tier Security | `e0000000-0000-0000-0000-000000000004` |
| **Neha Iyer** | `data_engineer` | Large-Scale Batch/Streaming & Lakehouse Modeling | `e0000000-0000-0000-0000-000000000005` |
| **Arjun Nair** | `devops_cloud_engineer` | Kubernetes Platform Reliability & Cloud Native SRE | `e0000000-0000-0000-0000-000000000006` |
| **Sneha Joshi** | `qa_automation_engineer` | Test Architecture, E2E Automation & Quality Gates | `e0000000-0000-0000-0000-000000000007` |
| **Vikram Shah** | `system_design_engineer` | Resilient Microservices & Disaster Recovery | `e0000000-0000-0000-0000-000000000008` |
| **Kavita Raman** | `frontend_engineer` | Core Web Vitals, Rendering Performance & Design Systems | `e0000000-0000-0000-0000-000000000009` |
| **Amitabh Sen** | `full_stack_engineer` | Event-Driven Full Stack Systems & GraphQL/REST APIs | `e0000000-0000-0000-0000-000000000010` |
| **Meera Nambiar** | `data_engineer` | Distributed SQL Engines, Spark & Data Warehousing | `e0000000-0000-0000-0000-000000000011` |
| **Suresh Pillai** | `devops_cloud_engineer` | Infrastructure as Code, CI/CD Security & Observability | `e0000000-0000-0000-0000-000000000012` |
| **Divya Agarwal** | `qa_automation_engineer` | Performance Testing, Load Simulation & Contract Testing | `e0000000-0000-0000-0000-000000000013` |
| **Rajesh Venkat** | `backend_developer` | Distributed Consensus & High-Concurrency Systems | `e0000000-0000-0000-0000-000000000014` |

---

## 4. Migration & Execution Procedure

The migration file is located at:
`backend/supabase/migrations/202609270009_multi_role_expansion_and_evaluators.sql`

It is deterministic, conflict-safe, and idempotent (`ON CONFLICT DO UPDATE` / `ON CONFLICT DO NOTHING`).

### Step-by-Step Execution:

1. **Verify Seed Files & Rebuild Migration (if needed):**
   ```powershell
   cd c:\Users\adity\OneDrive\Desktop\paneliq\backend
   npm.cmd run build:multi-role
   ```

2. **Execute Migration in Supabase:**
   - Open your Supabase Dashboard $\rightarrow$ **SQL Editor**.
   - Create a new query.
   - Paste the contents of `backend/supabase/migrations/202609270009_multi_role_expansion_and_evaluators.sql`.
   - Click **Run**.
   - The transaction will commit cleanly.

3. **Run Backend Test Suites:**
   ```powershell
   npm.cmd run validate:bank        # Validates existing 48 Backend Developer questions
   npm.cmd run validate:multi-role  # Validates all 168 questions and 14 evaluators
   npm.cmd test                     # Runs full 157-test suite
   npm.cmd run lint                 # Ensures 0 lint errors
   ```

---

## 5. SQL Verification Queries for Supabase

Run these queries in the Supabase SQL editor to verify database state after applying the migration:

### 1. Total Question Count by Role
```sql
select
  unnest(role_slugs) as role,
  count(distinct question_id) as total_questions,
  count(case when status = 'published' then 1 end) as published_questions
from public.question_versions
group by unnest(role_slugs)
order by total_questions desc;
```
*Expected: 7 roles, `backend_developer` = 48, all 6 new roles = 20 each. Total = 168.*

### 2. Question Count by Role and Experience Level
```sql
select
  unnest(role_slugs) as role,
  experience_level,
  count(distinct question_id) as questions
from public.question_versions
group by unnest(role_slugs), experience_level
order by role, experience_level;
```
*Expected: For each of the 6 new roles, exactly 10 `junior` and 10 `intermediate`.*

### 3. Question Count by Role and Stage
```sql
select
  unnest(role_slugs) as role,
  stage,
  count(distinct question_id) as questions
from public.question_versions
group by unnest(role_slugs), stage
order by role, stage;
```
*Expected per new role: `icebreaker` = 2, `technical` = 10, `techno_managerial` = 6, `reflection` = 2.*

### 4. Duplicate Question ID Check (Must return 0 rows)
```sql
select
  question_id,
  count(*) as version_count
from public.question_versions
group by question_id, version
having count(*) > 1;
```

### 5. Evaluator Directory & Specialization List
```sql
select
  p.user_id,
  p.display_name,
  ur.role,
  p.target_role,
  p.experience_level,
  u.raw_user_meta_data->>'specialization' as specialization
from public.profiles p
join public.user_roles ur on ur.user_id = p.user_id
join auth.users u on u.id = p.user_id
where ur.role = 'evaluator'
order by p.target_role, p.display_name;
```
*Expected: 14 rows, all natural Indian identities, distributed across all 7 roles.*

### 6. Evaluator Count by Role Specialization
```sql
select
  p.target_role,
  count(*) as evaluator_count
from public.profiles p
join public.user_roles ur on ur.user_id = p.user_id
where ur.role = 'evaluator'
group by p.target_role
order by evaluator_count desc;
```
*Expected: 2 evaluators for each of the 7 roles (14 total).*
