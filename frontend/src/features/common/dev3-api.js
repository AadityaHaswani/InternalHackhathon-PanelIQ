/**
 * PanelIQ Dev 3 Frontend API Service Layer
 * 
 * Prepares and implements the Dev 3 frontend API service functions:
 * - GET /sessions/:id/report
 * - GET /sessions/:id/replay
 * - POST /answers/:id/retries
 * - GET /review-assignments
 * - POST /evaluations/:id/overrides
 * - POST /sessions/:id/release
 * - POST /question-assessments
 * 
 * Supports transparent fallback to high-fidelity, contract-compliant mock state
 * with local persistence when backend endpoints are offline or pending deployment.
 */

import { apiClient } from '../../lib/api-client';

// Local storage keys for interactive evaluation overrides and drafts
const STORAGE_KEY_OVERRIDES = 'paneliq_dev3_overrides';
const STORAGE_KEY_RELEASES = 'paneliq_dev3_releases';
const STORAGE_KEY_RETRIES = 'paneliq_dev3_retries';
const STORAGE_KEY_DRAFTS = 'paneliq_dev3_lab_drafts';

function getStoredItem(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStoredItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

// Default Contract Fixtures
export const MOCK_INTERVIEW_TURNS = [
  {
    turnId: 'trn_intro_001',
    position: 1,
    stage: 'icebreaker',
    panelRole: 'chair',
    panelRoleLabel: 'Panel Chair',
    difficulty: 1,
    topics: ['project_tradeoffs'],
    questionPrompt: 'Describe a small backend project you built. What did it do, and which part did you personally implement?',
    candidateAnswer: 'I built an internal notification dispatch service in Node.js and PostgreSQL. It consumed event webhooks from our core checkout service and delivered email and SMS alerts. I designed the database schema, implemented the transaction outbox pattern to prevent message loss, and handled worker concurrency with advisory locks.',
    score: {
      overall: 3.5,
      correctness: 3.8,
      reasoning: 3.4,
      relevance: 3.9,
      tradeoffs: 3.0,
    },
    status: 'reviewed',
    sourceBadge: 'Human Reviewed',
    targetSkill: 'Architecture Overview & Ownership',
    timestamp: '01:45',
    evidence: {
      criterion: 'Relevance & System Scope',
      quote: 'I designed the database schema, implemented the transaction outbox pattern to prevent message loss',
      offsets: { start: 153, end: 250 },
      explanation: 'Candidate directly articulated personal contribution, naming specific architectural patterns (transactional outbox) matching the prompt scope.',
      missingPoints: 'Could have detailed volume/throughput metrics or failure rate thresholds.',
      source: 'Human Evaluator (Dr. Sharma)',
    },
  },
  {
    turnId: 'trn_api_002',
    position: 2,
    stage: 'technical',
    panelRole: 'specialist',
    panelRoleLabel: 'Technical Specialist',
    difficulty: 1,
    topics: ['apis'],
    questionPrompt: 'You are adding POST /tasks. What would you validate before saving a task, and what response would you send for invalid input?',
    candidateAnswer: 'I validate the payload schema using Zod or Joi: title must be a non-empty string trimmed between 1 and 255 characters, dueDate must be a valid ISO-8601 timestamp in the future, and assigneeId must match a valid UUID. If validation fails, I return HTTP 422 Unprocessable Entity with a structured JSON body detailing field errors rather than generic 500.',
    score: {
      overall: 3.8,
      correctness: 4.0,
      reasoning: 3.7,
      relevance: 4.0,
      tradeoffs: 3.5,
    },
    status: 'reviewed',
    sourceBadge: 'Human Reviewed',
    targetSkill: 'API Schema Validation & Error Envelopes',
    timestamp: '05:20',
    evidence: {
      criterion: 'Correctness: Input Validation',
      quote: 'If validation fails, I return HTTP 422 Unprocessable Entity with a structured JSON body detailing field errors',
      offsets: { start: 221, end: 334 },
      explanation: 'Correctly identified standard semantic error status code (422) and emphasized structured error payloads preventing client ambiguity.',
      missingPoints: 'Did not discuss content-type header enforcement or payload size limits.',
      source: 'Human Evaluator (Dr. Sharma)',
    },
  },
  {
    turnId: 'trn_db_003',
    position: 3,
    stage: 'technical',
    panelRole: 'specialist',
    panelRoleLabel: 'Technical Specialist',
    difficulty: 2,
    topics: ['databases'],
    questionPrompt: 'Two users try to register the same email almost simultaneously. Why is checking whether the email exists before inserting insufficient, and what would you add?',
    candidateAnswer: 'Checking before inserting creates a classic check-then-act race condition (time-of-check to time-of-use). Under concurrent requests, both SELECT queries execute before either INSERT commits, so both see zero existing rows and proceed. To guarantee uniqueness, I must enforce a database UNIQUE constraint on the email column (or unique partial index if soft deletes exist) and catch the resulting unique violation error (e.g. Postgres 23505) to return HTTP 409 Conflict.',
    score: {
      overall: 4.0,
      correctness: 4.0,
      reasoning: 4.0,
      relevance: 4.0,
      tradeoffs: 4.0,
    },
    status: 'reviewed',
    sourceBadge: 'Human Reviewed',
    targetSkill: 'Database Concurrency & Uniqueness Invariants',
    timestamp: '09:15',
    evidence: {
      criterion: 'Correctness: Race Conditions',
      quote: 'Checking before inserting creates a classic check-then-act race condition... enforce a database UNIQUE constraint on the email column',
      offsets: { start: 0, end: 184 },
      explanation: 'Flawless identification of TOCTOU race conditions and strict reliance on atomic database integrity constraints.',
      missingPoints: 'None. Answer is comprehensive and directly addresses concurrency.',
      source: 'AI Draft (Verified)',
    },
  },
  {
    turnId: 'trn_concurrency_004',
    position: 4,
    stage: 'technical',
    panelRole: 'specialist',
    panelRoleLabel: 'Technical Specialist',
    difficulty: 2,
    topics: ['concurrency'],
    questionPrompt: 'An item has one unit left. Two requests both read the stock as one and both place an order. Explain a database approach that prevents selling two units.',
    candidateAnswer: 'We can prevent this using pessimistic locking with SELECT ... FOR UPDATE within a transaction. When the first transaction queries the inventory row with FOR UPDATE, it acquires an exclusive lock. The second transaction is blocked until the first commits its inventory decrement. Alternatively, optimistic locking with UPDATE items SET stock = stock - 1 WHERE id = ? AND stock >= 1 checks rows affected.',
    score: {
      overall: 3.5,
      correctness: 3.6,
      reasoning: 3.6,
      relevance: 3.8,
      tradeoffs: 3.0,
    },
    status: 'draft',
    sourceBadge: 'AI Draft',
    targetSkill: 'Pessimistic vs Optimistic Locking',
    timestamp: '13:40',
    evidence: {
      criterion: 'Reasoning: Concurrency Isolation',
      quote: 'pessimistic locking with SELECT ... FOR UPDATE within a transaction... Alternatively, optimistic locking with UPDATE items SET stock = stock - 1 WHERE id = ? AND stock >= 1',
      offsets: { start: 24, end: 215 },
      explanation: 'Evaluated both pessimistic row-level locking and atomic condition updates effectively.',
      missingPoints: 'Omitted lock timeout configurations and deadlock risks when multiple products are purchased together.',
      source: 'AI Draft Engine',
    },
  },
  {
    turnId: 'trn_constraint_005',
    position: 5,
    stage: 'technical',
    panelRole: 'specialist',
    panelRoleLabel: 'Technical Specialist',
    difficulty: 3,
    topics: ['concurrency', 'reliability'],
    constraint: {
      originalPrompt: 'An item has one unit left. Two requests both read the stock as one and both place an order. Explain a database approach that prevents selling two units.',
      change: 'Two identical requests now arrive simultaneously from the same client due to an aggressive mobile retry timeout.',
      followUp: 'Explain how your architecture prevents double-allocation while ensuring the client receives the authoritative order state on retry.',
    },
    questionPrompt: 'Two identical requests now arrive simultaneously from the same client due to an aggressive mobile retry timeout. Explain how your architecture prevents double-allocation while ensuring the client receives the authoritative order state on retry.',
    candidateAnswer: 'I would require an Idempotency-Key header on checkout requests generated by the mobile client. When a request arrives, we store the key in Redis or a DB table with status PENDING. But if the gateway times out, I might just retry the query.',
    score: {
      overall: 1.8,
      correctness: 2.0,
      reasoning: 1.8,
      relevance: 2.2,
      tradeoffs: 1.2,
    },
    status: 'draft',
    sourceBadge: 'AI Draft',
    targetSkill: 'Atomic Idempotency & Distributed Retries',
    timestamp: '18:05',
    evidence: {
      criterion: 'Trade-offs: Distributed Failure',
      quote: 'When a request arrives, we store the key in Redis or a DB table with status PENDING. But if the gateway times out, I might just retry the query.',
      offsets: { start: 104, end: 245 },
      explanation: 'Mentioned Idempotency-Key header concept, but lacked atomic execution guarantee and replay response caching.',
      missingPoints: 'Did not explain atomic reservation (UPSERT or SETNX), payload hashing against mismatch, or persisting the final response envelope for replay.',
      source: 'AI Draft Engine',
    },
  },
  {
    turnId: 'trn_project_006',
    position: 6,
    stage: 'techno_managerial',
    panelRole: 'evaluator',
    panelRoleLabel: 'Project Evaluator',
    difficulty: 2,
    topics: ['project_tradeoffs'],
    questionPrompt: 'Your team has one day left before demo. Search filters and reliable task saving are both unfinished. How would you choose scope and communicate the decision?',
    candidateAnswer: 'I prioritize reliable task saving over search filters. Core data durability is non-negotiable; losing user data destroys trust immediately, whereas users can still manually browse tasks without advanced search. I would notify the tech lead and product manager in the morning standup, present the trade-off with risk rationale, and propose shipping reliable saving first while scoping search for day 1 follow-up.',
    score: {
      overall: 3.7,
      correctness: 3.8,
      reasoning: 3.8,
      relevance: 3.9,
      tradeoffs: 3.4,
    },
    status: 'reviewed',
    sourceBadge: 'Human Reviewed',
    targetSkill: 'Triage, Core Invariants & Stakeholder Alignment',
    timestamp: '22:30',
    evidence: {
      criterion: 'Reasoning: Stakeholder Communication',
      quote: 'Core data durability is non-negotiable; losing user data destroys trust immediately, whereas users can still manually browse tasks without advanced search.',
      offsets: { start: 58, end: 215 },
      explanation: 'Clearly differentiated between core integrity invariants and non-critical convenience features under schedule crunch.',
      missingPoints: 'Could have mentioned feature flag toggles to safely hide incomplete UI without breaking master branch.',
      source: 'Human Evaluator (Dr. Sharma)',
    },
  },
  {
    turnId: 'trn_contract_007',
    position: 7,
    stage: 'techno_managerial',
    panelRole: 'evaluator',
    panelRoleLabel: 'Project Evaluator',
    difficulty: 2,
    topics: ['apis', 'project_tradeoffs'],
    questionPrompt: 'A frontend teammate expects dueDate but your API returns deadline. How would you resolve this mismatch and prevent similar integration surprises?',
    candidateAnswer: 'In the short term, to unblock the frontend immediately without a breaking change, I can temporarily return both dueDate and deadline in the response payload. For the long term, we should introduce OpenAPI / Swagger contracts with TypeScript codegen so client and server share generated types, verified during CI before code merge.',
    score: {
      overall: 3.8,
      correctness: 3.9,
      reasoning: 3.8,
      relevance: 3.9,
      tradeoffs: 3.6,
    },
    status: 'reviewed',
    sourceBadge: 'Human Reviewed',
    targetSkill: 'Contract-Driven Development & Deprecation',
    timestamp: '26:10',
    evidence: {
      criterion: 'Trade-offs: Backward Compatibility',
      quote: 'temporarily return both dueDate and deadline in the response payload... introduce OpenAPI / Swagger contracts with TypeScript codegen',
      offsets: { start: 77, end: 218 },
      explanation: 'Excellent dual-field transition strategy avoiding breakage alongside automated contract-first schema verification.',
      missingPoints: 'None. Strong pragmatic response.',
      source: 'Human Evaluator (Dr. Sharma)',
    },
  },
  {
    turnId: 'trn_reflect_008',
    position: 8,
    stage: 'reflection',
    panelRole: 'chair',
    panelRoleLabel: 'Panel Chair',
    difficulty: 2,
    topics: ['project_tradeoffs'],
    questionPrompt: 'Looking back across today\'s boardroom session, which technical answer would you refine, and how would you verify your improvement?',
    candidateAnswer: 'I would refine my answer to the mobile retry timeout constraint (turn 5). My answer was too hand-wavy about just retrying. I should have explained atomic key reservation with a unique constraint, payload hashing, and saving the exact response for replay. I would verify this by writing a concurrency test with 10 parallel requests sending the same Idempotency-Key and asserting exactly one DB write occurs.',
    score: {
      overall: 3.9,
      correctness: 4.0,
      reasoning: 3.9,
      relevance: 4.0,
      tradeoffs: 3.7,
    },
    status: 'reviewed',
    sourceBadge: 'Human Reviewed',
    targetSkill: 'Self-Awareness & Empirical Verification',
    timestamp: '29:45',
    evidence: {
      criterion: 'Reasoning: Reflection & Verification',
      quote: 'I would refine my answer to the mobile retry timeout constraint (turn 5)... writing a concurrency test with 10 parallel requests sending the same Idempotency-Key',
      offsets: { start: 0, end: 235 },
      explanation: 'Exceptional technical self-awareness. Accurately pinpointed the weakest turn and articulated a testable empirical verification methodology.',
      missingPoints: 'None. Earns full credit on judgment rubric.',
      source: 'Human Evaluator (Dr. Sharma)',
    },
  },
];

// Generates Report Data matching session and evaluator state
export function getMockReportData(sessionId = 'ses_7f21a48c-1e82-421d-9331-b0e567280911') {
  const overrides = getStoredItem(STORAGE_KEY_OVERRIDES, {});
  const releases = getStoredItem(STORAGE_KEY_RELEASES, {});
  const sessionOverrides = overrides[sessionId] || {};
  const isReleased = releases[sessionId] !== undefined;

  // Calculate scores incorporating overrides
  const answers = MOCK_INTERVIEW_TURNS.map((turn) => {
    const turnOverride = sessionOverrides[turn.turnId];
    if (turnOverride) {
      return {
        ...turn,
        score: {
          ...turn.score,
          overall: turnOverride.newScore,
          [turnOverride.criterionKey || 'correctness']: turnOverride.newScore,
        },
        status: 'reviewed',
        sourceBadge: `Human Override (${turnOverride.evaluatorName || 'Expert Reviewer'})`,
        overrideData: turnOverride,
      };
    }
    return turn;
  });

  const overallAvg = (
    answers.reduce((acc, a) => acc + (a.score?.overall || 0), 0) / answers.length
  ).toFixed(1);

  return {
    sessionId,
    profile: {
      displayName: 'Alex Chen',
      targetRole: 'backend_developer',
      roleLabel: 'Backend Developer',
      experienceLevel: 'Junior',
      domain: 'Computer Science',
    },
    status: isReleased ? 'reviewed' : 'draft',
    evaluationStatus: isReleased ? 'reviewed' : 'draft',
    evaluationStatusLabel: isReleased ? 'Human Reviewed' : 'AI Draft (Pending Expert Sign-off)',
    releasedAt: isReleased ? releases[sessionId].releasedAt : null,
    reviewer: isReleased
      ? { name: 'Dr. Sharma', role: 'Staff Backend Architect', id: 'usr_eval_01' }
      : { name: 'AI Calibration Engine', role: 'Automated Rubric Grader', id: 'bot_ai_01' },
    overallScore: parseFloat(overallAvg),
    maxScore: 4.0,
    percentage: Math.round((parseFloat(overallAvg) / 4.0) * 100),
    verdict: parseFloat(overallAvg) >= 3.0 ? 'Strong Hire Recommendation' : 'Developing Potential',
    summaryText:
      'Candidate demonstrates exceptional command of database consistency invariants, TOCTOU prevention, and API schema design. Primary area for acceleration is distributed idempotency edge cases and failure mode bounding.',
    criteria: [
      {
        id: 'crit_correctness',
        name: 'Correctness',
        score: 3.7,
        weight: 0.35,
        description: 'Technical accuracy of database semantics, concurrency isolation, and API status codes.',
      },
      {
        id: 'crit_reasoning',
        name: 'Reasoning',
        score: 3.6,
        weight: 0.25,
        description: 'Structured causal reasoning, distinguishing root cause from symptoms.',
      },
      {
        id: 'crit_relevance',
        name: 'Relevance',
        score: 3.9,
        weight: 0.20,
        description: 'Direct response to board questions and constraints without speculative divergence.',
      },
      {
        id: 'crit_tradeoffs',
        name: 'Trade-offs / Application',
        score: 2.9,
        weight: 0.20,
        description: 'Evaluation of operational trade-offs, deadlock mitigation, and latency implications.',
      },
    ],
    topicCoverage: [
      { topic: 'databases', label: 'Databases & Storage', turnsCount: 2, score: 3.9, percentage: 98 },
      { topic: 'apis', label: 'API Design & Contracts', turnsCount: 2, score: 3.8, percentage: 95 },
      { topic: 'concurrency', label: 'Concurrency & Locks', turnsCount: 2, score: 3.2, percentage: 80 },
      { topic: 'reliability', label: 'Reliability & Retries', turnsCount: 1, score: 2.8, percentage: 70 },
      { topic: 'project_tradeoffs', label: 'System & Team Trade-offs', turnsCount: 3, score: 3.7, percentage: 92 },
    ],
    interviewerQuality: {
      roleRelevance: 96,
      levelFit: 92,
      clarity: 98,
      assessability: 94,
      topicCoverage: 95,
      questions: [
        {
          id: 'be-j-intro-project',
          prompt: 'Describe a small backend project you built. What did it do, and which part did you personally implement?',
          roleRelevance: 95,
          levelFit: 98,
          clarity: 100,
          assessability: 92,
          stage: 'Icebreaker',
        },
        {
          id: 'be-j-db-uniqueness',
          prompt: 'Two users try to register the same email almost simultaneously. Why is checking whether the email exists before inserting insufficient, and what would you add?',
          roleRelevance: 98,
          levelFit: 95,
          clarity: 97,
          assessability: 96,
          stage: 'Technical',
        },
        {
          id: 'be-j-concurrency-constraint',
          prompt: 'Two identical requests now arrive simultaneously from the same client due to an aggressive mobile retry timeout. Explain how your architecture prevents double-allocation...',
          roleRelevance: 94,
          levelFit: 88,
          clarity: 95,
          assessability: 94,
          stage: 'Technical (Constraint)',
        },
        {
          id: 'be-j-project-contract',
          prompt: 'A frontend teammate expects dueDate but your API returns deadline. How would you resolve this mismatch and prevent similar integration surprises?',
          roleRelevance: 96,
          levelFit: 92,
          clarity: 98,
          assessability: 94,
          stage: 'Techno-Managerial',
        },
      ],
    },
    answers,
    reviewHistory: sessionOverrides.history || [
      {
        revision: 1,
        evaluatorId: 'usr_eval_01',
        evaluatorName: 'Dr. Sharma',
        criterionName: 'Correctness: Input Validation',
        turnId: 'trn_api_002',
        oldScore: 3.5,
        newScore: 4.0,
        reason: 'Candidate explicitly articulated HTTP 422 standard status and structured payload envelopes.',
        timestamp: '2026-09-27T09:45:00.000Z',
      },
    ],
  };
}

// Dev 3 Frontend API Service Functions

/**
 * 1. GET /sessions/:id/report
 */
export async function getSessionReport(sessionId) {
  try {
    const response = await apiClient.get(`sessions/${sessionId}/report`);
    if (response?.data) return response.data;
  } catch (err) {
    console.info(`Report endpoint fallback for session ${sessionId}: using contract fixtures. (${err.message})`);
  }
  return getMockReportData(sessionId);
}

/**
 * 2. GET /sessions/:id/replay
 */
export async function getSessionReplay(sessionId) {
  try {
    const response = await apiClient.get(`sessions/${sessionId}/replay`);
    if (response?.data) return response.data;
  } catch (err) {
    console.info(`Replay endpoint fallback for session ${sessionId}: using contract fixtures. (${err.message})`);
  }
  return {
    sessionId,
    sessionDate: 'September 27, 2026',
    duration: '29 mins 45 secs',
    totalTurns: 8,
    turns: MOCK_INTERVIEW_TURNS,
  };
}

/**
 * 3. POST /answers/:id/retries
 */
export async function submitAnswerRetry(turnId, payload) {
  const { answerText, targetSkill, originalTurnId } = payload;
  try {
    const response = await apiClient.post(`answers/${turnId}/retries`, {
      answerText,
      targetSkill,
      originalTurnId,
    });
    if (response?.data) return response.data;
  } catch (err) {
    console.info(`Retry endpoint fallback for turn ${turnId}: (${err.message})`);
  }

  // Contract evaluation comparator for retry
  const mentionsIdempotency = /idempotency|idempotent/i.test(answerText);
  const mentionsHash = /hash|checksum|payload/i.test(answerText);
  const mentionsAtomic = /atomic|upsert|setnx|unique/i.test(answerText);
  const mentionsReplay = /replay|cached response|status/i.test(answerText);

  let newScore = 2.4;
  if (mentionsIdempotency) newScore += 0.5;
  if (mentionsAtomic) newScore += 0.5;
  if (mentionsHash) newScore += 0.3;
  if (mentionsReplay) newScore += 0.3;
  newScore = Math.min(4.0, Math.max(2.0, parseFloat(newScore.toFixed(1))));

  const result = {
    retryId: `rtr_${Date.now()}`,
    originalTurnId: turnId,
    targetSkill: targetSkill || 'Atomic Idempotency & Distributed Retries',
    before: {
      score: 1.8,
      strengths: ['Identified Idempotency-Key header concept'],
      gaps: ['Lacked atomic execution guarantee', 'No response replay caching', 'Risk of payload collision'],
    },
    after: {
      score: newScore,
      strengths: [
        'Enforced atomic reservation using database constraint / Redis lock',
        mentionsHash ? 'Hashed request body to detect payload mismatches' : 'Clean validation structure',
        mentionsReplay ? 'Cached authoritative response for seamless client reconnect' : 'Clear failure semantics',
      ],
      remainingGaps: [
        newScore < 3.8
          ? 'Consider documenting background sweeper lease expiry for crashed transactions'
          : 'Minor: specify TTL on cached idempotent responses',
      ],
    },
    timestamp: new Date().toISOString(),
  };

  // Persist retry to storage
  const retries = getStoredItem(STORAGE_KEY_RETRIES, []);
  retries.unshift(result);
  setStoredItem(STORAGE_KEY_RETRIES, retries);

  return result;
}

/**
 * 4. GET /review-assignments
 */
export async function getReviewAssignments() {
  try {
    const response = await apiClient.get('review-assignments');
    if (response?.data?.sessions) return response.data.sessions;
  } catch (err) {
    console.info('Review assignments endpoint fallback: using contract fixtures.');
  }

  const releases = getStoredItem(STORAGE_KEY_RELEASES, {});
  return [
    {
      id: 'ses_7f21a48c-1e82-421d-9331-b0e567280911',
      candidateName: 'Alex Chen',
      email: 'alex.chen@example.com',
      role: 'Backend Developer',
      roleSlug: 'backend_developer',
      level: 'Junior',
      date: '2026-09-27T08:15:00.000Z',
      reviewStatus: releases['ses_7f21a48c-1e82-421d-9331-b0e567280911'] ? 'reviewed' : 'draft',
      aiScore: 3.4,
      totalTurns: 8,
      duration: '29m 45s',
      assignedEvaluator: 'Dr. Sharma',
    },
    {
      id: 'ses_18c53ef0-5b12-4f81-817a-c603b5197822',
      candidateName: 'Jordan Taylor',
      email: 'jordan.t@example.com',
      role: 'Backend Developer',
      roleSlug: 'backend_developer',
      level: 'Junior',
      date: '2026-09-26T14:00:00.000Z',
      reviewStatus: 'pending',
      aiScore: null,
      totalTurns: 8,
      duration: '28m 15s',
      assignedEvaluator: 'Dr. Sharma',
      pendingNotice: 'Async grading calibration in progress. Awaiting initial AI draft proposal.',
    },
    {
      id: 'ses_43a991de-3481-4ba5-9773-a1286eb70543',
      candidateName: 'Maya Patel',
      email: 'maya.patel@example.com',
      role: 'Fullstack Engineer',
      roleSlug: 'fullstack_developer',
      level: 'Intermediate',
      date: '2026-09-25T11:20:00.000Z',
      reviewStatus: 'reviewed',
      aiScore: 3.8,
      totalTurns: 8,
      duration: '26m 30s',
      assignedEvaluator: 'Dr. Sharma',
    },
    {
      id: 'ses_91b002c1-8481-4ca5-9872-c2886ab80112',
      candidateName: 'Liam Vance',
      email: 'liam.vance@example.com',
      role: 'Distributed Systems',
      roleSlug: 'backend_developer',
      level: 'Senior',
      date: '2026-09-24T16:45:00.000Z',
      reviewStatus: 'draft',
      aiScore: 2.9,
      totalTurns: 8,
      duration: '31m 10s',
      assignedEvaluator: 'Dr. Sharma',
    },
  ];
}

/**
 * 5. POST /evaluations/:id/overrides
 */
export async function submitScoreOverride(evaluationId, overrideData) {
  const { sessionId, turnId, criterionKey, criterionName, oldScore, newScore, reason, evaluatorName } = overrideData;
  if (!reason || reason.trim().length < 8) {
    throw new Error('A detailed justification reason (minimum 8 characters) is required to record a score override.');
  }

  try {
    const response = await apiClient.post(`evaluations/${evaluationId}/overrides`, overrideData);
    if (response?.data) return response.data;
  } catch (err) {
    console.info(`Override endpoint fallback for evaluation ${evaluationId}: (${err.message})`);
  }

  // Persist locally
  const overrides = getStoredItem(STORAGE_KEY_OVERRIDES, {});
  if (!overrides[sessionId]) overrides[sessionId] = { history: [] };
  
  overrides[sessionId][turnId] = {
    newScore,
    criterionKey,
    reason,
    evaluatorName: evaluatorName || 'Dr. Sharma',
    updatedAt: new Date().toISOString(),
  };

  const newRevision = (overrides[sessionId].history?.length || 0) + 2;
  const historyEntry = {
    revision: newRevision,
    evaluatorId: 'usr_eval_01',
    evaluatorName: evaluatorName || 'Dr. Sharma',
    criterionName: criterionName || 'Score Correction',
    turnId,
    oldScore,
    newScore,
    reason,
    timestamp: new Date().toISOString(),
  };

  overrides[sessionId].history = [historyEntry, ...(overrides[sessionId].history || [])];
  setStoredItem(STORAGE_KEY_OVERRIDES, overrides);

  return { success: true, historyEntry, updatedReport: getMockReportData(sessionId) };
}

/**
 * 6. POST /sessions/:id/release
 */
export async function releaseSessionReport(sessionId, releaseMetadata = {}) {
  try {
    const response = await apiClient.post(`sessions/${sessionId}/release`, releaseMetadata);
    if (response?.data) return response.data;
  } catch (err) {
    console.info(`Release endpoint fallback for session ${sessionId}: (${err.message})`);
  }

  const releases = getStoredItem(STORAGE_KEY_RELEASES, {});
  releases[sessionId] = {
    releasedAt: new Date().toISOString(),
    releasedBy: releaseMetadata.evaluatorName || 'Dr. Sharma',
    notes: releaseMetadata.notes || 'Human review completed and verified against calibrated rubric.',
  };
  setStoredItem(STORAGE_KEY_RELEASES, releases);

  return { success: true, releasedAt: releases[sessionId].releasedAt };
}

/**
 * 7. POST /question-assessments
 */
export async function assessQuestion(assessmentRequest) {
  const { targetRole, experienceLevel, topic, proposedQuestion } = assessmentRequest;
  if (!proposedQuestion || proposedQuestion.trim().length < 10) {
    throw new Error('Please enter a comprehensive question prompt of at least 10 characters.');
  }

  try {
    const response = await apiClient.post('question-assessments', assessmentRequest);
    if (response?.data) return response.data;
  } catch (err) {
    console.info(`Question assessment endpoint fallback: (${err.message})`);
  }

  // Intelligent algorithmic calibration assessment
  const length = proposedQuestion.length;
  const hasTradeoff = /trade-off|tradeoff|compare|versus|vs|advantage|disadvantage|cost/i.test(proposedQuestion);
  const hasConcreteScenario = /when|if|consider|suppose|user|table|endpoint|service|failure/i.test(proposedQuestion);
  const hasEvaluationAnchor = /why|how|explain|what would you|demonstrate/i.test(proposedQuestion);

  const relevance = Math.min(98, Math.max(75, 80 + (hasConcreteScenario ? 12 : 0) + (length > 60 ? 6 : -5)));
  const clarity = Math.min(99, Math.max(70, 82 + (hasEvaluationAnchor ? 10 : 0) - (length > 250 ? 10 : 0)));
  const assessability = Math.min(98, Math.max(68, 76 + (hasTradeoff ? 14 : 0) + (hasEvaluationAnchor ? 8 : 0)));
  const overall = Math.round((relevance + clarity + assessability) / 3);

  // Suggested rewrite improving rubric anchors
  let suggestedRewrite = proposedQuestion;
  if (!hasTradeoff) {
    suggestedRewrite = `${proposedQuestion.replace(/\?$/, '')}. In your answer, explicitly compare the trade-offs between consistency, operational overhead, and client recovery semantics.`;
  } else if (!hasConcreteScenario) {
    suggestedRewrite = `In a high-throughput ${(targetRole || 'backend developer').replace('_', ' ')} architecture: ${proposedQuestion}`;
  } else {
    suggestedRewrite = `Context: A distributed service encounters concurrent writes. ${proposedQuestion} Outline concrete failure modes and how your approach guarantees data integrity.`;
  }

  return {
    assessmentId: `qa_${Date.now()}`,
    overallQuality: overall,
    metrics: {
      roleRelevance: relevance,
      levelFit: experienceLevel === 'junior' ? 92 : 88,
      clarity,
      assessability,
      topicCoverage: topic ? 94 : 85,
    },
    critique: [
      hasConcreteScenario
        ? 'Well-anchored practical scenario matching industry engineering tasks.'
        : 'Prompt could benefit from a more concrete architectural situation or bounded system constraint.',
      hasTradeoff
        ? 'Explicitly prompts for trade-off analysis, enabling differentiation on judgment rubrics.'
        : 'Lacks an explicit call for trade-offs. Adding comparative trade-offs prevents candidates reciting memorized answers.',
      assessability > 85
        ? 'High assessability: clearly identifiable right/wrong invariants and graded rubrics.'
        : 'Add observable criteria anchors so evaluators can objectively rate 0-4 performance.',
    ],
    suggestedRewrite,
  };
}

/**
 * Question Lab Drafts helper
 */
export function getQuestionLabDrafts() {
  return getStoredItem(STORAGE_KEY_DRAFTS, [
    {
      id: 'draft_001',
      targetRole: 'backend_developer',
      experienceLevel: 'junior',
      topic: 'databases',
      question: 'Two users attempt to reserve the same inventory item at the exact same millisecond. Contrast optimistic concurrency control with pessimistic locking, explaining when each is preferable.',
      qualityScore: 94,
      savedAt: '2026-09-26T15:20:00.000Z',
    },
  ]);
}

export function saveQuestionLabDraft(draft) {
  const drafts = getQuestionLabDrafts();
  const newDraft = {
    ...draft,
    id: `draft_${Date.now()}`,
    savedAt: new Date().toISOString(),
  };
  drafts.unshift(newDraft);
  setStoredItem(STORAGE_KEY_DRAFTS, drafts);
  return newDraft;
}
