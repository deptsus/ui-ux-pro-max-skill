-- 0013 (Rilis 8, "Kebiasaan Belajar"): a daily study reminder at the hour each
-- learner picks, weekly leagues with five divisions, friends added by invite
-- code, and XP challenges between friends. Shadowing practice needs nothing
-- here: recordings stay on the learner's device and its XP arrives through
-- sync_learner like any other XP. No existing data is changed.

-- ───────────────────────── Reminder preferences ─────────────────────────
-- One row per learner who changed a reminder setting. Devices stay in
-- reminder_subscriptions (0010); these settings decide what is sent to them.
create table reminder_prefs (
  user_id uuid primary key references profiles(id) on delete cascade,
  -- Hour (local to time_zone) for the daily study reminder; null = off.
  daily_hour smallint check (daily_hour between 5 and 22),
  time_zone text not null default 'Asia/Jakarta' check (char_length(time_zone) between 3 and 64),
  -- PR deadline reminders (0010), on unless the learner turns them off.
  homework boolean not null default true,
  -- Local date of the last daily reminder, so there is at most one a day.
  last_daily_on date,
  updated_at timestamptz not null default now()
);
alter table reminder_prefs enable row level security;
revoke all on table reminder_prefs from anon, authenticated;

-- A time zone name the database knows, else Jakarta (WIB).
create or replace function valid_time_zone(p text) returns text
language sql stable set search_path = public as $$
  select coalesce((select name from pg_timezone_names where name = p limit 1), 'Asia/Jakarta');
$$;

create or replace function get_reminder_prefs(p_user uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'daily_hour', p.daily_hour,
    'time_zone', coalesce(p.time_zone, 'Asia/Jakarta'),
    'homework', coalesce(p.homework, true),
    'devices', (select count(*) from reminder_subscriptions r where r.user_id = p_user))
  from (select 1) one left join reminder_prefs p on p.user_id = p_user;
$$;

-- p_patch: any of { daily_hour: 5..22 | null, time_zone: text, homework: boolean }.
create or replace function set_reminder_prefs(p_user uuid, p_patch jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare h int;
begin
  perform get_account(p_user);
  if jsonb_typeof(p_patch) is distinct from 'object' then raise exception 'invalid_patch' using errcode = '22023'; end if;
  insert into reminder_prefs (user_id) values (p_user) on conflict (user_id) do nothing;
  if p_patch ? 'daily_hour' then
    if jsonb_typeof(p_patch->'daily_hour') = 'null' then
      h := null;
    elsif jsonb_typeof(p_patch->'daily_hour') = 'number' and (p_patch->>'daily_hour') ~ '^[0-9]{1,2}$'
          and (p_patch->>'daily_hour')::int between 5 and 22 then
      h := (p_patch->>'daily_hour')::int;
    else
      raise exception 'invalid_hour' using errcode = '22023';
    end if;
    update reminder_prefs set daily_hour = h, updated_at = now() where user_id = p_user;
  end if;
  if p_patch ? 'time_zone' then
    update reminder_prefs set time_zone = valid_time_zone(left(p_patch->>'time_zone', 64)), updated_at = now() where user_id = p_user;
  end if;
  if p_patch ? 'homework' then
    if jsonb_typeof(p_patch->'homework') <> 'boolean' then raise exception 'invalid_patch' using errcode = '22023'; end if;
    update reminder_prefs set homework = (p_patch->>'homework')::boolean, updated_at = now() where user_id = p_user;
  end if;
  return get_reminder_prefs(p_user);
end $$;

-- Learners whose chosen hour has come in their own time zone (up to two hours
-- late, in case a scheduled run was missed), who have not studied today, were
-- not reminded today, and have at least one reminder device. "Studied" is the
-- streak date the app syncs (streaks.last_active_date, a date on the device).
create or replace function daily_reminder_targets(p_now timestamptz) returns jsonb
language sql stable security definer set search_path = public as $$
  with t as (
    select p.user_id, p.daily_hour, p.last_daily_on, (p_now at time zone p.time_zone) as local_ts
    from reminder_prefs p
    where p.daily_hour is not null
      and exists (select 1 from reminder_subscriptions r where r.user_id = p.user_id)
  ),
  due as (
    select t.user_id, t.local_ts::date as local_day,
           coalesce(s.current_streak, 0) as current_streak, s.last_active_date, coalesce(s.freezes, 0) as freezes
    from t left join streaks s on s.user_id = t.user_id
    where extract(hour from t.local_ts) between t.daily_hour and t.daily_hour + 2
      and t.last_daily_on is distinct from t.local_ts::date
      and s.last_active_date is distinct from t.local_ts::date
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id', d.user_id,
    'local_day', d.local_day,
    -- The streak that is still alive and would grow by studying today.
    'streak', case when d.last_active_date = d.local_day - 1 then d.current_streak
                   when d.last_active_date = d.local_day - 2 and d.freezes > 0 then d.current_streak
                   else 0 end,
    -- Yesterday was missed: studying today spends a streak freeze to save it.
    'freeze', coalesce(d.last_active_date = d.local_day - 2 and d.freezes > 0 and d.current_streak > 0, false),
    'subs', reminder_targets_for(d.user_id)) order by d.user_id), '[]'::jsonb)
  from due d;
$$;

create or replace function record_daily_reminder(p_user uuid, p_day date) returns void
language sql security definer set search_path = public as $$
  update reminder_prefs set last_daily_on = p_day where user_id = p_user;
$$;

-- Same as 0010, minus learners who turned PR reminders off.
create or replace function homework_reminder_targets(p_now_ms bigint, p_window_ms bigint) returns jsonb
language sql stable security definer set search_path = public as $$
  with open_hw as (
    select s.user_id, h.key as homework_id, safe_bigint(h.value->>'dueAt') as due_ms, left(h.value->>'title', 80) as title
    from learner_snapshots s
    cross join lateral jsonb_each(case when jsonb_typeof(s.state->'homework') = 'object' then s.state->'homework' else '{}'::jsonb end) h
    where exists (select 1 from reminder_subscriptions r where r.user_id = s.user_id)
      and not exists (select 1 from reminder_prefs p where p.user_id = s.user_id and not p.homework)
      and jsonb_typeof(h.value) = 'object'
      and coalesce(jsonb_array_length(case when jsonb_typeof(h.value->'submissions') = 'array' then h.value->'submissions' else '[]'::jsonb end), 0) = 0
      and safe_bigint(h.value->>'dueAt') > p_now_ms
      and safe_bigint(h.value->>'dueAt') <= p_now_ms + p_window_ms
      and not exists (select 1 from homework_reminders x where x.user_id = s.user_id and x.homework_id = h.key and x.kind = 'due-soon')
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id', u.user_id,
    'items', u.items,
    'subs', reminder_targets_for(u.user_id)) order by u.user_id), '[]'::jsonb)
  from (
    select user_id, jsonb_agg(jsonb_build_object('id', homework_id, 'title', title, 'due_ms', due_ms) order by due_ms) as items
    from open_hw group by user_id
  ) u;
$$;

-- ───────────────────────── XP helpers ─────────────────────────
-- Weeks run Monday 00.00 to Sunday 23.59 WIB, like the weekly leaderboard.
create or replace function league_week(p_now timestamptz) returns date
language sql stable set search_path = public as $$ select (date_trunc('week', p_now at time zone 'Asia/Jakarta'))::date $$;

create or replace function week_bounds(p_week date, out starts_at timestamptz, out ends_at timestamptz)
language sql stable set search_path = public as $$
  select (p_week::timestamp at time zone 'Asia/Jakarta'), ((p_week + 7)::timestamp at time zone 'Asia/Jakarta');
$$;

create or replace function xp_between(p_user uuid, p_from timestamptz, p_to timestamptz) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum(amount), 0)::int from xp_transactions
  where user_id = p_user and occurred_at >= p_from and occurred_at < p_to;
$$;

create or replace function week_xp(p_user uuid, p_week date) returns int
language sql stable security definer set search_path = public as $$
  select xp_between(p_user, b.starts_at, b.ends_at) from week_bounds(p_week) b;
$$;

-- The streak as the app shows it (still alive if the learner studied today or
-- yesterday, or the day before with a freeze left), by the WIB calendar.
create or replace function live_streak(p_user uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce((
    select case
      when s.last_active_date >= (now() at time zone 'Asia/Jakarta')::date - 1 then s.current_streak
      when s.last_active_date = (now() at time zone 'Asia/Jakarta')::date - 2 and s.freezes > 0 then s.current_streak
      else 0 end
    from streaks s where s.user_id = p_user), 0);
$$;

-- ───────────────────────── Weekly leagues ─────────────────────────
-- Five divisions (1 Lilin … 5 Mercusuar, named in the app). Every learner who
-- earns XP in a week is placed in a group of up to 30 in their division. When
-- the week ends, the top 20% (rounded down, at least one, with 50 XP or more)
-- move up and, in groups of five or more, the bottom 20% move down. Missing a
-- whole week costs one division. Placement happens lazily, the first time
-- anyone opens a league page in the new week, so no scheduled job is needed.
create table league_members (
  week_start date not null,
  user_id uuid not null references profiles(id) on delete cascade,
  division smallint not null check (division between 1 and 5),
  cohort int not null check (cohort >= 1),
  -- How the learner got here, for the "you moved up" message.
  outcome text not null default 'new' check (outcome in ('new', 'promoted', 'stayed', 'demoted', 'inactive')),
  prev_division smallint,
  prev_rank int,
  joined_at timestamptz not null default now(),
  primary key (week_start, user_id)
);
create index league_members_cohort_idx on league_members(week_start, division, cohort);
create index league_members_user_idx on league_members(user_id, week_start desc);
alter table league_members enable row level security;
revoke all on table league_members from anon, authenticated;

create or replace function league_rules() returns jsonb
language sql immutable set search_path = public as $$
  select '{"divisions":5,"group_size":30,"move_share":0.2,"promote_min_xp":50,"demote_min_size":5}'::jsonb
$$;

-- Final (or current) standings of one group.
create or replace function league_standings(p_week date, p_division int, p_cohort int)
returns table (user_id uuid, xp int, rank int, size int)
language sql stable security definer set search_path = public as $$
  with m as (
    select lm.user_id, lm.joined_at, week_xp(lm.user_id, p_week) as xp
    from league_members lm
    where lm.week_start = p_week and lm.division = p_division and lm.cohort = p_cohort)
  select m.user_id, m.xp,
         (row_number() over (order by m.xp desc, m.joined_at, m.user_id))::int,
         (count(*) over ())::int
  from m;
$$;

-- How many move up / down from a group of p_size in division p_division.
create or replace function league_moves(p_division int, p_size int, out promote int, out demote int)
language sql immutable set search_path = public as $$
  select case when p_division < 5 then greatest(1, floor(p_size * 0.2)::int) else 0 end,
         case when p_division > 1 and p_size >= 5 then floor(p_size * 0.2)::int else 0 end;
$$;

-- The division a learner starts week p_week in, from their last league week.
create or replace function league_next_division(p_user uuid, p_week date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare prev league_members; st record; mv record;
begin
  select * into prev from league_members where user_id = p_user and week_start < p_week order by week_start desc limit 1;
  if not found then return jsonb_build_object('division', 1, 'outcome', 'new'); end if;
  if prev.week_start < p_week - 7 then
    return jsonb_build_object('division', greatest(1, prev.division - 1), 'prev_division', prev.division, 'outcome', 'inactive');
  end if;
  select * into st from league_standings(prev.week_start, prev.division, prev.cohort) s where s.user_id = p_user;
  select * into mv from league_moves(prev.division, st.size);
  if st.rank <= mv.promote and st.xp >= 50 then
    return jsonb_build_object('division', prev.division + 1, 'prev_division', prev.division, 'prev_rank', st.rank, 'outcome', 'promoted');
  elsif st.rank > st.size - mv.demote then
    return jsonb_build_object('division', prev.division - 1, 'prev_division', prev.division, 'prev_rank', st.rank, 'outcome', 'demoted');
  end if;
  return jsonb_build_object('division', prev.division, 'prev_division', prev.division, 'prev_rank', st.rank, 'outcome', 'stayed');
end $$;

-- Places everyone who earned XP this week and has no group yet, in the order
-- they earned their first XP. Serialised per week, so groups never overfill.
create or replace function league_fill(p_week date) returns int
language plpgsql security definer set search_path = public as $$
declare u record; nd jsonb; div int; c int; n int := 0; b record;
begin
  perform pg_advisory_xact_lock(hashtext('lentera-league:' || p_week::text));
  select * into b from week_bounds(p_week);
  for u in
    select t.user_id
    from xp_transactions t
    where t.occurred_at >= b.starts_at and t.occurred_at < b.ends_at
      and not exists (select 1 from league_members m where m.week_start = p_week and m.user_id = t.user_id)
    group by t.user_id
    order by min(t.occurred_at), t.user_id
  loop
    nd := league_next_division(u.user_id, p_week);
    div := (nd->>'division')::int;
    select m.cohort into c from league_members m
    where m.week_start = p_week and m.division = div
    group by m.cohort having count(*) < 30 order by m.cohort limit 1;
    if c is null then
      select coalesce(max(m.cohort), 0) + 1 into c from league_members m where m.week_start = p_week and m.division = div;
    end if;
    insert into league_members (week_start, user_id, division, cohort, outcome, prev_division, prev_rank)
    values (p_week, u.user_id, div, c, nd->>'outcome', (nd->>'prev_division')::smallint, (nd->>'prev_rank')::int)
    on conflict do nothing;
    n := n + 1;
  end loop;
  return n;
end $$;

-- The learner's league this week: their group's standings, or, before their
-- first XP of the week, the division they will start in.
create or replace function get_league(p_user uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare wk date := league_week(now()); me league_members; nd jsonb; mv record; n int; b record;
begin
  perform get_account(p_user);
  perform league_fill(wk);
  select * into b from week_bounds(wk);
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
      select jsonb_agg(jsonb_build_object('rank', s.rank, 'name', p.display_name, 'avatar', p.avatar, 'xp', s.xp,
                                          'me', s.user_id = p_user, 'friend', s.user_id <> p_user and is_friend(p_user, s.user_id))
                       order by s.rank)
      from league_standings(wk, me.division, me.cohort) s join profiles p on p.id = s.user_id), '[]'::jsonb));
end $$;

-- ───────────────────────── Friends ─────────────────────────
-- Each learner has a six-character invite code (no 0/O or 1/I to misread).
-- Friendship is mutual and created when one side enters the other's code.
create table friend_codes (
  user_id uuid primary key references profiles(id) on delete cascade,
  code text not null unique check (code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  created_at timestamptz not null default now()
);
create table friendships (
  user_a uuid not null references profiles(id) on delete cascade,
  user_b uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)
);
create index friendships_b_idx on friendships(user_b);
-- Wrong codes entered, to stop guessing (20 per hour).
create table friend_code_attempts (
  user_id uuid not null references profiles(id) on delete cascade,
  at timestamptz not null default now()
);
create index friend_code_attempts_idx on friend_code_attempts(user_id, at);
alter table friend_codes enable row level security;
alter table friendships enable row level security;
alter table friend_code_attempts enable row level security;
revoke all on table friend_codes, friendships, friend_code_attempts from anon, authenticated;

create or replace function is_friend(p_a uuid, p_b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from friendships where user_a = least(p_a, p_b) and user_b = greatest(p_a, p_b));
$$;

create or replace function friend_code(p_user uuid) returns text
language plpgsql security definer set search_path = public as $$
declare c text; alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; i int;
begin
  select code into c from friend_codes where user_id = p_user;
  if c is not null then return c; end if;
  loop
    c := '';
    for i in 1..6 loop c := c || substr(alphabet, 1 + floor(random() * 32)::int, 1); end loop;
    begin
      insert into friend_codes (user_id, code) values (p_user, c);
      return c;
    exception when unique_violation then
      select code into c from friend_codes where user_id = p_user;
      if c is not null then return c; end if;
    end;
  end loop;
end $$;

create or replace function friend_count(p_user uuid) returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from friendships where user_a = p_user or user_b = p_user;
$$;

-- Returns { added, name } or { error: code_not_found | own_code | friend_limit | too_many_attempts }.
-- Errors are returned, not raised, so a wrong code is still counted.
create or replace function add_friend(p_user uuid, p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare other uuid; v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  perform get_account(p_user);
  delete from friend_code_attempts where user_id = p_user and at < now() - interval '1 hour';
  if (select count(*) from friend_code_attempts where user_id = p_user) >= 20 then
    return jsonb_build_object('error', 'too_many_attempts');
  end if;
  select user_id into other from friend_codes where code = v_code;
  if other is null then
    insert into friend_code_attempts (user_id) values (p_user);
    return jsonb_build_object('error', 'code_not_found');
  end if;
  if other = p_user then return jsonb_build_object('error', 'own_code'); end if;
  if is_friend(p_user, other) then
    return jsonb_build_object('added', false, 'already', true, 'name', (select display_name from profiles where id = other));
  end if;
  if friend_count(p_user) >= 50 or friend_count(other) >= 50 then return jsonb_build_object('error', 'friend_limit'); end if;
  insert into friendships (user_a, user_b) values (least(p_user, other), greatest(p_user, other)) on conflict do nothing;
  return jsonb_build_object('added', true, 'name', (select display_name from profiles where id = other), 'friend_id', other);
end $$;

create or replace function remove_friend(p_user uuid, p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare other uuid;
begin
  perform get_account(p_user);
  select user_id into other from friend_codes where code = upper(coalesce(p_code, ''));
  if other is null or not is_friend(p_user, other) then return jsonb_build_object('removed', false); end if;
  delete from friendships where user_a = least(p_user, other) and user_b = greatest(p_user, other);
  update friend_challenges set status = 'cancelled'
  where status in ('pending', 'active') and ((challenger = p_user and opponent = other) or (challenger = other and opponent = p_user));
  return jsonb_build_object('removed', true);
end $$;

-- ───────────────────────── Friend challenges ─────────────────────────
-- "Who earns more XP in 3 or 7 days". An invitation waits 3 days for an
-- answer; the duel starts when it is accepted. Scores are server XP, so only
-- real learning counts.
create table friend_challenges (
  id bigint generated always as identity primary key,
  challenger uuid not null references profiles(id) on delete cascade,
  opponent uuid not null references profiles(id) on delete cascade,
  days smallint not null check (days in (3, 7)),
  status text not null default 'pending' check (status in ('pending', 'active', 'finished', 'declined', 'cancelled', 'expired')),
  created_at timestamptz not null default now(),
  starts_at timestamptz,
  ends_at timestamptz,
  challenger_xp int,
  opponent_xp int,
  check (challenger <> opponent)
);
create index friend_challenges_challenger_idx on friend_challenges(challenger, created_at desc);
create index friend_challenges_opponent_idx on friend_challenges(opponent, created_at desc);
alter table friend_challenges enable row level security;
revoke all on table friend_challenges from anon, authenticated;

-- Closes this learner's challenges whose time is up (final scores are frozen).
create or replace function settle_challenges(p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update friend_challenges set status = 'expired'
  where status = 'pending' and created_at < now() - interval '3 days' and p_user in (challenger, opponent);
  update friend_challenges set status = 'finished',
    challenger_xp = xp_between(challenger, starts_at, ends_at),
    opponent_xp = xp_between(opponent, starts_at, ends_at)
  where status = 'active' and ends_at <= now() and p_user in (challenger, opponent);
end $$;

-- Returns { id, days, opponent_id, name, from_name } or { error: not_friend | invalid_days | too_many | already_open }.
create or replace function create_challenge(p_user uuid, p_code text, p_days int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare other uuid; c bigint;
begin
  perform get_account(p_user);
  perform settle_challenges(p_user);
  if p_days is null or p_days not in (3, 7) then return jsonb_build_object('error', 'invalid_days'); end if;
  select user_id into other from friend_codes where code = upper(coalesce(p_code, ''));
  if other is null or not is_friend(p_user, other) then return jsonb_build_object('error', 'not_friend'); end if;
  if exists (select 1 from friend_challenges where status in ('pending', 'active')
             and ((challenger = p_user and opponent = other) or (challenger = other and opponent = p_user))) then
    return jsonb_build_object('error', 'already_open');
  end if;
  if (select count(*) from friend_challenges where status in ('pending', 'active') and p_user in (challenger, opponent)) >= 3 then
    return jsonb_build_object('error', 'too_many');
  end if;
  insert into friend_challenges (challenger, opponent, days) values (p_user, other, p_days) returning id into c;
  return jsonb_build_object('id', c, 'days', p_days, 'opponent_id', other, 'name', (select display_name from profiles where id = other),
                            'from_name', (select display_name from profiles where id = p_user));
end $$;

-- The invited friend accepts (the clock starts now) or declines.
create or replace function respond_challenge(p_user uuid, p_id bigint, p_accept boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare ch friend_challenges;
begin
  perform get_account(p_user);
  perform settle_challenges(p_user);
  select * into ch from friend_challenges where id = p_id and opponent = p_user and status = 'pending';
  if not found then return jsonb_build_object('error', 'not_pending'); end if;
  if p_accept then
    if (select count(*) from friend_challenges where status = 'active' and p_user in (challenger, opponent)) >= 3 then
      return jsonb_build_object('error', 'too_many');
    end if;
    update friend_challenges set status = 'active', starts_at = now(), ends_at = now() + make_interval(days => days) where id = p_id;
  else
    update friend_challenges set status = 'declined' where id = p_id;
  end if;
  return jsonb_build_object('status', case when p_accept then 'active' else 'declined' end, 'challenger_id', ch.challenger,
                            'days', ch.days, 'name', (select display_name from profiles where id = p_user));
end $$;

create or replace function cancel_challenge(p_user uuid, p_id bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  update friend_challenges set status = 'cancelled' where id = p_id and challenger = p_user and status = 'pending';
  return jsonb_build_object('cancelled', found);
end $$;

-- Friends (with this week's XP and streak), invite code and challenges.
create or replace function get_social(p_user uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare wk date := league_week(now()); my_code text;
begin
  perform get_account(p_user);
  perform settle_challenges(p_user);
  my_code := friend_code(p_user);
  return jsonb_build_object(
    'code', my_code,
    'week_start', wk,
    'friends', coalesce((
      select jsonb_agg(x order by x.xp desc, x.me desc, x.name) from (
        select f.id = p_user as me, p.display_name as name, p.avatar,
               case when f.id = p_user then null else friend_code(f.id) end as code,
               week_xp(f.id, wk) as xp, live_streak(f.id) as streak
        from (select p_user as id
              union select case when user_a = p_user then user_b else user_a end from friendships where p_user in (user_a, user_b)) f
        join profiles p on p.id = f.id) x), '[]'::jsonb),
    'challenges', coalesce((
      select jsonb_agg(x order by x.open desc, x.created_at desc) from (
        select c.id, c.days, c.status, c.challenger = p_user as mine, c.created_at, c.starts_at, c.ends_at,
               c.status in ('pending', 'active') as open,
               c.created_at + interval '3 days' as expires_at,
               o.display_name as name, o.avatar, friend_code(o.id) as code,
               case when c.status = 'finished' then case when c.challenger = p_user then c.challenger_xp else c.opponent_xp end
                    when c.status = 'active' then xp_between(p_user, c.starts_at, least(now(), c.ends_at)) end as my_xp,
               case when c.status = 'finished' then case when c.challenger = p_user then c.opponent_xp else c.challenger_xp end
                    when c.status = 'active' then xp_between(o.id, c.starts_at, least(now(), c.ends_at)) end as their_xp
        from friend_challenges c
        join profiles o on o.id = case when c.challenger = p_user then c.opponent else c.challenger end
        where p_user in (c.challenger, c.opponent)
          and (c.status in ('pending', 'active') or c.created_at > now() - interval '30 days')
        order by c.created_at desc limit 20) x), '[]'::jsonb),
    'record', (
      select jsonb_build_object(
        'won', count(*) filter (where (challenger = p_user and challenger_xp > opponent_xp) or (opponent = p_user and opponent_xp > challenger_xp)),
        'lost', count(*) filter (where (challenger = p_user and challenger_xp < opponent_xp) or (opponent = p_user and opponent_xp < challenger_xp)),
        'draw', count(*) filter (where challenger_xp = opponent_xp))
      from friend_challenges where status = 'finished' and p_user in (challenger, opponent)));
end $$;

create or replace function content_features() returns jsonb
language sql immutable set search_path = public as $$ select '["stories","content_notes","level_exams","homework_reminders","branching_stories","audio_uploads","habits"]'::jsonb $$;

-- Lock every function down to the service role, as at the end of 0004–0012.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
