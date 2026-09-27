-- Migration: 202609270008_admin_question_bank_and_assignments.sql
-- Grants and RLS policies enabling administrators to:
-- 1. Query draft and published questions in question_versions and publish drafts
-- 2. List completed sessions for evaluator assignment
-- 3. List evaluators and their profiles for assignment
-- 4. Create review assignments in review_assignments

begin;

-- Helper: Security Definer function to check admin role without RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- 1. Question Versions: Admin select and update permissions
grant update (status, reviewed_by, reviewed_at) on public.question_versions to authenticated;

drop policy if exists question_versions_admin_select on public.question_versions;
create policy question_versions_admin_select on public.question_versions for select to authenticated
using (public.is_admin());

drop policy if exists question_versions_admin_update on public.question_versions;
create policy question_versions_admin_update on public.question_versions for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 2. Sessions: Admin select permission for assignment orchestration
drop policy if exists sessions_admin_select on public.sessions;
create policy sessions_admin_select on public.sessions for select to authenticated
using (public.is_admin());

-- 3. User Roles: Admin select permission to list evaluators
drop policy if exists user_roles_admin_select on public.user_roles;
create policy user_roles_admin_select on public.user_roles for select to authenticated
using (public.is_admin());

-- 4. Profiles: Admin select permission to view evaluator names
drop policy if exists profiles_admin_select on public.profiles;
create policy profiles_admin_select on public.profiles for select to authenticated
using (public.is_admin());

-- 5. Review Assignments: Admin select and insert permissions
grant insert on public.review_assignments to authenticated;

drop policy if exists review_assignments_admin_select on public.review_assignments;
create policy review_assignments_admin_select on public.review_assignments for select to authenticated
using (public.is_admin());

drop policy if exists review_assignments_admin_insert on public.review_assignments;
create policy review_assignments_admin_insert on public.review_assignments for insert to authenticated
with check (public.is_admin());

commit;
