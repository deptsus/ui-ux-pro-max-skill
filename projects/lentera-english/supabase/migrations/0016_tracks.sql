-- 0016 (Rilis 11, "Jalur Khusus"): chapters can belong to a special track
-- (exam = TOEFL ITP/IELTS preparation, work = English for work, kids = for
-- children) instead of the main CEFR path. The CMS import and the published
-- content carry the column like every other chapter column. No learner data
-- is changed.
alter table chapters add column if not exists track text check (track in ('exam', 'work', 'kids'));

create or replace function content_features() returns jsonb
language sql immutable set search_path = public as $$ select '["stories","content_notes","level_exams","homework_reminders","branching_stories","audio_uploads","habits","ops","classes","tracks"]'::jsonb $$;

-- Lock every function down to the service role, as at the end of 0004–0015.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
