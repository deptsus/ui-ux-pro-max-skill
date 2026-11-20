-- Lentera English: migration 0022 (Liga Rank: Lilin sampai Mercusuar, sekitar setahun)
-- for the Supabase SQL Editor. Same content as supabase/migrations/0022_rank_league.sql,
-- run in one transaction (all or nothing) and recorded in Database > Migrations.
-- Needs 0021 first. Adds the league_ranks table and replaces get_league / get_leaderboard;
-- XP, streaks and progress are only read, never changed.
begin;

do $$
begin
  if not exists (select 1 from supabase_migrations.schema_migrations where version = '20271201102100') then
    raise exception 'Jalankan supabase/manual/apply-0021.sql lebih dulu, lalu ulangi berkas ini.';
  end if;
end $$;

-- 0022 (Liga Rank, 20 Nov 2026): the weekly league groups become one rank
-- ladder, Lilin -> Pelita -> Obor -> Lentera -> Mercusuar, that takes about a
-- year of steady study to climb (the owner's request).
--   * Rank points ("Poin Rank"): each week (Monday 00.00 to Sunday 23.59 WIB)
--     gives at most 100: up to 70 for XP (full at 250 XP, the weekly mission)
--     and 7.5 per study day up to 30 (full at 4 days, the weekly plan's habit).
--     A week without any XP costs 50. Points never go below 0.
--   * Ranks: Pelita from 500 points, Obor 1.500, Lentera 3.000, Mercusuar 5.000.
--     At the full 100 a week that is 5, 15, 30 and 50 weeks: following the
--     weekly plan, Lilin to Mercusuar takes about a year. Extra XP beyond the
--     weekly 250 does not speed it up.
--   * The current week counts as it goes (gains only, so a rank reached during
--     the week is not lost before Monday). Finished weeks are settled into
--     league_ranks.points: everyone once a week (the first league visit of the
--     week), and each learner whenever they open the league.
--   * Every learner's rank is worked out from their own XP history, so the weeks
--     they already studied count. The weekly groups (league_members and the
--     league_* functions of 0013/0014) stay in the database unchanged but are no
--     longer used by the app.
--   * get_league returns the rank, points, this week's progress, and the players
--     in the same rank (SD learners masked as in 0020); get_leaderboard adds each
--     player's rank.
-- No learner data changes (XP, streaks and progress are only read).
create table if not exists league_ranks (
  user_id uuid primary key references profiles(id) on delete cascade,
  -- Points from every finished week before settled_week.
  points int not null default 0 check (points >= 0),
  settled_week date not null,
  -- The rank last shown to the learner (null until the first visit), for the
  -- "you moved up / down" message.
  division smallint check (division between 1 and 5),
  best_division smallint check (best_division between 1 and 5),
  outcome text not null default 'new' check (outcome in ('new', 'converted', 'promoted', 'demoted')),
  prev_division smallint,
  changed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists league_ranks_settled_idx on league_ranks(settled_week);
alter table league_ranks enable row level security;
revoke all on table league_ranks from anon, authenticated;

create or replace function rank_rules() returns jsonb
language sql immutable set search_path = public as $$
  select '{"thresholds":[0,500,1500,3000,5000],"week_max":100,"xp_full":250,"xp_points":70,"days_full":4,"day_points":7.5,"inactive":-50}'::jsonb
$$;

-- Points for one week from its XP and its number of study days.
create or replace function rank_gain(p_xp int, p_days int) returns int
language sql immutable set search_path = public as $$
  select case when coalesce(p_xp, 0) <= 0 then -50
              else round(least(p_xp, 250) * 70.0 / 250 + least(coalesce(p_days, 0), 4) * 7.5)::int end
$$;

create or replace function rank_division(p_points int) returns int
language sql immutable set search_path = public as $$
  select case when p_points >= 5000 then 5 when p_points >= 3000 then 4 when p_points >= 1500 then 3
              when p_points >= 500 then 2 else 1 end
$$;

-- One learner's XP and study days (WIB calendar days with XP) in a week.
create or replace function rank_week(p_user uuid, p_week date, out xp int, out days int)
language sql stable security definer set search_path = public as $$
  select coalesce(sum(x.amount), 0)::int, count(distinct (x.occurred_at at time zone 'Asia/Jakarta')::date)::int
  from xp_transactions x, week_bounds(p_week) b
  where x.user_id = p_user and x.occurred_at >= b.starts_at and x.occurred_at < b.ends_at;
$$;

-- Adds every finished week since the last settlement to the learner's points.
-- A learner's first row starts at the week of their first XP (or this week),
-- so the history before 0022 counts too.
create or replace function rank_settle(p_user uuid) returns league_ranks
language plpgsql security definer set search_path = public as $$
declare cur date := league_week(now()); r league_ranks; first_week date; last_div smallint; pts int; g record;
begin
  select * into r from league_ranks where user_id = p_user for update;
  if not found then
    select league_week(min(occurred_at)) into first_week from xp_transactions where user_id = p_user;
    select division into last_div from league_members where user_id = p_user order by week_start desc limit 1;
    insert into league_ranks (user_id, settled_week, outcome, prev_division)
    values (p_user, least(coalesce(first_week, cur), cur), case when last_div is null then 'new' else 'converted' end, last_div)
    on conflict (user_id) do nothing;
    select * into r from league_ranks where user_id = p_user for update;
  end if;
  if r.settled_week >= cur then return r; end if;
  pts := r.points;
  for g in
    select coalesce(sum(x.amount), 0)::int as xp,
           count(distinct (x.occurred_at at time zone 'Asia/Jakarta')::date)::int as days
    from generate_series(r.settled_week::timestamp, (cur - 7)::timestamp, interval '7 days') s(w)
    left join xp_transactions x on x.user_id = p_user
      and x.occurred_at >= (s.w at time zone 'Asia/Jakarta')
      and x.occurred_at < ((s.w + interval '7 days') at time zone 'Asia/Jakarta')
    group by s.w order by s.w
  loop
    pts := greatest(0, pts + rank_gain(g.xp, g.days));
  end loop;
  update league_ranks set points = pts, settled_week = cur, updated_at = now() where user_id = p_user returning * into r;
  return r;
end $$;

-- Once a week (the first league visit of the week): settles everyone, so the
-- other players' points are current. Reuses the league-fill: job prefix, which
-- the admin health tab already leaves out of its job list.
create or replace function rank_tick() returns int
language plpgsql security definer set search_path = public as $$
declare wk date := league_week(now()); u record; n int := 0;
begin
  if not claim_job('league-fill:rank-' || wk::text, 8 * 86400) then return 0; end if;
  for u in
    select r.user_id from league_ranks r where r.settled_week < wk
    union
    select p.id from profiles p
    where not exists (select 1 from league_ranks r where r.user_id = p.id)
      and exists (select 1 from xp_transactions x where x.user_id = p.id and x.occurred_at < (select starts_at from week_bounds(wk)))
  loop
    perform rank_settle(u.user_id);
    n := n + 1;
  end loop;
  return n;
end $$;

-- Everyone's points right now: settled points plus this week's gain so far.
create or replace function rank_live(p_week date)
returns table (user_id uuid, points int, division int, week_xp int)
language sql stable security definer set search_path = public as $$
  with wk as (
    select x.user_id, sum(x.amount)::int as xp, count(distinct (x.occurred_at at time zone 'Asia/Jakarta')::date)::int as days
    from xp_transactions x, week_bounds(p_week) b
    where x.occurred_at >= b.starts_at and x.occurred_at < b.ends_at
    group by x.user_id),
  base as (
    select coalesce(r.user_id, wk.user_id) as user_id,
           coalesce(r.points, 0) + case when coalesce(wk.xp, 0) > 0 then rank_gain(wk.xp, wk.days) else 0 end as points,
           coalesce(wk.xp, 0) as xp
    from league_ranks r full join wk on wk.user_id = r.user_id)
  select base.user_id, base.points, rank_division(base.points), base.xp from base;
$$;

-- The learner's rank: points, this week's progress, and the players in the
-- same rank (top 30, plus the learner).
create or replace function get_league(p_user uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare wk date := league_week(now()); b record; r league_ranks; cw record; gain int; pts int; d int;
begin
  perform get_account(p_user);
  perform rank_tick();
  r := rank_settle(p_user);
  select * into b from week_bounds(wk);
  select * into cw from rank_week(p_user, wk);
  gain := case when cw.xp > 0 then rank_gain(cw.xp, cw.days) else 0 end;
  pts := r.points + gain;
  d := rank_division(pts);
  if r.division is null then
    update league_ranks set division = d, best_division = d, updated_at = now() where user_id = p_user returning * into r;
  elsif d <> r.division then
    update league_ranks set outcome = case when d > r.division then 'promoted' else 'demoted' end, prev_division = r.division,
      division = d, best_division = greatest(coalesce(best_division, d), d), changed_at = now(), updated_at = now()
    where user_id = p_user returning * into r;
  end if;
  return (
    with same as (
      select l.user_id, l.points, l.week_xp,
             (row_number() over (order by l.points desc, l.week_xp desc, l.user_id))::int as pos
      from rank_live(wk) l
      where l.division = d and (l.points > 0 or l.user_id = p_user))
    select jsonb_build_object(
      'mode', 'rank', 'week_start', wk, 'ends_at', b.ends_at,
      'division', d, 'points', pts, 'settled', r.points, 'best_division', r.best_division,
      'week_xp', cw.xp, 'week_days', cw.days, 'week_points', gain,
      'outcome', case when r.changed_at > now() - interval '7 days' then r.outcome end,
      'prev_division', r.prev_division,
      'rules', rank_rules(),
      'players', (select count(*) from same),
      'position', (select pos from same where user_id = p_user),
      'rows', coalesce((
        select jsonb_agg(jsonb_build_object('rank', s.pos, 'name', public_name(p_user, s.user_id, p.display_name, p.school_level),
                                            'avatar', p.avatar, 'points', s.points, 'week_xp', s.week_xp, 'me', s.user_id = p_user,
                                            'friend', s.user_id <> p_user and is_friend(p_user, s.user_id))
                         order by s.pos)
        from same s join profiles p on p.id = s.user_id
        where s.pos <= 30 or s.user_id = p_user), '[]'::jsonb)));
end $$;

-- As in 0020, plus each player's rank (division).
create or replace function get_leaderboard(p_user uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare wk date := league_week(now());
begin
  perform rank_tick();
  return (
    with bounds as (select starts_at as week_start from week_bounds(wk)),
    totals as (
      select x.user_id, sum(x.amount)::int as xp from xp_transactions x, bounds b
      where x.occurred_at >= b.week_start group by x.user_id),
    live as (select l.user_id, l.division from rank_live(wk) l),
    ranked as (
      select t.user_id, t.xp, public_name(p_user, t.user_id, p.display_name, p.school_level) as display_name, p.avatar,
             coalesce(lv.division, 1) as division, rank() over (order by t.xp desc, t.user_id) as rank
      from totals t join profiles p on p.id = t.user_id left join live lv on lv.user_id = t.user_id)
    select jsonb_build_object(
      'week_start', (select week_start from bounds),
      'top', coalesce((select jsonb_agg(jsonb_build_object('rank', rank, 'name', display_name, 'avatar', avatar, 'xp', xp,
                                                           'division', division, 'me', user_id = p_user) order by rank)
                       from ranked where rank <= 30), '[]'::jsonb),
      'me', (select jsonb_build_object('rank', rank, 'xp', xp, 'division', division) from ranked where user_id = p_user)));
end $$;

create or replace function content_features() returns jsonb
language sql immutable set search_path = public as $$ select '["stories","content_notes","level_exams","homework_reminders","branching_stories","audio_uploads","habits","ops","classes","tracks","exam_timing","interactive","school","trial","rank"]'::jsonb $$;

-- Lock every function down to the service role, as at the end of 0004–0021.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;

insert into supabase_migrations.schema_migrations (version, name)
values ('20271201102200', '0022_rank_league')
on conflict do nothing;

commit;

-- Hasil yang diharapkan: true
select content_features() ? 'rank' as siap;
