-- Migration: 202609270007_ai_jobs_and_retries.sql
-- Description: AI background job queue, worker leases, and answer retries schema for Tasks 8 and 9.

-- ============================================================================
-- 1. AI Background Jobs Table
-- ============================================================================

create table if not exists public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  turn_id uuid not null references public.session_turns(id) on delete cascade,
  answer_id uuid not null references public.answers(id) on delete cascade,
  job_type text not null default 'evaluation' check (job_type in ('evaluation', 'follow_up', 'retry_evaluation')),
  status text not null default 'pending' check (status in ('pending', 'claimed', 'completed', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 3 check (max_attempts > 0),
  provider text,
  model text,
  lease_owner text,
  lease_expires_at timestamptz,
  result jsonb,
  error text,
  rubric_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_jobs_queue_idx on public.ai_jobs(status, lease_expires_at, created_at)
where status in ('pending', 'claimed');
create index if not exists ai_jobs_session_idx on public.ai_jobs(session_id);
create index if not exists ai_jobs_answer_idx on public.ai_jobs(answer_id);

-- ============================================================================
-- 2. Answer Retries Table (PRD Task 9)
-- ============================================================================

create table if not exists public.answer_retries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  source_answer_id uuid not null unique references public.answers(id) on delete cascade,
  retry_turn_id uuid references public.session_turns(id) on delete set null,
  retry_answer_id uuid references public.answers(id) on delete set null,
  topic text not null,
  variant_id text not null,
  variant_question_id text not null,
  variant_question_version integer not null default 1,
  original_rubric_version integer not null default 1,
  retry_rubric_version integer not null default 1,
  original_score numeric(5,2),
  retry_score numeric(5,2),
  numeric_comparison_allowed boolean not null default true,
  score_delta numeric(5,2),
  status text not null default 'created' check (status in ('created', 'answered', 'evaluated', 'abandoned')),
  provider text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists answer_retries_session_idx on public.answer_retries(session_id);
create index if not exists answer_retries_source_idx on public.answer_retries(source_answer_id);

-- ============================================================================
-- 3. Atomic Job Claiming & Completion Functions
-- ============================================================================

create or replace function public.claim_next_ai_job(p_worker_id text, p_lease_seconds int default 60)
returns setof public.ai_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.ai_jobs;
begin
  select * into v_job
  from public.ai_jobs
  where status = 'pending'
     or (status = 'claimed' and lease_expires_at < clock_timestamp())
  order by created_at asc
  limit 1
  for update skip locked;

  if v_job.id is not null then
    update public.ai_jobs
    set status = 'claimed',
        lease_owner = p_worker_id,
        lease_expires_at = clock_timestamp() + (p_lease_seconds || ' seconds')::interval,
        attempts = attempts + 1,
        updated_at = clock_timestamp()
    where id = v_job.id
    returning * into v_job;

    return next v_job;
  end if;
  return;
end;
$$;

create or replace function public.complete_ai_job(
  p_job_id uuid,
  p_result jsonb,
  p_provider text,
  p_model text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ai_jobs
  set status = 'completed',
      result = p_result,
      provider = p_provider,
      model = p_model,
      lease_owner = null,
      lease_expires_at = null,
      updated_at = clock_timestamp()
  where id = p_job_id and status = 'claimed';

  return found;
end;
$$;

create or replace function public.fail_ai_job(
  p_job_id uuid,
  p_error text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ai_jobs
  set status = case when attempts >= max_attempts then 'failed' else 'pending' end,
      error = p_error,
      lease_owner = null,
      lease_expires_at = null,
      updated_at = clock_timestamp()
  where id = p_job_id;

  return found;
end;
$$;

-- ============================================================================
-- 4. Row Level Security & Policies
-- ============================================================================

alter table public.ai_jobs enable row level security;
alter table public.answer_retries enable row level security;

revoke all on public.ai_jobs, public.answer_retries from public, anon, authenticated;
grant select on public.ai_jobs, public.answer_retries to authenticated;
grant insert, update on public.ai_jobs, public.answer_retries to authenticated;

-- Candidates can view jobs related to their sessions
create policy ai_jobs_own_read on public.ai_jobs for select to authenticated
using (
  exists (
    select 1 from public.sessions s where s.id = session_id and s.user_id = (select auth.uid())
  ) or exists (
    select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role in ('evaluator', 'admin')
  )
);

-- Candidates can read and insert retries for their own sessions
create policy answer_retries_own_read on public.answer_retries for select to authenticated
using (
  exists (
    select 1 from public.sessions s where s.id = session_id and s.user_id = (select auth.uid())
  ) or exists (
    select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role in ('evaluator', 'admin')
  )
);

create policy answer_retries_own_write on public.answer_retries for insert to authenticated
with check (
  exists (
    select 1 from public.sessions s where s.id = session_id and s.user_id = (select auth.uid())
  )
);

create policy answer_retries_own_update on public.answer_retries for update to authenticated
using (
  exists (
    select 1 from public.sessions s where s.id = session_id and s.user_id = (select auth.uid())
  ) or exists (
    select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role in ('evaluator', 'admin')
  )
);
