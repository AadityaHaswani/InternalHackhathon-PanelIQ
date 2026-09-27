import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { createApp } from '../src/app.js';
import {
  listAdminQuestions,
  publishQuestion,
  listCompletedSessions,
  listApprovedEvaluators,
  createReviewAssignment,
} from '../src/modules/admin/admin.service.js';

// ============================================================================
// FIXTURES FOR ADMIN UNIT & INTEGRATION TESTS
// ============================================================================

const adminUserId = 'admin-user-uuid-1';
const nonAdminUserId = 'candidate-user-uuid-2';
const evaluatorUserId = 'evaluator-user-uuid-3';

const mockQuestions = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    question_id: 'be-j-api-validation',
    version: 1,
    prompt: 'You are adding POST /tasks. What would you validate before saving a task?',
    domain: 'computer_science',
    experience_level: 'junior',
    stage: 'technical',
    panel_role: 'technical',
    topics: ['apis'],
    role_slugs: ['backend_developer'],
    difficulty: 1,
    status: 'draft',
    reviewed_follow_up: 'What HTTP status code would you return for validation failures?',
    reviewed_by: null,
    reviewed_at: null,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    question_id: 'be-j-db-indexing',
    version: 1,
    prompt: 'Explain when a B-tree database index speeds up queries and when it adds overhead.',
    domain: 'computer_science',
    experience_level: 'junior',
    stage: 'technical',
    panel_role: 'technical',
    topics: ['databases'],
    role_slugs: ['backend_developer'],
    difficulty: 2,
    status: 'published',
    reviewed_follow_up: 'How does write amplification affect high-throughput inserts?',
    reviewed_by: 'lead-admin',
    reviewed_at: '2026-09-27T00:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    question_id: 'be-i-concurrency-locks',
    version: 1,
    prompt: 'Compare optimistic locking with pessimistic locking in a distributed transaction context.',
    domain: 'computer_science',
    experience_level: 'intermediate',
    stage: 'technical',
    panel_role: 'technical',
    topics: ['concurrency'],
    role_slugs: ['backend_developer'],
    difficulty: 3,
    status: 'draft',
    reviewed_follow_up: 'What happens when conflict rates exceed 20%?',
    reviewed_by: null,
    reviewed_at: null,
  },
];

const completedSessionId = randomUUID();
const incompleteSessionId = randomUUID();

const mockSessions = [
  {
    id: completedSessionId,
    user_id: nonAdminUserId,
    status: 'completed',
    current_position: 9,
    version: 8,
    created_at: '2026-09-27T10:00:00Z',
    completed_at: '2026-09-27T10:45:00Z',
    profile_snapshot: {
      displayName: 'Alex Chen',
      domain: 'computer_science',
      experienceLevel: 'junior',
      targetRole: 'backend_developer',
    },
  },
  {
    id: incompleteSessionId,
    user_id: nonAdminUserId,
    status: 'active',
    current_position: 4,
    version: 3,
    created_at: '2026-09-27T11:00:00Z',
    completed_at: null,
    profile_snapshot: {
      displayName: 'Sam Taylor',
      domain: 'computer_science',
      experienceLevel: 'intermediate',
      targetRole: 'backend_developer',
    },
  },
];

const mockUserRoles = [
  { user_id: adminUserId, role: 'admin' },
  { user_id: evaluatorUserId, role: 'evaluator' },
  { user_id: nonAdminUserId, role: 'candidate' },
];

const mockProfiles = [
  { user_id: adminUserId, display_name: 'Lead Admin', target_role: 'engineering_director' },
  { user_id: evaluatorUserId, display_name: 'Dr. Clara Rios', target_role: 'principal_architect' },
];

function createMockDatabaseClient() {
  const assignments = [];
  const questions = JSON.parse(JSON.stringify(mockQuestions));

  return {
    _assignments: assignments,
    _questions: questions,
    from: (table) => {
      let eqFilters = {};
      let inFilters = {};

      const builder = {
        select: () => builder,
        eq: (col, val) => {
          eqFilters[col] = val;
          return builder;
        },
        in: (col, vals) => {
          inFilters[col] = vals;
          return builder;
        },
        order: () => builder,
        limit: () => builder,
        maybeSingle: async () => {
          const rows = await builder._resolve();
          return { data: rows[0] || null, error: null };
        },
        single: async () => {
          const rows = await builder._resolve();
          if (!rows.length) return { data: null, error: { message: 'Row not found' } };
          return { data: rows[0], error: null };
        },
        insert: (row) => {
          const inserted = { id: randomUUID(), ...row };
          if (table === 'review_assignments') {
            assignments.push(inserted);
          }
          return {
            select: () => ({
              single: async () => ({ data: inserted, error: null }),
            }),
          };
        },
        update: (patch) => {
          return {
            eq: (_col, idVal) => {
              if (table === 'question_versions') {
                const idx = questions.findIndex((q) => q.id === idVal);
                if (idx !== -1) {
                  questions[idx] = { ...questions[idx], ...patch };
                  return {
                    select: () => ({
                      single: async () => ({ data: questions[idx], error: null }),
                    }),
                  };
                }
              }
              return {
                select: () => ({
                  single: async () => ({ data: null, error: { message: 'Not found' } }),
                }),
              };
            },
          };
        },
        _resolve: async () => {
          let rows = [];
          if (table === 'question_versions') rows = [...questions];
          else if (table === 'sessions') rows = [...mockSessions];
          else if (table === 'user_roles') rows = [...mockUserRoles];
          else if (table === 'profiles') rows = [...mockProfiles];
          else if (table === 'review_assignments') rows = [...assignments];

          for (const [col, val] of Object.entries(eqFilters)) {
            rows = rows.filter((r) => r[col] === val);
          }
          for (const [col, vals] of Object.entries(inFilters)) {
            rows = rows.filter((r) => vals.includes(r[col]));
          }
          return rows;
        },
        then: (resolve) => {
          builder._resolve().then((rows) => resolve({ data: rows, error: null }));
        },
      };
      return builder;
    },
  };
}

// ============================================================================
// QUESTION BANK TESTS
// ============================================================================

test('admin can list question bank questions with metadata', async () => {
  const client = createMockDatabaseClient();
  const res = await listAdminQuestions(client, adminUserId, { user_metadata: { role: 'admin' } });

  assert.equal(Array.isArray(res.questions), true);
  assert.equal(res.questions.length, 3);
  const q1 = res.questions.find((q) => q.question_id === 'be-j-api-validation');
  assert.ok(q1);
  assert.equal(q1.stage, 'technical');
  assert.equal(q1.level, 'junior');
  assert.equal(q1.status, 'draft');
  assert.ok(Array.isArray(q1.topics));
});

test('question bank search filter matches prompt or topics', async () => {
  const client = createMockDatabaseClient();

  // Search by topic 'databases'
  const dbRes = await listAdminQuestions(client, adminUserId, {}, { search: 'databases' });
  assert.equal(dbRes.questions.length, 1);
  assert.equal(dbRes.questions[0].question_id, 'be-j-db-indexing');

  // Search by prompt keyword 'locking'
  const lockRes = await listAdminQuestions(client, adminUserId, {}, { search: 'locking' });
  assert.equal(lockRes.questions.length, 1);
  assert.equal(lockRes.questions[0].question_id, 'be-i-concurrency-locks');
});

test('question bank stage and level filters work correctly', async () => {
  const client = createMockDatabaseClient();

  const intRes = await listAdminQuestions(client, adminUserId, {}, { level: 'intermediate' });
  assert.equal(intRes.questions.length, 1);
  assert.equal(intRes.questions[0].question_id, 'be-i-concurrency-locks');

  const junRes = await listAdminQuestions(client, adminUserId, {}, { level: 'junior' });
  assert.equal(junRes.questions.length, 2);
});

test('non-admin user rejected with 403 ADMIN_REQUIRED on question list', async () => {
  const client = createMockDatabaseClient();
  await assert.rejects(
    listAdminQuestions(client, nonAdminUserId, { user_metadata: { role: 'candidate' } }),
    { code: 'ADMIN_REQUIRED', status: 403 }
  );
});

test('admin can publish a draft question', async () => {
  const client = createMockDatabaseClient();
  const draftId = '11111111-1111-1111-1111-111111111111';

  const res = await publishQuestion(client, adminUserId, { email: 'admin@paneliq.dev' }, draftId);

  assert.ok(res.question);
  assert.equal(res.question.status, 'published');
  assert.equal(res.question.reviewed_by, 'admin@paneliq.dev');
  assert.ok(res.question.reviewed_at);
});

test('publishing an invalid question returns 404 QUESTION_NOT_FOUND', async () => {
  const client = createMockDatabaseClient();
  const nonexistentId = randomUUID();

  await assert.rejects(
    publishQuestion(client, adminUserId, {}, nonexistentId),
    { code: 'QUESTION_NOT_FOUND', status: 404 }
  );
});

test('publishing an already-published question returns 409 ALREADY_PUBLISHED', async () => {
  const client = createMockDatabaseClient();
  const alreadyPublishedId = '22222222-2222-2222-2222-222222222222';

  await assert.rejects(
    publishQuestion(client, adminUserId, {}, alreadyPublishedId),
    { code: 'ALREADY_PUBLISHED', status: 409 }
  );
});

// ============================================================================
// ASSIGNMENT TESTS
// ============================================================================

test('admin can list completed sessions eligible for assignment', async () => {
  const client = createMockDatabaseClient();
  const res = await listCompletedSessions(client, adminUserId, {});

  assert.equal(Array.isArray(res.sessions), true);
  assert.equal(res.sessions.length, 1);
  assert.equal(res.sessions[0].id, completedSessionId);
  assert.equal(res.sessions[0].status, 'completed');
  assert.equal(res.sessions[0].profile.displayName, 'Alex Chen');
});

test('admin can list approved evaluators with roles and display names', async () => {
  const client = createMockDatabaseClient();
  const res = await listApprovedEvaluators(client, adminUserId, {});

  assert.equal(Array.isArray(res.evaluators), true);
  assert.equal(res.evaluators.length, 2);
  const evalItem = res.evaluators.find((e) => e.id === evaluatorUserId);
  assert.ok(evalItem);
  assert.equal(evalItem.name, 'Dr. Clara Rios');
  assert.equal(evalItem.role, 'evaluator');
});

test('admin can create review assignment for completed session', async () => {
  const client = createMockDatabaseClient();
  const res = await createReviewAssignment(client, adminUserId, {}, {
    sessionId: completedSessionId,
    evaluatorId: evaluatorUserId,
  });

  assert.ok(res.assignment);
  assert.equal(res.assignment.sessionId, completedSessionId);
  assert.equal(res.assignment.evaluatorId, evaluatorUserId);
  assert.ok(res.assignment.assignedAt);
});

test('duplicate review assignment is rejected with 409 ASSIGNMENT_EXISTS', async () => {
  const client = createMockDatabaseClient();

  // First assignment succeeds
  await createReviewAssignment(client, adminUserId, {}, {
    sessionId: completedSessionId,
    evaluatorId: evaluatorUserId,
  });

  // Second duplicate assignment fails
  await assert.rejects(
    createReviewAssignment(client, adminUserId, {}, {
      sessionId: completedSessionId,
      evaluatorId: evaluatorUserId,
    }),
    { code: 'ASSIGNMENT_EXISTS', status: 409 }
  );
});

test('assigning an incomplete/active session is rejected with 400 SESSION_INCOMPLETE', async () => {
  const client = createMockDatabaseClient();

  await assert.rejects(
    createReviewAssignment(client, adminUserId, {}, {
      sessionId: incompleteSessionId,
      evaluatorId: evaluatorUserId,
    }),
    { code: 'SESSION_INCOMPLETE', status: 400 }
  );
});

test('self-assignment (evaluator reviewing own session) is rejected with 400 SELF_ASSIGNMENT_FORBIDDEN', async () => {
  const client = createMockDatabaseClient();

  await assert.rejects(
    createReviewAssignment(client, adminUserId, {}, {
      sessionId: completedSessionId,
      evaluatorId: nonAdminUserId, // nonAdminUserId is the candidate who took the session
    }),
    { code: 'SELF_ASSIGNMENT_FORBIDDEN', status: 400 }
  );
});

test('unauthorized non-admin user rejected from assignment creation with 403', async () => {
  const client = createMockDatabaseClient();

  await assert.rejects(
    createReviewAssignment(client, nonAdminUserId, { user_metadata: { role: 'candidate' } }, {
      sessionId: completedSessionId,
      evaluatorId: evaluatorUserId,
    }),
    { code: 'ADMIN_REQUIRED', status: 403 }
  );
});

// ============================================================================
// HTTP ROUTE INTEGRATION TESTS
// ============================================================================

test('HTTP GET /api/v1/admin/questions returns 200 with standard envelope for admin', async () => {
  const dbClient = createMockDatabaseClient();
  const app = createApp({
    verifyUser: async (token) => {
      if (token === 'valid-admin') return { data: { user: { id: adminUserId, email: 'admin@paneliq.dev' } }, error: null };
      return { data: { user: { id: nonAdminUserId, email: 'candidate@paneliq.dev' } }, error: null };
    },
    createDatabaseClient: () => dbClient,
  });

  const server = app.listen(0);
  const port = server.address().port;
  try {
    const res = await fetch(`http://localhost:${port}/api/v1/admin/questions?stage=technical&level=junior`, {
      headers: { Authorization: 'Bearer valid-admin' },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.data?.questions);
    assert.equal(body.data.questions.length, 2);
    assert.ok(body.requestId);
  } finally {
    server.close();
  }
});

test('HTTP POST /api/v1/admin/assignments returns 201 for admin', async () => {
  const dbClient = createMockDatabaseClient();
  const app = createApp({
    verifyUser: async () => ({ data: { user: { id: adminUserId, email: 'admin@paneliq.dev' } }, error: null }),
    createDatabaseClient: () => dbClient,
  });

  const server = app.listen(0);
  const port = server.address().port;
  try {
    const res = await fetch(`http://localhost:${port}/api/v1/admin/assignments`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid-admin',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: completedSessionId,
        evaluatorId: evaluatorUserId,
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.data?.assignment);
    assert.equal(body.data.assignment.sessionId, completedSessionId);
  } finally {
    server.close();
  }
});
