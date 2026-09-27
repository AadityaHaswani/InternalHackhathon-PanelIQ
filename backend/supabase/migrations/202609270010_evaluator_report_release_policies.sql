-- Migration: 202609270010_evaluator_report_release_policies.sql
-- Grants and RLS policies enabling evaluators and administrators to:
-- 1. Insert certified released report revisions into report_revisions
-- 2. Insert and update rubric evaluations into evaluations

begin;

-- 1. Report Revisions: Insert permissions for assigned evaluator or admin
grant insert on public.report_revisions to authenticated;

drop policy if exists report_revisions_insert on public.report_revisions;
create policy report_revisions_insert on public.report_revisions for insert to authenticated
with check (
  public.is_admin() or exists (
    select 1 from public.review_assignments ra
    where ra.session_id = session_id and ra.evaluator_id = (select auth.uid())
  )
);

-- 2. Evaluations: Insert and update permissions for assigned evaluator or admin
grant insert, update on public.evaluations to authenticated;

drop policy if exists evaluations_insert on public.evaluations;
create policy evaluations_insert on public.evaluations for insert to authenticated
with check (
  public.is_admin() or exists (
    select 1 from public.review_assignments ra
    where ra.session_id = session_id and ra.evaluator_id = (select auth.uid())
  )
);

drop policy if exists evaluations_update on public.evaluations;
create policy evaluations_update on public.evaluations for update to authenticated
using (
  public.is_admin() or exists (
    select 1 from public.review_assignments ra
    where ra.session_id = session_id and ra.evaluator_id = (select auth.uid())
  )
)
with check (
  public.is_admin() or exists (
    select 1 from public.review_assignments ra
    where ra.session_id = session_id and ra.evaluator_id = (select auth.uid())
  )
);

commit;
