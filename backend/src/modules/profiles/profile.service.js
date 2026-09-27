const profileColumns = 'display_name,domain,experience_level,target_role,created_at,updated_at';

function profileError(status, code, message, retryable = false) {
  return Object.assign(new Error(message), { status, code, retryable });
}

function checkResult({ error, status }) {
  if (!error) return;
  const code = error.code ?? '';
  if (code === '42501' || status === 403) {
    throw profileError(403, 'PROFILE_FORBIDDEN', 'Profile operation is not permitted');
  }
  if (['PGRST301', 'PGRST303'].includes(code) || status === 401) {
    throw profileError(401, 'AUTH_INVALID', 'Invalid or expired access token');
  }
  // Missing tables/columns and schema-cache defects are configuration errors.
  if (['42P01', '42703', 'PGRST200', 'PGRST202', 'PGRST204', 'PGRST205'].includes(code)) {
    throw new Error('Profile database configuration failure');
  }
  if (status === 0 || status === 408 || status === 429 || status >= 500 ||
      code.startsWith('08') || ['57014', '57P01', '57P02', '57P03', '53300', 'PGRST000', 'PGRST001', 'PGRST002'].includes(code)) {
    throw profileError(503, 'DATABASE_UNAVAILABLE', 'Profile storage is temporarily unavailable', true);
  }
  throw new Error('Unexpected profile database failure');
}

function toProfile(row) {
  if (!row) return null;
  return {
    displayName: row.display_name,
    domain: row.domain,
    experienceLevel: row.experience_level,
    targetRole: row.target_role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function readProfile(client, userId) {
  const result = await client.from('profiles').select(profileColumns)
    .eq('user_id', userId).maybeSingle();
  checkResult(result);
  return toProfile(result.data);
}

export async function saveProfile(client, userId, patch) {
  const fields = {};
  const columns = {
    displayName: 'display_name', domain: 'domain',
    experienceLevel: 'experience_level', targetRole: 'target_role',
  };
  for (const [key, value] of Object.entries(patch)) fields[columns[key]] = value;

  const update = () => client.from('profiles').update(fields)
    .eq('user_id', userId).select(profileColumns).maybeSingle();
  const existing = await update();
  checkResult(existing);
  if (existing.data) return toProfile(existing.data);

  const inserted = await client.from('profiles').insert({ user_id: userId, ...fields })
    .select(profileColumns).single();
  if (inserted.error?.code !== '23505') {
    checkResult(inserted);
    if (!inserted.data) throw new Error('Profile insert returned no row');
    return toProfile(inserted.data);
  }

  // Another first save won the primary-key race. Apply only our supplied fields.
  const retried = await update();
  checkResult(retried);
  if (!retried.data) {
    throw profileError(409, 'PROFILE_CONFLICT', 'Profile changed during save; retry the request', true);
  }
  return toProfile(retried.data);
}
