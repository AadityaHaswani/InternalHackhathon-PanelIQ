# Frontend Auth contract — Tasks 2 and 3

The frontend signs in directly using its own Supabase client. It sends the resulting **user access token** to Express. The project publishable key is configuration, not a user access token. There are no Express signup, login, logout or refresh endpoints. The frontend owns token refresh, session storage and sign-in/expired-session UX. No frontend code is implemented here.

## Identity request

`GET /api/v1/me` with `Authorization: Bearer <user-access-token>`.

Bearer is case-insensitive. HTTP 200 includes `Cache-Control: no-store`:

```json
{
  "data": { "user": { "id": "<verified-user-id>", "email": "<verified-email-or-null>" }, "profile": null },
  "requestId": "<request-id>"
}
```

Email is a string when present and JSON null otherwise. Task 3 adds `data.profile`: null when no row exists, otherwise the six documented candidate-profile fields. The existing user fields remain unchanged. No roles, tokens, identities or provider metadata are returned. `X-Request-Id` matches the response body. Auth failures also use `Cache-Control: no-store`.

`PATCH /api/v1/me` now saves the verified user's profile. See [profile-contract.md](profile-contract.md) for fields, validation, null semantics and database errors. GET does not create a profile; database failures are never reported as null. The migration must be applied before authenticated /me requests can complete successfully.

## Errors

```json
{
  "error": {
    "code": "AUTH_INVALID",
    "message": "Invalid or expired access token",
    "retryable": false
  },
  "requestId": "<request-id>"
}
```

- 401 `AUTH_REQUIRED`: no credentials; prompt for sign-in.
- 401 `AUTH_INVALID`: malformed credentials or rejected/expired token. The frontend may refresh once and retry; if still rejected, request sign-in.
- 503 `AUTH_UNAVAILABLE`, `retryable: true`: Auth timeout, connection failure, upstream 5xx **or provider rate limiting (429)**. Keep the session and back off before retrying; do not label credentials invalid. No automatic backend retries or fabricated Retry-After value.
- 500 `INTERNAL_ERROR`: unexpected internal failure with a safe generic message.

`GET /api/v1/health` stays public, unchanged and independent of Auth network availability. It checks process liveness only; valid startup configuration is still required.

## Implementation boundary

Each protected request calls `supabase.auth.getUser(accessToken)`. The shared server client disables persistence, automatic refresh and URL session detection. It never signs in or stores request tokens. SDK 2.117.2 exposes `global.fetch`; the backend uses this supported hook with Node's `AbortSignal.timeout(8000)` because Auth has no separate request-timeout option (`db.timeout` applies only to database requests).

See the [Supabase server client guidance](https://supabase.com/docs/reference/javascript/auth). Role-based authorization is not implemented. User-editable metadata never grants permissions.

The original Task 2 Auth smoke test passed, as reported by the user. Task 3 adds a profiles migration and user-scoped database operations. The Auth smoke script still checks identity, but /me now also needs the profiles table. Use `npm.cmd run verify:profiles` with two dedicated accounts to verify database operations and direct Data API isolation; an Auth-only result is not proof of RLS.

## Windows local smoke test

1. Use a dedicated non-production Supabase account already registered through the ordinary Auth flow. Complete email confirmation if required by existing project settings. Do not change global Auth settings or use privileged APIs.
2. In your editor, add `SUPABASE_TEST_EMAIL` and `SUPABASE_TEST_PASSWORD` with that account's values to ignored `backend/.env`. Do not place credentials in commands, committed examples, fixtures or chat. The normal server does not require these optional variables.
3. Ensure `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` belong to the account's project. Use a modern `sb_publishable_...` key, not a secret, service-role or legacy JWT key.
4. From the repository root in PowerShell:

   ```powershell
   cd backend
   npm.cmd install
   npm.cmd run lint
   npm.cmd test
   npm.cmd start
   ```

5. From the repository root in a second PowerShell window:

   ```powershell
   cd backend
   npm.cmd run verify:auth
   ```

The script signs in with the SDK in a separate process, keeps tokens in memory and calls the local API at the configured PORT. It prints only PASS/FAIL, status and whether the expected user matched. Success is `PASS status=200 expectedUserMatched=true`. Failures exit nonzero. Missing test credentials yield `FAIL status=not-run expectedUserMatched=false`; a failed connection yields status `unavailable`. No password, keys, tokens, full user/login response or raw errors are printed.

Stop the server with Ctrl+C when done. Remove optional test credentials when no longer needed. Do not commit `.env`. Record current live results separately from mocked tests; the Task 3 database/RLS check remains pending until its migration and two-account smoke test succeed.
