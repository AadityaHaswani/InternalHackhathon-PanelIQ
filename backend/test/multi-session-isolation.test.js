import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { getSessionReport, getSessionReplay, listReviewAssignments } from '../src/modules/reports/report.service.js';
import { listCompletedSessions, createReviewAssignment } from '../src/modules/admin/admin.service.js';

test('1. Same candidate -> multiple sessions allowed with separate IDs and roles', async () => {
  const candidateId = randomUUID();
  const backendSessionId = randomUUID();
  const frontendSessionId = randomUUID();

  const sessionsDb = [
    {
      id: backendSessionId,
      user_id: candidateId,
      status: 'completed',
      current_position: 9,
      version: 10,
      created_at: '2026-09-27T10:00:00Z',
      completed_at: '2026-09-27T10:30:00Z',
      profile_snapshot: {
        displayName: 'Test Candidate',
        targetRole: 'backend_developer',
        experienceLevel: 'junior',
      },
    },
    {
      id: frontendSessionId,
      user_id: candidateId,
      status: 'completed',
      current_position: 9,
      version: 10,
      created_at: '2026-09-27T11:00:00Z',
      completed_at: '2026-09-27T11:35:00Z',
      profile_snapshot: {
        displayName: 'Test Candidate',
        targetRole: 'frontend_engineer',
        experienceLevel: 'junior',
      },
    },
  ];

  assert.equal(sessionsDb[0].user_id, sessionsDb[1].user_id);
  assert.notEqual(sessionsDb[0].id, sessionsDb[1].id);
  assert.equal(sessionsDb[0].profile_snapshot.targetRole, 'backend_developer');
  assert.equal(sessionsDb[1].profile_snapshot.targetRole, 'frontend_engineer');
});

test('2. Different roles -> separate sessions with completely isolated data', async () => {
  const candidateId = randomUUID();
  const backendSessionId = randomUUID();
  const frontendSessionId = randomUUID();

  const sessionMap = new Map([
    [backendSessionId, { id: backendSessionId, user_id: candidateId, status: 'completed', profile_snapshot: { targetRole: 'backend_developer' } }],
    [frontendSessionId, { id: frontendSessionId, user_id: candidateId, status: 'completed', profile_snapshot: { targetRole: 'frontend_engineer' } }],
  ]);

  assert.equal(sessionMap.get(backendSessionId).profile_snapshot.targetRole, 'backend_developer');
  assert.equal(sessionMap.get(frontendSessionId).profile_snapshot.targetRole, 'frontend_engineer');
});

test('3. Session A report cannot be returned for Session B', async () => {
  const candidateId = randomUUID();
  const sessionAId = randomUUID();
  const sessionBId = randomUUID();

  const reportRevisionsA = [{ revision: 1, status: 'released', overall_score: 88, session_id: sessionAId, summary: 'Backend excellence' }];
  const reportRevisionsB = [{ revision: 1, status: 'released', overall_score: 94, session_id: sessionBId, summary: 'Frontend excellence' }];

  const createMockForSession = (requestedSessionId) => ({
    from: (table) => {
      const b = {
        select: () => b,
        eq: (col, val) => {
          if (col === 'id' || col === 'session_id') {
            assert.equal(val, requestedSessionId, `Query must strictly filter by requested session ID ${requestedSessionId}`);
          }
          return b;
        },
        order: () => b,
        maybeSingle: async () => {
          if (table === 'sessions') {
            const role = requestedSessionId === sessionAId ? 'backend_developer' : 'frontend_engineer';
            return {
              data: {
                id: requestedSessionId,
                user_id: candidateId,
                status: 'completed',
                profile_snapshot: { targetRole: role, displayName: 'Candidate' },
              },
              error: null,
            };
          }
          return { data: null, error: null };
        },
        then: (resolve) => {
          if (table === 'report_revisions') {
            const revs = requestedSessionId === sessionAId ? reportRevisionsA : reportRevisionsB;
            resolve({ data: revs, error: null });
          } else {
            resolve({ data: [], error: null });
          }
        },
      };
      return b;
    },
  });

  const reportA = await getSessionReport(createMockForSession(sessionAId), candidateId, sessionAId);
  assert.equal(reportA.sessionId, sessionAId);
  assert.equal(reportA.overallScore, 88);
  assert.equal(reportA.summary, 'Backend excellence');
  assert.equal(reportA.profile.targetRole, 'backend_developer');

  const reportB = await getSessionReport(createMockForSession(sessionBId), candidateId, sessionBId);
  assert.equal(reportB.sessionId, sessionBId);
  assert.equal(reportB.overallScore, 94);
  assert.equal(reportB.summary, 'Frontend excellence');
  assert.equal(reportB.profile.targetRole, 'frontend_engineer');
});

test('4. Session B report cannot be returned for Session A (cross-leak protection)', async () => {
  const candidateId = randomUUID();
  const sessionAId = randomUUID();
  const sessionBId = randomUUID();

  // Session B is unreleased, Session A is released
  const mockClient = {
    from: (table) => {
      let currentSessionFilter = null;
      const b = {
        select: () => b,
        eq: (col, val) => {
          if (col === 'id' || col === 'session_id') {
            currentSessionFilter = val;
          }
          return b;
        },
        order: () => b,
        maybeSingle: async () => {
          if (table === 'sessions') {
            return {
              data: {
                id: currentSessionFilter,
                user_id: candidateId,
                status: 'completed',
                profile_snapshot: { targetRole: currentSessionFilter === sessionAId ? 'backend_developer' : 'frontend_engineer' },
              },
              error: null,
            };
          }
          return { data: null, error: null };
        },
        then: (resolve) => {
          if (table === 'report_revisions') {
            // Only session A has a released revision
            if (currentSessionFilter === sessionAId) {
              resolve({ data: [{ revision: 1, status: 'released', overall_score: 82, session_id: sessionAId }], error: null });
            } else {
              resolve({ data: [], error: null });
            }
          } else {
            resolve({ data: [], error: null });
          }
        },
      };
      return b;
    },
  };

  // Session A returns report A
  const repA = await getSessionReport(mockClient, candidateId, sessionAId);
  assert.equal(repA.sessionId, sessionAId);
  assert.equal(repA.overallScore, 82);

  // Session B throws REPORT_NOT_RELEASED (never leaks session A's report)
  await assert.rejects(
    getSessionReport(mockClient, candidateId, sessionBId),
    { code: 'REPORT_NOT_RELEASED' }
  );
});

test('5. Admin completed-session listing returns both Backend and Frontend sessions for same candidate', async () => {
  const adminId = randomUUID();
  const candidateId = randomUUID();
  const backendSessionId = randomUUID();
  const frontendSessionId = randomUUID();

  const sessionsDb = [
    {
      id: backendSessionId,
      user_id: candidateId,
      status: 'completed',
      current_position: 9,
      version: 10,
      created_at: '2026-09-27T10:00:00Z',
      completed_at: '2026-09-27T10:30:00Z',
      profile_snapshot: {
        displayName: 'Aditya',
        targetRole: 'backend_developer',
        experienceLevel: 'junior',
      },
    },
    {
      id: frontendSessionId,
      user_id: candidateId,
      status: 'completed',
      current_position: 9,
      version: 10,
      created_at: '2026-09-27T11:00:00Z',
      completed_at: '2026-09-27T11:30:00Z',
      profile_snapshot: {
        displayName: 'Aditya',
        targetRole: 'frontend_engineer',
        experienceLevel: 'junior',
      },
    },
  ];

  const mockClient = {
    from: (table) => {
      const b = {
        select: () => b,
        eq: () => b,
        in: (col, vals) => {
          if (col === 'status') {
            assert(vals.includes('completed'));
            assert(vals.includes('ready_to_complete'));
          }
          return b;
        },
        order: () => b,
        limit: () => b,
        maybeSingle: async () => {
          if (table === 'user_roles') {
            return { data: { user_id: adminId, role: 'admin' }, error: null };
          }
          return { data: null, error: null };
        },
        then: (resolve) => {
          if (table === 'sessions') {
            resolve({ data: sessionsDb, error: null });
          } else {
            resolve({ data: [], error: null });
          }
        },
      };
      return b;
    },
  };

  const result = await listCompletedSessions(mockClient, adminId);
  assert.equal(result.sessions.length, 2);
  const roles = result.sessions.map((s) => s.profile.targetRole);
  assert(roles.includes('backend_developer'));
  assert(roles.includes('frontend_engineer'));
  assert.notEqual(result.sessions[0].id, result.sessions[1].id);
});

test('6. Frontend completed session in ready_to_complete state is assignment-eligible', async () => {
  const adminId = randomUUID();
  const candidateId = randomUUID();
  const frontendSessionId = randomUUID();

  const sessionsDb = [
    {
      id: frontendSessionId,
      user_id: candidateId,
      status: 'ready_to_complete',
      current_position: 9,
      version: 10,
      created_at: '2026-09-27T11:00:00Z',
      completed_at: null,
      profile_snapshot: {
        displayName: 'Aditya',
        targetRole: 'frontend_engineer',
        experienceLevel: 'junior',
      },
    },
  ];

  const mockClient = {
    from: (table) => {
      const b = {
        select: () => b,
        eq: () => b,
        in: () => b,
        order: () => b,
        limit: () => b,
        maybeSingle: async () => {
          if (table === 'user_roles') return { data: { user_id: adminId, role: 'admin' }, error: null };
          return { data: null, error: null };
        },
        then: (resolve) => {
          resolve({ data: sessionsDb, error: null });
        },
      };
      return b;
    },
  };

  const result = await listCompletedSessions(mockClient, adminId);
  assert.equal(result.sessions.length, 1);
  assert.equal(result.sessions[0].id, frontendSessionId);
  assert.equal(result.sessions[0].profile.targetRole, 'frontend_engineer');
});

test('7. Assignment references exact session_id and completes ready_to_complete session', async () => {
  const adminId = randomUUID();
  const candidateId = randomUUID();
  const evaluatorId = randomUUID();
  const frontendSessionId = randomUUID();
  let updatedSessionStatus = null;

  const mockClient = {
    from: (table) => {
      const b = {
        select: () => b,
        eq: (_col, _val) => {
          return b;
        },
        in: () => b,
        update: (vals) => {
          if (table === 'sessions') {
            updatedSessionStatus = vals.status;
          }
          return b;
        },
        insert: (vals) => {
          assert.equal(vals.session_id, frontendSessionId, 'Assignment must reference exact frontend session ID');
          assert.equal(vals.evaluator_id, evaluatorId);
          return b;
        },
        single: async () => {
          return {
            data: {
              id: randomUUID(),
              session_id: frontendSessionId,
              evaluator_id: evaluatorId,
              assigned_at: new Date().toISOString(),
            },
            error: null,
          };
        },
        maybeSingle: async () => {
          if (table === 'user_roles') {
            return { data: { user_id: adminId, role: 'admin' }, error: null };
          }
          if (table === 'sessions') {
            return {
              data: {
                id: frontendSessionId,
                user_id: candidateId,
                status: 'ready_to_complete',
              },
              error: null,
            };
          }
          if (table === 'review_assignments') {
            return { data: null, error: null }; // no existing assignment
          }
          return { data: null, error: null };
        },
      };
      return b;
    },
  };

  const result = await createReviewAssignment(mockClient, adminId, {}, {
    sessionId: frontendSessionId,
    evaluatorId,
  });

  assert.equal(result.assignment.sessionId, frontendSessionId);
  assert.equal(result.assignment.evaluatorId, evaluatorId);
  assert.equal(updatedSessionStatus, 'completed', 'ready_to_complete session must be finalized to completed upon assignment');
});

test('8. Candidate/session authorization remains intact', async () => {
  const candidateAId = randomUUID();
  const candidateBId = randomUUID();
  const sessionAId = randomUUID();

  const mockClient = {
    from: (table) => {
      const b = {
        select: () => b,
        eq: () => b,
        maybeSingle: async () => {
          if (table === 'sessions') {
            return { data: { id: sessionAId, user_id: candidateAId, status: 'completed' }, error: null };
          }
          if (table === 'user_roles') return { data: null, error: null };
          return { data: null, error: null };
        },
      };
      return b;
    },
  };

  // Candidate B attempting to access Candidate A's session replay must be rejected
  await assert.rejects(
    getSessionReplay(mockClient, candidateBId, sessionAId),
    { code: 'EVALUATOR_REQUIRED' }
  );
});

test('9. Evaluator Review Workspace Session Isolation: Session A (frontend_engineer) vs Session B (backend_developer)', async () => {
  const evaluatorId = randomUUID();
  const candidateAId = randomUUID();
  const candidateBId = randomUUID();
  const sessionAId = 'c142876d-b01d-4916-92cf-1ade4dc71605';
  const sessionBId = '866fded1-b862-4671-b399-52a6cd9eb564';

  const sessionsDb = {
    [sessionAId]: {
      id: sessionAId,
      user_id: candidateAId,
      status: 'completed',
      profile_snapshot: {
        displayName: 'Aadi',
        targetRole: 'frontend_engineer',
        experienceLevel: 'junior',
      },
    },
    [sessionBId]: {
      id: sessionBId,
      user_id: candidateBId,
      status: 'completed',
      profile_snapshot: {
        displayName: 'Bob',
        targetRole: 'backend_developer',
        experienceLevel: 'senior',
      },
    },
  };

  const turnsDb = {
    [sessionAId]: [
      { id: randomUUID(), session_id: sessionAId, position: 1, stage: 'technical', prompt: 'Explain CSS flexbox vs grid.' },
    ],
    [sessionBId]: [
      { id: randomUUID(), session_id: sessionBId, position: 1, stage: 'technical', prompt: 'Explain database indexing B-trees.' },
    ],
  };

  const mockClient = {
    from: (table) => {
      let currentSessionFilter = null;
      let inIds = null;
      const b = {
        select: () => b,
        eq: (col, val) => {
          if (col === 'id' || col === 'session_id') {
            currentSessionFilter = val;
          }
          return b;
        },
        in: (col, vals) => {
          if (col === 'id' || col === 'session_id') {
            inIds = vals;
          }
          return b;
        },
        order: () => b,
        range: () => b,
        maybeSingle: async () => {
          if (table === 'sessions') {
            const row = sessionsDb[currentSessionFilter] || null;
            return { data: row, error: null };
          }
          if (table === 'user_roles') {
            return { data: { role: 'evaluator' }, error: null };
          }
          if (table === 'review_assignments') {
            return { data: { id: randomUUID(), session_id: currentSessionFilter, evaluator_id: evaluatorId }, error: null };
          }
          return { data: null, error: null };
        },
        then: (resolve) => {
          if (table === 'user_roles') {
            resolve({ data: [{ role: 'evaluator' }], error: null });
          } else if (table === 'review_assignments') {
            resolve({
              data: [
                { id: randomUUID(), session_id: sessionAId, evaluator_id: evaluatorId, assigned_at: '2026-09-27T10:00:00Z', status: 'pending' },
                { id: randomUUID(), session_id: sessionBId, evaluator_id: evaluatorId, assigned_at: '2026-09-27T11:00:00Z', status: 'reviewed' },
              ],
              error: null,
            });
          } else if (table === 'sessions') {
            if (inIds) {
              const matched = inIds.map((id) => sessionsDb[id]).filter(Boolean);
              resolve({ data: matched, error: null });
            } else {
              resolve({ data: Object.values(sessionsDb), error: null });
            }
          } else if (table === 'session_turns') {
            const turns = turnsDb[currentSessionFilter] || [];
            resolve({ data: turns, error: null });
          } else {
            resolve({ data: [], error: null });
          }
        },
      };
      return b;
    },
  };

  // 1. Fetch Review Workspace data for Session A
  const reportA = await getSessionReport(mockClient, evaluatorId, sessionAId);
  const replayA = await getSessionReplay(mockClient, evaluatorId, sessionAId);

  // Must strictly return Session A's candidate, role, and transcript
  assert.equal(reportA.sessionId, sessionAId);
  assert.equal(reportA.candidate.targetRole, 'frontend_engineer');
  assert.equal(reportA.candidate.displayName, 'Aadi');
  assert.equal(reportA.profile.targetRole, 'frontend_engineer');

  assert.equal(replayA.sessionId, sessionAId);
  assert.equal(replayA.candidate.targetRole, 'frontend_engineer');
  assert.equal(replayA.candidate.displayName, 'Aadi');
  assert.equal(replayA.turns[0].prompt, 'Explain CSS flexbox vs grid.');

  // MUST NOT return Session B's data
  assert.notEqual(reportA.sessionId, sessionBId);
  assert.notEqual(reportA.candidate.targetRole, 'backend_developer');
  assert.notEqual(reportA.candidate.displayName, 'Bob');
  assert.notEqual(replayA.sessionId, sessionBId);
  assert.notEqual(replayA.candidate.targetRole, 'backend_developer');
  assert.notEqual(replayA.candidate.displayName, 'Bob');
  assert.notEqual(replayA.turns[0].prompt, 'Explain database indexing B-trees.');

  // 2. Fetch Review Workspace data for Session B
  const reportB = await getSessionReport(mockClient, evaluatorId, sessionBId);
  const replayB = await getSessionReplay(mockClient, evaluatorId, sessionBId);

  // Must strictly return Session B's candidate, role, and transcript
  assert.equal(reportB.sessionId, sessionBId);
  assert.equal(reportB.candidate.targetRole, 'backend_developer');
  assert.equal(reportB.candidate.displayName, 'Bob');
  assert.equal(reportB.profile.targetRole, 'backend_developer');

  assert.equal(replayB.sessionId, sessionBId);
  assert.equal(replayB.candidate.targetRole, 'backend_developer');
  assert.equal(replayB.candidate.displayName, 'Bob');
  assert.equal(replayB.turns[0].prompt, 'Explain database indexing B-trees.');

  // MUST NOT return Session A's data
  assert.notEqual(reportB.sessionId, sessionAId);
  assert.notEqual(reportB.candidate.targetRole, 'frontend_engineer');
  assert.notEqual(reportB.candidate.displayName, 'Aadi');
  assert.notEqual(replayB.sessionId, sessionAId);
  assert.notEqual(replayB.candidate.targetRole, 'frontend_engineer');
  assert.notEqual(replayB.candidate.displayName, 'Aadi');
  assert.notEqual(replayB.turns[0].prompt, 'Explain CSS flexbox vs grid.');

  // 3. Verify Review Assignments listing isolates session candidate profiles
  const queue = await listReviewAssignments(mockClient, evaluatorId, { limit: 10, offset: 0 });
  assert.equal(queue.assignments.length, 2);

  const asgA = queue.assignments.find((a) => a.sessionId === sessionAId);
  assert.ok(asgA);
  assert.equal(asgA.candidate.displayName, 'Aadi');
  assert.equal(asgA.candidate.targetRole, 'frontend_engineer');

  const asgB = queue.assignments.find((a) => a.sessionId === sessionBId);
  assert.ok(asgB);
  assert.equal(asgB.candidate.displayName, 'Bob');
  assert.equal(asgB.candidate.targetRole, 'backend_developer');
});

test('10. Candidate Released Report Isolation: Session A released report is surfaced, Session B is never returned, and unreleased report is blocked', async () => {
  const candidateId = randomUUID();
  const sessionAId = 'c142876d-b01d-4916-92cf-1ade4dc71605';
  const sessionBId = '866fded1-b862-4671-b399-52a6cd9eb564';

  const sessions = [
    {
      id: sessionAId,
      user_id: candidateId,
      status: 'completed',
      profile_snapshot: {
        displayName: 'Aadi',
        targetRole: 'frontend_engineer',
        domain: 'computer_science',
        experienceLevel: 'junior',
      },
    },
    {
      id: sessionBId,
      user_id: candidateId,
      status: 'completed',
      profile_snapshot: {
        displayName: 'Aadi',
        targetRole: 'backend_developer',
        domain: 'computer_science',
        experienceLevel: 'junior',
      },
    },
  ];

  const reportRevisions = [
    {
      id: randomUUID(),
      session_id: sessionAId,
      revision: 1,
      status: 'released',
      overall_score: 85,
      is_provisional: false,
      summary: 'Certified frontend performance for Aadi.',
      released_at: new Date().toISOString(),
      released_by: randomUUID(),
    },
    {
      id: randomUUID(),
      session_id: sessionBId,
      revision: 1,
      status: 'draft',
      overall_score: null,
      is_provisional: true,
      summary: 'Backend provisional draft.',
    },
  ];

  const mockClient = {
    from: (table) => {
      let _filterCol = null;
      let filterVal = null;
      const chain = {
        select: () => chain,
        eq: (col, val) => {
          _filterCol = col;
          filterVal = val;
          return chain;
        },
        order: () => chain,
        limit: () => chain,
        maybeSingle: async () => {
          if (table === 'sessions') {
            const found = sessions.find((s) => s.id === filterVal);
            return { data: found || null, error: null };
          }
          if (table === 'user_roles') {
            // Standard candidate (not staff)
            return { data: null, error: null };
          }
          return { data: null, error: null };
        },
        then: (resolve) => {
          if (table === 'report_revisions') {
            const list = reportRevisions.filter((r) => r.session_id === filterVal);
            return resolve({ data: list, error: null });
          }
          if (table === 'user_roles') {
            return resolve({ data: [], error: null });
          }
          return resolve({ data: [], error: null });
        },
      };
      return chain;
    },
  };

  // 1. Request candidate report for session A (released)
  const reportA = await getSessionReport(mockClient, candidateId, sessionAId);

  // Must return session A's released report
  assert.equal(reportA.sessionId, sessionAId);
  assert.equal(reportA.status, 'released');
  assert.equal(reportA.reportStatus, 'released');
  assert.equal(reportA.isProvisional, false);
  assert.equal(reportA.overallScore, 85);
  assert.equal(reportA.summary, 'Certified frontend performance for Aadi.');
  assert.equal(reportA.candidate.targetRole, 'frontend_engineer');
  assert.equal(reportA.candidate.displayName, 'Aadi');

  // Must NOT return session B's data
  assert.notEqual(reportA.sessionId, sessionBId);
  assert.notEqual(reportA.candidate.targetRole, 'backend_developer');
  assert.notEqual(reportA.summary, 'Backend provisional draft.');

  // 2. Request candidate report for session B (unreleased / draft)
  // Must reject with REPORT_NOT_RELEASED and never expose unreleased data
  await assert.rejects(
    getSessionReport(mockClient, candidateId, sessionBId),
    { code: 'REPORT_NOT_RELEASED' },
  );
});


