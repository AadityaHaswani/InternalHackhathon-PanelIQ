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
```

`npm` also works where PowerShell execution policy allows it. Tests use synthetic configuration and mock Auth verification; there is no application authentication bypass.

## Endpoints

- `GET /api/v1/health`: public process liveness; returns `{ "data": { "service": "paneliq-backend", "status": "ok" }, "requestId": "..." }`. No database or Auth readiness check.
- `GET /api/v1/me`: requires `Authorization: Bearer <user-access-token>`; returns only verified `id` and `email` (or null), with `Cache-Control: no-store`.

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

Task 1 foundation and Task 2 identity endpoint are implemented. Live authenticated verification is pending local test-account configuration; database access has not been verified. No frontend, application roles, profile persistence or interview features are included.

Next task, planned but **NOT STARTED**: Database schema, profiles and access rules.
