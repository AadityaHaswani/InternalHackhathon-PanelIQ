import { selectPlan } from './session-plan.js';

export class SessionError extends Error {
  constructor(status, code, message, retryable = false) {
    super(message);
    Object.assign(this, { status, code, retryable });
  }
}
const databaseErrors = {
  AUTH_REQUIRED: [401, 'A verified access token is required'],
  PROFILE_INCOMPLETE: [400, 'Complete display name, domain, level and target role in your profile'],
  PROFILE_UNSUPPORTED: [400, 'Select a supported domain, level and role slug from the catalog'],
  INVALID_PLAN: [400, 'Invalid session plan'],
  INVALID_ANSWER: [400, 'Invalid answer or idempotency key'],
  INVALID_VERSION: [400, 'Invalid session version'],
  SESSION_NOT_FOUND: [404, 'Session not found'],
  BANK_CHANGED: [409, 'The question bank changed; create a new session plan'],
  IDEMPOTENCY_CONFLICT: [409, 'This idempotency key was already used with different content'],
  SESSION_NOT_ACTIVE: [409, 'This session is no longer accepting answers'],
  SESSION_STALE: [409, 'Session version changed; refresh the session'],
  TURN_NOT_CURRENT: [409, 'Only the current turn can be answered'],
  SESSION_INCOMPLETE: [409, 'Answer or explicitly skip all eight turns before completing'],
};

export function databaseData(result) {
  if (!result.error) return result.data;
  const { code, message } = result.error;
  if (code?.startsWith('PT') && Object.hasOwn(databaseErrors, message)) {
    const [status, safeMessage] = databaseErrors[message];
    throw new SessionError(status, message, safeMessage);
  }
  if (code === '42501' || result.status === 403) throw new SessionError(403, 'SESSION_FORBIDDEN', 'Operation is not permitted');
  if (result.status === 401) throw new SessionError(401, 'AUTH_INVALID', 'Invalid or expired access token');
  if (['42P01','42703','PGRST202','PGRST204','PGRST205','PGRST300'].includes(code)) throw new Error('Interview database configuration failure');
  if (result.status === 0 || result.status === 408 || result.status === 429 || result.status >= 500) {
    throw new SessionError(503, 'DATABASE_UNAVAILABLE', 'Interview storage is temporarily unavailable', true);
  }
  throw new Error('Interview database operation failed');
}

export async function supportedRoles(client) {
  return databaseData(await client.from('interview_roles').select('slug,domain,label').eq('active', true).order('slug'));
}

export async function createSession(client, userId) {
  const profile = databaseData(await client.from('profiles')
    .select('display_name,domain,experience_level,target_role').eq('user_id', userId).maybeSingle());
  const roles = await supportedRoles(client);
  // Return onboarding errors before querying the bank.
  if (!profile?.display_name || !profile.domain || !profile.experience_level || !profile.target_role) {
    throw new SessionError(400, 'PROFILE_INCOMPLETE', databaseErrors.PROFILE_INCOMPLETE[1]);
  }
  if (!roles.some((r) => r.slug === profile.target_role && r.domain === profile.domain)) {
    throw new SessionError(400, 'PROFILE_UNSUPPORTED', databaseErrors.PROFILE_UNSUPPORTED[1]);
  }
  const questions = databaseData(await client.from('question_versions')
    .select('id,question_id,version,domain,experience_level,stage,topics,role_slugs,status')
    .eq('status', 'published').eq('domain', profile.domain)
    .eq('experience_level', profile.experience_level).contains('role_slugs', [profile.target_role])
    .order('version', { ascending: false }).limit(1000));
  // Only the latest published version of each stable question participates.
  const latest = [...new Map([...questions].reverse().map((q) => [q.question_id, q])).values()];
  let plan;
  try { plan = selectPlan(latest, profile, roles); }
  catch (error) {
    if (['PROFILE_INCOMPLETE', 'PROFILE_UNSUPPORTED', 'BANK_INSUFFICIENT'].includes(error.code)) {
      throw new SessionError(error.status, error.code, error.message);
    }
    throw new Error('Interview selection failed');
  }
  return databaseData(await client.rpc('create_interview_session', { p_question_versions: plan }));
}

export async function getSession(client, id) {
  const session = databaseData(await client.rpc('session_state', { p_session_id: id }));
  if (!session) throw new SessionError(404, 'SESSION_NOT_FOUND', 'Session not found');
  return session;
}

export async function listSessions(client, userId, { limit, offset }) {
  const rows = databaseData(await client.from('sessions')
    .select('id,profile_snapshot,status,current_position,version,created_at,completed_at')
    .eq('user_id', userId).order('created_at', { ascending: false }).order('id')
    .range(offset, offset + limit));
  return {
    sessions: rows.slice(0, limit).map((row) => ({ id: row.id, profile: row.profile_snapshot,
      status: row.status, version: row.version, answeredCount: row.current_position - 1,
      totalTurns: 8, createdAt: row.created_at, completedAt: row.completed_at })),
    nextOffset: rows.length > limit ? offset + limit : null,
  };
}

export async function saveTurn(client, id, body, key, skip = false) {
  return databaseData(await client.rpc('save_interview_turn', {
    p_session_id: id, p_turn_id: body.turnId, p_expected_version: body.expectedSessionVersion,
    p_idempotency_key: key, p_state: skip ? 'skipped' : 'submitted', p_answer: skip ? null : body.answerText,
  }));
}
export async function completeSession(client, id, version) {
  return databaseData(await client.rpc('complete_interview_session', { p_session_id: id, p_expected_version: version }));
}
