# PANELIQ
## Product requirements & implementation playbook

**Working name:** PanelIQ — evaluate the interview, improve both sides.  
**Problem statement:** PSWB01, Web based Selector–Applicant Simulation Software.  
**Version:** 1.1 · 26 September 2026  
**Team:** Dev 1, Dev 2, Dev 3 — frontend; Dev 4 — you, backend.  
**Budget:** ₹0 incremental hosting/API spend within free-plan allowances.  
**Delivery:** A working web prototype implementing all five core features.  
**Status:** Build specification; not a claim that the product has already been implemented or validated.

> Build a credible interview simulation: relevant questions, traceable assessment, a better interviewer, and a useful second attempt. Make the ordinary workflow reliable before decorating it.

---

### Find your assignment

| Developer | Responsibility | Detailed task list |
| --- | --- | --- |
| **Dev 1 — Frontend** | Design system, app shell, auth, dashboard, admin screens | Section 14.2: D1-01 through D1-08 |
| **Dev 2 — Frontend** | Interview room, save/resume, constraint challenges | Section 14.3: D2-01 through D2-08 |
| **Dev 3 — Frontend** | Reports, expert tools, replay and retry | Section 14.4: D3-01 through D3-08 |
| **Dev 4 — You, Backend** | APIs, database, auth enforcement, AI/fallback, jobs, CI/deployment | Section 14.5: D4-01 through D4-11 |

Read the shared product requirements first, then your checklist. Section 14.6 defines handoffs; Section 14.7 defines who edits shared files. All five features and the original detailed requirements remain in scope.

## 1. Product decision and honest positioning

### Does this solve the actual problem?

Yes, the proposed workflow directly addresses the supplied PSWB01 screenshot: simulate a boardroom interview, progress from icebreakers to technical/managerial questions, match the applicant's expertise and level, assess the relevance of questions and answers, and help experts reach an overall assessment. The product must implement an expert workflow as well as candidate practice; a candidate-only chatbot would cover only part of the problem.

This is a prototype for simulation, coaching, and human decision support. It does not establish that AI can objectively determine job suitability. Scores need reviewed rubrics, evidence, and human correction. No automatic hiring/rejection decision is in scope. Do not claim DRDO endorsement or use its branding as if affiliated.

### Are our features better than existing platforms?

Not proven. Current products already offer substantial overlap. The table describes documented capabilities, not a complete competitive audit or a hands-on benchmark. Missing documentation is not proof that a competitor lacks a feature.

| Existing platform | Documented overlap | Implication for our pitch |
| --- | --- | --- |
| Yoodli | Interview roleplays, custom context and rubrics, feedback, and multi-persona scenarios [S1–S3] | AI panel personas and personalized feedback alone are not a unique selling point. |
| Huru | Interview practice and feedback; organizational practice/review workflows [S4] | A practice dashboard and feedback report are baseline expectations. |
| interviewing.io | Technical mock interviews, an AI interviewer, actionable feedback; published discussion of an interviewer rating system [S5–S6] | Neither technical practice nor evaluating interviewers is automatically novel. |

**Defensible positioning hypothesis:** A focused scientific/technical interview simulation that combines question-quality assessment, evidence-linked candidate scoring, constraint-change challenges, targeted retry, and graceful operation when AI is unavailable.

We can demonstrate this combination. We cannot yet claim market superiority, unbiased assessment, validated prediction of job performance, or exclusive features. Validate usefulness with pilot users and show measured outcomes in the final presentation.

### What we will prove in the demo

1. Questions follow the selected domain, role, experience level, and stage.
2. A panel can inspect question quality separately from candidate performance.
3. Every proposed criterion score has inspectable evidence or an explicit missing-evidence explanation.
4. A constraint change produces a meaningful reasoning challenge.
5. A candidate can replay, retry, and compare feedback without rewriting the original attempt.
6. Provider failures do not lose an answer or prevent the database-backed interview from continuing.

## 2. Scope, assumptions, and priorities

All five features are committed for v1. Build thin, complete versions first; premium polish and optional extensions follow integration.

| Decision | v1 boundary |
| --- | --- |
| Domain | Computer science, initially backend systems; honest supported-domain label |
| Levels | Junior and intermediate; no unsupported senior-scientist claim |
| Interaction | Text-first boardroom with three simulated panel roles |
| Session | Eight base prompts: one icebreaker, four technical, two techno-managerial, one reflection; up to two follow-ups within a ten-turn cap |
| Constraint challenge | One stored challenge replaces a suitable technical base prompt; up to one of the two follow-ups explores its changed constraint |
| Timing | Suggested 15–20 minutes; elapsed timer, no forced answer submission |
| AI | Enhances follow-ups and proposes feedback; question bank remains the foundation |
| Expert participation | Assigned evaluator reviews sessions; separate interviewer training sandbox accepts custom questions |
| Live multi-user panel | Deferred; simulated boardroom does not imply video conferencing or simultaneous human interviewing |
| Supported browser targets | Current desktop Chrome/Edge; responsive reading and text participation on mobile |
| Language | English v1; no accent, facial-expression, emotion, or personality scoring |
| Deadline | Not yet supplied; use milestone gates rather than an invented calendar promise |

### Out of scope until all five pass acceptance

Video calls, animated talking avatars, recording storage, résumé OCR, arbitrary URL ingestion, code execution sandboxes, embeddings/vector databases, fine-tuning, microservices, payments, automatic candidate ranking, and production recruitment integration. Voice may be a later enhancement but must not replace the text path.

## 3. Users and access model

| Role | Allowed actions | Explicit boundary |
| --- | --- | --- |
| Candidate | Edit own profile, run own interviews, view released own reports, retry own answers, delete own session data | Cannot see other candidates, answer keys during an active session, or unreleased reviewer notes |
| Evaluator | Review explicitly assigned sessions, inspect evidence, score rubric criteria, add reasoned overrides; practice writing questions | Cannot access every candidate by merely selecting an evaluator UI |
| Admin | Manage approved question-bank versions, assign evaluators, provision roles, archive content | Role grants occur through trusted server/admin operations |

One user may have multiple approved roles. Frontend role switching changes navigation only; it never grants permissions. Self-registration creates candidate access. Admin/evaluator demo accounts are provisioned in advance. Assignment and role checks happen on every protected backend action.

## 4. Problem-to-requirement traceability

| PSWB01 need | Product response | Evidence of completion |
| --- | --- | --- |
| Boardroom experience | F1: three panel roles, structured stages, contextual follow-up | Recorded live walkthrough |
| Questions match expertise and level | Tagged bank, setup profile, selector rules, F2 | Inspect selected tags and deterministic selector tests |
| Quantifiable question relevance for experts | F2: separate alignment/clarity/coverage rubric | Expert question assessment with explanation |
| Grade response relevance and subject knowledge | F3: candidate rubric with answer-linked evidence | Criterion details and reviewer correction |
| Increasing technical/managerial depth | Stage plan plus F4 constraint challenge | Baseline scenario followed by changed condition |
| Assist overall assessment | F3: coverage-aware advisory summary, human review | Released report that identifies uncertainty |
| Useful practice beyond assessment | F5: replay and targeted retry | Immutable original plus comparison attempt |

## 5. The five core features

### F1 — Adaptive AI Boardroom

**User story:** As a candidate, I want a realistic sequence of questions matched to my role and experience so practice tests relevant knowledge.

**Frontend:** Three panel cards (Technical Specialist, Project Evaluator, Panel Chair), active-speaker indicator, question card, stage rail, turn count, answer composer, elapsed time, and saved/submitting state. Use neutral initials or licensed icons; elaborate avatars are unnecessary. The panel chair asks the icebreaker and reflection; specialist/project roles handle the technical and managerial stages.

**Backend:** Persist the session plan and selected question snapshots. Select approved questions matching domain/level/stage, exclude repeats, and prefer uncovered topic targets. AI can propose up to two bounded follow-ups using the current question, answer, rubric, and compact session context. Validate output shape, topic, length, and forbidden answer leakage before display. Reject malformed or unsuitable output and use the stored follow-up.

**Adaptivity:** Without validated answer evaluation, adjust by stage, topic coverage, candidate-selected level, and predefined branches. Do not infer ability from typing speed or keyword counts. AI-enabled branches may use a proposed rubric result, visibly advisory, without changing the session's supported difficulty range.

**Acceptance:** Refresh restores the active turn; duplicate submit creates one answer; timeout leads to a valid bank question; all eight base prompts are traversable without AI; no answer key reaches the client during an active interview. A resume action does not regenerate the session plan.

### F2 — Interviewer Quality Radar

**User story:** As an evaluator, I want to know whether our questions are relevant, clear, level-appropriate, and sufficiently broad.

**Two entry points:** (a) a completed session's question-quality tab; (b) a training sandbox where an expert enters a target role, level, required topic tags, and a proposed question. The sandbox offers an assessment and a suggested rewrite when AI is available. Accepting a rewrite saves a draft only; admin review is required before it enters the bank.

**Frontend:** Overall available-score summary, per-question list, topic coverage bars, criterion details, original/rewrite comparison, and an explanation drawer. A table must accompany any radar chart. Candidate and interviewer scores use separate tabs and never share one combined total.

**Backend:** Compute metadata alignment and repetition/coverage indicators from tags and history. Treat these as metadata indicators, not proof of actual semantic relevance. AI or a human rates clarity, role relevance, level fit, and assessability. Store source and rubric version for each result. Tag-only mode must show unavailable semantic ratings as pending, never invent a full quality score.

**Acceptance:** A reviewed deliberately off-topic question is flagged in a seeded example; repeating a topic changes the coverage view; a custom question can be submitted and reviewed; AI failure leaves useful metadata indicators; suggested rewrites remain drafts.

### F3 — Evidence-Linked Scorecard

**User story:** As a candidate or evaluator, I want to understand and challenge the basis of a score.

**Frontend:** Summary with evaluation status and coverage, four criterion bars, per-answer expandable rows, evidence excerpts, missing points, source labels, and a reviewer override form. Clicking an evidence link opens the exact turn in replay. Pending is a status, never a zero score.

**Candidate rubric:** Correctness 40%, reasoning 25%, relevance 20%, trade-offs/application 15%. Each applicable criterion has reviewed anchors on a 0–4 scale. A question may mark a criterion not applicable; the backend renormalizes applicable weights. Icebreakers and reflection are unscored. Managerial prompts require judgment rubrics, not a single supposedly correct answer.

**Interviewer rubric:** Role/domain relevance 35%, level fit 25%, clarity 25%, assessability 15%, also 0–4 with anchors. Topic coverage and repetition are separate diagnostics. These weights are proposed product choices, not scientifically validated measures.

**Calculation:** For a fully evaluated answer, score = 100 × sum(weight × rating/4) / sum(applicable weights). For completed scored answers, session score is their mean in v1. If any required scoring is pending, show a provisional aggregate and evaluated/required count; exclude unknowns rather than counting them as zero. No final aggregate until all required criteria are evaluated. For a deliberately skipped scored turn, require confirmation and record zero on applicable criteria with the reason “No response submitted”; a network failure is never an omission.

**Evidence:** AI must return answer-relative character offsets and exact excerpt, criterion ID, rating, rationale, missing points, and limitations. Server checks offsets against the immutable answer. Unsupported excerpts invalidate that criterion. Absence of a concept may be described as missing; never fabricate a quote to prove absence. No self-reported model confidence percentage is treated as calibrated probability.

**Human review:** Preserve the initial AI proposal. Store each override with evaluator ID, criterion, old/new value, reason, timestamp, and revision. Only an assigned evaluator/admin can release a human-reviewed report. Candidate practice may display a clearly marked AI-draft report before review.

**Acceptance:** Every numerical criterion has evidence or a justified missing-evidence explanation; invalid AI evidence stays pending; formula tests pass; override history remains inspectable; report refresh makes no new AI call; switching provider never silently overwrites a released report.

### F4 — Change One Constraint

**User story:** As a candidate, I want to demonstrate how my reasoning adapts when a realistic constraint changes.

**Example:** Original: design duplicate-safe order processing. Change: two identical requests now arrive concurrently. Follow-up: explain how your design prevents a race condition.

**Frontend:** Original scenario, a distinct “New constraint” callout, optional expandable previous answer, and a new answer field. Keep labels explicit. Do not call this a lie detector or cheating detector.

**Backend:** Store scenario ID, baseline prompt, changed constraint, follow-up, expected reasoning points, and rubric version. Select one approved scenario per session. Link the original answer and challenge answer; score them separately. AI may phrase a follow-up within the stored scenario, but cannot silently change its assumptions or difficulty.

**Acceptance:** The constraint is visible alongside the original context; answers have separate IDs; the bank-only version works; the report assesses adaptation against documented anchors rather than penalizing a different valid solution.

### F5 — Interview Replay + Targeted Retry

**User story:** As a candidate, I want to revisit an answer, understand a gap, and try a comparable problem.

**Frontend:** Text timeline with stage/topic filters, panel/question/answer cards, linked feedback, and a “Practice this skill” action. Retry page shows the target criterion, an approved comparable prompt, answer composer, and before/after rubric comparison. No video player is implied.

**Backend:** Original session is immutable after completion. A retry is a child attempt linked to the source answer, question variant, and rubric. Permit one retry per eligible answer in v1 to bound scope and usage. Reuse the same evaluation pipeline and record provider/rubric version. If rubric versions differ, show both results without a numeric improvement claim.

**Acceptance:** Retry never alters the original report; candidate can only retry their own answer; pending feedback shows honestly; comparison distinguishes same-question practice from a different variant; improvement on one exercise is not presented as proof of increased employability.

## 6. Primary journeys

### Candidate

Landing → sign in → domain/level profile → dashboard → session setup → preflight → boardroom → processing/pending → scorecard → replay → targeted retry → comparison.

Preflight explains text input, approximate duration, AI-draft assessment, and how answers are saved. Starting a session creates a persisted plan, not just a frontend route transition. A candidate can resume an active session from the dashboard.

### Expert

Sign in → assigned sessions → review → candidate evidence tab / question-quality tab → reasoned corrections → release report. Separately: question lab → input question + target context → assess → inspect rewrite → save draft.

### Admin

Sign in → question bank → filter/review draft → edit tags, anchors, expected points and follow-ups → publish new version. Assign an evaluator to a session. Historical sessions retain the exact question/rubric snapshot used originally.

## 7. Page-by-page frontend build specification

**Owner labels:** Dev 1 = platform/design lead; Dev 2 = interview experience; Dev 3 = insights/expert tools; Dev 4 = you, backend developer. Each route includes loading, empty, error, forbidden, and narrow-screen behavior where applicable.

| Route | Owner | Must contain | Backend dependency / key state |
| --- | --- | --- | --- |
| `/` | Dev 1 | Product value, five-feature overview, sample labeled report, “Start practice” CTA | Static; never show fabricated customer counts |
| `/auth` | Dev 1 | Email/password sign-in/up, validation, reset link, confirmation guidance | Supabase Auth; distinguish invalid login from offline |
| `/auth/callback`, `/auth/reset` | Dev 1 | Session recovery and password-reset completion | Auth redirect allowlist; expired-link state |
| `/onboarding` | Dev 1 | Display name, supported domain, level, target role; minimal data | `GET/PATCH /me`, `GET /catalog` |
| `/app` | Dev 1 | Resume card, new interview CTA, recent sessions, pending reviews, truthful progress | `GET /sessions`; genuine empty state |
| `/app/interviews/new` | Dev 2 | Role/level, topic targets, session length explanation, preflight | `GET /catalog`, `POST /sessions` |
| `/app/interviews/:id` | Dev 2 | Panel, stage rail, prompt, composer, save state, challenge card, exit/resume | Session/turn endpoints; active, submitting, reconnecting |
| `/app/interviews/:id/report` | Dev 3 | Candidate scorecard, question-quality tab, evidence drawer, evaluation status | `GET /sessions/:id/report`; draft/pending/reviewed |
| `/app/interviews/:id/replay` | Dev 3 | Immutable text timeline, filters, deep-linked evidence, retry CTA | `GET /sessions/:id/replay` |
| `/app/retries/:id` | Dev 3 | Target criterion, new prompt, composer, comparison | Retry endpoints; Dev 2's composer reused |
| `/expert` | Dev 3 | Assigned-session list, review status filters, question-lab link | `GET /review-assignments` |
| `/expert/sessions/:id` | Dev 3 | Transcript/evidence, criterion controls, reason field, review history, release | Review/override/release endpoints |
| `/expert/question-lab` | Dev 3 | Target context, proposed question, assessment, optional rewrite, save draft | Question-assessment endpoints |
| `/admin/questions` | Dev 1 | Search/filter bank, version editor, publish/archive, rubric form | Admin question endpoints |
| `/admin/assignments` | Dev 1 | Session and approved evaluator selection | Assignment endpoint; no self-grant roles |
| `/app/settings` | Dev 1 | Profile, privacy explanation, delete-own-session workflow, sign out | Profile/delete endpoints |
| `*` | Dev 1 | Useful 404, return-to-dashboard action | No redirect loop |

### Shared component contract

Dev 1 owns `Button`, `Input`, `Select`, `Dialog`, `Tabs`, `Badge`, `Toast`, `Skeleton`, `EmptyState`, `ErrorState`, `AppShell`, `PageHeader`, `DataTable`, and design tokens. Dev 2 owns `PanelCard`, `StageRail`, `QuestionCard`, `AnswerComposer`, `SaveIndicator`, and `ConstraintCard`. Dev 3 owns `ScoreBar`, `EvidenceDrawer`, `RubricTable`, `CoverageChart`, `EvaluationStatus`, `TranscriptTurn`, and `ComparisonCard`.

Dev 2 exports `AnswerComposer` with controlled `value`, `onChange`, `onSubmit`, `disabled`, `maxLength`, and `submissionState` props so Dev 3 can reuse it. It must not fetch data internally. Dev 3 exports score/evidence components independent of route context. Shared components use typed props and never contain provider keys or direct AI calls.

### Frontend state rules

- TanStack Query owns fetched state; component state owns form edits and open drawers. Avoid Redux in v1.
- A shared API client adds the current access token, parses the common error shape, and supports AbortSignal.
- Route guards improve UX; the backend remains the authorization authority.
- Refresh returns to the persisted current turn. Poll report jobs only while queued/running, every five seconds, and stop on terminal state, tab hidden, or leaving the page.
- Keep a draft for the current answer in sessionStorage, keyed by account/session/turn; clear on confirmed submit, sign-out, and deletion. Do not place transcripts in logs or long-lived browser storage.
- “Saved” means the backend has acknowledged persistence. During loss of connectivity, show “Draft on this device — reconnect to submit.” No full offline promise.
- Disable duplicate clicks, but also send an idempotency key; UI disabling is not sufficient.
- Candidate-facing text says “Using prepared questions” or “Detailed feedback pending.” Provider names and quota diagnostics belong in admin/developer views.

## 8. Premium visual direction

**Style:** A calm, precise interview workspace: midnight navy, warm white typography, restrained violet accents, clear tables, and generous spacing. Premium should come from typography, hierarchy, and consistency, not animation volume.

| Token | Value / rule |
| --- | --- |
| Background | `#0B1020` |
| Surface | `#121A2B` |
| Elevated surface | `#19243A` |
| Main text | `#F5F7FC` |
| Secondary text | `#B7C2D6` |
| Primary action | `#C4B5FD` background with `#171129` text |
| Success | `#6EE7B7`; accompany with label/icon |
| Warning | `#FCD34D`; accompany with label/icon |
| Error | `#FDA4AF`; accompany with explanation |
| Decorative border | `#2B3852`; interactive boundaries must pass contrast testing |
| Font | Locally bundled Inter with system sans-serif fallback; system monospace for technical snippets |
| Spacing | 4, 8, 12, 16, 24, 32, 48, 64 px |
| Corners | 10 px controls, 16 px cards, 20 px major panels |
| Type | 14 px metadata minimum, 16 px body, 24–32 px page headings, restrained 48–56 px landing headline |
| Motion | 120–180 ms color/opacity transitions; respect reduced motion |

Use CSS custom properties mapped into Tailwind utilities. No scattered hardcoded colors. One icon family (Lucide). No paid fonts, image APIs, giant blurred gradients behind forms, fake terminal output, rotating hero text, or continuous background animation. Decorative gradients may appear sparingly on the landing page.

Desktop app: 240 px sidebar, compact top bar, content max-width about 1280 px. Interview page: panel strip above a dominant question/composer area, secondary stage rail beside it. At tablet sizes collapse navigation; below 768 px stack the panel cards and move secondary details into drawers. At 360 px no page-level horizontal overflow; wide tables may use a labeled scroll region.

Keyboard access, visible focus rings, semantic headings, labeled fields, modal focus management, and 44 px touch targets are required. Check WCAG AA text contrast with actual component pairings; the token list is not a certification. Score charts require text/table equivalents. Do not encode AI/pending/human-reviewed status through color alone.

### Mocking rules for three parallel frontend developers

Use MSW handlers derived from shared Zod contracts. Fixtures must cover empty dashboard, active session, constraint turn, AI-draft report, pending evaluation, human-reviewed report, 403, network error, and duplicate submission recovery. Mock mode is explicit and visible in development. Never silently substitute fake scores in a real demo. Contract changes land before dependent UI changes.

## 9. Technology stack and architecture

| Layer | Choice | Why / boundary |
| --- | --- | --- |
| Runtime | Node.js 24 LTS; pin exact tested patch at setup | Same runtime locally and in CI [S12] |
| Repository | npm workspaces + one lockfile | One install and shared contracts, minimal tooling |
| Frontend | React + TypeScript + Vite | Familiar SPA; no SSR requirement |
| Routing / fetching | React Router + TanStack Query | Clear routes and server-state ownership |
| UI | Tailwind CSS + shadcn/ui primitives + Lucide | Consistent accessible base, customized tokens |
| Forms / contracts | React Hook Form + Zod | Input validation and shared request/response schemas |
| Charts | Recharts, limited to useful bars/coverage | Text tables remain authoritative |
| Backend | Express + TypeScript | One modular application, no microservices |
| Identity / database | Supabase Auth + hosted PostgreSQL | Managed identity and relational data |
| Database access | Supabase JS, RLS-protected queries, SQL migrations/RPC for transactions | Avoid a second database or ORM initially |
| AI | Groq primary, eligible Gemini free-tier model secondary | Provider adapters; model IDs configurable |
| Tests | Vitest, Testing Library, Supertest, Playwright | Logic, authorization, contract and critical journey tests |
| Frontend hosting | Render Static Site candidate | Verify current eligibility; no purchased domain needed |
| API hosting | Render free web service candidate | Cold starts are expected; laptop demo is fallback [S10] |
| CI | GitHub Actions, standard Linux runner | Public standard-runner jobs are free; private quotas must be checked [S11] |

Pin compatible dependency versions and commit `package-lock.json`; do not paste an arbitrary future package version from this document. Keep Tailwind's setup consistent with the installed major. AI subscriptions in chat products do not supply this app's API quota.

### Request boundaries

Browser uses Supabase directly for authentication only. Application data flows through Express. Express verifies the access token and runs ordinary data requests using a request-scoped Supabase client carrying that token, so RLS still applies. A separate server-only privileged client is restricted to trusted job/admin operations with explicit ownership/assignment checks. Never use its bypass access as a replacement for authorization.

Express serves REST endpoints; Socket.IO is unnecessary for turn-based v1. A Postgres-backed job queue supports long evaluation work without holding HTTP requests open. Run a lightweight poller in the same Node process for the demo. Free-host sleep can delay jobs; on wake, resume expired leases. Do not rely on in-memory job state surviving a restart.

## 10. AI, fallback, and zero-cost operation

**Provider choices are provisional, not benchmarks.** Start by evaluating Groq `openai/gpt-oss-120b` against a reviewed set; configure a currently free-eligible Gemini Flash model as backup. Verify model availability and account quotas before integration and again before judging. Model IDs must be environment settings, never spread through UI components.

Groq's published free table currently lists the proposed model at 30 RPM, 1,000 RPD, 8,000 TPM, and 200,000 TPD, with account-specific limits authoritative [S7]. Gemini's eligible free models and project quotas vary [S8]. A token limit can be reached long before the request limit. Neither provider is an unlimited service. Free-tier Gemini content may be used for product improvement; demo profiles should be fictional [S8].

### Normal request budget

Base question selection: zero AI requests. Up to two follow-up enhancements per session. End-of-session scoring: one compact request where it fits measured token limits; split into small jobs only when necessary. Include both candidate and question criteria in a schema-validated response if feasible. A retry or question-lab assessment costs an additional bounded request. Each operation may have one secondary-provider attempt, so three primary requests is a target, not a guaranteed total.

Limit answers to 2,000 characters and custom questions to 1,000 characters. Validate limits server-side. Limit AI output length. Reference answers and rubrics are compact. Send only the context required for the operation, not every profile field or every prior transcript.

### Failure policy

1. Persist the answer or assessment request before scheduling AI work.
2. Primary request gets a bounded timeout (start with 8 seconds for a live follow-up, 25 seconds for background evaluation; tune after measurement).
3. On provider timeout, 429, 5xx, or invalid schema/evidence, attempt the secondary provider once within the operation budget.
4. Respect `Retry-After`; open a cooldown circuit for unavailable providers. Daily quota exhaustion keeps that provider disabled until its reset/configured retry time. No key/account rotation to evade limits.
5. If enhancement fails, serve an approved bank prompt. If evaluation fails, preserve answers and mark semantic criteria pending for human review or explicit bounded re-evaluation.
6. Show degraded behavior honestly. Rules-based relevance indicators are not AI reasoning scores.

Before committing any job result, recheck that its parent still exists and that its expected report revision is current. Deleted/cancelled parents must not be recreated by a late response. Persist evaluation jobs with `queued/running/succeeded/needs_review/failed`, attempt count, lease expiry, provider/model, rubric/prompt versions, input hash, and coarse error code. Claim jobs atomically. Use a unique operation key to prevent duplicate billing/processing on repeated requests. Permit one explicit re-evaluation job after cooldown; never run infinite retries. Results are versioned, and released reports require a new draft revision to change.

### Avoiding accidental spend

- Use free plans; do not enable paid fallback or attach an auto-upgrade dependency.
- Add application caps: initially one active session per candidate, three sessions/day per candidate, and a small admin-configurable global AI allowance below account limits.
- Store session counters in Postgres so restarting Node does not reset quotas. Back off before token ceilings.
- Reuse saved reports; no AI on page load or refresh. Deduplicate only identical authorized inputs using user/session IDs, input hash, and rubric version.
- Use synthetic text data, no video uploads, and no paid domain. Supabase free database allowance is currently 500 MB [S9]; monitor size.
- Supabase free projects may pause after low activity; inspect/restore through the dashboard before the demo. Render free API services sleep after 15 minutes without inbound traffic [S9–S10]. Verify services shortly before presentation, rather than trying to defeat plan limits with artificial traffic.
- Keep a local frontend/API demo command and a clearly labeled seeded demonstration dataset. Cloud database failure is a different failure from LLM failure; bank fallback alone does not make the app fully offline.

## 11. Data model and content requirements

All IDs are UUIDs, timestamps UTC, ownership foreign keys explicit. API timestamps use ISO 8601. Show dates in the browser's local timezone. Store long-lived content versions so question edits do not change past evaluations.

| Table | Important fields / relationships |
| --- | --- |
| `profiles` | `user_id`, display name, domain, level, target role; no writable privileged role field |
| `user_roles` | `user_id`, approved role; admin-managed |
| `role_templates` | Domain, supported level, required topics, stage plan, version |
| `questions` | Stable content identity, status, current published version |
| `question_versions` | Question ID, version, prompt, domain, topics, level, difficulty, stage, panel role, rubric ID, author/reviewer |
| `question_keys` | Private expected points, criterion anchors, reference answers; never selected into active candidate DTOs |
| `rubric_versions` | Kind, criterion IDs, weights, anchors, version |
| `scenario_versions` | Base question, changed constraint, linked follow-ups, rubric/version |
| `sessions` | Candidate, role snapshot, level, status, current turn, version counter, started/completed times |
| `session_turns` | Session, order, question snapshot, source, stage, panel role, scenario/parent turn; unique session+order |
| `answers` | Turn, text nullable, response state (`submitted`/`skipped`), submitted time, idempotency key; one final answer per turn |
| `evaluation_jobs` | Operation key, session/answer, state, attempt count, lease, error, provider configuration |
| `evaluations` | Answer/question, criterion, rating nullable, rationale, evidence offsets, source, versions, report revision |
| `report_revisions` | Session, revision, status, released_by, released_at, computed coverage and summary |
| `review_overrides` | Evaluation, old/new rating, reason, actor, timestamp; append-only |
| `review_assignments` | Session, evaluator; unique pair |
| `retry_attempts` | Candidate, source answer, variant snapshot, answer, evaluation job; unique source answer for v1 |
| `question_assessments` | Expert owner, context, proposed question, draft rewrite, evaluation status |
| `usage_counters` | User/provider/day, requests/tokens/reservations; atomic updates |

**RLS:** Candidates access their own application rows; assigned evaluators access scoped review data; admins have explicit administrative policies. Private answer keys remain unavailable to candidates until an authorized post-completion report response selects permitted reference content. Nested rows inherit authorization through checked joins. Add indexes on ownership, assignment, session/turn, job status/lease, and question selection fields.

### Seed content gate

Prepare 40–60 reviewed base questions across APIs, databases, concurrency, reliability, and project trade-offs; cover both supported levels, all stages, at least six constraint scenarios, and enough comparable variants for the demo retry topics. Every scored question needs anchors and expected concepts. Another team member reviews the content; AI-generated seed text is only a draft. Include diverse valid solutions and common misconceptions. Label intentional off-topic/ambiguous question examples as expert-training fixtures, not approved candidate bank items.

## 12. API contracts for independent frontend work

Version prefix: `/api/v1`. All protected requests use `Authorization: Bearer <Supabase access token>`. Validate with Zod and share schemas through `packages/contracts`. Maintain an OpenAPI document alongside the schemas. Pagination defaults to 20 and caps at 50.

| Method / path | Purpose | Authorization |
| --- | --- | --- |
| `GET /health` | Liveness only; no secrets | Public |
| `GET /me`, `PATCH /me` | Own profile and granted roles | Signed-in user |
| `GET /catalog` | Supported roles, levels, topic options | Signed-in user |
| `POST /sessions` | Persist plan; return ID/current state | Candidate |
| `GET /sessions` | Own paginated history | Candidate |
| `GET /sessions/:id` | Authorized session and safe current-turn DTO | Owner/assigned evaluator |
| `POST /sessions/:id/answers` | Save final answer; start bounded next-turn preparation | Owner, active current turn |
| `POST /sessions/:id/skip` | Confirm omission for current turn; persist skipped state atomically | Owner; same version/idempotency checks as answers |
| `POST /sessions/:id/advance` | Idempotently finalize next turn after a saved answer | Owner; never skips unsaved turn |
| `POST /sessions/:id/complete` | Freeze transcript; enqueue scoring | Owner; all planned turns submitted/skipped explicitly |
| `GET /jobs/:id` | Read authorized operation status | Job owner/assigned evaluator |
| `GET /sessions/:id/report` | Stored draft/released report and coverage | Owner/assigned evaluator |
| `GET /sessions/:id/replay` | Immutable completed transcript | Owner/assigned evaluator |
| `POST /sessions/:id/reevaluate` | Bounded new draft evaluation after cooldown | Owner/assigned evaluator; no overwrite |
| `DELETE /sessions/:id` | Delete own session and dependent practice data | Owner; cancel jobs and delete atomically |
| `POST /answers/:id/retries` | Create one linked practice attempt | Answer owner; completed session |
| `GET /retries/:id`, `POST /retries/:id/answer` | Read/submit retry | Retry owner |
| `GET /review-assignments` | Assigned review queue | Evaluator |
| `POST /evaluations/:id/overrides` | Add correction with reason and revision check | Assigned evaluator/admin |
| `POST /sessions/:id/release` | Release fully reviewed report revision | Assigned evaluator/admin |
| `POST /question-assessments` | Assess custom question; may return job | Evaluator/admin |
| `GET /question-assessments/:id` | Assessment and optional rewrite | Assessment owner/admin |
| `POST /question-assessments/:id/draft` | Save selected rewrite/original as bank draft | Evaluator/admin |
| `GET/POST /admin/questions` | List bank/create draft | Admin |
| `PATCH /admin/questions/:id` | Edit unpublished version | Admin |
| `POST /admin/questions/:id/publish` | Validate and publish a new version | Admin |
| `POST /admin/questions/:id/archive` | Remove from future selection | Admin |
| `POST /admin/assignments` | Assign approved evaluator | Admin |

Successful JSON is `{ "data": ... , "requestId": "..." }`; errors are `{ "error": { "code": "...", "message": "...", "retryable": false }, "requestId": "..." }`. Use 400 validation, 401 authentication, 403 authorization, 404 absent/inaccessible resource where appropriate, 409 stale state, 429 app quota, 503 temporary infrastructure failure. Never forward raw provider errors or secrets to browsers.

### Example: save an answer

```json
{
  "turnId": "<current-turn-uuid>",
  "answerText": "I would use an idempotency key...",
  "expectedSessionVersion": 4
}
```

Send `Idempotency-Key: <client-generated-uuid>`; reuse that same key for retries of the same submission. The backend atomically checks owner, session version and current turn, persists the answer, increments version, and returns the saved answer ID and next action. An already-used key with a different body returns 409. If next-turn preparation is pending, return 202 with saved answer ID/job ID; the frontend must show that the answer is saved while it waits. `advance` or resume reads the stored operation and never re-asks the previous turn. A stale browser refetches after 409.

### Shared DTO boundary

```ts
type EvaluationStatus = 'queued' | 'running' | 'needs_review' | 'completed';
type Evidence = { answerId: string; start: number; end: number; quote: string };
type CriterionResult = {
  criterionId: string;
  rating: number | null; // 0–4; null means unavailable, never zero by default
  source: 'ai' | 'human' | 'answer_key' | 'metadata_rule';
  rationale: string;
  evidence: Evidence[];
  missingPoints: string[];
};
type SessionTurn = {
  id: string; order: number; stage: string;
  panelRole: 'technical' | 'project' | 'chair';
  prompt: string;
  source: 'question_bank' | 'ai_followup' | 'stored_followup';
  constraint: { originalPrompt: string; change: string } | null;
};
```

Use runtime schemas to enforce finite rating values and valid offsets. Keep internal job states separate from the simplified frontend evaluation status. Active-turn DTOs exclude model answers, hidden rubric keys, and provider prompts. Never render model Markdown as unsanitized HTML.

## 13. Repository and folder structure

Use one GitHub repository. Paths below are a proposed structure to create; this PRD does not create the application scaffold.

| Path | Purpose / owner |
| --- | --- |
| `apps/web/src/app/` | Router, providers, app shell; Dev 1 |
| `apps/web/src/features/auth/` | Auth/onboarding/settings; Dev 1 |
| `apps/web/src/features/dashboard/` | Candidate dashboard; Dev 1 |
| `apps/web/src/features/interview/` | Setup, boardroom, challenge, composer; Dev 2 |
| `apps/web/src/features/reports/` | Scorecard/evidence/review components; Dev 3 |
| `apps/web/src/features/replay/` | Replay and retry; Dev 3 |
| `apps/web/src/features/expert/` | Review queue/question lab; Dev 3 |
| `apps/web/src/features/admin/` | Bank/assignment screens; Dev 1 |
| `apps/web/src/components/ui/` | Shared primitives; Dev 1 |
| `apps/web/src/lib/` | API/auth/query clients; Dev 1 + Dev 4 contract review |
| `apps/web/src/styles/tokens.css` | Global visual tokens; Dev 1 |
| `apps/web/src/mocks/` | MSW handlers and named states; all FE owners |
| `apps/web/public/` | Local icons/fonts, only licensed assets |
| `apps/api/src/app.ts`, `server.ts` | Express composition / process entry; Dev 4 |
| `apps/api/src/modules/` | `profiles/`, `sessions/`, `reviews/`, `retries/`, `questions/`; Dev 4 |
| `apps/api/src/services/ai/` | Provider adapters, validators, prompts, circuit policy; Dev 4 |
| `apps/api/src/services/selection/` | Deterministic question selection; Dev 4 |
| `apps/api/src/jobs/` | Atomic job claims, leases, evaluation runner; Dev 4 |
| `apps/api/src/middleware/` | Auth, role/assignment checks, limits, errors; Dev 4 |
| `apps/api/src/db/` | Request-scoped/privileged clients and repository functions; Dev 4 |
| `packages/contracts/src/` | Zod schemas, DTOs, enums; Dev 4 owns change approval |
| `packages/fixtures/src/` | Synthetic shared test/demo fixtures; all |
| `supabase/migrations/` | Ordered SQL, RLS, constraints, transactional functions; Dev 4 |
| `supabase/seed.sql` | Reproducible approved demo content; Dev 4 + content reviewers |
| `tests/e2e/` | Critical journeys and failure cases; Dev 2/Dev 3 |
| `docs/prd.md`, `docs/openapi.yaml` | This specification and API contract |
| `docs/demo-runbook.md`, `docs/decisions.md` | Rehearsal and small architecture decisions |
| `.github/workflows/ci.yml` | Quality checks; Dev 4 sets up, all maintain |
| `.github/PULL_REQUEST_TEMPLATE.md`, `.github/CODEOWNERS` | Review conventions and ownership |
| `.env.example`, `.gitignore`, `.nvmrc`, `package.json`, `package-lock.json` | Reproducible root setup |

Each feature folder can contain `pages/`, `components/`, `hooks/`, `api.ts`, and colocated tests. Avoid a single huge `App.tsx`. UI imports shared contracts, never backend internals. Give workspace packages explicit names such as `@paneliq/web`, `@paneliq/api`, `@paneliq/contracts`.

### Required root scripts

`npm run dev` starts web/API together; `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, and `npm run test:e2e` must be implemented before the workflow below is enabled. Build contracts before consumers. `test:unit` is non-watch and fails on test failure. Playwright config starts web/API with mock AI and synthetic fixtures; it requires no production secrets. `npm run seed:demo` must require a clearly identified development/demo database and refuse production targets by default.

## 14. Work split and integration responsibilities

| Person | Primary deliverables | Secondary responsibility |
| --- | --- | --- |
| Dev 1 — Platform and design | Design tokens, primitives, app shell, auth, onboarding, dashboard, settings, admin screens | Visual consistency, responsive QA, seed-content review |
| Dev 2 — Interview experience | Setup/preflight, panel room, answer save/resume, constraint feature | Critical session E2E tests, flaky-network handling |
| Dev 3 — Insights and expert workflows | Scorecards, evidence, replay/retry, reviewer queue, question lab | Rubric presentation, review/retry E2E tests |
| Dev 4 — You | Schema/RLS, auth enforcement, contracts, session state machine, selection, provider adapters, evaluation jobs, deployment/CI | API docs, integration support, security and cost boundaries |

Dev 3 has the largest number of screens. Reuse the same transcript/scorecard for candidate and expert views, and reuse Dev 2's composer for retry. Dev 1 should take table/form polish from Dev 3 once the shared shell is stable. Do not split the same route between multiple people without agreeing component boundaries.

Daily coordination: 15-minute check-in; every developer reports one working route, next dependency, and blocker. Agree contract changes in the issue/PR before editing clients. Each feature owner supplies screenshots for desktop/mobile and evidence of empty/error states. The backend developer should not become responsible for manually wiring every frontend fetch.

### 14.1 Four-developer ownership agreement

**Dev 1, Dev 2, and Dev 3 are frontend developers. Dev 4 is you, the backend developer.** Each frontend owner implements their own API integration, page states, responsive styling, and frontend tests. Dev 4 provides the backend contracts and working endpoints for all five features. A frontend owner is not responsible for writing server logic just because their feature uses it.

The detailed requirements in Sections 1–13 and 15–23 remain applicable. The checklists below divide implementation responsibility; they do not replace or reduce those requirements. Every ticket has one primary owner. “Support” means reviewing or supplying a component, not independently rebuilding the same page.

| Workstream | Frontend owner | Backend owner | Reuse / handoff |
| --- | --- | --- | --- |
| Platform, login, dashboard, admin screens | Dev 1 | Dev 4 | Shared shell/components used by Dev 2 and Dev 3 |
| F1 Adaptive AI Boardroom | Dev 2 | Dev 4 | Dev 1 supplies auth/client; Dev 3 supplies report destination |
| F2 Interviewer Quality Radar | Dev 3 | Dev 4 | Dev 1's admin editor receives saved question drafts |
| F3 Evidence-Linked Scorecard | Dev 3 | Dev 4 | Evidence links use persisted turn IDs from Dev 2's flow |
| F4 Change One Constraint | Dev 2 | Dev 4 | Dev 3 displays its results using the shared report contract |
| F5 Replay + Targeted Retry | Dev 3 | Dev 4 | Reuses Dev 2's answer composer and Dev 3's score components |

### 14.2 Dev 1 — Frontend platform, design system, auth and administration

**Your outcome:** Other frontend developers can build inside one consistent, authenticated app; candidates can enter the product and admins can manage its content.

**Owned routes:** `/`, `/auth`, `/auth/callback`, `/auth/reset`, `/onboarding`, `/app`, `/app/settings`, `/admin/questions`, `/admin/assignments`, and the catch-all route.

**Build in this order:**

- [ ] **D1-01 — Design foundation:** Implement Section 8 tokens, typography, buttons, fields, dialogs, tabs, tables, badges, skeletons, empty/error states and toast behavior. Publish a small development-only component preview for teammates.
- [ ] **D1-02 — App shell:** Implement sidebar, top bar, responsive navigation, route registration, role-aware navigation, and loading/forbidden/404 pages. Integrate exported page components from Dev 2/3 without taking over their feature files.
- [ ] **D1-03 — Shared browser clients:** Configure Supabase Auth, the API client, TanStack Query provider and common error handling. Coordinate request/response types with Dev 4. Export one authenticated request helper for both other frontend developers.
- [ ] **D1-04 — Auth and onboarding:** Connect login/signup/reset/callback, profile form, supported domain/level selection, confirmation and expired-link states. Route guards must read granted roles, never create them.
- [ ] **D1-05 — Candidate dashboard/settings:** Display actual session history, resume links, empty state, pending reports and profile editing. Implement delete-own-session confirmation and sign-out draft cleanup.
- [ ] **D1-06 — Admin question bank:** Implement draft creation/editing, tag filters, rubric fields, publish/archive actions, validation and version information. Use Dev 4's APIs; no browser-side privileged database operations.
- [ ] **D1-07 — Admin assignments:** Connect session selection and approved evaluator assignment; display existing/duplicate assignment states.
- [ ] **D1-08 — Landing and consistency pass:** Build the marketing entry page, label sample data, and review shared styling/accessibility across routes. Submit changes to Dev 2/3's screens through their review rather than editing concurrently.

**Backend handoff needed:** Auth setup/redirect values, `/me`, `/catalog`, `/sessions` history, deletion, admin question/version operations and assignments. Start with approved contract fixtures until each endpoint is ready.

**Deliver to teammates:** Shared components with typed props; token file; app-shell route convention; API helper; documented auth loading/expired states. Shared shell and API helper are an early handoff, not a final-week task.

**Dev 1 done when:** All owned routes call real services, role-aware navigation works, auth errors are understandable, admin actions require real permission, and the common components pass the responsive/keyboard checks.

### 14.3 Dev 2 — Frontend interview room and constraint challenges

**Your outcome:** A candidate can start, complete, interrupt and resume an interview without losing a submitted answer.

**Owned routes:** `/app/interviews/new` and `/app/interviews/:id`. Own all live-session UI for F1 and F4, including the transition to Dev 3's report page.

**Build in this order:**

- [ ] **D2-01 — Session setup:** Build role/level/topic selection, session explanation and preflight. Connect `/catalog` and session creation. Validate using shared schemas.
- [ ] **D2-02 — Boardroom layout:** Build panel cards, active speaker, stage rail, question card, turn count and elapsed timer using Dev 1's tokens/components.
- [ ] **D2-03 — Reusable answer composer:** Implement controlled input, character limit, submit/disabled/error states and keyboard behavior. Export the stable component for Dev 3's retry workflow early.
- [ ] **D2-04 — Save and advance:** Connect submission, idempotency key reuse, saved-answer acknowledgement, next-turn job polling and advance. Show “saved” only after the server confirms it.
- [ ] **D2-05 — Recovery:** Implement current-turn draft recovery, reconnect state, refresh/resume, 409 stale-tab refetch, repeated-click protection and exit/resume guidance.
- [ ] **D2-06 — Constraint experience:** Show the original scenario, changed constraint and prior answer without mixing their answer IDs. Support stored prompts and AI-enhanced follow-ups through the same UI contract.
- [ ] **D2-07 — Skip and complete:** Add explicit skip confirmation and completion flow, handle pending evaluation, and navigate to the saved report ID/session route.
- [ ] **D2-08 — Session checks:** Own Playwright coverage for start → answer → challenge → complete, refresh/resume and flaky network UI. Coordinate forced-provider-failure fixtures with Dev 4.

**Backend handoff needed:** Session/create/read, answer/skip/advance/complete, job status, expected session version, stable turn IDs and prepared-question status. The frontend must never decide that a provider failure justifies fabricating the next question.

**Deliver to Dev 3:** `AnswerComposer` and its prop contract; link conventions for report/replay; fixtures for a normal turn, constraint turn, saved answer and pending next turn. Dev 3 owns the retry page around your composer.

**Dev 2 done when:** All F1/F4 acceptance criteria pass against the real API; a duplicated submission is harmless; a resumed interview shows the correct turn; mobile participation remains usable.

### 14.4 Dev 3 — Frontend assessments, expert tools, replay and retry

**Your outcome:** Candidates and assigned evaluators can understand the results, inspect evidence, review question quality and complete a targeted retry.

**Owned routes:** `/app/interviews/:id/report`, `/app/interviews/:id/replay`, `/app/retries/:id`, `/expert`, `/expert/sessions/:id`, and `/expert/question-lab`.

**Build in this order:**

- [ ] **D3-01 — Result primitives:** Implement score bars, rubric table, status/coverage display, evidence drawer, transcript turn and comparison card from completed/pending fixtures.
- [ ] **D3-02 — Candidate scorecard:** Connect report fetch and bounded job polling; separate candidate scores from question-quality results. Preserve nullable ratings and draft/provisional/reviewed labels.
- [ ] **D3-03 — Evidence navigation:** Link each excerpt to its exact replay turn; display missing points and provider-independent source labels. Never recompute official scores in frontend code.
- [ ] **D3-04 — Expert review:** Build assigned-session queue, review view, correction form with required reason, history and release action. Reuse the candidate scorecard with explicit review controls rather than making a second implementation.
- [ ] **D3-05 — Question quality and lab:** Build relevance/clarity/coverage views, custom-question form, pending assessment, original/rewrite comparison and save-draft action. Saved drafts open in Dev 1's admin workflow for publication.
- [ ] **D3-06 — Replay:** Implement immutable text timeline, filters, evidence deep links and eligible retry actions.
- [ ] **D3-07 — Retry:** Reuse Dev 2's composer; connect creation/submission and evaluation status. Compare the same rubric version; show a non-numeric comparison when versions differ.
- [ ] **D3-08 — Assessment checks:** Own frontend/E2E tests for pending versus zero, evidence navigation, review correction/release, retry ownership errors and original-report immutability as visible through the UI.

**Backend handoff needed:** Reports/replay, review assignments, overrides/release, question assessments/draft creation, retries and job states. Dev 4 owns scoring arithmetic, evidence validation, persistence and permission enforcement.

**Deliver to teammates:** Export reusable result/coverage components, document report/replay URL conventions and provide fixtures that expose incomplete assessment honestly. Agree integration with Dev 2 before building the retry composer.

**Dev 3 done when:** All F2/F3/F5 acceptance criteria pass with real persisted data, candidate and expert views share components safely, pending scores are never displayed as zero, and the retry leaves the original unchanged.

### 14.5 Dev 4 — You: backend, data, AI, reliability and release infrastructure

**Your outcome:** All three frontend developers have predictable APIs, durable data and a working interview/evaluation engine within the free-tier budget.

**Owned paths:** `apps/api/`, `packages/contracts/`, `supabase/`, `docs/openapi.yaml`, workflow configuration, server environment/deployment configuration and root workspace tooling. Review shared-client contracts with Dev 1; each frontend developer still integrates their own pages.

**Build in this order:**

- [ ] **D4-01 — Backend foundation:** Set up workspaces, runtime, scripts, Express, validation, common error format, CI and placeholder environment files. Coordinate web bootstrap with Dev 1 to avoid competing root edits.
- [ ] **D4-02 — Freeze initial contracts:** Publish shared schemas, endpoint examples, state enums, idempotency/version rules and safe DTOs before complex frontend work. Provide synthetic fixtures or validate the frontend owners' fixtures against these schemas.
- [ ] **D4-03 — Auth and data security:** Implement Supabase schema/migrations, verified access tokens, request-scoped clients, roles, assignment checks, RLS and private question keys. Provision demo accounts through trusted operations.
- [ ] **D4-04 — Platform APIs:** Deliver `/me`, `/catalog`, session history and the admin content/assignment APIs needed by Dev 1, staging these alongside session work.
- [ ] **D4-05 — Bank-only interview engine:** Implement selection, plan snapshots, question coverage, session state, transactional answer save, skip/advance/complete, idempotency and resume. Make this work before adding LLMs.
- [ ] **D4-06 — Stored constraint scenarios:** Persist linked prompts/answers and scenario rubrics for Dev 2. Expose no answer keys during active sessions.
- [ ] **D4-07 — Reports and expert workflow:** Implement scoring/coverage rules, evaluations, evidence offsets, report revisions, reviewer overrides/release and custom-question metadata assessment.
- [ ] **D4-08 — AI adapters and jobs:** Implement Groq/Gemini adapters, bounded timeouts, validation, quotas, cooldowns, job leases and fallback. Attach these to the existing bank/report paths; both-provider failure means prepared questions or pending semantic review.
- [ ] **D4-09 — Replay and retry persistence:** Expose immutable transcript, child retry attempt, same-rubric evaluation and comparison data. Implement ownership and one-retry constraints.
- [ ] **D4-10 — Integrity and operational tests:** Test authorization/RLS, duplicate/stale submissions, score calculation, evidence rejection, expired job leases and late job results after deletion. Give frontend owners reproducible error fixtures.
- [ ] **D4-11 — Deployment and release:** Configure free demo infrastructure, secrets, migrations, seed data, CI quality gates, quota settings and rollback/runbook. Dev 1 supplies frontend build details; Dev 2/3 supply smoke-test evidence.

**You supply, frontend consumes:** Verified identity/roles, selected prompts, session transitions, official scores, evidence/source metadata, report state, job state and access decisions. Frontend developers never need your service-role key or provider keys.

**Dev 4 done when:** The real integration journey and backend gates pass; API failures produce documented responses; AI quotas cannot create uncontrolled retry loops; the release can be reproduced from its commit and setup instructions.

### 14.6 Handoff sequence — avoid waiting on each other

| Handoff | Supplier | Receiver | Concrete deliverable / completion check |
| --- | --- | --- | --- |
| Shared design/auth shell | Dev 1 | Dev 2 + Dev 3 | Importable primitives, providers, tokens and sample route |
| API contract baseline | Dev 4 | Dev 1 + Dev 2 + Dev 3 | Schemas, example payloads, error states and endpoint status list |
| Mock feature development | Each frontend owner | Same owner + Dev 4 reviewer | Contract-valid fixtures and all required screen states |
| Bank-only session | Dev 4 + Dev 2 | Dev 1 + Dev 3 | Real session ID, completed transcript and resume behavior |
| Composer | Dev 2 | Dev 3 | Stable typed export plus usage example; no page-specific fetches |
| Assessment data | Dev 4 | Dev 3 | Pending and completed reports with real turn/evidence IDs |
| Question draft | Dev 3 + Dev 4 | Dev 1 | Saved draft ID visible in the admin bank |
| Completed retry | Dev 3 + Dev 4 | Dev 1 | Stored attempt visible through agreed dashboard/history behavior where supported |
| Release candidate | Dev 4 coordinates | All four | Green checks, deployed endpoints, each route owner signs off |

Maintain one endpoint readiness table in `docs/openapi.yaml` companion notes: `contract ready`, `mock ready`, `backend ready`, `UI integrated`, `verified`, with an owner and blocking issue. “Backend ready” requires a working response plus documented authorization/error behavior. “UI integrated” requires a real request, not an MSW screenshot.

### 14.7 Shared-file and merge rules

| Shared area | Primary editor | Other developers' action |
| --- | --- | --- |
| Global tokens, primitives, app router/providers | Dev 1 | Request change or submit small reviewed PR; feature owners export their pages |
| API schemas, enums, OpenAPI, migrations | Dev 4 | Propose required fields in issue/PR; do not invent incompatible response shapes |
| Root package/lockfile, CI, environment examples | Dev 4 | Coordinate dependency additions before editing; Dev 1 reviews web changes |
| Interview composer/components | Dev 2 | Dev 3 requests prop additions; import instead of copying |
| Report/evidence/replay components | Dev 3 | Dev 1/2 import; request changes through Dev 3 |
| Feature mocks and tests | Respective feature owner | Keep files partitioned by feature; Dev 4 reviews contract assumptions |

One primary editor is a coordination rule, not a ban on contributions. Changes outside your owned paths require the owning developer's review. Shared contract changes must update affected schemas, mocks and consumers in the same coordinated PR sequence. No silent API renaming. No duplicate auth clients, independent CSS themes, copied composers or copied score calculations.

When a task crosses frontend/backend, split it into linked tickets: for example `D2-04 UI answer submission` and `D4-05 transactional answer API`. Each owner completes their part, then they verify the actual journey together. A blocked developer moves to their next mock-ready task instead of implementing a second backend or guessing a contract.

### 14.8 Review ownership and optional work

Dev 1 reviews shared visual consistency; Dev 2 reviews session/composer behavior; Dev 3 reviews report/replay semantics; Dev 4 reviews contracts, server security and data integrity. Another teammate reviews Dev 4's PRs using the documented examples/test evidence; Dev 4 is not their own sole reviewer. Each frontend developer owns the frontend tests for their routes, while Dev 4 owns backend and database tests.

After all five features pass M5: **X1 suggestions UI belongs to Dev 3**, with reusable cards/styles from Dev 1 and mappings/API from Dev 4. **X2 calibration UI belongs to Dev 3**, with independence/persistence rules from Dev 4. These do not start automatically; first confirm remaining team capacity. Dev 2 can take a specifically assigned UI subtask after their session checks pass, recorded in the issue so two developers do not edit the same component at once.

## 15. Git and GitHub workflow

1. Create a single repository and commit the agreed scaffold/contracts/fixtures first. Do not commit keys or real candidate data. Make repository visibility a team decision compatible with hackathon rules.
2. Keep `main` runnable. Use short branches: `feat/auth-shell`, `feat/boardroom`, `feat/evidence-report`, `feat/session-api`, `fix/resume-conflict`.
3. Every task is a GitHub issue with owner, route/endpoint, acceptance criteria and dependencies. Board columns: Backlog, Ready, In progress, Review, Done. Keep one primary in-progress feature per developer.
4. Open small PRs early. Include reason, behavior, screenshots if UI, test evidence, contract/migration changes and limitations. Ask one teammate to review; backend/RLS/contract changes require Dev 4 review.
5. Configure `main` protection where the repository plan permits: PR required, one approval, passing `quality` check, resolved conversations, no force push. If unavailable, enforce the same team workflow manually.
6. Update your branch from `main` daily. Resolve conflicts locally, rerun affected checks, squash merge. Never force-push shared `main`.
7. One dependency update per PR; the person adding it owns the lockfile conflict. Never “fix” conflicts by deleting the lockfile and accepting arbitrary upgrades.
8. SQL changes are new migrations; never rewrite a migration already shared/applied. Include rollout/backward-compatibility notes. Prefer additive schema changes before changing clients.
9. Tag a rehearsed release `v0.1.0-demo`. Record that commit and keep it runnable as fallback.

CODEOWNERS should map feature paths to real GitHub handles when the repo is created. Do not commit invented handles. Protect `packages/contracts/`, migrations, workflows and `.env.example` with explicit review ownership.

### GitHub Actions starter workflow

This is a template for `.github/workflows/ci.yml`, not an already executed workflow. It assumes the root scripts and package-lock described above exist. Resolve action major tags to reviewed commit SHAs when creating the repository; periodically update intentionally.

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: '.nvmrc'
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:unit
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
        env:
          CI: 'true'
          AI_MODE: mock
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 3
          if-no-files-found: ignore
```

Use standard hosted Linux runners. Public-repository standard-runner Actions are free; private repositories have plan allowances, so check usage, cancel superseded runs, keep artifacts short-lived, and do not enable paid overage [S11]. Never use `pull_request_target` to run untrusted PR code with secrets. Mock-AI CI must never call paid or free live LLM APIs.

Database/RLS checks require a separate documented integration command against local Supabase or an isolated demo database. Run on migration/auth changes; do not claim mock E2E proves RLS. A workflow must not apply production migrations automatically.

## 16. Environment, deployment and operations

| Variable | Location | Rule |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Web | Public API URL |
| `VITE_SUPABASE_URL` | Web | Public project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Web | Public client key; safety depends on correct access controls |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | API | Request-scoped data client configuration |
| `SUPABASE_SERVICE_ROLE_KEY` | API only | Privileged secret; never `VITE_` or browser bundled |
| `GROQ_API_KEY`, `GEMINI_API_KEY` | API only | Secret free-tier API credentials |
| `GROQ_MODEL`, `GEMINI_MODEL` | API | Verified model identifiers |
| `AI_MODE` | API | `live`, `bank_only`, or `mock`; mock forbidden in real production config |
| `ALLOWED_ORIGINS`, `PORT`, `NODE_ENV` | API | Explicit origins and host port |
| `AI_DAILY_REQUEST_CAP`, `SESSION_DAILY_CAP` | API | Validated server-side limits |

Commit placeholder `.env.example`, ignore real `.env*` except examples. GitHub Actions needs no live provider secrets for standard checks. Store deployment secrets in the hosting dashboard; rotate immediately if exposed. Configure Supabase redirect URLs for localhost and the deployed domain. CORS is an allowlist, not an authentication mechanism.

Deployment sequence: create free demo services → apply migrations deliberately → seed synthetic content → provision approved demo accounts → configure auth redirects and secrets → build/deploy API → build/deploy web → smoke-test candidate and evaluator journeys. Configure SPA fallback for nested routes. Keep automatic production deployment disabled unless it waits for successful CI; for this team, manual deploy of a green `main` commit is simplest.

Rollback: redeploy the last known good commit. Prefer forward-fix/additive migration recovery; never blindly roll back a schema migration after new data has been written. Document exact commands in the repository runbook during setup. No cloud resource is created by this PRD.

Operational logs include request IDs, endpoint, latency, coarse error, job state and provider usage—not access tokens, full answers, private rubrics, or API keys. Show admin diagnostics for exhausted quotas and stuck jobs. A health route must not reveal credentials. Keep synthetic demo fixture backups in Git; real user data must not enter fixtures.

## 17. Quality, security and validation gates

### Nonfunctional targets (to measure, not claims)

- Normal warm API reads/writes excluding AI: target p95 below 1 second during the small demo load.
- Answer persistence: target acknowledgement within 2 seconds on a warm service; separately measure cold start.
- Report processing must show progress/pending immediately; no infinite spinner.
- Ten simultaneous synthetic sessions should not corrupt turn order, assignments, or job ownership. This is a prototype load target, not an enterprise capacity claim.
- Critical routes work at 360, 768, and 1440 px, with keyboard-only interaction.
- No uncaught frontend error during the rehearsed journey; clear retry paths for recoverable failures.

### Required meaningful tests

| Area | Test |
| --- | --- |
| Selection | Correct domain/level/stage; no repeat; defined behavior when bank coverage is insufficient |
| Authorization | Candidate A cannot access candidate B; evaluator without assignment is denied; candidates cannot publish questions or grant roles |
| Answer save | Double click, replayed idempotency key, stale tab and restart produce no duplicate/lost final answer |
| Fallback | Primary timeout, primary 429, malformed output, secondary failure; bank prompt continues |
| Evidence/scoring | Fabricated quote rejected; null not zero; weights normalize; scores and coverage match fixtures |
| Jobs | Atomic claims, expired lease recovery, retry cap, deletion during evaluation, no overwrite of released revision |
| Replay/retry | Original immutable; unauthorized retry denied; same rubric required for numeric comparison |
| UI | Keyboard submit, dialog focus, loading/empty/pending/error, mobile layout |
| Integration | Complete session → evaluation → expert correction → release → replay → retry |

Treat candidate answers and custom questions as untrusted content. Model instructions must not grant tools, database writes, role changes, or secret access. A prompt-injection answer cannot override the scoring schema or source rubric. Validate all model outputs; model text never directly executes SQL or commands.

### Pilot usefulness check

Ask five student candidates and two peer evaluators to run synthetic practice sessions. Record task completion, question relevance complaints, rubric/evidence disagreements, and whether retry feedback is actionable. Have two reviewers independently assess a small set of answers; report disagreements rather than hiding them. This is an exploratory pilot, not statistical proof of fairness or superiority. Test deliberately wrong answers and valid alternative solutions.

### Definition of done for each feature

Real endpoint integrated; role/ownership enforced; typed contract matches mocks; happy/error/pending states implemented; meaningful tests pass; desktop/mobile reviewed; no secrets; documentation updated; fixture data clearly marked. A beautiful mocked screen alone is not done.

## 18. Milestone plan

Use these gates in order. Do not add a sixth feature until M5 passes. Estimate calendar duration only after the team confirms its deadline and available hours.

| Gate | Deliverable | Parallel ownership |
| --- | --- | --- |
| M0 — Foundation | Repo, contracts, tokens, role matrix, seed design, CI scripts | Dev 1 shell; Dev 2 interview fixtures; Dev 3 report fixtures; Dev 4 schema/auth |
| M1 — Bank-only vertical slice | Login → setup → saved turns → completed transcript | All integrate one real session before more UI |
| M2 — Boardroom and constraint | F1 + F4 work without AI; resume/idempotency verified | Dev 2 + Dev 4; Dev 1 admin bank; Dev 3 report components |
| M3 — Assessment | F2 question lab + F3 evidence report + human review | Dev 3 + Dev 4; Dev 1 assignments; Dev 2 session QA |
| M4 — Learning loop | F5 replay/retry + controlled AI enhancements | Dev 3 + Dev 4; Dev 2 composer reuse; Dev 1 polish |
| M5 — Release rehearsal | All five, fallback demo, access tests, responsive pass, saved release | Entire team |

If time compresses, reduce supported domains, question count above minimum coverage, chart variety, and animation. Preserve all five thin workflows, answer durability, authorization, and honest scoring states. Do not delete a committed feature silently; record any scope decision in `docs/decisions.md`.

## 19. Demo narrative (about six minutes)

1. Explain the problem: a good interview depends on question quality as well as candidate answers.
2. Start a junior backend session; show the three panel roles and relevant question progression.
3. Show the constraint-change prompt and a meaningful adaptation answer.
4. Open a completed synthetic session's report; expand a criterion to reveal the exact evidence and a missing point.
5. Switch to the assigned evaluator; inspect question relevance, correct a criterion with a reason, and release a revision.
6. Replay an answer and submit its comparable retry. Compare the same rubric honestly.
7. In a controlled demo configuration, disable AI and continue a bank-backed session; show semantic evaluation pending while answers remain saved.

Use a prepared completed session to keep the demo within time, but label it as seeded. Do not present precomputed fixture output as fresh AI output. Keep an ordinary live path ready for judges to try.

## 20. Two optional extensions after all five work

### X1 — Evidence-based learning suggestions

Map a weak rubric criterion to reviewed learning resources and a short practice sequence. Store topic-to-resource mappings in PostgreSQL; no extra LLM is required. The report explains “Suggested because your answer omitted concurrent duplicate handling.” Use a curated resource list with title, URL, topic, and last-reviewed date. Do not invent courses or links. Acceptance: recommendation traceable to a real gap, resource link checked, user can mark completion without claiming skill mastery.

### X2 — Panel calibration lab

Two evaluators independently score the same synthetic answer, then compare criterion disagreements and evidence. Hide each other's first rating until both submit. Show where interpretation differs and let them record a consensus rationale. This extends the expert-training goal and can work entirely without AI. Acceptance: independent scores are preserved; consensus does not erase originals; disagreement is framed as a calibration signal, not proof someone is biased.

These are promising extensions, not claims of globally unique inventions. Prioritize X1 for lower implementation effort; X2 for a stronger expert-training demonstration.

## 21. Initial issue backlog

- [ ] Dev 4: Create workspace scaffold, shared contracts and stable response/error formats.
- [ ] Dev 1: Implement tokens, primitives, app shell, auth and empty dashboard.
- [ ] Dev 2: Build boardroom from contract fixtures including challenge and reconnect states.
- [ ] Dev 3: Build report/replay/reviewer views from pending and completed fixtures.
- [ ] Dev 4: Implement migrations, roles, RLS, question selection and transactional answer submission.
- [ ] Team: Review seed questions, rubrics, constraints and comparable retry variants.
- [ ] All: Integrate bank-only session through completion.
- [ ] Dev 4 + Dev 3: Integrate evaluation jobs, evidence validation and expert review.
- [ ] Dev 4 + Dev 2: Integrate bounded AI follow-up and bank fallback.
- [ ] Dev 3: Complete question lab and retry comparison against real endpoints.
- [ ] Dev 1: Finish admin bank/versioning and evaluator assignment screens.
- [ ] All: Run authorization, fallback, browser and mobile gates; rehearse/tag demo.

## 22. Decisions still to confirm during kickoff

Exact deadline and team working hours; final product name; real GitHub handles; repository visibility/hackathon rules; available free-provider quotas; hosting signup eligibility; whether text-first boardroom satisfies any requirements outside the supplied screenshot; which team member reviews technical question content. These do not block starting the scaffold, contracts, fixtures, and bank-only flow. This PRD is grounded in the supplied PSWB01 page, not unseen pages of the full hackathon document.

## 23. Sources and verification notes

Checked on 26 September 2026. Provider capabilities, quotas, pricing and action versions can change. Official product descriptions establish advertised features, not independently measured quality. No competitor trial or scoring benchmark was performed for this PRD.

- **Problem source:** User-supplied screenshot of PSWB01, “Web based Selector–Applicant Simulation Software.”
- **S1:** Yoodli interview scenarios — https://yoodli.ai/feature-announcements/your-secret-weapon-for-interview-prep-interview-scenarios
- **S2:** Yoodli Roleplay Agent and persona/rubric configuration — https://support.yoodli.ai/en/articles/15960287-create-roleplays-with-roleplay-agent
- **S3:** Yoodli text roleplay and rubric feedback — https://support.yoodli.ai/en/articles/15862405-create-chat-based-roleplays
- **S4:** Huru official product and organizational offerings — https://huru.ai/ and https://huru.ai/organizations/
- **S5:** interviewing.io official offering — https://interviewing.io/
- **S6:** interviewing.io discussion of interviewer ratings — https://interviewing.io/blog/our-business-depends-on-having-the-best-interviewers-so-we-built-an-interviewer-rating-system-and-you-can-too (official indexed extract reviewed; full-page retrieval failed).
- **S7:** Groq rate limits — https://console.groq.com/docs/rate-limits
- **S8:** Gemini pricing and rate limits — https://ai.google.dev/gemini-api/docs/pricing and https://ai.google.dev/gemini-api/docs/rate-limits
- **S9:** Supabase pricing and pausing — https://supabase.com/pricing and https://supabase.com/docs/guides/platform/free-project-pausing
- **S10:** Render free-service behavior — https://render.com/docs/free
- **S11:** GitHub Actions billing — https://docs.github.com/en/billing/concepts/product-billing/github-actions
- **S12:** Node.js LTS availability — https://nodejs.org/en/download/current
- **S14:** GitHub setup-node usage and current examples — https://github.com/actions/setup-node
- **S15:** Render static hosting — https://render.com/docs/static-sites
- **S13:** Supabase row-level security — https://supabase.com/docs/guides/database/postgres/row-level-security

---

**Release rule:** All five core workflows must work with real persisted data. AI may fail gracefully; permissions, saved answers, and truthful status must not.
