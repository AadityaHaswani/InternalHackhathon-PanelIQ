import { databaseData, SessionError } from '../sessions/session.service.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Verifies that the authenticated caller has the admin role.
 *
 * @param {Object} client - Database client with request auth token
 * @param {string} userId - Authenticated user's ID
 * @param {Object} [user] - Authenticated user object
 * @returns {Promise<boolean>}
 */
export async function verifyAdmin(client, userId, user = {}) {
  // Check user metadata if available
  if (user?.user_metadata?.role === 'admin') {
    return true;
  }

  // Check user_roles table
  const adminCheck = await client
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  if (adminCheck?.data?.role === 'admin') {
    return true;
  }

  throw new SessionError(403, 'ADMIN_REQUIRED', 'Only administrators can access this resource');
}

/**
 * Lists question bank questions with support for search, stage, and level filters.
 * Never exposes private scoring rubrics or answers.
 *
 * @param {Object} client
 * @param {string} userId
 * @param {Object} [user]
 * @param {Object} [filters]
 * @returns {Promise<{ questions: Array<Object> }>}
 */
export async function listAdminQuestions(client, userId, user = {}, filters = {}) {
  await verifyAdmin(client, userId, user);

  let query = client
    .from('question_versions')
    .select('id, question_id, version, prompt, domain, experience_level, stage, panel_role, topics, role_slugs, difficulty, status, reviewed_follow_up, reviewed_by, reviewed_at')
    .order('question_id', { ascending: true })
    .order('version', { ascending: false });

  if (filters.stage && filters.stage !== 'all') {
    query = query.eq('stage', filters.stage);
  }
  if (filters.level && filters.level !== 'all') {
    query = query.eq('experience_level', filters.level);
  }

  const result = await query;
  let rows = databaseData(result) || [];

  if (filters.search && filters.search.trim()) {
    const s = filters.search.trim().toLowerCase();
    rows = rows.filter((q) => {
      const promptMatch = (q.prompt || '').toLowerCase().includes(s);
      const idMatch = (q.question_id || '').toLowerCase().includes(s) || (q.id || '').toLowerCase().includes(s);
      const topicMatch = Array.isArray(q.topics) && q.topics.some((t) => t.toLowerCase().includes(s));
      return promptMatch || idMatch || topicMatch;
    });
  }

  const questions = rows.map((q) => ({
    id: q.id,
    questionId: q.question_id,
    question_id: q.question_id,
    version: q.version,
    prompt: q.prompt,
    domain: q.domain,
    stage: q.stage,
    level: q.experience_level,
    experience_level: q.experience_level,
    panelRole: q.panel_role,
    panel_role: q.panel_role,
    topics: q.topics || [],
    roleSlugs: q.role_slugs || [],
    role_slugs: q.role_slugs || [],
    difficulty: q.difficulty,
    status: q.status,
    reviewedFollowUp: q.reviewed_follow_up,
    reviewed_follow_up: q.reviewed_follow_up,
    reviewedBy: q.reviewed_by,
    reviewed_by: q.reviewed_by,
    reviewedAt: q.reviewed_at,
    reviewed_at: q.reviewed_at,
  }));

  return { questions };
}

/**
 * Publishes a draft question version.
 *
 * @param {Object} client
 * @param {string} userId
 * @param {Object} [user]
 * @param {string} questionIdOrUuid
 * @returns {Promise<{ question: Object }>}
 */
export async function publishQuestion(client, userId, user = {}, questionIdOrUuid) {
  await verifyAdmin(client, userId, user);

  if (!questionIdOrUuid) {
    throw new SessionError(400, 'INVALID_REQUEST', 'Question ID is required');
  }

  const isUuid = UUID_REGEX.test(questionIdOrUuid);
  let query = client.from('question_versions').select('*');
  if (isUuid) {
    query = query.eq('id', questionIdOrUuid);
  } else {
    query = query.eq('question_id', questionIdOrUuid).order('version', { ascending: false }).limit(1);
  }

  const existingRes = await query.maybeSingle();
  const existing = databaseData(existingRes);

  if (!existing) {
    throw new SessionError(404, 'QUESTION_NOT_FOUND', `Question ${questionIdOrUuid} not found`);
  }

  if (existing.status === 'published') {
    throw new SessionError(409, 'ALREADY_PUBLISHED', `Question ${existing.question_id} (version ${existing.version}) is already published`);
  }

  const reviewer = user?.email || userId || 'admin';
  const now = new Date().toISOString();

  const updateRes = await client
    .from('question_versions')
    .update({
      status: 'published',
      reviewed_by: reviewer,
      reviewed_at: now,
    })
    .eq('id', existing.id)
    .select()
    .single();

  const updated = databaseData(updateRes);
  return {
    question: {
      id: updated.id,
      questionId: updated.question_id,
      question_id: updated.question_id,
      version: updated.version,
      prompt: updated.prompt,
      stage: updated.stage,
      level: updated.experience_level,
      experience_level: updated.experience_level,
      status: updated.status,
      reviewedBy: updated.reviewed_by,
      reviewed_by: updated.reviewed_by,
      reviewedAt: updated.reviewed_at,
      reviewed_at: updated.reviewed_at,
    },
  };
}

/**
 * Lists completed candidate sessions eligible for evaluator review assignment.
 *
 * @param {Object} client
 * @param {string} userId
 * @param {Object} [user]
 * @returns {Promise<{ sessions: Array<Object> }>}
 */
export async function listCompletedSessions(client, userId, user = {}) {
  await verifyAdmin(client, userId, user);

  const query = client
    .from('sessions')
    .select('id, user_id, status, current_position, version, created_at, completed_at, profile_snapshot')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100);

  const rows = databaseData(await query) || [];

  const sessions = rows.map((row) => ({
    id: row.id,
    status: row.status,
    createdAt: row.created_at,
    created_at: row.created_at,
    completedAt: row.completed_at,
    completed_at: row.completed_at,
    totalTurns: 8,
    answeredCount: 8,
    profile: {
      displayName: row.profile_snapshot?.displayName || row.profile_snapshot?.display_name || 'Candidate',
      domain: row.profile_snapshot?.domain || 'computer_science',
      experienceLevel: row.profile_snapshot?.experienceLevel || row.profile_snapshot?.experience_level,
      targetRole: row.profile_snapshot?.targetRole || row.profile_snapshot?.target_role,
    },
  }));

  return { sessions };
}

/**
 * Lists approved evaluators eligible to receive review assignments.
 *
 * @param {Object} client
 * @param {string} userId
 * @param {Object} [user]
 * @returns {Promise<{ evaluators: Array<Object> }>}
 */
export async function listApprovedEvaluators(client, userId, user = {}) {
  await verifyAdmin(client, userId, user);

  const roleRows = databaseData(await client
    .from('user_roles')
    .select('user_id, role')
    .in('role', ['evaluator', 'admin'])) || [];

  const userIds = [...new Set(roleRows.map((r) => r.user_id))];
  let profiles = [];
  if (userIds.length > 0) {
    const profilesRes = await client
      .from('profiles')
      .select('user_id, display_name, domain, experience_level, target_role')
      .in('user_id', userIds);
    profiles = databaseData(profilesRes) || [];
  }

  const profileMap = new Map(profiles.map((p) => [p.user_id, p]));

  const evaluators = roleRows.map((r) => {
    const prof = profileMap.get(r.user_id);
    const name = prof?.display_name || (r.role === 'admin' ? 'Admin Reviewer' : 'Evaluator');
    return {
      id: r.user_id,
      userId: r.user_id,
      user_id: r.user_id,
      name,
      displayName: name,
      role: r.role,
      specialty: prof?.target_role ? prof.target_role.replace(/_/g, ' ') : (r.role === 'admin' ? 'Lead Evaluator' : 'Technical Evaluator'),
    };
  });

  return { evaluators };
}

/**
 * Creates a review assignment for a completed session.
 *
 * @param {Object} client
 * @param {string} userId
 * @param {Object} user
 * @param {{ sessionId: string, evaluatorId: string }} payload
 * @returns {Promise<{ assignment: Object }>}
 */
export async function createReviewAssignment(client, userId, user = {}, { sessionId, evaluatorId }) {
  await verifyAdmin(client, userId, user);

  if (!sessionId || !evaluatorId) {
    throw new SessionError(400, 'INVALID_REQUEST', 'Both sessionId and evaluatorId are required');
  }

  // 1. Fetch and validate candidate session
  const sessionRes = await client
    .from('sessions')
    .select('id, user_id, status')
    .eq('id', sessionId)
    .maybeSingle();

  const session = databaseData(sessionRes);
  if (!session) {
    throw new SessionError(404, 'SESSION_NOT_FOUND', `Session ${sessionId} not found`);
  }

  if (session.status !== 'completed') {
    throw new SessionError(400, 'SESSION_INCOMPLETE', 'Only completed sessions can be assigned to evaluators');
  }

  // 2. Evaluator cannot review their own session
  if (session.user_id === evaluatorId) {
    throw new SessionError(400, 'SELF_ASSIGNMENT_FORBIDDEN', 'An evaluator cannot be assigned to review their own interview session');
  }

  // 3. Verify evaluator exists and is approved (role in 'evaluator', 'admin')
  const evaluatorRes = await client
    .from('user_roles')
    .select('user_id, role')
    .eq('user_id', evaluatorId)
    .in('role', ['evaluator', 'admin'])
    .maybeSingle();

  const evaluator = databaseData(evaluatorRes);
  if (!evaluator) {
    throw new SessionError(404, 'EVALUATOR_NOT_FOUND', `Evaluator ${evaluatorId} not found or not approved`);
  }

  // 4. Duplicate assignment check
  const existingRes = await client
    .from('review_assignments')
    .select('id')
    .eq('session_id', sessionId)
    .eq('evaluator_id', evaluatorId)
    .maybeSingle();

  if (existingRes?.data?.id) {
    throw new SessionError(409, 'ASSIGNMENT_EXISTS', 'This evaluator is already assigned to this interview session');
  }

  // 5. Insert assignment
  const insertRes = await client
    .from('review_assignments')
    .insert({
      session_id: sessionId,
      evaluator_id: evaluatorId,
      assigned_at: new Date().toISOString(),
    })
    .select()
    .single();

  const assignment = databaseData(insertRes);
  return {
    assignment: {
      id: assignment.id,
      sessionId: assignment.session_id,
      session_id: assignment.session_id,
      evaluatorId: assignment.evaluator_id,
      evaluator_id: assignment.evaluator_id,
      assignedAt: assignment.assigned_at,
      assigned_at: assignment.assigned_at,
    },
  };
}
