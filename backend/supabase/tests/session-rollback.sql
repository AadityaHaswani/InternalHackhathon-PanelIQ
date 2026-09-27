-- MANUAL TEST ONLY. Run after migrations, human publication and verify:sessions.
-- Uses the active synthetic test session left by verify:sessions. ALL changes,
-- including this temporary probe function/trigger and attempted answer, roll back.
-- Run the ENTIRE file once in SQL Editor. Do not run fragments or replace ROLLBACK.
begin;
create function public.paneliq_test_fail_advance() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if current_setting('paneliq.test_failure', true) = 'on' then
    raise exception 'EXPECTED_TEST_FAILURE';
  end if;
  return new;
end;
$$;
revoke all on function public.paneliq_test_fail_advance() from public, anon, authenticated;
create trigger paneliq_test_fail_advance before update on public.sessions
for each row execute function public.paneliq_test_fail_advance();

do $$
declare
  interview public.sessions%rowtype;
  turn_id uuid;
  before_answers bigint;
  failed boolean := false;
begin
  select s.* into interview from public.sessions s join public.profiles p on p.user_id = s.user_id
  where s.status = 'active' and p.display_name = 'PanelIQ Synthetic Candidate'
  order by s.created_at desc limit 1 for update of s;
  if not found then raise exception 'Run verify:sessions first to leave an active synthetic test session'; end if;
  select id into turn_id from public.session_turns where session_id = interview.id and position = interview.current_position;
  select count(*) into before_answers from public.answers where session_id = interview.id;
  perform set_config('request.jwt.claim.sub', interview.user_id::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub',interview.user_id,'role','authenticated')::text, true);
  perform set_config('paneliq.test_failure', 'on', true);
  begin
    perform public.save_interview_turn(interview.id,turn_id,interview.version,
      gen_random_uuid()::text,'submitted','Synthetic rollback probe');
  exception when others then
    if sqlerrm <> 'EXPECTED_TEST_FAILURE' then raise; end if;
    failed := true;
  end;
  if not failed then raise exception 'FAIL failure was not injected'; end if;
  if (select count(*) from public.answers where session_id = interview.id) <> before_answers
    or exists(select 1 from public.sessions where id = interview.id and
      (version <> interview.version or current_position <> interview.current_position or status <> interview.status)) then
    raise exception 'FAIL partial transaction mutation';
  end if;
  raise notice 'PASS answer insertion and advancement roll back together';
end;
$$;
rollback;
