# PanelIQ Backend

JavaScript ES-module Express API owned by Dev 4. All work stays in `backend/`.

## Setup

Requires Node.js 24 LTS and npm. From the repository root:

```powershell
cd backend
npm.cmd install
# Only when .env does not already exist:
Copy-Item .env.example .env
```

Edit ignored `.env` locally. Preserve `PORT` (default 4000), `NODE_ENV` (default development) and `ALLOWED_ORIGINS` (comma-separated frontend origins, default http://localhost:5173). Set `SUPABASE_URL` to the project root URL and `SUPABASE_PUBLISHABLE_KEY` to its `sb_publishable_...` key. No database password or privileged key is needed. Missing/invalid configuration stops startup and names only affected variables. Legacy JWT API keys and secret keys are rejected.

## Commands

```powershell
npm.cmd run dev         # Watch mode
npm.cmd start           # Normal server
npm.cmd run lint        # ESLint
npm.cmd test            # Offline Node built-in tests
npm.cmd run verify:auth # Manual live test; running server and test account required
npm.cmd run verify:profiles # Manual two-account profile/Data API isolation test
npm.cmd run verify:sessions # Manual two-account catalog/session/transaction test
```

`npm` also works where PowerShell execution policy allows it. Tests use synthetic configuration and mock Auth verification; there is no application authentication bypass.

## Endpoints

- `GET /api/v1/health`: public process liveness; returns `{ "data": { "service": "paneliq-backend", "status": "ok" }, "requestId": "..." }`. No database or Auth readiness check.
- `GET /api/v1/me`: requires `Authorization: Bearer <user-access-token>`; preserves verified user `id`/`email` and adds `profile` (null when absent), with `Cache-Control: no-store`.
- `PATCH /api/v1/me`: creates or partially updates only the verified user's candidate profile. Accepts displayName, domain, experienceLevel and targetRole; explicit null clears a field, omitted fields stay unchanged.

Every response includes `X-Request-Id`. Errors use `{ "error": { "code": "...", "message": "...", "retryable": false }, "requestId": "..." }`. Auth outages, timeouts and provider rate limits return retryable 503; invalid credentials return 401.

```powershell
Invoke-RestMethod http://localhost:4000/api/v1/health | ConvertTo-Json
# Expected 401 without a token:
curl.exe -i http://localhost:4000/api/v1/me
```

Use the configured port if different from 4000. The [Auth contract](docs/auth-contract.md) contains the frontend handoff and exact Windows smoke-test steps. The frontend signs in directly with Supabase and owns token refresh/session UX. The backend verifies tokens using `getUser`, with an eight-second network timeout and no shared session state.

## Structure and status

- `src/config/`: validated environment and stateless Supabase client.
- `src/middleware/`: request IDs, verified identity, safe errors and 404 handling.
- `src/modules/`: public health and protected identity routes.
- `src/app.js`, `src/routes/index.js`, `src/server.js`: Express composition, routing and process lifecycle.
- `test/`: focused offline tests; `scripts/verify-auth.js`: manual live smoke test.
- `docs/prd.md`: authoritative requirements; `docs/progress.md`: actual task results.

Task 2 live Auth verification passed, as reported by the user. Task 3 profile implementation and SQL are ready; migration deployment and live database/RLS verification remain pending. No frontend, application roles or interview features are included.

## Apply Task 3 and verify it

The full beginner walkthrough is in [profile-contract.md](docs/profile-contract.md), including response examples, SQL inspection queries and account setup.

1. Select the intended demo project in Supabase, privately compare its URL with .env, and open **SQL Editor → New query**.
2. Run `select to_regclass('public.profiles');`. If an unexpected table exists, stop; do not replace it.
3. If absent, paste the entire [migration](supabase/migrations/202609260001_create_profiles.sql) and click Run once. Confirm success. Check public.profiles, RLS enabled, own SELECT/INSERT/UPDATE policies and the restricted column grants using the contract's SQL queries.
4. Record `202609260001_create_profiles.sql`, project label and application date in your migration notes and docs/progress.md. Do not rerun it.
5. Configure two dedicated confirmed test accounts in ignored .env using SUPABASE_TEST_EMAIL / SUPABASE_TEST_PASSWORD and their `_2` equivalents. Follow the contract's SDK signup/confirmation steps if a second account is needed. Normal startup does not require these optional values.
6. Run `npm.cmd start`. In a second terminal inside backend, run `npm.cmd run verify:profiles`. Require all PASS checks and exit code 0. The script writes synthetic profiles to both supplied accounts; never use real accounts. Tokens remain in memory and output is sanitized.

Only that live test can demonstrate deployed profile access and RLS; generated SQL and offline tests do not. No database administration tool is configured for automatic migration application.

## Tasks 4 and 5: catalog and interview sessions

Implemented locally: authenticated catalog, profile-matched eight-question plans, own session summaries/resume, atomic answer/skip saving with version and idempotency protection, and explicit completion. See [session-contract.md](docs/session-contract.md) for every request/response and frontend reconnect behavior.

- `GET /api/v1/catalog`
- `POST /api/v1/sessions`, `GET /api/v1/sessions`
- `GET /api/v1/sessions/:id`
- `POST /api/v1/sessions/:id/answers`
- `POST /api/v1/sessions/:id/skip`
- `POST /api/v1/sessions/:id/complete`

Set the persisted profile's targetRole to the catalog slug **backend_developer** before creating a session. Display labels/free-text job titles do not silently map to a role. Session snapshots preserve profile and question content; future edits cannot change an interview in progress.

### Required database and review gates

The latest live preflight returned **PGRST205 / 404 for profiles** and authenticated /me returned a safe 500. The profiles migration/schema cache must be resolved before the existing Auth/profile checks can pass. No database administration connector is available, and none of the new SQL was automatically executed.

Use the intended Supabase demo project's **SQL Editor → New query**, privately confirm the project matches .env, then apply each entire file once in this order, stopping on any conflict/error:

1. Existing `202609260001_create_profiles.sql` if not already applied; inspect an existing table instead of replacing it.
2. [202609270001_question_bank.sql](supabase/migrations/202609270001_question_bank.sql)
3. [202609270002_interview_sessions.sql](supabase/migrations/202609270002_interview_sessions.sql)
4. [202609270003_backend_question_drafts.sql](supabase/migrations/202609270003_backend_question_drafts.sql)

Record successful filenames/project/date, inspect RLS and grants, and have a named human review the 32 draft questions plus private concepts. Publish only approved versions using the exact SQL in the [application walkthrough](docs/session-contract.md#apply-and-verify-manually). The drafts are AI-authored, **not expert-reviewed**. They cover two levels and enough alternatives for two disjoint plans per level once published; the larger 40–60 bank target is still short by 8–28 questions. No unrelated roles are supported yet.

Run lint/tests, start the API, then run verify:auth, verify:profiles and verify:sessions in that order from another backend terminal. These manual scripts use the two dedicated confirmed accounts in ignored .env and write synthetic data; never use real accounts. No tokens or answers are printed. The sessions script leaves one active synthetic session for the rollback test.

Finally run the entire [rollback-only SQL probe](supabase/tests/session-rollback.sql) in SQL Editor, retaining its ending ROLLBACK. It forces an error after answer insertion and checks that the answer and advancement both rolled back. Record all actual live results and stop the server. Local tests use mocked SDK/database boundaries; they do not prove deployed RLS or SQL transaction behavior.

Tasks **6–10 are NOT STARTED**. There are no constraint challenges, scoring, AI, replay/retry or evaluator workflows in this slice.
