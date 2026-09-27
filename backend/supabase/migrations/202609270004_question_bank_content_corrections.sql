-- Additive Content Correction Migration
-- File: supabase/migrations/202609270004_question_bank_content_corrections.sql
-- Enriches unreviewed question drafts with detailed rubric notes, accepted alternative approaches,
-- and contextual follow-up prompts before human review and publication.
-- Deliberately updates only rows with status = 'draft'; never alters published content.
begin;

-- 1. Add targeted follow-up prompts to question_versions for technical & techno-managerial questions
update public.question_versions
set reviewed_follow_up = case question_id
  -- Junior Technical
  when 'be-j-api-pagination' then 'If a new record is inserted while a client paginates using offset and limit, what issue can occur and how does cursor-based pagination prevent it?'
  when 'be-j-db-uniqueness' then 'What HTTP status code and error payload should your API return when a database unique constraint violation is caught?'
  when 'be-j-db-index' then 'Why might a database query planner choose a sequential table scan even when an index on user_id exists?'
  when 'be-j-concurrency-stock' then 'How should the API respond if the conditional update returns 0 affected rows because the last unit was just sold?'
  when 'be-j-concurrency-retry' then 'How long should an idempotency record be retained, and what should happen if a client reuses an idempotency key with a different request payload?'
  when 'be-j-reliability-timeout' then 'How would you differentiate between an error caused by a downstream service taking too long versus your own server running out of resources?'
  when 'be-j-reliability-logs' then 'How does a correlation ID or request ID help when tracking an error across multiple backend services?'
  -- Junior Techno-Managerial
  when 'be-j-project-deadline' then 'How would you write a clear update to stakeholders explaining that task saving is functional but search filters are deferred to the next release?'
  when 'be-j-project-contract' then 'What automated test would you add to your CI pipeline to catch breaking API field changes before deployment?'
  when 'be-j-project-bug' then 'If the bug affects only 1% of users under high concurrency, how would you gather reproduction steps without exposing user data?'
  when 'be-j-project-library' then 'If the library reduces code volume by 50 lines but introduces 15 transitive dependencies, what trade-offs would you weigh?'
  -- Intermediate Technical
  when 'be-i-api-versioning' then 'How can you use API gateways or deprecation headers (like Sunset: <date>) to notify external consumers before removing an old field?'
  when 'be-i-db-transfer' then 'If two transfers run concurrently—User A to User B, and User B to User A—how do you prevent a database deadlock?'
  when 'be-i-db-query-plan' then 'In a composite index on (customer_id, status, created_at), how does the order of columns affect queries that filter by status without customer_id?'
  when 'be-i-concurrency-version' then 'Should the client merge conflicts automatically, or should the application present a diff UI to the user?'
  when 'be-i-concurrency-worker' then 'If a worker dies after performing a payment side-effect but before deleting the queue message, how does your system prevent charging twice?'
  when 'be-i-reliability-retries' then 'Why is exponential backoff alone insufficient without random jitter during a major downstream service recovery?'
  when 'be-i-reliability-cache' then 'What is cache stampede (or thundering herd), and what strategy prevents the database from being overwhelmed when a hot cache key expires?'
  -- Intermediate Techno-Managerial
  when 'be-i-project-migration' then 'During an expand-contract database migration, at what exact stage is it safe to remove the backward-compatibility write trigger?'
  when 'be-i-project-slo' then 'How do you differentiate between an error budget burn caused by intermittent network blips versus a systemic regression?'
  when 'be-i-project-buy-build' then 'What telemetry would trigger a decision to migrate from a Postgres SKIP LOCKED queue to a managed system like SQS or Kafka?'
  when 'be-i-project-review' then 'What static analysis, linter rule, or architectural test would you implement to prevent authorization checks from being accidentally removed in future PRs?'
  else reviewed_follow_up
end
where status = 'draft';

-- 2. Enrich private rubric notes with grading criteria and valid alternative answers
update public.question_keys k
set rubric_notes = case q.question_id
  -- JUNIOR ICEBREAKERS
  when 'be-j-intro-project' then
    'Unscored icebreaker. Look for: concrete project description, specific individual contributions vs group work, and honesty about limitations. No personality grading.'
  when 'be-j-intro-request' then
    'Unscored icebreaker. Look for: basic mental model of client-server boundary, HTTP request flow, database storage, and willingness to state where they are unsure.'

  -- JUNIOR TECHNICAL
  when 'be-j-api-validation' then
    'Core: Type checking, required trimmed fields, length bounds, and safe 400 Bad Request or 422 Unprocessable Entity. Valid alternatives: Schema validator library (e.g. Zod, Joi) or manual checks. Follow-up: Whitespace-only strings must be trimmed before length checks and rejected.'
  when 'be-j-api-pagination' then
    'Core: Bounded page limits (max 50/100), deterministic sorting (e.g. ORDER BY id or created_at), and page/offset or cursor parameters. Valid alternatives: Limit-offset pagination or cursor/keyset pagination. Candidate should note that offset can drift on live insertions.'
  when 'be-j-db-uniqueness' then
    'Core: Explain check-then-insert race condition under concurrency; enforce UNIQUE constraint in DB; catch duplicate key error (code 23505) and return 409 Conflict. Valid alternatives: Atomic upsert (INSERT ... ON CONFLICT DO NOTHING/UPDATE) or transactional lock.'
  when 'be-j-db-index' then
    'Core: Check query execution time, verify user_id filter; an index on user_id replaces a sequential scan with an index scan. Valid alternatives: EXPLAIN ANALYZE, composite indexes if filtering by user and date. Note write/storage overhead of indexes.'
  when 'be-j-concurrency-stock' then
    'Core: Prevent read-modify-write race where both read stock=1. Valid alternatives: (1) Atomic update: UPDATE items SET stock = stock - 1 WHERE id = ? AND stock >= 1, checking affected rows = 1 (preferred); (2) SELECT FOR UPDATE row locking in transaction; (3) Table check constraint CHECK (stock >= 0) catching check violation.'
  when 'be-j-concurrency-retry' then
    'Core: Network timeout does not mean execution failed; client sends unique Idempotency-Key. API stores outcome upon completion; duplicate key returns previous result. Valid alternatives: Unique constraint on idempotency_key or dedicated idempotency middleware table.'
  when 'be-j-reliability-timeout' then
    'Core: Bounded client/request timeout on external HTTP call (e.g. AbortSignal.timeout); fail fast; return 504 Gateway Timeout or retryable 503 Service Unavailable without hanging server threads or falsely claiming order completed.'
  when 'be-j-reliability-logs' then
    'Core: Log request ID, timestamp, endpoint, user ID, status code, error message. Never log: Passwords, authorization tokens, full credit card numbers, or PII. Valid alternatives: Structured JSON logging (pino/winston).'

  -- JUNIOR TECHNO-MANAGERIAL
  when 'be-j-project-deadline' then
    'Core: Prioritize durable core workflows (task saving) over non-essential enhancements (search filters). Communicate early to team/stakeholders with clear trade-offs and agreed demo acceptance criteria.'
  when 'be-j-project-contract' then
    'Core: Avoid unilateral breaking changes; coordinate contract change; support backward compatibility (e.g. return both dueDate and deadline temporarily); establish contract/integration tests to prevent future mismatches.'
  when 'be-j-project-bug' then
    'Core: Do not conceal data loss. Assess severity and reproduction steps; alert team immediately; decide whether demo can proceed with disclosed bounded scope or fix.'
  when 'be-j-project-library' then
    'Core: Weigh benefits vs costs: maintenance overhead, dependency vulnerabilities, bundle/runtime size, team learning curve vs writing 10 lines of native validation code.'

  -- JUNIOR REFLECTION
  when 'be-j-reflect-improve' then
    'Unscored reflection. Look for: self-awareness of a specific gap in an earlier answer, and a practical verification method (e.g. writing a test or consulting docs). Honest answers must not be penalized.'
  when 'be-j-reflect-learning' then
    'Unscored reflection. Look for: realistic learning target, feasible small experiment, and observable success/failure criteria. Encourage technical curiosity.'

  -- INTERMEDIATE ICEBREAKERS
  when 'be-i-intro-design' then
    'Unscored icebreaker. Look for: genuine ownership of a system design, specific trade-offs considered (throughput vs latency, simplicity vs scalability), and concrete metrics/evidence of success.'
  when 'be-i-intro-incident' then
    'Unscored icebreaker. Look for: structured troubleshooting methodology (isolating variables, checking logs/metrics, forming hypotheses) rather than random trial-and-error.'

  -- INTERMEDIATE TECHNICAL
  when 'be-i-api-idempotency' then
    'Core: Atomic reservation of idempotency key with unique constraint; fingerprint/hash request body to detect payload mismatches (409 IDEMPOTENCY_CONFLICT); cache/persist completed outcome. Follow-up: Lost response on commit replays saved outcome without re-executing business logic.'
  when 'be-i-api-versioning' then
    'Core: Expand-contract pattern: add new field while retaining old field; dual-write or transform; monitor usage via metrics/access logs; announce deprecation window (Sunset header); drop old field only after usage hits zero.'
  when 'be-i-db-transfer' then
    'Core: Single database transaction (BEGIN ... COMMIT); atomic balance checks; deadlock prevention by deterministic lock acquisition (e.g. lock accounts in ascending order of ID: LEAST(from, to) then GREATEST(from, to)). Valid alternatives: Conditional updates with balance checks or outbox pattern.'
  when 'be-i-db-query-plan' then
    'Core: Use EXPLAIN (ANALYZE, BUFFERS); composite index column order matters: equality filters first (customer_id, status) followed by range/sort column (created_at). Recognize write amplification and index bloat; test against realistic data distributions.'
  when 'be-i-concurrency-version' then
    'Core: Optimistic concurrency control using version number, timestamp, or ETag. Client sends expected version; server performs UPDATE ... WHERE id = ? AND version = ? returning 409 Conflict (or 412 Precondition Failed) if version mismatch occurs; client refetches and reconciles.'
  when 'be-i-concurrency-worker' then
    'Core: Atomic claim using SELECT ... FOR UPDATE SKIP LOCKED or UPDATE jobs SET status = ''claimed'', worker_id = ?, lease_expires_at = now() + interval ''5m''. Handle worker crash via lease timeout sweeper; ensure external side-effects are idempotent via idempotency keys.'
  when 'be-i-reliability-retries' then
    'Core: Prevent retry storms; use exponential backoff with full jitter; set strict maximum retry limit; implement circuit breaker pattern or backpressure (HTTP 429/503 with Retry-After header) to allow downstream recovery.'
  when 'be-i-reliability-cache' then
    'Core: Cache product read availability with short TTL; authoritative inventory deduction must ALWAYS execute within transactional database lock. Prevent cache stampede via mutex locks, probabilistic early expiration (XFetch), or background cache warming.'

  -- INTERMEDIATE TECHNO-MANAGERIAL
  when 'be-i-project-migration' then
    'Core: Three-phase migration: (1) Expand: add new column/table, deploy dual-write code; (2) Backfill existing rows and verify parity; (3) Contract: switch reads to new schema, stop writes to old, drop deprecated columns after observation period.'
  when 'be-i-project-slo' then
    'Core: Quantify user impact using error budget and SLI/SLO metrics; negotiate with product managers using concrete data; pause feature development for a bounded sprint if error budget is exhausted; agree measurable recovery milestones.'
  when 'be-i-project-buy-build' then
    'Core: Pragmatic trade-off analysis: prototype workload (10 jobs/sec vs 10,000 jobs/sec), operational burden, vendor lock-in, infrastructure cost, and reversibility. Database SKIP LOCKED is often ideal for prototypes; define clear metrics that would trigger migration to managed SQS/Kafka.'
  when 'be-i-project-review' then
    'Core: Explain concrete authorization risk (horizontal privilege escalation / IDOR); collaborate with author on safe minimal fix rather than blocking without guidance; implement automated regression tests (e.g. cross-tenant API tests) before merge.'

  -- INTERMEDIATE REFLECTION
  when 'be-i-reflect-assumption' then
    'Unscored reflection. Look for: identifying a specific architectural assumption (e.g. single-database throughput, in-memory cache size, synchronous calls), paired with a measurable threshold (e.g. p99 > 500ms at 5,000 QPS) that triggers redesign.'
  when 'be-i-reflect-test' then
    'Unscored reflection. Look for: concrete reproducible failure scenario, clear assertion, and intellectual honesty regarding what a passing unit/integration test proves versus what production chaos/concurrency tests still leave unproven.'
  else k.rubric_notes
end
from public.question_versions q
where k.question_version_id = q.id and q.status = 'draft';

commit;
