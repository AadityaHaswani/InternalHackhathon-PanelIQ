begin;
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_snapshot jsonb not null,
  status text not null default 'active' check (status in ('active','ready_to_complete','completed')),
  current_position integer not null default 1 check (current_position between 1 and 9),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check ((status = 'active' and current_position <= 8 and completed_at is null)
    or (status = 'ready_to_complete' and current_position = 9 and completed_at is null)
    or (status = 'completed' and current_position = 9 and completed_at is not null))
);
create index sessions_owner_created on public.sessions (user_id, created_at desc, id);
create table public.session_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  position integer not null check (position between 1 and 8),
  question_version_id uuid not null references public.question_versions(id),
  question_id text not null,
  question_snapshot jsonb not null,
  unique (session_id, position),
  unique (session_id, question_id),
  unique (session_id, id)
);
create table public.answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  turn_id uuid not null unique,
  state text not null check (state in ('submitted','skipped')),
  answer_text text,
  idempotency_key text not null check (idempotency_key ~ '^[A-Za-z0-9_-]{8,128}$'),
  expected_version integer not null check (expected_version > 0),
  saved_outcome jsonb not null,
  created_at timestamptz not null default now(),
  foreign key (session_id, turn_id) references public.session_turns(session_id, id),
  unique (session_id, idempotency_key),
  check ((state = 'skipped' and answer_text is null) or
    (state = 'submitted' and answer_text is not null and char_length(answer_text) between 1 and 2000))
);

alter table public.sessions enable row level security;
alter table public.session_turns enable row level security;
alter table public.answers enable row level security;
revoke all on public.sessions, public.session_turns, public.answers from public, anon, authenticated;
grant select on public.sessions, public.session_turns, public.answers to authenticated;
create policy sessions_own_read on public.sessions for select to authenticated
using (user_id = (select auth.uid()));
create policy turns_own_read on public.session_turns for select to authenticated
using (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = (select auth.uid())));
create policy answers_own_read on public.answers for select to authenticated
using (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = (select auth.uid())));
-- No direct INSERT/UPDATE/DELETE grants or policies: writes go through RPC only.

create function public.session_state(p_session_id uuid) returns jsonb
language sql volatile security invoker set search_path = '' as $$
  select jsonb_build_object(
    'id', s.id, 'profile', s.profile_snapshot, 'status', s.status,
    'version', s.version, 'answeredCount', s.current_position - 1, 'totalTurns', 8,
    'createdAt', s.created_at, 'completedAt', s.completed_at,
    'currentTurn', (select t.question_snapshot || jsonb_build_object('id', t.id, 'position', t.position)
      from public.session_turns t where t.session_id = s.id and t.position = s.current_position)
  ) from public.sessions s where s.id = p_session_id and s.user_id = auth.uid();
$$;

-- Definer is necessary: candidates cannot write the tables directly. Every RPC
-- derives auth.uid(), validates input/ownership and uses a fixed empty search_path.
create function public.create_interview_session(p_question_versions uuid[]) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  profile public.profiles%rowtype;
  question public.question_versions%rowtype;
  session_id uuid := gen_random_uuid();
  stages text[] := array['icebreaker','technical','technical','technical','technical','techno_managerial','techno_managerial','reflection'];
  used_questions text[] := array[]::text[];
  i integer;
begin
  if actor is null then raise sqlstate 'PT401' using message = 'AUTH_REQUIRED'; end if;
  select * into profile from public.profiles where user_id = actor for share;
  if not found or profile.display_name is null or profile.domain is null or profile.experience_level is null or profile.target_role is null then
    raise sqlstate 'PT400' using message = 'PROFILE_INCOMPLETE';
  end if;
  if not exists (select 1 from public.interview_roles where slug = profile.target_role and domain = profile.domain and active)
    or profile.domain <> 'computer_science' or profile.experience_level not in ('junior','intermediate') then
    raise sqlstate 'PT400' using message = 'PROFILE_UNSUPPORTED';
  end if;
  if p_question_versions is null or cardinality(p_question_versions) <> 8 or array_ndims(p_question_versions) <> 1
    or array_lower(p_question_versions,1) <> 1 or array_position(p_question_versions,null) is not null then
    raise sqlstate 'PT400' using message = 'INVALID_PLAN';
  end if;
  insert into public.sessions (id, user_id, profile_snapshot) values (session_id, actor,
    jsonb_build_object('displayName',profile.display_name,'domain',profile.domain,
      'experienceLevel',profile.experience_level,'targetRole',profile.target_role));
  for i in 1..8 loop
    select * into question from public.question_versions where id = p_question_versions[i] for share;
    if not found or question.status <> 'published' or question.domain <> profile.domain
      or question.experience_level <> profile.experience_level or not (profile.target_role = any(question.role_slugs))
      or question.stage <> stages[i] or question.question_id = any(used_questions)
      or not exists (select 1 from public.question_keys where question_version_id = question.id) then
      raise sqlstate 'PT409' using message = 'BANK_CHANGED';
    end if;
    used_questions := array_append(used_questions, question.question_id);
    insert into public.session_turns (session_id,position,question_version_id,question_id,question_snapshot)
    values (session_id,i,question.id,question.question_id,jsonb_build_object(
      'questionId',question.question_id,'questionVersion',question.version,'prompt',question.prompt,
      'stage',question.stage,'panelRole',question.panel_role,'topics',question.topics,'difficulty',question.difficulty));
  end loop;
  return public.session_state(session_id);
end;
$$;

create function public.save_interview_turn(
  p_session_id uuid, p_turn_id uuid, p_expected_version integer,
  p_idempotency_key text, p_state text, p_answer text default null
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  interview public.sessions%rowtype;
  previous public.answers%rowtype;
  current_turn uuid;
  answer_id uuid := gen_random_uuid();
  clean_answer text;
  outcome jsonb;
begin
  if actor is null then raise sqlstate 'PT401' using message = 'AUTH_REQUIRED'; end if;
  if p_expected_version is null or p_expected_version < 1 or p_turn_id is null
    or p_idempotency_key is null or p_idempotency_key !~ '^[A-Za-z0-9_-]{8,128}$'
    or p_state is null or p_state not in ('submitted','skipped') then
    raise sqlstate 'PT400' using message = 'INVALID_ANSWER';
  end if;
  clean_answer := btrim(p_answer, U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF');
  if (p_state = 'submitted' and (clean_answer is null or char_length(clean_answer) not between 1 and 2000))
    or (p_state = 'skipped' and p_answer is not null) then
    raise sqlstate 'PT400' using message = 'INVALID_ANSWER';
  end if;
  -- Serializes all submissions/completion for this owner and session. A waiting
  -- request observes the committed version and previous idempotency outcome.
  select * into interview from public.sessions where id = p_session_id and user_id = actor for update;
  if not found then raise sqlstate 'PT404' using message = 'SESSION_NOT_FOUND'; end if;
  select * into previous from public.answers where session_id = p_session_id and idempotency_key = p_idempotency_key;
  if found then
    if previous.turn_id <> p_turn_id or previous.expected_version <> p_expected_version
      or previous.state <> p_state or previous.answer_text is distinct from clean_answer then
      raise sqlstate 'PT409' using message = 'IDEMPOTENCY_CONFLICT';
    end if;
    return previous.saved_outcome;
  end if;
  if interview.status <> 'active' then raise sqlstate 'PT409' using message = 'SESSION_NOT_ACTIVE'; end if;
  if interview.version <> p_expected_version then raise sqlstate 'PT409' using message = 'SESSION_STALE'; end if;
  select id into current_turn from public.session_turns where session_id = p_session_id and position = interview.current_position;
  if current_turn is distinct from p_turn_id then raise sqlstate 'PT409' using message = 'TURN_NOT_CURRENT'; end if;
  insert into public.answers (id,session_id,turn_id,state,answer_text,idempotency_key,expected_version,saved_outcome)
  values (answer_id,p_session_id,p_turn_id,p_state,clean_answer,p_idempotency_key,p_expected_version,'{}'::jsonb);
  update public.sessions set current_position = current_position + 1, version = version + 1,
    status = case when current_position = 8 then 'ready_to_complete' else 'active' end
  where id = p_session_id;
  outcome := jsonb_build_object('answerId',answer_id,'answerState',p_state,'session',public.session_state(p_session_id));
  update public.answers set saved_outcome = outcome where id = answer_id;
  return outcome;
end;
$$;

create function public.complete_interview_session(p_session_id uuid, p_expected_version integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  interview public.sessions%rowtype;
begin
  if actor is null then raise sqlstate 'PT401' using message = 'AUTH_REQUIRED'; end if;
  if p_expected_version is null or p_expected_version < 1 then raise sqlstate 'PT400' using message = 'INVALID_VERSION'; end if;
  select * into interview from public.sessions where id = p_session_id and user_id = actor for update;
  if not found then raise sqlstate 'PT404' using message = 'SESSION_NOT_FOUND'; end if;
  if interview.status = 'completed' then return public.session_state(p_session_id); end if;
  if interview.version <> p_expected_version then raise sqlstate 'PT409' using message = 'SESSION_STALE'; end if;
  if interview.status <> 'ready_to_complete' or (select count(*) from public.answers where session_id = p_session_id) <> 8 then
    raise sqlstate 'PT409' using message = 'SESSION_INCOMPLETE';
  end if;
  update public.sessions set status = 'completed', completed_at = now(), version = version + 1 where id = p_session_id;
  return public.session_state(p_session_id);
end;
$$;

revoke all on function public.session_state(uuid), public.create_interview_session(uuid[]),
  public.save_interview_turn(uuid,uuid,integer,text,text,text), public.complete_interview_session(uuid,integer)
  from public, anon, authenticated;
grant execute on function public.session_state(uuid), public.create_interview_session(uuid[]),
  public.save_interview_turn(uuid,uuid,integer,text,text,text), public.complete_interview_session(uuid,integer)
  to authenticated;
commit;
