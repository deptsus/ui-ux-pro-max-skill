-- Payments and subscriptions (Xendit: QRIS, DANA, GoPay).
-- Rules enforced here, inside the database transaction:
--   * the price comes from subscription_plans, never from the client;
--   * premium is granted only by process_payment_event, which is called only
--     from the verified webhook handler or from an official status lookup;
--   * amount, currency, channel and gateway ids must match the transaction;
--   * every event is recorded once (event_key) and a payment can create at
--     most one subscription period (subscriptions.source_transaction_id).

create or replace function create_payment_intent(p_user uuid, p_plan text, p_channel text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare plan subscription_plans; tx payment_transactions;
begin
  perform get_account(p_user);
  select * into plan from subscription_plans where id = p_plan and is_active and price_idr > 0;
  if not found then raise exception 'invalid_plan' using errcode = '22023'; end if;
  if p_channel is null or p_channel not in ('QRIS','DANA','GOPAY') then raise exception 'invalid_channel' using errcode = '22023'; end if;

  -- Reuse an open checkout instead of creating duplicates on double taps.
  select * into tx from payment_transactions
   where user_id = p_user and plan_id = p_plan and channel = p_channel and status = 'PENDING'
     and gateway_payment_request_id is not null and expires_at > now() + interval '2 minutes'
   order by created_at desc limit 1;
  if found then return jsonb_build_object('transaction', to_jsonb(tx), 'reused', true); end if;

  if (select count(*) from payment_transactions where user_id = p_user and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'too_many_requests' using errcode = '53400';
  end if;

  insert into payment_transactions (user_id, plan_id, reference_id, amount_idr, channel)
  values (p_user, p_plan, 'LTR-' || replace(gen_random_uuid()::text, '-', ''), plan.price_idr, p_channel)
  returning * into tx;
  return jsonb_build_object('transaction', to_jsonb(tx), 'reused', false, 'plan', to_jsonb(plan));
end $$;

create or replace function attach_gateway_payment(p_tx uuid, p_request_id text, p_checkout jsonb, p_expires_at timestamptz) returns jsonb
language plpgsql security definer set search_path = public as $$
declare tx payment_transactions;
begin
  update payment_transactions
     set gateway_payment_request_id = p_request_id, checkout = p_checkout, expires_at = p_expires_at, updated_at = now()
   where id = p_tx and status = 'PENDING' and gateway_payment_request_id is null
  returning * into tx;
  if not found then raise exception 'transaction_not_open'; end if;
  return to_jsonb(tx);
end $$;

-- The gateway refused to create the payment request.
create or replace function fail_payment_intent(p_tx uuid, p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  update payment_transactions set status = 'FAILED', failure_code = left(p_code, 80), updated_at = now()
   where id = p_tx and status = 'PENDING' and gateway_payment_request_id is null;
  return jsonb_build_object('ok', true);
end $$;

create or replace function process_payment_event(
  p_event_key text, p_source text, p_event_type text, p_reference_id text, p_payment_request_id text, p_payment_id text,
  p_status text, p_amount numeric, p_currency text, p_channel text, p_failure_code text, p_payload jsonb
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  ev_id bigint; tx payment_transactions; plan subscription_plans; v_outcome text; v_detail text; base timestamptz;
begin
  if coalesce(btrim(p_event_key), '') = '' then raise exception 'event_key_required'; end if;

  -- Layer 1: the same event is processed once.
  insert into payment_webhook_events (event_key, source, event_type, reference_id, payload)
  values (p_event_key, p_source, p_event_type, p_reference_id, coalesce(p_payload, '{}'::jsonb))
  on conflict (event_key) do nothing returning id into ev_id;
  if ev_id is null then
    update payment_webhook_events set duplicate_count = duplicate_count + 1 where event_key = p_event_key;
    return jsonb_build_object('outcome', 'duplicate');
  end if;

  select * into tx from payment_transactions where reference_id = p_reference_id for update;
  if not found then
    v_outcome := 'unknown_reference';
  elsif p_payment_request_id is not null and tx.gateway_payment_request_id is distinct from p_payment_request_id then
    v_outcome := 'request_mismatch';
    v_detail := 'gateway payment request id does not match the transaction';
  elsif p_status = 'SUCCEEDED' then
    if tx.status = 'SUCCEEDED' then
      -- Layer 2: a different event for a payment that is already settled.
      v_outcome := 'already_processed';
    elsif p_currency is distinct from 'IDR' or p_amount is null or p_amount <> tx.amount_idr then
      v_outcome := 'amount_mismatch';
      v_detail := format('expected IDR %s, got %s %s', tx.amount_idr, coalesce(p_currency, '?'), coalesce(p_amount::text, '?'));
      update payment_transactions set status = 'NEEDS_REVIEW', failure_code = 'AMOUNT_MISMATCH', gateway_payment_id = coalesce(p_payment_id, gateway_payment_id), updated_at = now() where id = tx.id;
    elsif p_channel is not null and p_channel <> tx.channel then
      v_outcome := 'channel_mismatch';
      v_detail := format('expected %s, got %s', tx.channel, p_channel);
      update payment_transactions set status = 'NEEDS_REVIEW', failure_code = 'CHANNEL_MISMATCH', gateway_payment_id = coalesce(p_payment_id, gateway_payment_id), updated_at = now() where id = tx.id;
    elsif tx.status in ('NEEDS_REVIEW', 'CANCELED') then
      v_outcome := 'needs_review';
      v_detail := format('payment captured for a %s transaction', tx.status);
      update payment_transactions set status = 'NEEDS_REVIEW', gateway_payment_id = coalesce(p_payment_id, gateway_payment_id), updated_at = now() where id = tx.id;
    else
      -- PENDING, or EXPIRED/FAILED locally while the customer still paid.
      select * into plan from subscription_plans where id = tx.plan_id;
      -- A renewal starts when the current period ends, so no paid day is lost.
      select greatest(now(), coalesce(max(expires_at), now())) into base from subscriptions where user_id = tx.user_id and expires_at > now();
      insert into subscriptions (user_id, plan_id, starts_at, expires_at, source_transaction_id)
      values (tx.user_id, tx.plan_id, base, base + make_interval(days => plan.duration_days), tx.id)
      on conflict (source_transaction_id) do nothing;
      update payment_transactions set status = 'SUCCEEDED', paid_at = now(), failure_code = null, gateway_payment_id = coalesce(p_payment_id, gateway_payment_id), updated_at = now() where id = tx.id;
      v_outcome := 'activated';
    end if;
  elsif p_status in ('FAILED', 'EXPIRED', 'CANCELED') then
    if tx.status = 'PENDING' then
      update payment_transactions set status = p_status, failure_code = left(coalesce(p_failure_code, p_status), 80), gateway_payment_id = coalesce(p_payment_id, gateway_payment_id), updated_at = now() where id = tx.id;
      v_outcome := lower(p_status);
    else
      v_outcome := 'ignored';
      v_detail := format('transaction already %s', tx.status);
    end if;
  else
    v_outcome := 'ignored';
    v_detail := format('status %s needs no action', coalesce(p_status, '?'));
  end if;

  update payment_webhook_events set outcome = v_outcome, detail = v_detail, transaction_id = tx.id where id = ev_id;
  if tx.id is null then return jsonb_build_object('outcome', v_outcome); end if;
  return jsonb_build_object('outcome', v_outcome, 'detail', v_detail,
    'transaction', (select to_jsonb(t) from payment_transactions t where t.id = tx.id),
    'entitlement', get_entitlement(tx.user_id));
end $$;

create or replace function get_payment(p_user uuid, p_tx uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce((select to_jsonb(t) || jsonb_build_object('plan_name', p.name, 'duration_days', p.duration_days)
                     from payment_transactions t join subscription_plans p on p.id = t.plan_id
                    where t.id = p_tx and t.user_id = p_user), 'null'::jsonb);
$$;

create or replace function list_payments(p_user uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'transactions', coalesce((select jsonb_agg(x order by x->>'created_at' desc) from (
        select jsonb_build_object('id', t.id, 'reference_id', t.reference_id, 'plan_id', t.plan_id, 'plan_name', p.name, 'amount_idr', t.amount_idr,
                                  'channel', t.channel, 'status', t.status, 'created_at', t.created_at, 'paid_at', t.paid_at, 'failure_code', t.failure_code) as x
          from payment_transactions t join subscription_plans p on p.id = t.plan_id
         where t.user_id = p_user order by t.created_at desc limit 50) s), '[]'::jsonb),
    'periods', coalesce((select jsonb_agg(jsonb_build_object('plan_id', s.plan_id, 'starts_at', s.starts_at, 'expires_at', s.expires_at, 'transaction_id', s.source_transaction_id) order by s.starts_at desc)
                           from subscriptions s where s.user_id = p_user), '[]'::jsonb),
    'entitlement', get_entitlement(p_user));
$$;

create or replace function admin_payment_overview(p_actor uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare month_start timestamptz; year_start timestamptz;
begin
  perform assert_admin(p_actor);
  month_start := date_trunc('month', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta';
  year_start := date_trunc('year', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta';
  return jsonb_build_object(
    'users', (select jsonb_build_object('total', count(*), 'premium', count(*) filter (where exists (select 1 from subscriptions s where s.user_id = p.id and s.expires_at > now())),
                                        'free', count(*) filter (where not exists (select 1 from subscriptions s where s.user_id = p.id and s.expires_at > now()))) from profiles p),
    'transactions', (select jsonb_build_object(
        'succeeded', count(*) filter (where status = 'SUCCEEDED'), 'pending', count(*) filter (where status = 'PENDING'),
        'failed', count(*) filter (where status in ('FAILED','EXPIRED','CANCELED')), 'needs_review', count(*) filter (where status = 'NEEDS_REVIEW')) from payment_transactions),
    'revenue', jsonb_build_object(
        'month', (select coalesce(sum(amount_idr), 0) from payment_transactions where status = 'SUCCEEDED' and paid_at >= month_start),
        'year', (select coalesce(sum(amount_idr), 0) from payment_transactions where status = 'SUCCEEDED' and paid_at >= year_start),
        'by_month', (select coalesce(jsonb_agg(jsonb_build_object('month', m, 'total', total, 'count', n) order by m), '[]'::jsonb) from (
            select to_char(paid_at at time zone 'Asia/Jakarta', 'YYYY-MM') as m, sum(amount_idr) as total, count(*) as n
              from payment_transactions where status = 'SUCCEEDED' and paid_at >= now() - interval '12 months' group by 1) q)),
    'history', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('id', t.id, 'reference_id', t.reference_id, 'user', p.display_name, 'user_id', t.user_id, 'plan_id', t.plan_id, 'amount_idr', t.amount_idr,
                                  'channel', t.channel, 'status', t.status, 'failure_code', t.failure_code, 'created_at', t.created_at, 'paid_at', t.paid_at) as x
          from payment_transactions t join profiles p on p.id = t.user_id order by t.created_at desc limit 200) s),
    'subscribers', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('user_id', s.user_id, 'user', p.display_name, 'plan_id', min(s.plan_id), 'starts_at', min(s.starts_at), 'expires_at', max(s.expires_at)) as x
          from subscriptions s join profiles p on p.id = s.user_id where s.expires_at > now() group by s.user_id, p.display_name order by max(s.expires_at) limit 500) s),
    'webhooks', jsonb_build_object(
        'last_received_at', (select max(received_at) from payment_webhook_events where source = 'webhook'),
        'last_24h', (select coalesce(jsonb_object_agg(outcome, n), '{}'::jsonb) from (select outcome, count(*) as n from payment_webhook_events where received_at > now() - interval '24 hours' group by outcome) q),
        'log', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
            select jsonb_build_object('id', e.id, 'event_key', e.event_key, 'source', e.source, 'event_type', e.event_type, 'reference_id', e.reference_id,
                                      'outcome', e.outcome, 'detail', e.detail, 'duplicates', e.duplicate_count, 'received_at', e.received_at) as x
              from payment_webhook_events e order by e.received_at desc limit 200) s)));
end $$;

-- Lock every function down to the service role (see 0002_security.sql).
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
