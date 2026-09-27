/**
 * Auth contract fixtures based on backend/docs/auth-contract.md and profile-contract.md
 * Used for development simulation when Supabase credentials are not locally configured.
 */
export const MOCK_USERS = {
  candidate: {
    id: 'usr_candidate_001',
    email: 'candidate@paneliq.test',
    role: 'candidate',
    profile: {
      displayName: 'Alex Chen',
      domain: 'computer_science',
      experienceLevel: 'junior',
      targetRole: 'backend_developer',
      createdAt: '2026-09-20T10:00:00.000Z',
      updatedAt: '2026-09-25T14:30:00.000Z',
    },
    token: 'mock_jwt_token_candidate_001',
  },
  evaluator: {
    id: 'usr_evaluator_002',
    email: 'evaluator@paneliq.test',
    role: 'evaluator',
    profile: {
      displayName: 'Dr. Priya Sharma',
      domain: 'computer_science',
      experienceLevel: 'intermediate',
      targetRole: 'backend_developer',
      createdAt: '2026-09-15T09:00:00.000Z',
      updatedAt: '2026-09-22T11:20:00.000Z',
    },
    token: 'mock_jwt_token_evaluator_002',
  },
  admin: {
    id: 'usr_admin_003',
    email: 'admin@paneliq.test',
    role: 'admin',
    profile: {
      displayName: 'System Admin',
      domain: 'computer_science',
      experienceLevel: 'intermediate',
      targetRole: 'backend_developer',
      createdAt: '2026-09-10T08:00:00.000Z',
      updatedAt: '2026-09-26T16:00:00.000Z',
    },
    token: 'mock_jwt_token_admin_003',
  },
};
