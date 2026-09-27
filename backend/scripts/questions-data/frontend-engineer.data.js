export const FRONTEND_QUESTIONS = [
  // ===================== JUNIOR QUESTIONS (1 to 10) =====================
  {
    id: 'fe-j-intro-app',
    role: 'frontend_engineer',
    level: 'junior',
    stage: 'icebreaker',
    topics: ['project_tradeoffs'],
    prompt: 'Describe a frontend web application or component you built with React or modern JavaScript. What user problem did it solve, and what part did you personally architect?',
    followUp: 'What was the trickiest UI state or user interaction you had to debug while writing that code?',
    concepts: [
      'Concrete application scope and user goal',
      'Specific component architecture and personal contribution',
      'Reflection on component limitations or design lessons learned'
    ],
    anchors: {
      0: 'Cannot describe any frontend code or component they personally created.',
      1: 'Describes a generic tutorial or boilerplate app without identifying personal implementation details.',
      2: 'Explains what the app does and identifies components, but provides minimal insight into state or trade-offs.',
      3: 'Clearly details component structure, state management, API data flow, and at least one user interaction challenge.',
      4: 'Exemplary clarity: describes component hierarchy, accessibility considerations, state boundaries, and how they would refactor it.'
    },
    rubricNotes: 'Unscored icebreaker. Look for authentic ownership, clear technical articulation, and honest boundaries.'
  },
  {
    id: 'fe-j-comp-lifecycle',
    role: 'frontend_engineer',
    level: 'junior',
    stage: 'technical',
    topics: ['concurrency'],
    prompt: 'A parent component fetches user data and re-renders frequently. Explain why child components might re-render unnecessarily, and how you would prevent wasteful DOM updates.',
    followUp: 'When would wrapping a callback in useCallback or a component in React.memo introduce more overhead than it saves?',
    concepts: [
      'Virtual DOM reconciliation and parent-child re-render cascade',
      'Memoization techniques (React.memo, useMemo, useCallback) and reference equality',
      'Understanding when memoization overhead exceeds rendering cost'
    ],
    anchors: {
      0: 'Believes child components only re-render if their own internal state changes.',
      1: 'Knows React re-renders children when parents update, but cannot explain object/function reference equality.',
      2: 'Explains React.memo and props comparison, but cannot explain when function recreations break memoization.',
      3: 'Coherently explains reference equality of objects/callbacks, props shallow comparison, and proper use of useCallback/useMemo.',
      4: 'Deep rendering insights: explains reconciliation diffing, state collocation, children-as-props composition patterns, and profiling tools.'
    },
    rubricNotes: 'Technical scoring guidance. Focus on virtual DOM understanding and practical performance optimization.'
  },
  {
    id: 'fe-j-state-management',
    role: 'frontend_engineer',
    level: 'junior',
    stage: 'technical',
    topics: ['reliability'],
    prompt: 'Compare managing state in local component state (like useState) versus lifting state up or using context. When does passing props down become problematic?',
    followUp: 'What performance drawback can occur when multiple unrelated components consume a large shared Context?',
    concepts: [
      'Prop drilling limitations and component coupling',
      'Lifting state up to the nearest common ancestor',
      'Context API broadcast re-renders and state collocation'
    ],
    anchors: {
      0: 'Cannot articulate the difference between local state and global/context state.',
      1: 'Suggests putting all application state into global context to avoid passing props entirely.',
      2: 'Explains prop drilling and lifting state up, but does not recognize Context re-render performance implications.',
      3: 'Articulates when local state is preferable, how lifting state resolves shared needs, and Context usage with separate dispatch/state.',
      4: 'Mastery of state boundaries: explains state collocation, server-cache vs client-UI state separation, and selective context slicing.'
    },
    rubricNotes: 'Technical scoring guidance. Rewards sound state architecture and avoiding premature global state.'
  },
  {
    id: 'fe-j-api-loading-error',
    role: 'frontend_engineer',
    level: 'junior',
    stage: 'technical',
    topics: ['apis'],
    prompt: 'When calling a REST API from a web UI, explain how you represent loading, empty, success, and error states. What HTTP status codes trigger user-visible retry flows?',
    followUp: 'How do you prevent showing an empty state while the initial data fetch is still in flight?',
    concepts: [
      'Explicit UI state machine (idle, loading, success, error, empty)',
      'HTTP status handling (4xx client validation vs 5xx server failure)',
      'User-friendly retry actions and preventing layout flickering'
    ],
    anchors: {
      0: 'Only handles the happy path, leaving the UI hanging indefinitely on network failure.',
      1: 'Displays a generic alert box on error but leaves loading and empty states unhandled.',
      2: 'Tracks isLoading and error booleans, but risks contradictory state (e.g. loading and error both true).',
      3: 'Implements mutually exclusive state machine or discriminated union; clearly differentiates 404, 401/403, and 500 error handling.',
      4: 'Production resilience: details skeleton loaders, optimistic UI updates, error boundary integration, and exponential backoff retry.'
    },
    rubricNotes: 'Technical scoring guidance. Emphasizes robust async UX and resilient error recovery.'
  },
  {
    id: 'fe-j-forms-validation',
    role: 'frontend_engineer',
    level: 'junior',
    stage: 'technical',
    topics: ['apis'],
    prompt: 'On a registration form, how do you handle client-side form validation versus server-side validation? What happens if a user submits whitespace or bypasses client validation?',
    followUp: 'Why is client-side validation considered a UX enhancement rather than a security boundary?',
    concepts: [
      'Client validation for instant UX feedback and server validation for authoritative security',
      'Input sanitization, trimming whitespace, and schema constraints',
      'Handling server validation errors and mapping them back to specific form fields'
    ],
    anchors: {
      0: 'Assumes client-side HTML5 validation is sufficient to protect the database.',
      1: 'Acknowledges server validation is needed but cannot describe how server error responses are surfaced to users.',
      2: 'Validates on both ends; checks required fields and email formats, but handles errors globally rather than field-level.',
      3: 'Clearly separates UX feedback (client) from security (server); trims whitespace; maps field-level 422 errors to input components.',
      4: 'Comprehensive form engineering: uses schema libraries (Zod/Yup), handles async availability checks (e.g. username taken), and accessibility focus.'
    },
    rubricNotes: 'Technical scoring guidance. Checks security boundary understanding and form error mapping.'
  },
  {
    id: 'fe-j-responsive-css',
    role: 'frontend_engineer',
    level: 'junior',
    stage: 'technical',
    topics: ['project_tradeoffs'],
    prompt: 'How do you structure CSS or layout styles to ensure a data table or grid is usable on both 360px mobile screens and 1440px desktop monitors without horizontal clipping?',
    followUp: 'How do you decide between wrapping rows into card layouts versus using a horizontally scrollable container on mobile?',
    concepts: [
      'Mobile-first responsive design using media queries, Flexbox, and CSS Grid',
      'Table transformation patterns: card view vs horizontal scroll containers',
      'Preventing content overflow and maintaining legible typography'
    ],
    anchors: {
      0: 'Hardcodes fixed pixel widths causing broken horizontal scrolling on mobile.',
      1: 'Uses basic media queries but has no coherent strategy for displaying tabular data on small viewports.',
      2: 'Wraps table in overflow-x: auto; understands viewport units but misses touch usability enhancements.',
      3: 'Proposes transforming tabular rows into stacked cards on mobile or uses sticky headers with smooth horizontal scroll.',
      4: 'Exemplary responsive layout: leverages CSS container queries, touch-friendly touch targets, responsive typography clamp(), and ARIA roles.'
    },
    rubricNotes: 'Technical scoring guidance. Focuses on CSS layout fundamentals and mobile UX.'
  },
  {
    id: 'fe-j-project-accessibility',
    role: 'frontend_engineer',
    level: 'junior',
    stage: 'techno_managerial',
    topics: ['reliability'],
    prompt: 'A designer delivers modal dialogs and dropdown menus that lack keyboard navigation and screen-reader labels. How do you prioritize and advocate for accessibility fixes before launch?',
    followUp: 'What automated tools and manual keyboard checks would you integrate into the PR review process?',
    concepts: [
      'WCAG compliance as a core engineering standard, not an optional feature',
      'Key accessibility requirements: keyboard trap, focus management, ARIA labels',
      'Constructive collaboration with design and product stakeholders'
    ],
    anchors: {
      0: 'Considers accessibility optional and dismisses keyboard navigation as edge-case behavior.',
      1: 'Agrees accessibility is good but says they would only fix it if product manager explicitly assigns a ticket.',
      2: 'Knows about alt text and basic aria labels, but cannot explain focus trapping in modal dialogs.',
      3: 'Explains focus trapping, Esc key dismissal, tab order, and communicates legal/usability risks constructively to the team.',
      4: 'Leadership mindset: suggests lint rules (jsx-a11y), automated axe-core CI checks, and works with design to create accessible specs.'
    },
    rubricNotes: 'Techno-managerial guidance. Evaluates technical standards advocacy and cross-functional communication.'
  },
  {
    id: 'fe-j-project-bundle-size',
    role: 'frontend_engineer',
    level: 'junior',
    stage: 'techno_managerial',
    topics: ['project_tradeoffs'],
    prompt: 'A frontend pull request imports a 2MB charting library for a single sparkline graph. How do you evaluate whether to accept the dependency or find a lighter alternative?',
    followUp: 'If the team agrees the full library is unnecessary, how would you implement the sparkline with minimal footprint?',
    concepts: [
      'Impact of JavaScript bundle size on initial load and mobile parse time',
      'Dependency evaluation: tree-shaking, bundle analyzers, lightweight alternatives',
      'Writing constructive code review feedback advocating for performance'
    ],
    anchors: {
      0: 'Approves the PR without hesitation, believing library size does not matter on modern broadband.',
      1: 'Recognizes 2MB is large, but does not know how to inspect bundle cost or tree-shaking support.',
      2: 'Suggests finding another library or using dynamic import, but does not measure the actual bundle delta.',
      3: 'Uses bundle analysis tools (like bundlephobia or rollup-plugin-visualizer); suggests lightweight SVG or micro-libraries.',
      4: 'Deep performance advocacy: weighs dynamic import code-splitting vs inline SVG, discusses mobile CPU parse overhead, and guides the author.'
    },
    rubricNotes: 'Techno-managerial guidance. Evaluates pragmatism, performance awareness, and peer review tact.'
  },
  {
    id: 'fe-j-project-browser-bug',
    role: 'frontend_engineer',
    level: 'junior',
    stage: 'techno_managerial',
    topics: ['reliability'],
    prompt: 'A bug report states that dropdown menus fail to open on iOS Safari but work on Chrome desktop. Walk through how you reproduce, isolate, and debug this browser-specific issue.',
    followUp: 'How do touch event models (touchstart/touchend) differ from click events on iOS mobile devices?',
    concepts: [
      'Cross-browser debugging workflow (remote debugging Safari via Web Inspector)',
      'Touch vs mouse event dispatch differences and hover state behavior',
      'Defensive cross-browser CSS/JS practices and polyfill considerations'
    ],
    anchors: {
      0: 'Dismisses the bug as a user device issue because it works on their local Chrome browser.',
      1: 'Tries random CSS changes blindly on desktop without reproducing on an actual iOS simulator or device.',
      2: 'Connects device or simulator to Safari Web Inspector; identifies click vs touch event issues but struggles with fix.',
      3: 'Systematically isolates root cause using remote Web Inspector; inspects pointer events, touch handlers, and CSS z-index/transform stacking.',
      4: 'Exemplary cross-platform engineering: explains iOS Safari 300ms click delay legacy, passive listeners, pointer events API, and regression tests.'
    },
    rubricNotes: 'Techno-managerial guidance. Focuses on systematic diagnostic methodology under cross-browser variance.'
  },
  {
    id: 'fe-j-reflect-ui-improvement',
    role: 'frontend_engineer',
    level: 'junior',
    stage: 'reflection',
    topics: ['project_tradeoffs'],
    prompt: 'Think of a UI interaction or component you worked on recently. With another hour of time, what visual or behavioral edge case would you refine, and how would you test it?',
    followUp: 'How would you verify that your refinement did not break existing interactions for power users?',
    concepts: [
      'Self-awareness of personal code limitations and incomplete edge cases',
      'Specific refinement (micro-interactions, error states, keyboard shortcuts)',
      'Verifiable testing methodology (visual regression, unit tests, manual checks)'
    ],
    anchors: {
      0: 'Claims their UI code was already flawless and required zero refinement.',
      1: 'Mentions vague aesthetic tweaks without identifying concrete interaction edge cases.',
      2: 'Identifies an edge case (e.g. long text overflow) but offers only generic manual verification.',
      3: 'Articulates a clear edge case (e.g. rapid toggling, keyboard focus, screen reader announcement) and a concrete verification step.',
      4: 'Exceptional craft: details specific UX micro-behaviors, motion accessibility (prefers-reduced-motion), and automated component test verification.'
    },
    rubricNotes: 'Unscored reflection. Reward intellectual honesty, engineering craft, and verifiable follow-through.'
  },

  // ===================== INTERMEDIATE QUESTIONS (11 to 20) =====================
  {
    id: 'fe-i-intro-architecture',
    role: 'frontend_engineer',
    level: 'intermediate',
    stage: 'icebreaker',
    topics: ['project_tradeoffs'],
    prompt: 'Describe a complex frontend architecture decision you made, such as state synchronization, micro-frontends, or design system tokens. What trade-offs did you encounter?',
    followUp: 'Looking back, would you make the same architectural choice today or adopt a simpler alternative?',
    concepts: [
      'Significant architectural challenge and business context',
      'Deliberate trade-off evaluation (e.g. flexibility vs complexity, build time vs runtime)',
      'Honest post-implementation appraisal and lessons learned'
    ],
    anchors: {
      0: 'Cannot articulate any architectural choices or claims they simply followed standard template defaults.',
      1: 'Describes a standard feature implementation without explaining why specific architectural patterns were chosen.',
      2: 'Explains an architectural setup (e.g. Redux Toolkit or monorepo) but focuses only on benefits without trade-offs.',
      3: 'Thoroughly discusses technical constraints, team ergonomics, trade-offs between competing approaches, and measurable outcomes.',
      4: 'Senior architectural maturity: discusses long-term maintenance overhead, team cognitive load, operational telemetry, and evolutionary design.'
    },
    rubricNotes: 'Unscored icebreaker. Look for architectural maturity, trade-off honesty, and systems thinking.'
  },
  {
    id: 'fe-i-virtual-rendering',
    role: 'frontend_engineer',
    level: 'intermediate',
    stage: 'technical',
    topics: ['concurrency'],
    prompt: 'A dashboard table needs to display 25,000 live updating rows without degrading browser FPS. Explain how DOM virtualization works and how you prevent frame drops.',
    followUp: 'How do you handle dynamic row heights when calculating scroll offset and total container height in a virtual list?',
    concepts: [
      'Windowing/virtualization mechanics (rendering only viewport visible rows + overscan buffer)',
      'Scroll listener performance, requestAnimationFrame, and absolute offset calculation',
      'Dynamic row height measurement and binary search index mapping'
    ],
    anchors: {
      0: 'Suggests rendering all 25,000 DOM nodes at once or using basic pagination without virtualization understanding.',
      1: 'Knows libraries like react-window exist, but cannot explain how DOM nodes are recycled or offsets computed.',
      2: 'Explains fixed-height virtualization, viewport clipping, and overscan, but struggles with dynamic row heights.',
      3: 'Coherently explains absolute positioning calculation, scroll throttling via rAF, dynamic height measurement cache, and index search.',
      4: 'Deep rendering expertise: discusses memory pressure from detached DOM nodes, Web Worker offloading for filtering, and CSS transform compositing.'
    },
    rubricNotes: 'Technical scoring guidance. Tests high-performance DOM manipulation and rendering engine mechanics.'
  },
  {
    id: 'fe-i-state-caching-swr',
    role: 'frontend_engineer',
    level: 'intermediate',
    stage: 'technical',
    topics: ['apis'],
    prompt: 'Compare client-side caching libraries (like React Query or SWR) against manual useEffect fetch loops. How do stale-while-revalidate, optimistic updates, and cache invalidation prevent race conditions?',
    followUp: 'How do you roll back an optimistic update if the server mutation fails after three network retries?',
    concepts: [
      'Stale-while-revalidate caching semantics and background synchronization',
      'Deduplication of identical in-flight requests across concurrent components',
      'Optimistic mutation rollback using snapshot context'
    ],
    anchors: {
      0: 'Believes manual useEffect fetch with local useState is sufficient for complex distributed data views.',
      1: 'Uses React Query as a basic fetch wrapper but cannot explain cache keys, stale time vs garbage collection time, or invalidation.',
      2: 'Explains background refetching and basic optimistic updates, but does not understand how snapshot rollbacks operate.',
      3: 'Deeply explains query key hashing, request deduplication, optimistic context snapshots, and targeted cache invalidation tags.',
      4: 'Production mastery: articulates offline persistence, normalized vs document cache trade-offs, retry backoff strategies, and structural sharing.'
    },
    rubricNotes: 'Technical scoring guidance. Emphasizes modern client data architecture and cache consistency.'
  },
  {
    id: 'fe-i-web-vitals-perf',
    role: 'frontend_engineer',
    level: 'intermediate',
    stage: 'technical',
    topics: ['reliability'],
    prompt: 'How would you identify, measure, and optimize Core Web Vitals—specifically Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS)—in a Single Page Application?',
    followUp: 'How can client-side font loading and dynamic ads cause severe CLS, and what CSS/HTML primitives eliminate it?',
    concepts: [
      'Core Web Vitals definitions and diagnostic tools (Lighthouse, Chrome Performance profiler, Web Vitals API)',
      'LCP optimization: preloading critical assets, image optimization (AVIF/WebP), eliminating render-blocking JS/CSS',
      'CLS prevention: reserving aspect-ratio boxes, font-display: optional/swap with metrics override'
    ],
    anchors: {
      0: 'Cannot define LCP or CLS, or confuses synthetic lab benchmarks with real-user monitoring (RUM).',
      1: 'Recognizes LCP and CLS as SEO metrics but relies on vague solutions like "minify code" without measuring bottlenecks.',
      2: 'Explains what LCP and CLS measure and uses aspect-ratio for images, but misses font swapping and critical asset preloading.',
      3: 'Coherently diagnoses LCP resource load delay and element render delay; eliminates CLS using CSS aspect-ratio and font fallback matching.',
      4: 'Industry-standard performance mastery: integrates RUM telemetry via PerformanceObserver, analyzes render-blocking critical chains, and implements SSR/streaming.'
    },
    rubricNotes: 'Technical scoring guidance. Focuses on real-world browser performance diagnostics and Web Vitals.'
  },
  {
    id: 'fe-i-client-storage-auth',
    role: 'frontend_engineer',
    level: 'intermediate',
    stage: 'technical',
    topics: ['databases'],
    prompt: 'Where should access tokens and refresh tokens be stored on the client side? Compare HttpOnly cookies, localStorage, and in-memory storage regarding XSS and CSRF trade-offs.',
    followUp: 'If using HttpOnly SameSite cookies to mitigate XSS token theft, what CSRF protections must your frontend and backend enforce?',
    concepts: [
      'localStorage vulnerability to cross-site scripting (XSS) exfiltration',
      'HttpOnly cookies immunity to JavaScript reads vs vulnerability to Cross-Site Request Forgery (CSRF)',
      'SameSite cookie attribute (Strict/Lax), anti-CSRF tokens, and in-memory access token rotation'
    ],
    anchors: {
      0: 'Recommends storing sensitive JWT tokens in localStorage without understanding XSS token theft risks.',
      1: 'Knows HttpOnly cookies cannot be read by JS, but cannot explain what CSRF is or how SameSite attributes work.',
      2: 'Compares localStorage vs cookies on basic criteria, but fails to explain how silent token refresh in memory works.',
      3: 'Provides balanced analysis: in-memory access token with HttpOnly refresh cookie; explains SameSite=Lax/Strict and anti-CSRF headers.',
      4: 'Senior security expertise: details Content Security Policy (CSP) headers, token rotation replay detection, iframe sandboxing, and OAuth 2.0 PKCE flows.'
    },
    rubricNotes: 'Technical scoring guidance. Evaluates web security fundamentals, XSS/CSRF mechanics, and client token storage.'
  },
  {
    id: 'fe-i-async-race-conditions',
    role: 'frontend_engineer',
    level: 'intermediate',
    stage: 'technical',
    topics: ['concurrency'],
    prompt: 'Two rapid auto-complete search keystrokes trigger HTTP requests, but the first response arrives after the second response. How do you guarantee the UI renders the freshest query?',
    followUp: 'How does AbortController cancel inflight fetch requests, and does aborting prevent the backend from processing the request?',
    concepts: [
      'Network out-of-order response race conditions in asynchronous UIs',
      'Cancellation via AbortController and DOM event debouncing',
      'Tracking request sequence IDs / timestamps to discard stale server responses'
    ],
    anchors: {
      0: 'Assumes network responses always arrive in the exact order they were sent.',
      1: 'Suggests simple debouncing alone, unaware that network latency variations can still cause out-of-order responses.',
      2: 'Mentions AbortController or sequence counters, but cannot write or describe the cleanup implementation in a React hook.',
      3: 'Implements AbortController in useEffect cleanup; explains why stale responses are aborted or ignored; differentiates client cancel from server compute.',
      4: 'Mastery of async coordination: explains switchMap reactive patterns, signal forwarding across chained promises, and UI transition states.'
    },
    rubricNotes: 'Technical scoring guidance. Tests asynchronous concurrency control and network lifecycle management.'
  },
  {
    id: 'fe-i-project-refactor-legacy',
    role: 'frontend_engineer',
    level: 'intermediate',
    stage: 'techno_managerial',
    topics: ['project_tradeoffs'],
    prompt: 'Your team has a mission-critical 40,000-line legacy jQuery/vanilla page that needs modern React migration while active customer features are constantly shipped. How do you plan the migration?',
    followUp: 'How do you coordinate shared state (like user session or cart items) between the legacy code and new React components during transition?',
    concepts: [
      'Strangler Fig pattern for incremental UI migration versus risky big-bang rewrites',
      'Micro-islands / hybrid mounting and event bus communication between legacy and modern tiers',
      'Setting quality metrics, feature freeze boundaries, and migration milestones'
    ],
    anchors: {
      0: 'Advocates stopping all feature work for six months to do a complete ground-up rewrite.',
      1: 'Suggests migrating page by page but has no mechanism for sharing state or styles between legacy and modern pages.',
      2: 'Proposes incremental migration using React portals or mounting components inside jQuery DOM, but lacks risk mitigation plans.',
      3: 'Applies Strangler pattern: defines hybrid mounting strategy, CustomEvent / window dispatch for state sync, and incremental rollback capabilities.',
      4: 'Pragmatic technical leadership: defines success criteria (error budgets, page load deltas), deprecation schedule, and manages stakeholder expectations.'
    },
    rubricNotes: 'Techno-managerial guidance. Focuses on legacy migration strategies, risk management, and delivery pragmatism.'
  },
  {
    id: 'fe-i-project-design-system',
    role: 'frontend_engineer',
    level: 'intermediate',
    stage: 'techno_managerial',
    topics: ['project_tradeoffs'],
    prompt: 'Product managers want one-off button and typography variations across different screens, threatening design system consistency. How do you establish component governance without blocking delivery?',
    followUp: 'When is it appropriate to introduce a new component variant into the core design system versus keeping it in a local feature folder?',
    concepts: [
      'Design system governance, semantic tokens, and component reusability',
      'Collaborative design-engineering triage (Rule of Three for abstraction)',
      'Escalation paths, component extension points, and visual regression guardrails'
    ],
    anchors: {
      0: 'Either rigidly rejects all product requests causing team conflict, or allows arbitrary styling overrides breaking the design system.',
      1: 'Agrees one-off styles are bad, but leaves individual developers to negotiate ad-hoc with designers on every PR.',
      2: 'Creates new props on existing components for every request, resulting in bloated 30-prop monster components.',
      3: 'Establishes clear component lifecycle (experimental local feature -> candidate -> core tokenized component); implements semantic token system.',
      4: 'Organizational impact: establishes shared Design-Engineering RFC process, automated visual diff testing (Chromatic/Percy), and token governance.'
    },
    rubricNotes: 'Techno-managerial guidance. Evaluates design system architecture, stakeholder negotiation, and component lifecycle.'
  },
  {
    id: 'fe-i-project-flaky-e2e',
    role: 'frontend_engineer',
    level: 'intermediate',
    stage: 'techno_managerial',
    topics: ['reliability'],
    prompt: 'Cypress or Playwright end-to-end tests in CI fail intermittently due to animation timing and network latency. What concrete changes do you make to eliminate test flakiness?',
    followUp: 'Why is adding arbitrary sleep() delays considered an anti-pattern, and what explicit assertion polling replaces it?',
    concepts: [
      'Root causes of E2E flakiness: animation transitions, network race conditions, unpinned test data',
      'Deterministic waiting on web assertions and network response interception instead of arbitrary timeouts',
      'Test isolation, synthetic fixture mocking, and CI quarantine policies'
    ],
    anchors: {
      0: 'Adds sleep(5000) throughout tests or sets CI to automatically retry failed tests 5 times without investigation.',
      1: 'Identifies network delays as the cause, but relies on increasing global timeouts rather than explicit wait conditions.',
      2: 'Replaces sleeps with cy.wait(\'@alias\') or waitForResponse, but struggles with animation frame transitions or shared state pollution.',
      3: 'Eliminates arbitrary timeouts using Playwright auto-retrying assertions, network route mocks, database state resets, and disables CSS animations in test.',
      4: 'Systemic quality leadership: establishes flaky test detection pipeline, categorizes failure signatures, implements test container parallelization, and tracks flakiness metrics.'
    },
    rubricNotes: 'Techno-managerial guidance. Tests automated testing discipline, diagnostic rigor, and CI stabilization.'
  },
  {
    id: 'fe-i-reflect-frontend-scale',
    role: 'frontend_engineer',
    level: 'intermediate',
    stage: 'reflection',
    topics: ['reliability'],
    prompt: 'In a past frontend codebase, what initial design choice seemed clean at first but caused maintenance friction as the codebase grew? How would you design it differently today?',
    followUp: 'What early metrics or developer signals would have tipped you off that the abstraction was failing?',
    concepts: [
      'Critical introspection on an architectural choice (e.g. premature abstraction, overly centralized state, or excessive library wrapping)',
      'Analysis of friction points: developer velocity, onboarding friction, bug rate',
      'Constructive lessons and modern architectural perspective'
    ],
    anchors: {
      0: 'Cannot identify any past design mistake or blames past issues entirely on incompetent teammates.',
      1: 'Mentions a superficial issue (e.g. choice of CSS preprocessor) without analyzing architectural consequences.',
      2: 'Identifies a real problem (e.g. monolithic Redux store or heavy component wrapper), but lesson learned remains vague.',
      3: 'Clearly describes how an initial pattern caused friction (e.g. prop explosion, over-abstracted HOCs, or tight coupling) and how they refactored it.',
      4: 'Profound architectural reflection: analyzes cognitive load on junior developers, boundary contracts, modularity, and principles for avoiding premature generalization.'
    },
    rubricNotes: 'Unscored reflection. Reward vulnerability, depth of architectural insight, and hard-earned engineering wisdom.'
  }
];
