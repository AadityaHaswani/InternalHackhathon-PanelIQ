/**
 * Dashboard & Session fixtures matching backend/docs/session-contract.md
 */
export const MOCK_SESSIONS = [
  {
    id: 'ses_7f21a48c-1e82-421d-9331-b0e567280911',
    profile: {
      displayName: 'Alex Chen',
      domain: 'computer_science',
      experienceLevel: 'junior',
      targetRole: 'backend_developer',
    },
    status: 'active',
    version: 4,
    answeredCount: 3,
    totalTurns: 8,
    createdAt: '2026-09-27T08:15:00.000Z',
    completedAt: null,
    currentTurn: {
      id: 'trn_db_uniqueness_004',
      position: 4,
      questionId: 'be-j-db-uniqueness',
      questionVersion: 1,
      prompt: 'Two users try to register the same email almost simultaneously. Why is checking whether the email exists before inserting insufficient, and what would you add?',
      stage: 'technical',
      panelRole: 'specialist',
      topics: ['databases'],
      difficulty: 1,
    },
  },
  {
    id: 'ses_18c53ef0-5b12-4f81-817a-c603b5197822',
    profile: {
      displayName: 'Alex Chen',
      domain: 'computer_science',
      experienceLevel: 'junior',
      targetRole: 'backend_developer',
    },
    status: 'completed',
    version: 10,
    answeredCount: 8,
    totalTurns: 8,
    createdAt: '2026-09-26T14:00:00.000Z',
    completedAt: '2026-09-26T14:28:15.000Z',
    currentTurn: null,
  },
  {
    id: 'ses_43a991de-3481-4ba5-9773-a1286eb70543',
    profile: {
      displayName: 'Alex Chen',
      domain: 'computer_science',
      experienceLevel: 'junior',
      targetRole: 'backend_developer',
    },
    status: 'completed',
    version: 10,
    answeredCount: 8,
    totalTurns: 8,
    createdAt: '2026-09-25T11:20:00.000Z',
    completedAt: '2026-09-25T11:46:30.000Z',
    currentTurn: null,
  },
];
