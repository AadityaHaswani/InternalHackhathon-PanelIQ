# Candidate profiles — Task 3

Both methods require `Authorization: Bearer <user-access-token>`. Express verifies identity with Auth, then creates a fresh database client carrying that verified token. PostgreSQL RLS remains active. No application roles or metadata-based permissions are introduced.

## GET /api/v1/me

HTTP 200, `Cache-Control: no-store`, and `X-Request-Id` matching requestId:

```json
{
  "data": {
    "user": { "id": "<verified-user-id>", "email": "<email-or-null>" },
    "profile": {
      "displayName": "Demo Candidate",
      "domain": "computer_science",
      "experienceLevel": "junior",
      "targetRole": "Backend Developer",
      "createdAt": "<ISO timestamp>",
      "updatedAt": "<ISO timestamp>"
    }
  },
  "requestId": "<request-id>"
}
```

No row means HTTP 200 with `data.profile: null`. GET never creates a row. Query failures and missing migrations are errors, never absent profiles. The existing user fields and requestId retain their Task 2 meanings. The profile does not expose user_id or tokens.

## PATCH /api/v1/me

Send `Content-Type: application/json` and the same Bearer header:

```json
{ "displayName": " Demo Candidate ", "domain": "computer_science", "experienceLevel": "junior", "targetRole": "Backend Developer" }
```

Only these four keys are accepted, and at least one must be supplied. Unknown keys (including role, userId, email, snake_case fields and timestamps), arrays, empty objects, invalid types, blank strings and unsupported enums return 400.

- displayName: null or trimmed nonempty text, maximum 80 Unicode characters.
- targetRole: null or trimmed nonempty text, maximum 120 Unicode characters.
- domain: null or exactly `computer_science`.
- experienceLevel: null or exactly `junior` / `intermediate`.

Omitted fields remain unchanged. Explicit null clears a field. Text is trimmed before saving; null bytes are rejected because PostgreSQL text cannot contain them. On first save, omitted fields default to null. Ownership comes exclusively from verified identity.

```json
{ "targetRole": null }
```

This clears only targetRole. Success returns HTTP 200 with the same full user/profile envelope as GET and no-store.

The service updates supplied columns first. If no row exists it inserts those columns plus verified user_id. A primary-key conflict triggers exactly one update of supplied columns. There is no whole-row upsert or unbounded retry. Concurrent disjoint edits survive; edits to the same field follow database write order. A save performs at most three database requests, each bounded to eight seconds with SDK network retries disabled. Auth retains its separate eight-second timeout.

## Errors

All errors retain `{ "error": { "code": "...", "message": "...", "retryable": false }, "requestId": "..." }`.

- 400 INVALID_PROFILE: invalid input. Malformed JSON uses existing BAD_REQUEST.
- 401 AUTH_REQUIRED / AUTH_INVALID: existing Auth behavior, or token rejection by the database after verification.
- 403 PROFILE_FORBIDDEN: database permission/RLS failure.
- 409 PROFILE_CONFLICT, retryable true: first-save conflict unresolved after one retry.
- 503 AUTH_UNAVAILABLE: existing temporary Auth error.
- 503 DATABASE_UNAVAILABLE, retryable true: database timeout, connection failure, temporary overload/rate limiting or upstream outage. Back off before retrying.
- 500 INTERNAL_ERROR: schema/configuration defect or unexpected failure. Verify migration and grants; raw SQL details never reach clients or logs.

No delete, listing or by-user-ID endpoint is added. A timed-out write may already have committed; read again or retry the same partial PATCH after recovery.

## Apply the migration manually once

File: `supabase/migrations/202609260001_create_profiles.sql`, relative to backend.

1. Open the Supabase dashboard, select the intended demo project, and privately compare its project URL with backend/.env. Open **SQL Editor → New query**.
2. Run `select to_regclass('public.profiles');`. If a table exists and this migration is not already recorded as applied, STOP and inspect the conflict. Do not drop/recreate it or weaken security.
3. If absent, open the migration locally, paste its **entire contents** into a new SQL Editor query, and click **Run** once. It is transactional; existing table/function conflicts fail instead of replacing objects. On failure stop and investigate, rather than running isolated fragments.
4. Confirm success. Open **Table Editor → public → profiles** and check its seven columns and RLS enabled indicator. In the policies view, confirm the own SELECT, INSERT and UPDATE policies for authenticated users; no DELETE policy.
5. In SQL Editor, inspect the metadata:

   ```sql
   select relrowsecurity from pg_class where oid = 'public.profiles'::regclass;
   select policyname, roles, cmd, qual, with_check
   from pg_policies where schemaname = 'public' and tablename = 'profiles';
   select grantee, privilege_type
   from information_schema.role_table_grants
   where table_schema = 'public' and table_name = 'profiles'
     and grantee in ('anon', 'authenticated', 'PUBLIC');
   select grantee, column_name, privilege_type
   from information_schema.role_column_grants
   where table_schema = 'public' and table_name = 'profiles'
     and grantee in ('anon', 'authenticated', 'PUBLIC');
   ```

   Expect RLS true. Authenticated has table SELECT, column INSERT on user_id and the four editable fields, and column UPDATE on only those four fields. SELECT can also appear in the column view. No anon/PUBLIC grants, DELETE, owner UPDATE or timestamp writes. The timestamp trigger is SECURITY INVOKER.
6. Record the project label, date and applied filename `202609260001_create_profiles.sql` in local migration notes and update docs/progress.md. SQL Editor application does not populate Supabase CLI migration history automatically. Do not rerun the migration on server startup.

The design follows [Supabase column privileges](https://supabase.com/docs/guides/database/postgres/column-level-security) and [PostgreSQL policy rules](https://www.postgresql.org/docs/17/sql-createpolicy.html). Column privileges and RLS both matter; API validation alone is not ownership protection.

## Live verification on Windows

The script **writes synthetic profiles to both supplied accounts** and leaves them in place. Use two distinct dedicated demo accounts only. It never creates/deletes Auth users or changes global Auth settings. Fresh accounts demonstrate first creation; reruns exercise save/read/update on existing profiles.

1. Use existing dedicated confirmed account A. In your editor, add `SUPABASE_TEST_EMAIL`, `SUPABASE_TEST_PASSWORD`, `SUPABASE_TEST_EMAIL_2`, `SUPABASE_TEST_PASSWORD_2` to ignored backend/.env. The second pair must belong to a distinct dedicated demo account. Never put values in chat, commands or committed files. Normal startup does not require them.
2. If account B does not exist yet, run this ordinary SDK signup from a PowerShell terminal inside backend. It reads B's email/password from ignored .env; no credentials appear in the command. Then follow the confirmation link in B's mailbox and confirm both accounts in **Authentication → Users**. If signup fails, inspect the existing signup settings; do not use privileged APIs or change global Auth settings. Skip this command for an existing confirmed account.

   ```powershell
   node --input-type=module -e "import { supabase } from './src/config/supabase.js'; try { const email=process.env.SUPABASE_TEST_EMAIL_2; const password=process.env.SUPABASE_TEST_PASSWORD_2; if (!email || !password) throw new Error(); const {error}=await supabase.auth.signUp({email,password}); console.log(error ? 'FAIL signup request' : 'PASS signup request; check confirmation email'); if(error) process.exitCode=1; } catch { console.log('FAIL signup request'); process.exitCode=1; }"
   ```

   This uses a separate local process; the API's shared verification client never signs in or signs up users.
3. After applying the migration, from the repository root:

   ```powershell
   cd backend
   npm.cmd run lint
   npm.cmd test
   npm.cmd start
   ```

4. In a second PowerShell window, from the repository root:

   ```powershell
   cd backend
   npm.cmd run verify:profiles
   ```

Every check must print PASS and the script must exit 0. It signs in through the SDK, holds tokens in memory and prints only fixed labels with pass/fail, stopping at the first failure. `FAIL test-account-configuration` means local credentials are missing. Failed API checks can indicate an unapplied migration or unavailable server/database. Check the SQL setup without printing credentials. Use `$LASTEXITCODE` to see the exit status.

The script tests both users through Express, then direct user-scoped Data API calls for cross-user reads/inserts/updates, owner/timestamp changes, client deletion, PostgreSQL constraints and anonymous access. It re-reads owners' rows after denied writes; zero-row UPDATE/DELETE is handled correctly. Duplicate-key/FK errors alone do not count as RLS proof.

Stop the server with Ctrl+C afterward. Remove optional credentials when no longer needed. Record actual live results in progress.md. Generated SQL and mocked tests do **not** prove deployment, PostgreSQL access or live RLS. Those remain pending until the migration and live test succeed.
