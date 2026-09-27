# PanelIQ Question Bank Audit & Review Guide

This document contains the complete audit, review table, coverage analysis, and publishing procedure for the 32 PanelIQ `backend_developer` interview question drafts.

---

## 1. Audit & Coverage Summary

All 32 questions in the seed catalog have been audited across technical correctness, level alignment, stage balance, rubric guidance, and candidate edge cases:

- **Total Questions Audited:** 32 (16 Junior, 16 Intermediate).
- **Domain & Role:** `computer_science` / `backend_developer`.
- **Duplicate Check:** 32 unique question IDs, 32 unique prompt texts. Zero duplicate prompts.
- **Stage Distribution:** Exactly matches the eight-turn interview architecture (1 icebreaker, 4 technical across distinct topics, 2 techno-managerial, 1 reflection).
- **Topic Coverage:** All four technical topics (`apis`, `databases`, `concurrency`, `reliability`) and managerial trade-offs (`project_tradeoffs`) are represented at both experience levels.
- **Missing Coverage:** **None.** The bank contains enough questions to generate two completely disjoint eight-turn interviews per level (32 total questions = 4 full interview plans).

---

## 2. Eight-Turn Minimum Coverage & Priority Review List

To satisfy the minimum bank requirements for live sessions (`verify:sessions`), at least **8 Junior** and **8 Intermediate** questions must be reviewed and published (1 icebreaker, 4 technical, 2 techno-managerial, 1 reflection per level).

### Priority Set 1: Unlocks Junior Interview (Plan J-1)

| Turn | Stage | Role | Topic | Question ID | Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `icebreaker` | Chair | `project_tradeoffs` | `be-j-intro-project` | Describe a small backend project you personally built. |
| 2 | `technical` | Technical | `apis` | `be-j-api-validation` | Validate input for `POST /tasks` and return safe 4xx errors. |
| 3 | `technical` | Technical | `databases` | `be-j-db-uniqueness` | Prevent duplicate email registration using DB constraints. |
| 4 | `technical` | Technical | `concurrency` | `be-j-concurrency-stock` | Prevent selling negative inventory using conditional updates. |
| 5 | `technical` | Technical | `reliability` | `be-j-reliability-timeout` | Set bounded timeouts on external shipping provider calls. |
| 6 | `techno_managerial` | Project | `project_tradeoffs` | `be-j-project-deadline` | Prioritize core task saving over search filters with 1 day left. |
| 7 | `techno_managerial` | Project | `apis`, `project_tradeoffs` | `be-j-project-contract` | Resolve frontend `dueDate` vs backend `deadline` field mismatch. |
| 8 | `reflection` | Chair | `project_tradeoffs` | `be-j-reflect-improve` | Identify an earlier answer to improve and how to verify it. |

### Priority Set 2: Unlocks Intermediate Interview (Plan I-1)

| Turn | Stage | Role | Topic | Question ID | Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `icebreaker` | Chair | `project_tradeoffs` | `be-i-intro-design` | Describe an owned backend design decision, constraints, and metrics. |
| 2 | `technical` | Technical | `apis`, `concurrency` | `be-i-api-idempotency` | Design `POST /orders` idempotency keys and handle concurrent duplicate requests. |
| 3 | `technical` | Technical | `databases`, `concurrency` | `be-i-db-transfer` | Execute atomic fund transfers with deterministic deadlock prevention. |
| 4 | `technical` | Technical | `concurrency` | `be-i-concurrency-version` | Optimistic locking using version numbers or ETags for concurrent tab edits. |
| 5 | `technical` | Technical | `reliability` | `be-i-reliability-retries` | Bounded retries with exponential backoff and jitter to avoid retry storms. |
| 6 | `techno_managerial` | Project | `project_tradeoffs`, `databases` | `be-i-project-migration` | Zero-downtime expand-contract database schema migration. |
| 7 | `techno_managerial` | Project | `project_tradeoffs`, `reliability` | `be-i-project-slo` | Negotiate feature work vs reliability debt using SLO error budgets. |
| 8 | `reflection` | Chair | `project_tradeoffs` | `be-i-reflect-assumption` | Identify a scaling assumption and an observable metric threshold to revisit it. |

*Reviewing and publishing these 16 priority questions immediately unblocks live session creation and passes all automated checks. The remaining 16 questions (Secondary Set below) provide disjoint variety for second attempts.*

---

## 3. Complete Review Table (All 32 Questions)

### Junior Questions (16 Total)

| ID | Level & Stage | One-Sentence Summary | Essential Answer Points (Beginner-Friendly) | Correction / Enhancement Made | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `be-j-intro-project` | Junior · `icebreaker` | Describes a backend project personally built and its limitations. | Clearly define what the project did, what specific code you wrote vs library code, and one honest lesson learned. | Clarified in rubric that this is unscored and measures clarity, not candidate prestige. | **Ready for my review** |
| `be-j-intro-request` | Junior · `icebreaker` | Explains what happens on the backend when submitting a web form. | Client sends HTTP POST over network; server routes request, parses body, validates fields, writes to DB, returns HTTP 200/201 JSON. | Clarified in rubric to accept honest statements of uncertainty without penalty. | **Ready for my review** |
| `be-j-api-validation` | Junior · `technical` | Validates input for `POST /tasks` and returns standard 4xx response. | Check presence, correct data types, trim whitespace, enforce length limits; return HTTP 400 Bad Request or 422 with actionable errors. | Added follow-up probe regarding whitespace-only titles; added Zod/Joi alternatives to rubric. | **Ready for my review** |
| `be-j-api-pagination` | Junior · `technical` | Explains how to paginate a 100,000-record task list. | Never return full table; accept `limit` and `offset` (or cursor); enforce max page size (e.g. 50); sort deterministically (`ORDER BY id`). | Added follow-up on insertion drift during offset pagination; added keyset/cursor alternative. | **Ready for my review** |
| `be-j-db-uniqueness` | Junior · `technical` | Explains why check-before-insert fails under concurrent email registrations. | Two requests check simultaneously, both see email absent, both insert; fix with database `UNIQUE` constraint and catch error 23505 (409 Conflict). | Added follow-up on HTTP status code; documented atomic upsert (`ON CONFLICT`) as valid alternative. | **Ready for my review** |
| `be-j-db-index` | Junior · `technical` | Explains how to investigate slow queries and when a `user_id` index helps. | Check query time / EXPLAIN; sequential scan reads whole table; B-tree index on `user_id` lets DB jump directly to user records; note index write overhead. | Added follow-up on why query planner might still pick sequential scan on small tables. | **Ready for my review** |
| `be-j-concurrency-stock` | Junior · `technical` | Prevents overselling when 1 item is left and two buyers checkout simultaneously. | Prevent read-modify-write race. Atomic update: `UPDATE items SET stock = stock - 1 WHERE id = ? AND stock >= 1` checking affected rows = 1. | Added follow-up on handling 0 affected rows; documented `SELECT FOR UPDATE` and `CHECK (stock >= 0)` as alternatives. | **Ready for my review** |
| `be-j-concurrency-retry` | Junior · `technical` | Prevents duplicate order creation when a client retries after a timeout. | Network timeout doesn't mean failure. Client sends unique `Idempotency-Key`; backend stores outcome; retry with same key returns stored result. | Added follow-up on key retention TTL and payload mismatch handling (409 Conflict). | **Ready for my review** |
| `be-j-reliability-timeout` | Junior · `technical` | Prevents backend from hanging indefinitely when calling an unresponsive third party. | Set bounded HTTP timeout (e.g. 5s); fail fast; return 504 Gateway Timeout or 503 to client; never leave socket open or falsely claim order succeeded. | Added follow-up on distinguishing downstream timeout from local thread pool exhaustion. | **Ready for my review** |
| `be-j-reliability-logs` | Junior · `technical` | Identifies what to log and what to exclude when troubleshooting an error. | Do log: Request ID, timestamp, endpoint, user ID, status code, error message. Never log: Passwords, authorization tokens, credit cards, or PII. | Added follow-up on correlation IDs across microservices; added structured JSON logging notes. | **Ready for my review** |
| `be-j-project-deadline` | Junior · `techno_managerial` | Manages scope when only 1 day remains for saving and filters. | Protect durable core workflow (task saving) over enhancements (search filters). Communicate early with clear risks and agreed demo acceptance checklist. | Added follow-up on how to communicate the scope adjustment to non-technical stakeholders. | **Ready for my review** |
| `be-j-project-contract` | Junior · `techno_managerial` | Resolves mismatch between frontend `dueDate` and API `deadline`. | Avoid unilateral breaking changes; coordinate contract; support backward compatibility (return both fields temporarily); add automated contract tests. | Added follow-up on automated CI contract testing to prevent future field mismatches. | **Ready for my review** |
| `be-j-project-bug` | Junior · `techno_managerial` | Handles discovery of a data-loss bug right before a major demo. | Never conceal data loss. Reproduce and assess severity; alert team; decide if demo can proceed with disclosed bounded scope or fix before proceeding. | Added follow-up on safely capturing reproduction telemetry without exposing candidate data. | **Ready for my review** |
| `be-j-project-library` | Junior · `techno_managerial` | Evaluates introducing a new framework for a small validation problem. | Compare benefits vs costs: maintenance, dependency vulnerabilities, package size, and learning curve vs writing a simple 10-line native validation function. | Added follow-up on evaluating transitive dependency risk. | **Ready for my review** |
| `be-j-reflect-improve` | Junior · `reflection` | Identifies an answer today that could be improved and how to verify it. | Demonstrates self-awareness by picking a specific gap; outlines a concrete verification step (e.g. writing a test or checking docs). | Clarified in rubric that honest acknowledgment of gaps receives full credit. | **Ready for my review** |
| `be-j-reflect-learning` | Junior · `reflection` | Proposes a small experiment to practice a backend concept learned today. | Names a specific topic (e.g. SQL indexes); proposes a feasible experiment with measurable observable outcomes. | Unscored guidance updated to reward technical curiosity and disciplined experimentation. | **Ready for my review** |

---

### Intermediate Questions (16 Total)

| ID | Level & Stage | One-Sentence Summary | Essential Answer Points (Beginner-Friendly) | Correction / Enhancement Made | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `be-i-intro-design` | Intermediate · `icebreaker` | Describes an owned backend design decision, constraints, and metrics. | Shows architectural ownership; explains trade-offs (throughput vs latency, simplicity vs complexity); shares concrete measured outcomes. | Unscored rubric updated to focus on measured trade-offs rather than tech buzzwords. | **Ready for my review** |
| `be-i-intro-incident` | Intermediate · `icebreaker` | Explains troubleshooting methodology during a past system incident. | Demonstrates structured debugging: separating symptoms from hypotheses, using logs/metrics, isolating variables rather than guessing. | Unscored rubric updated to assess evidence-based investigation. | **Ready for my review** |
| `be-i-api-idempotency` | Intermediate · `technical` | Designs atomic idempotency for `POST /orders` under concurrent requests. | Reserve key atomically with unique DB constraint; hash request body to reject payload conflicts (409); persist outcome to replay on reconnect. | Follow-up explains replaying saved response when commit succeeds but client network drops. | **Ready for my review** |
| `be-i-api-versioning` | Intermediate · `technical` | Deprecates and replaces a public API field without breaking mobile clients. | Expand-contract migration: add new field alongside old; support dual-write/read; monitor old field traffic via logs; announce deprecation window (Sunset header). | Added follow-up on Sunset HTTP headers and API gateway telemetry. | **Ready for my review** |
| `be-i-db-transfer` | Intermediate · `technical` | Implements an atomic fund transfer preventing partial updates or deadlocks. | Wrap in single DB transaction; balance check; acquire account locks in consistent sorted order (e.g. lower account ID first) to eliminate deadlocks. | Added follow-up on concurrent reciprocal transfers (A->B and B->A); documented outbox pattern. | **Ready for my review** |
| `be-i-db-query-plan` | Intermediate · `technical` | Evaluates composite index ordering for `customer_id`, `status`, `created_at`. | Equality filters come first (`customer_id`, `status`), followed by range/sort (`created_at`); test with EXPLAIN ANALYZE; account for index write amplification. | Added follow-up on index column prefix rules when filtering by status alone. | **Ready for my review** |
| `be-i-concurrency-version` | Intermediate · `technical` | Designs optimistic concurrency to prevent lost updates across browser tabs. | Record has version number or timestamp; client sends expected version; server executes `UPDATE ... WHERE id = ? AND version = ?`; returns 409 if stale. | Documented ETag / `If-Match` (412 Precondition Failed) as valid HTTP-native alternative. | **Ready for my review** |
| `be-i-concurrency-worker` | Intermediate · `technical` | Coordinates multiple job workers preventing duplicate processing and crash leaks. | Atomic job claim with `SELECT ... FOR UPDATE SKIP LOCKED` and lease expiry; background sweeper reclaims expired leases; downstream actions use idempotency. | Added follow-up on crash recovery after external side-effect has committed. | **Ready for my review** |
| `be-i-reliability-retries` | Intermediate · `technical` | Bounds retries to prevent cascading failure and retry storms during an outage. | Combine timeout with exponential backoff and randomized jitter; cap maximum attempts; implement circuit breaker or return 429/503 with `Retry-After`. | Added follow-up on why backoff without jitter causes synchronized pulse storms. | **Ready for my review** |
| `be-i-reliability-cache` | Intermediate · `technical` | Balances cached product reads with authoritative stock inventory checks. | Read-heavy catalogue uses cache with short TTL; purchase reservation MUST bypass cache and lock authoritative DB row. Prevent cache stampede via mutex locks. | Added follow-up on cache stampede / thundering herd mitigation strategies. | **Ready for my review** |
| `be-i-project-migration` | Intermediate · `techno_managerial` | Executes zero-downtime DB schema change across rolling application versions. | Three steps: (1) Expand: add nullable column/table; (2) Backfill and dual-write; (3) Contract: switch reads, stop writes to old column, drop deprecated column. | Added follow-up on exact safety milestone for dropping backward-compatibility triggers. | **Ready for my review** |
| `be-i-project-slo` | Intermediate · `techno_managerial` | Negotiates feature delivery vs reliability work using error budgets. | Use SLI/SLO metrics to quantify customer impact; negotiate with product managers using remaining error budget; pause non-critical features if budget is breached. | Added follow-up on distinguishing localized network anomalies from systemic regressions. | **Ready for my review** |
| `be-i-project-buy-build` | Intermediate · `techno_managerial` | Compares Postgres-backed queue vs managed message queue for a prototype. | Compare throughput, operational overhead, vendor lock-in, and reversibility. Postgres `SKIP LOCKED` is great for simple prototypes; identify metrics that trigger SQS/Kafka. | Added follow-up on telemetry signals that justify migrating to a dedicated message broker. | **Ready for my review** |
| `be-i-project-review` | Intermediate · `techno_managerial` | Reviews a PR where an engineer bypassed auth checks to fix a demo bug. | Explain the IDOR / cross-tenant security vulnerability; collaborate on minimal safe fix; require automated cross-user authorization tests before approving. | Added follow-up on automated static analysis and lint rules to prevent auth bypasses. | **Ready for my review** |
| `be-i-reflect-assumption` | Intermediate · `reflection` | Identifies an architectural assumption that could fail at 10x scale. | Identifies specific constraint (e.g. single Postgres writer, synchronous API calls) paired with an observable metric threshold (e.g. connection pool exhaustion). | Unscored guidance updated to reward concrete quantitative threshold identification. | **Ready for my review** |
| `be-i-reflect-test` | Intermediate · `reflection` | Outlines the smallest test to reveal a concurrency or reliability failure. | Defines reproducible failure test, assertions, and honestly states what unit tests prove vs what distributed chaos testing still leaves unproven. | Unscored guidance updated to assess testing boundary awareness. | **Ready for my review** |

---

## 4. Human Reviewer Publishing Procedure

To preserve audit integrity, **no questions are published automatically**. The human reviewer must explicitly approve questions and record their genuine name.

### Step 1: Apply Content Corrections Migration

In Supabase Dashboard → **SQL Editor** → **New query**, run:
[supabase/migrations/202609270004_question_bank_content_corrections.sql](file:///c:/Users/adity/OneDrive/Desktop/paneliq/backend/supabase/migrations/202609270004_question_bank_content_corrections.sql)

*(This updates draft rubric notes and follow-ups in `public.question_keys` and `public.question_versions`).*

### Step 2: Publish Approved Questions

In Supabase Dashboard → **SQL Editor**, run the update query below.
> **IMPORTANT:** Replace `'YOUR ACTUAL NAME'` with your real name (e.g. `'Aditya Haswani'`). Never leave placeholder text or use `'AI'`.

#### Option A: Publish the 16 Priority Questions (Unlocks First Interviews)

```sql
update public.question_versions
set reviewed_by = 'YOUR ACTUAL NAME',
    reviewed_at = now(),
    status = 'published'
where version = 1
  and status = 'draft'
  and question_id in (
    -- Junior Priority (Plan J-1)
    'be-j-intro-project',
    'be-j-api-validation',
    'be-j-db-uniqueness',
    'be-j-concurrency-stock',
    'be-j-reliability-timeout',
    'be-j-project-deadline',
    'be-j-project-contract',
    'be-j-reflect-improve',
    -- Intermediate Priority (Plan I-1)
    'be-i-intro-design',
    'be-i-api-idempotency',
    'be-i-db-transfer',
    'be-i-concurrency-version',
    'be-i-reliability-retries',
    'be-i-project-migration',
    'be-i-project-slo',
    'be-i-reflect-assumption'
  );
```

#### Option B: Publish All 32 Audited Questions (Recommended)

```sql
update public.question_versions
set reviewed_by = 'YOUR ACTUAL NAME',
    reviewed_at = now(),
    status = 'published'
where version = 1
  and status = 'draft';
```

### Step 3: Verify Publication in Database

Run this verification query in Supabase SQL Editor:
```sql
select experience_level, stage, status, count(*)
from public.question_versions
group by experience_level, stage, status
order by experience_level, stage, status;
```

Expected output:
- Junior: at least 1 icebreaker, 4 technical, 2 techno_managerial, 1 reflection with `status = 'published'`.
- Intermediate: at least 1 icebreaker, 4 technical, 2 techno_managerial, 1 reflection with `status = 'published'`.

---

## 5. Post-Publication Verification Command

Once the update query has been executed in Supabase, run the full session verification script from `paneliq/backend`:

```powershell
npm.cmd run verify:sessions
```

This script will verify:
- Migration visibility
- Catalog and reviewed bank quotas
- Junior and Intermediate profile setup
- Eight-turn interview creation and persistence
- Concurrency, idempotency, and rollback checks
- Two-user isolation and transcript freezing
