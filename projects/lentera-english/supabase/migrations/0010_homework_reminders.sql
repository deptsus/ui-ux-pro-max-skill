-- 0010 (Rilis 4): homework reminders on learners' phones, and a homework
-- summary for the owner. Homework itself still lives in each learner's synced
-- progress (learner_snapshots.state -> homework) and in learning_history.

-- ───────────────────────── Reminder subscriptions ─────────────────────────
-- Any signed-in learner may register a device for PR reminders. Kept apart from
-- push_subscriptions (admins' payment alerts), so neither list affects the other.
create table reminder_subscriptions (
  endpoint text primary key check (endpoint ~ '^https://'),
  user_id uuid not null references profiles(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_success_at timestamptz,
  failures int not null default 0
);
create index reminder_subscriptions_user_idx on reminder_subscriptions(user_id);

-- One row per reminder sent, so a PR is never reminded twice.
create table homework_reminders (
  user_id uuid not null references profiles(id) on delete cascade,
  homework_id text not null,
  kind text not null default 'due-soon' check (kind in ('due-soon')),
  sent_at timestamptz not null default now(),
  primary key (user_id, homework_id, kind)
);

-- Scheduled jobs claim a run here, so calling the job endpoint more often than
-- planned (or from several places) does no extra work.
create table job_runs (
  job text primary key,
  last_run_at timestamptz not null
);

alter table reminder_subscriptions enable row level security;
alter table homework_reminders enable row level security;
alter table job_runs enable row level security;
revoke all on table reminder_subscriptions, homework_reminders, job_runs from anon, authenticated;

create or replace function save_reminder_subscription(p_user uuid, p_endpoint text, p_p256dh text, p_auth text, p_user_agent text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform get_account(p_user);
  if coalesce(p_endpoint, '') !~ '^https://' or length(p_endpoint) > 2000
     or coalesce(p_p256dh, '') !~ '^[A-Za-z0-9_=-]{40,200}$' or coalesce(p_auth, '') !~ '^[A-Za-z0-9_=-]{8,64}$' then
    raise exception 'invalid_subscription';
  end if;
  insert into reminder_subscriptions (endpoint, user_id, p256dh, auth, user_agent)
  values (p_endpoint, p_user, p_p256dh, p_auth, left(p_user_agent, 300))
  on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth,
    user_agent = excluded.user_agent, failures = 0;
  -- At most 5 devices per learner: the oldest goes first.
  delete from reminder_subscriptions where endpoint in (
    select endpoint from reminder_subscriptions where user_id = p_user order by created_at desc offset 5);
  return jsonb_build_object('saved', true, 'devices', (select count(*) from reminder_subscriptions where user_id = p_user));
end $$;

create or replace function delete_reminder_subscription(p_user uuid, p_endpoint text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  delete from reminder_subscriptions where endpoint = p_endpoint and user_id = p_user;
  return jsonb_build_object('devices', (select count(*) from reminder_subscriptions where user_id = p_user));
end $$;

create or replace function reminder_targets_for(p_user uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('endpoint', endpoint, 'p256dh', p256dh, 'auth', auth)), '[]'::jsonb)
  from reminder_subscriptions where user_id = p_user;
$$;

create or replace function record_reminder_push_result(p_endpoint text, p_ok boolean, p_gone boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_gone then
    delete from reminder_subscriptions where endpoint = p_endpoint;
  elsif p_ok then
    update reminder_subscriptions set last_success_at = now(), failures = 0 where endpoint = p_endpoint;
  else
    update reminder_subscriptions set failures = failures + 1 where endpoint = p_endpoint;
    delete from reminder_subscriptions where endpoint = p_endpoint and failures >= 10;
  end if;
end $$;

-- True if this caller may run the job now (and records the run); false if it ran
-- less than p_min_seconds ago.
create or replace function claim_job(p_job text, p_min_seconds int) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into job_runs (job, last_run_at) values (p_job, now())
  on conflict (job) do update set last_run_at = now()
  where job_runs.last_run_at < now() - make_interval(secs => greatest(p_min_seconds, 0));
  get diagnostics n = row_count;
  return n > 0;
end $$;

-- Snapshots come from devices: never let one malformed value break a query for everyone.
create or replace function safe_bigint(p text) returns bigint
language sql immutable as $$ select case when p ~ '^-?[0-9]{1,18}$' then p::bigint end $$;

-- Learners with a reminder device and PR still open whose deadline falls in the
-- next p_window_ms and that has not been reminded yet. Times are epoch ms, as in
-- the synced progress.
create or replace function homework_reminder_targets(p_now_ms bigint, p_window_ms bigint) returns jsonb
language sql stable security definer set search_path = public as $$
  with open_hw as (
    select s.user_id, h.key as homework_id, safe_bigint(h.value->>'dueAt') as due_ms, left(h.value->>'title', 80) as title
    from learner_snapshots s
    cross join lateral jsonb_each(case when jsonb_typeof(s.state->'homework') = 'object' then s.state->'homework' else '{}'::jsonb end) h
    where exists (select 1 from reminder_subscriptions r where r.user_id = s.user_id)
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

create or replace function record_homework_reminders(p_user uuid, p_ids jsonb) returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into homework_reminders (user_id, homework_id, kind)
  select p_user, x #>> '{}', 'due-soon' from jsonb_array_elements(coalesce(p_ids, '[]'::jsonb)) x
  on conflict do nothing;
  get diagnostics n = row_count;
  return n;
end $$;

-- ───────────────────────── Homework summary for the owner ─────────────────────────
-- Everything from the learners' synced progress (assigned, open, overdue) and
-- from learning_history (submissions, late, scores). Weekly PRs (hw.week.*) are
-- grouped as one row.
create or replace function admin_homework_overview(p_actor uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare now_ms bigint := floor(extract(epoch from now()) * 1000);
begin
  perform assert_admin(p_actor);
  return (
    with hw as (
      select s.user_id, h.key as homework_id,
             case when h.key like 'hw.week.%' then 'hw.week' else h.key end as group_id,
             safe_bigint(h.value->>'dueAt') as due_ms,
             coalesce(jsonb_array_length(case when jsonb_typeof(h.value->'submissions') = 'array' then h.value->'submissions' else '[]'::jsonb end), 0) as subs,
             least(greatest(safe_bigint(h.value->'submissions'->-1->>'score'), 0), 100)::int as last_score,
             coalesce(h.value->'submissions'->0->'late' = 'true'::jsonb, false) as first_late
      from learner_snapshots s
      cross join lateral jsonb_each(case when jsonb_typeof(s.state->'homework') = 'object' then s.state->'homework' else '{}'::jsonb end) h
      where jsonb_typeof(h.value) = 'object' and safe_bigint(h.value->>'dueAt') is not null
    ),
    sub as (
      select * from learning_history where event_type = 'homework' and occurred_at > now() - interval '56 days'
    )
    select jsonb_build_object(
      'totals', jsonb_build_object(
        'learners', (select count(distinct user_id) from hw),
        'assigned', (select count(*) from hw),
        'submitted', (select count(*) from hw where subs > 0),
        'open', (select count(*) from hw where subs = 0 and due_ms >= now_ms),
        'overdue', (select count(*) from hw where subs = 0 and due_ms < now_ms),
        'late', (select count(*) from hw where subs > 0 and first_late),
        'avg_score', (select round(avg(last_score)) from hw where subs > 0),
        'submissions_7d', (select count(*) from sub where occurred_at > now() - interval '7 days'),
        'reminder_devices', (select count(*) from reminder_subscriptions),
        'reminders_7d', (select count(*) from homework_reminders where sent_at > now() - interval '7 days')),
      'by_homework', coalesce((select jsonb_agg(x order by x.assigned desc, x.id) from (
        select group_id as id, count(*) as assigned, count(*) filter (where subs > 0) as submitted,
               count(*) filter (where subs = 0 and due_ms < now_ms) as overdue,
               count(*) filter (where subs > 0 and first_late) as late,
               round(avg(last_score) filter (where subs > 0)) as avg_score
        from hw group by group_id order by count(*) desc, group_id limit 60) x), '[]'::jsonb),
      'learners', coalesce((select jsonb_agg(x order by x.overdue desc, x.open desc, x.name) from (
        select hw.user_id as id, p.display_name as name, count(*) as assigned,
               count(*) filter (where subs > 0) as submitted,
               count(*) filter (where subs = 0 and due_ms >= now_ms) as open,
               count(*) filter (where subs = 0 and due_ms < now_ms) as overdue,
               round(avg(last_score) filter (where subs > 0)) as avg_score,
               (select max(occurred_at) from learning_history l where l.user_id = hw.user_id and l.event_type = 'homework') as last_submitted_at,
               exists (select 1 from reminder_subscriptions r where r.user_id = hw.user_id) as reminders
        from hw join profiles p on p.id = hw.user_id
        group by hw.user_id, p.display_name
        order by count(*) filter (where subs = 0 and due_ms < now_ms) desc, p.display_name limit 200) x), '[]'::jsonb),
      'weeks', coalesce((select jsonb_agg(x order by x.week) from (
        select to_char(date_trunc('week', occurred_at at time zone 'Asia/Jakarta'), 'YYYY-MM-DD') as week,
               count(*) as submissions, count(*) filter (where is_late) as late, round(avg(score)) as avg_score
        from sub group by 1) x), '[]'::jsonb)
    )
  );
end $$;

create or replace function content_features() returns jsonb
language sql immutable as $$ select '["stories","content_notes","level_exams","homework_reminders"]'::jsonb $$;

-- Lock every function down to the service role, as at the end of 0004–0009.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
