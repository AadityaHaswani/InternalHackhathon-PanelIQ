import assert from 'node:assert/strict';
import { test } from 'node:test';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
const { createApp } = await import('../src/app.js');
const { createSession, saveTurn, completeSession } = await import('../src/modules/sessions/session.service.js');
const sessionId = randomUUID();
const turnId = randomUUID();
const questionId = randomUUID();
const session = { id: sessionId, profile: { targetRole: 'backend_developer' }, status: 'active', version: 1,
  answeredCount: 0, totalTurns: 8, currentTurn: { id: turnId, position: 1, prompt: 'Describe your project', stage: 'icebreaker' } };

function database(reply) {
  const calls = [];
  const client = (token) => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, db: { retry: false },
    global: { headers: { Authorization: `Bearer ${token}` }, fetch: async (input, options) => {
      const url = new URL(input);
      const call = { path: url.pathname, query: url.searchParams, method: options.method,
        body: options.body ? JSON.parse(options.body) : null, token: new Headers(options.headers).get('authorization') };
      calls.push(call);
      const result = await reply(call);
      return new Response(JSON.stringify(result.data ?? null), { status: result.status ?? 200, headers: { 'content-type': 'application/json' } });
    } },
  });
  return { client, calls };
}
async function api(t, reply) {
  const db = database(reply);
  const server = createApp({ verifyUser: async () => ({ data: { user: { id: 'verified-owner', email: null } }, error: null }),
    createDatabaseClient: db.client }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const request = async (path, method = 'GET', body, key, authenticated = true) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/v1${path}`, {
      method, headers: { 'content-type': 'application/json', ...(authenticated ? { authorization: 'Bearer verified-token' } : {}),
        ...(key ? { 'Idempotency-Key': key } : {}) }, body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await response.json();
    assert.equal(response.headers.get('x-request-id'), data.requestId);
    return { status: response.status, ...data };
  };
  return { ...db, request };
}
const failure = (code, status) => ({ status, data: { code: `PT${status}`, message: code, details: 'never disclose' } });

test('catalog returns only supported choices and authenticated role slugs', async (t) => {
  const db = await api(t, () => ({ data: [{ slug: 'backend_developer', domain: 'computer_science', label: 'Backend Developer', expected_concepts: 'private' }] }));
  const result = await db.request('/catalog');
  assert.equal(result.status, 200);
  assert.equal(JSON.stringify(result).includes('private'), false);
  assert.deepEqual(result.data.roles, [{ slug: 'backend_developer', domain: 'computer_science', label: 'Backend Developer' }]);
  assert.deepEqual(Object.keys(result.data).sort(), ['domains','levels','roles','stages','topics']);
  assert.equal((await db.request('/catalog','GET',undefined,undefined,false)).status, 401);
  assert.equal(db.calls.length, 1);
});

test('session endpoints require authentication; wrong-owner/missing state is 404', async (t) => {
  const db = await api(t, () => ({ data: null }));
  for (const [path, method] of [['/sessions','GET'],['/sessions','POST'],[`/sessions/${sessionId}`,'GET'],
    [`/sessions/${sessionId}/answers`,'POST'],[`/sessions/${sessionId}/skip`,'POST'],[`/sessions/${sessionId}/complete`,'POST']]) {
    assert.equal((await db.request(path, method, undefined, undefined, false)).status, 401);
  }
  assert.equal(db.calls.length, 0);
  assert.equal((await db.request(`/sessions/${sessionId}`)).status, 404);
  assert.equal(db.calls[0].token, 'Bearer verified-token');
});

test('resume reads persisted state without regenerating a plan', async (t) => {
  const db = await api(t, () => ({ data: session }));
  assert.deepEqual((await db.request(`/sessions/${sessionId}`)).data.session, session);
  assert.deepEqual((await db.request(`/sessions/${sessionId}`)).data.session, session);
  assert.ok(db.calls.every((call) => call.path.endsWith('/rpc/session_state')));
});

test('answer validation rejects ownership, oversized text, missing keys and versions', async (t) => {
  const db = await api(t, () => { throw new Error('Unexpected database request'); });
  for (const body of [{}, { turnId, expectedSessionVersion: 1, answerText: ' ' },
    { turnId, expectedSessionVersion: 1, answerText: 'x'.repeat(2001) },
    { turnId, expectedSessionVersion: 1, answerText: 'ok', userId: 'forged' },
    { turnId, expectedSessionVersion: '1', answerText: 'ok' }]) {
    assert.equal((await db.request(`/sessions/${sessionId}/answers`,'POST',body,'test-key-1')).status, 400);
  }
  assert.equal((await db.request(`/sessions/${sessionId}/answers`,'POST',{ turnId, expectedSessionVersion: 1, answerText: 'ok' })).status, 400);
  assert.equal((await db.request('/sessions','POST',{ domain:'physics', level:'senior' })).status, 400);
  assert.equal((await db.request(`/sessions/${sessionId}/skip`,'POST',{ turnId, expectedSessionVersion: 1 },'skip-key-1')).status, 400);
  assert.equal(db.calls.length, 0);
});

test('answer and explicit skip each use one atomic RPC, never separate advance writes', async (t) => {
  const outcome = { answerId: randomUUID(), answerState: 'submitted', session: { ...session, version: 2 } };
  const db = await api(t, () => ({ data: outcome }));
  const result = await db.request(`/sessions/${sessionId}/answers`,'POST',{ turnId, expectedSessionVersion: 1, answerText: '  My answer  ' },'answer-key-1');
  assert.equal(result.status, 200);
  assert.deepEqual(result.data, outcome);
  assert.equal(db.calls.length, 1);
  assert.deepEqual(db.calls[0].body, { p_session_id: sessionId, p_turn_id: turnId, p_expected_version: 1,
    p_idempotency_key:'answer-key-1', p_state:'submitted', p_answer:'My answer' });
  await db.request(`/sessions/${sessionId}/skip`,'POST',{ turnId, expectedSessionVersion: 1, confirm:true },'skip-key-1');
  assert.equal(db.calls.length, 2);
  assert.equal(db.calls[1].body.p_state, 'skipped');
  assert.equal(db.calls[1].body.p_answer, null);
  assert.ok(db.calls.every((call) => call.path.endsWith('/rpc/save_interview_turn')));
});

test('duplicate RPC outcome is returned unchanged; database conflicts map safely', async (t) => {
  const outcome = { answerId: randomUUID(), answerState: 'submitted', session: { ...session, version: 2 } };
  let conflict;
  const db = await api(t, () => conflict ? failure(conflict,409) : ({ data: outcome }));
  const body = { turnId, expectedSessionVersion: 1, answerText:'Answer' };
  const first = await db.request(`/sessions/${sessionId}/answers`,'POST',body,'same-key-1');
  assert.deepEqual((await db.request(`/sessions/${sessionId}/answers`,'POST',body,'same-key-1')).data, first.data);
  for (const code of ['IDEMPOTENCY_CONFLICT','SESSION_STALE','TURN_NOT_CURRENT','SESSION_NOT_ACTIVE']) {
    conflict = code;
    const result = await db.request(`/sessions/${sessionId}/answers`,'POST',body,'same-key-1');
    assert.equal(result.status, 409);
    assert.equal(result.error.code, code);
    assert.equal(JSON.stringify(result).includes('never disclose'), false);
  }
});

test('failed atomic save returns no success and performs no follow-up mutation', async (t) => {
  const db = await api(t, () => ({ status: 503, data: { code:'08006', message:'private details' } }));
  const result = await db.request(`/sessions/${sessionId}/answers`,'POST',{ turnId, expectedSessionVersion: 1, answerText:'Answer' },'failure-key-1');
  assert.equal(result.status, 503);
  assert.equal(result.error.retryable, true);
  assert.equal(result.data, undefined);
  assert.equal(db.calls.length, 1);
});

test('completion requires version and surfaces incomplete/frozen state safely', async (t) => {
  let ready = false;
  const db = await api(t, () => ready ? ({ data: { ...session, status:'completed', version:10, currentTurn:null } }) : failure('SESSION_INCOMPLETE',409));
  assert.equal((await db.request(`/sessions/${sessionId}/complete`,'POST',{})).status,400);
  assert.equal((await db.request(`/sessions/${sessionId}/complete`,'POST',{expectedSessionVersion:1})).status,409);
  ready = true;
  const complete = await db.request(`/sessions/${sessionId}/complete`,'POST',{expectedSessionVersion:9});
  assert.equal(complete.data.session.status,'completed');
  assert.ok(db.calls.every((call) => call.path.endsWith('/rpc/complete_interview_session')));
});

test('creation uses persisted owner/profile, latest published versions and one creation RPC', async () => {
  const stages = ['icebreaker','technical','technical','technical','technical','techno_managerial','techno_managerial','reflection'];
  const bank = stages.map((stage,i) => ({id:randomUUID(),question_id:`q${i}`,version:1,stage,domain:'computer_science',experience_level:'junior',topics:['apis'],role_slugs:['backend_developer'],status:'published'}));
  const newer = { ...bank[0], id:questionId, version:2 };
  const db = database((call) => {
    if (call.path.endsWith('/profiles')) {
      assert.equal(call.query.get('user_id'),'eq.verified-owner');
      return {data:[{display_name:'Demo',domain:'computer_science',experience_level:'junior',target_role:'backend_developer'}]};
    }
    if (call.path.endsWith('/interview_roles')) return {data:[{slug:'backend_developer',domain:'computer_science'}]};
    if (call.path.endsWith('/question_versions')) return {data:[newer,...bank]};
    assert.ok(call.path.endsWith('/rpc/create_interview_session'));
    assert.equal(call.body.p_question_versions.length,8);
    assert.ok(call.body.p_question_versions.includes(newer.id));
    assert.ok(!call.body.p_question_versions.includes(bank[0].id));
    return {data:session};
  });
  assert.deepEqual(await createSession(db.client('token'),'verified-owner'),session);
  assert.equal(db.calls.filter((call) => call.path.includes('/rpc/')).length,1);
});

test('service does not implement a second client-side transaction or retry loop', async () => {
  const db = database(() => ({status:409,data:{code:'PT409',message:'SESSION_STALE'}}));
  await assert.rejects(saveTurn(db.client('token'),sessionId,{turnId,expectedSessionVersion:1,answerText:'A'},'test-key-1'),{code:'SESSION_STALE'});
  await assert.rejects(completeSession(db.client('token'),sessionId,1),{code:'SESSION_STALE'});
  assert.equal(db.calls.length,2);
});

test('list uses verified owner, bounded pagination and returns only summaries', async (t) => {
  const db = await api(t, (call) => {
    assert.equal(call.query.get('user_id'),'eq.verified-owner');
    assert.equal(call.query.get('limit'),'3');
    assert.equal(call.query.get('offset'),'2');
    return {data:Array.from({length:3},(_,i)=>({id:String(i),profile_snapshot:{targetRole:'backend_developer'},status:'active',current_position:2,version:2,created_at:'2026-09-27T00:00:00Z',completed_at:null,private:'excluded'}))};
  });
  const result = await db.request('/sessions?limit=2&offset=2');
  assert.equal(result.status,200);
  assert.equal(result.data.sessions.length,2);
  assert.equal(result.data.nextOffset,4);
  assert.equal(JSON.stringify(result).includes('excluded'),false);
  assert.equal((await db.request('/sessions?userId=forged')).status,400);
});

test('missing migration is a safe internal error, never an empty list', async (t) => {
  const db = await api(t,()=>({status:404,data:{code:'PGRST205',message:'private schema details'}}));
  const result = await db.request('/sessions');
  assert.equal(result.status,500);
  assert.equal(result.error.code,'INTERNAL_ERROR');
  assert.equal(result.data,undefined);
  assert.equal(JSON.stringify(result).includes('private'),false);
});
