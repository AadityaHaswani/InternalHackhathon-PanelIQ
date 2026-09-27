# PanelIQ Question Bank Audit & Review Guide (Task 5.A Expanded)

This document contains the complete audit, review table, coverage analysis, constraint scenarios, retry variants, and publishing procedure for the 48 PanelIQ `backend_developer` interview question drafts.

---

## 1. Audit & Coverage Summary

All 48 questions in the expanded seed catalog have been audited across technical correctness, level alignment, stage balance, rubric guidance, observable 0–4 scoring anchors, and candidate edge cases:

- **Total Base Questions Audited:** 48 (24 Junior, 24 Intermediate) — meets PRD 40–60 content gate.
- **Domain & Role:** `computer_science` / `backend_developer`.
- **Duplicate Check:** 48 unique question IDs, 48 unique prompt texts. Zero duplicate prompts.
- **Stage Distribution:** Exactly matches the eight-turn interview architecture (1 icebreaker, 4 technical, 2 techno-managerial, 1 reflection).
- **Topic Coverage:** All four technical topics (`apis`, `databases`, `concurrency`, `reliability`) and managerial trade-offs (`project_tradeoffs`) are represented at both experience levels.
- **Scored Questions with 0–4 Anchors:** 48 / 48 (100% of questions have concrete observable expectations at every scale point 0–4).
- **Constraint Scenarios Data:** 8 scenarios (4 Junior, 4 Intermediate) covering offline kiosks, traffic spikes, log storage costs, cache stampedes, distributed Sagas, multi-region split-brain, and eventual consistency.
- **Comparable Retry Variants:** 8 paired question sets covering core demo topics without superficial single-word swaps.
- **Missing Coverage:** **None.** The bank contains enough questions to generate **three completely disjoint eight-turn interviews per level** (48 total questions = 6 distinct interview plans).

---

## 2. Eight-Turn Interview Plans & Priority Review Lists

### Junior Interview Plans (24 Questions Total)

#### Plan J-1 (Priority Set 1)
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

#### Plan J-2 (Secondary Set)
| Turn | Stage | Role | Topic | Question ID | Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `icebreaker` | Chair | `apis` | `be-j-intro-request` | Explain request flow when submitting a web form. |
| 2 | `technical` | Technical | `apis` | `be-j-api-pagination` | Implement bounded offset/cursor pagination for 100k tasks. |
| 3 | `technical` | Technical | `databases` | `be-j-db-index` | Investigate slow queries and evaluate `user_id` B-tree index. |
| 4 | `technical` | Technical | `concurrency`, `apis` | `be-j-concurrency-retry` | Prevent duplicate orders using client idempotency keys. |
| 5 | `technical` | Technical | `reliability` | `be-j-reliability-logs` | What to log and what credentials/PII to exclude during triage. |
| 6 | `techno_managerial` | Project | `reliability`, `project_tradeoffs` | `be-j-project-bug` | Triage and report a data-loss bug discovered right before demo. |
| 7 | `techno_managerial` | Project | `project_tradeoffs` | `be-j-project-library` | Evaluate introducing a new framework for a small validation task. |
| 8 | `reflection` | Chair | `reliability` | `be-j-reflect-learning` | Propose an experiment to practice a backend concept learned today. |

#### Plan J-3 (Tertiary Set)
| Turn | Stage | Role | Topic | Question ID | Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `icebreaker` | Chair | `reliability` | `be-j-intro-debugging` | Describe the hardest bug tracked down and preventative fixes. |
| 2 | `technical` | Technical | `apis` | `be-j-api-status-codes` | Distinguish HTTP 400, 401, 403, and 404 in REST endpoints. |
| 3 | `technical` | Technical | `databases` | `be-j-db-foreign-keys` | Evaluate production risks of removing foreign key constraints. |
| 4 | `technical` | Technical | `concurrency` | `be-j-concurrency-counters` | Explain lost updates on view counters and fix with atomic SQL. |
| 5 | `technical` | Technical | `reliability` | `be-j-reliability-health-checks` | Distinguish liveness vs readiness probes to prevent cascading outages. |
| 6 | `techno_managerial` | Project | `project_tradeoffs` | `be-j-project-tech-debt` | Balance adding a feature on legacy code with writing safety tests. |
| 7 | `techno_managerial` | Project | `project_tradeoffs` | `be-j-project-code-review` | Review a 1,500-line PR without blocking the sprint or blind approval. |
| 8 | `reflection` | Chair | `project_tradeoffs` | `be-j-reflect-feedback` | Reflect on critical technical feedback received and behavioral impact. |

---

### Intermediate Interview Plans (24 Questions Total)

#### Plan I-1 (Priority Set 2)
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

#### Plan I-2 (Secondary Set)
| Turn | Stage | Role | Topic | Question ID | Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `icebreaker` | Chair | `reliability` | `be-i-intro-incident` | Methodical investigation of an outage, separating symptoms from causes. |
| 2 | `technical` | Technical | `apis` | `be-i-api-versioning` | Deprecate and replace a public API field without breaking mobile clients. |
| 3 | `technical` | Technical | `databases` | `be-i-db-query-plan` | Optimize composite index column ordering and inspect query plan buffers. |
| 4 | `technical` | Technical | `concurrency`, `reliability` | `be-i-concurrency-worker` | Coordinate job workers with `SKIP LOCKED`, leases, and downstream idempotency. |
| 5 | `technical` | Technical | `reliability`, `databases` | `be-i-reliability-cache` | Balance cached catalog reads with authoritative transactional DB checks. |
| 6 | `techno_managerial` | Project | `project_tradeoffs` | `be-i-project-buy-build` | Compare Postgres `SKIP LOCKED` queue vs managed SQS/Kafka for a prototype. |
| 7 | `techno_managerial` | Project | `project_tradeoffs`, `apis` | `be-i-project-review` | Review a PR where an engineer bypassed auth checks to fix a demo bug. |
| 8 | `reflection` | Chair | `reliability` | `be-i-reflect-test` | Outline smallest test to reveal a failure case and test boundary limits. |

#### Plan I-3 (Tertiary Set)
| Turn | Stage | Role | Topic | Question ID | Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `icebreaker` | Chair | `project_tradeoffs` | `be-i-intro-scaling` | Triage unexpected traffic growth and identify the immediate bottleneck. |
| 2 | `technical` | Technical | `apis`, `reliability` | `be-i-api-rate-limiting` | Design a distributed rate limiter in Redis with sliding windows or token buckets. |
| 3 | `technical` | Technical | `databases` | `be-i-db-sharding-partition` | Range partitioning by timestamp vs sharding for 500M audit log rows. |
| 4 | `technical` | Technical | `concurrency` | `be-i-concurrency-distributed-lock` | Design distributed locking with TTL leases, heartbeats, and fencing tokens. |
| 5 | `technical` | Technical | `reliability` | `be-i-reliability-circuit-breaker` | Design a circuit breaker pattern (Closed, Open, Half-Open) for slow upstreams. |
| 6 | `techno_managerial` | Project | `reliability`, `project_tradeoffs` | `be-i-project-incident-postmortem` | Lead a blameless post-mortem meeting following a bad DB migration outage. |
| 7 | `techno_managerial` | Project | `project_tradeoffs` | `be-i-project-architecture-evolution` | Decide when to extract microservices vs modularize a monolith. |
| 8 | `reflection` | Chair | `project_tradeoffs` | `be-i-reflect-tradeoff-regret` | Retrospective critique of an architectural decision you would design differently. |

---

## 3. Constraint Scenarios (8 Total)

These 8 scenarios satisfy the PRD Task 6 data requirements:

| Scenario ID | Level | Topic | Baseline Question | Changed Constraint | Core Reasoning Evaluated |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `scen-j-db-offline` | Junior | `concurrency` | `be-j-concurrency-stock` | Kiosks operate offline with delayed sync. | Inventory pre-allocation, optimistic sales with compensation/backorders. |
| `scen-j-api-traffic-spike` | Junior | `apis` | `be-j-api-pagination` | Traffic surges to 50k QPS; 1k tasks/min added. | Index scan vs seek; keyset cursor pagination prevents offset drift. |
| `scen-j-storage-cost` | Junior | `reliability` | `be-j-reliability-logs` | Log storage costs exceed budget by 400%. | Log sampling, dynamic log levels, non-blocking asynchronous log shipping. |
| `scen-j-read-heavy-cache` | Junior | `databases` | `be-j-db-index` | 99% of requests query same 10 celebrity users. | In-memory Redis cache with TTL absorbs read load to protect DB CPU. |
| `scen-i-distributed-transfer` | Intermediate | `databases` | `be-i-db-transfer` | Accounts split across independent DB clusters. | Saga pattern with compensating transactions, transactional outbox pattern. |
| `scen-i-idempotency-cluster` | Intermediate | `apis` | `be-i-api-idempotency` | Active-active across 3 AWS regions with 200ms lag. | Regional key affinity routing, distributed consensus vs reconciliation. |
| `scen-i-cache-stampede-burst` | Intermediate | `reliability` | `be-i-reliability-cache` | 500k users refresh at exact second cache expires. | Mutex locking on cache miss, probabilistic early recomputation (XFetch). |
| `scen-i-eventual-consistency-search` | Intermediate | `concurrency` | `be-i-concurrency-worker` | Search index has 2-second refresh lag. | Read-your-own-writes consistency, returning entity from write API directly. |

---

## 4. Comparable Retry Variants (8 Pairs)

These 8 pairs test the same underlying architectural skill with distinct problem domains (for PRD Task 8 retry workflows):

| Topic | Level | Primary Question ID | Comparable Variant ID | Skill Tested |
| :--- | :--- | :--- | :--- | :--- |
| Concurrency & Race Conditions | Junior | `be-j-concurrency-stock` | `be-j-concurrency-counters` | Preventing read-modify-write lost updates under concurrent access |
| Idempotency & Retries | Junior / Interm. | `be-j-concurrency-retry` | `be-i-api-idempotency` | Designing idempotency mechanisms to safely handle network retry duplicates |
| Database Indexing & Optimization | Junior / Interm. | `be-j-db-index` | `be-i-db-query-plan` | Investigating query performance and designing effective B-tree indexes |
| Timeouts & Resilience | Junior / Interm. | `be-j-reliability-timeout` | `be-i-reliability-circuit-breaker` | Protecting server resources when downstream dependencies fail or hang |
| Database Integrity | Junior | `be-j-db-uniqueness` | `be-j-db-foreign-keys` | Enforcing relational integrity and consistency at the database engine level |
| API Design & Evolution | Interm. | `be-j-api-validation` | `be-i-api-versioning` | Designing robust API contracts and managing backward-compatible field evolution |
| Distributed Concurrency & Locks | Interm. | `be-i-concurrency-version` | `be-i-concurrency-distributed-lock` | Coordinating concurrent updates across distributed nodes without data loss |
| Caching & Performance | Interm. | `be-i-reliability-cache` | `be-i-api-rate-limiting` | Using in-memory caches to protect database systems while maintaining correctness |

---

## 5. Human Reviewer Publishing Procedure

To preserve audit integrity, **no questions are published automatically**. The human reviewer must explicitly approve questions and record their genuine name.

### Step 1: Apply Content Corrections & Expansion Migrations

In Supabase Dashboard → **SQL Editor** → **New query**, run:
1. [supabase/migrations/202609270004_question_bank_content_corrections.sql](file:///c:/Users/adity/OneDrive/Desktop/paneliq/backend/supabase/migrations/202609270004_question_bank_content_corrections.sql)
2. [supabase/migrations/202609270005_question_bank_expansion.sql](file:///c:/Users/adity/OneDrive/Desktop/paneliq/backend/supabase/migrations/202609270005_question_bank_expansion.sql)

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

#### Option B: Publish All 48 Audited Questions (Recommended)

```sql
update public.question_versions
set reviewed_by = 'YOUR ACTUAL NAME',
    reviewed_at = now(),
    status = 'published'
where version = 1
  and status = 'draft';
```

### Step 3: Run Validation and Live Verification

From `paneliq/backend`:
```powershell
npm.cmd run validate:bank
npm.cmd run verify:sessions
```
