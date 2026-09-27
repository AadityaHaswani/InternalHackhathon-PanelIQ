import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import { createClient } from '@supabase/supabase-js';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
const { createApp } = await import('../src/app.js');
const { saveProfile } = await import('../src/modules/profiles/profile.service.js');
const { readProfile } = await import('../src/modules/profiles/profile.service.js');

// Simulates Data API responses, not PostgreSQL/RLS. Uses the real SDK query builder.
function database() {
  const rows = new Map();
  const calls = [];
  const failure = { current: null };
  const client = (token) => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    db: { retry: false },
    global: { headers: { Authorization: `Bearer ${token}` }, fetch: async (input, options) => {
      const url = new URL(input);
      const fields = options.body ? JSON.parse(options.body) : undefined;
      const owner = url.searchParams.get('user_id')?.replace(/^eq\./, '');
      calls.push({ method: options.method, fields, owner, authorization: new Headers(options.headers).get('authorization') });
      const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
      if (failure.current) return reply(failure.current.error, failure.current.status);
      if (options.method === 'GET') return reply(rows.has(owner) ? [rows.get(owner)] : []);
      if (options.method === 'PATCH') {
        if (!rows.has(owner)) return reply([]);
        const row = { ...rows.get(owner), ...fields, updated_at: '2026-09-26T12:00:01Z' };
        rows.set(owner, row);
        return reply([row]);
      }
      assert.equal(options.method, 'POST');
      if (rows.has(fields.user_id)) return reply({ code: '23505', message: 'private SQL details' }, 409);
      const row = { display_name: null, domain: null, experience_level: null, target_role: null,
        created_at: '2026-09-26T12:00:00Z', updated_at: '2026-09-26T12:00:00Z', ...fields };
      rows.set(fields.user_id, row);
      return reply(row, 201);
    } },
  });
  return { client, rows, calls, failure };
}

async function api(t, db = database()) {
  const server = createApp({
    verifyUser: async (token) => ({ data: { user: { id: token === 'token-b' ? 'user-b' : 'user-a', email: null, user_metadata: { user_id: 'forged' } } }, error: null }),
    createDatabaseClient: db.client,
  }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const request = async (method = 'GET', body, token = 'token-a') => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/v1/me`, {
      method, headers: { ...(token === null ? {} : { authorization: `Bearer ${token}` }), 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await response.json();
    assert.equal(response.headers.get('x-request-id'), json.requestId);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    return { status: response.status, ...json };
  };
  return { ...db, request };
}

test('GET genuinely absent profile is null and does not create a row', async (t) => {
  const db = await api(t);
  const result = await db.request();
  assert.equal(result.status, 200);
  assert.equal(result.data.profile, null);
  assert.deepEqual(db.calls.map((call) => call.method), ['GET']);
  assert.equal(db.rows.size, 0);
});

test('first save, partial update, explicit null and subsequent GET preserve semantics', async (t) => {
  const db = await api(t);
  const first = await db.request('PATCH', { displayName: '  Demo Candidate  ', domain: 'computer_science', experienceLevel: 'junior', targetRole: ' Backend Developer ' });
  assert.equal(first.status, 200);
  assert.equal(first.data.profile.displayName, 'Demo Candidate');
  assert.equal(first.data.profile.targetRole, 'Backend Developer');
  assert.deepEqual(Object.keys(first.data.profile).sort(), ['createdAt', 'displayName', 'domain', 'experienceLevel', 'targetRole', 'updatedAt']);
  const updated = await db.request('PATCH', { experienceLevel: 'intermediate' });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.profile.displayName, 'Demo Candidate');
  assert.equal(updated.data.profile.targetRole, 'Backend Developer');
  assert.equal(updated.data.profile.createdAt, first.data.profile.createdAt);
  const cleared = await db.request('PATCH', { displayName: null });
  assert.equal(cleared.data.profile.displayName, null);
  assert.equal(cleared.data.profile.domain, 'computer_science');
  assert.deepEqual((await db.request()).data.profile, cleared.data.profile);
  assert.equal(db.rows.size, 1);
  for (const call of db.calls) {
    assert.equal(call.authorization, 'Bearer token-a');
    assert.equal(call.method === 'POST' ? call.fields.user_id : call.owner, 'user-a');
    if (call.method === 'PATCH') assert.equal('user_id' in call.fields, false);
  }
});

test('distinct verified users get separate profile clients and owners', async (t) => {
  const db = await api(t);
  await Promise.all([db.request('PATCH', { displayName: 'A' }), db.request('PATCH', { displayName: 'B' }, 'token-b')]);
  assert.equal(db.rows.get('user-a').display_name, 'A');
  assert.equal(db.rows.get('user-b').display_name, 'B');
  for (const call of db.calls) {
    const expected = call.authorization === 'Bearer token-b' ? 'user-b' : 'user-a';
    assert.equal(call.method === 'POST' ? call.fields.user_id : call.owner, expected);
  }
});

const invalidBodies = [{}, null, [], 'text', { displayName: '' }, { displayName: ' \t ' }, { displayName: 'A\0B' },
  { displayName: 42 }, { displayName: 'x'.repeat(81) }, { targetRole: false },
  { targetRole: 'x'.repeat(121) }, { domain: 'physics' }, { experienceLevel: 'senior' },
  ...['role', 'userId', 'user_id', 'email', 'createdAt', 'updatedAt', 'created_at', 'updated_at'].map((key) => ({ displayName: 'Valid', [key]: 'forged' }))];
test('invalid and unknown fields are rejected before database access', async (t) => {
  const db = await api(t);
  for (const body of invalidBodies) assert.equal((await db.request('PATCH', body)).status, 400);
  assert.equal((await db.request('PATCH')).status, 400);
  assert.equal(db.calls.length, 0);
});

test('all optional fields can be null; Unicode limits count characters', async (t) => {
  const db = await api(t);
  assert.equal((await db.request('PATCH', { displayName: '😀'.repeat(80) })).status, 200);
  assert.equal((await db.request('PATCH', { displayName: '😀'.repeat(81) })).status, 400);
  const result = await db.request('PATCH', { displayName: null, domain: null, experienceLevel: null, targetRole: null });
  assert.equal(result.status, 200);
  for (const key of ['displayName', 'domain', 'experienceLevel', 'targetRole']) assert.equal(result.data.profile[key], null);
});

for (const [code, status, expected, retryable] of [
  ['42P01', 404, 500, false], ['PGRST205', 404, 500, false], ['PGRST204', 400, 500, false],
  ['42501', 403, 403, false], ['PGRST301', 401, 401, false],
  ['08006', 503, 503, true], ['57014', 500, 503, true], ['', 429, 503, true],
]) {
  test(`database error ${code || status} is safe, never profile absent`, async (t) => {
    const db = await api(t);
    db.failure.current = { status, error: { code, message: 'private SQL credentials' } };
    for (const method of ['GET', 'PATCH']) {
      const result = await db.request(method, method === 'PATCH' ? { displayName: 'Demo' } : undefined);
      assert.equal(result.status, expected);
      assert.equal(result.error.retryable, retryable);
      assert.equal(result.data, undefined);
      assert.equal(JSON.stringify(result).includes('private'), false);
    }
  });
}

test('concurrent first saves retry once and preserve disjoint fields', async () => {
  const db = database();
  await Promise.all([
    saveProfile(db.client('token-a'), 'user-a', { displayName: 'Candidate' }),
    saveProfile(db.client('token-a'), 'user-a', { targetRole: 'Developer' }),
  ]);
  assert.equal(db.rows.size, 1);
  assert.equal(db.rows.get('user-a').display_name, 'Candidate');
  assert.equal(db.rows.get('user-a').target_role, 'Developer');
  assert.deepEqual(db.calls.map((call) => call.method), ['PATCH', 'PATCH', 'POST', 'POST', 'PATCH']);
});

test('a conflict followed by a missing row stops after one retry', async () => {
  let calls = 0;
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    db: { retry: false }, global: { fetch: async (_url, options) => {
      calls++;
      return new Response(JSON.stringify(options.method === 'POST' ? { code: '23505' } : []), {
        status: options.method === 'POST' ? 409 : 200, headers: { 'content-type': 'application/json' },
      });
    } },
  });
  await assert.rejects(saveProfile(client, 'user-a', { displayName: 'A' }), { status: 409, code: 'PROFILE_CONFLICT', retryable: true });
  assert.equal(calls, 3);
});

test('PATCH without credentials is rejected before any database call', async (t) => {
  const db = await api(t);
  const result = await db.request('PATCH', { displayName: 'A' }, null);
  assert.equal(result.status, 401);
  assert.equal(result.error.code, 'AUTH_REQUIRED');
  assert.equal(db.calls.length, 0);
});

test('connection failure becomes retryable 503 for reads and saves', async () => {
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    db: { retry: false },
    global: { fetch: async () => { throw new TypeError('private network detail'); } },
  });
  await assert.rejects(readProfile(client, 'user-a'), {
    status: 503, code: 'DATABASE_UNAVAILABLE', retryable: true,
  });
  await assert.rejects(saveProfile(client, 'user-a', { displayName: 'A' }), {
    status: 503, code: 'DATABASE_UNAVAILABLE', retryable: true,
  });
});
