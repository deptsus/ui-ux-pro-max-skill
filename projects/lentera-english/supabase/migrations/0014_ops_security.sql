-- 0014 (Rilis 9, "Aman & Terukur"): security hardening, error monitoring,
-- contact messages, daily backups, owner analytics, account deletion, and the
-- league savings promised in Rilis 8. No existing learner data is changed;
-- payment rows only become able to outlive a deleted account (user_id is
-- cleared instead of blocking the deletion).

-- ───────────────────────── Security advisor fixes ─────────────────────────
alter function public.cms_table(text) set search_path = public;
alter function public.safe_bigint(text) set search_path = public;
alter table friend_code_attempts add column id bigint generated always as identity primary key;

-- ───────────────────────── Rate limits ─────────────────────────
-- Fixed-window counters for public or abuse-prone endpoints. Keys are hashed
-- on the server (no raw IP addresses are stored).
create table rate_limits (
  key text primary key check (char_length(key) <= 120),
  window_start timestamptz not null,
  hits int not null
);
alter table rate_limits enable row level security;
revoke all on table rate_limits from anon, authenticated;

-- True while the caller is within p_max hits per p_window_seconds.
create or replace function hit_rate_limit(p_key text, p_max int, p_window_seconds int) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into rate_limits as t (key, window_start, hits) values (left(p_key, 120), now(), 1)
  on conflict (key) do update set
    hits = case when t.window_start < now() - make_interval(secs => p_window_seconds) then 1 else t.hits + 1 end,
    window_start = case when t.window_start < now() - make_interval(secs => p_window_seconds) then now() else t.window_start end
  returning hits into n;
  return n <= p_max;
end $$;

-- ───────────────────────── Error monitoring ─────────────────────────
-- Errors from browsers and from the server, grouped by fingerprint so a
-- recurring error is one row with a counter.
create table app_errors (
  id bigint generated always as identity primary key,
  fingerprint text not null unique check (char_length(fingerprint) between 8 and 64),
  source text not null check (source in ('client', 'server')),
  message text not null check (char_length(message) <= 500),
  stack text check (char_length(stack) <= 4000),
  path text check (char_length(path) <= 300),
  release text check (char_length(release) <= 40),
  user_agent text check (char_length(user_agent) <= 300),
  count int not null default 1,
  users int not null default 0,
  last_user uuid,
  status text not null default 'open' check (status in ('open', 'resolved')),
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);
create index app_errors_status_idx on app_errors(status, last_seen desc);
alter table app_errors enable row level security;
revoke all on table app_errors from anon, authenticated;

-- Returns { new: true } for an error never seen before (or seen again after it
-- was marked resolved), so the server can alert the owner once.
create or replace function report_error(p_fingerprint text, p_source text, p_message text, p_stack text, p_path text,
                                        p_release text, p_user_agent text, p_user uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e app_errors; was_new boolean := false;
begin
  if coalesce(p_fingerprint, '') !~ '^[a-z0-9]{8,64}$' or p_source not in ('client', 'server') then
    raise exception 'invalid_error' using errcode = '22023';
  end if;
  select * into e from app_errors where fingerprint = p_fingerprint for update;
  if not found then
    insert into app_errors (fingerprint, source, message, stack, path, release, user_agent, last_user, users)
    values (p_fingerprint, p_source, left(coalesce(nullif(p_message, ''), '(tanpa pesan)'), 500), left(p_stack, 4000), left(p_path, 300),
            left(p_release, 40), left(p_user_agent, 300), p_user, case when p_user is null then 0 else 1 end);
    was_new := true;
  else
    update app_errors set count = count + 1, last_seen = now(), path = left(coalesce(p_path, path), 300),
      release = left(coalesce(p_release, release), 40), user_agent = left(coalesce(p_user_agent, user_agent), 300),
      users = users + case when p_user is not null and p_user is distinct from last_user then 1 else 0 end,
      last_user = coalesce(p_user, last_user),
      status = 'open'
    where id = e.id;
    was_new := e.status = 'resolved';
  end if;
  return jsonb_build_object('new', was_new);
end $$;

create or replace function admin_errors(p_actor uuid, p_all boolean) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform assert_admin(p_actor);
  return coalesce((select jsonb_agg(to_jsonb(e) - 'last_user' order by e.status, e.last_seen desc)
    from (select * from app_errors where p_all or status = 'open' order by status, last_seen desc limit 200) e), '[]'::jsonb);
end $$;

create or replace function admin_resolve_error(p_actor uuid, p_id bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform assert_admin(p_actor);
  update app_errors set status = 'resolved' where id = p_id;
  return jsonb_build_object('resolved', found);
end $$;

-- ───────────────────────── Contact messages ─────────────────────────
-- "Hubungi kami": questions, privacy requests and (from Rilis 10) schools.
create table contact_messages (
  id bigint generated always as identity primary key,
  topic text not null check (topic in ('umum', 'privasi', 'sekolah', 'bug')),
  name text not null check (char_length(name) between 1 and 80),
  contact text check (char_length(contact) <= 120),
  message text not null check (char_length(message) between 5 and 3000),
  user_id uuid references profiles(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'done')),
  created_at timestamptz not null default now()
);
create index contact_messages_status_idx on contact_messages(status, created_at desc);
alter table contact_messages enable row level security;
revoke all on table contact_messages from anon, authenticated;

create or replace function submit_contact(p_topic text, p_name text, p_contact text, p_message text, p_user uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare id bigint;
begin
  insert into contact_messages (topic, name, contact, message, user_id)
  values (p_topic, btrim(p_name), nullif(btrim(coalesce(p_contact, '')), ''), btrim(p_message), p_user)
  returning contact_messages.id into id;
  return jsonb_build_object('id', id);
end $$;

create or replace function admin_contact_messages(p_actor uuid, p_all boolean) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform assert_admin(p_actor);
  return coalesce((select jsonb_agg(to_jsonb(m) order by m.status desc, m.created_at desc)
    from (select * from contact_messages where p_all or status = 'open' order by created_at desc limit 200) m), '[]'::jsonb);
end $$;

create or replace function admin_close_contact(p_actor uuid, p_id bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform assert_admin(p_actor);
  update contact_messages set status = 'done' where id = p_id;
  return jsonb_build_object('done', found);
end $$;

-- ───────────────────────── Account deletion ─────────────────────────
-- Payments are financial records and stay, without the person: deleting the
-- account clears user_id and the payer's name and note.
alter table payment_transactions alter column user_id drop not null;
alter table payment_transactions drop constraint payment_transactions_user_id_fkey;
alter table payment_transactions add constraint payment_transactions_user_id_fkey
  foreign key (user_id) references profiles(id) on delete set null;

-- Runs right before the auth account is deleted (which cascades to every
-- learner table). Admin accounts are refused so the owner cannot lock out.
create or replace function prepare_account_deletion(p_user uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform get_account(p_user);
  if (select role from profiles where id = p_user) = 'admin' then raise exception 'admin_account' using errcode = '42501'; end if;
  update payment_transactions set payer_name = null, payer_note = null where user_id = p_user;
  return jsonb_build_object('ready', true);
end $$;

-- ───────────────────────── Backups ─────────────────────────
-- A private storage bucket (Supabase only; the embedded database writes to a
-- local folder). Only the server's secret key can read or write it.
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit)
    values ('backups', 'backups', false, 52428800)
    on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;
  end if;
end $$;

create table backup_runs (
  id bigint generated always as identity primary key,
  name text not null,
  bytes bigint not null,
  rows bigint not null,
  tables int not null,
  ms int not null,
  trigger text not null check (trigger in ('schedule', 'admin')),
  created_at timestamptz not null default now()
);
alter table backup_runs enable row level security;
revoke all on table backup_runs from anon, authenticated;

-- Every public table except caches, counters and secrets (the push key pair is
-- re-created on restore; devices subscribe again).
create or replace function backup_tables() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(table_name order by table_name), '[]'::jsonb)
  from information_schema.tables
  where table_schema = 'public' and table_type = 'BASE TABLE'
    and table_name not in ('rate_limits', 'job_runs', 'push_keys', 'homework_reminders', 'friend_code_attempts', 'app_errors', 'backup_runs');
$$;

-- One page of a table, ordered by its primary key. Only tables backup_tables() lists.
create or replace function backup_rows(p_table text, p_offset int, p_limit int) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare keycols text; out jsonb;
begin
  if not (backup_tables() ? p_table) then raise exception 'invalid_table' using errcode = '22023'; end if;
  select string_agg(format('%I', a.attname), ', ' order by array_position(i.indkey::int[], a.attnum::int))
    into keycols
    from pg_index i join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any(i.indkey)
   where i.indrelid = format('public.%I', p_table)::regclass and i.indisprimary;
  if p_table = 'curriculum_versions' then
    -- Only the published version: older ones are history the CMS can rebuild.
    select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) into out from (select * from curriculum_versions where is_current) t;
    return case when p_offset = 0 then out else '[]'::jsonb end;
  end if;
  execute format('select coalesce(jsonb_agg(to_jsonb(t)), ''[]''::jsonb) from (select * from public.%I order by %s offset $1 limit $2) t',
                 p_table, coalesce(keycols, '1'))
    into out using greatest(p_offset, 0), least(greatest(p_limit, 1), 5000);
  return out;
end $$;

-- Accounts without anything secret: no password hashes or tokens.
create or replace function backup_auth_users(p_offset int, p_limit int) returns jsonb
language sql stable security definer set search_path = public, auth as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', u.id, 'email', u.email, 'created_at', u.created_at,
                                               'name', u.raw_user_meta_data->>'display_name') order by u.created_at, u.id), '[]'::jsonb)
  from (select * from auth.users order by created_at, id offset greatest(p_offset, 0) limit least(greatest(p_limit, 1), 5000)) u;
$$;

create or replace function record_backup(p_name text, p_bytes bigint, p_rows bigint, p_tables int, p_ms int, p_trigger text) returns void
language sql security definer set search_path = public as $$
  insert into backup_runs (name, bytes, rows, tables, ms, trigger) values (p_name, p_bytes, p_rows, p_tables, p_ms, p_trigger);
  delete from backup_runs where created_at < now() - interval '90 days';
  delete from rate_limits where window_start < now() - interval '2 days';
$$;

-- ───────────────────────── Health (admin) ─────────────────────────
create or replace function admin_health(p_actor uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare storage jsonb := '[]'::jsonb;
begin
  perform assert_admin(p_actor);
  if to_regclass('storage.objects') is not null then
    execute $q$select coalesce(jsonb_agg(jsonb_build_object('bucket', bucket_id, 'files', n, 'bytes', b) order by b desc), '[]'::jsonb)
               from (select bucket_id, count(*) as n, coalesce(sum((metadata->>'size')::bigint), 0) as b from storage.objects group by bucket_id) s$q$
      into storage;
  end if;
  return jsonb_build_object(
    'db_bytes', pg_database_size(current_database()),
    'tables', (select coalesce(jsonb_agg(jsonb_build_object('name', relname, 'rows', greatest(reltuples, 0)::bigint, 'bytes', pg_total_relation_size(c.oid)) order by pg_total_relation_size(c.oid) desc), '[]'::jsonb)
               from (select c.* from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r'
                     order by pg_total_relation_size(c.oid) desc limit 10) c),
    'storage', storage,
    'jobs', (select coalesce(jsonb_agg(jsonb_build_object('job', job, 'last_run_at', last_run_at) order by job), '[]'::jsonb) from job_runs
             where job not like 'league-fill:%'),
    'backups', (select coalesce(jsonb_agg(to_jsonb(b) order by b.created_at desc), '[]'::jsonb) from (select * from backup_runs order by created_at desc limit 20) b),
    'errors_open', (select count(*) from app_errors where status = 'open'),
    'messages_open', (select count(*) from contact_messages where status = 'open'),
    'learners', (select count(*) from profiles where role = 'student'),
    'active_30d', (select count(distinct user_id) from xp_transactions where occurred_at > now() - interval '30 days'));
end $$;

-- ───────────────────────── Owner analytics ─────────────────────────
-- Weekly signup cohorts (WIB) through the funnel: signed up → placement test →
-- first lesson → back after a week (any XP 7–13 days after signing up) →
-- bought Premium. Admin accounts are left out. "week1" is null for cohorts
-- younger than 14 days, since they cannot be measured yet.
create or replace function admin_analytics(p_actor uuid, p_weeks int) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare weeks int := least(greatest(coalesce(p_weeks, 12), 1), 52);
begin
  perform assert_admin(p_actor);
  return (
    with learners as (
      select p.id, p.created_at, (date_trunc('week', p.created_at at time zone 'Asia/Jakarta'))::date as cohort,
             p.placement_level is not null as placed,
             exists (select 1 from learning_history h where h.user_id = p.id and h.event_type = 'lesson') as lesson,
             case when p.created_at > now() - interval '14 days' then null
                  else exists (select 1 from xp_transactions x where x.user_id = p.id
                               and x.occurred_at >= p.created_at + interval '7 days' and x.occurred_at < p.created_at + interval '14 days') end as week1,
             exists (select 1 from subscriptions s where s.user_id = p.id) as premium
      from profiles p where p.role = 'student'
    ),
    recent as (select * from learners where cohort >= (date_trunc('week', now() at time zone 'Asia/Jakarta'))::date - (weeks - 1) * 7)
    select jsonb_build_object(
      'funnel', (select jsonb_build_object('signed_up', count(*), 'placement', count(*) filter (where placed),
                   'first_lesson', count(*) filter (where lesson), 'week1_eligible', count(*) filter (where week1 is not null),
                   'week1', count(*) filter (where week1), 'premium', count(*) filter (where premium)) from recent),
      'all_time', (select jsonb_build_object('signed_up', count(*), 'premium', count(*) filter (where premium)) from learners),
      'cohorts', coalesce((select jsonb_agg(jsonb_build_object('week', cohort, 'signed_up', n, 'placement', placed, 'first_lesson', lesson,
                                                               'week1_eligible', eligible, 'week1', week1, 'premium', premium) order by cohort desc)
                           from (select cohort, count(*) as n, count(*) filter (where placed) as placed, count(*) filter (where lesson) as lesson,
                                        count(*) filter (where week1 is not null) as eligible, count(*) filter (where week1) as week1,
                                        count(*) filter (where premium) as premium
                                 from recent group by cohort) c), '[]'::jsonb),
      'active', jsonb_build_object(
        'day', (select count(distinct user_id) from xp_transactions where occurred_at > now() - interval '1 day'),
        'week', (select count(distinct user_id) from xp_transactions where occurred_at > now() - interval '7 days'),
        'month', (select count(distinct user_id) from xp_transactions where occurred_at > now() - interval '30 days')),
      'signups_30d', coalesce((select jsonb_agg(jsonb_build_object('day', d, 'n', n) order by d)
                               from (select (created_at at time zone 'Asia/Jakarta')::date as d, count(*) as n from learners
                                     where created_at > now() - interval '30 days' group by 1) s), '[]'::jsonb),
      'revenue', coalesce((select jsonb_agg(jsonb_build_object('month', m, 'amount', a, 'payments', n) order by m)
                           from (select to_char(date_trunc('month', paid_at at time zone 'Asia/Jakarta'), 'YYYY-MM') as m, sum(amount_idr) as a, count(*) as n
                                 from payment_transactions where status = 'SUCCEEDED' and paid_at > now() - interval '12 months' group by 1) r), '[]'::jsonb)
    )
  );
end $$;

-- ───────────────────────── League savings (from Rilis 8) ─────────────────────────
-- Weekly XP per learner reads this index instead of every XP row the learner
-- ever earned.
create index if not exists xp_transactions_user_time_idx on xp_transactions(user_id, occurred_at);

-- Places one learner in this week's league (no-op if already placed).
create or replace function league_place(p_user uuid, p_week date) returns boolean
language plpgsql security definer set search_path = public as $$
declare nd jsonb; div int; c int;
begin
  if exists (select 1 from league_members where week_start = p_week and user_id = p_user) then return false; end if;
  nd := league_next_division(p_user, p_week);
  div := (nd->>'division')::int;
  select m.cohort into c from league_members m
  where m.week_start = p_week and m.division = div
  group by m.cohort having count(*) < 30 order by m.cohort limit 1;
  if c is null then
    select coalesce(max(m.cohort), 0) + 1 into c from league_members m where m.week_start = p_week and m.division = div;
  end if;
  insert into league_members (week_start, user_id, division, cohort, outcome, prev_division, prev_rank)
  values (p_week, p_user, div, c, nd->>'outcome', (nd->>'prev_division')::smallint, (nd->>'prev_rank')::int)
  on conflict do nothing;
  return true;
end $$;

create or replace function league_fill(p_week date) returns int
language plpgsql security definer set search_path = public as $$
declare u record; n int := 0; b record;
begin
  perform pg_advisory_xact_lock(hashtext('lentera-league:' || p_week::text));
  select * into b from week_bounds(p_week);
  for u in
    select t.user_id from xp_transactions t
    where t.occurred_at >= b.starts_at and t.occurred_at < b.ends_at
      and not exists (select 1 from league_members m where m.week_start = p_week and m.user_id = t.user_id)
    group by t.user_id order by min(t.occurred_at), t.user_id
  loop
    if league_place(u.user_id, p_week) then n := n + 1; end if;
  end loop;
  return n;
end $$;

-- As in 0013, but everyone else is placed at most once every 5 minutes; the
-- learner who opens the page is always placed right away if they earned XP.
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
      select jsonb_agg(jsonb_build_object('rank', s.rank, 'name', p.display_name, 'avatar', p.avatar, 'xp', s.xp,
                                          'me', s.user_id = p_user, 'friend', s.user_id <> p_user and is_friend(p_user, s.user_id))
                       order by s.rank)
      from league_standings(wk, me.division, me.cohort) s join profiles p on p.id = s.user_id), '[]'::jsonb));
end $$;

create or replace function content_features() returns jsonb
language sql immutable set search_path = public as $$ select '["stories","content_notes","level_exams","homework_reminders","branching_stories","audio_uploads","habits","ops"]'::jsonb $$;

-- Lock every function down to the service role, as at the end of 0004–0013.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
