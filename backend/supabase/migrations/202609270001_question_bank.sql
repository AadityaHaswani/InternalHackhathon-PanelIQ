begin;

create table public.interview_roles (
  slug text primary key check (slug ~ '^[a-z][a-z0-9_]+$'),
  domain text not null check (domain = 'computer_science'),
  label text not null,
  active boolean not null default true
);
insert into public.interview_roles (slug, domain, label)
values ('backend_developer', 'computer_science', 'Backend Developer');

create table public.question_versions (
  id uuid primary key default gen_random_uuid(),
  question_id text not null,
  version integer not null check (version > 0),
  prompt text not null check (length(btrim(prompt)) > 0),
  domain text not null check (domain = 'computer_science'),
  experience_level text not null check (experience_level in ('junior', 'intermediate')),
  stage text not null check (stage in ('icebreaker', 'technical', 'techno_managerial', 'reflection')),
  panel_role text not null check (panel_role in ('chair', 'technical', 'project')),
  topics text[] not null check (cardinality(topics) > 0 and topics <@ array['apis','databases','concurrency','reliability','project_tradeoffs']),
  role_slugs text[] not null check (cardinality(role_slugs) > 0 and array_position(role_slugs, null) is null),
  difficulty integer not null check (difficulty between 1 and 3),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  reviewed_follow_up text,
  reviewed_by text,
  reviewed_at timestamptz,
  unique (question_id, version),
  check (status <> 'published' or (nullif(btrim(reviewed_by), '') is not null and reviewed_at is not null)),
  check ((stage in ('icebreaker','reflection') and panel_role = 'chair')
    or (stage = 'technical' and panel_role = 'technical')
    or (stage = 'techno_managerial' and panel_role = 'project'))
);
create table public.question_keys (
  question_version_id uuid primary key references public.question_versions(id),
  expected_concepts text[] not null check (cardinality(expected_concepts) > 0),
  rubric_notes text not null
);

-- Published content is immutable. New wording/keys require a new version.
create function public.protect_question_version() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if old.status <> 'draft' then
    if tg_op = 'DELETE' then raise exception 'Published versions cannot be deleted'; end if;
    if new.status <> 'archived' or (to_jsonb(new) - 'status') <> (to_jsonb(old) - 'status') then
      raise exception 'Published versions are immutable';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
create trigger question_version_immutable before update or delete on public.question_versions
for each row execute function public.protect_question_version();

create function public.protect_question_key() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op <> 'INSERT' and exists (
    select 1 from public.question_versions where id = old.question_version_id and status <> 'draft'
  ) then raise exception 'Published keys are immutable'; end if;
  if tg_op <> 'DELETE' and exists (
    select 1 from public.question_versions where id = new.question_version_id and status <> 'draft'
  ) then raise exception 'Published keys are immutable'; end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
create trigger question_key_immutable before insert or update or delete on public.question_keys
for each row execute function public.protect_question_key();

alter table public.interview_roles enable row level security;
alter table public.question_versions enable row level security;
alter table public.question_keys enable row level security;
revoke all on public.interview_roles, public.question_versions, public.question_keys from public, anon, authenticated;
grant select on public.interview_roles, public.question_versions to authenticated;
create policy roles_read on public.interview_roles for select to authenticated using (active);
create policy questions_read on public.question_versions for select to authenticated using (status = 'published');
-- Private keys have neither client grants nor client policies.
revoke all on function public.protect_question_version(), public.protect_question_key() from public, anon, authenticated;
commit;
