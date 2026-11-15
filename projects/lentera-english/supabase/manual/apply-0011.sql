-- Lentera English: migration 0011 (Rilis 5) for the Supabase SQL Editor.
-- Same content as supabase/migrations/0011_branching_stories.sql, run in one
-- transaction (all or nothing) and recorded in Database > Migrations.
-- Run this BEFORE "Impor ulang paket bawaan": the import needs the stories.branch column.
-- It only adds one column; no existing data is changed.
begin;

-- 0011 (Rilis 5): branching stories. After the opening scenes, the learner
-- speaks as one character and each choice leads to a different node, until an
-- ending. The whole branch travels with the story row; the CMS edits it as JSON.
alter table stories add column if not exists branch jsonb
  check (branch is null or jsonb_typeof(branch) = 'object');

create or replace function content_features() returns jsonb
language sql immutable as $$ select '["stories","content_notes","level_exams","homework_reminders","branching_stories"]'::jsonb $$;

-- Lock every function down to the service role, as at the end of 0004–0010.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;

insert into supabase_migrations.schema_migrations (version, name)
values ('20270301101100', '0011_branching_stories')
on conflict do nothing;

commit;
