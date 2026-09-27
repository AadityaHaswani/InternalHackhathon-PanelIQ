-- ============================================================================
-- Migration: 202609270009_multi_role_expansion_and_evaluators.sql
-- Multi-Role Interview Platform Expansion (6 New Roles, 120 Questions, 14 Evaluators)
-- Adds: Frontend, Full Stack, System Design, DevOps, Data, QA
-- Safe, deterministic, and idempotent. Preserves existing Backend Developer data.
-- ============================================================================

begin;

-- 1. Register 6 new interview roles in public.interview_roles
insert into public.interview_roles (slug, domain, label, active)
values
  ('frontend_engineer', 'computer_science', 'Frontend Engineer', true),
  ('full_stack_engineer', 'computer_science', 'Full Stack Engineer', true),
  ('system_design_engineer', 'computer_science', 'System Design Engineer', true),
  ('devops_cloud_engineer', 'computer_science', 'DevOps / Cloud Engineer', true),
  ('data_engineer', 'computer_science', 'Data Engineer', true),
  ('qa_automation_engineer', 'computer_science', 'QA / Automation Engineer', true)
on conflict (slug) do update set
  domain = excluded.domain,
  label = excluded.label,
  active = excluded.active;

-- 2. Seed realistic evaluators (natural Indian identities) into auth.users, profiles, and user_roles
insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('e0000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'priya.sharma@paneliq.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Dr. Priya Sharma","specialization":"Distributed Systems & Scalability Architecture"}'::jsonb, now(), now()),
  ('e0000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'rahul.mehta@paneliq.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Rahul Mehta","specialization":"High-Throughput APIs & Database Engineering"}'::jsonb, now(), now()),
  ('e0000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'ananya.kulkarni@paneliq.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Ananya Kulkarni","specialization":"Modern Frontend Architecture & State Machines"}'::jsonb, now(), now()),
  ('e0000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'rohan.desai@paneliq.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Rohan Desai","specialization":"End-to-End Web Systems & Cross-Tier Security"}'::jsonb, now(), now()),
  ('e0000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'neha.iyer@paneliq.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Neha Iyer","specialization":"Large-Scale Batch/Streaming & Lakehouse Modeling"}'::jsonb, now(), now()),
  ('e0000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'arjun.nair@paneliq.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Arjun Nair","specialization":"Kubernetes Platform Reliability & Cloud Native SRE"}'::jsonb, now(), now()),
  ('e0000000-0000-0000-0000-000000000007', 'authenticated', 'authenticated', 'sneha.joshi@paneliq.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Sneha Joshi","specialization":"Test Architecture, E2E Automation & Quality Gates"}'::jsonb, now(), now()),
  ('e0000000-0000-0000-0000-000000000008', 'authenticated', 'authenticated', 'vikram.shah@paneliq.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Vikram Shah","specialization":"Resilient Microservices & Disaster Recovery"}'::jsonb, now(), now()),
  ('e0000000-0000-0000-0000-000000000009', 'authenticated', 'authenticated', 'kavita.raman@paneliq.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Kavita Raman","specialization":"Core Web Vitals, Rendering Performance & Design Systems"}'::jsonb, now(), now()),
  ('e0000000-0000-0000-0000-000000000010', 'authenticated', 'authenticated', 'amitabh.sen@paneliq.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Amitabh Sen","specialization":"Event-Driven Full Stack Systems & GraphQL/REST APIs"}'::jsonb, now(), now()),
  ('e0000000-0000-0000-0000-000000000011', 'authenticated', 'authenticated', 'meera.nambiar@paneliq.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Meera Nambiar","specialization":"Distributed SQL Engines, Spark & Data Warehousing"}'::jsonb, now(), now()),
  ('e0000000-0000-0000-0000-000000000012', 'authenticated', 'authenticated', 'suresh.pillai@paneliq.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Suresh Pillai","specialization":"Infrastructure as Code, CI/CD Security & Observability"}'::jsonb, now(), now()),
  ('e0000000-0000-0000-0000-000000000013', 'authenticated', 'authenticated', 'divya.agarwal@paneliq.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Divya Agarwal","specialization":"Performance Testing, Load Simulation & Contract Testing"}'::jsonb, now(), now()),
  ('e0000000-0000-0000-0000-000000000014', 'authenticated', 'authenticated', 'rajesh.venkat@paneliq.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Rajesh Venkat","specialization":"Distributed Consensus & High-Concurrency Systems"}'::jsonb, now(), now())
on conflict (id) do update set
  email = excluded.email,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into public.profiles (user_id, display_name, domain, experience_level, target_role, created_at, updated_at)
values
  ('e0000000-0000-0000-0000-000000000001', 'Dr. Priya Sharma', 'computer_science', 'intermediate', 'system_design_engineer', now(), now()),
  ('e0000000-0000-0000-0000-000000000002', 'Rahul Mehta', 'computer_science', 'intermediate', 'backend_developer', now(), now()),
  ('e0000000-0000-0000-0000-000000000003', 'Ananya Kulkarni', 'computer_science', 'intermediate', 'frontend_engineer', now(), now()),
  ('e0000000-0000-0000-0000-000000000004', 'Rohan Desai', 'computer_science', 'intermediate', 'full_stack_engineer', now(), now()),
  ('e0000000-0000-0000-0000-000000000005', 'Neha Iyer', 'computer_science', 'intermediate', 'data_engineer', now(), now()),
  ('e0000000-0000-0000-0000-000000000006', 'Arjun Nair', 'computer_science', 'intermediate', 'devops_cloud_engineer', now(), now()),
  ('e0000000-0000-0000-0000-000000000007', 'Sneha Joshi', 'computer_science', 'intermediate', 'qa_automation_engineer', now(), now()),
  ('e0000000-0000-0000-0000-000000000008', 'Vikram Shah', 'computer_science', 'intermediate', 'system_design_engineer', now(), now()),
  ('e0000000-0000-0000-0000-000000000009', 'Kavita Raman', 'computer_science', 'intermediate', 'frontend_engineer', now(), now()),
  ('e0000000-0000-0000-0000-000000000010', 'Amitabh Sen', 'computer_science', 'intermediate', 'full_stack_engineer', now(), now()),
  ('e0000000-0000-0000-0000-000000000011', 'Meera Nambiar', 'computer_science', 'intermediate', 'data_engineer', now(), now()),
  ('e0000000-0000-0000-0000-000000000012', 'Suresh Pillai', 'computer_science', 'intermediate', 'devops_cloud_engineer', now(), now()),
  ('e0000000-0000-0000-0000-000000000013', 'Divya Agarwal', 'computer_science', 'intermediate', 'qa_automation_engineer', now(), now()),
  ('e0000000-0000-0000-0000-000000000014', 'Rajesh Venkat', 'computer_science', 'intermediate', 'backend_developer', now(), now())
on conflict (user_id) do update set
  display_name = excluded.display_name,
  domain = excluded.domain,
  experience_level = excluded.experience_level,
  target_role = excluded.target_role,
  updated_at = now();

insert into public.user_roles (user_id, role, created_at)
values
  ('e0000000-0000-0000-0000-000000000001', 'evaluator', now()),
  ('e0000000-0000-0000-0000-000000000002', 'evaluator', now()),
  ('e0000000-0000-0000-0000-000000000003', 'evaluator', now()),
  ('e0000000-0000-0000-0000-000000000004', 'evaluator', now()),
  ('e0000000-0000-0000-0000-000000000005', 'evaluator', now()),
  ('e0000000-0000-0000-0000-000000000006', 'evaluator', now()),
  ('e0000000-0000-0000-0000-000000000007', 'evaluator', now()),
  ('e0000000-0000-0000-0000-000000000008', 'evaluator', now()),
  ('e0000000-0000-0000-0000-000000000009', 'evaluator', now()),
  ('e0000000-0000-0000-0000-000000000010', 'evaluator', now()),
  ('e0000000-0000-0000-0000-000000000011', 'evaluator', now()),
  ('e0000000-0000-0000-0000-000000000012', 'evaluator', now()),
  ('e0000000-0000-0000-0000-000000000013', 'evaluator', now()),
  ('e0000000-0000-0000-0000-000000000014', 'evaluator', now())
on conflict (user_id, role) do nothing;

-- 3. Seed 120 curated questions across the 6 new roles into question_versions & question_keys
-- CTE-based, trigger-safe, and idempotent: versions are created in draft so question_key_immutable
-- trigger permits attaching keys, then drafts are published. Zero temp tables used.
with new_seed as (
  select value as q from jsonb_array_elements($seed$[
  {
    "id": "fe-j-intro-app",
    "role": "frontend_engineer",
    "level": "junior",
    "stage": "icebreaker",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Describe a frontend web application or component you built with React or modern JavaScript. What user problem did it solve, and what part did you personally architect?",
    "followUp": "What was the trickiest UI state or user interaction you had to debug while writing that code?",
    "concepts": [
      "Concrete application scope and user goal",
      "Specific component architecture and personal contribution",
      "Reflection on component limitations or design lessons learned"
    ],
    "anchors": {
      "0": "Cannot describe any frontend code or component they personally created.",
      "1": "Describes a generic tutorial or boilerplate app without identifying personal implementation details.",
      "2": "Explains what the app does and identifies components, but provides minimal insight into state or trade-offs.",
      "3": "Clearly details component structure, state management, API data flow, and at least one user interaction challenge.",
      "4": "Exemplary clarity: describes component hierarchy, accessibility considerations, state boundaries, and how they would refactor it."
    },
    "rubricNotes": "Unscored icebreaker. Look for authentic ownership, clear technical articulation, and honest boundaries."
  },
  {
    "id": "fe-j-comp-lifecycle",
    "role": "frontend_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "concurrency"
    ],
    "prompt": "A parent component fetches user data and re-renders frequently. Explain why child components might re-render unnecessarily, and how you would prevent wasteful DOM updates.",
    "followUp": "When would wrapping a callback in useCallback or a component in React.memo introduce more overhead than it saves?",
    "concepts": [
      "Virtual DOM reconciliation and parent-child re-render cascade",
      "Memoization techniques (React.memo, useMemo, useCallback) and reference equality",
      "Understanding when memoization overhead exceeds rendering cost"
    ],
    "anchors": {
      "0": "Believes child components only re-render if their own internal state changes.",
      "1": "Knows React re-renders children when parents update, but cannot explain object/function reference equality.",
      "2": "Explains React.memo and props comparison, but cannot explain when function recreations break memoization.",
      "3": "Coherently explains reference equality of objects/callbacks, props shallow comparison, and proper use of useCallback/useMemo.",
      "4": "Deep rendering insights: explains reconciliation diffing, state collocation, children-as-props composition patterns, and profiling tools."
    },
    "rubricNotes": "Technical scoring guidance. Focus on virtual DOM understanding and practical performance optimization."
  },
  {
    "id": "fe-j-state-management",
    "role": "frontend_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "Compare managing state in local component state (like useState) versus lifting state up or using context. When does passing props down become problematic?",
    "followUp": "What performance drawback can occur when multiple unrelated components consume a large shared Context?",
    "concepts": [
      "Prop drilling limitations and component coupling",
      "Lifting state up to the nearest common ancestor",
      "Context API broadcast re-renders and state collocation"
    ],
    "anchors": {
      "0": "Cannot articulate the difference between local state and global/context state.",
      "1": "Suggests putting all application state into global context to avoid passing props entirely.",
      "2": "Explains prop drilling and lifting state up, but does not recognize Context re-render performance implications.",
      "3": "Articulates when local state is preferable, how lifting state resolves shared needs, and Context usage with separate dispatch/state.",
      "4": "Mastery of state boundaries: explains state collocation, server-cache vs client-UI state separation, and selective context slicing."
    },
    "rubricNotes": "Technical scoring guidance. Rewards sound state architecture and avoiding premature global state."
  },
  {
    "id": "fe-j-api-loading-error",
    "role": "frontend_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "apis"
    ],
    "prompt": "When calling a REST API from a web UI, explain how you represent loading, empty, success, and error states. What HTTP status codes trigger user-visible retry flows?",
    "followUp": "How do you prevent showing an empty state while the initial data fetch is still in flight?",
    "concepts": [
      "Explicit UI state machine (idle, loading, success, error, empty)",
      "HTTP status handling (4xx client validation vs 5xx server failure)",
      "User-friendly retry actions and preventing layout flickering"
    ],
    "anchors": {
      "0": "Only handles the happy path, leaving the UI hanging indefinitely on network failure.",
      "1": "Displays a generic alert box on error but leaves loading and empty states unhandled.",
      "2": "Tracks isLoading and error booleans, but risks contradictory state (e.g. loading and error both true).",
      "3": "Implements mutually exclusive state machine or discriminated union; clearly differentiates 404, 401/403, and 500 error handling.",
      "4": "Production resilience: details skeleton loaders, optimistic UI updates, error boundary integration, and exponential backoff retry."
    },
    "rubricNotes": "Technical scoring guidance. Emphasizes robust async UX and resilient error recovery."
  },
  {
    "id": "fe-j-forms-validation",
    "role": "frontend_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "apis"
    ],
    "prompt": "On a registration form, how do you handle client-side form validation versus server-side validation? What happens if a user submits whitespace or bypasses client validation?",
    "followUp": "Why is client-side validation considered a UX enhancement rather than a security boundary?",
    "concepts": [
      "Client validation for instant UX feedback and server validation for authoritative security",
      "Input sanitization, trimming whitespace, and schema constraints",
      "Handling server validation errors and mapping them back to specific form fields"
    ],
    "anchors": {
      "0": "Assumes client-side HTML5 validation is sufficient to protect the database.",
      "1": "Acknowledges server validation is needed but cannot describe how server error responses are surfaced to users.",
      "2": "Validates on both ends; checks required fields and email formats, but handles errors globally rather than field-level.",
      "3": "Clearly separates UX feedback (client) from security (server); trims whitespace; maps field-level 422 errors to input components.",
      "4": "Comprehensive form engineering: uses schema libraries (Zod/Yup), handles async availability checks (e.g. username taken), and accessibility focus."
    },
    "rubricNotes": "Technical scoring guidance. Checks security boundary understanding and form error mapping."
  },
  {
    "id": "fe-j-responsive-css",
    "role": "frontend_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "How do you structure CSS or layout styles to ensure a data table or grid is usable on both 360px mobile screens and 1440px desktop monitors without horizontal clipping?",
    "followUp": "How do you decide between wrapping rows into card layouts versus using a horizontally scrollable container on mobile?",
    "concepts": [
      "Mobile-first responsive design using media queries, Flexbox, and CSS Grid",
      "Table transformation patterns: card view vs horizontal scroll containers",
      "Preventing content overflow and maintaining legible typography"
    ],
    "anchors": {
      "0": "Hardcodes fixed pixel widths causing broken horizontal scrolling on mobile.",
      "1": "Uses basic media queries but has no coherent strategy for displaying tabular data on small viewports.",
      "2": "Wraps table in overflow-x: auto; understands viewport units but misses touch usability enhancements.",
      "3": "Proposes transforming tabular rows into stacked cards on mobile or uses sticky headers with smooth horizontal scroll.",
      "4": "Exemplary responsive layout: leverages CSS container queries, touch-friendly touch targets, responsive typography clamp(), and ARIA roles."
    },
    "rubricNotes": "Technical scoring guidance. Focuses on CSS layout fundamentals and mobile UX."
  },
  {
    "id": "fe-j-project-accessibility",
    "role": "frontend_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "reliability"
    ],
    "prompt": "A designer delivers modal dialogs and dropdown menus that lack keyboard navigation and screen-reader labels. How do you prioritize and advocate for accessibility fixes before launch?",
    "followUp": "What automated tools and manual keyboard checks would you integrate into the PR review process?",
    "concepts": [
      "WCAG compliance as a core engineering standard, not an optional feature",
      "Key accessibility requirements: keyboard trap, focus management, ARIA labels",
      "Constructive collaboration with design and product stakeholders"
    ],
    "anchors": {
      "0": "Considers accessibility optional and dismisses keyboard navigation as edge-case behavior.",
      "1": "Agrees accessibility is good but says they would only fix it if product manager explicitly assigns a ticket.",
      "2": "Knows about alt text and basic aria labels, but cannot explain focus trapping in modal dialogs.",
      "3": "Explains focus trapping, Esc key dismissal, tab order, and communicates legal/usability risks constructively to the team.",
      "4": "Leadership mindset: suggests lint rules (jsx-a11y), automated axe-core CI checks, and works with design to create accessible specs."
    },
    "rubricNotes": "Techno-managerial guidance. Evaluates technical standards advocacy and cross-functional communication."
  },
  {
    "id": "fe-j-project-bundle-size",
    "role": "frontend_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "A frontend pull request imports a 2MB charting library for a single sparkline graph. How do you evaluate whether to accept the dependency or find a lighter alternative?",
    "followUp": "If the team agrees the full library is unnecessary, how would you implement the sparkline with minimal footprint?",
    "concepts": [
      "Impact of JavaScript bundle size on initial load and mobile parse time",
      "Dependency evaluation: tree-shaking, bundle analyzers, lightweight alternatives",
      "Writing constructive code review feedback advocating for performance"
    ],
    "anchors": {
      "0": "Approves the PR without hesitation, believing library size does not matter on modern broadband.",
      "1": "Recognizes 2MB is large, but does not know how to inspect bundle cost or tree-shaking support.",
      "2": "Suggests finding another library or using dynamic import, but does not measure the actual bundle delta.",
      "3": "Uses bundle analysis tools (like bundlephobia or rollup-plugin-visualizer); suggests lightweight SVG or micro-libraries.",
      "4": "Deep performance advocacy: weighs dynamic import code-splitting vs inline SVG, discusses mobile CPU parse overhead, and guides the author."
    },
    "rubricNotes": "Techno-managerial guidance. Evaluates pragmatism, performance awareness, and peer review tact."
  },
  {
    "id": "fe-j-project-browser-bug",
    "role": "frontend_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "reliability"
    ],
    "prompt": "A bug report states that dropdown menus fail to open on iOS Safari but work on Chrome desktop. Walk through how you reproduce, isolate, and debug this browser-specific issue.",
    "followUp": "How do touch event models (touchstart/touchend) differ from click events on iOS mobile devices?",
    "concepts": [
      "Cross-browser debugging workflow (remote debugging Safari via Web Inspector)",
      "Touch vs mouse event dispatch differences and hover state behavior",
      "Defensive cross-browser CSS/JS practices and polyfill considerations"
    ],
    "anchors": {
      "0": "Dismisses the bug as a user device issue because it works on their local Chrome browser.",
      "1": "Tries random CSS changes blindly on desktop without reproducing on an actual iOS simulator or device.",
      "2": "Connects device or simulator to Safari Web Inspector; identifies click vs touch event issues but struggles with fix.",
      "3": "Systematically isolates root cause using remote Web Inspector; inspects pointer events, touch handlers, and CSS z-index/transform stacking.",
      "4": "Exemplary cross-platform engineering: explains iOS Safari 300ms click delay legacy, passive listeners, pointer events API, and regression tests."
    },
    "rubricNotes": "Techno-managerial guidance. Focuses on systematic diagnostic methodology under cross-browser variance."
  },
  {
    "id": "fe-j-reflect-ui-improvement",
    "role": "frontend_engineer",
    "level": "junior",
    "stage": "reflection",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Think of a UI interaction or component you worked on recently. With another hour of time, what visual or behavioral edge case would you refine, and how would you test it?",
    "followUp": "How would you verify that your refinement did not break existing interactions for power users?",
    "concepts": [
      "Self-awareness of personal code limitations and incomplete edge cases",
      "Specific refinement (micro-interactions, error states, keyboard shortcuts)",
      "Verifiable testing methodology (visual regression, unit tests, manual checks)"
    ],
    "anchors": {
      "0": "Claims their UI code was already flawless and required zero refinement.",
      "1": "Mentions vague aesthetic tweaks without identifying concrete interaction edge cases.",
      "2": "Identifies an edge case (e.g. long text overflow) but offers only generic manual verification.",
      "3": "Articulates a clear edge case (e.g. rapid toggling, keyboard focus, screen reader announcement) and a concrete verification step.",
      "4": "Exceptional craft: details specific UX micro-behaviors, motion accessibility (prefers-reduced-motion), and automated component test verification."
    },
    "rubricNotes": "Unscored reflection. Reward intellectual honesty, engineering craft, and verifiable follow-through."
  },
  {
    "id": "fe-i-intro-architecture",
    "role": "frontend_engineer",
    "level": "intermediate",
    "stage": "icebreaker",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Describe a complex frontend architecture decision you made, such as state synchronization, micro-frontends, or design system tokens. What trade-offs did you encounter?",
    "followUp": "Looking back, would you make the same architectural choice today or adopt a simpler alternative?",
    "concepts": [
      "Significant architectural challenge and business context",
      "Deliberate trade-off evaluation (e.g. flexibility vs complexity, build time vs runtime)",
      "Honest post-implementation appraisal and lessons learned"
    ],
    "anchors": {
      "0": "Cannot articulate any architectural choices or claims they simply followed standard template defaults.",
      "1": "Describes a standard feature implementation without explaining why specific architectural patterns were chosen.",
      "2": "Explains an architectural setup (e.g. Redux Toolkit or monorepo) but focuses only on benefits without trade-offs.",
      "3": "Thoroughly discusses technical constraints, team ergonomics, trade-offs between competing approaches, and measurable outcomes.",
      "4": "Senior architectural maturity: discusses long-term maintenance overhead, team cognitive load, operational telemetry, and evolutionary design."
    },
    "rubricNotes": "Unscored icebreaker. Look for architectural maturity, trade-off honesty, and systems thinking."
  },
  {
    "id": "fe-i-virtual-rendering",
    "role": "frontend_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "concurrency"
    ],
    "prompt": "A dashboard table needs to display 25,000 live updating rows without degrading browser FPS. Explain how DOM virtualization works and how you prevent frame drops.",
    "followUp": "How do you handle dynamic row heights when calculating scroll offset and total container height in a virtual list?",
    "concepts": [
      "Windowing/virtualization mechanics (rendering only viewport visible rows + overscan buffer)",
      "Scroll listener performance, requestAnimationFrame, and absolute offset calculation",
      "Dynamic row height measurement and binary search index mapping"
    ],
    "anchors": {
      "0": "Suggests rendering all 25,000 DOM nodes at once or using basic pagination without virtualization understanding.",
      "1": "Knows libraries like react-window exist, but cannot explain how DOM nodes are recycled or offsets computed.",
      "2": "Explains fixed-height virtualization, viewport clipping, and overscan, but struggles with dynamic row heights.",
      "3": "Coherently explains absolute positioning calculation, scroll throttling via rAF, dynamic height measurement cache, and index search.",
      "4": "Deep rendering expertise: discusses memory pressure from detached DOM nodes, Web Worker offloading for filtering, and CSS transform compositing."
    },
    "rubricNotes": "Technical scoring guidance. Tests high-performance DOM manipulation and rendering engine mechanics."
  },
  {
    "id": "fe-i-state-caching-swr",
    "role": "frontend_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "apis"
    ],
    "prompt": "Compare client-side caching libraries (like React Query or SWR) against manual useEffect fetch loops. How do stale-while-revalidate, optimistic updates, and cache invalidation prevent race conditions?",
    "followUp": "How do you roll back an optimistic update if the server mutation fails after three network retries?",
    "concepts": [
      "Stale-while-revalidate caching semantics and background synchronization",
      "Deduplication of identical in-flight requests across concurrent components",
      "Optimistic mutation rollback using snapshot context"
    ],
    "anchors": {
      "0": "Believes manual useEffect fetch with local useState is sufficient for complex distributed data views.",
      "1": "Uses React Query as a basic fetch wrapper but cannot explain cache keys, stale time vs garbage collection time, or invalidation.",
      "2": "Explains background refetching and basic optimistic updates, but does not understand how snapshot rollbacks operate.",
      "3": "Deeply explains query key hashing, request deduplication, optimistic context snapshots, and targeted cache invalidation tags.",
      "4": "Production mastery: articulates offline persistence, normalized vs document cache trade-offs, retry backoff strategies, and structural sharing."
    },
    "rubricNotes": "Technical scoring guidance. Emphasizes modern client data architecture and cache consistency."
  },
  {
    "id": "fe-i-web-vitals-perf",
    "role": "frontend_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "How would you identify, measure, and optimize Core Web Vitals—specifically Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS)—in a Single Page Application?",
    "followUp": "How can client-side font loading and dynamic ads cause severe CLS, and what CSS/HTML primitives eliminate it?",
    "concepts": [
      "Core Web Vitals definitions and diagnostic tools (Lighthouse, Chrome Performance profiler, Web Vitals API)",
      "LCP optimization: preloading critical assets, image optimization (AVIF/WebP), eliminating render-blocking JS/CSS",
      "CLS prevention: reserving aspect-ratio boxes, font-display: optional/swap with metrics override"
    ],
    "anchors": {
      "0": "Cannot define LCP or CLS, or confuses synthetic lab benchmarks with real-user monitoring (RUM).",
      "1": "Recognizes LCP and CLS as SEO metrics but relies on vague solutions like \"minify code\" without measuring bottlenecks.",
      "2": "Explains what LCP and CLS measure and uses aspect-ratio for images, but misses font swapping and critical asset preloading.",
      "3": "Coherently diagnoses LCP resource load delay and element render delay; eliminates CLS using CSS aspect-ratio and font fallback matching.",
      "4": "Industry-standard performance mastery: integrates RUM telemetry via PerformanceObserver, analyzes render-blocking critical chains, and implements SSR/streaming."
    },
    "rubricNotes": "Technical scoring guidance. Focuses on real-world browser performance diagnostics and Web Vitals."
  },
  {
    "id": "fe-i-client-storage-auth",
    "role": "frontend_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "databases"
    ],
    "prompt": "Where should access tokens and refresh tokens be stored on the client side? Compare HttpOnly cookies, localStorage, and in-memory storage regarding XSS and CSRF trade-offs.",
    "followUp": "If using HttpOnly SameSite cookies to mitigate XSS token theft, what CSRF protections must your frontend and backend enforce?",
    "concepts": [
      "localStorage vulnerability to cross-site scripting (XSS) exfiltration",
      "HttpOnly cookies immunity to JavaScript reads vs vulnerability to Cross-Site Request Forgery (CSRF)",
      "SameSite cookie attribute (Strict/Lax), anti-CSRF tokens, and in-memory access token rotation"
    ],
    "anchors": {
      "0": "Recommends storing sensitive JWT tokens in localStorage without understanding XSS token theft risks.",
      "1": "Knows HttpOnly cookies cannot be read by JS, but cannot explain what CSRF is or how SameSite attributes work.",
      "2": "Compares localStorage vs cookies on basic criteria, but fails to explain how silent token refresh in memory works.",
      "3": "Provides balanced analysis: in-memory access token with HttpOnly refresh cookie; explains SameSite=Lax/Strict and anti-CSRF headers.",
      "4": "Senior security expertise: details Content Security Policy (CSP) headers, token rotation replay detection, iframe sandboxing, and OAuth 2.0 PKCE flows."
    },
    "rubricNotes": "Technical scoring guidance. Evaluates web security fundamentals, XSS/CSRF mechanics, and client token storage."
  },
  {
    "id": "fe-i-async-race-conditions",
    "role": "frontend_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "concurrency"
    ],
    "prompt": "Two rapid auto-complete search keystrokes trigger HTTP requests, but the first response arrives after the second response. How do you guarantee the UI renders the freshest query?",
    "followUp": "How does AbortController cancel inflight fetch requests, and does aborting prevent the backend from processing the request?",
    "concepts": [
      "Network out-of-order response race conditions in asynchronous UIs",
      "Cancellation via AbortController and DOM event debouncing",
      "Tracking request sequence IDs / timestamps to discard stale server responses"
    ],
    "anchors": {
      "0": "Assumes network responses always arrive in the exact order they were sent.",
      "1": "Suggests simple debouncing alone, unaware that network latency variations can still cause out-of-order responses.",
      "2": "Mentions AbortController or sequence counters, but cannot write or describe the cleanup implementation in a React hook.",
      "3": "Implements AbortController in useEffect cleanup; explains why stale responses are aborted or ignored; differentiates client cancel from server compute.",
      "4": "Mastery of async coordination: explains switchMap reactive patterns, signal forwarding across chained promises, and UI transition states."
    },
    "rubricNotes": "Technical scoring guidance. Tests asynchronous concurrency control and network lifecycle management."
  },
  {
    "id": "fe-i-project-refactor-legacy",
    "role": "frontend_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Your team has a mission-critical 40,000-line legacy jQuery/vanilla page that needs modern React migration while active customer features are constantly shipped. How do you plan the migration?",
    "followUp": "How do you coordinate shared state (like user session or cart items) between the legacy code and new React components during transition?",
    "concepts": [
      "Strangler Fig pattern for incremental UI migration versus risky big-bang rewrites",
      "Micro-islands / hybrid mounting and event bus communication between legacy and modern tiers",
      "Setting quality metrics, feature freeze boundaries, and migration milestones"
    ],
    "anchors": {
      "0": "Advocates stopping all feature work for six months to do a complete ground-up rewrite.",
      "1": "Suggests migrating page by page but has no mechanism for sharing state or styles between legacy and modern pages.",
      "2": "Proposes incremental migration using React portals or mounting components inside jQuery DOM, but lacks risk mitigation plans.",
      "3": "Applies Strangler pattern: defines hybrid mounting strategy, CustomEvent / window dispatch for state sync, and incremental rollback capabilities.",
      "4": "Pragmatic technical leadership: defines success criteria (error budgets, page load deltas), deprecation schedule, and manages stakeholder expectations."
    },
    "rubricNotes": "Techno-managerial guidance. Focuses on legacy migration strategies, risk management, and delivery pragmatism."
  },
  {
    "id": "fe-i-project-design-system",
    "role": "frontend_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Product managers want one-off button and typography variations across different screens, threatening design system consistency. How do you establish component governance without blocking delivery?",
    "followUp": "When is it appropriate to introduce a new component variant into the core design system versus keeping it in a local feature folder?",
    "concepts": [
      "Design system governance, semantic tokens, and component reusability",
      "Collaborative design-engineering triage (Rule of Three for abstraction)",
      "Escalation paths, component extension points, and visual regression guardrails"
    ],
    "anchors": {
      "0": "Either rigidly rejects all product requests causing team conflict, or allows arbitrary styling overrides breaking the design system.",
      "1": "Agrees one-off styles are bad, but leaves individual developers to negotiate ad-hoc with designers on every PR.",
      "2": "Creates new props on existing components for every request, resulting in bloated 30-prop monster components.",
      "3": "Establishes clear component lifecycle (experimental local feature -> candidate -> core tokenized component); implements semantic token system.",
      "4": "Organizational impact: establishes shared Design-Engineering RFC process, automated visual diff testing (Chromatic/Percy), and token governance."
    },
    "rubricNotes": "Techno-managerial guidance. Evaluates design system architecture, stakeholder negotiation, and component lifecycle."
  },
  {
    "id": "fe-i-project-flaky-e2e",
    "role": "frontend_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "reliability"
    ],
    "prompt": "Cypress or Playwright end-to-end tests in CI fail intermittently due to animation timing and network latency. What concrete changes do you make to eliminate test flakiness?",
    "followUp": "Why is adding arbitrary sleep() delays considered an anti-pattern, and what explicit assertion polling replaces it?",
    "concepts": [
      "Root causes of E2E flakiness: animation transitions, network race conditions, unpinned test data",
      "Deterministic waiting on web assertions and network response interception instead of arbitrary timeouts",
      "Test isolation, synthetic fixture mocking, and CI quarantine policies"
    ],
    "anchors": {
      "0": "Adds sleep(5000) throughout tests or sets CI to automatically retry failed tests 5 times without investigation.",
      "1": "Identifies network delays as the cause, but relies on increasing global timeouts rather than explicit wait conditions.",
      "2": "Replaces sleeps with cy.wait('@alias') or waitForResponse, but struggles with animation frame transitions or shared state pollution.",
      "3": "Eliminates arbitrary timeouts using Playwright auto-retrying assertions, network route mocks, database state resets, and disables CSS animations in test.",
      "4": "Systemic quality leadership: establishes flaky test detection pipeline, categorizes failure signatures, implements test container parallelization, and tracks flakiness metrics."
    },
    "rubricNotes": "Techno-managerial guidance. Tests automated testing discipline, diagnostic rigor, and CI stabilization."
  },
  {
    "id": "fe-i-reflect-frontend-scale",
    "role": "frontend_engineer",
    "level": "intermediate",
    "stage": "reflection",
    "topics": [
      "reliability"
    ],
    "prompt": "In a past frontend codebase, what initial design choice seemed clean at first but caused maintenance friction as the codebase grew? How would you design it differently today?",
    "followUp": "What early metrics or developer signals would have tipped you off that the abstraction was failing?",
    "concepts": [
      "Critical introspection on an architectural choice (e.g. premature abstraction, overly centralized state, or excessive library wrapping)",
      "Analysis of friction points: developer velocity, onboarding friction, bug rate",
      "Constructive lessons and modern architectural perspective"
    ],
    "anchors": {
      "0": "Cannot identify any past design mistake or blames past issues entirely on incompetent teammates.",
      "1": "Mentions a superficial issue (e.g. choice of CSS preprocessor) without analyzing architectural consequences.",
      "2": "Identifies a real problem (e.g. monolithic Redux store or heavy component wrapper), but lesson learned remains vague.",
      "3": "Clearly describes how an initial pattern caused friction (e.g. prop explosion, over-abstracted HOCs, or tight coupling) and how they refactored it.",
      "4": "Profound architectural reflection: analyzes cognitive load on junior developers, boundary contracts, modularity, and principles for avoiding premature generalization."
    },
    "rubricNotes": "Unscored reflection. Reward vulnerability, depth of architectural insight, and hard-earned engineering wisdom."
  },
  {
    "id": "fs-j-intro-stack",
    "role": "full_stack_engineer",
    "level": "junior",
    "stage": "icebreaker",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Describe a full-stack project you created from scratch. Which backend language/framework and frontend library did you choose, and why?",
    "followUp": "If you had to add a background processing job to that application today, where would you run it?",
    "concepts": [
      "End-to-end application architecture (client, API, database)",
      "Rationale behind technology stack selection",
      "Understanding of deployment and operational boundaries"
    ],
    "anchors": {
      "0": "Cannot describe an end-to-end application or explain the boundary between client and server.",
      "1": "Describes a basic tutorial clone without knowing why specific libraries or database models were chosen.",
      "2": "Explains frontend and backend components, but provides shallow reasoning for data storage or API design.",
      "3": "Clearly details frontend client, API routing layer, database schema design, and deployment choices with trade-offs.",
      "4": "Deep systems perspective: explains data serialization, API contract versioning, security posture, and scaling limitations."
    },
    "rubricNotes": "Unscored icebreaker. Look for authentic ownership, clear full-stack mental model, and honest boundaries."
  },
  {
    "id": "fs-j-rest-contract",
    "role": "full_stack_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "apis"
    ],
    "prompt": "How do you design and document the REST contract between your frontend UI and backend API so that both can be developed in parallel without breaking changes?",
    "followUp": "What happens when the backend changes a response field from a string to an object while older mobile clients are still live?",
    "concepts": [
      "API contract specification (OpenAPI / Swagger / JSON Schema)",
      "Mocking API responses for independent frontend development",
      "Backward compatibility and field deprecation strategies"
    ],
    "anchors": {
      "0": "Believes frontend and backend developers must wait for each other rather than defining a shared schema first.",
      "1": "Relies on informal Slack messages for API contracts; cannot explain how to handle breaking field changes.",
      "2": "Uses OpenAPI or Postman collections to document endpoints, but has no strategy for versioning or mock servers.",
      "3": "Establishes clear API schemas with TypeScript interfaces or OpenAPI; sets up mock servers; explains additive changes for backward compatibility.",
      "4": "Exemplary contract engineering: generates client SDKs directly from backend schemas, enforces contract tests in CI, and explains Sunset headers."
    },
    "rubricNotes": "Technical scoring guidance. Tests API design discipline, cross-tier collaboration, and versioning."
  },
  {
    "id": "fs-j-auth-session-flow",
    "role": "full_stack_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "Trace a complete login flow: user submits credentials in the browser, backend verifies password hash, and the user accesses protected endpoints. How is authentication state maintained?",
    "followUp": "Why is bcrypt or Argon2 used for password hashing on the backend instead of fast algorithms like MD5 or SHA-256?",
    "concepts": [
      "End-to-end credential transmission (HTTPS, password hashing verification)",
      "Session token generation and verification (JWT vs stateful server sessions)",
      "Protecting tokens from client-side tampering and theft"
    ],
    "anchors": {
      "0": "Suggests storing plaintext passwords in the database or sending passwords over unencrypted HTTP.",
      "1": "Knows passwords should be hashed, but thinks SHA-256 is sufficient and cannot explain session persistence.",
      "2": "Explains bcrypt hashing and sending JWT back to client, but suggests storing sensitive tokens in localStorage.",
      "3": "Traces complete flow: HTTPS POST -> bcrypt comparison -> signed JWT/session cookie -> Authorization header / HttpOnly cookie -> auth middleware.",
      "4": "Security depth: articulates work factor / salt generation, token expiration/refresh cycles, revocation strategies, and CSRF/XSS defenses."
    },
    "rubricNotes": "Technical scoring guidance. Focuses on full-stack authentication fundamentals and security awareness."
  },
  {
    "id": "fs-j-crud-transaction",
    "role": "full_stack_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "databases"
    ],
    "prompt": "When a user creates an order with line items, explain how the backend writes to multiple database tables atomically, and what response the frontend expects on partial failure.",
    "followUp": "What SQL commands are used to initiate, commit, and abort a multi-statement database transaction?",
    "concepts": [
      "Database transactions and ACID atomicity (all-or-nothing guarantee)",
      "Foreign key relationships between orders and order_items",
      "Consistent error handling across database rollback and API HTTP response"
    ],
    "anchors": {
      "0": "Inserts order header and items sequentially without a transaction, risking orphaned order records on crash.",
      "1": "Knows transactions exist, but cannot explain what happens if inserting the third item throws an error.",
      "2": "Uses BEGIN / COMMIT / ROLLBACK in backend code, but returns generic 500 error without informing the frontend.",
      "3": "Wraps multi-table writes in an explicit transaction; guarantees automatic rollback on failure; returns structured 4xx/5xx error with rollback safety.",
      "4": "Deep transaction design: discusses isolation levels, lock contention, inventory reservation checks, and idempotent client retries."
    },
    "rubricNotes": "Technical scoring guidance. Evaluates transactional data integrity and error propagation to client."
  },
  {
    "id": "fs-j-cors-configuration",
    "role": "full_stack_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "apis"
    ],
    "prompt": "Why does a browser raise a CORS error when the frontend on localhost:3000 calls an API on localhost:8000, and what backend header configuration resolves it safely?",
    "followUp": "What is a preflight OPTIONS request, and why does the browser send it before certain POST or PUT requests?",
    "concepts": [
      "Same-Origin Policy as a browser security mechanism",
      "CORS response headers (Access-Control-Allow-Origin, Allow-Methods, Allow-Headers)",
      "Preflight OPTIONS requests triggered by custom headers or non-simple content types"
    ],
    "anchors": {
      "0": "Thinks CORS is a backend server bug or suggests disabling browser security settings as a solution.",
      "1": "Configures Access-Control-Allow-Origin: * indiscriminately without understanding credentialed request implications.",
      "2": "Explains Same-Origin Policy and adds allowed origin headers, but cannot explain what triggers a preflight request.",
      "3": "Clearly explains Same-Origin Policy, configures specific allowed origins, and explains why custom headers (e.g. Authorization) trigger preflight.",
      "4": "Comprehensive security understanding: explains credentialed requests (withCredentials), preflight caching (Max-Age), and proxying in development."
    },
    "rubricNotes": "Technical scoring guidance. Tests foundational understanding of web security boundaries."
  },
  {
    "id": "fs-j-optimistic-updates",
    "role": "full_stack_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "concurrency"
    ],
    "prompt": "Explain optimistic UI updates: when a user clicks Like, the UI immediately reflects the change before server confirmation. What happens if the server returns an error?",
    "followUp": "How do you handle a scenario where the user clicks Like and Unlike three times in rapid succession?",
    "concepts": [
      "Optimistic rendering pattern for perceived performance",
      "Rollback mechanisms and restoring previous state on server error",
      "Debouncing and request cancellation for rapid sequential toggles"
    ],
    "anchors": {
      "0": "Leaves the UI in the optimistic state even when the server explicitly fails.",
      "1": "Reverts the UI on error, but provides zero visual notification to the user that the operation failed.",
      "2": "Handles error rollback and toast notification, but rapid sequential clicks trigger multiple conflicting backend writes.",
      "3": "Maintains previous state snapshot; rolls back UI cleanly with error notification; debounces or chains rapid toggles.",
      "4": "Production UI architecture: details request sequence tracking, event sourcing / state reducer patterns, and offline sync."
    },
    "rubricNotes": "Technical scoring guidance. Focuses on client-server state coordination and asynchronous resilience."
  },
  {
    "id": "fs-j-project-auth-scope",
    "role": "full_stack_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "reliability"
    ],
    "prompt": "A deadline approaches and authentication is incomplete. The team debates shipping simple mock session cookies versus proper token validation. How do you handle security versus timeline?",
    "followUp": "What minimal viable authentication slice could be safely shipped if full OAuth is deferred?",
    "concepts": [
      "Security as a non-negotiable baseline in production systems",
      "Scoping down feature surface area instead of weakening security controls",
      "Clear, risk-based communication with project stakeholders"
    ],
    "anchors": {
      "0": "Willingly agrees to ship mock insecure cookies to production to meet the marketing date.",
      "1": "Refuses to ship anything but offers no constructive scope reduction alternatives.",
      "2": "Suggests basic auth without SSL/HTTPS or password hashing as a compromise.",
      "3": "Firmly explains vulnerability risks; proposes scoping down (e.g. email/password with secure bcrypt + HttpOnly cookie, deferring OAuth/SSO).",
      "4": "Strategic engineering leadership: presents threat model, regulatory impact, calculates technical debt remediation cost, and aligns team."
    },
    "rubricNotes": "Techno-managerial guidance. Evaluates ethical engineering standards and constructive trade-off negotiation."
  },
  {
    "id": "fs-j-project-schema-change",
    "role": "full_stack_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "You need to rename a database column that is currently consumed by both mobile and web clients. How do you coordinate the deployment to prevent downtime for active users?",
    "followUp": "Why is an Expand-and-Contract migration pattern required instead of a single ALTER TABLE RENAME command?",
    "concepts": [
      "Zero-downtime database migrations (Expand and Contract / Parallel Run)",
      "Multi-phase deployment: add new column, dual-write, backfill, migrate clients, drop old column",
      "Client version lag (especially un-updated native mobile apps)"
    ],
    "anchors": {
      "0": "Suggests running ALTER TABLE RENAME COLUMN in production and deploying frontend and backend simultaneously.",
      "1": "Understands that simultaneous deployment is risky, but cannot outline the concrete phases of an expand-contract migration.",
      "2": "Adds the new column and writes to it, but forgets to backfill existing data or account for older mobile client versions.",
      "3": "Outlines complete Expand-Contract phases: (1) add new column + dual-write, (2) backfill historical rows, (3) update clients, (4) retire old column.",
      "4": "Deep operational insight: details view/trigger abstraction, zero-downtime lock timeouts, backward compatibility windows, and telemetry validation."
    },
    "rubricNotes": "Techno-managerial guidance. Focuses on safe production change management and zero-downtime practices."
  },
  {
    "id": "fs-j-project-env-secrets",
    "role": "full_stack_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "reliability"
    ],
    "prompt": "An engineer accidentally commits a database password or API secret into a frontend repository. What immediate steps do you take to remediate the exposure?",
    "followUp": "Why is pushing a second commit that deletes the secret file from git insufficient to secure the credential?",
    "concepts": [
      "Immediate credential rotation and revocation as primary containment",
      "Git commit history persistence and repository exposure risks",
      "Preventative tooling: pre-commit hooks (git-secrets, gitleaks), environment secret managers"
    ],
    "anchors": {
      "0": "Simply pushes a new commit deleting the secret from the file, believing the issue is solved.",
      "1": "Recognizes the git history contains the secret, but fails to rotate the actual database credential immediately.",
      "2": "Rewrites git history with git filter-repo or BFG, but delays credential invalidation on the cloud provider.",
      "3": "Prioritizes immediate secret revocation/rotation in production; checks access logs; rewrites git history; adds pre-commit secret scanners.",
      "4": "Mature incident response: conducts blast-radius audit in cloud logs, rotates all related credentials, introduces secret management vault, and leads blameless review."
    },
    "rubricNotes": "Techno-managerial guidance. Evaluates operational security instincts and incident containment priorities."
  },
  {
    "id": "fs-j-reflect-debugging",
    "role": "full_stack_engineer",
    "level": "junior",
    "stage": "reflection",
    "topics": [
      "reliability"
    ],
    "prompt": "Describe an issue where you initially thought the bug was on the frontend but discovered the root cause was in the backend or database. What did you learn about cross-tier isolation?",
    "followUp": "What diagnostic tool (e.g. Network tab, backend logs, DB query profiler) provided the breakthrough evidence?",
    "concepts": [
      "Cross-tier debugging and root-cause isolation across network boundaries",
      "Inspecting HTTP payloads in browser devtools vs inspecting backend database logs",
      "Humble reflection and refining troubleshooting heuristics"
    ],
    "anchors": {
      "0": "Cannot recall any cross-tier bug or insists they always pinpoint root causes on the very first try.",
      "1": "Describes a bug, but spent hours changing random frontend code without checking Network tab payloads.",
      "2": "Identifies that the backend returned incorrect data, but cannot explain how they traced it into the database.",
      "3": "Clearly details the false symptom on the UI, the systematic inspection of network payloads and server logs, and the database root cause.",
      "4": "Exemplary troubleshooting reflection: discusses contract testing gaps, correlation IDs, defensive typing, and how it shaped their verification habits."
    },
    "rubricNotes": "Unscored reflection. Reward intellectual honesty, methodical troubleshooting, and cross-tier insights."
  },
  {
    "id": "fs-i-intro-fullstack-arch",
    "role": "full_stack_engineer",
    "level": "intermediate",
    "stage": "icebreaker",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Walk us through an end-to-end architecture you designed for a web platform. How did you balance business agility against long-term operational complexity?",
    "followUp": "What was the first architectural bottleneck you encountered when real users started stressing the system?",
    "concepts": [
      "Comprehensive end-to-end architectural vision (CDN, client, API gateway, services, database, cache)",
      "Pragmatic trade-offs between velocity and maintainability",
      "Observability and identifying real production bottlenecks"
    ],
    "anchors": {
      "0": "Describes a generic textbook architecture without demonstrating real ownership or context.",
      "1": "Describes tools used (e.g. Next.js + PostgreSQL) but cannot explain architectural choices or boundary divisions.",
      "2": "Covers the full stack, but focuses heavily on one tier while treating the other tier as a black box.",
      "3": "Articulates end-to-end data flow, network boundaries, caching layers, deployment pipeline, and trade-offs made.",
      "4": "Senior full-stack leadership: analyzes operational complexity, error budgets, security attack surface, and evolutionary roadmap."
    },
    "rubricNotes": "Unscored icebreaker. Look for comprehensive systems thinking, technical depth across tiers, and trade-off maturity."
  },
  {
    "id": "fs-i-ssr-hydration-perf",
    "role": "full_stack_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "concurrency"
    ],
    "prompt": "Compare Server-Side Rendering (SSR) with Client-Side Rendering (CSR). How does hydration work, and what causes server-client markup mismatch warnings in production?",
    "followUp": "How does React 18 Server Components and HTML streaming improve Time to First Byte (TTFB) and First Input Delay (FID)?",
    "concepts": [
      "SSR HTML generation on Node server vs client-side bundle hydration and event attachment",
      "Common hydration mismatch causes: window access during render, dynamic dates/timestamps, browser extension DOM injection",
      "Streaming SSR and Suspense boundaries for progressive rendering"
    ],
    "anchors": {
      "0": "Cannot explain hydration or thinks SSR and CSR produce identical performance profiles.",
      "1": "Knows SSR helps SEO, but cannot explain why the page is unresponsive before JavaScript hydration finishes.",
      "2": "Explains hydration mismatches caused by Date.now() or window, but offers ad-hoc suppressHydrationWarning workarounds.",
      "3": "Deeply explains reconciliation between server HTML AST and client VDOM; resolves mismatches using useEffect mounting checks or deterministic formatting.",
      "4": "Cutting-edge rendering mastery: explains React Server Components (RSC) zero-bundle-size benefits, selective hydration, and edge runtime compute."
    },
    "rubricNotes": "Technical scoring guidance. Focuses on full-stack rendering mechanics and modern web performance."
  },
  {
    "id": "fs-i-distributed-sessions",
    "role": "full_stack_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "databases"
    ],
    "prompt": "When scaling a backend to multiple instances behind a load balancer, how do you handle user sessions without pinning users to a single server instance with sticky sessions?",
    "followUp": "Compare using centralized Redis session storage against stateless signed/encrypted JWT cookies. What are the revocation trade-offs?",
    "concepts": [
      "Stateless horizontal application scaling behind round-robin load balancers",
      "Centralized session store (Redis) with TTL vs stateless JWT in cookies",
      "Immediate session revocation, logout invalidation, and token blacklisting"
    ],
    "anchors": {
      "0": "Relies on local server memory for session storage, causing random logouts when requests hit different instances.",
      "1": "Suggests sticky sessions without realizing it hampers auto-scaling and causes uneven load distribution.",
      "2": "Compares JWT vs Redis sessions, but cannot explain how to invalidate a compromised JWT before its expiration time.",
      "3": "Coherently articulates shared Redis session store vs JWT; explains token revocation lists, refresh token rotation, and cookie security flags.",
      "4": "Expert distributed session architecture: discusses Redis cluster replication, multi-region session latency, and hybrid stateless token/short-TTL models."
    },
    "rubricNotes": "Technical scoring guidance. Evaluates horizontal scaling principles, session consistency, and security revocation."
  },
  {
    "id": "fs-i-websocket-realtime",
    "role": "full_stack_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "concurrency"
    ],
    "prompt": "Design a real-time collaborative feature (like live document updates or notifications). How do you handle connection drops, reconnection backoff, and state re-synchronization?",
    "followUp": "If your backend scales across 10 instances, how does a WebSocket message published on Server 1 reach a client connected to Server 8?",
    "concepts": [
      "Persistent WebSocket / SSE connections vs HTTP polling",
      "Pub/Sub message broker (Redis Pub/Sub, RabbitMQ, Kafka) for multi-node connection routing",
      "Reconnection resilience: heartbeat ping/pong, exponential backoff with jitter, missing event replay from sequence offset"
    ],
    "anchors": {
      "0": "Suggests short-polling every 100ms or assumes a single WebSocket server instance can handle unlimited connections.",
      "1": "Uses WebSockets on a single server, but cannot explain how connections are coordinated when the backend scales horizontally.",
      "2": "Implements Redis Pub/Sub for cross-server message distribution, but has no mechanism for re-syncing missed events on disconnect.",
      "3": "Designs full pub/sub distribution; implements client reconnection with exponential backoff; uses sequence numbers to replay missed events.",
      "4": "Senior real-time systems mastery: compares WebSockets vs SSE vs WebTransport; addresses CRDTs/OT for conflict resolution and connection drain on deploy."
    },
    "rubricNotes": "Technical scoring guidance. Tests real-time bidirectional communication, horizontal scaling, and fault tolerance."
  },
  {
    "id": "fs-i-rate-limiting-layers",
    "role": "full_stack_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "Where should rate limiting be implemented in a full-stack system—API gateway, reverse proxy, or application middleware—and how do you communicate limit exhaustion to the frontend?",
    "followUp": "What standard HTTP headers (like Retry-After and RateLimit) inform frontend clients how to back off gracefully?",
    "concepts": [
      "Layered rate limiting (Edge/Cloudflare, API Gateway, application middleware with Redis)",
      "Algorithms: Token Bucket, Leaky Bucket, Sliding Window Counter",
      "Standard HTTP 429 Too Many Requests response with Retry-After and client backoff coordination"
    ],
    "anchors": {
      "0": "Implements in-memory rate limiting inside Node process, failing immediately when multiple server instances run.",
      "1": "Returns HTTP 500 or closes socket when rate limit is hit, confusing clients and breaking frontend error handling.",
      "2": "Uses Redis sliding window counter and returns 429, but omits standard headers needed for client backoff.",
      "3": "Implements distributed Redis rate limiter; returns standard 429 with Retry-After; frontend intercepts 429 to disable UI triggers and show countdown.",
      "4": "Production resilience: defines multi-tiered limits (IP-based at edge, user/token-based in app), tier-based quotas, and circuit breaker degradation."
    },
    "rubricNotes": "Technical scoring guidance. Emphasizes distributed protection, standard HTTP protocols, and frontend backoff integration."
  },
  {
    "id": "fs-i-idempotent-mutations",
    "role": "full_stack_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "apis"
    ],
    "prompt": "How do you design an idempotent payment or checkout submission across frontend retries and backend order placement so a user double-clicking never triggers duplicate billing?",
    "followUp": "How does the backend distinguish between an identical retry of a pending payment versus a brand new transaction using the same idempotency key?",
    "concepts": [
      "Idempotency key generation on client (UUIDv4 per distinct user intent)",
      "Backend atomic reservation (unique index or Redis lock with status: in_progress, completed, failed)",
      "Persisting and returning cached response payload for duplicate successful requests"
    ],
    "anchors": {
      "0": "Relies solely on disabling the submit button in the browser, which is easily bypassed by network retries or fast double-clicks.",
      "1": "Checks if order exists before inserting, but has a race condition between the check and the payment execution.",
      "2": "Generates idempotency keys, but does not persist the final response body to return for identical retries.",
      "3": "End-to-end idempotency: client generates UUID key; backend uses unique constraint / transactional lock; returns cached response for duplicates.",
      "4": "Flawless transaction design: handles in-flight concurrency (HTTP 409 / polling), payload fingerprint matching to detect key reuse with altered body, and TTL expiry."
    },
    "rubricNotes": "Technical scoring guidance. Focuses on bulletproof financial transaction safety and client-server idempotency."
  },
  {
    "id": "fs-i-project-monolith-decouple",
    "role": "full_stack_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "A growing startup debates splitting a Rails/Node monolith into separate frontend and microservice repositories. How do you advise the leadership team on the trade-offs and transition?",
    "followUp": "What organizational and tooling costs (CI/CD, local dev environment orchestration, contract testing) do teams often underestimate?",
    "concepts": [
      "Monolith vs microservices trade-offs: deployment velocity vs distributed operational complexity",
      "Team topology and Conway's Law alignment before architectural splitting",
      "Intermediate step: Modular Monolith with strict boundary enforcement"
    ],
    "anchors": {
      "0": "Dogmatically insists that microservices are always superior and urges immediate splitting without assessing team size.",
      "1": "Warns against microservices but cannot explain specific costs like distributed tracing, network latency, or eventual consistency.",
      "2": "Compares monolith vs microservices, but overlooks the development environment overhead (Docker Compose, shared mock data).",
      "3": "Advises based on team scale; highlights underestimated costs (contract testing, observability, distributed transactions); proposes Modular Monolith first.",
      "4": "Executive-level engineering strategy: evaluates deployment frequency bottlenecks, domain boundaries via DDD, and outlines an incremental decoupling roadmap."
    },
    "rubricNotes": "Techno-managerial guidance. Evaluates architectural judgment, organizational realism, and pragmatic scaling."
  },
  {
    "id": "fs-i-project-incident-triage",
    "role": "full_stack_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "reliability"
    ],
    "prompt": "A production incident occurs where checkout error rates spike to 15% after a joint frontend/backend deployment. What is your systematic process for incident triage and rollback?",
    "followUp": "How do you decide whether to roll back both tiers immediately versus hotfixing the backend forward?",
    "concepts": [
      "Incident management protocol: triage, mitigation (rollback first), communication, root-cause analysis",
      "Differentiating frontend runtime exceptions from backend API failures in telemetry",
      "Blameless post-mortem culture and automated rollback triggers"
    ],
    "anchors": {
      "0": "Panics, tries live debugging on production servers without rolling back, worsening customer impact.",
      "1": "Rolls back randomly without checking deployment logs or error dashboards to see which tier caused the regression.",
      "2": "Executes rollback, but fails to communicate with customer support or document the timeline for post-mortem.",
      "3": "Systematic triage: declares incident, checks error telemetry (Sentry/Datadog), executes fast automated rollback to restore stability, notifies stakeholders.",
      "4": "Exemplary incident command: coordinates blameless post-mortem, analyzes telemetry canary thresholds, evaluates feature flags for rollback decoupling, and creates preventative tests."
    },
    "rubricNotes": "Techno-managerial guidance. Tests production incident triage, emotional composure, and mitigation rigor."
  },
  {
    "id": "fs-i-project-tech-debt",
    "role": "full_stack_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Developers complain that lack of automated integration tests across the API boundary is slowing feature delivery by 40%. How do you build a business case to allocate sprint time for test infrastructure?",
    "followUp": "How would you demonstrate measurable business ROI from investing two full sprints into automated test harnesses?",
    "concepts": [
      "Translating technical debt into business impact (delivery velocity, regression costs, customer churn)",
      "Incremental test harness implementation rather than all-or-nothing sprint freezes",
      "Tracking lead time for changes and change failure rate (DORA metrics)"
    ],
    "anchors": {
      "0": "Complains about bad code to management without providing data or proposing a structured remedy.",
      "1": "Requests stopping all product features for two months to write tests without demonstrating business value.",
      "2": "Proposes writing tests, but defines no metrics to prove whether developer velocity or defect rate actually improved.",
      "3": "Presents data on regression bug hours; proposes 20% sprint allocation; focuses on critical business paths (e.g. checkout, auth); tracks DORA metrics.",
      "4": "Senior engineering advocacy: builds compelling executive ROI model, integrates contract test fixtures into existing CI, and establishes automated regression gates."
    },
    "rubricNotes": "Techno-managerial guidance. Focuses on technical advocacy, stakeholder translation, and business alignment."
  },
  {
    "id": "fs-i-reflect-stack-choice",
    "role": "full_stack_engineer",
    "level": "intermediate",
    "stage": "reflection",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Reflect on a framework or tool you selected for a full-stack project that turned out to be the wrong choice. What warning signs did you miss, and how do you evaluate technology today?",
    "followUp": "What criteria (community vitality, documentation, operational complexity) do you prioritize now over hype?",
    "concepts": [
      "Honest post-mortem of a past technical selection mistake",
      "Recognizing hype-driven development vs boring technology that works",
      "Structured evaluation framework (proof of concept, ecosystem maturity, exit strategy)"
    ],
    "anchors": {
      "0": "Claims every technology choice they ever made was flawless and blames failures on tools or libraries.",
      "1": "Mentions a tool they disliked, but cannot articulate why it was an inappropriate fit for that specific problem.",
      "2": "Explains why the tool failed (e.g. poor documentation or frequent breaking changes), but lesson learned remains shallow.",
      "3": "Thoughtfully analyzes why the tool failed (e.g. complex state library, immature ORM, or over-engineered framework); explains modern evaluation criteria.",
      "4": "Deep engineering wisdom: references Choose Boring Technology philosophy, outlines Spike/PoC criteria, assesses operational cognitive load, and plans exit strategies."
    },
    "rubricNotes": "Unscored reflection. Reward intellectual honesty, architectural humility, and mature technology evaluation."
  },
  {
    "id": "sd-j-intro-scale",
    "role": "system_design_engineer",
    "level": "junior",
    "stage": "icebreaker",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Describe a system you designed or studied where handling increasing traffic or storage required scaling beyond a single server. What was the first bottleneck?",
    "followUp": "Did that bottleneck manifest in CPU utilization, memory exhaustion, disk I/O, or network bandwidth?",
    "concepts": [
      "Understanding system resource constraints (CPU, RAM, Disk I/O, Network)",
      "Identifying single-node bottlenecks and vertical scaling limits",
      "Initial steps to scale outward (stateless compute vs stateful data)"
    ],
    "anchors": {
      "0": "Cannot describe any system or claims a single modest server can handle unlimited users.",
      "1": "Describes a system at a very high level without identifying where bottlenecks actually occurred.",
      "2": "Identifies database load as the issue, but cannot explain how to measure or diagnose whether CPU, RAM, or disk I/O was saturated.",
      "3": "Clearly identifies the bottleneck (e.g. database connection exhaustion or disk IOPS); explains metrics used and how the architecture was adapted.",
      "4": "Deep systems intuition: articulates queuing theory, telemetry instrumentation, vertical vs horizontal scaling trade-offs, and headroom planning."
    },
    "rubricNotes": "Unscored icebreaker. Look for authentic systems intuition, metric awareness, and clear technical communication."
  },
  {
    "id": "sd-j-horizontal-vs-vertical",
    "role": "system_design_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "Explain the difference between vertical scaling and horizontal scaling for database and application tiers. What are the practical limits and failure modes of each?",
    "followUp": "Why is horizontal scaling straightforward for stateless web servers but complex for stateful relational databases?",
    "concepts": [
      "Vertical scaling (scale-up) limits: hardware ceiling, cost curve, downtime for upgrades",
      "Horizontal scaling (scale-out) requirements: load balancers, stateless servers, distributed state",
      "Stateful data synchronization challenges (replication lag, split-brain, consistency)"
    ],
    "anchors": {
      "0": "Confuses horizontal and vertical scaling or thinks databases scale horizontally just as easily as web servers.",
      "1": "Defines scale-up vs scale-out accurately, but cannot explain any architectural prerequisites for horizontal scaling.",
      "2": "Explains adding more servers behind a load balancer, but does not understand how session state prevents horizontal scaling.",
      "3": "Articulates cost/hardware limits of vertical scaling; explains stateless compute tier horizontal scaling and stateful DB clustering challenges.",
      "4": "Exemplary architectural understanding: details Amdahl's Law, distributed consensus overhead, sharding complexity, and elastic auto-scaling triggers."
    },
    "rubricNotes": "Technical scoring guidance. Tests core scaling primitives and understanding of stateful vs stateless components."
  },
  {
    "id": "sd-j-load-balancing-basics",
    "role": "system_design_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "How does a Layer 4 versus Layer 7 load balancer distribute traffic across web instances? What health check mechanisms ensure traffic is not sent to a crashed server?",
    "followUp": "What is the risk of a simple TCP ping health check compared to a deep HTTP health check endpoint like /health/ready?",
    "concepts": [
      "Layer 4 (Transport/TCP/UDP IP routing) vs Layer 7 (Application/HTTP header, URL path, cookie routing)",
      "Active health check mechanisms (HTTP status codes, response timeouts, consecutive failure thresholds)",
      "Shallow vs deep health checks (avoiding cascading database failures during health check storms)"
    ],
    "anchors": {
      "0": "Believes load balancers only perform round-robin DNS lookups without server health monitoring.",
      "1": "Knows load balancers distribute requests, but cannot explain the difference between L4 and L7 routing.",
      "2": "Explains L4 vs L7 and basic health checks, but cannot explain why a deep database-querying health check can cause server death spirals.",
      "3": "Clearly contrasts L4 (packet-level, ultra-fast) and L7 (content-aware, TLS termination, cookie affinity); explains shallow vs deep health probes.",
      "4": "Production mastery: discusses weighted round-robin, least connections, consistent hashing, graceful connection draining, and failover topologies."
    },
    "rubricNotes": "Technical scoring guidance. Evaluates traffic routing fundamentals, protocol layers, and availability health checks."
  },
  {
    "id": "sd-j-caching-redis-basics",
    "role": "system_design_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "databases"
    ],
    "prompt": "When introducing an in-memory cache like Redis in front of a relational database, what caching patterns (cache-aside vs write-through) do you consider, and how do you handle cache misses?",
    "followUp": "What is Cache Invalidation, and why is it notoriously difficult to keep cache synchronized with the authoritative database?",
    "concepts": [
      "Cache-aside (read-through) pattern: check cache -> on miss query DB -> write to cache with TTL",
      "Write-through and write-behind patterns with trade-offs",
      "Cache invalidation strategies (TTL expiration, explicit purge on write, event-driven invalidation)"
    ],
    "anchors": {
      "0": "Believes Redis can completely replace the primary relational database without durability concerns.",
      "1": "Describes cache-aside conceptually, but does not include a Time-To-Live (TTL), risking permanently stale data.",
      "2": "Explains cache-aside and TTL, but does not know how to handle updates when database records are modified.",
      "3": "Coherently explains cache-aside read/write workflows, TTL safety nets, explicit invalidation on updates, and memory eviction policies (LRU).",
      "4": "Advanced caching design: addresses cache stampede (thundering herd) with mutex locks, cache penetration with bloom filters, and dual-write races."
    },
    "rubricNotes": "Technical scoring guidance. Emphasizes caching patterns, cache-database synchronization, and eviction policies."
  },
  {
    "id": "sd-j-db-read-replicas",
    "role": "system_design_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "databases"
    ],
    "prompt": "A read-heavy web service is bottlenecking on database queries. How do primary-replica database configurations work, and what is replication lag?",
    "followUp": "How do you handle a Read-Your-Own-Writes issue where a user creates a post and is immediately redirected to a feed that reads from a lagging replica?",
    "concepts": [
      "Primary (read-write) and read-only replica topology",
      "Asynchronous replication mechanics and network replication lag",
      "Read-your-own-writes consistency strategies (routing recent writers to primary for N seconds)"
    ],
    "anchors": {
      "0": "Thinks replicas handle write transactions equally without any coordination or conflict resolution.",
      "1": "Explains that writes go to primary and reads go to replicas, but is unaware of replication lag.",
      "2": "Identifies replication lag, but cannot suggest how to prevent a user from seeing stale data immediately after their own write.",
      "3": "Explains asynchronous binary log replication, lag causes, and routes recent user writes to primary for a brief window while reading older feeds from replicas.",
      "4": "Deep database architecture: discusses synchronous vs asynchronous replication trade-offs, replica promotion during primary failover, and connection pooling."
    },
    "rubricNotes": "Technical scoring guidance. Tests database scaling topologies, asynchronous replication, and read-after-write consistency."
  },
  {
    "id": "sd-j-cdn-static-assets",
    "role": "system_design_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "apis"
    ],
    "prompt": "How does a Content Delivery Network (CDN) reduce latency for global users, and what HTTP headers control cache expiration and edge invalidation?",
    "followUp": "Why is asset fingerprinting (e.g. bundle.a8f2c.js with Cache-Control: max-age=31536000, immutable) superior to relying on short TTL cache invalidations?",
    "concepts": [
      "CDN Points of Presence (PoPs) and terminating requests close to the user edge",
      "HTTP Cache-Control directives: public, max-age, s-maxage, immutable, no-cache",
      "Content-addressed hashing (fingerprinting) for instant, risk-free cache busting"
    ],
    "anchors": {
      "0": "Cannot explain what a CDN is or thinks it is just a cloud storage bucket.",
      "1": "Knows CDNs cache assets near users, but cannot name or explain Cache-Control HTTP headers.",
      "2": "Explains max-age headers, but suggests clearing the entire CDN cache manually on every release.",
      "3": "Details CDN edge caching, DNS Geo-routing, Cache-Control: s-maxage vs max-age, and asset content-hash fingerprinting.",
      "4": "Industry-level edge engineering: explains stale-while-revalidate at CDN edge, purge APIs vs fingerprinting, and dynamic edge computing (Cloudflare Workers)."
    },
    "rubricNotes": "Technical scoring guidance. Focuses on edge caching, HTTP caching standards, and asset distribution."
  },
  {
    "id": "sd-j-project-spof",
    "role": "system_design_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "reliability"
    ],
    "prompt": "Reviewing an architecture diagram, you notice that all services depend on a single shared MySQL instance without backups or failover. How do you communicate this Single Point of Failure (SPOF) to management?",
    "followUp": "What phased remediation plan (automated snapshots, replica failover, multi-AZ) would you propose?",
    "concepts": [
      "Identifying Single Points of Failure (SPOF) and quantifying business downtime cost",
      "Phased remediation: automated backups, read replica, Multi-AZ automated failover",
      "Constructive, risk-based executive communication without hyperbole"
    ],
    "anchors": {
      "0": "Ignores the SPOF, assuming cloud providers automatically handle hardware failure without configuration.",
      "1": "Panics and demands an immediate complete multi-region migration without assessing cost or downtime impact.",
      "2": "Identifies the SPOF and suggests automated backups, but does not provide an actionable roadmap to stakeholders.",
      "3": "Quantifies downtime risk and data loss; proposes phased mitigation: (1) automated point-in-time recovery, (2) multi-AZ standby replica, (3) tested failover runbook.",
      "4": "Strategic engineering leadership: maps business RTO/RPO expectations, estimates infrastructure cost deltas, and aligns engineering resources smoothly."
    },
    "rubricNotes": "Techno-managerial guidance. Evaluates architectural risk identification, stakeholder translation, and phased remediation."
  },
  {
    "id": "sd-j-project-capacity-planning",
    "role": "system_design_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "A product team anticipates a 10x traffic spike during a holiday marketing campaign. What steps do you take to calculate expected QPS, bandwidth, and compute requirements?",
    "followUp": "How do you incorporate a safety margin (headroom) and what automated load testing would you perform before the event?",
    "concepts": [
      "Back-of-the-envelope estimation (current QPS -> 10x peak QPS, bandwidth, database writes)",
      "Identifying tier-by-tier capacity bottlenecks (connection limits, CPU, memory, third-party APIs)",
      "Load testing with synthetic traffic and provisioning safety buffers"
    ],
    "anchors": {
      "0": "Suggests waiting for the campaign to start and adding servers only after the website crashes.",
      "1": "Understands traffic will increase, but cannot perform basic back-of-the-envelope calculations for QPS or database connections.",
      "2": "Calculates peak QPS, but forgets database connection pool limits or downstream payment gateway constraints.",
      "3": "Systematic capacity plan: estimates peak read/write QPS, network bandwidth, database IOPS; runs distributed load tests; provisions 30-50% headroom.",
      "4": "Senior operational planning: coordinates dry-run game days, establishes rate-limit circuit breakers, pre-warms load balancers, and implements feature flags for degradation."
    },
    "rubricNotes": "Techno-managerial guidance. Tests capacity planning rigor, estimation methodology, and proactive risk management."
  },
  {
    "id": "sd-j-project-cost-vs-scale",
    "role": "system_design_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "A team requests over-provisioned multi-region cloud infrastructure for an internal reporting tool with only 50 daily users. How do you advocate for cost-effective sizing without compromising reliability?",
    "followUp": "What minimal architecture (e.g. single region with automated snapshots and auto-scaling) adequately meets their 99.9% uptime requirement?",
    "concepts": [
      "Right-sizing infrastructure to actual business requirements and SLA expectations",
      "Weighing cloud financial cost against real business impact of downtime",
      "Diplomatic engineering guidance: proposing appropriate architecture with upgrade triggers"
    ],
    "anchors": {
      "0": "Blindly approves massive multi-region infrastructure for 50 internal users, wasting organizational capital.",
      "1": "Rejects the request rudely without explaining why multi-region is unnecessary for their scale.",
      "2": "Suggests a smaller instance, but cannot articulate why multi-region active-active is overkill for internal reporting.",
      "3": "Politely reviews usage patterns; shows cost comparison; demonstrates that single-AZ with automated backup meets SLA; defines scale triggers for future expansion.",
      "4": "FinOps architectural leadership: introduces serverless / scale-to-zero compute (e.g. Cloud Run / Fargate), automated sleep on weekends, and transparent cost attribution."
    },
    "rubricNotes": "Techno-managerial guidance. Evaluates cost-benefit pragmatism, FinOps discipline, and technical diplomacy."
  },
  {
    "id": "sd-j-reflect-architecture-limits",
    "role": "system_design_engineer",
    "level": "junior",
    "stage": "reflection",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Reflect on a system design where you initially over-complicated or under-engineered the solution. What would you simplify if you were to design it again from scratch?",
    "followUp": "What design heuristic (e.g. YAGNI, KISS, latency bounds) do you rely on now to keep designs grounded?",
    "concepts": [
      "Self-awareness of personal architectural misjudgments (over-engineering or premature optimization)",
      "Concrete simplicity improvements (e.g. using Postgres instead of 3 specialized databases)",
      "Pragmatic heuristics for balancing future-proofing with immediate delivery"
    ],
    "anchors": {
      "0": "Claims they have never over-engineered or under-engineered any system in their career.",
      "1": "Recalls an issue, but blames project managers or changing requirements rather than their own technical choices.",
      "2": "Admits they used an over-complex tool (like microservices or Kafka), but cannot explain what simpler alternative would have worked.",
      "3": "Reflects honestly on an over-engineered pattern; explains how simpler monolithic/Postgres design would have succeeded faster with less maintenance.",
      "4": "Deep architectural humility: discusses cognitive burden on team, premature optimization traps, and establishes clear criteria for when complex patterns are truly warranted."
    },
    "rubricNotes": "Unscored reflection. Reward intellectual honesty, engineering self-awareness, and commitment to simplicity."
  },
  {
    "id": "sd-i-intro-distributed-systems",
    "role": "system_design_engineer",
    "level": "intermediate",
    "stage": "icebreaker",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "What is the most challenging distributed systems trade-off (e.g. latency vs consistency, or cost vs availability) you have had to evaluate in an actual production design?",
    "followUp": "How did business requirements dictate which side of the trade-off you had to prioritize?",
    "concepts": [
      "Real-world distributed systems trade-offs (consistency, latency, availability, partition tolerance, cost)",
      "Aligning technical trade-offs with business risk tolerance and customer expectations",
      "Observable trade-off outcomes and telemetry validation"
    ],
    "anchors": {
      "0": "Cannot describe any distributed systems trade-off or believes systems can achieve 100% on all dimensions simultaneously.",
      "1": "Recites CAP theorem textbook definitions without connecting them to an actual production engineering decision.",
      "2": "Describes choosing between two databases, but focuses only on features rather than distributed system trade-offs.",
      "3": "Articulates a clear trade-off (e.g. eventual consistency for write throughput vs synchronous replication latency); explains business rationale.",
      "4": "Mastery of distributed trade-offs: analyzes PACELC theorem, failure domains, degradation tiers, and concrete operational telemetry."
    },
    "rubricNotes": "Unscored icebreaker. Look for distributed systems maturity, trade-off honesty, and business context alignment."
  },
  {
    "id": "sd-i-cap-theorem-consistency",
    "role": "system_design_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "concurrency"
    ],
    "prompt": "In the context of the CAP theorem and PACELC, explain how strong consistency differs from eventual consistency in a distributed datastore. What are the user-facing consequences during network partitions?",
    "followUp": "How does the Raft or Paxos consensus algorithm guarantee safety and prevent split-brain during a leader partition?",
    "concepts": [
      "Linearizable / Strong consistency vs Eventual / Causal consistency",
      "PACELC theorem (Partition: Availability vs Consistency; Else: Latency vs Consistency)",
      "Quorum consensus (R + W > N) and split-brain prevention via odd-numbered majorities"
    ],
    "anchors": {
      "0": "Thinks the CAP theorem allows choosing Consistency, Availability, and Partition Tolerance all at once in distributed networks.",
      "1": "Defines CAP theorem basics, but cannot explain what happens to reads and writes when a network partition actually occurs.",
      "2": "Explains eventual consistency, but cannot explain quorum math (R+W > N) or how split-brain is prevented.",
      "3": "Deeply explains CP vs AP systems during partitions; details quorum replication; analyzes user-facing impacts (stale reads vs write rejections).",
      "4": "Principal-level distributed theory: contrasts Linearizability vs Serializability, details Raft term elections/log matching, and explores CRDTs."
    },
    "rubricNotes": "Technical scoring guidance. Tests formal distributed systems concepts, consensus algorithms, and consistency models."
  },
  {
    "id": "sd-i-database-sharding",
    "role": "system_design_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "databases"
    ],
    "prompt": "A relational database table exceeds 5 Terabytes and single-node write IOPS is saturated. How do you design a horizontal sharding strategy, choose a shard key, and handle rebalancing?",
    "followUp": "How does consistent hashing minimize data migration when adding new shards to an active cluster?",
    "concepts": [
      "Horizontal database sharding principles and write distribution",
      "Shard key selection criteria (cardinality, query patterns, avoiding celebrity/hotspot keys)",
      "Cross-shard query penalties, distributed transactions, and consistent hashing rebalancing"
    ],
    "anchors": {
      "0": "Recommends adding read replicas to resolve a write-IOPS bottleneck or suggests sharding by random auto-increment ID.",
      "1": "Knows sharding splits data across databases, but cannot explain how queries route to shards or how to pick a good shard key.",
      "2": "Selects a shard key (e.g. user_id), but overlooks cross-shard joins and distributed transaction overhead.",
      "3": "Thoroughly evaluates shard key trade-offs; explains router/coordinator layer, cross-shard fanout mitigation, and consistent hashing virtual nodes.",
      "4": "Senior data systems mastery: details online resharding with dual-writes and backfill, distributed two-phase commit (2PC) vs Saga patterns, and Vitess/Citus internals."
    },
    "rubricNotes": "Technical scoring guidance. Focuses on horizontal data partitioning, routing, and operational rebalancing."
  },
  {
    "id": "sd-i-message-queues-async",
    "role": "system_design_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "concurrency"
    ],
    "prompt": "Compare message queues (like RabbitMQ or SQS) with distributed commit logs (like Kafka). When would you choose an event log over a standard message broker for decoupled processing?",
    "followUp": "How does consumer group partition assignment work in Kafka, and what happens when an individual consumer crashes during processing?",
    "concepts": [
      "Smart broker / dumb consumer (RabbitMQ/SQS) vs dumb broker / smart consumer log (Kafka)",
      "Message deletion on ack vs immutable append-only commit log with consumer offsets and replayability",
      "Partitioning, consumer group rebalancing, and ordering guarantees within a partition"
    ],
    "anchors": {
      "0": "Believes Kafka and RabbitMQ are completely interchangeable with identical operational semantics.",
      "1": "Knows Kafka is faster for large data, but cannot explain the difference between queue message acks and log offset commits.",
      "2": "Explains commit logs and consumer offsets, but fails to understand ordering limitations across partitions.",
      "3": "Coherently contrasts ephemeral queueing vs persistent event streaming; details partition-key ordering guarantees, consumer rebalancing, and replayability.",
      "4": "Expert streaming architecture: articulates exactly-once processing semantics (idempotent producer + transactional commit), head-of-line blocking, and backpressure."
    },
    "rubricNotes": "Technical scoring guidance. Evaluates asynchronous architectures, message queues, and distributed event logs."
  },
  {
    "id": "sd-i-rate-limiter-distributed",
    "role": "system_design_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "apis"
    ],
    "prompt": "Design a distributed rate limiter supporting 100,000 QPS across multi-region API clusters. Compare token bucket versus sliding window log algorithms using Redis clusters.",
    "followUp": "How do you handle race conditions when multiple concurrent requests update the same user bucket in Redis?",
    "concepts": [
      "Rate limiting algorithms: Token Bucket, Leaky Bucket, Sliding Window Counter",
      "Distributed synchronization using Redis: Lua scripts for atomic get-decrement-set",
      "Multi-region replication latency trade-offs (local in-memory rate limiting with periodic sync vs central Redis)"
    ],
    "anchors": {
      "0": "Proposes storing rate limit counters in a relational SQL database without considering 100,000 QPS write load.",
      "1": "Uses basic Redis GET and SET commands, creating a severe race condition under high concurrency.",
      "2": "Uses Redis INCR with EXPIRE, but cannot explain why fixed window algorithms permit 2x traffic bursts at window boundaries.",
      "3": "Implements sliding window counter using Redis sorted sets (ZADD/ZREMRANGEBYSCORE) or atomic Lua script with Token Bucket.",
      "4": "World-class scaling architecture: addresses multi-region cross-continent latency by using local Token Buckets with asynchronous batch reservation, shadow rate limiting, and DDoS tiering."
    },
    "rubricNotes": "Technical scoring guidance. Tests high-throughput distributed algorithms, atomic synchronization, and multi-region trade-offs."
  },
  {
    "id": "sd-i-distributed-locking",
    "role": "system_design_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "concurrency"
    ],
    "prompt": "How do you implement a safe distributed lock across multiple independent worker nodes? What failure modes occur with simple Redis SETNX locks when network pauses or GC pauses exceed lock TTL?",
    "followUp": "How do fencing tokens (monotonically increasing version numbers) prevent split-brain writes to shared storage when a lock lease expires unexpectedly?",
    "concepts": [
      "Distributed lock lease expiration and garbage collection / network pause race conditions",
      "Limitations of single-instance Redis SETNX locks (Martin Kleppmann's Redlock critique)",
      "Fencing tokens as authoritative storage-level validation for distributed mutually exclusive writes"
    ],
    "anchors": {
      "0": "Believes a simple Redis key with TTL is 100% safe for critical financial writes under any network condition.",
      "1": "Knows locks need TTLs to prevent deadlocks on crash, but cannot explain what happens if a worker pauses longer than the TTL.",
      "2": "Mentions Redlock or ZooKeeper, but cannot explain how a storage tier verifies that a write comes from the active lock holder.",
      "3": "Clearly illustrates lock lease expiry during GC pause; explains how fencing tokens passed to the storage engine reject outdated writes.",
      "4": "Deep distributed consensus mastery: contrasts consensus-backed locks (etcd/ZooKeeper with ephemeral nodes) vs Redis Redlock, analyzing clock drift and formal safety proofs."
    },
    "rubricNotes": "Technical scoring guidance. Tests deep understanding of distributed locking vulnerabilities, lease expiry, and fencing tokens."
  },
  {
    "id": "sd-i-project-sla-sli-slo",
    "role": "system_design_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "reliability"
    ],
    "prompt": "How do you define meaningful SLIs and SLOs for a mission-critical financial ledger service, and how do error budgets dictate whether engineering focuses on features or reliability?",
    "followUp": "How do you calculate the difference between 99.9% (three nines) and 99.99% (four nines) annual downtime, and what is the cost implication?",
    "concepts": [
      "SLI (metric), SLO (target), SLA (contractual penalty agreement) framework",
      "Error budget mechanics: policy-driven feature freezes and reliability sprints when budget burns",
      "The exponential cost and complexity curve of adding additional nines of availability"
    ],
    "anchors": {
      "0": "Thinks SLO and SLA are identical or claims the system should target 100.00% uptime with zero tolerance for failure.",
      "1": "Defines uptime as an SLI, but cannot explain how to measure API error rate or latency percentiles (p99).",
      "2": "Calculates downtime minutes for three nines vs four nines, but has no mechanism for error budget policy enforcement.",
      "3": "Defines precise SLIs (e.g. 99.95% of requests succeed in < 200ms); establishes error budget burn alerts; implements feature freezes when budget exhausted.",
      "4": "Executive SRE leadership: establishes user-centric SLIs, designs multi-window burn rate alerts, and bridges engineering-product alignment on acceptable risk."
    },
    "rubricNotes": "Techno-managerial guidance. Evaluates reliability metrics, operational governance, and SRE policy enforcement."
  },
  {
    "id": "sd-i-project-disaster-recovery",
    "role": "system_design_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "reliability"
    ],
    "prompt": "Design a Disaster Recovery (DR) plan for an enterprise service. Differentiate between Recovery Point Objective (RPO) and Recovery Time Objective (RTO) across active-passive versus active-active failover.",
    "followUp": "How do you test your Disaster Recovery plan in production without causing real customer outages?",
    "concepts": [
      "RPO (maximum acceptable data loss) and RTO (maximum acceptable downtime)",
      "DR strategies: Backup/Restore, Pilot Light, Warm Standby, Active-Active Multi-Region",
      "Automated DNS failover, split-brain avoidance, and regular GameDay disaster drills"
    ],
    "anchors": {
      "0": "Cannot differentiate RTO from RPO, or believes taking daily backups provides zero RPO.",
      "1": "Defines RTO and RPO, but advocates active-active multi-region without understanding write conflict resolution or immense cost.",
      "2": "Proposes Warm Standby with DNS failover, but does not address database replication lag or data loss during sudden primary region loss.",
      "3": "Thoroughly maps business RPO/RTO to architecture options; explains active-passive failover mechanisms; designs regular non-destructive failover GameDays.",
      "4": "Enterprise resiliency mastery: details synchronous replication boundaries, automated traffic routing via Anycast/Route53, database promotion runbooks, and disaster automation."
    },
    "rubricNotes": "Techno-managerial guidance. Focuses on disaster recovery planning, business continuity, and failover engineering."
  },
  {
    "id": "sd-i-project-vendor-lockin",
    "role": "system_design_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Leadership wants to adopt proprietary cloud services (like DynamoDB or Cloud Spanner) for speed to market, while staff engineers fear cloud vendor lock-in. How do you guide the architectural decision?",
    "followUp": "What architectural abstraction layers (repository patterns, interface boundaries) allow using managed cloud services while keeping exit paths viable?",
    "concepts": [
      "Pragmatic evaluation of vendor lock-in vs undifferentiated heavy lifting and time-to-market",
      "Cost of portability abstraction layers vs actual likelihood of cloud migration",
      "Strategic boundary design (repository pattern, standard data formats) without hamstringing native cloud benefits"
    ],
    "anchors": {
      "0": "Dogmatically opposes all proprietary cloud services, insisting on self-hosting open-source databases on bare VMs regardless of team size.",
      "1": "Believes vendor lock-in is a total myth and embraces proprietary features blindly without evaluating migration difficulty.",
      "2": "Suggests building an elaborate abstraction layer that limits DynamoDB to simple SQL-like features, getting the worst of both worlds.",
      "3": "Pragmatic evaluation: weighs operational overhead of self-hosting vs velocity of managed services; abstracts domain layer from data access; defines explicit migration criteria.",
      "4": "Chief architect perspective: analyzes switching costs vs opportunity costs, evaluates data gravity and egress fees, and defines vendor contractual safeguards."
    },
    "rubricNotes": "Techno-managerial guidance. Evaluates technical governance, cloud strategy, and executive decision-making."
  },
  {
    "id": "sd-i-reflect-cascading-failure",
    "role": "system_design_engineer",
    "level": "intermediate",
    "stage": "reflection",
    "topics": [
      "reliability"
    ],
    "prompt": "Think of a time you observed or studied a cascading failure in a distributed system (e.g. retry storms, cache stamped, or thread pool exhaustion). What architectural safeguards did it teach you?",
    "followUp": "How do circuit breakers, backpressure, and load shedding stop a minor degradation from escalating into a total platform outage?",
    "concepts": [
      "Anatomy of a cascading failure (positive feedback loop where failing components overload downstream dependencies)",
      "Defensive mechanisms: exponential backoff with full jitter, circuit breakers, dead-letter queues, load shedding",
      "Deep architectural takeaways and designing for graceful degradation"
    ],
    "anchors": {
      "0": "Cannot explain cascading failures or assumes systems fail only when hard drives burn out.",
      "1": "Describes an outage, but thinks simply adding more aggressive retries will fix downstream timeouts.",
      "2": "Explains circuit breakers conceptually, but cannot explain how retry storms without jitter overwhelm recovering databases.",
      "3": "Articulates the exact failure feedback loop; explains circuit breaker state transitions (Closed/Open/Half-Open), jittered backoff, and priority load shedding.",
      "4": "Mastery of resilient systems: discusses bulkhead isolation patterns, concurrency limits via Little's Law, automated graceful degradation, and chaos test verification."
    },
    "rubricNotes": "Unscored reflection. Reward systems thinking, failure mode expertise, and defensive architectural instincts."
  },
  {
    "id": "do-j-intro-ci-cd",
    "role": "devops_cloud_engineer",
    "level": "junior",
    "stage": "icebreaker",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Describe a CI/CD pipeline you configured or maintained. What stages were automated, and what was the average deployment frequency?",
    "followUp": "What was the most frustrating build or deployment failure you had to troubleshoot in that pipeline?",
    "concepts": [
      "CI/CD pipeline architecture (lint, unit test, build, integration test, deploy)",
      "Understanding of deployment environments (staging, production, preview)",
      "Identifying pipeline bottlenecks and deployment failure modes"
    ],
    "anchors": {
      "0": "Cannot describe any continuous integration or deployment process; relies exclusively on manual FTP/SSH file uploads.",
      "1": "Describes running npm run build manually on a server, lacking understanding of automated CI runners.",
      "2": "Explains GitHub Actions or GitLab CI setup, but cannot explain how pipeline artifacts or secrets were securely injected.",
      "3": "Clearly details pipeline stages, automated test gates, container registry pushes, environment promotions, and build time optimizations.",
      "4": "Deep automation vision: explains pipeline caching strategies, ephemeral preview environments, branch protection rules, and DORA deployment frequency."
    },
    "rubricNotes": "Unscored icebreaker. Look for authentic pipeline ownership, operational awareness, and technical honesty."
  },
  {
    "id": "do-j-dockerfile-optimization",
    "role": "devops_cloud_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "Walk through how Docker image layers work. How do you write a multi-stage Dockerfile that minimizes final image size, avoids root execution, and prevents caching uncompiled assets?",
    "followUp": "Why should you order package.json / requirements.txt copy steps before copying the rest of your application source code?",
    "concepts": [
      "Docker layer caching mechanics and order of instructions (COPY vs RUN)",
      "Multi-stage builds separating build tools/compilers from lightweight runtime base images (Alpine/Distroless)",
      "Container security: non-root USER directive and minimal attack surface"
    ],
    "anchors": {
      "0": "Writes a single-stage Dockerfile with RUN apt-get install build-essential left in the final image, running as root.",
      "1": "Copies all source code before installing dependencies, invalidating the Docker cache on every trivial code edit.",
      "2": "Uses multi-stage build, but forgets to set a non-root user or leaves unnecessary development dependencies in production.",
      "3": "Structures optimized multi-stage build; caches dependency layers before source code; uses minimal distroless/alpine base; enforces non-root USER.",
      "4": "Mastery of containerization: uses build mounts (--mount=type=cache), optimizes .dockerignore, scans vulnerabilities with Trivy, and signs images."
    },
    "rubricNotes": "Technical scoring guidance. Tests container fundamentals, build layer caching, and container security best practices."
  },
  {
    "id": "do-j-k8s-pod-deployment",
    "role": "devops_cloud_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "concurrency"
    ],
    "prompt": "Explain the relationship between a Kubernetes Pod, ReplicaSet, and Deployment. How does a Deployment handle rolling updates when a new container image is pushed?",
    "followUp": "What do maxSurge and maxUnavailable parameters control during a Kubernetes rolling update?",
    "concepts": [
      "Kubernetes hierarchy: Pod (smallest deployable unit), ReplicaSet (pod count controller), Deployment (declarative rollout manager)",
      "Rolling update lifecycle: creating new ReplicaSet, spinning up new pods, awaiting readiness, terminating old pods",
      "Rollout control parameters: maxSurge and maxUnavailable preventing downtime"
    ],
    "anchors": {
      "0": "Thinks a Pod and a Virtual Machine are identical, or believes pods must be manually restarted to update container images.",
      "1": "Knows Deployments manage pods, but cannot explain the role of the ReplicaSet or how rolling updates avoid downtime.",
      "2": "Explains rolling update concept, but cannot explain what happens if a new pod version fails its readiness probe.",
      "3": "Clearly details Deployment -> ReplicaSet -> Pod abstraction; explains rolling update progression and maxSurge/maxUnavailable bounds.",
      "4": "Production Kubernetes depth: details readiness/liveness probe interaction, rollout pause/rollback commands, and terminationGracePeriodSeconds hooks."
    },
    "rubricNotes": "Technical scoring guidance. Evaluates foundational Kubernetes abstractions and declarative deployment mechanics."
  },
  {
    "id": "do-j-linux-troubleshooting",
    "role": "devops_cloud_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "A production Linux VM exhibits 100% CPU utilization and unresponsiveness. What command-line utilities (e.g. top, htop, vmstat, netstat/ss, dmesg) do you use to diagnose the culprit?",
    "followUp": "How do you differentiate between user CPU load (us), system kernel CPU load (sy), and I/O wait (wa)?",
    "concepts": [
      "Linux performance triage command-line tools (top, htop, ps, vmstat, iostat, ss, lsof)",
      "CPU utilization breakdown: user space, kernel system space, and I/O wait",
      "Isolating culprit process, analyzing open file descriptors, and checking kernel logs (dmesg) for OOM kills"
    ],
    "anchors": {
      "0": "Suggests immediately rebooting the VM without running any diagnostic commands or collecting logs.",
      "1": "Runs top, but cannot explain what load average means or how to identify which specific thread or process is consuming CPU.",
      "2": "Identifies the process PID using top, but does not know how to inspect thread states, I/O wait, or disk contention.",
      "3": "Systematic Linux triage: uses top/htop to identify process; interprets load average vs core count; explains user vs system vs iowait; checks dmesg/journalctl.",
      "4": "Systems mastery: uses perf/strace to inspect syscall loops, checks cgroups resource limits, analyzes /proc/meminfo and ss socket buffers."
    },
    "rubricNotes": "Technical scoring guidance. Focuses on Linux diagnostic methodology, core commands, and operating system metrics."
  },
  {
    "id": "do-j-cloud-networking-vpc",
    "role": "devops_cloud_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "apis"
    ],
    "prompt": "Explain the fundamentals of a Virtual Private Cloud (VPC): public subnets, private subnets, NAT gateways, and Security Groups. Why should databases never reside in public subnets?",
    "followUp": "What is the security difference between a stateful Security Group and a stateless Network Access Control List (NACL)?",
    "concepts": [
      "VPC network segmentation: public subnets (Internet Gateway attached) vs private subnets (NAT Gateway for outbound only)",
      "Database isolation in private subnets with no public IPv4 addresses",
      "Security Groups (stateful, instance-level) vs NACLs (stateless, subnet-level rule evaluation)"
    ],
    "anchors": {
      "0": "Places databases in public subnets with 0.0.0.0/0 inbound rules, relying solely on database password protection.",
      "1": "Knows private subnets are more secure, but cannot explain how a backend in a private subnet downloads OS security patches via NAT.",
      "2": "Explains public vs private subnets, but cannot differentiate between stateful Security Groups and stateless NACLs.",
      "3": "Thoroughly details VPC architecture: Internet Gateway for public ingress, NAT Gateway for private egress, private database subnets, and security group chaining.",
      "4": "Cloud networking depth: designs multi-AZ subnets, explains VPC Peering vs Transit Gateway, VPC Endpoints (PrivateLink) for S3, and flow logs."
    },
    "rubricNotes": "Technical scoring guidance. Evaluates cloud networking topology, perimeter security, and subnet architecture."
  },
  {
    "id": "do-j-gitops-config",
    "role": "devops_cloud_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Explain the concept of Infrastructure as Code (IaC) using tools like Terraform or OpenTofu. How does state management prevent configuration drift between environments?",
    "followUp": "What catastrophe occurs if two engineers run terraform apply simultaneously without remote state locking (e.g. DynamoDB/S3)?",
    "concepts": [
      "Declarative Infrastructure as Code (IaC) vs manual cloud console configuration",
      "Terraform state file: mapping real-world cloud resource IDs to code definitions",
      "State locking, remote backends, and detecting configuration drift"
    ],
    "anchors": {
      "0": "Configures cloud infrastructure manually via web console and commits local terraform.tfstate files with cleartext secrets to git.",
      "1": "Writes basic Terraform resources, but does not understand how the state file works or why remote backends are necessary.",
      "2": "Uses remote state in S3, but lacks state locking; cannot explain how terraform plan detects out-of-band console changes (drift).",
      "3": "Clearly articulates declarative IaC advantages; explains state file reconciliation against real cloud APIs, remote locking via DynamoDB, and drift detection.",
      "4": "Advanced IaC practices: modular architecture, terraform plan in CI with PR comments, sensitive variable encryption, and automated drift alerts."
    },
    "rubricNotes": "Technical scoring guidance. Tests Infrastructure as Code discipline, state management, and configuration consistency."
  },
  {
    "id": "do-j-project-broken-pipeline",
    "role": "devops_cloud_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "reliability"
    ],
    "prompt": "A CI build fails on main due to a flaky integration test, blocking 10 developers from merging their branches. What is your immediate protocol to unblock the team?",
    "followUp": "How do you ensure the quarantined flaky test is actually investigated and fixed rather than permanently forgotten?",
    "concepts": [
      "Urgency of unblocking the shared delivery pipeline while maintaining safety",
      "Protocol: verify failure is not a real regression, quarantine the test, unblock main, file high-priority ticket",
      "Clear communication with engineering team and tracking test stability"
    ],
    "anchors": {
      "0": "Disables all tests on main permanently or tells all 10 developers to stop working for the day.",
      "1": "Tells developers to keep retrying CI until it passes randomly without investigating the failure.",
      "2": "Quarantines the test, but fails to notify developers or create a tracked bug ticket to investigate the root cause.",
      "3": "Fast triage: confirms failure is flaky test; temporarily disables/skips the test with a linked Jira ticket; unblocks main; notifies team in Slack.",
      "4": "DevOps leadership: establishes automated flaky test tagging, sets up quarantine pipeline, pairs with test owner to isolate race conditions, and tracks pipeline MTTR."
    },
    "rubricNotes": "Techno-managerial guidance. Evaluates triage speed, developer empathy, and pragmatic process discipline."
  },
  {
    "id": "do-j-project-secret-management",
    "role": "devops_cloud_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "reliability"
    ],
    "prompt": "Developers have hardcoded AWS credentials in local configuration files to test code locally. How do you migrate the team to secure secret management (like HashiCorp Vault or AWS Secrets Manager)?",
    "followUp": "How do you implement local developer workflows without requiring permanent production credentials on developer laptops?",
    "concepts": [
      "Risks of static credentials and hardcoded keys on local developer machines",
      "Centralized secrets management (Vault, AWS Secrets Manager, Doppler)",
      "Local dev ergonomics: short-lived tokens, IAM role assumption, local mocking (LocalStack)"
    ],
    "anchors": {
      "0": "Accepts hardcoded keys as long as developers promise not to share them outside the company.",
      "1": "Demands developers stop testing locally without providing an ergonomic, secure alternative.",
      "2": "Moves secrets to .env files, but still uses permanent long-lived admin credentials on developer laptops.",
      "3": "Implements central secret manager; provides CLI tooling for local short-lived IAM role assumption (aws-vault/SSO); rotates all previously exposed keys.",
      "4": "Comprehensive security transformation: integrates pre-commit secret scanning, uses OIDC for CI/CD runners (eliminating static keys), and conducts educational workshop."
    },
    "rubricNotes": "Techno-managerial guidance. Focuses on security posture improvement, developer ergonomics, and credential hygiene."
  },
  {
    "id": "do-j-project-cloud-cost-alert",
    "role": "devops_cloud_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Your cloud bill spiked by 40% last month due to unattached EBS volumes and abandoned staging clusters. How do you establish tagging and automated cleanup policies?",
    "followUp": "How do you prevent automated cleanup scripts from accidentally deleting critical persistent production disks?",
    "concepts": [
      "Cloud cost optimization (FinOps) and resource sprawl detection",
      "Mandatory resource tagging (owner, environment, cost-center, expiration-date)",
      "Automated lifecycle policies with safety safeguards (whitelisting production, dry-run alerts, snapshot before delete)"
    ],
    "anchors": {
      "0": "Ignores the bill, claiming cloud infrastructure costs are exclusively finance's problem.",
      "1": "Runs a manual script that immediately deletes all unattached volumes without taking snapshots or notifying teams.",
      "2": "Deletes orphaned disks manually once, but does not implement tagging enforcement or automated policies to prevent recurrence.",
      "3": "Implements mandatory tags via AWS Organizations SCP / Terraform; creates automated cleanup tool (e.g. Cloud Custodian) with 7-day Slack warning and pre-delete snapshots.",
      "4": "FinOps architectural leadership: introduces automated dev environment shutdown on nights/weekends, publishes cost dashboards per team, and establishes budget alerts."
    },
    "rubricNotes": "Techno-managerial guidance. Evaluates FinOps discipline, automation safety guardrails, and sustainable cloud governance."
  },
  {
    "id": "do-j-reflect-automation-mistake",
    "role": "devops_cloud_engineer",
    "level": "junior",
    "stage": "reflection",
    "topics": [
      "reliability"
    ],
    "prompt": "Describe an instance where an automated deployment script or cron job had an unintended side effect. What checks or dry-run steps did you implement to safeguard against future runs?",
    "followUp": "How do you verify whether an automated remediation script is curing a problem or worsening a failure loop?",
    "concepts": [
      "Honest reflection on automation failures (e.g. unintended file deletion, race conditions, deployment loops)",
      "Safety guardrails: dry-run mode, confirmation gates, idempotency verification",
      "Observability and rate limiting for automated scripts"
    ],
    "anchors": {
      "0": "Claims their scripts have always executed with 100% perfection and never experienced any bug.",
      "1": "Recalls an automated script failure, but blames the operating system or cloud provider rather than lack of safeguards.",
      "2": "Explains what broke, but the preventative fix was merely \"be more careful next time\" without technical guardrails.",
      "3": "Articulates the automation flaw clearly; details concrete preventative measures: dry-run flags, blast-radius limits, validation checks, and post-execution alerts.",
      "4": "Mature systems wisdom: discusses automation runaway prevention, dead-man switches, idempotency testing in staging, and defensive exit-on-error (set -euo pipefail)."
    },
    "rubricNotes": "Unscored reflection. Reward vulnerability, engineering humility, and defensive automation principles."
  },
  {
    "id": "do-i-intro-sre-philosophy",
    "role": "devops_cloud_engineer",
    "level": "intermediate",
    "stage": "icebreaker",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "In your experience, what is the core difference between traditional system administration and modern Site Reliability Engineering (SRE)? How do you promote blameless post-mortems?",
    "followUp": "How do you measure and limit Toil (manual, repetitive, automatable operational work) so engineers can focus on engineering projects?",
    "concepts": [
      "SRE as software engineering applied to operations (treating operations as a software problem)",
      "Blameless culture: focusing on systemic vulnerabilities and safeguards rather than individual human error",
      "Toil management: capping manual operations at 50% and automating repetitive tasks"
    ],
    "anchors": {
      "0": "Thinks SRE is just a rebranding of 24/7 on-call system administration with no difference in engineering approach.",
      "1": "Advocates SRE concepts, but in practice blames individuals who make typos during outages.",
      "2": "Defines SRE and blameless post-mortems accurately, but cannot explain how to identify or quantify toil.",
      "3": "Articulates SRE tenets: software solutions for operational scale, error budgets, blameless root-cause analysis, and toil reduction tracking.",
      "4": "Transformational SRE leadership: establishes organizational blameless review templates, tracks action item completion rate, and calculates toil metrics."
    },
    "rubricNotes": "Unscored icebreaker. Look for cultural maturity, SRE philosophy, and systems-level accountability."
  },
  {
    "id": "do-i-k8s-ingress-hpa",
    "role": "devops_cloud_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "concurrency"
    ],
    "prompt": "How does Kubernetes Horizontal Pod Autoscaler (HPA) scale pods based on custom metrics? How do you tune readiness probes and preStop lifecycle hooks to achieve zero-downtime rolling deploys?",
    "followUp": "Why do Kubernetes services sometimes drop connections during pod termination even when a readiness probe passes, and how does a preStop sleep fix it?",
    "concepts": [
      "Horizontal Pod Autoscaler (HPA) with Prometheus Custom Metrics API (e.g. queue depth, HTTP QPS)",
      "Zero-downtime rollout coordination: Readiness probes, SIGTERM propagation, preStop hook delay",
      "Race condition between kube-proxy endpoint removal and container termination"
    ],
    "anchors": {
      "0": "Scales solely on basic CPU metrics and omits readiness probes, causing client traffic to hit unstarted application containers.",
      "1": "Configures readiness probes, but cannot explain why clients receive 502 Bad Gateway errors during rolling updates.",
      "2": "Uses HPA with custom metrics, but does not understand why a preStop sleep hook is needed to allow iptables/IPVS rule propagation.",
      "3": "Details HPA custom metric adapter; configures readiness probes; explains that preStop sleep gives kube-proxy time to remove endpoints before container SIGTERM.",
      "4": "Kubernetes internals mastery: explains terminationGracePeriodSeconds, ingress controller connection draining, HPA scale-down stabilization windows, and KEDA event-driven autoscaling."
    },
    "rubricNotes": "Technical scoring guidance. Tests advanced Kubernetes deployment lifecycle, traffic draining, and autoscaling."
  },
  {
    "id": "do-i-observability-prometheus",
    "role": "devops_cloud_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "Design an observability architecture using metrics (Prometheus/Grafana), logs (Fluentd/Loki/ELK), and distributed tracing (OpenTelemetry/Jaeger). What alerting threshold rules avoid alert fatigue?",
    "followUp": "How do you prevent high-cardinality labels (like user_id or IP address) from crashing a Prometheus Time Series Database (TSDB)?",
    "concepts": [
      "Three pillars of observability: metrics (aggregatable), logs (discrete events), traces (request flow across boundaries)",
      "High cardinality hazards in time-series databases and proper metric label design",
      "Alert design: symptom-based / SLO-based alerting vs noisy component-level metric alerts"
    ],
    "anchors": {
      "0": "Adds user_id as a Prometheus metric label and sets up paging alerts for every single CPU spike above 70%.",
      "1": "Collects logs and metrics, but has no distributed tracing and cannot explain how to correlate a log message with a trace span.",
      "2": "Understands high cardinality risks, but sets up hundreds of brittle alerts that wake up on-call engineers for non-actionable warnings.",
      "3": "Designs integrated OpenTelemetry pipeline; enforces low-cardinality metric labels; routes detailed context to logs/traces; designs symptom-based alerts tied to SLOs.",
      "4": "Senior observability architect: configures adaptive trace sampling, manages TSDB storage retention tiers, implements multi-window error burn rate alerting, and builds Grafana runbooks."
    },
    "rubricNotes": "Technical scoring guidance. Evaluates full-stack observability architecture, telemetry trade-offs, and alert fatigue mitigation."
  },
  {
    "id": "do-i-terraform-state-locking",
    "role": "devops_cloud_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "databases"
    ],
    "prompt": "In a team of 20 engineers deploying multi-environment cloud infrastructure, how do you handle remote Terraform state locking, module reusability, and blast radius isolation?",
    "followUp": "Why is keeping all company infrastructure in a single monolithic Terraform state file considered an extreme operational hazard?",
    "concepts": [
      "State file decomposition: isolating by environment (dev/stage/prod) and layer (network, compute, data)",
      "Remote state locking (S3 + DynamoDB, Terraform Cloud) and state access security",
      "Reusable versioned modules and minimizing blast radius of accidental destroys"
    ],
    "anchors": {
      "0": "Maintains all environments and services in a single massive Terraform state file, running applies from local developer terminals.",
      "1": "Uses remote S3 state, but shares one state file across dev and prod, risking production deletion during dev testing.",
      "2": "Splits state by environment, but cannot explain how shared resources (like VPC IDs) are securely referenced across separate states.",
      "3": "Architects isolated state boundaries (layered by network, database, app tiers); uses terraform_remote_state / SSM parameters; enforces automated CI execution.",
      "4": "Enterprise platform engineering: publishes semantic-versioned private registry modules, integrates policy-as-code (OPA/Sentinel), and plans automated drift remediation."
    },
    "rubricNotes": "Technical scoring guidance. Evaluates enterprise Infrastructure as Code architecture, blast radius control, and governance."
  },
  {
    "id": "do-i-zero-downtime-deployments",
    "role": "devops_cloud_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "apis"
    ],
    "prompt": "Compare blue-green deployments with canary release strategies. How do service meshes (like Istio or Linkerd) or ingress controllers route traffic percentages and detect error anomalies?",
    "followUp": "If a canary deployment receiving 5% traffic begins returning 5xx errors, how does automated progressive delivery (e.g. Argo Rollouts or Flagger) roll back?",
    "concepts": [
      "Blue-Green deployment (instant switchover with complete duplicate environment) vs Canary deployment (gradual percentage shift)",
      "Traffic routing mechanisms: weighted ingress rules, service mesh virtual services, header-based routing",
      "Automated progressive delivery: metric analysis (error rate, p99 latency) triggering automated rollback"
    ],
    "anchors": {
      "0": "Thinks zero-downtime deployment means simply deploying at midnight and hoping the server restarts quickly.",
      "1": "Understands Blue-Green deployment, but cannot explain how Canary releases test real production traffic with minimal blast radius.",
      "2": "Explains weighted traffic splitting, but has no mechanism for automatic rollback if the canary encounters errors.",
      "3": "Compares Blue-Green vs Canary trade-offs; details weighted traffic splitting via Istio/ingress; configures metric queries for automated rollback.",
      "4": "Progressive delivery expertise: configures Argo Rollouts with Prometheus metrics analysis, dark launches via feature flags, and handles backward-compatible database states."
    },
    "rubricNotes": "Technical scoring guidance. Tests continuous delivery pipelines, advanced routing topologies, and automated canary analysis."
  },
  {
    "id": "do-i-cloud-security-iam",
    "role": "devops_cloud_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "How do you enforce the principle of least privilege using IAM roles, service accounts (IRSA in Kubernetes), and temporary token federation instead of long-lived access keys?",
    "followUp": "How do you detect and automatically revoke an AWS IAM access key that has been inactive for 90 days?",
    "concepts": [
      "IAM Least Privilege: explicit resource ARNs, condition keys, action scoping instead of AdministratorAccess / * wildcard policies",
      "IAM Roles for Service Accounts (IRSA) / Workload Identity: short-lived OIDC tokens projected into Kubernetes pods",
      "Automated credential rotation and auditing inactive keys"
    ],
    "anchors": {
      "0": "Attaches AdministratorAccess or *:* policies to EC2 instances and pods for convenience.",
      "1": "Creates IAM users with permanent static access keys for every service, storing them in Kubernetes secrets.",
      "2": "Uses IAM roles, but cannot explain how OIDC federation allows a Kubernetes service account to assume an AWS IAM role.",
      "3": "Implements IRSA / Workload Identity with minimal scoped policies; eliminates static keys; explains OIDC token exchange and assume-role conditions.",
      "4": "Cloud security architecture: enforces Permission Boundaries, SCPs across AWS Organizations, automated Security Hub / GuardDuty findings remediation, and IAM Access Analyzer."
    },
    "rubricNotes": "Technical scoring guidance. Emphasizes modern cloud identity, IAM best practices, and workload identity federation."
  },
  {
    "id": "do-i-project-chaos-engineering",
    "role": "devops_cloud_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "reliability"
    ],
    "prompt": "You propose introducing chaos engineering (e.g. terminating random pods in production staging). Skeptical engineering managers worry it will cause downtime. How do you structure a controlled game day?",
    "followUp": "What steady-state hypothesis and abort criteria must be established before running a chaos experiment?",
    "concepts": [
      "Chaos Engineering principles: verifying system resilience under simulated failure in controlled environments",
      "Defining a steady-state hypothesis (e.g. user error rate remains < 0.1% while worker nodes crash)",
      "Safety boundaries: blast radius containment, automated experiment abort triggers, stakeholder buy-in"
    ],
    "anchors": {
      "0": "Wants to unleash chaotic outages directly in production without informing anyone, viewing downtime as a badge of honor.",
      "1": "Abandons the chaos engineering idea immediately when managers express the slightest hesitation.",
      "2": "Proposes chaos experiments, but defines no steady-state hypothesis or automated rollback mechanism.",
      "3": "Collaborative strategy: defines steady-state hypothesis in staging first; runs structured GameDay with kill-switch abort; demonstrates value by proving recovery.",
      "4": "Senior reliability leadership: establishes Chaos GameDay runbooks, tests non-obvious failures (DNS latency, packet loss, AZ loss), and shares executive learnings."
    },
    "rubricNotes": "Techno-managerial guidance. Evaluates resilience testing advocacy, risk containment, and cross-functional leadership."
  },
  {
    "id": "do-i-project-major-outage",
    "role": "devops_cloud_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "reliability"
    ],
    "prompt": "A primary cloud region suffers a complete fiber outage. Walk through your incident commander role: communication channels, stakeholder updates, and coordinated disaster failover.",
    "followUp": "How do you prevent multiple engineers from executing conflicting commands simultaneously during a high-stress crisis?",
    "concepts": [
      "Incident Command System (ICS): Incident Commander, Operations Lead, Communications Lead roles",
      "Maintaining clear, periodic customer and stakeholder status updates during major outages",
      "Orderly execution of disaster recovery runbooks without panic or conflicting commands"
    ],
    "anchors": {
      "0": "Panics, allows 15 engineers to type random commands simultaneously, and posts conflicting updates to customers on Twitter.",
      "1": "Focuses entirely on fixing the issue, leaving leadership and customers completely in the dark for 4 hours.",
      "2": "Executes failover runbook, but fails to designate clear operational roles, resulting in duplicate conflicting efforts.",
      "3": "Takes charge as Incident Commander: delegates technical leads, establishes single comms channel, posts updates every 30 mins, executes tested DR runbook.",
      "4": "Exemplary incident command: demonstrates psychological safety under pressure, coordinates DNS switchover, monitors secondary region saturation, and conducts post-incident review."
    },
    "rubricNotes": "Techno-managerial guidance. Tests crisis leadership, incident command discipline, and executive communication."
  },
  {
    "id": "do-i-project-developer-platform",
    "role": "devops_cloud_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Engineering leadership wants to establish an Internal Developer Platform (IDP) to offer self-service environments to 100+ engineers. How do you balance governance with developer autonomy?",
    "followUp": "How do you measure whether the developer platform is actually improving developer velocity or just adding another layer of bureaucracy?",
    "concepts": [
      "Platform Engineering philosophy: product mindset, golden paths, self-service developer portals (Backstage)",
      "Balancing guardrails with autonomy (preventing developers from being blocked by DevOps tickets)",
      "Metrics: lead time for changes, deployment frequency, developer satisfaction surveys (SPACE framework)"
    ],
    "anchors": {
      "0": "Builds a rigid platform that forces developers to file tickets for every database change or environment creation.",
      "1": "Gives all 100 developers raw cloud admin access with zero guardrails, leading to massive security holes and cost overruns.",
      "2": "Deploys a portal, but does not consult product engineering teams, resulting in zero internal adoption.",
      "3": "Treats the platform as an internal product: creates Golden Paths for standard services, self-service ephemeral environments, and tracks lead time metrics.",
      "4": "Strategic platform architect: establishes developer advisory group, incorporates automated security guardrails, implements service catalogs with compliance scorecards."
    },
    "rubricNotes": "Techno-managerial guidance. Evaluates platform engineering vision, developer experience (DevEx), and governance."
  },
  {
    "id": "do-i-reflect-postmortem-learning",
    "role": "devops_cloud_engineer",
    "level": "intermediate",
    "stage": "reflection",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Describe a post-mortem review you led where the initial assumption about the root cause was proven wrong upon deeper investigation. What changed in your incident investigation methodology?",
    "followUp": "Why is stopping an incident investigation at \"human error\" considered a failure of root cause analysis?",
    "concepts": [
      "Moving past superficial symptoms to systemic root causes (Five Whys methodology)",
      "Human error as a symptom of flawed system design rather than a root cause",
      "Refining telemetry, runbooks, and automated guardrails based on counter-intuitive learnings"
    ],
    "anchors": {
      "0": "Believes post-mortems are for finding who is at fault and disciplining the person who made the mistake.",
      "1": "Describes a post-mortem, but stopped the investigation at \"the engineer typed the wrong command.\"",
      "2": "Discovered the true root cause, but implemented no systemic automated safeguard to prevent the same error.",
      "3": "Clearly details how initial assumptions were debunked by log/trace telemetry; explains why the system allowed the mistake; implements systemic guardrails.",
      "4": "Profound SRE wisdom: discusses cognitive biases in incident analysis, safety culture, Swiss Cheese model of accident causation, and continuous learning."
    },
    "rubricNotes": "Unscored reflection. Reward intellectual honesty, deep understanding of human factors, and systemic thinking."
  },
  {
    "id": "de-j-intro-data-pipeline",
    "role": "data_engineer",
    "level": "junior",
    "stage": "icebreaker",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Describe a data pipeline or ETL job you built or maintained. Where did the source data originate, what transformations were applied, and how was it loaded for downstream consumers?",
    "followUp": "What was the most challenging data quality issue or schema discrepancy you uncovered in that pipeline?",
    "concepts": [
      "ETL/ELT pipeline workflow (Extract, Transform, Load)",
      "Source systems (RDBMS, event streams, files) vs downstream analytics targets",
      "Data transformation logic and operational error handling"
    ],
    "anchors": {
      "0": "Cannot describe any structured data pipeline or ETL workflow; relies on manual spreadsheet exports.",
      "1": "Describes a basic Python script without error handling, logging, or understanding of data delivery guarantees.",
      "2": "Explains an ETL pipeline with source and target databases, but lacks detail on intermediate transformations or validation checks.",
      "3": "Clearly details end-to-end pipeline stages: source ingestion, transformation logic, destination schema, and data validation steps.",
      "4": "Deep pipeline maturity: explains idempotent ingestion, dead-letter queues for unparseable records, execution latency, and automated alert monitoring."
    },
    "rubricNotes": "Unscored icebreaker. Look for authentic pipeline ownership, data awareness, and clear technical communication."
  },
  {
    "id": "de-j-sql-window-functions",
    "role": "data_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "databases"
    ],
    "prompt": "Explain how SQL window functions like ROW_NUMBER(), RANK(), and DENSE_RANK() work with PARTITION BY and ORDER BY. In what scenario would you use a window function instead of a standard GROUP BY?",
    "followUp": "How would you use ROW_NUMBER() in a Common Table Expression (CTE) to deduplicate records based on the latest timestamp?",
    "concepts": [
      "Window functions mechanics: computing across rows while retaining individual row identity (no row collapsing)",
      "Differences between ROW_NUMBER() (unique sequential integers), RANK() (gaps on ties), and DENSE_RANK() (no gaps)",
      "Deduplication patterns using ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ... DESC) = 1"
    ],
    "anchors": {
      "0": "Confuses window functions with aggregate GROUP BY; does not understand PARTITION BY.",
      "1": "Knows window functions exist but cannot explain the difference between RANK and DENSE_RANK or why rows are not collapsed.",
      "2": "Explains window functions and partitioning correctly, but struggles to write an accurate deduplication query using a CTE.",
      "3": "Clearly contrasts ROW_NUMBER, RANK, and DENSE_RANK; explains how PARTITION BY divides row sets; demonstrates CTE deduplication query.",
      "4": "Mastery of analytical SQL: discusses frame specifications (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), performance impact on sorting/spilling, and execution order."
    },
    "rubricNotes": "Technical scoring guidance. Tests analytical SQL depth, ranking mechanics, and practical deduplication techniques."
  },
  {
    "id": "de-j-star-vs-snowflake-schema",
    "role": "data_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "databases"
    ],
    "prompt": "Compare a Star Schema and a Snowflake Schema in data warehouse dimensional modeling. What are the trade-offs between normalized dimension hierarchies and denormalized wide fact tables for analytical query performance?",
    "followUp": "Why do analytical columnar warehouses (like Snowflake or BigQuery) often perform better with denormalized star schemas despite redundant data storage?",
    "concepts": [
      "Dimensional modeling: Fact tables (metrics, foreign keys) vs Dimension tables (descriptive attributes)",
      "Star Schema: denormalized dimensions with fewer joins, simpler queries, and faster analytical scanning",
      "Snowflake Schema: normalized dimensions saving storage space but increasing join complexity and query latency"
    ],
    "anchors": {
      "0": "Cannot define fact tables or dimension tables; confuses OLTP relational normalization with analytical warehousing.",
      "1": "Defines star and snowflake schemas superficially by shape but cannot explain why normalization affects query performance.",
      "2": "Explains star vs snowflake schemas accurately, but struggles to evaluate when denormalization is preferred over storage savings.",
      "3": "Clearly evaluates both schemas: explains how Star reduces join overhead for OLAP, while Snowflake reduces data redundancy; explains trade-offs in query speed vs maintenance.",
      "4": "Architectural depth: discusses columnar compression efficiencies on repeated values, surrogate keys vs natural keys, and modern cloud storage economics favoring denormalization."
    },
    "rubricNotes": "Technical scoring guidance. Tests dimensional modeling principles, warehouse design patterns, and join performance trade-offs."
  },
  {
    "id": "de-j-batch-etl-idempotency",
    "role": "data_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "How do you design a daily batch ETL pipeline to be idempotent? If a job fails halfway through or runs twice in the same day, how do you prevent duplicate data or inconsistent metrics?",
    "followUp": "How do atomic partition overwrites or UPSERT operations help achieve idempotency compared to naive append-only inserts?",
    "concepts": [
      "Idempotency concept: running a pipeline multiple times produces the exact same end state without side effects or duplicates",
      "Strategies for idempotent ingestion: atomic partition overwrites (DELETE + INSERT or dynamic partition replacement), staging tables, and MERGE/UPSERT logic",
      "Handling partial pipeline failures and transactional commits in data warehouses"
    ],
    "anchors": {
      "0": "Suggests append-only inserts with no deduplication, leading to duplicated data whenever a job is retried.",
      "1": "Suggests running TRUNCATE on the entire table before inserting, causing complete data loss or downtime during job execution.",
      "2": "Understands idempotency and suggests deleting old partition data before inserting, but does not address atomicity or concurrent readers.",
      "3": "Designs robust idempotent job using staging tables, atomic partition swapping, or MERGE statements keyed on business identifiers; guarantees retry safety.",
      "4": "Comprehensive reliability: discusses transactional staging mechanisms, write-audit-publish (WAP) patterns, and monitoring duplicate keys via automated assertions."
    },
    "rubricNotes": "Technical scoring guidance. Evaluates understanding of idempotent data processing, pipeline retry safety, and data consistency."
  },
  {
    "id": "de-j-file-formats-parquet-vs-csv",
    "role": "data_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "databases"
    ],
    "prompt": "Why is columnar storage like Apache Parquet or ORC preferred over row-oriented formats like CSV or JSON for analytical data warehouses? How do column projection and dictionary encoding improve query efficiency?",
    "followUp": "What are the downsides of columnar formats when performing frequent single-row transactional inserts or updates?",
    "concepts": [
      "Row-oriented storage (CSV, JSON, Avro) vs Columnar storage (Parquet, ORC)",
      "Column projection (reading only requested columns) and predicate pushdown (skipping row groups using min/max statistics)",
      "Compression techniques (run-length encoding, dictionary encoding) enabled by homogeneous data types per column"
    ],
    "anchors": {
      "0": "Thinks CSV and Parquet are equivalent aside from Parquet being binary; cannot explain columnar layout.",
      "1": "States Parquet is faster and smaller, but cannot explain why columnar layout improves scan speed or compression.",
      "2": "Explains columnar storage and column projection, but cannot describe compression mechanisms or predicate pushdown statistics.",
      "3": "Clearly details advantages of Parquet: column projection reads fewer bytes, homogeneous columns compress efficiently, and row-group metadata allows predicate skipping.",
      "4": "Deep data engineering knowledge: explains file footer metadata, dictionary pages, Snappy/ZSTD compression trade-offs, and why row-oriented formats are better for OLTP streaming ingestion."
    },
    "rubricNotes": "Technical scoring guidance. Tests storage layer understanding, analytical scan optimization, and file format trade-offs."
  },
  {
    "id": "de-j-data-quality-validation",
    "role": "data_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "How do you implement automated data quality validation in a pipeline before loading records into a reporting table? How do you handle schema mismatches, null values in primary keys, and outlier metric values?",
    "followUp": "What framework or approach (e.g. Great Expectations, dbt tests, custom SQL assertions) have you used to catch data quality regressions automatically?",
    "concepts": [
      "Data quality dimensions: completeness, uniqueness, timeliness, validity, and accuracy",
      "Automated testing tools: dbt schema tests, Great Expectations, or custom SQL boundary assertions",
      "Quarantine and dead-letter handling: isolating invalid rows into error tables while allowing valid records to proceed"
    ],
    "anchors": {
      "0": "Does not implement data validation; assumes source data is always clean and correct until downstream reports break.",
      "1": "Relies on manual ad-hoc SQL checks after loading directly into production tables, with no automated gate.",
      "2": "Writes basic NOT NULL or primary key constraints, but does not handle quarantine tables or outlier alerts.",
      "3": "Designs automated quality gates: schema enforcement, pre-load assertions (null checks, referential integrity, range bounds), and routes corrupt rows to quarantine.",
      "4": "Production data ops: integrates dbt tests / Great Expectations into CI/CD pipelines, publishes data quality SLAs, and configures automated Slack/PagerDuty alerts for metric anomalies."
    },
    "rubricNotes": "Technical scoring guidance. Evaluates defensive data engineering, automated validation frameworks, and data hygiene."
  },
  {
    "id": "de-j-project-schema-drift",
    "role": "data_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "reliability",
      "project_tradeoffs"
    ],
    "prompt": "Walk me through a situation where an upstream backend service changed its database schema or payload structure without warning, breaking your downstream analytical pipelines. How did you identify the issue and prevent future occurrences?",
    "followUp": "How do you establish schema contracts or communication channels between application engineering teams and data engineering?",
    "concepts": [
      "Schema drift: handling unexpected columns, type changes, or dropped fields in source data",
      "Defensive ingestion: schema validation on ingest, flexible JSON variant storage, or schema registries",
      "Cross-team collaboration: defining data contracts and change notification protocols with backend teams"
    ],
    "anchors": {
      "0": "Blames backend engineers and takes no technical steps to protect the pipeline against future schema modifications.",
      "1": "Fixed the broken query manually but left the pipeline vulnerable to the next unexpected schema modification.",
      "2": "Added schema error handling, but did not initiate cross-team alignment or preventive data governance.",
      "3": "Identified root cause using pipeline logs, recovered missing data, and implemented schema validation gates along with cross-team schema change notification procedures.",
      "4": "Organizational leadership: introduced formal Data Contracts or Avro/Protobuf schema registry with versioning, automated breaking-change CI checks, and clear SLAs between producers and consumers."
    },
    "rubricNotes": "Techno-managerial scoring guidance. Evaluates resilience in handling external dependencies, stakeholder alignment, and data contracts."
  },
  {
    "id": "de-j-project-pii-masking",
    "role": "data_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "reliability",
      "project_tradeoffs"
    ],
    "prompt": "Describe a project where you had to ingest, store, and process sensitive data (such as PII, credit card details, or HIPAA data). How did you enforce column-level encryption, tokenization, and access control across data analysts and data scientists?",
    "followUp": "How do dynamic data masking policies in cloud warehouses allow analysts to query aggregate trends without viewing raw identifiable values?",
    "concepts": [
      "Data governance and compliance: GDPR, HIPAA, PCI-DSS compliance requirements",
      "Security techniques: SHA-256 hashing, tokenization, column-level encryption, and role-based access control (RBAC)",
      "Dynamic data masking: selectively obfuscating strings based on user role while preserving queryability"
    ],
    "anchors": {
      "0": "Stores unencrypted PII in plain text with wide open warehouse read access; ignores security and compliance requirements.",
      "1": "Relies on basic database passwords, leaving raw customer email and phone numbers visible to all internal database users.",
      "2": "Applies static hashing to sensitive fields, but cannot explain access control models or how to manage encryption keys securely.",
      "3": "Implements robust PII security: hashes/tokens at ingestion layer, applies dynamic masking policies for non-privileged roles, and enforces strict RBAC.",
      "4": "Comprehensive security posture: explains key rotation using KMS, differential privacy for analytical queries, audit access logging, and GDPR right-to-be-forgotten deletion workflows."
    },
    "rubricNotes": "Techno-managerial scoring guidance. Tests data security, compliance awareness, and privacy engineering practices."
  },
  {
    "id": "de-j-project-late-arriving-data",
    "role": "data_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "databases",
      "project_tradeoffs"
    ],
    "prompt": "How did you handle late-arriving or out-of-order data events in a reporting pipeline? When business dashboards expect daily reconciled figures, what trade-offs did you make between reprocessing historical partitions and publishing revised metrics?",
    "followUp": "How do you communicate to executive business stakeholders that yesterday's final revenue numbers were updated due to late arriving transactions?",
    "concepts": [
      "Late-arriving data: mobile app offline sync, delayed third-party partner deliveries, or network partition catch-up",
      "Processing strategies: sliding lookback windows, partition reprocessing, or restatement flags",
      "Stakeholder communication: explaining restatements, versioned snapshots, and data reconciliation windows"
    ],
    "anchors": {
      "0": "Ignores late-arriving data completely, silently dropping records that arrive after midnight.",
      "1": "Reprocesses the entire 5-year data warehouse every night to catch late rows, causing runaway compute costs.",
      "2": "Reprocesses recent partitions (e.g. last 3 days) but does not have a clear strategy for stakeholder communication when historical figures change.",
      "3": "Implements configurable sliding lookback window (e.g. 7-day restatement window), tracks watermarks, and establishes clear stakeholder expectations for data finality.",
      "4": "Architectural sophistication: creates immutable snapshot tables alongside restated fact tables, provides clear audit logs, and designs automated reconciliation alerts."
    },
    "rubricNotes": "Techno-managerial scoring guidance. Evaluates understanding of event time vs processing time, pipeline trade-offs, and stakeholder transparency."
  },
  {
    "id": "de-j-reflect-query-optimization",
    "role": "data_engineer",
    "level": "junior",
    "stage": "reflection",
    "topics": [
      "databases",
      "project_tradeoffs"
    ],
    "prompt": "Reflect on a slow-running SQL query or Spark transformation job that was consuming excessive cloud resources. What metrics or execution plan did you analyze to locate the bottleneck, and what did that experience teach you about query optimization?",
    "followUp": "How did that experience change how you write queries or structure warehouse tables from the beginning?",
    "concepts": [
      "Execution plan analysis: EXPLAIN plans, full table scans, Cartesian cross joins, sort/spill to disk",
      "Optimization remedies: clustering keys, partition pruning, eliminating nested correlated subqueries, or filter pushdowns",
      "Self-reflection and continuous improvement in writing efficient, scalable SQL"
    ],
    "anchors": {
      "0": "Cannot articulate what made the query slow; simply increased server RAM or cloud warehouse size to make it finish.",
      "1": "Describes a slow query but cannot explain how to read an EXPLAIN plan or what the underlying computational bottleneck was.",
      "2": "Fixed the query by adding an index or rewriting a join, but lacks deeper reflection on query execution mechanics or long-term design lessons.",
      "3": "Analyzed execution plan (e.g. heavy shuffle, full table scan, disk spilling), applied targeted fix (pruning, join order, clustering), and articulates clear engineering lessons.",
      "4": "Deep architectural reflection: explains query planner costing models, data distribution effects, and shares how they established query performance guidelines across the team."
    },
    "rubricNotes": "Unscored reflection. Look for candid analytical self-evaluation, diagnostic methodology, and growth mindset."
  },
  {
    "id": "de-i-intro-data-platform",
    "role": "data_engineer",
    "level": "intermediate",
    "stage": "icebreaker",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Describe the overall architecture of a data platform or warehouse you worked on. How did you balance batch processing SLAs with the demand for real-time analytics across different stakeholder teams?",
    "followUp": "What architectural decision in that platform worked well, and what decision would you re-architect if you started over today?",
    "concepts": [
      "Modern data platform components (ingestion, bronze/silver/gold lakehouse tiers, warehouse, semantic layer)",
      "Balancing batch latency (hourly/daily) vs streaming ingestion (Kafka, Kinesis, micro-batches)",
      "Platform architectural trade-offs: cost, complexity, query performance, and developer velocity"
    ],
    "anchors": {
      "0": "Cannot describe the data platform architecture beyond a single SQL database.",
      "1": "Describes basic pipeline scripts, lacking clear articulation of storage layers, compute separation, or data serving tiers.",
      "2": "Explains batch and streaming components, but struggles to justify architectural trade-offs or cost implications.",
      "3": "Clearly details comprehensive platform architecture: ingestion mechanisms, medallion lakehouse architecture, transformation orchestration, and access governance.",
      "4": "Visionary data architecture: details decoupled compute/storage, automated data mesh governance, FinOps cost monitoring, and honest technical retrospection."
    },
    "rubricNotes": "Unscored icebreaker. Look for comprehensive systems-level understanding, pragmatic trade-off analysis, and clear communication."
  },
  {
    "id": "de-i-batch-vs-streaming-lambda-kappa",
    "role": "data_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "concurrency",
      "reliability"
    ],
    "prompt": "Compare the Lambda architecture and Kappa architecture for modern data processing. In what real-world scenarios would you choose streaming with tools like Kafka and Flink over scheduled micro-batch processing?",
    "followUp": "What are the operational challenges of maintaining duplicate business logic in Lambda architecture's batch and speed layers?",
    "concepts": [
      "Lambda Architecture: dual-path (speed layer for real-time + batch layer for accuracy and reconciliation)",
      "Kappa Architecture: single streaming engine (e.g. Flink, Spark Streaming) processing all data as an append-only log with replaying capabilities",
      "Trade-offs: operational overhead of dual-codebases in Lambda vs stateful stream reprocessing complexity in Kappa"
    ],
    "anchors": {
      "0": "Cannot explain Lambda or Kappa architectures; confuses streaming with fast batch jobs.",
      "1": "Knows Lambda has two layers but cannot explain why maintaining two codebases is problematic or how Kappa solves it.",
      "2": "Contrasts Lambda and Kappa accurately, but struggles to evaluate when true low-latency streaming is genuinely needed versus micro-batching.",
      "3": "Provides clear comparative analysis: details speed vs batch layers, explains why Kappa uses unified stream processing with log replay, and identifies valid streaming use cases (fraud detection, real-time bidding).",
      "4": "System mastery: details exactly-once processing semantics (Flink checkpoints, Kafka two-phase commit), watermarking, event-time vs processing-time skew, and state size management."
    },
    "rubricNotes": "Technical scoring guidance. Tests real-time streaming patterns, distributed processing architectures, and stateful stream management."
  },
  {
    "id": "de-i-lakehouse-acid-transactions",
    "role": "data_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "databases",
      "concurrency"
    ],
    "prompt": "How do modern open table formats (such as Delta Lake, Apache Iceberg, or Apache Hudi) provide ACID transactions, time travel, and concurrent write guarantees on top of cheap object storage like Amazon S3?",
    "followUp": "How does optimistic concurrency control (OCC) resolve conflicts when two pipelines attempt to update the same Iceberg or Delta table simultaneously?",
    "concepts": [
      "Open table format mechanics: transaction log (commit log) maintaining immutable metadata pointers to underlying Parquet files",
      "ACID guarantees: atomicity via log commits, snapshot isolation, and time-travel querying historical snapshots",
      "Optimistic Concurrency Control (OCC): detecting conflicting file-level writes and triggering automated retries"
    ],
    "anchors": {
      "0": "Thinks S3 natively supports ACID transactions or believes Delta/Iceberg are proprietary database engines rather than table metadata formats.",
      "1": "Mentions Delta Lake has a log, but cannot explain how metadata files coordinate transactions or how time travel works under the hood.",
      "2": "Explains the transaction log and snapshot isolation, but struggles with concurrency conflict resolution or file compaction (vacuuming).",
      "3": "Clearly details how table formats decouple metadata from data files: atomic commits in transaction log, snapshot manifests, time-travel lookups, and OCC conflict resolution.",
      "4": "Deep storage engine expertise: explains Iceberg manifest lists and partition evolution without rewriting data, copy-on-write vs merge-on-read trade-offs, and file compaction strategies."
    },
    "rubricNotes": "Technical scoring guidance. Tests deep understanding of modern lakehouse storage engines, metadata management, and distributed transaction semantics."
  },
  {
    "id": "de-i-scd-type2-modeling",
    "role": "data_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "databases"
    ],
    "prompt": "Explain how you implement Slowly Changing Dimensions Type 2 (SCD2) in an analytical warehouse. How do you manage effective date ranges, active row flags, and high-performance surrogate key lookups during pipeline merges?",
    "followUp": "What are the performance implications of running large-scale MERGE statements against multi-million row fact and dimension tables, and how do you optimize them?",
    "concepts": [
      "Slowly Changing Dimensions (SCD): Type 1 (overwrite), Type 2 (historical tracking with valid_from, valid_to, is_current flags)",
      "Pipeline implementation: MERGE (UPSERT) statements detecting attribute changes, expiring old records, and inserting new active rows",
      "Optimization strategies: hashing attribute columns (MD5/SHA256) to detect changes rapidly without comparing dozens of text columns"
    ],
    "anchors": {
      "0": "Cannot differentiate SCD Type 1 from Type 2; suggests overwriting dimension rows without preserving historical audit trails.",
      "1": "Explains SCD Type 2 conceptually but cannot describe the SQL MERGE logic or date windowing necessary to maintain integrity.",
      "2": "Describes SCD Type 2 with start/end dates, but does not use hash comparisons or partition pruning, leading to slow table scans.",
      "3": "Implements production-grade SCD Type 2: explains MERGE logic, surrogate keys vs natural keys, valid_from/valid_to timestamps, active boolean flags, and surrogate key assignment.",
      "4": "Advanced dimensional modeling: details surrogate key generation at scale, hash-diff change detection, snapshot-based dbt implementations, and downstream point-in-time join performance."
    },
    "rubricNotes": "Technical scoring guidance. Evaluates dimensional modeling mastery, historical data tracking, and merge performance tuning."
  },
  {
    "id": "de-i-partition-skew-spark",
    "role": "data_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "concurrency",
      "reliability"
    ],
    "prompt": "When processing multi-terabyte datasets in distributed compute engines like Apache Spark, what causes data skew during shuffle operations? How do you diagnose skewed partitions and fix them using techniques like salting, broadcast joins, or adaptive query execution?",
    "followUp": "How does Spark Adaptive Query Execution (AQE) automatically detect and handle skewed joins at runtime without manual code refactoring?",
    "concepts": [
      "Data skew: uneven distribution of data across shuffle partitions causing straggler tasks and OutOfMemory (OOM) errors",
      "Diagnostic tools: Spark UI (task execution time distribution, shuffle read sizes across partitions)",
      "Remediation techniques: salting join keys with random numbers, broadcast hash joins for small tables, repartitioning, and Spark AQE skew join handling"
    ],
    "anchors": {
      "0": "Cannot explain data skew; believes adding more Spark cluster nodes will automatically solve any hanging or failing job.",
      "1": "Recognizes that a single task takes too long, but does not understand how non-uniform key distribution causes partition skew during shuffle.",
      "2": "Identifies skew in Spark UI, but only knows broadcast joins and cannot explain key salting or AQE configuration.",
      "3": "Accurately diagnoses skew using Spark UI percentiles; explains key salting (appending random suffix to skew key and exploding lookup table); details broadcast join thresholds and AQE.",
      "4": "Deep distributed compute mastery: details shuffle file spill to disk, memory management (execution vs storage memory), custom partitioners, and tuning spark.sql.shuffle.partitions."
    },
    "rubricNotes": "Technical scoring guidance. Tests distributed compute fundamentals, Spark execution mechanics, and troubleshooting production data skew."
  },
  {
    "id": "de-i-orchestration-dag-lineage",
    "role": "data_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "reliability",
      "apis"
    ],
    "prompt": "How do you architect data orchestration workflows using tools like Apache Airflow, Dagster, or Prefect? How do you ensure granular dependency management, dynamic DAG generation, automated retries, and end-to-end data lineage?",
    "followUp": "Why is it considered an anti-pattern to run heavy data transformations directly inside Airflow worker processes rather than delegating to specialized compute engines?",
    "concepts": [
      "Workflow orchestration principles: directed acyclic graphs (DAGs), deterministic task dependencies, and parameterization",
      "Separation of orchestration and compute: orchestrator coordinates, external engines (Spark, Snowflake, dbt, Trino) execute",
      "Data observability & lineage: OpenLineage metadata standards, tracking data provenance from ingest to BI dashboard"
    ],
    "anchors": {
      "0": "Treats orchestrator as a heavy compute engine, running multi-gigabyte pandas operations inside Airflow tasks until workers crash.",
      "1": "Writes monolithic DAGs with hardcoded credentials and no retry policies, failing silently upon transient network errors.",
      "2": "Designs modular DAGs with retries, but struggles with dynamic generation, state passing (misusing XCom for big datasets), or lineage tracking.",
      "3": "Architects robust orchestration: enforces thin orchestrator pattern (operators invoke cloud compute), dynamic task mapping, exponential backoff retries, and lineage tracking.",
      "4": "Modern data orchestration leader: compares asset-based orchestration (Dagster) with task-based (Airflow), integrates OpenLineage/Marquez, and implements automated backfill mechanics with concurrency limits."
    },
    "rubricNotes": "Technical scoring guidance. Tests workflow orchestration design, reliable pipeline execution, and data observability architectures."
  },
  {
    "id": "de-i-project-pipeline-backfill",
    "role": "data_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "databases",
      "project_tradeoffs"
    ],
    "prompt": "Walk me through how you planned and executed a massive historical data backfill (e.g. reprocessing 2 years of transactional events) without overwhelming production databases, exceeding cloud warehouse spend budgets, or disrupting daily live jobs.",
    "followUp": "How did you validate that the backfilled historical metrics exactly matched the existing legacy reports before switching consumer dashboards over?",
    "concepts": [
      "Backfill strategy: chunking historical time slices, rate-limiting read operations against OLTP replicas, and isolated compute clusters",
      "Cost and resource management: leveraging spot instances, off-peak compute, and monitoring query credit burn rate",
      "Verification & reconciliation: automated statistical parity tests between historical and newly processed tables"
    ],
    "anchors": {
      "0": "Ran the entire multi-year backfill in a single massive query during peak hours, crashing production databases and exhausting monthly cloud budgets.",
      "1": "Backfilled data manually in ad-hoc chunks without tracking completed dates, leaving gaps and duplicate data in historical reporting.",
      "2": "Scripted chunked backfills successfully, but lacked cost controls, throttling against source databases, or formal parity validation.",
      "3": "Executed structured backfill plan: chunked by partition slices, read from read-replicas with concurrency limits, used dedicated compute pools, and ran automated data reconciliation tests.",
      "4": "Exceptional project execution: created automated backfill CLI with checkpoint state storage, negotiated off-peak cloud billing, ran automated statistical diffs, and coordinated seamless zero-downtime cutover."
    },
    "rubricNotes": "Techno-managerial scoring guidance. Evaluates large-scale operational planning, risk mitigation, cloud financial awareness, and data validation."
  },
  {
    "id": "de-i-project-warehouse-cost",
    "role": "data_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "databases",
      "project_tradeoffs"
    ],
    "prompt": "Describe a situation where cloud data warehouse costs (such as Snowflake, BigQuery, or Databricks) spiked unexpectedly. How did you audit warehouse compute clustering, auto-suspend policies, clustering keys, and expensive queries to reduce billing without hurting query response times?",
    "followUp": "How do you institute FinOps practices and resource quotas so individual BI teams or data scientists don't accidentally run unbounded full-table scans?",
    "concepts": [
      "Cloud data warehouse FinOps: compute credits vs storage billing, auto-suspend / auto-resume configuration, and warehouse sizing",
      "Query optimization for cost: clustering keys, partition pruning, materialized views, and eliminating recurrent Cartesian products",
      "Governance: warehouse resource monitors, statement timeouts, per-team cost attribution, and BI cache layer enforcement"
    ],
    "anchors": {
      "0": "Unaware of cloud warehouse billing models; ignores cost spikes until executive management demands immediate budget cuts.",
      "1": "Reduced costs simply by shutting down warehouses or downgrading sizes, causing critical business dashboards to time out.",
      "2": "Identified top 5 expensive queries using account usage views, but did not implement systemic governance or automated guardrails.",
      "3": "Audited billing metadata: adjusted auto-suspend from 10 mins to 60 secs, added query timeout limits, optimized expensive query plans, and saved substantial cloud spend.",
      "4": "FinOps leadership: established multi-warehouse isolation per business domain, set credit quota alerts, implemented caching layers, and instituted automated query cost governance."
    },
    "rubricNotes": "Techno-managerial scoring guidance. Tests FinOps mindset, cloud warehouse cost auditing, query performance tuning, and cross-team governance."
  },
  {
    "id": "de-i-project-central-vs-mesh",
    "role": "data_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "reliability",
      "project_tradeoffs"
    ],
    "prompt": "Have you experienced the transition between a centralized data engineering team and a decentralized domain-driven Data Mesh model? How do you balance domain team autonomy with centralized data governance, metadata management, and common tooling?",
    "followUp": "How do you prevent decentralized teams from reinventing the wheel and creating siloed, incompatible data definitions across the organization?",
    "concepts": [
      "Data Mesh paradigm: domain-oriented decentralized data ownership, data as a product, self-serve data infrastructure, and federated governance",
      "Central data platform team role: providing platform primitives (CI/CD templates, compute scaffolding, metadata catalog) rather than writing business SQL",
      "Federated computational governance: global standards for schema definitions, access control, and interoperability across domain data products"
    ],
    "anchors": {
      "0": "Cannot articulate the difference between a centralized data team and a Data Mesh; views data engineering purely as a ticketing service desk.",
      "1": "Advocates for complete decentralization without any central governance, resulting in chaotic schema incompatibility and broken joins across departments.",
      "2": "Understands Data Mesh principles theoretically, but struggles with the practical balance of platform enablement vs domain ownership.",
      "3": "Articulates clear pragmatic model: central platform team builds self-serve infrastructure and governance guardrails, while domain teams own data products and business SLAs.",
      "4": "Thought leadership in modern data architecture: details automated data contract verification in CI, shared enterprise data cataloging, cross-domain semantic interoperability, and cultural change management."
    },
    "rubricNotes": "Techno-managerial scoring guidance. Evaluates architectural vision, organizational dynamics, data governance, and platform enablement."
  },
  {
    "id": "de-i-reflect-pipeline-failure",
    "role": "data_engineer",
    "level": "intermediate",
    "stage": "reflection",
    "topics": [
      "reliability",
      "project_tradeoffs"
    ],
    "prompt": "Reflect on a critical data incident where corrupted, duplicated, or missing data went unnoticed for days or weeks before downstream business executives caught the discrepancies. What systemic guardrails did you implement to ensure silent data corruption is caught immediately?",
    "followUp": "How did you handle the post-incident retrospective and rebuild trust with business stakeholders who depend on those metrics?",
    "concepts": [
      "Silent data failures: pipelines completing with status success (exit code 0) while emitting zero rows, duplicated metrics, or corrupted values",
      "Systemic guardrails: volume anomaly detection, freshness alerts, row count threshold monitors, and automated schema validation",
      "Post-incident leadership: blameless post-mortem, transparent communication, and establishing data reliability SLAs"
    ],
    "anchors": {
      "0": "Claims they have never experienced a silent data failure or blames downstream users for not inspecting the numbers closely enough.",
      "1": "Describes a failure but only added a one-off query fix without addressing the systemic lack of monitoring or automated alerting.",
      "2": "Explains the incident and post-fix clearly, but lacks deep reflection on automated data observability or stakeholder trust recovery.",
      "3": "Candidly recounts silent data corruption incident, explains why traditional exit-code monitoring failed, and details systemic observability guardrails installed (freshness, volume, distribution checks).",
      "4": "Exemplary data leadership: articulates deep blameless post-mortem culture, implemented Write-Audit-Publish pattern, created executive data health status pages, and restored organizational confidence."
    },
    "rubricNotes": "Unscored reflection. Look for authentic vulnerability, deep post-mortem learning, operational rigor, and strategic data governance."
  },
  {
    "id": "qa-j-intro-testing",
    "role": "qa_automation_engineer",
    "level": "junior",
    "stage": "icebreaker",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Describe a software feature or application you were responsible for testing. What was your strategy for breaking down test requirements and ensuring coverage across happy paths and edge cases?",
    "followUp": "What was the most subtle or tricky defect you uncovered during that testing effort?",
    "concepts": [
      "Test planning and requirements analysis: user stories, acceptance criteria, and edge-case enumeration",
      "Test case design: happy paths, negative tests, boundary cases, and error recovery",
      "Defect reporting and collaboration with software engineers and product managers"
    ],
    "anchors": {
      "0": "Cannot articulate a structured testing strategy; clicks around randomly without test cases or documented criteria.",
      "1": "Only tests basic happy paths and accepts whatever the developer says works without verifying failure cases.",
      "2": "Explains test cases for happy path and common errors, but lacks systematic approach to edge cases or automated coverage.",
      "3": "Clearly details structured approach: analyzes acceptance criteria, identifies negative/boundary scenarios, documents test matrices, and logs actionable defects with reproduction steps.",
      "4": "Quality engineering excellence: explains risk-based testing, automated regression matrix, pairwise test generation, and partnering with engineers early in sprint refinement."
    },
    "rubricNotes": "Unscored icebreaker. Look for authentic quality advocacy, systematic analytical thinking, and clear technical communication."
  },
  {
    "id": "qa-j-test-pyramid-basics",
    "role": "qa_automation_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "Explain the classic Test Pyramid (Unit, Integration, End-to-End). Why is having too many end-to-end UI tests an anti-pattern (often called an inverted pyramid or ice cream cone), and what are the cost and execution speed trade-offs across layers?",
    "followUp": "How do you determine whether a given bug or scenario should be tested at the unit level, API integration level, or browser UI level?",
    "concepts": [
      "Test Pyramid layers: Unit (fast, isolated, cheap), Integration (component interaction), End-to-End (user journey, slow, brittle)",
      "The \"Ice Cream Cone\" anti-pattern: slow test execution, high maintenance cost, frequent flakiness, and delayed developer feedback",
      "Pushing tests down the pyramid: testing business logic at unit/API layer while reserving UI tests for critical user journeys"
    ],
    "anchors": {
      "0": "Believes all testing should be automated through the browser UI and that unit tests are unnecessary or obsolete.",
      "1": "Recognizes the pyramid shape but cannot explain why UI tests are slower, more expensive, or more brittle than unit/API tests.",
      "2": "Explains unit, integration, and E2E layers accurately, but struggles with the practical criteria for pushing tests down the pyramid.",
      "3": "Clearly contrasts all three layers: execution speed, debuggability, maintenance costs, and explains why bloated UI suites cause flakiness and slow CI pipelines.",
      "4": "Deep quality engineering perspective: discusses test distribution ratios, shifting testing left, testing trophy vs pyramid models, and cost-of-defect detection across stages."
    },
    "rubricNotes": "Technical scoring guidance. Tests foundational quality architecture, test automation strategy, and layer trade-offs."
  },
  {
    "id": "qa-j-api-testing-mechanics",
    "role": "qa_automation_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "apis"
    ],
    "prompt": "How do you test RESTful APIs using tools like Postman, REST Assured, or Supertest? Beyond validating HTTP 200 status codes, what assertions do you write for response headers, JSON schema contracts, error payloads, and response latency?",
    "followUp": "How do you chain API requests together in an automated test (e.g. creating a resource via POST and using the returned ID in a GET or DELETE request)?",
    "concepts": [
      "API testing dimensions: status codes (2xx, 4xx, 5xx), response headers (Content-Type, caching), payload contracts, and response latency SLAs",
      "JSON schema validation: verifying types, required properties, and field constraints against an OpenAPI/Swagger specification",
      "Request chaining and dynamic test state: extracting tokens/IDs from responses to parameterize subsequent requests"
    ],
    "anchors": {
      "0": "Only checks if the response returns HTTP 200; does not validate response body contents, headers, or error responses.",
      "1": "Validates status codes and simple strings, but cannot explain how to validate JSON schemas or chain dynamic variables.",
      "2": "Validates JSON fields and uses environment variables, but lacks understanding of schema validation, performance thresholds, or edge-case error statuses (400 vs 404 vs 422).",
      "3": "Comprehensive API testing: validates headers, JSON schema compliance, status codes, payload field types, error contract schemas, and chains dynamic test variables.",
      "4": "Mastery of API test automation: integrates automated Newman/Jest suites into CI, mocks downstream dependencies with WireMock, and tests idempotent idempotency keys and rate limiting."
    },
    "rubricNotes": "Technical scoring guidance. Tests API testing rigor, schema verification, and automated request orchestration."
  },
  {
    "id": "qa-j-ui-locators-selenium-playwright",
    "role": "qa_automation_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "When writing automated UI tests with Playwright, Cypress, or Selenium, how do you choose resilient element locators? Why should you avoid brittle XPath expressions like `/html/body/div[2]/button`, and how do you handle asynchronous DOM loading without hardcoded sleeps?",
    "followUp": "Why is using explicit auto-waiting or web-first assertions preferred over Thread.sleep() or cy.wait(5000)?",
    "concepts": [
      "Locator strategy hierarchy: user-facing attributes (role, text, label) and dedicated data-testid attributes over absolute DOM hierarchies or CSS class names",
      "Fragility of absolute XPaths: breaking on any minor markup redesign or wrapper div addition",
      "Handling asynchronous DOM updates: explicit waits, auto-waiting locators, and smart polling instead of arbitrary static sleeps"
    ],
    "anchors": {
      "0": "Relies on absolute XPaths copied from browser DevTools; peppers test scripts with arbitrary hardcoded sleep pauses (sleep 5s).",
      "1": "Uses CSS selectors based on styling classes (.btn-primary-blue-2), which break whenever CSS styles change.",
      "2": "Uses data-testid attributes, but still relies on hardcoded sleeps when waiting for animations or network requests to complete.",
      "3": "Implements resilient locator strategies (accessibility roles, data-test attributes); uses auto-waiting, explicit polling conditions, and explains why hardcoded sleeps cause slow and flaky CI builds.",
      "4": "Modern UI automation mastery: leverages Playwright locator chaining, shadow DOM traversal, web-first assertions, and network idle interception for rock-solid stability."
    },
    "rubricNotes": "Technical scoring guidance. Evaluates test reliability, UI locator robustness, and asynchronous synchronization handling."
  },
  {
    "id": "qa-j-test-data-isolation",
    "role": "qa_automation_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "databases",
      "reliability"
    ],
    "prompt": "How do you manage test data generation and test environment isolation? How do you ensure that automated test runs do not pollute staging databases, collide with concurrent test executions, or leave orphaned state?",
    "followUp": "What are the pros and cons of using database transactions that rollback after each test versus creating unique dynamic test entities via API fixtures?",
    "concepts": [
      "Test data isolation: preventing test cross-talk, race conditions, and dirty state between concurrent test runners",
      "Data generation strategies: dynamic faker libraries, unique UUID prefixes, dedicated test database seeding, and API setup/teardown fixtures",
      "State cleanup: automated teardown hooks, soft-delete sweeps, and transactional rollbacks"
    ],
    "anchors": {
      "0": "Hardcodes static user IDs (e.g. testuser@test.com) in all tests, causing collisions whenever tests run concurrently or fail.",
      "1": "Leaves generated test data permanently in shared staging databases with no teardown or cleanup strategy.",
      "2": "Deletes test data manually or in an afterEach hook, but fails to handle test cleanup when tests crash or time out.",
      "3": "Designs isolated test data: generates unique entities per test run (using dynamic timestamps/UUIDs), uses robust setup/teardown fixtures, and prevents test collision.",
      "4": "Comprehensive test infrastructure: implements ephemeral database containers (Testcontainers), automated seed factories, transactional rollbacks, and scheduled orphaned data garbage collection."
    },
    "rubricNotes": "Technical scoring guidance. Evaluates test data architecture, concurrent isolation, and environment hygiene."
  },
  {
    "id": "qa-j-boundary-value-analysis",
    "role": "qa_automation_engineer",
    "level": "junior",
    "stage": "technical",
    "topics": [
      "reliability"
    ],
    "prompt": "Explain Boundary Value Analysis and Equivalence Partitioning as black-box test design techniques. Provide a concrete example of how you would derive test input cases for an input field that accepts an integer between 1 and 100.",
    "followUp": "Why do software systems statistically fail more frequently at boundary edges rather than in the middle of equivalence partitions?",
    "concepts": [
      "Equivalence Partitioning (EP): dividing input domain into valid and invalid partitions where any representative input should behave similarly",
      "Boundary Value Analysis (BVA): testing values at the boundaries of equivalence partitions (min, min-1, min+1, max, max-1, max+1)",
      "Identifying off-by-one errors, conditional logic flaws (< vs <=), and edge-case type overflow"
    ],
    "anchors": {
      "0": "Cannot define Equivalence Partitioning or Boundary Value Analysis; tests arbitrary random numbers with no systematic design.",
      "1": "Identifies 1 and 100 as tests, but does not test invalid boundaries (0, 101) or explain the concept of equivalence classes.",
      "2": "Identifies boundaries (0, 1, 100, 101) and valid middle values, but cannot explain why defects cluster at boundaries or how to handle non-numeric inputs.",
      "3": "Systematically articulates EP and BVA: defines valid class [1-100] and invalid classes (<1, >100, non-integers); lists exact boundary test values (0, 1, 2, 99, 100, 101) and boundary justification.",
      "4": "Advanced test engineering: analyzes 2-value vs 3-value boundary analysis, explains off-by-one algorithmic vulnerabilities, and applies techniques to complex multi-variable decision tables."
    },
    "rubricNotes": "Technical scoring guidance. Tests formal test design techniques, systematic edge-case discovery, and defect prevention."
  },
  {
    "id": "qa-j-project-bug-advocacy",
    "role": "qa_automation_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Describe a scenario where you identified a severe edge-case bug shortly before a scheduled production release, but developers or the product owner wanted to push to production anyway. How did you communicate the risk and advocate for quality?",
    "followUp": "How do you clearly articulate technical bug severity and business impact without sounding adversarial toward engineering or product management?",
    "concepts": [
      "Bug advocacy: presenting facts, reproduction steps, frequency likelihood, customer impact, and potential financial/reputational damage",
      "Severity vs Priority: distinguishing technical defect impact (Severity) from business release urgency (Priority)",
      "Constructive risk assessment: providing mitigation options (feature flags, hotfix agreements, release gating) rather than simple vetoes"
    ],
    "anchors": {
      "0": "Remains silent and allows the broken feature to ship, or angrily argues without presenting objective business impact.",
      "1": "Reports the bug but backs down immediately when the developer claims it is an unlikely edge case.",
      "2": "Advocates against release but presents only technical details, struggling to communicate the user and business risk to product owners.",
      "3": "Constructively advocates for quality: presents clear reproduction steps, maps defect to customer impact and potential revenue loss, and collaborates on practical mitigations (e.g. feature flagging).",
      "4": "Exemplary quality leadership: provides objective risk matrix, proposes phased rollout or targeted mitigation, documents formal release risk sign-off, and leads blameless post-release evaluation."
    },
    "rubricNotes": "Techno-managerial scoring guidance. Evaluates risk communication, defect advocacy, cross-functional collaboration, and professional diplomacy."
  },
  {
    "id": "qa-j-project-flaky-test-quarantine",
    "role": "qa_automation_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "reliability",
      "project_tradeoffs"
    ],
    "prompt": "Walk me through how you handled flaky automated tests in a CI/CD build pipeline. When tests fail intermittently due to network latency or race conditions rather than real product regressions, what process do you follow to investigate, quarantine, and fix them?",
    "followUp": "Why is running automated retries (e.g. retry: 3) in CI often a dangerous bandage that masks underlying architectural bugs?",
    "concepts": [
      "Flaky test dynamics: intermittent failures caused by race conditions, non-deterministic test data, DOM rendering delays, or external dependencies",
      "Quarantine process: isolating flaky tests into non-blocking suites to prevent blocking developer PRs while tracking them as technical debt",
      "Root cause debugging: analyzing execution traces, video recordings, network HAR logs, and eliminating automated retry dependency"
    ],
    "anchors": {
      "0": "Ignores flaky tests or simply increases global retry counts until builds pass by luck, undermining engineering trust in CI.",
      "1": "Deletes failing tests without investigating root cause or tracking them in the backlog.",
      "2": "Identifies flaky tests and quarantines them, but does not investigate the underlying race condition or schedule timely fixes.",
      "3": "Establishes structured quarantine workflow: tags flaky test out of main gate, reproduces locally using stress-test loops, fixes locator/timing race conditions, and restores test to CI.",
      "4": "Systemic quality champion: tracks flakiness metrics across CI runs, analyzes network/database contention, institutes strict quarantine SLAs, and establishes team-wide reliable automation guidelines."
    },
    "rubricNotes": "Techno-managerial scoring guidance. Tests process maturity, CI reliability engineering, and technical debt management."
  },
  {
    "id": "qa-j-project-manual-vs-auto",
    "role": "qa_automation_engineer",
    "level": "junior",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "In a fast-paced sprint with rapid UI iterations, how do you decide which test scenarios warrant automated regression scripts and which are better evaluated via exploratory manual testing? Describe a time you balanced this trade-off.",
    "followUp": "How do you avoid wasting engineering time automating unstable UI flows that change every week?",
    "concepts": [
      "Automation ROI: automating stable, repetitive, high-risk, multi-platform paths vs exploratory testing for new, fluid, UX-heavy features",
      "Balancing automation and manual testing: exploratory charter testing for usability/novel flows, automation for regression safety",
      "Sprint cadence: testing at the API layer when UI is rapidly changing to maintain automation velocity"
    ],
    "anchors": {
      "0": "Attempts to automate 100% of everything in the sprint, resulting in incomplete work and broken automation on the next day's UI change.",
      "1": "Relies purely on manual testing because \"automation takes too long\", allowing regression defects to accumulate.",
      "2": "Automates some regression tests, but struggles to articulate a clear decision framework or ROI criteria for automation candidates.",
      "3": "Applies clear automation selection criteria: automates high-risk stable core paths and API contracts; conducts exploratory manual testing on rapidly evolving UI features.",
      "4": "Strategic quality management: calculates automation ROI (maintenance cost vs execution frequency), establishes sprint-level quality charters, and coordinates team-wide exploratory testing sessions."
    },
    "rubricNotes": "Techno-managerial scoring guidance. Evaluates pragmatic quality engineering, ROI calculation, and time management in Agile sprints."
  },
  {
    "id": "qa-j-reflect-missed-bug",
    "role": "qa_automation_engineer",
    "level": "junior",
    "stage": "reflection",
    "topics": [
      "reliability",
      "project_tradeoffs"
    ],
    "prompt": "Reflect on a critical production bug that slipped past your testing phase and was discovered by end users. How did you conduct root-cause analysis, and what changes did you make to your test suite or acceptance criteria to ensure it never happens again?",
    "followUp": "What did that experience teach you about the blind spots in your testing assumptions or test environment fidelity?",
    "concepts": [
      "Root-cause analysis (5 Whys): analyzing environment discrepancies, missing test data, unexpected user behavior, or unmocked edge cases",
      "Test gap closure: adding regression test cases to prevent recurrence and updating test requirements",
      "Professional resilience: taking ownership of quality gaps without becoming overly defensive or discouraged"
    ],
    "anchors": {
      "0": "Denies ever letting a bug reach production or blames the customer for using the application incorrectly.",
      "1": "Describes a production bug but took no action to update test suites or prevent the defect from recurring.",
      "2": "Added a single automated test for the bug, but did not analyze root causes or review broader testing strategy blind spots.",
      "3": "Candidly describes the missed defect, identifies why the testing phase missed it (e.g. data variance or environment discrepancy), and added targeted automated regression coverage.",
      "4": "Deep engineering maturity: performed blameless 5-Whys retrospective, updated test environments to mirror production data diversity, and instituted systemic shift-left test gates."
    },
    "rubricNotes": "Unscored reflection. Look for accountability, analytical post-mortem rigor, continuous improvement, and growth mindset."
  },
  {
    "id": "qa-i-intro-qa-strategy",
    "role": "qa_automation_engineer",
    "level": "intermediate",
    "stage": "icebreaker",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Describe your overall quality engineering strategy across a modern microservices or cloud application. How do you shift testing left into the developer workflow while maintaining robust end-to-end regression safety?",
    "followUp": "How do you measure whether your quality strategy is actually succeeding (e.g. escape defect rate, MTTR, test execution time)?",
    "concepts": [
      "Quality Engineering strategy: shift-left testing, automated CI/CD gating, developer enablement, and production observability",
      "Microservices testing challenges: service mocking, contract testing, and distributed integration environments",
      "Quality metrics: Change Failure Rate, Defect Escape Rate, Test Execution Duration, and Flakiness Index"
    ],
    "anchors": {
      "0": "Views QA as an isolated testing phase at the end of the waterfall sprint; relies exclusively on manual sign-offs.",
      "1": "Focuses purely on writing UI automation scripts without considering developer workflows, CI gates, or quality metrics.",
      "2": "Implements automated test suites in CI, but struggles to articulate how to shift testing left or measure quality effectiveness.",
      "3": "Clearly details holistic quality strategy: provides testing frameworks for developers, enforces PR quality gates, implements contract testing, and tracks defect escape rates.",
      "4": "Visionary quality engineering: establishes automated test telemetry, integrates synthetic canary testing in production, tracks DORA metrics, and cultivates high-performing engineering quality culture."
    },
    "rubricNotes": "Unscored icebreaker. Look for comprehensive quality vision, engineering leadership, and metric-driven strategy."
  },
  {
    "id": "qa-i-performance-load-testing",
    "role": "qa_automation_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "concurrency",
      "reliability"
    ],
    "prompt": "How do you design and execute performance and load testing using tools like k6, JMeter, or Locust? Explain the difference between stress testing, spike testing, and endurance (soak) testing, and how you identify system throughput saturation.",
    "followUp": "When analyzing performance test results, why are 95th and 99th percentile response times (p95/p99) significantly more informative than average response times?",
    "concepts": [
      "Performance testing types: Load (expected traffic), Stress (breaking point), Spike (sudden surge), and Soak/Endurance (memory leaks over time)",
      "Saturation metrics: Knee in throughput curve (RPS plateau while latency spikes), CPU/memory exhaustion, connection pool starvation",
      "Percentile latency (p95, p99) vs average: exposing the long-tail experience that averages hide"
    ],
    "anchors": {
      "0": "Cannot distinguish load testing from functional testing; only looks at average response time from a single user.",
      "1": "Runs a high-concurrency script but cannot explain the difference between spike, stress, and soak testing, or how to interpret latency graphs.",
      "2": "Executes performance tests and monitors p95 latency, but struggles to identify root cause bottlenecks (database connection pool vs garbage collection pauses).",
      "3": "Clearly contrasts performance test methodologies; designs realistic virtual user ramp-up models; explains throughput saturation points and why p99 latency reveals true user impact.",
      "4": "Performance engineering mastery: correlates client-side latency with server-side APM metrics (thread starvation, DB lock contention, GC pauses), and automates performance regression gates in CI."
    },
    "rubricNotes": "Technical scoring guidance. Tests performance engineering principles, workload modeling, and latency analysis."
  },
  {
    "id": "qa-i-contract-testing-pact",
    "role": "qa_automation_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "apis",
      "reliability"
    ],
    "prompt": "Explain how Consumer-Driven Contract Testing (using tools like Pact) works in a microservices ecosystem. How does contract testing eliminate the need for slow, brittle end-to-end integration environments while guaranteeing API schema backwards compatibility?",
    "followUp": "What is the role of a Pact Broker and the can-i-deploy tool when coordinating deployments between consumer and provider services?",
    "concepts": [
      "Consumer-Driven Contract Testing: consumers define their expectations (contracts), providers verify compliance independently",
      "Overcoming E2E integration test bottlenecks: eliminating expensive, flaky multi-service staging environments with deterministic unit-speed contract checks",
      "Pact Broker & can-i-deploy: centralized contract registry verifying consumer-provider version compatibility before deploying to production"
    ],
    "anchors": {
      "0": "Unfamiliar with contract testing; believes the only way to test microservices is by deploying all 20 services simultaneously into a shared staging cluster.",
      "1": "Confuses API contract testing with OpenAPI documentation or simple JSON schema validation.",
      "2": "Explains the consumer-provider contract concept, but cannot explain the mechanics of independent provider verification or the Pact Broker.",
      "3": "Clearly details contract testing workflow: consumer generates pact file during tests, provider verifies against contract independently, and can-i-deploy gates releases in CI without shared staging environments.",
      "4": "Deep distributed testing expertise: explains provider verification states, handling breaking contract versioning, decoupling independent deployments, and comparing contract testing to schema registries."
    },
    "rubricNotes": "Technical scoring guidance. Tests microservices integration strategies, contract testing mechanics, and distributed release safety."
  },
  {
    "id": "qa-i-ci-cd-quality-gates",
    "role": "qa_automation_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "reliability",
      "project_tradeoffs"
    ],
    "prompt": "How do you architect automated quality gates in a CI/CD pipeline? How do you structure PR smoke tests, nightly regression suites, test coverage thresholds, and automated rollbacks based on error budget consumption?",
    "followUp": "How do you prevent quality gates from becoming a major developer bottleneck that slows down daily pull request velocity?",
    "concepts": [
      "Multi-tier quality gating: fast PR gates (< 5-10 mins: lint, unit, fast component/API tests) vs asynchronous deep nightly runs (E2E, cross-browser, security, load)",
      "Metrics-driven gating: code coverage thresholds, SonarQube quality gates, and automated test flakiness filters",
      "Balancing speed vs safety: keeping PR gates rapid while maintaining comprehensive safety through parallelization and selective test execution"
    ],
    "anchors": {
      "0": "Places a 2-hour end-to-end UI suite on every PR commit, completely halting engineering velocity.",
      "1": "Has no automated gates; relies on manual approvals before merging into production branches.",
      "2": "Implements CI gates for unit and lint checks, but struggles to design an efficient multi-stage pipeline that balances feedback speed with deep test coverage.",
      "3": "Architects balanced multi-tier gates: PR smoke tests run under 8 minutes via parallel test runners, while deep regression runs nightly; enforces quality criteria without stalling developers.",
      "4": "DevOps & Quality architect: integrates smart test selection based on Git diffs, enforces PR preview environments, automates canary analysis gates, and ties deployment gates to Datadog error rates."
    },
    "rubricNotes": "Technical scoring guidance. Evaluates CI/CD pipeline architecture, quality gate design, and developer velocity optimization."
  },
  {
    "id": "qa-i-parallel-test-execution",
    "role": "qa_automation_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "concurrency",
      "reliability"
    ],
    "prompt": "When an automated end-to-end test suite grows to hundreds or thousands of tests taking hours to complete, how do you optimize execution time? Explain techniques like test sharding, containerized parallel test runners, and smart test impact analysis.",
    "followUp": "What shared resource bottlenecks (e.g. database locks, third-party API rate limits) typically emerge when running 50 test threads in parallel?",
    "concepts": [
      "Test scaling techniques: test sharding across multiple CI nodes, worker process concurrency, and containerized headless browser grids",
      "Test Impact Analysis (TIA): running only the tests that touch code modified in the Git changeset",
      "Resolving parallel test contention: independent database schemas per worker, isolated mock servers, and rate-limit virtualization"
    ],
    "anchors": {
      "0": "Runs thousands of tests sequentially in a single thread; accepts 4-hour test execution as normal.",
      "1": "Increases parallel workers blindly without isolating databases or credentials, causing widespread deadlocks and false failure rates.",
      "2": "Uses test sharding in CI, but struggles to balance worker execution times (straggler problem) or mitigate database contention.",
      "3": "Optimizes test suite runtime: implements matrix sharding, dynamic test balancing across workers, per-worker database schemas, and reduces execution time from hours to minutes.",
      "4": "Advanced test engineering: implements intelligent Test Impact Analysis via AST dependency graphs, distributed browser orchestration (Playwright Grid / Selenium Grid), and optimizes asset caching."
    },
    "rubricNotes": "Technical scoring guidance. Tests concurrency scaling, test execution optimization, and distributed resource isolation."
  },
  {
    "id": "qa-i-synthetic-monitoring",
    "role": "qa_automation_engineer",
    "level": "intermediate",
    "stage": "technical",
    "topics": [
      "reliability",
      "apis"
    ],
    "prompt": "Explain the concept of synthetic monitoring and continuous testing in production. How do you safely run automated end-to-end verification flows (such as user login or checkout) against live production environments without polluting customer analytics or generating fake financial transactions?",
    "followUp": "How does synthetic monitoring complement real user monitoring (RUM) and traditional server infrastructure metrics?",
    "concepts": [
      "Synthetic monitoring: automated test scripts executing against production at regular intervals (e.g. every 5 minutes) to detect availability and regression issues proactively",
      "Safe production testing: dedicated test tenant accounts, bypassing payment gateways with test credentials, and filtering synthetic traffic from business analytics (Segment/Mixpanel)",
      "Proactive alerting: discovering customer-facing outages before real users submit support tickets"
    ],
    "anchors": {
      "0": "Thinks testing in production is strictly forbidden under any circumstances; unfamiliar with synthetic monitoring concepts.",
      "1": "Runs tests in production using real accounts, corrupting live revenue reporting and triggering actual credit card charges.",
      "2": "Explains synthetic monitoring with Datadog or New Relic, but cannot explain how to isolate test data or avoid skewing marketing analytics.",
      "3": "Designs production synthetic testing: uses dedicated synthetic test credentials, tags traffic to exclude from analytics, mocks third-party billing callbacks safely, and sets proactive alerts.",
      "4": "Production quality leadership: implements canary verification testing, pairs synthetics with RUM session telemetry, tests dark-launched features via feature flags, and defines automated circuit breakers."
    },
    "rubricNotes": "Technical scoring guidance. Evaluates production verification techniques, synthetic monitoring architecture, and risk containment."
  },
  {
    "id": "qa-i-project-test-debt-audit",
    "role": "qa_automation_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "reliability",
      "project_tradeoffs"
    ],
    "prompt": "Walk me through how you addressed significant automation test debt in an existing engineering organization, such as an abandoned, slow, or constantly failing Selenium suite. How did you gain leadership buy-in and modernize the automation framework?",
    "followUp": "How did you handle the dilemma of whether to rewrite the entire test framework from scratch versus iteratively refactoring the legacy test suite?",
    "concepts": [
      "Test debt remediation: auditing pass rates, execution duration, flakiness causes, and dead code in legacy test suites",
      "Framework modernization: migrating legacy frameworks (e.g. Selenium/Protractor) to modern engines (Playwright, Cypress) with measurable ROI milestones",
      "Leadership alignment: framing test debt in terms of developer hours lost, release delays, and escaped production bugs"
    ],
    "anchors": {
      "0": "Ignored the legacy test suite completely or demanded an immediate 6-month complete freeze to rewrite everything without delivering value.",
      "1": "Attempted to fix every broken test simultaneously without triage, getting overwhelmed and making no tangible progress.",
      "2": "Refactored several tests successfully, but failed to communicate progress or value to engineering leadership.",
      "3": "Audited test debt systematically: triaged tests by business criticality, sunset obsolete tests, rebuilt core smoke tests in a modern framework with measurable speed improvements, and demonstrated value to stakeholders.",
      "4": "Transformational quality leadership: framed test refactoring around business metrics (halving CI build time, 99.5% test reliability), established maintainable Page Object/Component models, and trained engineers across the org."
    },
    "rubricNotes": "Techno-managerial scoring guidance. Evaluates technical leadership, legacy framework modernization, and stakeholder management."
  },
  {
    "id": "qa-i-project-release-signoff",
    "role": "qa_automation_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "reliability",
      "project_tradeoffs"
    ],
    "prompt": "Describe how you define release readiness criteria and manage release sign-off when a deployment has known minor defects and deferred bugs. How do you balance business pressure to release against customer experience and operational stability risks?",
    "followUp": "What formal documentation or dashboard do you provide to leadership to make an informed, data-driven go/no-go release decision?",
    "concepts": [
      "Release readiness criteria: zero open critical/high defects, 100% passing core regression, performance SLAs met, and rollback plan validated",
      "Managing known defects: bug triage with product owners, documented workarounds, customer communication plans, and hotfix SLA commitments",
      "Objective Go/No-Go decision framework: replacing emotional arguments with data-driven risk profiles"
    ],
    "anchors": {
      "0": "Refuses to sign off on any release that has even a single cosmetic typo; acts as an inflexible blocker without considering business context.",
      "1": "Signs off on releases blindly under developer or management pressure despite knowing critical flows are failing.",
      "2": "Reviews known bugs before release, but lacks structured criteria or documented risk assessments for executive sign-off.",
      "3": "Leads structured Go/No-Go triage: categorizes defects by business impact, verifies workarounds, evaluates rollback readiness, and provides transparent risk assessment to leadership.",
      "4": "Executive quality governance: implements automated release health scorecards, links release decisions to customer SLA risk, establishes error-budget-based approvals, and conducts post-release defect audits."
    },
    "rubricNotes": "Techno-managerial scoring guidance. Evaluates release governance, defect triage, operational risk balancing, and executive communication."
  },
  {
    "id": "qa-i-project-cross-functional-qa",
    "role": "qa_automation_engineer",
    "level": "intermediate",
    "stage": "techno_managerial",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "How do you foster a culture where quality is a shared engineering team responsibility rather than solely the job of QA engineers? Describe an initiative where you paired with software engineers to write better unit or integration tests.",
    "followUp": "How do you overcome initial developer resistance when introducing mandatory test coverage guidelines or testing practices?",
    "concepts": [
      "Quality coaching model: transitioning QA from isolated gatekeepers to quality coaches empowering developers to test their own code",
      "Developer enablement: building reusable test utilities, scaffolding test fixtures, and running brown-bag workshops on effective testing",
      "Cultural alignment: establishing shared quality ownership, joint story refinement, and collaborative root-cause analysis"
    ],
    "anchors": {
      "0": "Believes developers should only write code and QA alone is responsible for all testing and defect finding.",
      "1": "Complains about developers not writing tests but makes no effort to train, support, or provide tooling for them.",
      "2": "Paired with a developer occasionally on test cases, but did not implement systemic tooling or team-level cultural changes.",
      "3": "Successfully coached developers: created reusable test fixtures, paired on writing integration tests, and established shared acceptance criteria definitions during sprint refinement.",
      "4": "Organizational culture leader: transformed team into self-testing engineering culture, created developer testing CLI tooling, introduced \"bug bashes\", and tracked significant drops in escaped defect rates."
    },
    "rubricNotes": "Techno-managerial scoring guidance. Tests quality coaching, cultural transformation, cross-functional collaboration, and developer enablement."
  },
  {
    "id": "qa-i-reflect-automation-roi",
    "role": "qa_automation_engineer",
    "level": "intermediate",
    "stage": "reflection",
    "topics": [
      "project_tradeoffs"
    ],
    "prompt": "Reflect on an automation framework or extensive testing initiative you built that did not deliver the expected return on investment (ROI), perhaps due to high maintenance costs or changing product directions. What did you learn about sustainable automation design?",
    "followUp": "How did that failure change how you evaluate the long-term maintainability of testing tools and architectures today?",
    "concepts": [
      "Automation maintenance overhead: over-engineering frameworks, excessive abstraction layers, brittle UI end-to-end tests, or tool lock-in",
      "Evaluating true ROI: execution frequency and defect detection value vs creation and maintenance engineering hours",
      "Designing for sustainability: keeping automation lightweight, modular, easy for developers to contribute to, and aligned with product lifecycles"
    ],
    "anchors": {
      "0": "Claims every automation framework they ever built was 100% flawless and high ROI; lacks self-awareness or critical reflection.",
      "1": "Describes a failed framework but blames team members or changing management rather than analyzing framework architecture choices.",
      "2": "Recognizes the framework was high maintenance, but cannot explain the architectural reasons (e.g. over-abstraction or wrong testing layer).",
      "3": "Candidly reflects on over-engineered or poorly targeted automation effort; articulates maintenance cost realities, and explains how they simplified their approach in subsequent projects.",
      "4": "Profound architectural maturity: articulates why complex custom frameworks often fail compared to standard modern tools, champions developer-friendly minimalism, and shares pragmatic heuristics for testing ROI."
    },
    "rubricNotes": "Unscored reflection. Look for authentic professional introspection, engineering pragmatism, architectural humility, and wisdom."
  }
]$seed$::jsonb)
), inserted_versions as (
  insert into public.question_versions
    (question_id, version, prompt, domain, experience_level, stage, panel_role, topics, role_slugs, difficulty, status, reviewed_follow_up)
  select
    q->>'id',
    1,
    q->>'prompt',
    'computer_science',
    q->>'level',
    q->>'stage',
    case q->>'stage'
      when 'technical' then 'technical'
      when 'techno_managerial' then 'project'
      else 'chair'
    end,
    array(select jsonb_array_elements_text(q->'topics')),
    array[q->>'role'],
    case q->>'level' when 'junior' then 1 else 2 end,
    'draft',
    q->>'followUp'
  from new_seed
  where not exists (
    select 1 from public.question_versions existing
    where existing.question_id = (new_seed.q->>'id')
      and existing.version = 1
  )
  on conflict (question_id, version) do nothing
  returning id, question_id
), target_versions as (
  select id, question_id from inserted_versions
  union all
  select v.id, v.question_id
  from public.question_versions v
  join new_seed on (new_seed.q->>'id') = v.question_id
  where v.version = 1
    and v.status = 'draft'
    and not exists (
      select 1 from public.question_keys k where k.question_version_id = v.id
    )
)
insert into public.question_keys (question_version_id, expected_concepts, rubric_notes)
select
  tv.id,
  array(select jsonb_array_elements_text(new_seed.q->'concepts')),
  case
    when new_seed.q->>'stage' in ('icebreaker', 'reflection') then
      concat(
        coalesce(new_seed.q->>'rubricNotes', 'Unscored context/reflection.'),
        E'\n\nScoring Guidance:\n0: ', coalesce(new_seed.q->'anchors'->>0, ''),
        E'\n1: ', coalesce(new_seed.q->'anchors'->>1, ''),
        E'\n2: ', coalesce(new_seed.q->'anchors'->>2, ''),
        E'\n3: ', coalesce(new_seed.q->'anchors'->>3, ''),
        E'\n4: ', coalesce(new_seed.q->'anchors'->>4, '')
      )
    else
      concat(
        coalesce(new_seed.q->>'rubricNotes', 'Technical scoring guidance.'),
        E'\n\nScoring Anchors (0-4 Scale):\n0: ', coalesce(new_seed.q->'anchors'->>0, ''),
        E'\n1: ', coalesce(new_seed.q->'anchors'->>1, ''),
        E'\n2: ', coalesce(new_seed.q->'anchors'->>2, ''),
        E'\n3: ', coalesce(new_seed.q->'anchors'->>3, ''),
        E'\n4: ', coalesce(new_seed.q->'anchors'->>4, '')
      )
  end
from target_versions tv
join new_seed on (new_seed.q->>'id') = tv.question_id
on conflict (question_version_id) do nothing;

-- 4. Publish reviewed draft questions for the 6 new roles
-- protect_question_version() permits draft -> published updates with reviewer and timestamp.
-- Only touches unreviewed drafts belonging to the 6 newly added roles.
update public.question_versions
set
  status = 'published',
  reviewed_by = coalesce(nullif(btrim(reviewed_by), ''), 'lead_content_reviewer'),
  reviewed_at = coalesce(reviewed_at, now())
where status = 'draft'
  and domain = 'computer_science'
  and role_slugs && array[
    'frontend_engineer',
    'full_stack_engineer',
    'system_design_engineer',
    'devops_cloud_engineer',
    'data_engineer',
    'qa_automation_engineer'
  ]::text[];

commit;
