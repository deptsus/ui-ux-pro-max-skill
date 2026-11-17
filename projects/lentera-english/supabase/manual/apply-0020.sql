-- Lentera English: migration 0020 (Rilis 16, Jalur Sekolah SD–SMA)
-- for the Supabase SQL Editor. Same content as supabase/migrations/0020_school_tracks.sql,
-- run in one transaction (all or nothing) and recorded in Database > Migrations.
-- Needs 0019 first. Adds school tracks, their final exams, and the learner's school level;
-- no learner data is changed.
begin;

do $$
begin
  if not exists (select 1 from supabase_migrations.schema_migrations where version = '20271101101900') then
    raise exception 'Jalankan supabase/manual/apply-0019.sql lebih dulu, lalu ulangi berkas ini.';
  end if;
end $$;

-- 0020 (Rilis 16 "Jalur Sekolah SD–SMA"): school tracks, their final exams,
-- and the learner's school level ("jenjang").
--   * chapters.track also accepts sd, smp, sma ('kids' stays valid: it was the
--     SD track's id before Rilis 16, and older curricula still carry it).
--   * exams.scope also accepts 'track' (final exam of a school track; sectioned
--     and graded on the server like a level exam, with a certificate).
--   * profiles.school_level: sd / smp / sma / umum, set by the learner. In the
--     public league and leaderboard, SD learners show as "Pelajar SD" to people
--     who are not their friends, so a child's name is not public.
-- No learner data changes.
alter table chapters drop constraint if exists chapters_track_check;
alter table chapters add constraint chapters_track_check check (track in ('exam', 'work', 'kids', 'sd', 'smp', 'sma'));

alter table exams drop constraint if exists exams_scope_check;
alter table exams add constraint exams_scope_check check (scope in ('unit', 'level', 'placement', 'track'));

alter table profiles add column if not exists school_level text check (school_level in ('sd', 'smp', 'sma', 'umum'));

-- As in 0003, plus school_level (an empty string clears it).
create or replace function update_profile(p_user uuid, p_patch jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  -- Only these fields are user-editable. role is never touched here.
  update profiles set
    display_name = left(coalesce(nullif(btrim(p_patch->>'display_name'), ''), display_name), 40),
    avatar = coalesce((p_patch->>'avatar')::int, avatar),
    daily_goal_xp = coalesce((p_patch->>'daily_goal_xp')::int, daily_goal_xp),
    accent = coalesce(p_patch->>'accent', accent),
    school_level = case when p_patch ? 'school_level' then nullif(p_patch->>'school_level', '') else school_level end
  where id = p_user;
  return (select to_jsonb(p) from profiles p where p.id = p_user);
end $$;

-- How a name appears to someone else: SD learners are "Pelajar SD" unless the viewer is a friend.
create or replace function public_name(p_viewer uuid, p_owner uuid, p_name text, p_level text) returns text
language sql stable security definer set search_path = public as $$
  select case when p_level = 'sd' and p_owner <> p_viewer and not is_friend(p_viewer, p_owner) then 'Pelajar SD' else p_name end
$$;

-- As in 0014, with public_name.
create or replace function get_league(p_user uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare wk date := league_week(now()); me league_members; nd jsonb; mv record; n int; b record;
begin
  perform get_account(p_user);
  select * into b from week_bounds(wk);
  if claim_job('league-fill:' || wk::text, 300) then
    perform league_fill(wk);
  elsif exists (select 1 from xp_transactions where user_id = p_user and occurred_at >= b.starts_at and occurred_at < b.ends_at) then
    perform pg_advisory_xact_lock(hashtext('lentera-league:' || wk::text));
    perform league_place(p_user, wk);
  end if;
  select * into me from league_members where week_start = wk and user_id = p_user;
  if not found then
    nd := league_next_division(p_user, wk);
    return jsonb_build_object('week_start', wk, 'ends_at', b.ends_at, 'joined', false,
      'division', (nd->>'division')::int, 'rules', league_rules());
  end if;
  select count(*) into n from league_members where week_start = wk and division = me.division and cohort = me.cohort;
  select * into mv from league_moves(me.division, n);
  return jsonb_build_object(
    'week_start', wk, 'ends_at', b.ends_at, 'joined', true,
    'division', me.division, 'cohort', me.cohort,
    'outcome', me.outcome, 'prev_division', me.prev_division, 'prev_rank', me.prev_rank,
    'promote', mv.promote, 'demote', mv.demote, 'rules', league_rules(),
    'rows', coalesce((
      select jsonb_agg(jsonb_build_object('rank', s.rank, 'name', public_name(p_user, s.user_id, p.display_name, p.school_level), 'avatar', p.avatar, 'xp', s.xp,
                                          'me', s.user_id = p_user, 'friend', s.user_id <> p_user and is_friend(p_user, s.user_id))
                       order by s.rank)
      from league_standings(wk, me.division, me.cohort) s join profiles p on p.id = s.user_id), '[]'::jsonb));
end $$;

-- As in 0003, with public_name.
create or replace function get_leaderboard(p_user uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  with bounds as (select (date_trunc('week', now() at time zone 'Asia/Jakarta')) at time zone 'Asia/Jakarta' as week_start),
  totals as (
    select x.user_id, sum(x.amount)::int as xp from xp_transactions x, bounds b
    where x.occurred_at >= b.week_start group by x.user_id),
  ranked as (
    select t.user_id, t.xp, public_name(p_user, t.user_id, p.display_name, p.school_level) as display_name, p.avatar, rank() over (order by t.xp desc, t.user_id) as rank
    from totals t join profiles p on p.id = t.user_id)
  select jsonb_build_object(
    'week_start', (select week_start from bounds),
    'top', coalesce((select jsonb_agg(jsonb_build_object('rank', rank, 'name', display_name, 'avatar', avatar, 'xp', xp, 'me', user_id = p_user) order by rank) from ranked where rank <= 30), '[]'::jsonb),
    'me', (select jsonb_build_object('rank', rank, 'xp', xp) from ranked where user_id = p_user));
$$;

create or replace function content_features() returns jsonb
language sql immutable set search_path = public as $$ select '["stories","content_notes","level_exams","homework_reminders","branching_stories","audio_uploads","habits","ops","classes","tracks","exam_timing","interactive","school"]'::jsonb $$;

-- Lock every function down to the service role, as at the end of 0004–0019.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;

insert into supabase_migrations.schema_migrations (version, name)
values ('20271201102000', '0020_school_tracks')
on conflict do nothing;

commit;

-- Hasil yang diharapkan: true
select content_features() ? 'school' as siap;
