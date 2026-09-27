import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import { AuthApiError, AuthRetryableFetchError, AuthSessionMissingError } from '@supabase/supabase-js';

// Synthetic configuration wins over dotenv; no real credentials or Auth calls.
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
const { createApp } = await import('../src/app.js');

async function request(t, verifyUser, authorization, path = '/me') {
  const createDatabaseClient = () => ({ from: () => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
  }) });
  const server = createApp({ verifyUser, createDatabaseClient }).listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await once(server, 'listening');
  const headers = authorization === undefined ? {} : { authorization };
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/v1${path}`, { headers });
  const body = await response.json();
  assert.equal(response.headers.get('x-request-id'), body.requestId);
  assert.ok(body.requestId);
  if (path === '/me') assert.equal(response.headers.get('cache-control'), 'no-store');
  return { response, body };
}

const unexpectedVerification = () => { throw new Error('Verifier must not be called'); };

for (const authorization of [undefined, '', 'Basic abc', 'Bearer', 'Bearer ', 'Bearer abc def', 'Bearer abc,def', 'Bearer sb_publishable_test', 'Bearer sb_secret_test']) {
  test(`missing or malformed credentials: ${JSON.stringify(authorization)}`, async (t) => {
    const { response, body } = await request(t, unexpectedVerification, authorization);
    assert.equal(response.status, 401);
    assert.equal(body.error.retryable, false);
    assert.ok(['AUTH_REQUIRED', 'AUTH_INVALID'].includes(body.error.code));
  });
}

for (const error of [new AuthApiError('expired sensitive message', 401, 'bad_jwt'), new AuthSessionMissingError()]) {
  test(`rejected token: ${error.name}`, async (t) => {
    const { response, body } = await request(t, async () => ({ data: { user: null }, error }), 'Bearer expired-token');
    assert.equal(response.status, 401);
    assert.equal(body.error.code, 'AUTH_INVALID');
    assert.equal(JSON.stringify(body).includes('sensitive'), false);
  });
}

test('verified identity returns only allowed fields, with case-insensitive Bearer', async (t) => {
  const { response, body } = await request(t, async (token) => {
    assert.equal(token, 'user-access-token');
    return { data: { user: { id: 'user-123', email: 'test@example.com', user_metadata: { role: 'admin' }, identities: [], access_token: 'excluded' } }, error: null };
  }, 'bEaReR user-access-token');
  assert.equal(response.status, 200);
  assert.deepEqual(body, { data: { user: { id: 'user-123', email: 'test@example.com' }, profile: null }, requestId: body.requestId });
});

test('missing email becomes null', async (t) => {
  const { body } = await request(t, async () => ({ data: { user: { id: 'user-123' } }, error: null }), 'Bearer token');
  assert.deepEqual(body.data.user, { id: 'user-123', email: null });
});

test('no verified user fails closed', async (t) => {
  const { response } = await request(t, async () => ({ data: { user: null }, error: null }), 'Bearer token');
  assert.equal(response.status, 401);
});

for (const error of [new AuthRetryableFetchError('connection failure', 0), new AuthApiError('upstream', 500), new AuthApiError('upstream', 599), new AuthApiError('rate limited', 429), new DOMException('timeout', 'TimeoutError')]) {
  test(`provider failure is retryable: ${error.name} ${error.status ?? ''}`, async (t) => {
    for (const throws of [false, true]) {
      const { response, body } = await request(t, async () => {
        if (throws) throw error;
        return { data: { user: null }, error };
      }, 'Bearer token');
      assert.equal(response.status, 503);
      assert.equal(body.error.code, 'AUTH_UNAVAILABLE');
      assert.equal(body.error.retryable, true);
      assert.equal(body.data, undefined);
    }
  });
}

test('unexpected errors use safe internal error envelope', async (t) => {
  const { response, body } = await request(t, async () => { throw new Error('secret token'); }, 'Bearer token');
  assert.equal(response.status, 500);
  assert.equal(body.error.code, 'INTERNAL_ERROR');
  assert.equal(JSON.stringify(body).includes('secret'), false);
});

test('health stays public and unchanged', async (t) => {
  const { response, body } = await request(t, unexpectedVerification, undefined, '/health');
  assert.equal(response.status, 200);
  assert.deepEqual(body.data, { service: 'paneliq-backend', status: 'ok' });
});
