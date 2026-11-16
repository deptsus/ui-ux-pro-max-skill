-- Lentera English: migration 0016 (Rilis 11 "Jalur Khusus") for the Supabase SQL Editor.
-- Same content as supabase/migrations/0016_tracks.sql, run in one transaction
-- (all or nothing) and recorded in Database > Migrations. Needs 0015 first.
-- Adds one column (chapters.track) so the special tracks (TOEFL ITP/IELTS,
-- work, kids) can be imported and published from /admin. No learner data is
-- changed. Afterwards: /admin → Konten → "Impor materi bawaan", then Terbitkan.
begin;

do $$
begin
  if not (content_features() ? 'classes') then
    raise exception 'Jalankan supabase/manual/apply-0015.sql lebih dulu, lalu ulangi berkas ini.';
  end if;
end $$;

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

insert into supabase_migrations.schema_migrations (version, name)
values ('20270801101600', '0016_tracks')
on conflict do nothing;

commit;
