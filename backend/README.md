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

Next task, planned but **NOT STARTED**: Reviewed question bank and supported interview catalog.
