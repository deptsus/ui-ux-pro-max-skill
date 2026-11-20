-- 0021 (Trial Premium 3 hari, 20 Nov 2026): every account created from now on
-- gets Premium for 3 days, the chatbot-free part of the owner's request.
--   * profiles.trial_ends_at: set once, when the account is created
--     (handle_new_user). Accounts that existed before this migration keep null,
--     so they get no trial. One trial per account; guests have none.
--   * get_entitlement: the trial is the last source of Premium:
--     admin > paid subscription > school licence > trial. A paid period always
--     wins. Payments are unchanged: paying during the trial starts the paid
--     period when the payment is confirmed (the unused trial days are not added).
--   * Admin statistics keep counting paying subscribers only (they read
--     subscriptions), so trial accounts are not reported as customers.
-- No learner data changes.
alter table profiles add column if not exists trial_ends_at timestamptz;

-- As in 0003, plus the trial.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name, trial_ends_at)
  values (new.id, left(coalesce(nullif(btrim(new.raw_user_meta_data->>'display_name'), ''), 'Pelajar'), 40), now() + interval '3 days')
  on conflict (id) do nothing;
  insert into streaks (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end $$;

-- As in 0015, plus the trial as the last source.
create or replace function get_entitlement(p_user uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  with paid as (select max(expires_at) as expires_at from subscriptions where user_id = p_user and expires_at > now()),
  school as (
    select max(((l.ends_on + 1)::timestamp at time zone 'Asia/Jakarta')) as expires_at,
           bool_or(t.user_id is not null) as teacher
    from school_licenses l
    left join license_teachers t on t.license_id = l.id and t.user_id = p_user
    where license_active(l)
      and (t.user_id is not null
           or exists (select 1 from classes c join class_members m on m.class_id = c.id
                      where c.license_id = l.id and not c.archived and m.user_id = p_user))
  ),
  trial as (select max(trial_ends_at) as expires_at from profiles where id = p_user and trial_ends_at > now())
  select case
    when exists (select 1 from profiles where id = p_user and role = 'admin')
      then jsonb_build_object('premium', true, 'plan', 'admin', 'expires_at', null)
    when paid.expires_at is not null and (school.expires_at is null or paid.expires_at >= school.expires_at)
      then jsonb_build_object('premium', true, 'expires_at', paid.expires_at,
             'plan', (select s.plan_id from subscriptions s where s.user_id = p_user and s.expires_at > now() order by s.starts_at limit 1))
    when school.expires_at is not null
      then jsonb_build_object('premium', true, 'expires_at', school.expires_at, 'plan', case when school.teacher then 'teacher' else 'class' end)
    when trial.expires_at is not null
      then jsonb_build_object('premium', true, 'expires_at', trial.expires_at, 'plan', 'trial')
    else jsonb_build_object('premium', false, 'plan', 'free', 'expires_at', null)
  end
  from paid, school, trial;
$$;

create or replace function content_features() returns jsonb
language sql immutable set search_path = public as $$ select '["stories","content_notes","level_exams","homework_reminders","branching_stories","audio_uploads","habits","ops","classes","tracks","exam_timing","interactive","school","trial"]'::jsonb $$;

-- Lock every function down to the service role, as at the end of 0004–0020.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
