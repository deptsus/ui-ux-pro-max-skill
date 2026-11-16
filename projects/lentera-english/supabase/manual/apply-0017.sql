-- Lentera English: migration 0017 (Rilis 12, batas waktu ujian level di server)
-- for the Supabase SQL Editor. Same content as supabase/migrations/0017_exam_timing.sql,
-- run in one transaction (all or nothing) and recorded in Database > Migrations.
-- Needs 0016 first. Adds one small table and two functions; no learner data is changed.
begin;

do $$
begin
  if not (content_features() ? 'tracks') then
    raise exception 'Jalankan supabase/manual/apply-0016.sql lebih dulu, lalu ulangi berkas ini.';
  end if;
end $$;

-- 0017 (Rilis 12): level-exam time limits are checked on the server, and
-- learners get one reminder before their Premium ends. The
-- first "start" of an attempt is recorded once; a submission later than the
-- time limit plus a short grace period is recorded but cannot pass, so
-- certificates stay trustworthy. No learner data is changed.
create table level_exam_starts (
  user_id uuid not null references profiles(id) on delete cascade,
  exam_id text not null,
  attempt int not null check (attempt >= 0),
  started_at timestamptz not null default now(),
  primary key (user_id, exam_id, attempt)
);
alter table level_exam_starts enable row level security;
revoke all on table level_exam_starts from anon, authenticated;

-- Returns when this attempt was first started (records it on the first call).
create or replace function level_exam_begin(p_user uuid, p_exam text, p_attempt int) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare v timestamptz;
begin
  insert into level_exam_starts (user_id, exam_id, attempt) values (p_user, p_exam, p_attempt) on conflict do nothing;
  select started_at into v from level_exam_starts where user_id = p_user and exam_id = p_exam and attempt = p_attempt;
  return v;
end $$;

-- Premium ending soon (Rilis 12): learners whose latest paid period ends
-- within p_days and who have a device for reminders. Sent once per period.
create or replace function premium_expiry_targets(p_days int) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('user_id', s.user_id, 'subscription_id', s.id, 'expires_at', s.expires_at) order by s.expires_at), '[]'::jsonb)
  from (select distinct on (user_id) id, user_id, expires_at from subscriptions where expires_at > now() order by user_id, expires_at desc) s
  where s.expires_at <= now() + make_interval(days => p_days)
    and exists (select 1 from reminder_subscriptions r where r.user_id = s.user_id);
$$;

create or replace function content_features() returns jsonb
language sql immutable set search_path = public as $$ select '["stories","content_notes","level_exams","homework_reminders","branching_stories","audio_uploads","habits","ops","classes","tracks","exam_timing"]'::jsonb $$;

-- Lock every function down to the service role, as at the end of 0004–0016.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;

insert into supabase_migrations.schema_migrations (version, name)
values ('20270901101700', '0017_exam_timing')
on conflict do nothing;

commit;
