# PanelIQ Backend Error Fixtures & Frontend Handling Guide

This guide documents the standard error envelopes and reproducible failure scenarios produced by the PanelIQ backend. All error fixtures are machine-readable in [`backend/test/fixtures/error-fixtures.json`](file:///c:/Users/adity/OneDrive/Desktop/paneliq/backend/test/fixtures/error-fixtures.json).

---

## Standard Error Envelope

Every non-2xx HTTP response from the PanelIQ backend adheres to the standard error structure:

```json
{
  "error": {
    "code": "STRING_ERROR_CODE",
    "message": "Human-readable explanation for debugging or display",
    "retryable": false
  }
}
```

- `code` (*string*, required): Machine-readable error identifier for frontend conditionals.
- `message` (*string*, required): User-facing or debugging explanation.
- `retryable` (*boolean*, required): Indicates whether the frontend should allow the user to click "Retry" or perform an automated retry.

---

## Error Catalog & Reproducible Scenarios

| HTTP Status | Error Code | Description & Trigger Scenario | Retryable? | Recommended Frontend Action |
|---|---|---|:---:|---|
| **401** | `AUTH_REQUIRED` | Missing `Authorization: Bearer <token>` header on protected routes. | No | Redirect candidate to `/login`. |
| **401** | `AUTH_INVALID` | Expired or invalid Supabase JWT. | No | Attempt Supabase session refresh; if failed, redirect to `/login`. |
| **403** | `SESSION_FORBIDDEN` / `EVALUATOR_REQUIRED` | Candidate attempting to access another candidate's session, replay, or unreleased report; or candidate attempting evaluator actions. | No | Show "Access Denied: You do not have permission to view or modify this resource." |
| **403** | `ASSIGNMENT_REQUIRED` | Evaluator attempting to review or release a session they are not assigned to. | No | Inform evaluator they must be assigned by an admin. |
| **404** | `SESSION_NOT_FOUND` | Session ID does not exist or does not belong to the authenticated candidate. | No | Show 404 Not Found screen with "Return to Dashboard" button. |
| **404** | `ANSWER_NOT_FOUND` | Source answer ID does not exist for the specified session during retry setup. | No | Notify user the answer could not be located. |
| **404** | `RETRY_NOT_FOUND` | Retry attempt ID does not exist. | No | Return to Session Replay. |
| **409** | `IDEMPOTENCY_CONFLICT` | Same `idempotencyKey` submitted with differing request payloads. | No | Notify user of inconsistent state; refresh session turns. |
| **409** | `SESSION_STALE` | `baseVersion` in payload is older than current server version (e.g. submitted from a background tab). | No | Fetch latest session state via `GET /api/sessions/:id` and update UI. |
| **409** | `TURN_NOT_CURRENT` | Client submitted answer for a turn that is not currently active. | No | Synchronize UI to active turn index. |
| **409** | `SESSION_INCOMPLETE` | Attempted completion while unanswered turns remain. | No | Navigate candidate to the first unanswered turn. |
| **409** | `SCORING_PENDING` | Attempted report release before all criteria across all turns are evaluated. | No | Display "Evaluation in progress..." spinner to evaluator. |
| **409** | `REVISION_IMMUTABLE` | Mutation attempted on an already released report revision. | No | Disable edit/release buttons; report is read-only. |
| **409** | `RETRY_NOT_AVAILABLE` | Retry attempted on an unscored stage (icebreaker/reflection) or question without variant. | No | Disable "Retry Question" button on this turn. |
| **409** | `RETRY_LIMIT_REACHED` | Retry already completed for this answer (PRD maximum is 1 retry per answer). | No | Disable "Retry Question" button and display "Retry already completed". |
| **400** | `INVALID_REQUEST` | Validation error (missing fields, payload > 32KB, invalid UUID). | No | Highlight form field validation errors. |
| **400** | `INVALID_EVIDENCE` | Server evidence validator rejected bad offsets, excerpt mismatch, or fabricated quote. | No | Show evaluator "Evidence excerpt must match candidate answer exactly." |
| **502** | `INVALID_PROVIDER_OUTPUT`| AI provider returned malformed JSON or schema violation. | Yes | Show "Evaluation analysis retry in progress..." |
| **503** | `AI_UNAVAILABLE` | Primary and secondary AI providers exhausted or timed out. | Yes | Session preserved; mark evaluation as pending human review. |
| **503** | `DATABASE_UNAVAILABLE` | Supabase database or network unreachable. | Yes | Display "Connection error. Retrying..." with exponential backoff. |

---

## Reproducing in Local Frontend Development

### 1. Using Unit Test Mocks
Frontend developers can import `backend/test/fixtures/error-fixtures.json` directly into Vitest / Jest / MSW (Mock Service Worker) handlers to test error banners and modals:

```javascript
import fixtures from '../../backend/test/fixtures/error-fixtures.json';

// In MSW handler:
rest.post('/api/sessions/:id/answers', (req, res, ctx) => {
  if (req.headers.get('x-test-scenario') === 'stale') {
    const { status, body } = fixtures.fixtures.SESSION_STALE.response;
    return res(ctx.status(status), ctx.json(body));
  }
});
```

### 2. Live Verification Commands
Run the operational integrity suite to inspect backend behavior directly:
```powershell
npm.cmd test -- test/operational-integrity.test.js
npm.cmd test -- test/integration-journey.test.js
```
