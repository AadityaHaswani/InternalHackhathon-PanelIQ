/**
 * Contract-backed development fixtures for Dev 2 interview simulation.
 * Derived strictly from backend seeds (backend-developer.questions.json)
 * and backend/docs/session-contract.md.
 *
 * Used ONLY when backend is offline or explicitly requested in development.
 * Never silently substituted in production.
 */

export const MOCK_SEED_QUESTIONS = [
  {
    id: 'be-j-intro-project',
    stage: 'icebreaker',
    panelRole: 'chair',
    topics: ['project_tradeoffs'],
    prompt: 'Describe a small backend project you built. What did it do, and which part did you personally implement?',
    difficulty: 1,
  },
  {
    id: 'be-j-api-validation',
    stage: 'technical',
    panelRole: 'specialist',
    topics: ['apis'],
    prompt: 'You are adding POST /tasks. What would you validate before saving a task, and what response would you send for invalid input?',
    difficulty: 1,
  },
  {
    id: 'be-j-db-uniqueness',
    stage: 'technical',
    panelRole: 'specialist',
    topics: ['databases'],
    prompt: 'Two users try to register the same email almost simultaneously. Why is checking whether the email exists before inserting insufficient, and what would you add?',
    difficulty: 2,
  },
  {
    id: 'be-j-concurrency-stock',
    stage: 'technical',
    panelRole: 'specialist',
    topics: ['concurrency'],
    prompt: 'An item has one unit left. Two requests both read the stock as one and both place an order. Explain a database approach that prevents selling two units.',
    difficulty: 2,
  },
  {
    id: 'be-j-concurrency-constraint',
    stage: 'technical',
    panelRole: 'specialist',
    topics: ['concurrency', 'reliability'],
    prompt: 'How does your stock reservation handle network timeouts when a third-party payment gateway is slow to respond?',
    difficulty: 3,
    constraint: {
      originalPrompt: 'An item has one unit left. Two requests both read the stock as one and both place an order. Explain a database approach that prevents selling two units.',
      change: 'Two identical requests now arrive simultaneously from the same client due to an aggressive mobile retry timeout.',
      followUp: 'Explain how your architecture prevents double-allocation while ensuring the client receives the authoritative order state on retry.',
    },
  },
  {
    id: 'be-j-project-deadline',
    stage: 'techno_managerial',
    panelRole: 'evaluator',
    topics: ['project_tradeoffs'],
    prompt: 'Your team has one day left. Search filters and reliable task saving are both unfinished. How would you choose scope and communicate the decision?',
    difficulty: 2,
  },
  {
    id: 'be-j-project-contract',
    stage: 'techno_managerial',
    panelRole: 'evaluator',
    topics: ['apis', 'project_tradeoffs'],
    prompt: 'A frontend teammate expects dueDate but your API returns deadline. How would you resolve this mismatch and prevent similar integration surprises?',
    difficulty: 2,
  },
  {
    id: 'be-j-reflect-improve',
    stage: 'reflection',
    panelRole: 'chair',
    topics: ['project_tradeoffs'],
    prompt: 'Which answer today would you improve with another ten minutes, and how would you check whether your revised approach is correct?',
    difficulty: 1,
  },
];

/**
 * Creates a synthetic mock session strictly adhering to safe session shape.
 */
export function createMockSession(sessionId, profile = {}) {
  const q0 = MOCK_SEED_QUESTIONS[0];
  return {
    id: sessionId || `ses_${crypto.randomUUID()}`,
    profile: {
      displayName: profile.displayName || 'Alex Chen',
      domain: profile.domain || 'computer_science',
      experienceLevel: profile.experienceLevel || 'junior',
      targetRole: 'backend_developer',
    },
    status: 'active',
    version: 1,
    answeredCount: 0,
    totalTurns: 8,
    createdAt: new Date().toISOString(),
    completedAt: null,
    currentTurn: {
      id: `turn_${crypto.randomUUID()}`,
      position: 1,
      questionId: q0.id,
      questionVersion: 1,
      prompt: q0.prompt,
      stage: q0.stage,
      panelRole: q0.panelRole,
      topics: q0.topics,
      difficulty: q0.difficulty,
      constraint: q0.constraint || null,
    },
  };
}

/**
 * Advances a mock session to the next turn or completion.
 */
export function advanceMockSession(session, answerText = null, isSkip = false) {
  const currentPos = session.currentTurn ? session.currentTurn.position : session.answeredCount + 1;
  const nextPos = currentPos + 1;
  const nextVersion = session.version + 1;
  const nextAnsweredCount = session.answeredCount + 1;

  if (nextPos > session.totalTurns) {
    // Session ready to complete
    return {
      ...session,
      version: nextVersion,
      answeredCount: session.totalTurns,
      currentTurn: null,
      status: 'active', // ready_to_complete per contract
    };
  }

  const nextQ = MOCK_SEED_QUESTIONS[nextPos - 1];
  return {
    ...session,
    version: nextVersion,
    answeredCount: nextAnsweredCount,
    currentTurn: {
      id: `turn_${crypto.randomUUID()}`,
      position: nextPos,
      questionId: nextQ.id,
      questionVersion: 1,
      prompt: nextQ.prompt,
      stage: nextQ.stage,
      panelRole: nextQ.panelRole,
      topics: nextQ.topics,
      difficulty: nextQ.difficulty,
      constraint: nextQ.constraint || null,
    },
  };
}
