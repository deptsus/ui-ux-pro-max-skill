-- Lentera English: migration 0007 for the Supabase SQL Editor.
-- Same content as supabase/migrations/0007_admin_premium_push.sql, run in one
-- transaction (all or nothing) and recorded in Database > Migrations.
begin;

-- 0007: free Premium for admins, and phone notifications (Web Push) for admins.

-- ───────────────────────── Admin Premium ─────────────────────────
-- Admins get every Premium feature without paying. This is derived from the
-- role at read time (no subscription row is written), so revenue, subscriber
-- counts and payment history stay real, and demoting an admin removes it.
-- plan 'admin' with expires_at null means "no end date".
create or replace function get_entitlement(p_user uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  -- Renewal periods are stacked end to end, so the furthest expiry among
  -- periods that have not ended yet is when premium really stops.
  select case
    when exists (select 1 from profiles where id = p_user and role = 'admin')
      then jsonb_build_object('premium', true, 'plan', 'admin', 'expires_at', null)
    when m.expires_at is null
      then jsonb_build_object('premium', false, 'plan', 'free', 'expires_at', null)
    else jsonb_build_object('premium', true, 'expires_at', m.expires_at,
           'plan', (select s.plan_id from subscriptions s where s.user_id = p_user and s.expires_at > now() order by s.starts_at limit 1))
  end
  from (select max(expires_at) as expires_at from subscriptions where user_id = p_user and expires_at > now()) m;
$$;

-- ───────────────────────── Web Push ─────────────────────────
-- One VAPID key pair for the whole app. The server generates it on first use
-- and stores it here, so the private key never has to be copied anywhere by a
-- person. Only the service role can read it (RLS on, no policies, functions
-- locked below).
create table push_keys (
  id boolean primary key default true check (id),
  public_key text not null,
  private_key text not null,
  created_at timestamptz not null default now()
);

-- Browser push subscriptions of admins. One row per browser/app install.
create table push_subscriptions (
  endpoint text primary key check (endpoint ~ '^https://'),
  user_id uuid not null references profiles(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_success_at timestamptz,
  failures int not null default 0
);
create index push_subscriptions_user_idx on push_subscriptions(user_id);

-- Same treatment as every table in 0002: RLS on, no access for the API roles.
alter table push_keys enable row level security;
alter table push_subscriptions enable row level security;
revoke all on table push_keys, push_subscriptions from anon, authenticated;

create or replace function get_push_keys() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce((select jsonb_build_object('public_key', public_key, 'private_key', private_key) from push_keys), 'null'::jsonb);
$$;

-- First writer wins; a concurrent second caller gets the stored pair back.
create or replace function init_push_keys(p_public text, p_private text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(p_public, '') !~ '^[A-Za-z0-9_-]{80,100}$' or coalesce(p_private, '') !~ '^[A-Za-z0-9_-]{40,50}$' then
    raise exception 'invalid_push_keys';
  end if;
  insert into push_keys (public_key, private_key) values (p_public, p_private) on conflict (id) do nothing;
  return get_push_keys();
end $$;

-- Only admins can register for notifications. An endpoint moves to whoever
-- registered it last (e.g. another admin signs in on the same phone).
create or replace function save_push_subscription(p_user uuid, p_endpoint text, p_p256dh text, p_auth text, p_user_agent text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform assert_admin(p_user);
  if coalesce(p_endpoint, '') !~ '^https://' or length(p_endpoint) > 2000
     or coalesce(p_p256dh, '') !~ '^[A-Za-z0-9_=-]{40,200}$' or coalesce(p_auth, '') !~ '^[A-Za-z0-9_=-]{8,64}$' then
    raise exception 'invalid_subscription';
  end if;
  insert into push_subscriptions (endpoint, user_id, p256dh, auth, user_agent)
  values (p_endpoint, p_user, p_p256dh, p_auth, left(p_user_agent, 300))
  on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth,
    user_agent = excluded.user_agent, failures = 0;
  return jsonb_build_object('saved', true, 'devices', (select count(*) from push_subscriptions where user_id = p_user));
end $$;

create or replace function delete_push_subscription(p_user uuid, p_endpoint text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  delete from push_subscriptions where endpoint = p_endpoint and user_id = p_user;
  return jsonb_build_object('devices', (select count(*) from push_subscriptions where user_id = p_user));
end $$;

-- Where to send: every subscription whose owner is still an admin
-- (optionally only one admin's devices, for the "send a test" button).
create or replace function admin_push_targets(p_only_user uuid default null) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('endpoint', s.endpoint, 'p256dh', s.p256dh, 'auth', s.auth)), '[]'::jsonb)
  from push_subscriptions s join profiles p on p.id = s.user_id
  where p.role = 'admin' and (p_only_user is null or s.user_id = p_only_user);
$$;

-- Delivery bookkeeping. Gone endpoints (HTTP 404/410) are removed at once;
-- other failures are counted and the row is dropped after 10 in a row.
create or replace function record_push_result(p_endpoint text, p_ok boolean, p_gone boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_gone then
    delete from push_subscriptions where endpoint = p_endpoint;
  elsif p_ok then
    update push_subscriptions set last_success_at = now(), failures = 0 where endpoint = p_endpoint;
  else
    update push_subscriptions set failures = failures + 1 where endpoint = p_endpoint;
    delete from push_subscriptions where endpoint = p_endpoint and failures >= 10;
  end if;
end $$;

create or replace function push_device_count(p_user uuid) returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from push_subscriptions where user_id = p_user;
$$;

-- Small, cheap number for the admin badge in the learner app.
create or replace function admin_pending_count(p_actor uuid) returns int
language plpgsql stable security definer set search_path = public as $$
begin
  perform assert_admin(p_actor);
  return (select count(*)::int from payment_transactions where method = 'manual_qris' and status = 'AWAITING_CONFIRMATION');
end $$;

-- Lock every function down to the service role, as at the end of 0004/0005.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;

insert into supabase_migrations.schema_migrations (version, name)
values ('20261114100700', '0007_admin_premium_push')
on conflict do nothing;

commit;
