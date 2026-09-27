-- Additive Question Bank Expansion Migration (Task 5.A)
-- File: supabase/migrations/202609270005_question_bank_expansion.sql
-- Expands the question bank from 32 to 48 reviewed-ready base questions.
-- Adds 16 genuinely new draft questions (8 Junior, 8 Intermediate) across all required stages and topics,
-- and enriches existing draft question keys with concrete 0-4 scoring anchors.
-- Safe and idempotent: does not touch or overwrite published records.
begin;

-- 1. Insert 16 genuinely new question drafts
with new_seed as (
  select value as q from jsonb_array_elements($seed$[
  {
    "id": "be-j-intro-debugging",
    "level": "junior",
    "stage": "icebreaker",
    "topics": [
      "reliability"
    ],
    "prompt": "Describe the hardest bug you have tracked down so far. How did you figure out what was wrong, and what did you change to prevent it from happening again?",
    "followUp": "Did you add automated tests or monitoring after finding the bug?",
    "concepts": [
      "Problem reproduction",
      "Root-cause isolation",
      "Defensive preventative fix"
    ],
    "anchors": {
      "0": "Cannot describe a specific bug or claims they never make mistakes.",
      "1": "Describes a symptom (e.g. syntax error or crash) but relies on random trial-and-error to fix it.",
      "2": "Explains how they reproduced the bug and used logs or print statements to locate the fix.",
      "3": "Demonstrates disciplined debugging: reproduced issue, isolated root cause, applied a targeted fix, and verified resolution.",
      "4": "Exemplary engineering discipline: root-cause analysis, defensive validation to prevent recurrence, and adding regression tests."
    },
    "rubricNotes": "Unscored context/icebreaker. Evaluates debugging mindset, perseverance, and preventative engineering habits."
  },
  {
    "id": "be-j-api-status-codes",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "apis"
    ],
    "prompt": "You are designing REST endpoints for a user management service. Explain when you would return HTTP 400, 401, 403, and 404, and how your response body explains the issue.",
    "followUp": "Why should an API never return detailed database error traces in a 4xx or 5xx response body?",
    "concepts": [
      "Distinguishes 401 unauthenticated vs 403 unauthorized",
      "Appropriate client error semantics",
      "Consistent structured error payload"
    ],
    "anchors": {
      "0": "Cannot distinguish client errors (4xx) from server errors (5xx) or uses 200 for all responses.",
      "1": "Defines 404 correctly, but confuses 401 and 403, or cannot explain what triggers 400.",
      "2": "Correctly defines all 4 codes: 400 (bad input), 401 (missing/invalid token), 403 (valid token, forbidden resource), 404 (not found). Response bodies are plain strings.",
      "3": "Accurately explains all four status codes with realistic examples and provides a structured JSON error envelope (`{ error: { code, message } }`).",
      "4": "Explains subtle nuances: 401 `WWW-Authenticate` header, when to return 404 instead of 403 to prevent resource enumeration, and sanitizing error details to prevent information disclosure."
    },
    "rubricNotes": "Technical scoring. Distinguishing 401 (authentication/identity) from 403 (authorization/permission) is the key discriminator."
  },
  {
    "id": "be-j-db-foreign-keys",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "databases"
    ],
    "prompt": "A teammate suggests removing database foreign key constraints to make test data setup easier. What risks does this create in production, and how else could you make testing easy?",
    "followUp": "What happens to child rows in an orders table when a parent user row is deleted if foreign keys are disabled versus enabled?",
    "concepts": [
      "Referential integrity and orphan records",
      "Cascading actions safety",
      "Database factories or test transactions"
    ],
    "anchors": {
      "0": "Agrees with removing foreign keys without recognizing any production risks.",
      "1": "Says foreign keys should stay, but cannot explain what an orphan record is or how to solve the testing pain.",
      "2": "Explains referential integrity and orphan rows, but offers no practical solutions for testing.",
      "3": "Articulates production risks (orphan records, data corruption, broken joins) and proposes testing alternatives (test factories, seed helpers, truncation scripts, or transactional rollback in tests).",
      "4": "Comprehensive answer: explains ON DELETE CASCADE vs RESTRICT, data consistency guarantees, and recommends clean fixture factories or transactional test rollbacks."
    },
    "rubricNotes": "Technical scoring. Evaluates understanding of database-enforced integrity versus application-level assumptions."
  },
  {
    "id": "be-j-concurrency-counters",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "concurrency"
    ],
    "prompt": "A high-traffic blog has a view counter for articles. Explain why `article.views = article.views + 1` in application code loses counts under concurrent requests, and how to fix it in SQL.",
    "followUp": "If 10,000 users view an article per second, why might direct database updates cause row lock contention?",
    "concepts": [
      "Read-modify-write lost update",
      "Atomic SQL increment `views = views + 1`",
      "Write buffering or asynchronous aggregation"
    ],
    "anchors": {
      "0": "Claims reading a value and writing value + 1 cannot lose counts.",
      "1": "Identifies that concurrent reads happen at the same time, but suggests in-memory locks on a single Node process.",
      "2": "Explains the lost update anomaly and fixes it with atomic SQL: `UPDATE articles SET views = views + 1 WHERE id = ?`.",
      "3": "Clear explanation: both threads read `views = 100`, both compute `101`, last write wins and one count is lost. Fixes with atomic SQL increment in DB engine.",
      "4": "High-scale insight: atomic update solves correctness, but for 10k QPS mentions lock contention and suggests Redis counter (`INCR`) or batching writes."
    },
    "rubricNotes": "Technical scoring. The atomic SQL increment (`SET views = views + 1`) is the core answer; Redis/batching is a bonus."
  },
  {
    "id": "be-j-reliability-health-checks",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "Your microservice has a /health endpoint checked by a load balancer every 5 seconds. What dependencies should be checked, and why should a deep database check be isolated from liveness probes?",
    "followUp": "What happens to your application fleet if every instance simultaneously fails health checks because of a momentary database blip?",
    "concepts": [
      "Liveness vs readiness distinction",
      "Cascading failure risk if DB slows",
      "Fast, bounded health probe response"
    ],
    "anchors": {
      "0": "Runs an expensive heavy query on every 5-second health ping without timeouts.",
      "1": "Mentions checking database connection, but does not understand why health checks can cause cascading failures.",
      "2": "Distinguishes between a shallow ping (is node process alive?) and a dependency check (can it reach database?).",
      "3": "Explains liveness (process alive, restart if dead) vs readiness (ready to accept traffic). Warns that failing liveness on DB hiccup causes load balancer to kill all containers, amplifying the outage.",
      "4": "Production design: separate `/health/live` and `/health/ready`, lightweight non-locking query (`SELECT 1`), strict short timeout (1s), and caching readiness status to prevent probe stampede."
    },
    "rubricNotes": "Technical scoring. Distinguishing process liveness from service readiness prevents cascading outages."
  },
  {
    "id": "be-j-project-tech-debt",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "You notice an existing service endpoint has no unit tests and frequent regressions, but product asks for a new feature on it this week. How do you balance delivering the feature with improving stability?",
    "followUp": "How do you justify writing tests to a non-technical product manager with an urgent feature deadline?",
    "concepts": [
      "Incremental testing before touching legacy code",
      "Characterization tests",
      "Honest timeline estimate with risk communication"
    ],
    "anchors": {
      "0": "Rewrites the entire service from scratch without telling anyone, missing the deadline.",
      "1": "Adds the new feature without writing any tests, hoping it doesn't cause another regression.",
      "2": "Asks for a 2-week freeze to write tests, without accommodating the business deadline.",
      "3": "Pragmatic balance: write characterization tests around existing behavior before adding the feature; include testing in the feature estimate; communicate risk transparently.",
      "4": "Boy Scout rule applied maturely: adds automated regression safety net first; explains testing in terms of delivery speed and preventing future downtime; increments coverage iteratively."
    },
    "rubricNotes": "Techno-managerial scoring. Evaluates ability to negotiate technical debt responsibly within business delivery deadlines."
  },
  {
    "id": "be-j-project-code-review",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "A teammate submits a 1,500-line pull request touching 20 files right before the end of the sprint. How do you approach reviewing it without holding up the team or approving blind bugs?",
    "followUp": "What feedback would you give to help the teammate structure pull requests better in the future?",
    "concepts": [
      "Splitting PR into reviewable chunks",
      "High-risk surface area prioritization",
      "Constructive team feedback and agreement"
    ],
    "anchors": {
      "0": "Rubber-stamps with \"LGTM\" without reading the code to hit sprint goals.",
      "1": "Blocks the PR angrily and refuses to review it.",
      "2": "Tries to read all 1,500 lines line-by-line, getting fatigued and missing critical logic errors.",
      "3": "Tactful and effective: asks author to walk through high-risk areas (database migrations, auth logic); focuses review on core logic and tests; suggests splitting into smaller PRs next time.",
      "4": "Exemplary team collaboration: prioritizes critical risk surfaces, checks automated CI tests, pairs with author on complex parts, and proposes team PR size guidelines constructively."
    },
    "rubricNotes": "Techno-managerial scoring. Evaluates code review diligence, constructive communication, and team process awareness."
  },
  {
    "id": "be-j-reflect-feedback",
    "level": "junior",
    "stage": "reflection",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Think of critical technical feedback you received on code you wrote. What was the critique, how did you respond at the time, and how has it influenced your coding habits since?",
    "followUp": "Has there ever been a time you disagreed with code review feedback, and how did you resolve it?",
    "concepts": [
      "Receptiveness to technical feedback",
      "Objective evaluation of trade-offs",
      "Sustained behavioral improvement"
    ],
    "anchors": {
      "0": "Claims they never received critical feedback or blames others for misunderstandings.",
      "1": "Recalls a critique, but viewed it as a personal attack or complied without understanding why.",
      "2": "Describes a technical critique and acknowledges the reviewer was correct.",
      "3": "Reflects constructively on feedback (e.g. error handling, naming, query performance), explains how they adopted it, and demonstrates ongoing habit changes.",
      "4": "Mature engineering attitude: separates ego from code; seeks out constructive review; explains how disagreement was resolved via objective benchmarks or team standards."
    },
    "rubricNotes": "Unscored context/reflection. Evaluates coachability, emotional maturity, and growth trajectory."
  },
  {
    "id": "be-i-intro-scaling",
    "level": "intermediate",
    "stage": "icebreaker",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Describe a situation where a system you worked on faced unexpected traffic or data volume growth. What broke first, and how did you triage the immediate bottleneck?",
    "followUp": "How did you keep the system partially functional while you deployed the fix?",
    "concepts": [
      "Bottleneck identification",
      "Metrics-driven triage",
      "Short-term relief vs permanent architecture"
    ],
    "anchors": {
      "0": "Cannot describe any scaling challenges or claims systems never have bottlenecks.",
      "1": "Describes a crash, but cannot identify what system component (CPU, memory, DB connections, network) was exhausted.",
      "2": "Identifies the bottleneck (e.g. database connection pool exhaustion) and describes how they scaled vertically or added replicas.",
      "3": "Systematic scaling triage: identified specific bottleneck using metrics; applied immediate relief (rate limiting, connection pooling, caching); then implemented architectural resolution.",
      "4": "High-scale insight: explains saturation metrics, graceful degradation (shedding non-critical load), architectural remediation, and load testing verification."
    },
    "rubricNotes": "Unscored context/icebreaker. Assesses real-world operational experience and ability to triage under pressure."
  },
  {
    "id": "be-i-api-rate-limiting",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "apis",
      "reliability"
    ],
    "prompt": "Design a distributed rate limiter for a public API that limits each API key to 100 requests per minute. Explain your data store, algorithm choice, and how you handle clock skew across server nodes.",
    "followUp": "How do you handle a scenario where your Redis rate-limiting cache temporarily crashes: fail-open or fail-closed?",
    "concepts": [
      "Token bucket or sliding window log",
      "Centralized cache (Redis with Lua script)",
      "HTTP 429 Too Many Requests with Retry-After header"
    ],
    "anchors": {
      "0": "Suggests in-memory counters in a single server process for a multi-node API.",
      "1": "Mentions Redis, but suggests a fixed window counter that permits 2x traffic bursts at window boundaries.",
      "2": "Recommends sliding window or token bucket in Redis, but overlooks race conditions under concurrent requests.",
      "3": "Distributed rate limiting: sliding window counter or token bucket in Redis using atomic Lua script; returns HTTP 429 with `Retry-After` and `X-RateLimit-*` headers; discusses fail-open vs fail-closed policy.",
      "4": "High-throughput architecture: evaluates sliding window counter vs token bucket memory trade-offs, uses atomic Redis Lua scripts to eliminate race conditions, avoids clock skew by relying on Redis server time, and configures fallback circuit breaker."
    },
    "rubricNotes": "Technical scoring. Look for understanding of distributed counters, atomic execution (Lua), and HTTP 429 semantics."
  },
  {
    "id": "be-i-db-sharding-partition",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "databases"
    ],
    "prompt": "A time-series audit log table in PostgreSQL has grown to 500 million rows, making deletions and queries slow. Compare table partitioning (by date) with application-level sharding, and explain how partition pruning improves query performance.",
    "followUp": "How does dropping an old monthly partition compare in terms of disk I/O and table locking versus running `DELETE FROM audit_logs WHERE created_at < ...`?",
    "concepts": [
      "Declarative range partitioning by timestamp",
      "Partition pruning at query execution time",
      "Zero-downtime partition rotation via DROP TABLE instead of DELETE"
    ],
    "anchors": {
      "0": "Suggests running `DELETE FROM table` in a cron job without recognizing vacuum and lock overhead.",
      "1": "Knows partitioning exists, but cannot explain how queries benefit or how partition pruning works.",
      "2": "Recommends declarative range partitioning by month; explains that pruning skips scanning unneeded tables.",
      "3": "Compares partitioning vs sharding: range partitioning is transparent to SQL queries and allows instant cleanup via `DROP TABLE` (metadata-only) instead of vacuum-heavy `DELETE`; pruning skips non-matching partitions during plan execution.",
      "4": "Architectural depth: details declarative partitioning setup, query planner partition pruning verification in `EXPLAIN`, evaluates when sharding across distinct DB nodes is required (write throughput/storage limits), and automation of partition creation."
    },
    "rubricNotes": "Technical scoring. The contrast between expensive transactional `DELETE` + `VACUUM` versus O(1) `DROP TABLE` on old partitions is a key insight."
  },
  {
    "id": "be-i-concurrency-distributed-lock",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "concurrency"
    ],
    "prompt": "Two background workers in different cloud regions must run a scheduled billing batch job, but only one may run at a time. Design a distributed locking mechanism that handles worker crashes without causing permanent deadlocks.",
    "followUp": "What happens if a worker experiences a 30-second garbage collection pause while holding a 20-second lease, and how do fencing tokens resolve this?",
    "concepts": [
      "Lease with TTL / auto-expiry",
      "Heartbeat renewal mechanism",
      "Fencing tokens to reject late stale writes"
    ],
    "anchors": {
      "0": "Suggests a boolean flag in a file or assumes only one container will run.",
      "1": "Sets a lock in Redis without an expiration TTL, risking permanent deadlock if the worker crashes.",
      "2": "Uses a lock with a TTL (e.g. Redis `SET key value NX PX 30000`), but does not account for tasks running longer than the TTL.",
      "3": "Distributed lock design: atomic acquisition with auto-expiring lease TTL; background heartbeat to extend lease while active; release only if lock value matches worker UUID; handles worker crash via TTL expiry.",
      "4": "Deep distributed systems insight: explains Martin Kleppmann's GC pause dilemma, implements monotonic fencing tokens checked by storage layer to reject stale writes from paused workers, and evaluates consensus systems (Raft/Zookeeper/Postgres)."
    },
    "rubricNotes": "Technical scoring. Lease expiration + heartbeat is the baseline; understanding fencing tokens demonstrates top-tier capability."
  },
  {
    "id": "be-i-reliability-circuit-breaker",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "A downstream payment service begins taking 15 seconds per request before returning HTTP 500. Design a circuit breaker pattern (Closed, Open, Half-Open) to protect your API from thread pool starvation.",
    "followUp": "When the circuit breaker is in the Open state, what response do you return to the end user and how do you know when to close it?",
    "concepts": [
      "State machine: Closed -> Open -> Half-Open",
      "Failure threshold and time window",
      "Fast fallback without network hop in Open state"
    ],
    "anchors": {
      "0": "Allows requests to hang for 15 seconds until all server worker threads are exhausted and API crashes.",
      "1": "Adds a timeout, but continues hammering the failing downstream service on every new request.",
      "2": "Explains Closed and Open states, but misses the Half-Open recovery state or fallback response.",
      "3": "Full circuit breaker pattern: Closed (normal), Open (failures exceed threshold, fail fast immediately with 503/fallback), Half-Open (trial requests sent after cooldown to test recovery); prevents thread pool exhaustion.",
      "4": "Enterprise resiliency: error rate windowing, fallback options (queued asynchronous settlement, degraded response), health metrics reporting, and distributed circuit breaking considerations."
    },
    "rubricNotes": "Technical scoring. The three-state machine (Closed, Open, Half-Open) and fast-fail behavior must be explained."
  },
  {
    "id": "be-i-project-incident-postmortem",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "reliability",
      "project_tradeoffs"
    ],
    "prompt": "A bad database migration caused a 45-minute production outage during peak hours. How do you lead a blameless post-mortem meeting and ensure concrete preventative actions are scheduled?",
    "followUp": "How do you handle a situation where executive management demands to know which specific developer ran the migration?",
    "concepts": [
      "Blameless culture focused on process/safeguards",
      "Timeline reconstruction from logs/metrics",
      "Action items with owners: pre-deployment schema verification, automated rollbacks"
    ],
    "anchors": {
      "0": "Points fingers at the developer who clicked run and suggests punishing them.",
      "1": "Holds a meeting, but it devolves into defensiveness and produces no concrete action items.",
      "2": "Reconstructs the timeline of the outage, but action items are vague (e.g. \"be more careful next time\").",
      "3": "Blameless post-mortem leadership: establishes timeline from monitoring; shifts focus from human error to missing systemic guardrails; protects team from blame; produces actionable items (automated migration testing in CI, migration runbook, pre-flight checks).",
      "4": "Engineering cultural excellence: reframes failure as a systemic learning opportunity; creates automated guardrails (e.g. non-blocking DDL linters, canary migrations); tracks preventative action items to completion in sprint planning."
    },
    "rubricNotes": "Techno-managerial scoring. Blameless culture and systemic guardrails over human blame are the essential criteria."
  },
  {
    "id": "be-i-project-architecture-evolution",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "A monolithic service is becoming hard to deploy because three teams commit to it daily. Outline your criteria for deciding when to extract a microservice versus modularizing the monolith, and how you prevent distributed monolith anti-patterns.",
    "followUp": "What is the biggest operational hidden cost teams encounter when moving from a modular monolith to microservices?",
    "concepts": [
      "Clear domain boundaries and independent deployability",
      "Network latency, failure domain, and distributed transaction costs",
      "Modular monolith as a pragmatic intermediate step"
    ],
    "anchors": {
      "0": "Advocates breaking everything into microservices immediately without considering operational complexity.",
      "1": "Suggests microservices, but shares a single database across all services, creating a distributed monolith.",
      "2": "Compares monolith vs microservices on deployment speed, but misses operational costs like distributed tracing, observability, and network latency.",
      "3": "Structured architectural decision: evaluate domain boundaries (DDD); consider modular monolith first (enforcing module boundaries in code); criteria for microservices: independent scaling, different deployment cadences, separate database ownership.",
      "4": "Strategic technical leadership: analyzes the high operational overhead of microservices (distributed tracing, network latency, partial failures, CI/CD pipelines, eventual consistency) and presents a phased, evolutionary roadmap."
    },
    "rubricNotes": "Techno-managerial scoring. Evaluates deep architectural maturity, avoiding microservice hype, and emphasizing modular boundaries."
  },
  {
    "id": "be-i-reflect-tradeoff-regret",
    "level": "intermediate",
    "stage": "reflection",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Describe an architectural decision you made in the past that you now disagree with or would design differently today. What changed your perspective, and what would your revised design look like?",
    "followUp": "What lesson from that experience do you apply when evaluating new designs today?",
    "concepts": [
      "Retrospective critical thinking",
      "Recognition of unintended consequences or scale changes",
      "Technically sound revised design"
    ],
    "anchors": {
      "0": "Claims they have never made an architectural mistake or would never change any past decision.",
      "1": "Mentions a regret, but attributes it solely to bad luck or team members rather than technical design choices.",
      "2": "Describes a design they would change, but the revised approach is vague or introduces equal problems.",
      "3": "Thoughtful retrospective: clearly articulates an original decision (e.g. premature microservices, over-indexing, missing idempotency); explains the unintended consequences; outlines a solid, mature revised design.",
      "4": "Profound engineering maturity: explains the evolution of their mental model, discusses trade-offs with humility, and shares how the lesson directly informs their current architectural evaluation framework."
    },
    "rubricNotes": "Unscored context/reflection. Evaluates wisdom, humility, and ability to learn from architectural missteps."
  }
]$seed$::jsonb)
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
        E'

Scoring Guidance:
0: ', coalesce(new_seed.q->'anchors'->>0, ''),
        E'
1: ', coalesce(new_seed.q->'anchors'->>1, ''),
        E'
2: ', coalesce(new_seed.q->'anchors'->>2, ''),
        E'
3: ', coalesce(new_seed.q->'anchors'->>3, ''),
        E'
4: ', coalesce(new_seed.q->'anchors'->>4, '')
      )
    else
      concat(
        coalesce(new_seed.q->>'rubricNotes', 'Technical scoring guidance.'),
        E'

Scoring Anchors (0-4 Scale):
0: ', coalesce(new_seed.q->'anchors'->>0, ''),
        E'
1: ', coalesce(new_seed.q->'anchors'->>1, ''),
        E'
2: ', coalesce(new_seed.q->'anchors'->>2, ''),
        E'
3: ', coalesce(new_seed.q->'anchors'->>3, ''),
        E'
4: ', coalesce(new_seed.q->'anchors'->>4, '')
      )
  end
from inserted
join new_seed on new_seed.q->>'id' = inserted.question_id
on conflict (question_version_id) do nothing;

-- 2. Update rubric notes for the original 32 draft questions to include 0-4 scoring anchors.
-- Note: 'and v.status = ''draft''' ensures published questions are never modified,
-- preventing trigger violations on immutable published records.

update public.question_keys k
set rubric_notes = 'Unscored context/icebreaker. Look for authentic ownership, clear technical communication, and honest boundaries.

Scoring Anchors (0-4 Scale):
0: No meaningful response or cannot describe any backend code they personally wrote.
1: Describes a project at a high level but cannot clarify personal code contribution versus tutorial template.
2: Explains what the project did and identifies personal code, but offers minimal reflection on limitations.
3: Clearly explains personal contribution, implementation details (routing, data access), and at least one concrete constraint or lesson learned.
4: Outstanding self-awareness: articulates architecture, personal implementation boundaries, trade-offs made under time/skill constraints, and what they would refactor.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-j-intro-project' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Unscored context/icebreaker. Reward intellectual honesty and foundational mental model of web protocols.

Scoring Anchors (0-4 Scale):
0: Cannot articulate the difference between client browser and server backend.
1: States that data goes to a server, but cannot describe routing, validation, or database interaction.
2: Explains HTTP POST request, server parsing, and database saving, but does not acknowledge uncertainty or edge cases.
3: Coherently traces client HTTP POST -> server routing -> body validation -> DB persistence -> HTTP response, acknowledging areas of uncertainty.
4: Deep architectural intuition: highlights network boundaries, security (never trusting client input), serialization, status codes, and areas of assumption.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-j-intro-request' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Technical scoring. Accepts either manual validation or schema validation libraries. Look for defense against malformed payloads and whitespace-only text.

Scoring Anchors (0-4 Scale):
0: Saves incoming body directly to database without any validation or error response.
1: Mentions checking for empty strings, but misses type checks, length bounds, or returns HTTP 500 on validation failure.
2: Validates required fields and types, returning HTTP 400, but omits string trimming and character limits.
3: Comprehensive validation: JSON payload shape, required fields, whitespace trimming, string length bounds (e.g. max 100 chars), returning HTTP 400 or 422 with structured error messages.
4: Production-ready: mentions schema validation libraries (Zod/Joi), sanitization against null bytes/control chars, structured error envelopes, and explicitly handles whitespace-only strings.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-j-api-validation' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Technical scoring. Accepts both limit/offset and keyset/cursor pagination. Look for bounded limits and deterministic sorting.

Scoring Anchors (0-4 Scale):
0: Suggests loading all records into memory and filtering on the frontend.
1: Mentions adding a limit parameter, but does not specify offset/page or default/max limits.
2: Implements limit and offset/page parameters with default limit, but forgets deterministic ordering (ORDER BY).
3: Provides clean limit/offset pagination with enforced maximum limit (e.g. 50/100), deterministic sorting (`ORDER BY created_at, id`), and metadata response (total/next).
4: Recognizes offset drift (duplicate/skipped records upon concurrent insert) and compares offset pagination with keyset/cursor pagination (`WHERE id > cursor`).'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-j-api-pagination' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Technical scoring. The candidate must mention database UNIQUE constraints as the authoritative enforcement mechanism.

Scoring Anchors (0-4 Scale):
0: Claims application-level `if (exists)` check is completely sufficient.
1: Recognizes that duplicates might occur, but suggests sleeping/retrying in code instead of database constraints.
2: Identifies the race condition and recommends adding a database `UNIQUE` constraint on `email`, but does not explain error handling.
3: Explains the concurrent check-then-insert race window, enforces a database `UNIQUE` constraint, and catches the unique violation error (Postgres 23505) to return HTTP 409 Conflict.
4: Compares explicit exception handling (409 Conflict) with atomic upsert (`INSERT ... ON CONFLICT DO NOTHING`), discussing index overhead and case-insensitive email normalization (`lower(email)`).'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-j-db-uniqueness' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Technical scoring. Look for understanding that indexes speed up reads but add storage and write overhead.

Scoring Anchors (0-4 Scale):
0: Suggests buying a bigger server or indexing every column in the table.
1: Suggests adding an index on `user_id` without explaining how to measure or verify query execution.
2: Explains that an index on `user_id` replaces a full table scan with an index scan; mentions using `EXPLAIN`.
3: Systematic approach: run `EXPLAIN ANALYZE`, inspect sequential scan vs index scan, verify index matches filter (`WHERE user_id = ?`), and acknowledge index maintenance write overhead.
4: Advanced junior insight: composite indexes if filtering by user and sorting by date (`user_id, created_at`), selectivity factors, and why planners ignore indexes on tiny tables.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-j-db-index' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Technical scoring. Both atomic conditional updates (`UPDATE ... WHERE stock >= 1`) and pessimistic row locking (`FOR UPDATE`) are valid.

Scoring Anchors (0-4 Scale):
0: Suggests checking `if (stock > 0)` in application code before issuing `UPDATE`.
1: Identifies the race condition, but proposes an in-memory lock or global variable on a single Node server.
2: Suggests a database transaction, but does not use row locking or conditional updates, leaving the race open.
3: Solves the race via: (a) conditional update `UPDATE items SET stock = stock - 1 WHERE id = ? AND stock >= 1` checking affected rows = 1; OR (b) `SELECT stock FROM items WHERE id = ? FOR UPDATE` inside a transaction.
4: Evaluates trade-offs: atomic conditional update (optimistic/lightweight) vs pessimistic row locking (`FOR UPDATE`), handles 0 affected rows with HTTP 409/422 Out of Stock, and mentions `CHECK (stock >= 0)` constraint.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-j-concurrency-stock' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Technical scoring. Look for recognition that network timeouts are ambiguous (the request may have committed).

Scoring Anchors (0-4 Scale):
0: Claims clients should never retry orders, or assumes a timeout means the order failed.
1: Suggests checking if an order with the same total exists for that user in the last minute.
2: Recommends client sends a unique ID (idempotency key), but cannot explain how the server stores or recognizes it.
3: Explains idempotency keys: client sends unique UUID header; backend saves key in DB with unique constraint; retrying returns the stored result instead of creating another order.
4: Comprehensive idempotency design: atomic key reservation, payload fingerprinting to detect conflicts (409 IDEMPOTENCY_CONFLICT), retention TTL, and replaying stored outcomes.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-j-concurrency-retry' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Technical scoring. Look for bounded request timeouts and safe 503/504 status codes.

Scoring Anchors (0-4 Scale):
0: Leaves default socket timeout (forever) or returns a fake success code when shipping hangs.
1: Mentions setting a timeout, but returns HTTP 500 with raw stack trace or claims order was placed.
2: Configures HTTP client timeout (e.g. 5 seconds) and returns HTTP 504 Gateway Timeout or 503 Service Unavailable.
3: Applies explicit timeout (e.g. `AbortSignal.timeout(5000)`), catches timeout exception, returns retryable 504/503 with helpful JSON message, and logs error with request ID.
4: Production resilience: timeout budgeting, distinguishing client timeout vs downstream abort, idempotency on retry, and never fabricating success.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-j-reliability-timeout' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Technical scoring. Excluding secrets/tokens while retaining trace IDs and timestamps is the primary test.

Scoring Anchors (0-4 Scale):
0: Logs full request body including passwords, or suggests logging nothing to save disk space.
1: Lists basic items (timestamp, error), but does not mention request IDs or data privacy exclusions.
2: Logs timestamp, user ID, endpoint, request ID, and error message. Mentions excluding passwords and credit card numbers.
3: Comprehensive logging discipline: structured logs with timestamp (ISO), request/trace ID, user ID, route, HTTP status, execution latency, error stack. Excludes: passwords, API keys, bearer tokens, PII.
4: Enterprise logging: structured JSON logging (Pino/Winston), correlation IDs propagated across services, centralized log ingestion, and automated PII masking.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-j-reliability-logs' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Techno-managerial scoring. Prioritizing durable data integrity over non-essential UI features shows strong engineering instincts.

Scoring Anchors (0-4 Scale):
0: Tries to rush both features in one night with zero testing, risking total demo failure.
1: Chooses a feature randomly or waits for a manager without voicing technical trade-offs.
2: Picks task saving because core persistence matters more than search, but communication to stakeholders is vague.
3: Decisive and communicative: prioritizes durable data saving over search (search is useless if tasks aren''t saved); communicates trade-off early with realistic demo acceptance criteria.
4: Exemplary engineering maturity: explains user impact, defines explicit demo fallback (e.g. search filter disabled in UI), and communicates proactively with clear next-steps.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-j-project-deadline' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Techno-managerial scoring. Emphasizes collaboration, backward compatibility, and automated contract testing.

Scoring Anchors (0-4 Scale):
0: Blames frontend developer or silently changes the field in production without telling anyone.
1: Changes backend field immediately, potentially breaking other consumers.
2: Coordinates with frontend to agree on a name, but does not suggest backward compatibility or automated verification.
3: Pragmatic resolution: agree on field name; support temporary dual-serialization (return both `dueDate` and `deadline`); establish shared OpenAPI/contract specs and integration tests.
4: Engineering leadership: explains contract-first development, shared schemas (Zod/TypeScript contracts), automated schema drift tests in CI, and deprecation timelines.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-j-project-contract' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Techno-managerial scoring. Zero tolerance for concealing data loss. Evaluates integrity, composure, and triage.

Scoring Anchors (0-4 Scale):
0: Conceals the bug and hopes it doesn''t trigger during the demo.
1: Panics and cancels the demo without investigating severity or reproduction conditions.
2: Reports the bug to the team, but cannot formulate a clear reproduction path or workaround.
3: Integrity and triage: reproduces conditions; assesses severity (data loss is critical); immediately informs team/lead with evidence; agrees whether to demo unaffected paths or fix.
4: Senior-level composure: isolates bug trigger (e.g. rapid double-click); provides bounded demo workaround; documents honest bug ticket; prioritizes data integrity above demo optics.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-j-project-bug' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Techno-managerial scoring. Balances pragmatic utility against dependency bloat and maintenance overhead.

Scoring Anchors (0-4 Scale):
0: Adopts any new library immediately because newer is always better.
1: Rejects all libraries out of hand without asking any questions.
2: Asks about library bundle size and popularity, but overlooks maintenance, security, and team learning curve.
3: Asks targeted questions: active maintenance/license, bundle and dependency weight, security vulnerability history, learning curve, and whether a simple 10-line native function suffices.
4: Structured framework evaluation: maintenance cost vs feature benefit, dependency blast radius (supply chain security), team consensus, and proposing a time-boxed spike before adoption.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-j-project-library' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Unscored context/reflection. Reward honest self-assessment and practical verification strategies.

Scoring Anchors (0-4 Scale):
0: Claims all their answers were 100% flawless and nothing could be improved.
1: Says an answer was bad, but cannot articulate why or what they would change.
2: Identifies an answer they were unsure about and gives a general idea of how to research it.
3: Identifies a concrete technical gap (e.g. index type, concurrency race condition) and describes how they would test and verify a revised approach.
4: High self-awareness: precise diagnosis of trade-offs omitted earlier, specific experiment or documentation reference to verify, and positive learning mindset.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-j-reflect-improve' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Unscored context/reflection. Evaluates continuous learning appetite and disciplined experimentation.

Scoring Anchors (0-4 Scale):
0: Cannot name any concept or says they already know everything.
1: Names a vague buzzword (e.g. "AI" or "microservices") without any feasible experiment.
2: Names a relevant backend concept (e.g. database indexes) and describes a simple experiment.
3: Names a focused concept (e.g. connection pool exhaustion, Redis locking); designs a concrete experiment with observable metrics proving success or failure.
4: Exceptional curiosity: clear hypothesis, reproducible test setup (e.g. load testing with Autocannon), measurable thresholds, and reflection on failure insights.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-j-reflect-learning' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Unscored context/icebreaker. Evaluates technical ownership, trade-off clarity, and evidence-based engineering.

Scoring Anchors (0-4 Scale):
0: Describes a system they merely used as a client, with no personal design ownership.
1: Describes a design choice, but cannot explain what constraints shaped it or what alternatives were rejected.
2: Explains their design decision and constraints, but relies on subjective impressions rather than concrete metrics or evidence.
3: Clear architectural ownership: outlines requirements, constraints, alternatives evaluated, and presents measured production results (latency, error rate, throughput).
4: Exemplary architectural maturity: clearly explains trade-offs (simplicity vs scale), shares quantitative operational metrics, and identifies the next bottleneck under 10x traffic.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-i-intro-design' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Unscored context/icebreaker. Look for methodical troubleshooting, telemetry usage, and durable safeguards.

Scoring Anchors (0-4 Scale):
0: Describes a bug fix but cannot explain systematic incident investigation.
1: Describes an incident, but investigation was trial-and-error without metrics or log analysis.
2: Explains symptoms and how they used logs to find the issue, but skips verification and long-term prevention.
3: Disciplined incident investigation: separates symptoms from causes, uses telemetry/logs to validate hypotheses, mitigates impact first, and implements preventative safeguards.
4: Production leadership: root-cause analysis (5 Whys), explains blast radius containment, blameless post-mortem actions, and automated monitoring/alerts added.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-i-intro-incident' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Technical scoring. The candidate must handle both concurrent duplicate requests and payload mismatch conflicts.

Scoring Anchors (0-4 Scale):
0: Does not know what idempotency is or suggests checking if user has any existing orders.
1: Suggests saving a key in memory, but fails on concurrent requests or clustered server environments.
2: Uses an idempotency key in DB, but does not handle concurrent in-flight requests or body mismatches.
3: Production design: unique constraint on idempotency key; hashes/fingerprints request body (returns 409 IDEMPOTENCY_CONFLICT on payload mismatch); persists response outcome to replay on retry.
4: Comprehensive distributed design: atomic lock/reservation pattern, handles in-flight request races with `409 IN_PROGRESS`, persists outcome and headers, defines reasonable TTL, and replays safely even if client disconnected.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-i-api-idempotency' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Technical scoring. The expand-and-contract pattern and traffic observability are the core requirements.

Scoring Anchors (0-4 Scale):
0: Deletes the old field immediately, breaking all active mobile clients.
1: Suggests creating an entirely new `/v2` API for a single field change without explaining deprecation.
2: Applies expand-contract: adds new field alongside old field, but offers no strategy for measuring usage or deciding when to delete.
3: Cohesive backward-compatible migration: expand (add new field, dual-serialize in responses); telemetry (log old field access by client version); announce deprecation window with `Sunset` headers; contract only after traffic drops to zero.
4: Platform excellence: backward-compatible payload evolution, client version telemetry, proactive partner communication, automated schema diffing in CI, and clear removal thresholds.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-i-api-versioning' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Technical scoring. Deterministic lock ordering (e.g. `ORDER BY account_id`) is the key test for deadlock prevention.

Scoring Anchors (0-4 Scale):
0: Updates accounts in separate queries without a database transaction.
1: Uses a transaction, but lacks concurrency locking, allowing negative balances through concurrent debits.
2: Uses transactions and row locking (`SELECT FOR UPDATE`), but fails to recognize or prevent deadlocks when transfers occur in reverse order.
3: Rock-solid transaction: single ACID transaction (`BEGIN ... COMMIT`); checks balance invariants; prevents deadlocks by sorting account IDs before acquiring row locks (e.g. always lock `min(A,B)` then `max(A,B)`).
4: Production banking grade: consistent lock ordering for deadlock elimination, idempotent transfer keys, ledger-based double-entry bookkeeping (append-only ledger rows rather than mutable balance columns), and audit logging.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-i-db-transfer' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Technical scoring. Equality before range/sort in composite indexes and testing with `EXPLAIN ANALYZE` are critical.

Scoring Anchors (0-4 Scale):
0: Creates three separate single-column indexes and assumes database will figure it out.
1: Suggests a composite index, but column ordering is arbitrary and cannot explain index prefix rules.
2: Runs `EXPLAIN ANALYZE`; proposes composite index with equality columns first, but does not evaluate write or storage overhead.
3: Structured analysis: `EXPLAIN (ANALYZE, BUFFERS)`; composite index column order: equality filters first (`customer_id`, `status`) then sort/range (`created_at`); explains left-prefix rule; measures write amplification and index bloat.
4: Database expertise: evaluates partial indexes (e.g. indexing only `status = "pending"`), index-only scans via covering index (`INCLUDE`), verifies selectivity on realistic data, and monitors buffer cache hit ratios.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-i-db-query-plan' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Technical scoring. Both version numbers (409 Conflict) and HTTP ETags / `If-Match` (412 Precondition Failed) are valid.

Scoring Anchors (0-4 Scale):
0: Permits last-write-wins, overwriting previous tab changes silently.
1: Suggests locking the record when opened, not understanding web HTTP statelessness.
2: Includes a version number in request and checks `WHERE version = expected`, but doesn''t handle the conflict response.
3: Optimistic concurrency control: client sends `expected_version` (or `If-Match` ETag); server executes `UPDATE ... WHERE id = ? AND version = ?`; if 0 rows updated, returns HTTP 409 Conflict (or 412); client refetches and reconciles.
4: End-to-end robustness: compares version columns vs ETags, details conflict resolution strategies (three-way merge, field-level merge, or user diff prompt), and ensures monotonic version increment in DB.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-i-concurrency-version' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Technical scoring. Combining atomic claim (`SKIP LOCKED` / lease) with downstream idempotency is the hallmark of intermediate proficiency.

Scoring Anchors (0-4 Scale):
0: Selects pending jobs without locking, letting both workers claim the exact same job.
1: Marks job as processing, but has no recovery mechanism if the worker crashes midway.
2: Uses `SELECT FOR UPDATE SKIP LOCKED` or an atomic claim with a lease timestamp, but lacks idempotency for side effects.
3: Robust worker queue: atomic claim using `SKIP LOCKED` or `UPDATE ... SET status = "claimed", lease_until = now() + 5min`; background reaper reclaims expired leases; downstream actions use idempotency keys to prevent duplicate execution upon retry.
4: Distributed systems mastery: explains at-least-once delivery guarantees, heartbeats for long-running tasks, dead letter queues (DLQ) for poison pills, and transactional outbox for reliable side effects.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-i-concurrency-worker' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Technical scoring. The combination of exponential backoff, jitter, retry limits, and circuit breaking is expected.

Scoring Anchors (0-4 Scale):
0: Retries in an infinite tight loop or retries every failed 4xx request.
1: Uses fixed retry delays, causing synchronized bursts of traffic against the failing service.
2: Implements exponential backoff and caps max attempts, but omits jitter and global retry limits.
3: Resilient retry policy: exponential backoff with full jitter to break up synchronized retry waves; strict retry budget (e.g. max 3 retries, retry only transient 5xx/network errors); circuit breaker to fail-fast when downstream is overwhelmed.
4: Production resilience mastery: explains thundering herd / retry storms, analyzes client retry budgets (limiting retries to 10% of total traffic), dead-lettering, and using `Retry-After` headers.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-i-reliability-retries' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Technical scoring. Separating safe cached catalog browsing from authoritative transactional reservation is the key test.

Scoring Anchors (0-4 Scale):
0: Reads and writes inventory directly from cache with no database backing.
1: Caches everything indefinitely and assumes cache will always be accurate.
2: Uses cache for browsing/catalog with a short TTL, but does not explicitly require DB transaction on purchase.
3: Clear architecture: cache serves high-volume read browsing with acceptable staleness; checkout/reservation MUST bypass cache and lock authoritative database row; handles cache stampede via mutex locks or background warming.
4: Production caching patterns: Cache-Aside vs Write-Through, probabilistic early expiration (XFetch algorithm), cache invalidation via CDC/events, and fallback degradation when cache cluster fails.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-i-reliability-cache' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Techno-managerial scoring. The expand-and-contract pattern is the industry standard for zero-downtime schema evolution.

Scoring Anchors (0-4 Scale):
0: Runs destructive schema change directly in production while API servers are serving live traffic.
1: Takes scheduled maintenance downtime for hours for a routine schema change.
2: Explains adding a new column, but has no plan for backfilling data or managing rolling server updates.
3: Three-phase expand-contract migration: (1) Expand: add nullable column/table, deploy dual-write code; (2) Backfill existing rows and verify parity; (3) Contract: switch reads to new schema, stop writes to old, drop deprecated column after observation.
4: Zero-downtime mastery: detailed blue-green/canary deployment coordination, automated parity verification scripts, rollback plans at each phase, and zero locking on large tables via non-blocking DDL (`CONCURRENTLY`).'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-i-project-migration' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Techno-managerial scoring. Look for data-backed negotiation, user empathy, and constructive prioritization.

Scoring Anchors (0-4 Scale):
0: Blindly builds the feature and ignores production outages, or rudely rejects product managers with no data.
1: Points to an error log, but cannot translate technical errors into business risk or user impact.
2: Explains error rates are high and asks for a refactoring sprint, but lacks clear agreement criteria.
3: SRE-style negotiation: uses SLI/SLO metrics and remaining error budget; frames reliability as user retention; negotiates bounded stabilization sprint with clear exit criteria before resuming feature work.
4: Executive alignment: demonstrates how instability directly impacts revenue/churn, proposes paired delivery (shipping critical bug fixes alongside modular feature scope), and establishes formal error budget policies.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-i-project-slo' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Techno-managerial scoring. Reward pragmatic simplicity for prototypes coupled with clear, metric-driven migration triggers.

Scoring Anchors (0-4 Scale):
0: Insists on Kafka for a prototype with 10 jobs a day, or rejects all cloud services out of dogma.
1: Compares the options superficially without considering operational burden, cost, or workload requirements.
2: Recognizes that Postgres is simpler for a prototype while managed queues scale better, but lacks concrete decision metrics.
3: Pragmatic trade-off framework: prototype volume (e.g. 50 jobs/min) is easily served by Postgres `SKIP LOCKED` without extra infra; managed queue adds operational overhead; defines clear metrics (e.g. 5,000 QPS, table bloat) to trigger migration.
4: Principal-level pragmatism: evaluates total cost of ownership (TCO), vendor lock-in, transactional outbox advantages of DB queues (atomic DB write + enqueue), and reversibility of architectural decisions.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-i-project-buy-build' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Techno-managerial scoring. Evaluates ability to hold security boundaries while collaborating on deliverable solutions.

Scoring Anchors (0-4 Scale):
0: Approves the PR to hit demo deadline, introducing critical security vulnerability.
1: Rejects PR aggressively without helping the author find an alternative safe fix for the demo.
2: Explains the authorization security risk (IDOR), but leaves the author stuck with a broken demo.
3: Collaborative security leadership: explains the concrete authorization vulnerability (cross-user data leak); pairs with teammate to diagnose why the check failed and implement the minimal safe fix; adds automated cross-user test.
4: Security champion: balances business urgency with uncompromising data security; delivers working demo fix; introduces automated multi-tenant authorization tests in CI to permanently prevent regression.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-i-project-review' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Unscored context/reflection. Rewarding honest architectural humility, quantitative thresholds, and awareness of scale limits.

Scoring Anchors (0-4 Scale):
0: Cannot identify any assumptions or claims their designs are infinitely scalable.
1: Names a vague scaling challenge (e.g. "too much data") without any specific metric or trigger.
2: Identifies an assumption (e.g. single database read replica), but lacks an observable threshold trigger.
3: Self-aware architectural critique: identifies a concrete assumption (e.g. in-memory caching capacity, synchronous database calls); defines an observable threshold (e.g. p99 latency > 300ms, DB connection pool > 80%) that triggers refactoring.
4: Mastery of operational boundaries: clearly articulates failure modes of current design, defines leading indicator telemetry, and outlines the planned architectural transition when thresholds are crossed.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-i-reflect-assumption' and v.status = 'draft';

update public.question_keys k
set rubric_notes = 'Unscored context/reflection. Evaluates testing philosophy, boundary awareness, and intellectual honesty.

Scoring Anchors (0-4 Scale):
0: Claims testing failure cases is impossible or unnecessary if code is written well.
1: Describes a generic test that only checks happy paths without asserting failure conditions.
2: Outlines a test for a failure case (e.g. concurrent order requests), but cannot articulate what remains unproven.
3: Crisp testing design: defines smallest reproducible test (e.g. two concurrent `Promise.all` requests against 1 stock); asserts exact expected error code; honestly articulates what passes (code logic) vs what remains unproven (network jitter, distributed clock skew).
4: Testing excellence: differentiates unit, integration, and chaos testing boundaries; addresses non-deterministic timing via repeat loops or transactional fault injection; explains the limits of automated testing.'
from public.question_versions v
where k.question_version_id = v.id and v.question_id = 'be-i-reflect-test' and v.status = 'draft';

commit;
