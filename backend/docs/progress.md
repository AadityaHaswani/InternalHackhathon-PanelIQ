# PanelIQ Backend Progress Tracker

This document tracks backend engineering progress, architectural decisions, completed verification checks, and the status of upcoming tasks.

---

## Architecture & Scope Decisions

1. **Backend-Only Scope Isolation:**
   - The PRD originally proposed a shared monorepo workspace structure (`apps/api`, `apps/web`, `packages/contracts`).
   - **Decision:** All backend code, configuration, dependencies, and documentation are strictly confined to `paneliq/backend/`. Frontend applications are owned by separate developers (Dev 1, Dev 2, Dev 3) and will not be scaffolded or modified by the backend track. Root workspace tooling and shared package managers are avoided to ensure zero interference.

2. **JavaScript with ES Modules ("type": "module"):**
   - The PRD originally mentioned TypeScript for full-stack contracts.
   - **Decision:** As specified for the backend developer's skill set, all backend application code is written in pure modern JavaScript (ES Modules, Node.js 24 LTS) without TypeScript compilation (`.ts`, `tsconfig.json`, `tsc`).
   - Runtime configuration validation is powered by Zod in `src/config/env.js`.
   - Node.js built-in `--watch` mode is used for development, and Node.js built-in `crypto.randomUUID()` is used for request IDs without extraneous external dependencies.

---

## Tasks Progress

### Task 1: Backend Foundation (D4-01 Foundation MVP)
- **Status:** COMPLETED
- **Deliverables:**
  - `backend/package.json` — ES modules, clean scripts (`dev`, `start`, `lint`).
  - `backend/eslint.config.js` — Flat ESLint config with JavaScript and Node globals support.
  - `backend/.gitignore` — Ignores `node_modules/`, `.env`, logs, and artifacts while retaining `.env.example`.
  - `backend/.env.example` — Safe defaults for `PORT`, `NODE_ENV`, and `ALLOWED_ORIGINS`.
  - `backend/src/config/env.js` — Reliable ES module path resolution for `.env` and Zod schema validation.
  - `backend/src/middleware/request-id.js` — Generates UUID v4 request IDs via Node `crypto.randomUUID()`, attaches to `req.id` and `X-Request-Id` response header.
  - `backend/src/middleware/not-found.js` — Standard JSON 404 response envelope for unmatched routes.
  - `backend/src/middleware/error-handler.js` — Global error handler with PRD-compliant JSON envelope; prevents stack trace leaks.
  - `backend/src/modules/health/health.routes.js` — `GET /api/v1/health` returning HTTP 200 with `{ data: { service, status }, requestId }`.
  - `backend/src/routes/index.js` — Versioned router mounted under `/api/v1`.
  - `backend/src/app.js` — Express application factory with middleware and route mounting (no port binding).
  - `backend/src/server.js` — Application entrypoint with startup logging and bounded graceful shutdown handling (SIGINT/SIGTERM).
  - `backend/docs/prd.md` — Preserved copy of product requirements and specifications.
  - `backend/docs/progress.md` — This progress tracker.
  - `backend/AGENTS.md` — Agent instructions and constraints for PanelIQ backend work.
  - `backend/README.md` — Human-friendly onboarding, run instructions, and verification examples.

- **Verification Results:**
  - `npm install`: Passed cleanly.
  - `npm run lint`: Passed with 0 errors and 0 warnings.
  - Server start & health endpoint test: `GET /api/v1/health` returned HTTP 200 with matching `requestId` in body and `X-Request-Id` header.
  - 404 route test: `GET /api/v1/nonexistent` returned HTTP 404 with documented error envelope.
  - Malformed JSON test: Returned HTTP 400 with documented error envelope.
  - No frontend files created or modified.
  - No TypeScript files or compilation steps introduced.
  - Server runs cleanly without Supabase or LLM credentials.

---

### Task 2: Supabase Auth and protected identity endpoint
- **Status:** COMPLETED. User reported live Auth verification PASS status=200 expectedUserMatched=true at the start of Task 3 (not rerun by the agent).
- **Scope:** Supabase Auth identity only. The current task overrides the older migration/request-scoped database-client description. No database, profile, role or frontend changes.
- **Implemented:**
  - Added only `@supabase/supabase-js` as a direct runtime dependency (2.117.2 in the lockfile).
  - Validated the project URL and modern publishable key; safe startup errors name variables only. PORT, NODE_ENV and ALLOWED_ORIGINS retained.
  - Added a stateless server client with persistence, refresh and URL session detection disabled. The SDK-supported global.fetch hook applies an eight-second abort to Auth requests.
  - Added Bearer parsing and getUser verification, minimal request identity, safe 401 errors, retryable 503 for connection failures/timeouts/5xx/provider rate limits, and sanitized unexpected errors through the existing handler.
  - Added GET /api/v1/me returning only id/email with no-store. Public health handler is unchanged.
  - Added frontend Auth contract, Windows smoke-test instructions, manual verification script and Node built-in tests. No development bypass.
- **Verification (2026-09-26):**
  - Before changes: lint passed; health returned 200 with matching request ID.
  - Final `npm run lint`: passed, no errors/warnings.
  - Final `npm test`: 30 passed, 0 failed; no external Auth network calls or real credentials. Includes rejection, success/field filtering, outage, rate limit, public health, safe startup errors, concurrent SDK tokens and actual eight-second cancellation with mocked fetch.
  - Additional tests caught a malformed-URL validation exception during implementation; corrected with non-throwing URL parsing and verified safe variable-only output.
  - `npm start` with the configured local environment: passed on port 4000.
  - Public health: 200 with unchanged data and matching request ID.
  - Unauthenticated /me: 401 AUTH_REQUIRED, retryable false, no-store, matching request ID.
  - `npm run verify:auth`: not run against Auth because SUPABASE_TEST_EMAIL / SUPABASE_TEST_PASSWORD are not configured. Script reported FAIL status=not-run expectedUserMatched=false and exited 1, as intended for missing optional credentials.
  - Initial live check was pending during Task 2. The user subsequently confirmed Auth passed; that does not verify PostgreSQL tables or RLS.
  - Dependency install audit: 0 vulnerabilities. Git diff whitespace check passed; .env remains ignored.
- **Manual remaining work:** Original Auth check completed by the user. Task 3 now adds a database dependency to /me; follow the profile migration and verification steps below.
- **Git:** Task branch codex/task-2-supabase-auth; only Task 2 backend files belong in the commit. Commit/push outcome is reported in the task handoff.

### Task 3: Candidate profiles, PostgreSQL migration and ownership protection
- **Status:** COMPLETED. Migration applied and live database/RLS verification PASSED.
- **Implemented:**
  - Ordered transactional migration: supabase/migrations/202609260001_create_profiles.sql. Creates only public.profiles, its narrow invoker timestamp trigger and own-row policies. Existing table/function conflicts fail; nothing is dropped or replaced.
  - Nullable candidate fields with database constraints, Auth user FK with cascading deletion, immutable client timestamps, explicit column INSERT/UPDATE grants, no anonymous or client DELETE access.
  - Fresh database client per verified request, carrying the user's token. Eight-second database timeout; automatic network retries disabled. Original stateless Auth verification remains separate.
  - GET /me preserves user.id/email and adds profile (null only when genuinely absent). PATCH validates only four fields, trims text, supports explicit null and omitted-field preservation, and derives ownership solely from verified identity.
  - Update-first/insert/one-conflict-update save strategy preserves concurrent partial updates without needing an owner UPDATE grant.
  - Safe 400/401/403/409/503/500 behavior. Schema defects are errors, never absent profiles. no-store also covers malformed JSON at /me.
  - Frontend contract, SQL Editor walkthrough, optional local account placeholders, and a sanitized two-account verify:profiles script. No new dependencies.
- **Verification (2026-09-27):**
  - Applied `202609260001_create_profiles.sql` via Supabase SQL Editor. Verified `to_regclass('public.profiles')` returned `profiles`.
  - Baseline tests: `npm.cmd run lint` (0 errors, 0 warnings), `npm.cmd test` (66 passed, 0 failed).
  - Live server started on port 4000:
    - `npm.cmd run verify:auth`: PASSED (`PASS status=200 expectedUserMatched=true`).
    - `npm.cmd run verify:profiles`: PASSED all 16 live checks:
      - `PASS sign-in-account-a`
      - `PASS sign-in-account-b`
      - `PASS distinct-test-accounts`
      - `PASS api-save-read-update-a`
      - `PASS api-save-read-update-b`
      - `PASS direct-own-read-a`
      - `PASS direct-own-read-b`
      - `PASS a-cannot-read-b`
      - `PASS a-cannot-insert-for-b`
      - `PASS a-cannot-update-b`
      - `PASS a-cannot-transfer-ownership`
      - `PASS protected-created_at`
      - `PASS protected-updated_at`
      - `PASS client-delete-denied`
      - `PASS database-constraints-enforced`
      - `PASS anonymous-data-api-denied`
- **Manual remaining work:** None for Task 3. Profiles migration and live RLS gates are fully verified.
- **Git:** Remote history confirms Task 2 was merged into origin/main at c163d0b. Task 3 work is on codex/task-3-candidate-profiles, based on the Task 2 commit; no merge, force-push or remote change was performed.

### Tasks 4 and 5: Catalog, bank-backed sessions and durable answers
- **Status:** MIGRATIONS APPLIED; LIVE DATABASE SCHEMA VERIFIED; SESSION LIFECYCLE CHECKS BLOCKED PENDING CONTENT REVIEW.
- **Current state inspected (2026-09-27):** Working tree clean on codex/task-3-candidate-profiles. No branch, commit, push, merge or remote change performed.
- **Database artifacts & execution:**
  - `202609270001_question_bank.sql`: Applied successfully via Supabase SQL Editor. Created `interview_roles`, `question_versions`, `question_keys`, immutability triggers, and authenticated SELECT policies.
  - `202609270002_interview_sessions.sql`: Applied successfully via Supabase SQL Editor. Created `sessions`, `session_turns`, `answers`, own-row SELECT RLS, and security definer transaction RPC functions (`session_state`, `create_interview_session`, `save_interview_turn`, `complete_interview_session`).
  - `202609270003_backend_question_drafts.sql`: Applied successfully via Supabase SQL Editor. Seeded 32 draft questions in `question_versions` and 32 rubric keys in `question_keys`, all with `status = 'draft'`.
- **Live verification (2026-09-27):**
  - `npm.cmd run lint`: passed, 0 errors/warnings. `npm.cmd test`: 66 passed, 0 failed.
  - `npm.cmd run verify:sessions` executed against live Supabase project:
    - `PASS sign-in-a status=200`
    - `PASS sign-in-b status=200`
    - `PASS migrations-visible status=200` (all 6 required tables confirmed visible and accessible)
    - `FAIL catalog-and-reviewed-bank status=200` (BLOCKED as intended: all 32 seed questions are unreviewed drafts; 0 questions are published).
- **Manual remaining:**
  1. Human content review of the 32 AI-authored drafts in `supabase/seeds/backend-developer.questions.json` and `public.question_versions`.
  2. Publish reviewed questions via SQL Editor with truthful reviewer attribution (at least 1 icebreaker, 4 technical, 2 techno-managerial, 1 reflection per level).
  3. Re-run `npm.cmd run verify:sessions` once questions are published to verify complete session lifecycle, transaction RPCs, concurrency, and RLS.
  4. Run `supabase/tests/session-rollback.sql` in SQL Editor for fault-injection rollback verification.

### Task 5A: Question Bank Audit, Content Expansion & Human Review Readiness
- **Status:** COMPLETED. Question bank expanded to 48 questions (satisfying PRD 40-60 gate), 8 constraint scenarios, and 8 retry variant pairs. Additive migrations prepared; human publication PENDING.
- **Deliverables:**
  - `supabase/seeds/backend-developer.questions.json`: Expanded from 32 to 48 questions (24 Junior, 24 Intermediate) with 0-4 scoring anchors, concrete grading rubrics, >=3 concepts per question, and prompts >=50 characters.
  - `supabase/seeds/constraint-scenarios.json`: 8 constraint scenarios with changed constraints, follow-ups, reasoning points, and 0-4 rubric anchors.
  - `supabase/seeds/retry-variants.json`: 8 comparable retry variant pairs across core demo topics (concurrency, idempotency, indexing, resilience).
  - `supabase/migrations/202609270004_question_bank_content_corrections.sql`: Additive migration enriching the first 32 draft questions with rubric notes and reviewed follow-ups.
  - `supabase/migrations/202609270005_question_bank_expansion.sql`: Additive transactional migration inserting 16 new questions (draft status) and updating rubric notes with explicit 0-4 scoring anchors.
  - `scripts/validate-question-bank.js`: Validation CLI verifying question counts, prompt uniqueness, schemas, anchors, scenarios, and variants (`npm run validate:bank`).
  - `backend/docs/question-review.md`: Complete human review guide, plan layouts (J-1/J-2/J-3, I-1/I-2/I-3), scenario summaries, retry variant catalog, and SQL publication instructions.
  - `test/session-plan.test.js`: Expanded test suite asserting 48 base questions, disjoint plan execution, draft isolation, scenario validation, and retry pairs.
- **Verification:**
  - `npm.cmd run lint`: passed, 0 errors/warnings.
  - `npm.cmd run validate:bank`: passed, 48 base questions, 8 scenarios, 8 retry pairs.
  - `npm.cmd test`: 68 passed, 0 failed.
  - `verify:sessions`: Correctly blocked on `catalog-and-reviewed-bank` until human reviewer approves and publishes questions.
- **Next Manual Steps:**
  1. Human reviewer applies `202609270004_question_bank_content_corrections.sql` and `202609270005_question_bank_expansion.sql` in Supabase SQL Editor.
  2. Human reviewer reviews priority questions in `backend/docs/question-review.md` and executes the publication query with truthful attribution.
  3. Re-run `npm.cmd run verify:sessions` to complete live session lifecycle validation.

### Task 6: Stored Constraint Scenarios (D4-06)
- **Status:** COMPLETED.
- **Implemented:**
  - `src/modules/scenarios/scenario.service.js`:
    - `getApprovedScenarios`: Fetches published/approved scenario versions.
    - `selectScenarioForPlan`: Deterministically selects at most 1 approved constraint scenario per session matching domain, level, role, and baseline question.
    - `formatSafeTurnDto`: Sanitizes scenario turns for candidate output—strips private question keys, scenario keys, expected reasoning points, and rubric anchors.
  - `supabase/migrations/202609270006_constraint_scenarios_and_evaluations.sql`:
    - Created `scenario_versions` and `scenario_keys` tables with snapshot immutability triggers.
    - Seeded the 8 approved scenarios from `supabase/seeds/constraint-scenarios.json`.
    - Extended `session_turns` with `turn_type`, `parent_turn_id`, `scenario_version_id`, `constraint_snapshot`, `source`, `prompt`, `stage`, and `panel_role`.
    - Extended transaction RPC `save_interview_turn` to atomically insert a challenge turn with a separate ID upon answering a baseline scenario turn without altering the original baseline answer.
  - `test/scenarios.test.js`: Comprehensive 8-suite test verifying approved selection, level matching, single scenario limit, separate challenge turn/answer creation, candidate key isolation, idempotent challenge safety, and rejection of unpublished scenarios.
- **Verification:**
  - `npm.cmd test`: All 8 Task 6 unit/integration tests passed.

---

### Task 7: Reports and Expert Workflow (D4-07)
- **Status:** COMPLETED.
- **Implemented:**
  - **Deterministic Scoring Engine (`src/modules/evaluations/scoring.service.js`):**
    - Official PRD formula: `100 * sum(weight * rating / 4) / sum(applicable weights)` with weights: Correctness 40%, Reasoning 25%, Relevance 20%, Tradeoffs 15%.
    - Renormalization of weights when criteria are marked not applicable (`applicable: false`).
    - Excludes unscored `icebreaker` and `reflection` turns.
    - Character-offset & exact-quote evidence validation (`validateEvidence`) with integer offset verification and exact answer slice matching (`answer.slice(start, end) === excerpt`). Rejects invalid excerpts/bounds without silent repair.
    - Explicitly skipped scored turns default to rating 0 with exact reason `"No response submitted"`.
    - Nullable ratings for pending evaluations; pending criteria are never converted to zero.
    - Session score: arithmetic mean of completed scored answer scores. Returns provisional aggregates if required scoring remains pending; final score only returned after all required criteria are evaluated.
  - **Evaluation Service & Overrides (`src/modules/evaluations/`):**
    - `evaluation.schema.js`, `evaluation.service.js`, `evaluation.routes.js` (`POST /api/v1/evaluations/:id/overrides`).
    - Enforces evaluator role & session review assignment or admin authorization.
    - Append-only review override audit trail in `review_overrides` preserving initial proposal and reason.
  - **Report Service & Release Gate (`src/modules/reports/`):**
    - `report.schema.js`, `report.service.js`, `report.routes.js` (`GET /api/v1/sessions/:id/report`, `GET /api/v1/sessions/:id/replay`, `POST /api/v1/sessions/:id/release`, `GET /api/v1/review-assignments`).
    - Release rule: blocks release with HTTP 409 `SCORING_PENDING` if any required criteria are pending or session is incomplete.
    - Candidate data isolation: candidate can only view released report and cannot access unreleased reviewer notes, private question keys, or evaluator-only metadata.
    - Report refresh is read-only: does not trigger new evaluations or mutations.
    - Topic and stage coverage diagnostics reporting.
  - **Question Quality Assessment (`src/modules/questions/`):**
    - `question-assessment.schema.js`, `question-assessment.service.js`, `question-assessment.routes.js` (`POST /api/v1/question-assessments`, `GET /api/v1/question-assessments/:id`).
    - Deterministic metadata indicators (length, punctuation, topic matching, readiness) and draft rewrite generation; saved as `draft` without auto-publishing.
  - **App & Router Integration:**
    - Mounted in `src/routes/index.js` and wrapped with `Cache-Control: no-store` in `src/app.js`.
  - **Database Migration (`supabase/migrations/202609270006_constraint_scenarios_and_evaluations.sql`):**
    - Created tables: `user_roles`, `review_assignments`, `evaluations`, `review_overrides`, `report_revisions`, `question_assessments`.
    - RLS policies ensuring candidate isolation and authorized evaluator review.
  - **Tests (`test/evaluations-scoring.test.js`):**
    - 22 tests covering scoring formula, renormalization, 0 and 4 rating boundary cases, pending rating handling, provisional vs final score, skipped turns, icebreaker exclusions, evidence offset validation, override auditing, role/assignment auth gates, report release blocks, candidate data isolation, and draft question assessments.
- **Verification:**
  - `npm.cmd run lint`: passed, 0 errors, 0 warnings.
  - `npm.cmd run validate:bank`: passed, 48 questions, 8 scenarios, 8 retry pairs intact.
  - `npm.cmd test`: 98 passed, 0 failed.

---

### Task 8: Live AI Providers, Bounded Fallback & AI Jobs (D4-08)
- **Status:** COMPLETED & LIVE VERIFIED.
- **Implemented:**
  - **Provider Abstraction (`src/modules/ai/providers/`):**
    - `GroqProvider`: Uses `https://api.groq.com/openai/v1/chat/completions` with JSON mode (`response_format: { type: 'json_object' }`), 8s/25s timeouts, and model fallback.
    - `GeminiProvider`: Uses `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent` with `responseMimeType: 'application/json'`, 8s/25s timeouts, and `gemini-3.5-flash-lite` supported text model.
    - `MockProvider`: Deterministic credential-free provider for unit testing.
  - **AIFallbackEngine (`src/modules/ai/fallback-engine.js`):**
    - Coordinates Groq primary $\rightarrow$ Gemini secondary on timeout, 429, 5xx, or invalid structured output.
    - Handles `Retry-After` headers and bounded single-attempt failover.
    - Preserves bank-only mode (0 provider calls).
  - **Follow-up Enhancement Service (`src/modules/ai/follow-up.service.js`):**
    - Bounded contextualization with strict 2 AI-enhanced follow-ups per session limit (`MAX_AI_FOLLOW_UPS_PER_SESSION = 2`).
    - Stored question/scenario remains the source of truth; cannot change constraints, difficulty, or assumptions.
    - 8-second timeout with fallback to approved stored follow-up prompt.
  - **Live AI Evaluation Service (`src/modules/ai/ai-evaluation.service.js`):**
    - Proposes structured evaluations for 4 PRD criteria.
    - Strict server-side evidence verification (`validateEvidence` exact slice matching); rejects invalid offsets/quotes without silent repair.
    - Preserves candidate answers; leaves evaluation pending on failure for human review.
  - **AI Background Jobs & Leasing (`src/modules/ai/job.service.js`):**
    - `enqueueAIJob`, `claimNextAIJob` with atomic worker lease locking (`SKIP LOCKED`), lease expiration recovery, and session deletion safety.
  - **Database Migration (`supabase/migrations/202609270007_ai_jobs_and_retries.sql`):**
    - Created `public.ai_jobs` table and atomic lease functions (`claim_next_ai_job`, `complete_ai_job`, `fail_ai_job`).

---

### Task 9: Retry Variants & Rubric Comparisons (D4-09)
- **Status:** COMPLETED.
- **Implemented:**
  - **Retry Workflow Service (`src/modules/retries/retry.service.js`):**
    - Reads approved retry variants from `supabase/seeds/retry-variants.json`.
    - `createRetryAttempt`: Enforces one retry per eligible answer, strict idempotency, and rejects arbitrary/unapproved question IDs.
    - `submitRetryAnswer`: Evaluates retry answers using the same evaluation pipeline while keeping original sessions and answers immutable.
    - **Rubric Comparison Rule:**
      - Same rubric version: calculates numeric `score_delta = retry_score - original_score`.
      - Different rubric version: `numeric_comparison_allowed = false`, `score_delta = null`, and blocks numeric improvement claims.
  - **Routes & API Integration (`src/modules/retries/retry.routes.js`):**
    - `POST /api/v1/sessions/:id/answers/:answerId/retry`
    - `POST /api/v1/retries/:retryId/answer`
    - `GET /api/v1/retries/:retryId`
    - Mounted in `src/routes/index.js` and protected with `Cache-Control: no-store` in `src/app.js`.
  - **Database Migration (`supabase/migrations/202609270007_ai_jobs_and_retries.sql`):**
    - Created `public.answer_retries` with `UNIQUE (source_answer_id)` constraint.

---

### Task D4-10: Integrity and Operational Tests
- **Status:** COMPLETED.
- **Implemented:**
  - **Operational Integrity Suite (`test/operational-integrity.test.js` - 15 tests):**
    1. `D4-10.1`: Candidate A cannot read Candidate B's report (`403 EVALUATOR_REQUIRED`).
    2. `D4-10.2`: Candidate A cannot access Candidate B's replay transcript (`403 EVALUATOR_REQUIRED`).
    3. `D4-10.3`: Candidate cannot release reports (`403 EVALUATOR_REQUIRED`).
    4. `D4-10.4`: Evaluator assigned to Session A cannot release Session B (`403 ASSIGNMENT_REQUIRED`).
    5. `D4-10.5`: Admin can release report without specific session assignment.
    6. `D4-10.6`: Candidate cannot retry another candidate's answer (`404 SESSION_NOT_FOUND`).
    7. `D4-10.7`: Stale tab submission rejected with version mismatch (`409 SESSION_STALE`).
    8. `D4-10.8`: Concurrent double-click submissions with different keys: one accepted, second rejected with `409 IDEMPOTENCY_CONFLICT`.
    9. `D4-10.9`: Fabricated quotes claiming absence are rejected by server evidence validator (`400 INVALID_EVIDENCE`).
    10. `D4-10.10`: Malformed evidence offsets (negative start, end < start, out of bounds) strictly rejected.
    11. `D4-10.11`: Late AI result after session deletion is safely ignored and does not corrupt database state.
    12. `D4-10.12`: Released report revision cannot be overwritten by subsequent evaluation writes (`409 REVISION_IMMUTABLE`).
    13. `D4-10.13`: Prompt injection in candidate answer text is sanitized and treated purely as string data; cannot alter schema.
    14. `D4-10.14`: Malformed AI provider output is rejected before database persistence.
    15. `D4-10.15`: 10 simultaneous synthetic sessions progress concurrently without cross-session pollution, duplicate turn positions, or corrupted assignments.
  - **End-to-End Integration Journey (`test/integration-journey.test.js` - 1 test):**
    - Step 1: Candidate starts session and completes all turns.
    - Step 2: Session turns and candidate answers are atomically preserved.
    - Step 3: Evaluation proposals created across PRD criteria (Correctness, Reasoning, Relevance, Tradeoffs).
    - Step 4: Semantic evaluations generated via AI provider pipeline.
    - Step 5: Evaluator reviews and applies review override with rationale.
    - Step 6: Evaluator releases official report revision.
    - Step 7: Candidate retrieves released report (provisional flag cleared, final score calculated).
    - Step 8: Candidate retrieves immutable replay transcript.
    - Step 9: Candidate spawns eligible retry attempt with question variant.
    - Step 10: Original answer remains strictly immutable.
    - Step 11: Candidate submits answer to retry attempt.
    - Step 12: Same evaluation pipeline evaluates retry answer.
    - Step 13: Numeric score comparison calculated using compatible rubric version.
    - Step 14: Attacker cannot access or retry candidate session.
    - Step 15: Released report revision cannot be silently overwritten.
  - **Frontend Reproducible Error Fixtures (`docs/error-fixtures.md` & `test/fixtures/error-fixtures.json`):**
    - Complete, machine-readable JSON catalog of 20 deterministic error response envelopes.
    - Comprehensive guide covering HTTP status codes, machine-readable error codes, retryable flags, and recommended frontend actions.
  - **Supabase / PostgreSQL RLS Distinction:**
    - Service-layer authorization and ownership isolation are rigorously verified in unit/service tests.
    - Live PostgreSQL Row Level Security (RLS) policies are defined in migrations `0004`, `0006`, and `0007`. Verification against a live Supabase instance is performed via `node scripts/verify-sessions.js`.

---

### Verification Summary (Tasks 1–10)
- `npm.cmd run lint`: **0 errors, 0 warnings** (clean).
- `npm.cmd run validate:bank`: **48 questions, 8 scenarios, 8 retry pairs intact** (clean).
- `npm.cmd test`: **137 passed, 0 failed** across all 11 test suites.
- `npm.cmd run verify:ai` (Live smoke test):
  - Groq Primary: **PASS**
  - Gemini Secondary: **PASS**
  - Provider Fallback: **PASS**
- **Security Check:** Zero API keys hardcoded, logged, or printed.
- **Frontend Isolation:** Zero frontend files touched.

---

### Task 11 / Deployment
- **Status:** NOT STARTED. Scheduled for subsequent deployment phase.

