-- 0017 (Rilis 12): level-exam time limits are checked on the server. The
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
