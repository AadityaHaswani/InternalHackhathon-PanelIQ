# Bank-backed interview contract — Tasks 4 and 5

All endpoints below require `Authorization: Bearer <Supabase user access token>`. Health remains public. Auth/profile fields and existing error envelopes are preserved. Responses include `X-Request-Id`, matching JSON `requestId`, and authenticated responses use `Cache-Control: no-store`. No frontend code is included.

**Tasks 6–9 are not implemented:** no constraint challenge, evaluation/scoring, replay/retry workflow or AI follow-ups. Task 10 is also not started. The reviewed follow-up field is bank data only; these sessions contain exactly eight base turns.

## Catalog and onboarding

`GET /api/v1/catalog` → 200:

```json
{
  "data": {
    "domains": ["computer_science"],
    "levels": ["junior", "intermediate"],
    "stages": ["icebreaker", "technical", "techno_managerial", "reflection"],
    "topics": ["apis", "databases", "concurrency", "reliability", "project_tradeoffs"],
    "roles": [{ "slug": "backend_developer", "domain": "computer_science", "label": "Backend Developer" }]
  },
  "requestId": "<request-id>"
}
```

Catalog requires authentication and reads enabled roles from the database. It does not return questions, keys, expected concepts or scoring rules. More job roles can be added with future role/seed migrations; question versions have an array of eligible role slugs.

Before creating a session, save a profile through existing `PATCH /me` with non-null displayName, domain, experienceLevel and targetRole. **Store `targetRole: "backend_developer"`**, not the display label `Backend Developer` or a guessed title. The profile endpoint retains its existing free-text compatibility, but session creation strictly requires a supported catalog slug. Existing free-text profiles must be updated deliberately; there is no silent fallback. Sessions preserve their own role/profile snapshot even if the profile later changes.

## Safe session shape

Examples below use `<session>` for this object:

```json
{
  "id": "<session-uuid>",
  "profile": { "displayName": "Demo", "domain": "computer_science", "experienceLevel": "junior", "targetRole": "backend_developer" },
  "status": "active",
  "version": 1,
  "answeredCount": 0,
  "totalTurns": 8,
  "createdAt": "<ISO timestamp>",
  "completedAt": null,
  "currentTurn": {
    "id": "<turn-uuid>",
    "position": 1,
    "questionId": "be-j-intro-project",
    "questionVersion": 1,
    "prompt": "Describe a small backend project you built. What did it do, and which part did you personally implement?",
    "stage": "icebreaker",
    "panelRole": "chair",
    "topics": ["project_tradeoffs"],
    "difficulty": 1
  }
}
```

`answeredCount` counts submitted **or explicitly skipped** turns. No expected concepts, rubric, private answer keys or follow-up text appears in this DTO. Difficulty is 1–3. The eight-turn order is chair icebreaker, four technical turns, two project-panel techno-managerial turns, then chair reflection.

## Create and list

`POST /api/v1/sessions`, body `{}` → **201**:

```json
{ "data": { "session": "<session>" }, "requestId": "<request-id>" }
```

The session value is the object above, not a string. No user ID, domain, level, role or question IDs are accepted in the HTTP request. Selection reads the persisted profile and latest published version per stable question, matches role/domain/level, avoids duplicate stable question IDs and favors new technical topic tags. Randomized ties vary plans; consecutive plans can share questions. No cross-session exhaustion rule is imposed. The MVP reads at most 1,000 eligible versions per selection.

SQL rechecks the authenticated profile, every question's publication/eligibility, eight-turn order and uniqueness, then inserts the session and all snapshots in one transaction. A failure leaves no partial plan. This POST is **not idempotent**: disable repeated create clicks; after an ambiguous create timeout, inspect the list before creating another session.

`GET /api/v1/sessions?limit=20&offset=0` → 200:

```json
{
  "data": {
    "sessions": [{ "id": "<uuid>", "profile": { "displayName": "Demo", "domain": "computer_science", "experienceLevel": "junior", "targetRole": "backend_developer" }, "status": "active", "version": 2, "answeredCount": 1, "totalTurns": 8, "createdAt": "<ISO timestamp>", "completedAt": null }],
    "nextOffset": null
  },
  "requestId": "<request-id>"
}
```

Only own summaries are returned, newest first. Limit defaults to 20 and is capped at 50; offset defaults to 0 and is capped at 10,000. Unknown query fields are rejected. Offset paging can shift when a new session is created; refresh the first page then.

## Resume

`GET /api/v1/sessions/<session-id>` → 200 with `{ "data": { "session": <session> }, "requestId": "..." }`.

Refresh always reads persisted state. It does not rerun selection or regenerate questions. A missing or another user's session returns the same 404. Store the returned turn ID and version for the next action. There is no advance endpoint: saving/skipping advances atomically.

## Save an answer

`POST /api/v1/sessions/<id>/answers`

```http
Content-Type: application/json
Idempotency-Key: <new-uuid>
```

```json
{ "turnId": "<current-turn-uuid>", "expectedSessionVersion": 1, "answerText": "My response..." }
```

Answer text is trimmed, must be nonempty, contain no null byte and be at most 2,000 Unicode characters. Unknown fields and invalid types are rejected. Success → 200:

```json
{
  "data": {
    "answerId": "<saved-answer-uuid>",
    "answerState": "submitted",
    "session": { "id": "<session-id>", "profile": "<unchanged profile snapshot>", "status": "active", "version": 2, "answeredCount": 1, "totalTurns": 8, "createdAt": "<ISO timestamp>", "completedAt": null, "currentTurn": "<next safe turn object>" }
  },
  "requestId": "<request-id>"
}
```

The profile and currentTurn placeholders stand for the objects shown earlier. This response unambiguously identifies the saved answer and next state. Mark a reply saved only after it arrives.

## Explicit skip

`POST /api/v1/sessions/<id>/skip` with a new Idempotency-Key:

```json
{ "turnId": "<current-turn-uuid>", "expectedSessionVersion": 2, "confirm": true }
```

Show a confirmation UI before this request. HTTP 200 has the same saved-outcome envelope as answers, with `answerState: "skipped"`. The stored answer_text is null, not a fabricated empty response. Version and position each advance once.

## Idempotency and concurrency

- Keys are case-sensitive, 8–128 ASCII letters/digits/underscores/hyphens. A UUID is suitable. Scope is one session, shared between answers and skips.
- Preserve the key **and entire original body/version** across timeout/reconnect retries. Use a new key for a new logical action.
- Same key + same turn/version/action/normalized text returns the exact saved data outcome. Surrounding text whitespace is normalized before comparison. Response requestId is still per HTTP request.
- Same key with different content returns 409 IDEMPOTENCY_CONFLICT. A different key with a stale version returns 409 SESSION_STALE. Two competing answers for one turn cannot both win.
- PostgreSQL locks the owned session row, checks prior key usage, inserts one answer, advances the session and records the saved outcome in a **single RPC transaction**. There are no separate client write/advance calls.
- Replaying a previously successful key remains read-only even after completion. Its saved outcome can describe an earlier session version; use GET to reconcile with the latest state after reconnect. Never overwrite newer UI state with an older replayed version.
- After a 409, GET the session, preserve the local draft, and ask the user whether to proceed with the actual current turn. Do not silently attach an old answer to a new question.

## Complete

After the eighth save/skip, the state is `ready_to_complete`, version 9, answeredCount 8 and currentTurn null. It is **not yet completed**.

`POST /api/v1/sessions/<id>/complete`:

```json
{ "expectedSessionVersion": 9 }
```

HTTP 200 returns `{ "data": { "session": <completed-session> }, "requestId": "..." }`: status completed, version 10, completedAt set and currentTurn null. Completing early returns 409 SESSION_INCOMPLETE. A stale version returns 409 SESSION_STALE. Once completed, repeated complete calls return the frozen current state without incrementing again (a positive version is still required). No Idempotency-Key is needed for completion.

No new answer or skip can mutate a completed interview. No sockets, AI calls, scoring jobs, extra follow-ups, replay/retry or evaluator operations are triggered.

## Errors and timeouts

All use `{ "error": { "code": "...", "message": "...", "retryable": false }, "requestId": "..." }`.

- 400 INVALID_REQUEST: malformed fields/key/UUID/version, unknown properties, invalid answer or missing skip confirmation. PROFILE_INCOMPLETE / PROFILE_UNSUPPORTED: complete onboarding using catalog choices.
- 401 AUTH_REQUIRED / AUTH_INVALID: missing, invalid or expired authentication; preserve existing frontend refresh UX.
- 403 SESSION_FORBIDDEN: database privilege failure. Do not treat as an absent session or weaken permissions.
- 404 SESSION_NOT_FOUND: session absent or not yours; no ownership disclosure.
- 409 BANK_INSUFFICIENT: not enough reviewed published questions; operator must review/publish sufficient eligible bank content. BANK_CHANGED: question eligibility changed during creation; refresh/retry creation deliberately. Other 409 codes are described above, including TURN_NOT_CURRENT and SESSION_NOT_ACTIVE.
- 503 AUTH_UNAVAILABLE / DATABASE_UNAVAILABLE: temporary provider/network failure; retryable true. Reads may be retried with backoff. For saves, reuse the original key and payload because a timeout does not prove rollback.
- 500 INTERNAL_ERROR: schema/configuration defect or unexpected failure. Missing tables/RPCs are not treated as empty sessions. Raw provider/SQL details and answer text are never returned as errors.

Auth and each database request have existing eight-second bounds. Session creation performs several sequential reads then one atomic RPC; frontend timeouts should allow for that. Automatic SDK database retries remain disabled.

## Database security decision

Candidates can SELECT their own sessions, turns and answers under RLS. They have **no direct write grants** on these tables, published bank content or private keys. Bank keys are a separate RLS-enabled table with no candidate/anon grants or policies. Published versions and their keys are immutable; new wording needs a new version. Snapshots remain unchanged when a version is archived.

`session_state(uuid)` is SECURITY INVOKER and explicitly filters auth.uid(). Three transaction RPCs are SECURITY DEFINER: `create_interview_session`, `save_interview_turn`, `complete_interview_session`. This is necessary to allow atomic constrained writes while denying direct table mutation. Each has `search_path = ''`, schema-qualified tables, no owner/user parameter, mandatory auth.uid() checks, explicit input checks, and execute granted only to authenticated. Save/complete lock and check the owned session. Public/anon execution is revoked. Create revalidates a caller-suggested question plan against the persisted profile. Direct RPC calls cannot bypass completion or ownership checks. The migration owner must be the trusted SQL Editor database owner, never a candidate role.

See [Supabase function security](https://supabase.com/docs/guides/database/functions) and [PostgreSQL row locking](https://www.postgresql.org/docs/17/explicit-locking.html). These are implementation choices, not claims that the pending deployment has passed live tests.

## Apply and verify manually

No database administration connector or local PostgreSQL runtime is configured. SQL was generated and inspected locally, not executed. Existing Task 3 live preflight returned PGRST205 for profiles; resolve that first.

1. Open the intended demo project in Supabase. Privately compare its URL with backend/.env. Open **SQL Editor → New query**. Run `select to_regclass('public.profiles');`. If absent, run the entire existing `202609260001_create_profiles.sql` migration once. If present unexpectedly, inspect it against the Task 3 contract instead of replacing it. If present and correct but Data API reports PGRST205, verify the selected project/exposed public schema and reload the schema cache (`NOTIFY pgrst, 'reload schema';`) through SQL Editor.
2. Run these **entire files**, one at a time and in order, once each:
   - `supabase/migrations/202609270001_question_bank.sql`
   - `supabase/migrations/202609270002_interview_sessions.sql`
   - `supabase/migrations/202609270003_backend_question_drafts.sql`
3. Stop on any existing-object conflict or SQL error; do not drop objects, reset data or run fragments. Record each successful filename, project label and date in your migration notes and progress.md. None is automatically applied on server startup.
4. Review all 32 sample prompts, optional follow-ups and private concepts in `supabase/seeds/backend-developer.questions.json`, together with question_keys.rubric_notes. These are **AI-authored drafts, not expert-reviewed questions**. Have a named human check correctness, ambiguity, junior/intermediate fit, role alignment and coverage. Edit drafts if needed. Do not approve content by merely running the migration.
5. After actual review, publish only reviewed draft IDs in SQL Editor. Example for **one reviewed item**, replacing the reviewer label:

   ```sql
   update public.question_versions
   set reviewed_by = 'actual reviewer name', reviewed_at = now(), status = 'published'
   where question_id = 'be-j-intro-project' and version = 1 and status = 'draft';
   ```

   Repeat for approved IDs (an explicitly reviewed ID list with `IN (...)` is acceptable). Publish at least 1 icebreaker, 4 technical, 2 techno-managerial and 1 reflection **per level**; ideally all 32 to support repeated varied sessions. Do not invent reviewer attribution. There is no application admin/publication endpoint.
6. In Table Editor/policies, check RLS enabled for interview_roles, question_versions, question_keys, sessions, session_turns and answers. In SQL Editor inspect:

   ```sql
   select tablename, policyname, roles, cmd, qual, with_check from pg_policies
   where schemaname = 'public' and tablename in
     ('interview_roles','question_versions','question_keys','sessions','session_turns','answers');
   select grantee, table_name, privilege_type from information_schema.role_table_grants
   where table_schema = 'public' and grantee in ('anon','authenticated','PUBLIC')
     and table_name in ('interview_roles','question_versions','question_keys','sessions','session_turns','answers');
   select proname, prosecdef, proconfig, proacl from pg_proc
   where pronamespace = 'public'::regnamespace and proname in
     ('session_state','create_interview_session','save_interview_turn','complete_interview_session');
   select experience_level, stage, status, count(*) from public.question_versions
   group by experience_level, stage, status order by 1,2,3;
   ```

   Expect authenticated SELECT only on safe tables, no candidate grants on keys, own-row session/turn/answer SELECT policies, and no direct client writes. Transaction functions should have the fixed search_path and authenticated-only execution.
7. Both test-account credential pairs are already present locally; confirm they refer to distinct dedicated confirmed demo accounts. Keep all four credentials only in ignored .env. From the repository root:

   ```powershell
   cd backend
   npm.cmd run lint
   npm.cmd test
   npm.cmd start
   ```

   In a second terminal inside backend:

   ```powershell
   npm.cmd run verify:auth
   npm.cmd run verify:profiles
   npm.cmd run verify:sessions
   ```

   The scripts write synthetic data to those accounts, never real users. Run profiles **before** sessions: the profile smoke test clears targetRole, and sessions then sets the supported slug. Session verification leaves A completed and B active, plus synthetic answers. No cleanup/deletion is attempted. Output is sanitized PASS/FAIL/status only; require exit code 0 (`$LASTEXITCODE`).
8. To verify rollback after insertion, paste the **entire** `supabase/tests/session-rollback.sql` into SQL Editor. It creates a fault-injection trigger inside a transaction, exercises an active synthetic session, checks that neither its answer count nor position/version changed, prints a PASS notice, then **ROLLBACK** removes every probe change. Do not omit/change ROLLBACK. This is a manual database test, not a migration. Stop on an unexpected error and roll back the transaction.
9. Record actual live results and stop the temporary server with Ctrl+C. Only then can database ownership and transaction gates be marked passed. Mocked tests and generated SQL do not satisfy these gates.

## Initial bank coverage gap

32 distinct drafts: per level, 2 icebreakers, 8 technical, 4 techno-managerial and 2 reflections. Technical coverage includes APIs, databases, concurrency and reliability; managerial prompts include project trade-offs. This supports two disjoint eight-question plans per level after review/publication. The PRD's 40–60 target is short by 8–28 questions. Only backend_developer is supported; other roles and broader bank expansion are a separate data task. Human review/publication remains an explicit blocker, and no generated draft is presented as expert-approved.
