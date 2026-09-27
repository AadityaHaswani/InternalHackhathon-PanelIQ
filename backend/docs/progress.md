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
- **Status:** IMPLEMENTED; migration application and live database/RLS verification PENDING.
- **Implemented:**
  - Ordered transactional migration: supabase/migrations/202609260001_create_profiles.sql. Creates only public.profiles, its narrow invoker timestamp trigger and own-row policies. Existing table/function conflicts fail; nothing is dropped or replaced.
  - Nullable candidate fields with database constraints, Auth user FK with cascading deletion, immutable client timestamps, explicit column INSERT/UPDATE grants, no anonymous or client DELETE access.
  - Fresh database client per verified request, carrying the user's token. Eight-second database timeout; automatic network retries disabled. Original stateless Auth verification remains separate.
  - GET /me preserves user.id/email and adds profile (null only when genuinely absent). PATCH validates only four fields, trims text, supports explicit null and omitted-field preservation, and derives ownership solely from verified identity.
  - Update-first/insert/one-conflict-update save strategy preserves concurrent partial updates without needing an owner UPDATE grant.
  - Safe 400/401/403/409/503/500 behavior. Schema defects are errors, never absent profiles. no-store also covers malformed JSON at /me.
  - Frontend contract, SQL Editor walkthrough, optional local account placeholders, and a sanitized two-account verify:profiles script. No new dependencies.
- **Verification:**
  - Baseline lint and all 30 Task 2 tests passed before changes.
  - Final npm run lint: passed with no errors or warnings. Final npm test: 49 passed, 0 failed. Covers compatible Auth behavior, profile validation/partial writes, identity isolation at the request boundary, safe database errors, bounded conflict handling and actual SDK eight-second aborts using mocked fetch. No live RLS claim.
  - Local application startup with configured environment on a temporary port passed. Health returned 200 with unchanged data; unauthenticated /me returned 401 AUTH_REQUIRED. Both request IDs matched response headers.
  - Live smoke script missing-credential guard tested using an empty process-only override: FAIL test-account-configuration and exit 1, before network access; .env was not changed.
  - Both dedicated-account credential pairs are present in ignored local settings (presence only checked; values never displayed).
  - No authorized database administration tool is configured. SQL has NOT been applied by the agent; PostgreSQL constraints, actual grants and deployed RLS have NOT been verified. The live write script was not run before migration application.
  - Mocked API/SDK tests do not prove deployed isolation. No frontend, roles, interview tables, privileged clients or global Auth changes.
- **Manual remaining work:** Apply the complete migration once through SQL Editor, stop if an unexpected profiles table exists, inspect/record the migration and grants, confirm both dedicated accounts, start the API and run npm.cmd run verify:profiles. Detailed commands are in docs/profile-contract.md. The script writes synthetic profiles to both supplied accounts and leaves them in place.
- **Git:** Remote history confirms Task 2 was merged into origin/main at c163d0b. Task 3 work is on codex/task-3-candidate-profiles, based on the Task 2 commit; no merge, force-push or remote change was performed. Task 3 changes remain uncommitted and unpushed for review/manual migration verification.

### Task 4: Reviewed question bank and supported interview catalog
- **Status:** NOT STARTED.
- Await explicit authorization before implementation.
