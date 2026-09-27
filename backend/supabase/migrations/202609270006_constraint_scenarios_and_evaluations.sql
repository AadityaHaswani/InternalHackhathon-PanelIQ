-- Migration: 202609270006_constraint_scenarios_and_evaluations.sql
-- Description: Adds constraint scenarios (Task 6) and evaluations, overrides, reports,
-- assignments, user roles, and custom question assessments (Task 7).
-- Fully additive and backward-compatible with existing Task 4/5 tables and data.
begin;

-- ============================================================================
-- 1. Constraint Scenarios Schema (Task 6 / D4-06)
-- ============================================================================

create table if not exists public.scenario_versions (
  id uuid primary key default gen_random_uuid(),
  scenario_id text not null,
  version integer not null default 1 check (version > 0),
  domain text not null check (domain = 'computer_science'),
  experience_level text not null check (experience_level in ('junior', 'intermediate')),
  stage text not null default 'technical' check (stage = 'technical'),
  panel_role text not null default 'technical' check (panel_role = 'technical'),
  role_slug text not null default 'backend_developer',
  baseline_question_id text not null,
  baseline_prompt text not null check (length(btrim(baseline_prompt)) > 0),
  changed_constraint text not null check (length(btrim(changed_constraint)) > 0),
  follow_up text not null check (length(btrim(follow_up)) > 0),
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  unique (scenario_id, version)
);

create table if not exists public.scenario_keys (
  scenario_version_id uuid primary key references public.scenario_versions(id) on delete cascade,
  expected_reasoning_points text[] not null check (cardinality(expected_reasoning_points) > 0),
  rubric_anchors jsonb not null
);

-- Protect published scenario versions from accidental mutation or deletion
create or replace function public.protect_scenario_version() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if old.status <> 'draft' then
    if tg_op = 'DELETE' then raise exception 'Published scenario versions cannot be deleted'; end if;
    if new.status <> 'archived' or (to_jsonb(new) - 'status') <> (to_jsonb(old) - 'status') then
      raise exception 'Published scenario versions are immutable';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists scenario_version_immutable on public.scenario_versions;
create trigger scenario_version_immutable before update or delete on public.scenario_versions
for each row execute function public.protect_scenario_version();

alter table public.scenario_versions enable row level security;
alter table public.scenario_keys enable row level security;

revoke all on public.scenario_versions, public.scenario_keys from public, anon, authenticated;
grant select on public.scenario_versions to authenticated;

-- Candidates and authenticated users can only read published scenario metadata (no private keys)
create policy scenarios_published_read on public.scenario_versions for select to authenticated
using (status = 'published');

-- ============================================================================
-- 2. Seed Stored Constraint Scenarios (8 Scenarios)
-- ============================================================================


do $$
declare
  v_id uuid;
begin
  if not exists (select 1 from public.scenario_versions where scenario_id = 'scen-j-db-offline' and version = 1) then
    insert into public.scenario_versions (
      scenario_id, version, domain, experience_level, stage, panel_role, role_slug,
      baseline_question_id, baseline_prompt, changed_constraint, follow_up, status
    ) values (
      'scen-j-db-offline', 1, 'computer_science', 'junior', 'technical', 'technical', 'backend_developer',
      'be-j-concurrency-stock', 'An item has one unit left. Two requests both read the stock as one and both place an order. Explain a database approach that prevents selling two units.', 'The application must now operate inside offline pop-up store kiosks with intermittent, delayed internet sync to the central warehouse.', 'How do you avoid overselling when two offline kiosks both sell the last unit before syncing?', 'published'
    ) returning id into v_id;

    insert into public.scenario_keys (scenario_version_id, expected_reasoning_points, rubric_anchors)
    values (v_id, array['Partitioning or allocating inventory quota per kiosk in advance','Optimistic selling with explicit compensation/backorder/refund workflow','Requiring an online connectivity check only when stock falls below a low-water threshold'], '{"0":"Assumes offline kiosks can magically talk to each other without network connectivity.","1":"Recognizes the problem, but has no mechanism to resolve or compensate for double sales upon reconnection.","2":"Proposes pre-allocating inventory to kiosks, but does not handle kiosk running out of stock while another has spare.","3":"Proposes sound offline strategy: allocate physical stock units to each kiosk locally, or allow optimistic sale with automated compensation/backorder handling upon sync.","4":"Production offline architecture: evaluates pre-allocation vs optimistic oversubscription with business compensation, conflict-resolution timestamps during sync, and low-stock online enforcement."}'::jsonb);
  end if;
end $$;

do $$
declare
  v_id uuid;
begin
  if not exists (select 1 from public.scenario_versions where scenario_id = 'scen-j-api-traffic-spike' and version = 1) then
    insert into public.scenario_versions (
      scenario_id, version, domain, experience_level, stage, panel_role, role_slug,
      baseline_question_id, baseline_prompt, changed_constraint, follow_up, status
    ) values (
      'scen-j-api-traffic-spike', 1, 'computer_science', 'junior', 'technical', 'technical', 'backend_developer',
      'be-j-api-pagination', 'A task list now has 100,000 records. How would you change its API so clients do not download every record at once?', 'Traffic surges to 50,000 requests per second, and users add 1,000 new tasks per minute continuously.', 'Why does OFFSET 90000 LIMIT 50 degrade under this load, and how does cursor-based pagination protect database memory?', 'published'
    ) returning id into v_id;

    insert into public.scenario_keys (scenario_version_id, expected_reasoning_points, rubric_anchors)
    values (v_id, array['B-tree index scan vs scanning and discarding 90,000 offset rows','Cursor pagination using WHERE id > last_seen_id ORDER BY id LIMIT 50','Stable pagination window that prevents missing or duplicate rows upon concurrent inserts'], '{"0":"Suggests caching all 100,000 records in client browsers.","1":"Suggests increasing server RAM without changing the offset query.","2":"Knows offset is slow on deep pages, but cannot explain why the database has to scan preceding rows.","3":"Explains that `OFFSET 90000` scans and discards 90,000 rows; demonstrates keyset/cursor pagination (`WHERE id > cursor LIMIT 50`) using an index seek.","4":"Deep performance analysis: explains index seek vs scan, constant-time execution across arbitrary depths, and prevention of offset insertion drift."}'::jsonb);
  end if;
end $$;

do $$
declare
  v_id uuid;
begin
  if not exists (select 1 from public.scenario_versions where scenario_id = 'scen-j-storage-cost' and version = 1) then
    insert into public.scenario_versions (
      scenario_id, version, domain, experience_level, stage, panel_role, role_slug,
      baseline_question_id, baseline_prompt, changed_constraint, follow_up, status
    ) values (
      'scen-j-storage-cost', 1, 'computer_science', 'junior', 'technical', 'technical', 'backend_developer',
      'be-j-reliability-logs', 'A user says saving a task failed yesterday. What information would you log to investigate, and what information should stay out of the logs?', 'Log storage costs exceed budget by 400%, and disk write I/O is slowing down the primary API database.', 'How do you maintain auditability and debuggability while cutting log volume by 80%?', 'published'
    ) returning id into v_id;

    insert into public.scenario_keys (scenario_version_id, expected_reasoning_points, rubric_anchors)
    values (v_id, array['Dynamic log levels (INFO/WARN in production, DEBUG disabled)','Sampling high-volume successful 2xx requests while logging 100% of 4xx and 5xx errors','Asynchronous non-blocking log shipping'], '{"0":"Turns off logging completely in production.","1":"Deletes logs every hour, destroying ability to investigate yesterday''s bugs.","2":"Changes log level to ERROR, but loses visibility into user audit trails and request timing.","3":"Practical cost optimization: log sampling (e.g. sample 1% of 200 OKs, retain 100% of errors), dynamic log level configuration, and moving logs off primary database disk.","4":"Enterprise telemetry optimization: structured sampling, metric emission instead of verbose log lines for normal paths, tiered retention storage (hot vs cold S3), and asynchronous log aggregation."}'::jsonb);
  end if;
end $$;

do $$
declare
  v_id uuid;
begin
  if not exists (select 1 from public.scenario_versions where scenario_id = 'scen-j-read-heavy-cache' and version = 1) then
    insert into public.scenario_versions (
      scenario_id, version, domain, experience_level, stage, panel_role, role_slug,
      baseline_question_id, baseline_prompt, changed_constraint, follow_up, status
    ) values (
      'scen-j-read-heavy-cache', 1, 'computer_science', 'junior', 'technical', 'technical', 'backend_developer',
      'be-j-db-index', 'Listing a user''s tasks becomes slow as the table grows. What would you investigate, and when might an index on user_id help?', 'The database CPU is pinned at 98% because 99% of requests are identical queries for the same 10 celebrity users.', 'Why does adding another index fail to solve this, and how would you introduce a cache layer?', 'published'
    ) returning id into v_id;

    insert into public.scenario_keys (scenario_version_id, expected_reasoning_points, rubric_anchors)
    values (v_id, array['Index still consumes database CPU and connection pool resources per query','In-memory caching layer (Redis / Memcached / application cache) with TTL','Cache invalidation strategy when a celebrity updates tasks'], '{"0":"Adds 5 more indexes on the database table.","1":"Recognizes cache is needed, but puts cache after database query in request lifecycle.","2":"Adds Redis cache for celebrity users, but has no invalidation or TTL strategy.","3":"Clear architectural intervention: explains why index reads still saturate DB CPU; places Redis cache in front of DB; sets short TTL or event-driven invalidation on task write.","4":"High-concurrency cache design: Cache-Aside pattern, protects against cache stampede on celebrity keys via mutex locks or background warming, and monitors cache hit ratio."}'::jsonb);
  end if;
end $$;

do $$
declare
  v_id uuid;
begin
  if not exists (select 1 from public.scenario_versions where scenario_id = 'scen-i-distributed-transfer' and version = 1) then
    insert into public.scenario_versions (
      scenario_id, version, domain, experience_level, stage, panel_role, role_slug,
      baseline_question_id, baseline_prompt, changed_constraint, follow_up, status
    ) values (
      'scen-i-distributed-transfer', 1, 'computer_science', 'intermediate', 'technical', 'technical', 'backend_developer',
      'be-i-db-transfer', 'A transfer debits one account and credits another. Describe transaction boundaries, concurrency controls and failure handling that prevent partial or double transfers.', 'Due to regulatory requirements, user accounts are now split across two completely independent database clusters in different data centers that cannot share a single ACID transaction.', 'How do you ensure funds are not created or destroyed without a single database transaction?', 'published'
    ) returning id into v_id;

    insert into public.scenario_keys (scenario_version_id, expected_reasoning_points, rubric_anchors)
    values (v_id, array['Saga pattern with compensating transactions or Two-Phase Commit (2PC)','Transactional outbox pattern with reliable message delivery','Idempotent debit and credit endpoints with pending transfer states'], '{"0":"Executes debit and credit across databases without handling failure of the second call.","1":"Suggests distributed transaction without understanding latency or partitioned failure modes.","2":"Describes a Saga pattern, but lacks compensation mechanism if credit step fails.","3":"Robust distributed architecture: Saga pattern (Pending Transfer -> Debit Account A -> Message Outbox -> Credit Account B -> Completed); compensating transaction (refund Account A if Credit B fails permanently); idempotency on both ends.","4":"Financial systems mastery: details Choreography vs Orchestration Saga, transactional outbox to prevent dual-write bugs, reconciler cron job to detect hanging states, and at-least-once message guarantees."}'::jsonb);
  end if;
end $$;

do $$
declare
  v_id uuid;
begin
  if not exists (select 1 from public.scenario_versions where scenario_id = 'scen-i-idempotency-cluster' and version = 1) then
    insert into public.scenario_versions (
      scenario_id, version, domain, experience_level, stage, panel_role, role_slug,
      baseline_question_id, baseline_prompt, changed_constraint, follow_up, status
    ) values (
      'scen-i-idempotency-cluster', 1, 'computer_science', 'intermediate', 'technical', 'technical', 'backend_developer',
      'be-i-api-idempotency', 'Design idempotency for POST /orders. Explain how concurrent requests with the same key are handled and what happens when the key is reused with a different body.', 'The service runs active-active in 3 AWS regions with 200ms inter-region replication latency.', 'What happens if two concurrent requests with the same key hit Region US-East and Region EU-West simultaneously?', 'published'
    ) returning id into v_id;

    insert into public.scenario_keys (scenario_version_id, expected_reasoning_points, rubric_anchors)
    values (v_id, array['Cross-region replication lag creates a split-brain race window for identical keys','Routing requests by user ID or idempotency key hash to a primary/home region','Global consensus or distributed locking for multi-region writes'], '{"0":"Assumes database replication across oceans is instantaneous (0ms).","1":"Recognizes replication delay, but accepts duplicate order creation as unavoidable.","2":"Suggests cross-region database locks, but overlooks severe latency impact (200ms+ per request).","3":"Pragmatic distributed routing: route requests with the same key or user ID to a single designated primary region (deterministic hashing at edge/CloudFront), keeping idempotency checks local and fast.","4":"Global architecture expertise: evaluates regional affinity routing vs distributed consensus (CockroachDB/Spanner), details asynchronous reconciliation, and explains trade-offs between availability and consistency under CAP theorem."}'::jsonb);
  end if;
end $$;

do $$
declare
  v_id uuid;
begin
  if not exists (select 1 from public.scenario_versions where scenario_id = 'scen-i-cache-stampede-burst' and version = 1) then
    insert into public.scenario_versions (
      scenario_id, version, domain, experience_level, stage, panel_role, role_slug,
      baseline_question_id, baseline_prompt, changed_constraint, follow_up, status
    ) values (
      'scen-i-cache-stampede-burst', 1, 'computer_science', 'intermediate', 'technical', 'technical', 'backend_developer',
      'be-i-reliability-cache', 'You cache product availability, but inventory changes frequently. Describe what may safely use the cache and where authoritative checks must still occur.', 'Flash sale launch: 500,000 users refresh the exact same product page at the exact second the cache TTL expires.', 'How do you protect the database from crashing under the stampede?', 'published'
    ) returning id into v_id;

    insert into public.scenario_keys (scenario_version_id, expected_reasoning_points, rubric_anchors)
    values (v_id, array['Cache stampede / thundering herd problem where 500k requests miss cache simultaneously and hit DB','Distributed mutex lock on cache miss (only 1 thread queries DB; others wait or receive stale data)','Probabilistic early expiration (XFetch algorithm) or proactive background cache warming'], '{"0":"Suggests setting TTL to 0 or restarting the database when it crashes.","1":"Suggests infinite TTL without explaining how inventory updates ever get reflected.","2":"Explains cache stampede, but mutex locking approach still blocks all 500k client requests.","3":"Solves stampede: (a) Mutex locking on cache miss so only 1 worker queries DB while others wait or serve stale cache; OR (b) Background cache warming before expiry.","4":"Advanced cache engineering: probabilistic early recomputation (XFetch), stale-while-revalidate headers, soft TTL vs hard TTL, and multi-tier edge CDN caching."}'::jsonb);
  end if;
end $$;

do $$
declare
  v_id uuid;
begin
  if not exists (select 1 from public.scenario_versions where scenario_id = 'scen-i-eventual-consistency-search' and version = 1) then
    insert into public.scenario_versions (
      scenario_id, version, domain, experience_level, stage, panel_role, role_slug,
      baseline_question_id, baseline_prompt, changed_constraint, follow_up, status
    ) values (
      'scen-i-eventual-consistency-search', 1, 'computer_science', 'intermediate', 'technical', 'technical', 'backend_developer',
      'be-i-concurrency-worker', 'Two workers may pick the same pending job, and either can crash after doing work. How would you claim jobs safely and limit duplicate side effects?', 'Task records must now be indexed into an Elasticsearch cluster that has a 2-second refresh lag, but users expect immediate visibility of their edits.', 'How do you present an immediate update in the UI without serving stale search results or hammering the primary database?', 'published'
    ) returning id into v_id;

    insert into public.scenario_keys (scenario_version_id, expected_reasoning_points, rubric_anchors)
    values (v_id, array['Read-your-own-writes consistency vs eventual consistency for general search','Return updated entity directly in write API response to update client local state immediately','Query primary database by ID for own recent edits while search index catches up'], '{"0":"Sets Elasticsearch refresh interval to 0ms, crashing the search cluster.","1":"Tells users they must wait 5 seconds before viewing their own edits.","2":"Suggests querying primary DB for all searches, defeating the purpose of Elasticsearch.","3":"Read-your-own-writes consistency: write API returns fresh updated object for client optimistic state; direct lookups by ID go to primary DB; full-text searches use Elasticsearch with explicit lag expectation.","4":"CQRS architecture: Command Query Responsibility Segregation, client-side optimistic UI updates, tracking user version/timestamp tokens to bypass search cache until index catches up."}'::jsonb);
  end if;
end $$;

-- ============================================================================
-- 3. User Roles & Review Assignments (Task 7 / D4-07)
-- ============================================================================

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'evaluator', 'candidate')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.review_assignments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  evaluator_id uuid not null references auth.users(id) on delete cascade,
  assigned_by uuid references auth.users(id),
  assigned_at timestamptz not null default now(),
  unique (session_id, evaluator_id)
);

alter table public.user_roles enable row level security;
alter table public.review_assignments enable row level security;

revoke all on public.user_roles, public.review_assignments from public, anon, authenticated;
grant select on public.user_roles, public.review_assignments to authenticated;

create policy user_roles_own_read on public.user_roles for select to authenticated
using (user_id = (select auth.uid()));

create policy review_assignments_evaluator_read on public.review_assignments for select to authenticated
using (evaluator_id = (select auth.uid()));

-- ============================================================================
-- 4. Evaluations, Overrides, and Report Revisions (Task 7 / D4-07)
-- ============================================================================

create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  turn_id uuid not null references public.session_turns(id) on delete cascade,
  answer_id uuid not null references public.answers(id) on delete cascade,
  criterion_id text not null check (criterion_id in ('correctness', 'reasoning', 'relevance', 'tradeoffs')),
  rating integer check (rating is null or (rating between 0 and 4)),
  applicable boolean not null default true,
  rationale text not null default '',
  missing_points text[] not null default array[]::text[],
  evidence_excerpt text,
  evidence_start integer check (evidence_start is null or evidence_start >= 0),
  evidence_end integer check (evidence_end is null or evidence_end >= 0),
  evidence_source text not null default 'ai' check (evidence_source in ('ai', 'human', 'answer_key', 'metadata_rule', 'system')),
  rubric_version integer not null default 1,
  evaluator_id uuid references auth.users(id),
  report_revision integer not null default 1 check (report_revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (answer_id, criterion_id, report_revision)
);

create table if not exists public.review_overrides (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references public.evaluations(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  criterion_id text not null,
  old_rating integer check (old_rating is null or (old_rating between 0 and 4)),
  new_rating integer not null check (new_rating between 0 and 4),
  reason text not null check (length(btrim(reason)) >= 5),
  evaluator_id uuid not null references auth.users(id),
  report_revision integer not null check (report_revision > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.report_revisions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  revision integer not null check (revision > 0),
  status text not null default 'draft' check (status in ('draft', 'released')),
  overall_score numeric(5,2),
  is_provisional boolean not null default true,
  summary text not null default '',
  coverage_diagnostics jsonb not null default '{}'::jsonb,
  evaluation_summary jsonb not null default '{}'::jsonb,
  released_by uuid references auth.users(id),
  released_at timestamptz,
  created_at timestamptz not null default now(),
  unique (session_id, revision)
);

create table if not exists public.question_assessments (
  id uuid primary key default gen_random_uuid(),
  expert_owner uuid not null references auth.users(id),
  target_role text not null default 'backend_developer',
  experience_level text not null check (experience_level in ('junior', 'intermediate')),
  required_topic_tags text[] not null check (cardinality(required_topic_tags) > 0),
  proposed_question text not null check (length(btrim(proposed_question)) >= 20),
  assessment_status text not null default 'draft' check (assessment_status in ('draft', 'assessed', 'rejected', 'archived')),
  metadata_indicators jsonb not null default '{}'::jsonb,
  draft_rewrite text,
  rubric_version integer not null default 1,
  source text not null default 'expert',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.evaluations enable row level security;
alter table public.review_overrides enable row level security;
alter table public.report_revisions enable row level security;
alter table public.question_assessments enable row level security;

revoke all on public.evaluations, public.review_overrides, public.report_revisions, public.question_assessments from public, anon, authenticated;
grant select on public.evaluations, public.review_overrides, public.report_revisions, public.question_assessments to authenticated;
grant insert, update on public.evaluations, public.review_overrides, public.report_revisions, public.question_assessments to authenticated;

create policy evaluations_read on public.evaluations for select to authenticated
using (
  exists (
    select 1 from public.sessions s where s.id = session_id and s.user_id = (select auth.uid())
  ) or exists (
    select 1 from public.review_assignments ra where ra.session_id = session_id and ra.evaluator_id = (select auth.uid())
  ) or exists (
    select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'
  )
);

create policy report_revisions_read on public.report_revisions for select to authenticated
using (
  (status = 'released' and exists (
    select 1 from public.sessions s where s.id = session_id and s.user_id = (select auth.uid())
  )) or exists (
    select 1 from public.review_assignments ra where ra.session_id = session_id and ra.evaluator_id = (select auth.uid())
  ) or exists (
    select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'
  )
);

create policy question_assessments_owner_read on public.question_assessments for select to authenticated
using (expert_owner = (select auth.uid()) or exists (
  select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'
));

-- ============================================================================
-- 5. Extend Sessions & Session Turns for Constraint Challenge (Task 6)
-- ============================================================================

-- Add constraint columns to session_turns if not present
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'session_turns' and column_name = 'turn_type') then
    alter table public.session_turns add column turn_type text not null default 'base' check (turn_type in ('base', 'challenge'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'session_turns' and column_name = 'parent_turn_id') then
    alter table public.session_turns add column parent_turn_id uuid references public.session_turns(id);
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'session_turns' and column_name = 'scenario_version_id') then
    alter table public.session_turns add column scenario_version_id uuid references public.scenario_versions(id);
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'session_turns' and column_name = 'constraint_snapshot') then
    alter table public.session_turns add column constraint_snapshot jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'session_turns' and column_name = 'source') then
    alter table public.session_turns add column source text not null default 'question_bank' check (source in ('question_bank', 'stored_followup', 'ai_followup'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'session_turns' and column_name = 'prompt') then
    alter table public.session_turns add column prompt text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'session_turns' and column_name = 'stage') then
    alter table public.session_turns add column stage text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'session_turns' and column_name = 'panel_role') then
    alter table public.session_turns add column panel_role text;
  end if;
end $$;

-- Adjust position bounds to support up to 10 turns (8 base + challenge/follow-ups)
alter table public.session_turns drop constraint if exists session_turns_position_check;
alter table public.session_turns add constraint session_turns_position_check check (position between 1 and 10);

-- Adjust session bounds for up to 10 turns
alter table public.sessions drop constraint if exists sessions_current_position_check;
alter table public.sessions add constraint sessions_current_position_check check (current_position between 1 and 11);

-- ============================================================================
-- 6. Updated Transaction RPC Functions (Task 6 & Task 7 Integration)
-- ============================================================================

create or replace function public.session_state(p_session_id uuid) returns jsonb
language sql volatile security invoker set search_path = '' as $$
  select jsonb_build_object(
    'id', s.id, 'profile', s.profile_snapshot, 'status', s.status,
    'version', s.version, 'answeredCount', s.current_position - 1,
    'totalTurns', (select count(*) from public.session_turns where session_id = s.id),
    'createdAt', s.created_at, 'completedAt', s.completed_at,
    'currentTurn', (
      select case when t.id is null then null else
        jsonb_build_object(
          'id', t.id,
          'position', t.position,
          'stage', coalesce(t.stage, t.question_snapshot->>'stage'),
          'panelRole', coalesce(t.panel_role, t.question_snapshot->>'panelRole'),
          'prompt', coalesce(t.prompt, t.question_snapshot->>'prompt'),
          'source', coalesce(t.source, 'question_bank'),
          'isChallenge', (t.turn_type = 'challenge'),
          'baselineTurnId', t.parent_turn_id,
          'constraint', case when t.turn_type = 'challenge' then t.constraint_snapshot else null end,
          'questionId', t.question_snapshot->>'questionId',
          'questionVersion', (t.question_snapshot->>'questionVersion')::int,
          'topics', t.question_snapshot->'topics',
          'difficulty', (t.question_snapshot->>'difficulty')::int
        )
      end
      from public.session_turns t where t.session_id = s.id and t.position = s.current_position
    )
  ) from public.sessions s where s.id = p_session_id and s.user_id = auth.uid();
$$;

create or replace function public.create_interview_session(p_question_versions uuid[]) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  profile public.profiles%rowtype;
  question public.question_versions%rowtype;
  session_id uuid := gen_random_uuid();
  stages text[] := array['icebreaker','technical','technical','technical','technical','techno_managerial','techno_managerial','reflection'];
  used_questions text[] := array[]::text[];
  v_scenario_id uuid;
  v_scenario_base_id text;
  i integer;
begin
  if actor is null then raise sqlstate 'PT401' using message = 'AUTH_REQUIRED'; end if;
  select * into profile from public.profiles where user_id = actor for share;
  if not found or profile.display_name is null or profile.domain is null or profile.experience_level is null or profile.target_role is null then
    raise sqlstate 'PT400' using message = 'PROFILE_INCOMPLETE';
  end if;
  if not exists (select 1 from public.interview_roles where slug = profile.target_role and domain = profile.domain and active)
    or profile.domain <> 'computer_science' or profile.experience_level not in ('junior','intermediate') then
    raise sqlstate 'PT400' using message = 'PROFILE_UNSUPPORTED';
  end if;
  if p_question_versions is null or cardinality(p_question_versions) <> 8 or array_ndims(p_question_versions) <> 1
    or array_lower(p_question_versions,1) <> 1 or array_position(p_question_versions,null) is not null then
    raise sqlstate 'PT400' using message = 'INVALID_PLAN';
  end if;

  for i in 1..8 loop
    select * into question from public.question_versions where id = p_question_versions[i] for share;
    if not found or question.status <> 'published' or question.domain <> profile.domain
      or question.experience_level <> profile.experience_level or not (profile.target_role = any(question.role_slugs))
      or question.stage <> stages[i] or question.question_id = any(used_questions)
      or not exists (select 1 from public.question_keys where question_version_id = question.id) then
      raise sqlstate 'PT409' using message = 'BANK_CHANGED';
    end if;
    used_questions := array_append(used_questions, question.question_id);
  end loop;

  -- Select at most ONE matching approved scenario for this session
  select id, baseline_question_id into v_scenario_id, v_scenario_base_id
  from public.scenario_versions
  where status = 'published'
    and domain = profile.domain
    and experience_level = profile.experience_level
    and role_slug = profile.target_role
    and baseline_question_id = any(used_questions)
  order by created_at desc
  limit 1;

  insert into public.sessions (id, user_id, profile_snapshot) values (session_id, actor,
    jsonb_build_object('displayName',profile.display_name,'domain',profile.domain,
      'experienceLevel',profile.experience_level,'targetRole',profile.target_role));

  for i in 1..8 loop
    select * into question from public.question_versions where id = p_question_versions[i];
    insert into public.session_turns (
      session_id, position, question_version_id, question_id, question_snapshot,
      turn_type, source, scenario_version_id, stage, panel_role, prompt
    )
    values (
      session_id, i, question.id, question.question_id,
      jsonb_build_object(
        'questionId', question.question_id, 'questionVersion', question.version, 'prompt', question.prompt,
        'stage', question.stage, 'panelRole', question.panel_role, 'topics', question.topics, 'difficulty', question.difficulty
      ),
      'base', 'question_bank',
      case when v_scenario_base_id is not null and question.question_id = v_scenario_base_id then v_scenario_id else null end,
      question.stage, question.panel_role, question.prompt
    );
  end loop;

  return public.session_state(session_id);
end;
$$;

create or replace function public.save_interview_turn(
  p_session_id uuid, p_turn_id uuid, p_expected_version integer,
  p_idempotency_key text, p_state text, p_answer text default null
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  interview public.sessions%rowtype;
  previous public.answers%rowtype;
  current_turn_row public.session_turns%rowtype;
  scenario_row public.scenario_versions%rowtype;
  answer_id uuid := gen_random_uuid();
  clean_answer text;
  outcome jsonb;
  v_total_turns integer;
  challenge_turn_id uuid := gen_random_uuid();
begin
  if actor is null then raise sqlstate 'PT401' using message = 'AUTH_REQUIRED'; end if;
  if p_expected_version is null or p_expected_version < 1 or p_turn_id is null
    or p_idempotency_key is null or p_idempotency_key !~ '^[A-Za-z0-9_-]{8,128}$'
    or p_state is null or p_state not in ('submitted','skipped') then
    raise sqlstate 'PT400' using message = 'INVALID_ANSWER';
  end if;
  clean_answer := btrim(p_answer, U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF');
  if (p_state = 'submitted' and (clean_answer is null or char_length(clean_answer) not between 1 and 2000))
    or (p_state = 'skipped' and p_answer is not null) then
    raise sqlstate 'PT400' using message = 'INVALID_ANSWER';
  end if;

  select * into interview from public.sessions where id = p_session_id and user_id = actor for update;
  if not found then raise sqlstate 'PT404' using message = 'SESSION_NOT_FOUND'; end if;

  select * into previous from public.answers where session_id = p_session_id and idempotency_key = p_idempotency_key;
  if found then
    if previous.turn_id <> p_turn_id or previous.expected_version <> p_expected_version
      or previous.state <> p_state or previous.answer_text is distinct from clean_answer then
      raise sqlstate 'PT409' using message = 'IDEMPOTENCY_CONFLICT';
    end if;
    return previous.saved_outcome;
  end if;

  if interview.status <> 'active' then raise sqlstate 'PT409' using message = 'SESSION_NOT_ACTIVE'; end if;
  if interview.version <> p_expected_version then raise sqlstate 'PT409' using message = 'SESSION_STALE'; end if;

  select * into current_turn_row from public.session_turns where session_id = p_session_id and position = interview.current_position;
  if current_turn_row.id is distinct from p_turn_id then raise sqlstate 'PT409' using message = 'TURN_NOT_CURRENT'; end if;

  -- 1. Insert original answer for the current turn
  insert into public.answers (id, session_id, turn_id, state, answer_text, idempotency_key, expected_version, saved_outcome)
  values (answer_id, p_session_id, p_turn_id, p_state, clean_answer, p_idempotency_key, p_expected_version, '{}'::jsonb);

  -- 2. If this turn has a scenario and no challenge turn exists yet for it, insert challenge turn
  if current_turn_row.scenario_version_id is not null
     and not exists (select 1 from public.session_turns where session_id = p_session_id and turn_type = 'challenge') then
    select * into scenario_row from public.scenario_versions where id = current_turn_row.scenario_version_id;

    -- Shift subsequent turns by 1
    update public.session_turns
    set position = position + 1
    where session_id = p_session_id and position > interview.current_position;

    -- Insert challenge turn at interview.current_position + 1
    insert into public.session_turns (
      id, session_id, position, question_version_id, question_id, question_snapshot,
      turn_type, parent_turn_id, scenario_version_id, constraint_snapshot, source, stage, panel_role, prompt
    ) values (
      challenge_turn_id, p_session_id, interview.current_position + 1, current_turn_row.question_version_id, current_turn_row.question_id,
      current_turn_row.question_snapshot, 'challenge', p_turn_id, scenario_row.id,
      jsonb_build_object('originalPrompt', scenario_row.baseline_prompt, 'change', scenario_row.changed_constraint),
      'stored_followup', 'technical', 'technical', scenario_row.follow_up
    );
  end if;

  v_total_turns := (select count(*) from public.session_turns where session_id = p_session_id);

  update public.sessions
  set current_position = current_position + 1,
      version = version + 1,
      status = case when current_position + 1 > v_total_turns then 'ready_to_complete' else 'active' end
  where id = p_session_id;

  outcome := jsonb_build_object('answerId', answer_id, 'answerState', p_state, 'session', public.session_state(p_session_id));
  update public.answers set saved_outcome = outcome where id = answer_id;
  return outcome;
end;
$$;

create or replace function public.complete_interview_session(p_session_id uuid, p_expected_version integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  interview public.sessions%rowtype;
  v_total_turns integer;
  v_answer_count integer;
begin
  if actor is null then raise sqlstate 'PT401' using message = 'AUTH_REQUIRED'; end if;
  if p_expected_version is null or p_expected_version < 1 then raise sqlstate 'PT400' using message = 'INVALID_VERSION'; end if;
  select * into interview from public.sessions where id = p_session_id and user_id = actor for update;
  if not found then raise sqlstate 'PT404' using message = 'SESSION_NOT_FOUND'; end if;
  if interview.status = 'completed' then return public.session_state(p_session_id); end if;
  if interview.version <> p_expected_version then raise sqlstate 'PT409' using message = 'SESSION_STALE'; end if;

  v_total_turns := (select count(*) from public.session_turns where session_id = p_session_id);
  v_answer_count := (select count(*) from public.answers where session_id = p_session_id);

  if interview.status <> 'ready_to_complete' or v_answer_count <> v_total_turns then
    raise sqlstate 'PT409' using message = 'SESSION_INCOMPLETE';
  end if;

  update public.sessions set status = 'completed', completed_at = now(), version = version + 1 where id = p_session_id;
  return public.session_state(p_session_id);
end;
$$;

commit;
