-- Run with: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(1);

select ok(
  (select convalidated from pg_catalog.pg_constraint where conname = 'course_progress_course_fk'),
  'progresso só aponta para curso que existe (FK validada pela migration)'
);

select * from finish();
rollback;
