-- Manual QRIS payments (owner decision, November 2026).
-- The learner pays the owner's own QRIS: one QR per plan with the plan price
-- embedded. No gateway reports the payment, so Premium is granted only when an
-- admin confirms it (admin_confirm_payment). The Xendit flow from 0004 stays in
-- the schema but is switched off in the app unless PAYMENT_PROVIDER=xendit.
--
-- Rules kept from 0004: the amount comes from subscription_plans, never from
-- the client; one payment creates at most one subscription period; a renewal
-- starts when the current period ends; the learner can never grant Premium.

-- ───────────── Plans: discount display and the QR for each plan ─────────────
alter table subscription_plans
  add column list_price_idr int check (list_price_idr is null or list_price_idr > 0),
  add column qris_payload text;

-- Yearly: Rp585.000 shown struck through, 15% off, Rp497.250 charged.
update subscription_plans set price_idr = 497250, list_price_idr = 585000 where id = 'premium_yearly';

-- Dynamic QRIS (DANA, merchant "Lentera english, Service", NMID ID1026639132426).
-- The amount is embedded (tag 54) and matches price_idr; the app re-checks it.
update subscription_plans set qris_payload =
  '00020101021226570011ID.DANA.WWW011893600915003698143502090369814350303UMI51440014ID.CO.QRIS.WWW0215ID10266391324260303UMI5204899953033605405585005802ID5924Lentera english, Service6006Lingga610529871621960150011ID.DANA.WWW6304236A'
  where id = 'premium_monthly';
update subscription_plans set qris_payload =
  '00020101021226570011ID.DANA.WWW011893600915003698143502090369814350303UMI51440014ID.CO.QRIS.WWW0215ID10266391324260303UMI52048999530336054064972505802ID5924Lentera english, Service6006Lingga610529871621960150011ID.DANA.WWW630433A7'
  where id = 'premium_yearly';

-- ───────────── Transactions: the manual confirmation trail ─────────────
alter table payment_transactions drop constraint payment_transactions_status_check;
alter table payment_transactions add constraint payment_transactions_status_check
  check (status in ('PENDING','AWAITING_CONFIRMATION','SUCCEEDED','FAILED','EXPIRED','CANCELED','NEEDS_REVIEW'));
alter table payment_transactions
  add column method text not null default 'xendit' check (method in ('xendit','manual_qris')),
  -- What the learner reports after paying, so the admin can match the payment
  -- in the merchant app. Only a name and a short note: no account numbers.
  add column payer_name text check (payer_name is null or char_length(payer_name) between 1 and 80),
  add column payer_note text check (payer_note is null or char_length(payer_note) <= 300),
  add column claimed_at timestamptz,
  add column reviewed_by uuid references profiles(id) on delete set null,
  add column reviewed_at timestamptz,
  add column review_note text check (review_note is null or char_length(review_note) <= 300);
create index payment_transactions_queue_idx on payment_transactions(method, status, claimed_at);

-- Admin decisions are written to the same audit log as gateway events.
alter table payment_webhook_events drop constraint payment_webhook_events_source_check;
alter table payment_webhook_events add constraint payment_webhook_events_source_check
  check (source in ('webhook','reconcile','admin'));

-- A checkout nobody reported as paid closes after 24 hours so the admin queue
-- stays short. It can still be confirmed later if the money did arrive.
create or replace function expire_manual_payments() returns void
language plpgsql security definer set search_path = public as $$
begin
  update payment_transactions set status = 'EXPIRED', failure_code = 'NOT_REPORTED', updated_at = now()
   where method = 'manual_qris' and status = 'PENDING' and expires_at <= now();
end $$;

create or replace function create_manual_payment(p_user uuid, p_plan text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare plan subscription_plans; tx payment_transactions;
begin
  perform get_account(p_user);
  perform expire_manual_payments();
  select * into plan from subscription_plans where id = p_plan and is_active and price_idr > 0;
  if not found then raise exception 'invalid_plan' using errcode = '22023'; end if;
  if coalesce(btrim(plan.qris_payload), '') = '' then raise exception 'qris_not_configured' using errcode = '22023'; end if;

  -- One open checkout per plan: a second tap, or coming back later, reopens it.
  select * into tx from payment_transactions
   where user_id = p_user and plan_id = p_plan and method = 'manual_qris' and status in ('PENDING','AWAITING_CONFIRMATION')
   order by created_at desc limit 1;
  if found then return jsonb_build_object('transaction', to_jsonb(tx) - 'reviewed_by', 'reused', true); end if;

  if (select count(*) from payment_transactions where user_id = p_user and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'too_many_requests' using errcode = '53400';
  end if;

  insert into payment_transactions (user_id, plan_id, reference_id, amount_idr, channel, method, checkout, expires_at)
  values (p_user, p_plan, 'LTR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)), plan.price_idr, 'QRIS', 'manual_qris',
          -- The QR is copied into the transaction, so replacing a plan's QR later never changes what this learner was shown.
          jsonb_build_object('kind', 'qr', 'value', plan.qris_payload), now() + interval '24 hours')
  returning * into tx;
  return jsonb_build_object('transaction', to_jsonb(tx) - 'reviewed_by', 'reused', false);
end $$;

-- The learner says "I have paid". This only queues the payment for review.
create or replace function claim_manual_payment(p_user uuid, p_tx uuid, p_payer_name text, p_note text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare tx payment_transactions; v_name text := btrim(coalesce(p_payer_name, ''));
begin
  if char_length(v_name) = 0 then raise exception 'payer_name_required' using errcode = '22023'; end if;
  perform expire_manual_payments();
  select * into tx from payment_transactions where id = p_tx and user_id = p_user for update;
  if not found then raise exception 'payment_not_found' using errcode = '22023'; end if;
  if tx.method <> 'manual_qris' or tx.status not in ('PENDING','EXPIRED','AWAITING_CONFIRMATION') then
    raise exception 'payment_not_open' using errcode = '22023';
  end if;
  update payment_transactions
     set status = 'AWAITING_CONFIRMATION', payer_name = left(v_name, 80),
         payer_note = nullif(left(btrim(coalesce(p_note, '')), 300), ''),
         claimed_at = coalesce(claimed_at, now()), failure_code = null, updated_at = now()
   where id = tx.id
  returning * into tx;
  return to_jsonb(tx) - 'reviewed_by';
end $$;

-- The only way a manual payment grants Premium.
create or replace function admin_confirm_payment(p_actor uuid, p_tx uuid, p_note text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare tx payment_transactions; plan subscription_plans; base timestamptz;
begin
  perform assert_admin(p_actor);
  select * into tx from payment_transactions where id = p_tx for update;
  if not found then raise exception 'payment_not_found' using errcode = '22023'; end if;
  if tx.method <> 'manual_qris' then raise exception 'not_manual_payment' using errcode = '22023'; end if;
  -- Idempotent: a second click (or two admins at once) changes nothing.
  if tx.status = 'SUCCEEDED' then
    return jsonb_build_object('outcome', 'already_processed', 'transaction', to_jsonb(tx), 'entitlement', get_entitlement(tx.user_id));
  end if;
  -- A reported, unreported, late or previously rejected payment can be confirmed.
  if tx.status not in ('PENDING','AWAITING_CONFIRMATION','EXPIRED','FAILED') then
    raise exception 'payment_not_open' using errcode = '22023';
  end if;

  select * into plan from subscription_plans where id = tx.plan_id;
  select greatest(now(), coalesce(max(expires_at), now())) into base from subscriptions where user_id = tx.user_id and expires_at > now();
  insert into subscriptions (user_id, plan_id, starts_at, expires_at, source_transaction_id)
  values (tx.user_id, tx.plan_id, base, base + make_interval(days => plan.duration_days), tx.id)
  on conflict (source_transaction_id) do nothing;
  update payment_transactions
     set status = 'SUCCEEDED', paid_at = now(), failure_code = null, reviewed_by = p_actor, reviewed_at = now(),
         review_note = nullif(left(btrim(coalesce(p_note, '')), 300), ''), updated_at = now()
   where id = tx.id
  returning * into tx;
  insert into payment_webhook_events (event_key, source, event_type, reference_id, transaction_id, outcome, detail, payload)
  values ('admin:confirm:' || tx.id, 'admin', 'manual.confirm', tx.reference_id, tx.id, 'activated', tx.review_note,
          jsonb_build_object('admin', p_actor, 'amount_idr', tx.amount_idr, 'plan_id', tx.plan_id))
  on conflict (event_key) do update set duplicate_count = payment_webhook_events.duplicate_count + 1;
  return jsonb_build_object('outcome', 'activated', 'transaction', to_jsonb(tx), 'entitlement', get_entitlement(tx.user_id));
end $$;

create or replace function admin_reject_payment(p_actor uuid, p_tx uuid, p_reason text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare tx payment_transactions; v_reason text := btrim(coalesce(p_reason, ''));
begin
  perform assert_admin(p_actor);
  if char_length(v_reason) = 0 then raise exception 'reason_required' using errcode = '22023'; end if;
  select * into tx from payment_transactions where id = p_tx for update;
  if not found then raise exception 'payment_not_found' using errcode = '22023'; end if;
  if tx.method <> 'manual_qris' or tx.status not in ('PENDING','AWAITING_CONFIRMATION','EXPIRED') then
    raise exception 'payment_not_open' using errcode = '22023';
  end if;
  update payment_transactions
     set status = 'FAILED', failure_code = 'REJECTED', reviewed_by = p_actor, reviewed_at = now(),
         review_note = left(v_reason, 300), updated_at = now()
   where id = tx.id
  returning * into tx;
  insert into payment_webhook_events (event_key, source, event_type, reference_id, transaction_id, outcome, detail, payload)
  values ('admin:reject:' || tx.id || ':' || extract(epoch from now())::bigint, 'admin', 'manual.reject', tx.reference_id, tx.id, 'rejected', tx.review_note,
          jsonb_build_object('admin', p_actor))
  on conflict (event_key) do nothing;
  return jsonb_build_object('outcome', 'rejected', 'transaction', to_jsonb(tx));
end $$;

-- Learner view of one transaction: the reviewer's identity is not exposed.
create or replace function get_payment(p_user uuid, p_tx uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce((select (to_jsonb(t) - 'reviewed_by') || jsonb_build_object('plan_name', p.name, 'duration_days', p.duration_days)
                     from payment_transactions t join subscription_plans p on p.id = t.plan_id
                    where t.id = p_tx and t.user_id = p_user), 'null'::jsonb);
$$;

-- Plans as the learner sees them (price, struck-through price, availability).
create or replace function list_plans() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'price_idr', price_idr, 'list_price_idr', list_price_idr,
                                               'duration_days', duration_days, 'qris_ready', coalesce(btrim(qris_payload), '') <> '') order by price_idr), '[]'::jsonb)
  from subscription_plans where is_active and price_idr > 0;
$$;

-- Admin overview, extended with the confirmation queue.
create or replace function admin_payment_overview(p_actor uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare month_start timestamptz; year_start timestamptz;
begin
  perform assert_admin(p_actor);
  perform expire_manual_payments();
  month_start := date_trunc('month', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta';
  year_start := date_trunc('year', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta';
  return jsonb_build_object(
    'users', (select jsonb_build_object('total', count(*), 'premium', count(*) filter (where exists (select 1 from subscriptions s where s.user_id = p.id and s.expires_at > now())),
                                        'free', count(*) filter (where not exists (select 1 from subscriptions s where s.user_id = p.id and s.expires_at > now()))) from profiles p),
    'transactions', (select jsonb_build_object(
        'succeeded', count(*) filter (where status = 'SUCCEEDED'), 'pending', count(*) filter (where status = 'PENDING'),
        'awaiting', count(*) filter (where status = 'AWAITING_CONFIRMATION'),
        'failed', count(*) filter (where status in ('FAILED','EXPIRED','CANCELED')), 'needs_review', count(*) filter (where status = 'NEEDS_REVIEW')) from payment_transactions),
    'revenue', jsonb_build_object(
        'month', (select coalesce(sum(amount_idr), 0) from payment_transactions where status = 'SUCCEEDED' and paid_at >= month_start),
        'year', (select coalesce(sum(amount_idr), 0) from payment_transactions where status = 'SUCCEEDED' and paid_at >= year_start),
        'by_month', (select coalesce(jsonb_agg(jsonb_build_object('month', m, 'total', total, 'count', n) order by m), '[]'::jsonb) from (
            select to_char(paid_at at time zone 'Asia/Jakarta', 'YYYY-MM') as m, sum(amount_idr) as total, count(*) as n
              from payment_transactions where status = 'SUCCEEDED' and paid_at >= now() - interval '12 months' group by 1) q)),
    -- Reported payments first (oldest first), then checkouts not reported yet.
    'queue', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('id', t.id, 'reference_id', t.reference_id, 'user', p.display_name, 'user_id', t.user_id, 'plan_id', t.plan_id,
                                  'amount_idr', t.amount_idr, 'status', t.status, 'payer_name', t.payer_name, 'payer_note', t.payer_note,
                                  'claimed_at', t.claimed_at, 'created_at', t.created_at, 'expires_at', t.expires_at) as x
          from payment_transactions t join profiles p on p.id = t.user_id
         where t.method = 'manual_qris' and t.status in ('AWAITING_CONFIRMATION','PENDING')
         order by (t.status = 'AWAITING_CONFIRMATION') desc, coalesce(t.claimed_at, t.created_at) limit 200) s),
    'history', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('id', t.id, 'reference_id', t.reference_id, 'user', p.display_name, 'user_id', t.user_id, 'plan_id', t.plan_id, 'amount_idr', t.amount_idr,
                                  'channel', t.channel, 'method', t.method, 'status', t.status, 'failure_code', t.failure_code, 'created_at', t.created_at, 'paid_at', t.paid_at,
                                  'payer_name', t.payer_name, 'claimed_at', t.claimed_at, 'review_note', t.review_note, 'reviewed_at', t.reviewed_at,
                                  'reviewer', (select r.display_name from profiles r where r.id = t.reviewed_by)) as x
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

-- Lock every function down to the service role, as at the end of 0004.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
