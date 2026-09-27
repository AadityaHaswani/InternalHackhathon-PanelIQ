import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env.js';
import { createRequestClient } from '../src/config/supabase-request-client.js';

// Manual only: writes synthetic profiles/sessions/answers for two dedicated accounts.
// No account creation/deletion, privileged keys or SQL execution. Keep tokens in memory.
let label = 'test-account-configuration';
let status = 'not-run';
async function check(name, run) {
  label = name;
  status = 'not-run';
  const value = await run();
  console.log(`PASS ${name} status=${status}`);
  return value;
}
async function signIn(suffix) {
  const email = process.env[`SUPABASE_TEST_EMAIL${suffix}`];
  const password = process.env[`SUPABASE_TEST_PASSWORD${suffix}`];
  assert.ok(email && password);
  const auth = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession:false, autoRefreshToken:false, detectSessionInUrl:false },
    global: { fetch: (url, options) => fetch(url, { ...options, signal:AbortSignal.timeout(8000) }) },
  });
  const result = await auth.auth.signInWithPassword({email,password});
  status = result.error?.status ?? 200;
  assert.equal(result.error,null);
  assert.ok(result.data.user.email_confirmed_at);
  return { id:result.data.user.id, token:result.data.session.access_token, db:createRequestClient(result.data.session.access_token) };
}
async function api(account, path, method = 'GET', body, key, expected = 200) {
  const response = await fetch(`http://127.0.0.1:${env.PORT}/api/v1${path}`, {
    method, headers:{ Authorization:`Bearer ${account.token}`, 'Content-Type':'application/json', ...(key ? {'Idempotency-Key':key} : {}) },
    body:body === undefined ? undefined : JSON.stringify(body), signal:AbortSignal.timeout(45000),
  });
  status = response.status;
  const result = await response.json();
  assert.equal(response.status,expected);
  assert.equal(response.headers.get('x-request-id'),result.requestId);
  // Candidate envelopes must never contain private content, even nested in snapshots.
  const forbidden = ['expected_concepts','expectedConcepts','rubric_notes','rubricNotes','scoringAnchors'];
  const scan = (value) => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) { assert.ok(!forbidden.includes(key)); scan(child); }
  };
  scan(result);
  return expected >= 400 ? result.error : result.data;
}
async function rows(query) {
  const result = await query;
  status = result.status;
  assert.equal(result.error,null);
  return result.data;
}
async function denied(query) {
  const result = await query;
  status = result.status;
  assert.equal(result.error?.code,'42501');
}
const answerBody = (session, text = 'Synthetic test response describing a bounded approach.') => ({
  turnId:session.currentTurn.id, expectedSessionVersion:session.version, answerText:text,
});
const get = async (user,id) => (await api(user,`/sessions/${id}`)).session;

try {
  const a = await check('sign-in-a',()=>signIn(''));
  const b = await check('sign-in-b',()=>signIn('_2'));
  assert.notEqual(a.id,b.id);
  await check('migrations-visible',async()=> {
    // Fail before writes if even the prior profile migration is unavailable.
    await rows(a.db.from('profiles').select('user_id').limit(1));
    await rows(a.db.from('interview_roles').select('slug').limit(1));
    await rows(a.db.from('question_versions').select('id').limit(1));
    await rows(a.db.from('sessions').select('id').limit(1));
    await rows(a.db.from('session_turns').select('id').limit(1));
    await rows(a.db.from('answers').select('id').limit(1));
  });
  await check('catalog-and-reviewed-bank',async()=> {
    const catalog = await api(a,'/catalog');
    assert.ok(catalog.roles.some((r)=>r.slug==='backend_developer'));
    const bank = await rows(a.db.from('question_versions').select('id,experience_level,stage').eq('status','published').contains('role_slugs',['backend_developer']));
    for (const level of ['junior','intermediate']) {
      for (const [stage,min] of [['icebreaker',1],['technical',4],['techno_managerial',2],['reflection',1]]) {
        assert.ok(bank.filter((q)=>q.experience_level===level && q.stage===stage).length>=min);
      }
    }
  });
  await check('prepare-dedicated-profiles',async()=> {
    for (const [user,level] of [[a,'junior'],[b,'intermediate']]) await api(user,'/me','PATCH',{
      displayName:'PanelIQ Synthetic Candidate',domain:'computer_science',experienceLevel:level,targetRole:'backend_developer',
    });
  });
  let sa = (await check('create-session-a',()=>api(a,'/sessions','POST',{},undefined,201))).session;
  let sb = (await check('create-session-b',()=>api(b,'/sessions','POST',{},undefined,201))).session;
  const original = sa;
  const planA = await check('eight-turn-persisted-plan',async()=> {
    const plan = await rows(a.db.from('session_turns').select('*').eq('session_id',sa.id).order('position'));
    assert.equal(plan.length,8);
    assert.equal(new Set(plan.map((t)=>t.question_id)).size,8);
    assert.deepEqual(plan.map((t)=>t.question_snapshot.stage),['icebreaker','technical','technical','technical','technical','techno_managerial','techno_managerial','reflection']);
    assert.deepEqual(await get(a,sa.id),sa);
    assert.equal(sa.profile.targetRole,'backend_developer');
    assert.equal(sa.profile.experienceLevel,'junior');
    assert.equal(sb.profile.experienceLevel,'intermediate');
    return plan;
  });
  await check('invalid-plan-transaction-rolls-back',async()=> {
    const before = await rows(a.db.from('sessions').select('id'));
    const invalid = planA.map((t)=>t.question_version_id);
    [invalid[0],invalid[1]]=[invalid[1],invalid[0]];
    const result = await a.db.rpc('create_interview_session',{p_question_versions:invalid});
    status = result.status;
    assert.equal(result.error?.message,'BANK_CHANGED');
    assert.deepEqual(await rows(a.db.from('sessions').select('id').order('id')),before.sort((x,y)=>x.id.localeCompare(y.id)));
  });
  await check('early-completion-blocked',async()=> {
    const error = await api(a,`/sessions/${sa.id}/complete`,'POST',{expectedSessionVersion:sa.version},undefined,409);
    assert.equal(error.code,'SESSION_INCOMPLETE');
    assert.deepEqual(await get(a,sa.id),sa);
  });
  let firstOutcome;
  const firstKey = randomUUID();
  const firstBody = answerBody(sa);
  await check('atomic-concurrent-duplicate-answer',async()=> {
    const results = await Promise.all([1,2].map(()=>api(a,`/sessions/${sa.id}/answers`,'POST',firstBody,firstKey)));
    assert.deepEqual(results[0],results[1]);
    firstOutcome = results[0];
    sa = firstOutcome.session;
    assert.equal(sa.version,2);
    assert.equal(sa.answeredCount,1);
    assert.equal((await rows(a.db.from('answers').select('id').eq('session_id',sa.id))).length,1);
  });
  await check('same-key-different-content-conflicts',async()=> {
    const error = await api(a,`/sessions/${sa.id}/answers`,'POST',{...firstBody,answerText:'Different synthetic content'},firstKey,409);
    assert.equal(error.code,'IDEMPOTENCY_CONFLICT');
    assert.deepEqual(await get(a,sa.id),sa);
  });
  await check('concurrent-different-answers-have-one-winner',async()=> {
    const base = answerBody(sa);
    const send = async(text)=> {
      const response = await fetch(`http://127.0.0.1:${env.PORT}/api/v1/sessions/${sa.id}/answers`,{
        method:'POST',headers:{Authorization:`Bearer ${a.token}`,'Content-Type':'application/json','Idempotency-Key':randomUUID()},
        body:JSON.stringify({...base,answerText:text}),signal:AbortSignal.timeout(30000),
      });
      return {status:response.status,body:await response.json()};
    };
    const results = await Promise.all([send('Synthetic concurrent A'),send('Synthetic concurrent B')]);
    assert.deepEqual(results.map((r)=>r.status).sort(),[200,409]);
    sa = results.find((r)=>r.status===200).body.data.session;
    assert.equal(sa.version,3);
    assert.equal((await rows(a.db.from('answers').select('id').eq('session_id',sa.id))).length,2);
  });
  await check('stale-failed-save-does-not-advance',async()=> {
    await api(a,`/sessions/${sa.id}/answers`,'POST',{...answerBody(sa),expectedSessionVersion:1},randomUUID(),409);
    assert.deepEqual(await get(a,sa.id),sa);
    assert.equal((await rows(a.db.from('answers').select('id').eq('session_id',sa.id))).length,2);
  });
  sb = (await api(b,`/sessions/${sb.id}/answers`,'POST',answerBody(sb),randomUUID())).session;
  await check('two-user-direct-isolation',async()=> {
    for (const [viewer,other] of [[a,sb],[b,sa]]) {
      assert.deepEqual(await rows(viewer.db.from('sessions').select('*').eq('id',other.id)),[]);
      for (const table of ['session_turns','answers']) assert.deepEqual(await rows(viewer.db.from(table).select('*').eq('session_id',other.id)),[]);
      await api(viewer,`/sessions/${other.id}`,'GET',undefined,undefined,404);
      await api(viewer,`/sessions/${other.id}/answers`,'POST',answerBody(other),randomUUID(),404);
      await api(viewer,`/sessions/${other.id}/complete`,'POST',{expectedSessionVersion:other.version},undefined,404);
      const result = await viewer.db.rpc('save_interview_turn',{p_session_id:other.id,p_turn_id:other.currentTurn.id,
        p_expected_version:other.version,p_idempotency_key:randomUUID(),p_state:'submitted',p_answer:'Forbidden'});
      assert.equal(result.error?.message,'SESSION_NOT_FOUND');
    }
    assert.deepEqual(await get(a,sa.id),sa);
    assert.deepEqual(await get(b,sb.id),sb);
  });
  await check('direct-writes-and-private-bank-denied',async()=> {
    await denied(a.db.from('question_keys').select('*'));
    await denied(a.db.from('question_versions').update({prompt:'Forbidden'}).eq('id',planA[0].question_version_id).select());
    await denied(a.db.from('question_keys').update({rubric_notes:'Forbidden'}).eq('question_version_id',planA[0].question_version_id).select());
    await denied(a.db.from('sessions').update({status:'completed'}).eq('id',sa.id).select());
    await denied(a.db.from('session_turns').update({question_snapshot:{prompt:'Forbidden'}}).eq('session_id',sa.id).select());
    await denied(a.db.from('answers').update({answer_text:'Forbidden'}).eq('session_id',sa.id).select());
    await denied(a.db.from('sessions').delete().eq('id',sb.id).select());
    assert.deepEqual(await get(a,sa.id),sa);
    assert.deepEqual(await get(b,sb.id),sb);
  });
  await check('explicit-skip-and-idempotent-retry',async()=> {
    const key = randomUUID();
    const body = {turnId:sa.currentTurn.id,expectedSessionVersion:sa.version,confirm:true};
    const skipped = await api(a,`/sessions/${sa.id}/skip`,'POST',body,key);
    assert.deepEqual(await api(a,`/sessions/${sa.id}/skip`,'POST',body,key),skipped);
    assert.equal(skipped.answerState,'skipped');
    const [row] = await rows(a.db.from('answers').select('state,answer_text').eq('id',skipped.answerId));
    assert.equal(row.state,'skipped'); assert.equal(row.answer_text,null);
    sa = skipped.session;
  });
  await check('complete-and-freeze-transcript',async()=> {
    while (sa.currentTurn) sa = (await api(a,`/sessions/${sa.id}/answers`,'POST',answerBody(sa),randomUUID())).session;
    assert.equal(sa.status,'ready_to_complete');
    const before = await rows(a.db.from('answers').select('*').eq('session_id',sa.id).order('id'));
    assert.equal(before.length,8);
    const version = sa.version;
    sa = (await api(a,`/sessions/${sa.id}/complete`,'POST',{expectedSessionVersion:version})).session;
    assert.equal(sa.status,'completed');
    assert.deepEqual((await api(a,`/sessions/${sa.id}/complete`,'POST',{expectedSessionVersion:version})).session,sa);
    await api(a,`/sessions/${sa.id}/answers`,'POST',firstBody,randomUUID(),409);
    assert.deepEqual(await api(a,`/sessions/${sa.id}/answers`,'POST',firstBody,firstKey),firstOutcome);
    assert.deepEqual(await rows(a.db.from('answers').select('*').eq('session_id',sa.id).order('id')),before);
    assert.deepEqual(await rows(a.db.from('session_turns').select('*').eq('session_id',sa.id).order('position')),planA);
    assert.deepEqual(await get(a,sa.id),sa);
    assert.equal(original.version,1);
  });
  await check('anonymous-access-denied',async()=> {
    const anon = createClient(env.SUPABASE_URL,env.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},db:{timeout:8000,retry:false}});
    for (const table of ['sessions','session_turns','answers','question_versions','question_keys']) await denied(anon.from(table).select('*'));
    const result = await anon.rpc('complete_interview_session',{p_session_id:sa.id,p_expected_version:sa.version});
    assert.ok(result.error && [401,403].includes(result.status));
  });
} catch {
  console.log(`FAIL ${label} status=${status}`);
  process.exitCode = 1;
}
