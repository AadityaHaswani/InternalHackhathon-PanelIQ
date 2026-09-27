-- Run once in the intended Supabase demo project's SQL Editor.
-- Deliberately no IF NOT EXISTS: an existing profiles table must be inspected,
-- never silently reused or replaced. The transaction rolls back on conflict.
begin;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  domain text,
  experience_level text,
  target_role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_check check (
    display_name is null or (
      char_length(display_name) between 1 and 80
      -- Match JavaScript trim whitespace, including Unicode whitespace.
      and display_name = btrim(display_name, U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF')
    )
  ),
  constraint profiles_target_role_check check (
    target_role is null or (
      char_length(target_role) between 1 and 120
      and target_role = btrim(target_role, U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF')
    )
  ),
  constraint profiles_domain_check check (domain in ('computer_science')),
  constraint profiles_experience_level_check check (experience_level in ('junior', 'intermediate'))
);

create function public.profiles_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.profiles_set_updated_at() from public, anon, authenticated;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.profiles_set_updated_at();

alter table public.profiles enable row level security;

-- Remove default table grants before granting only the required columns.
revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (user_id, display_name, domain, experience_level, target_role)
  on public.profiles to authenticated;
grant update (display_name, domain, experience_level, target_role)
  on public.profiles to authenticated;

create policy profiles_select_own on public.profiles
for select to authenticated
using ((select auth.uid()) = user_id);

create policy profiles_insert_own on public.profiles
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy profiles_update_own on public.profiles
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- No DELETE grant/policy, no owner UPDATE grant, no timestamp write grants.
commit;
