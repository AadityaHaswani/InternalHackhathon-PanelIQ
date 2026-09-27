import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env.js';
import { createRequestClient } from '../src/config/supabase-request-client.js';

// MANUAL ONLY: writes synthetic data to both dedicated test accounts.
// Never point these variables at real users. Tokens stay in this process.
const credentials = [
  [process.env.SUPABASE_TEST_EMAIL, process.env.SUPABASE_TEST_PASSWORD],
  [process.env.SUPABASE_TEST_EMAIL_2, process.env.SUPABASE_TEST_PASSWORD_2],
];
const authOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  db: { timeout: 8000, retry: false },
  global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(8000) }) },
};
let currentCheck = 'test-account-configuration';

async function check(label, run) {
  currentCheck = label;
  const result = await run();
  console.log(`PASS ${label}`);
  return result;
}

async function signIn([email, password]) {
  const client = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, authOptions);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  assert.equal(error, null);
  assert.ok(data.user?.email_confirmed_at);
  assert.ok(data.session?.access_token);
  return { id: data.user.id, token: data.session.access_token, db: createRequestClient(data.session.access_token) };
}

async function api(account, method, body) {
  const response = await fetch(`http://127.0.0.1:${env.PORT}/api/v1/me`, {
    method, headers: { Authorization: `Bearer ${account.token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  const result = await response.json();
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-request-id'), result.requestId);
  assert.equal(response.status, 200);
  assert.equal(result.data.user.id, account.id);
  return result.data.profile;
}

async function ownRow(account) {
  const { data, error } = await account.db.from('profiles').select('*').eq('user_id', account.id).single();
  assert.equal(error, null);
  assert.equal(data.user_id, account.id);
  return data;
}

function deniedWrite(result) {
  if (result.error) assert.equal(result.error.code, '42501');
  else assert.deepEqual(result.data, []); // A filtered UPDATE/DELETE can succeed on zero rows.
}

try {
  assert.ok(credentials.every(([email, password]) => email && password));
  const a = await check('sign-in-account-a', () => signIn(credentials[0]));
  const b = await check('sign-in-account-b', () => signIn(credentials[1]));
  await check('distinct-test-accounts', () => assert.notEqual(a.id, b.id));

  for (const [label, account] of [['a', a], ['b', b]]) {
    await check(`api-save-read-update-${label}`, async () => {
      // GET is read-only. A fresh account starts with profile:null; reruns may have a profile.
      await api(account, 'GET');
      const saved = await api(account, 'PATCH', {
        displayName: `PanelIQ Test ${label.toUpperCase()}`, domain: 'computer_science',
        experienceLevel: 'junior', targetRole: 'Synthetic Backend Developer',
      });
      assert.equal(saved.displayName, `PanelIQ Test ${label.toUpperCase()}`);
      assert.deepEqual(await api(account, 'GET'), saved);
      const updated = await api(account, 'PATCH', { experienceLevel: 'intermediate', targetRole: null });
      assert.equal(updated.displayName, saved.displayName);
      assert.equal(updated.experienceLevel, 'intermediate');
      assert.equal(updated.targetRole, null);
      assert.equal(updated.createdAt, saved.createdAt);
      assert.deepEqual(await api(account, 'GET'), updated);
    });
  }
  const beforeA = await check('direct-own-read-a', () => ownRow(a));
  const beforeB = await check('direct-own-read-b', () => ownRow(b));

  await check('a-cannot-read-b', async () => {
    const result = await a.db.from('profiles').select('*').eq('user_id', b.id);
    assert.equal(result.error, null);
    assert.deepEqual(result.data, []);
  });
  await check('a-cannot-insert-for-b', async () => {
    const result = await a.db.from('profiles').insert({ user_id: b.id, display_name: 'Forbidden insert' }).select();
    // A duplicate-key/FK error alone would NOT prove the ownership policy works.
    assert.equal(result.error?.code, '42501');
    assert.deepEqual(await ownRow(b), beforeB);
  });
  await check('a-cannot-update-b', async () => {
    deniedWrite(await a.db.from('profiles').update({ display_name: 'Forbidden update' }).eq('user_id', b.id).select());
    assert.deepEqual(await ownRow(b), beforeB);
  });
  await check('a-cannot-transfer-ownership', async () => {
    const result = await a.db.from('profiles').update({ user_id: b.id }).eq('user_id', a.id).select();
    assert.equal(result.error?.code, '42501');
    assert.deepEqual(await ownRow(a), beforeA);
    assert.deepEqual(await ownRow(b), beforeB);
  });
  for (const column of ['created_at', 'updated_at']) {
    await check(`protected-${column}`, async () => {
      const fields = { [column]: '2000-01-01T00:00:00Z' };
      const update = await a.db.from('profiles').update(fields).eq('user_id', a.id).select();
      assert.equal(update.error?.code, '42501');
      const insert = await a.db.from('profiles').insert({ user_id: a.id, ...fields }).select();
      assert.equal(insert.error?.code, '42501');
      assert.deepEqual(await ownRow(a), beforeA);
    });
  }
  await check('client-delete-denied', async () => {
    for (const owner of [a.id, b.id]) deniedWrite(await a.db.from('profiles').delete().eq('user_id', owner).select());
    assert.deepEqual(await ownRow(a), beforeA);
    assert.deepEqual(await ownRow(b), beforeB);
  });
  await check('database-constraints-enforced', async () => {
    for (const fields of [
      { display_name: ' ' }, { display_name: ' untrimmed' }, { display_name: 'x'.repeat(81) },
      { target_role: '\t' }, { target_role: 'untrimmed ' }, { target_role: 'x'.repeat(121) },
      { domain: 'unsupported' }, { experience_level: 'senior' },
    ]) {
      const result = await a.db.from('profiles').update(fields).eq('user_id', a.id).select();
      assert.equal(result.error?.code, '23514');
    }
    assert.deepEqual(await ownRow(a), beforeA);
  });
  await check('anonymous-data-api-denied', async () => {
    const anon = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, authOptions);
    const results = [
      await anon.from('profiles').select('*'),
      await anon.from('profiles').insert({ user_id: a.id, display_name: 'Forbidden anon' }).select(),
      await anon.from('profiles').update({ display_name: 'Forbidden anon' }).eq('user_id', b.id).select(),
      await anon.from('profiles').delete().eq('user_id', b.id).select(),
    ];
    for (const result of results) assert.equal(result.error?.code, '42501');
    assert.deepEqual(await ownRow(a), beforeA);
    assert.deepEqual(await ownRow(b), beforeB);
  });
} catch {
  // Never print SDK errors, assertion values, tokens, profile data or credentials.
  console.log(`FAIL ${currentCheck}`);
  process.exitCode = 1;
}
