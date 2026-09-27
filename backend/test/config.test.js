import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { isAuthRetryableFetchError } from '@supabase/supabase-js';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
const { verifyAccessToken } = await import('../src/config/supabase.js');

test('SDK passes concurrent tokens independently', async (t) => {
  const seen = [];
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.ok(options.signal instanceof AbortSignal);
    seen.push(new Headers(options.headers).get('authorization'));
    return new Response(JSON.stringify({ id: 'test-user' }), {
      status: 200, headers: { 'content-type': 'application/json' },
    });
  });
  await Promise.all([verifyAccessToken('first-token'), verifyAccessToken('second-token')]);
  assert.deepEqual(seen.sort(), ['Bearer first-token', 'Bearer second-token']);
});

test('SDK eight-second abort becomes a retryable connection error', { timeout: 12000 }, async (t) => {
  t.mock.method(globalThis, 'fetch', (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true });
  }));
  // AbortSignal timers are unref'd; keep the isolated mock alive until it fires.
  const keepAlive = setInterval(() => {}, 1000);
  t.after(() => clearInterval(keepAlive));
  const started = Date.now();
  const { error } = await verifyAccessToken('test-token');
  assert.equal(isAuthRetryableFetchError(error), true);
  assert.ok(Date.now() - started >= 7500);
  assert.ok(Date.now() - started < 11000);
});

for (const [variable, value] of [
  ['SUPABASE_URL', ''], ['SUPABASE_URL', 'not-a-url-sensitive'],
  ['SUPABASE_URL', 'https://user:password@example.com'],
  ['SUPABASE_PUBLISHABLE_KEY', ''], ['SUPABASE_PUBLISHABLE_KEY', 'sb_secret_sensitive'],
  ['SUPABASE_PUBLISHABLE_KEY', 'eyJ-service-role-sensitive'],
  ['NODE_ENV', 'sensitive-invalid-mode'],
]) {
  test(`startup safely rejects ${variable}: ${value ? 'invalid' : 'missing'}`, () => {
    const result = spawnSync(process.execPath, ['src/server.js'], {
      cwd: new URL('..', import.meta.url),
      env: { ...process.env, [variable]: value }, encoding: 'utf8', timeout: 5000,
    });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr.trim(), `Invalid environment configuration: ${variable}`);
  });
}

const { createRequestClient } = await import('../src/config/supabase-request-client.js');

test('request-scoped database clients preserve distinct tokens and disable retries', async (t) => {
  const seen = [];
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.ok(options.signal instanceof AbortSignal);
    seen.push(new Headers(options.headers).get('authorization'));
    return new Response(JSON.stringify({ code: '08006', message: 'unavailable' }), {
      status: 503, headers: { 'content-type': 'application/json' },
    });
  });
  const first = createRequestClient('first-token');
  const second = createRequestClient('second-token');
  assert.notEqual(first, second);
  const results = await Promise.all([first.from('profiles').select('*'), second.from('profiles').select('*')]);
  assert.ok(results.every((result) => result.status === 503));
  assert.deepEqual(seen.sort(), ['Bearer first-token', 'Bearer second-token']);
});

test('request-scoped database timeout returns a failed query after eight seconds', { timeout: 12000 }, async (t) => {
  t.mock.method(globalThis, 'fetch', (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true });
  }));
  const keepAlive = setInterval(() => {}, 1000);
  t.after(() => clearInterval(keepAlive));
  const started = Date.now();
  const result = await createRequestClient('test-token').from('profiles').select('*');
  assert.equal(result.status, 0);
  assert.ok(result.error);
  assert.ok(Date.now() - started >= 7500);
  assert.ok(Date.now() - started < 11000);
});
