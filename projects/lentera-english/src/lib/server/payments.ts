// Checkout, webhook and reconciliation logic. Premium is activated only by
// process_payment_event (SQL), reached from a verified webhook or from an
// official status lookup. A browser redirect never activates anything.
import { timingSafeEqual } from 'node:crypto';
import type { ServerDb } from './db';
import { DbError } from './db';
import { CHANNELS, XenditError, cancelPaymentRequest, checkoutAction, createPaymentRequest, getPaymentRequest, isLiveKey, simulatePayment, type Channel, type XenditConfig, type XenditPaymentRequest } from './xendit';

export const CHECKOUT_MINUTES = 30;

export interface PaymentDeps {
  db: ServerDb;
  xendit: XenditConfig;
  appUrl: string;
  now?: () => number;
}

export class PaymentError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export interface Transaction {
  id: string;
  user_id: string;
  plan_id: string;
  reference_id: string;
  amount_idr: number;
  currency: string;
  channel: Channel;
  status: 'PENDING' | 'AWAITING_CONFIRMATION' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED' | 'CANCELED' | 'NEEDS_REVIEW';
  /** 'manual_qris' (owner's own QRIS, admin-confirmed) or 'xendit'. */
  method?: 'manual_qris' | 'xendit';
  payer_name?: string | null;
  payer_note?: string | null;
  claimed_at?: string | null;
  reviewed_at?: string | null;
  review_note?: string | null;
  gateway_payment_request_id: string | null;
  gateway_payment_id: string | null;
  checkout: { kind: 'qr' | 'redirect' | 'none'; value: string; deeplink?: string } | null;
  expires_at: string | null;
  paid_at: string | null;
  failure_code: string | null;
  created_at: string;
  plan_name?: string;
  duration_days?: number;
}

const MESSAGES: Record<string, [number, string]> = {
  invalid_plan: [400, 'Paket tidak tersedia.'],
  invalid_channel: [400, 'Metode pembayaran tidak tersedia. Pilih QRIS, DANA, atau GoPay.'],
  too_many_requests: [429, 'Terlalu banyak percobaan pembayaran. Coba lagi dalam satu jam.'],
};

function mapDbError(e: unknown): never {
  const msg = e instanceof DbError ? e.message : String((e as Error)?.message ?? e);
  for (const [key, [status, text]] of Object.entries(MESSAGES)) if (msg.includes(key)) throw new PaymentError(status, key, text);
  throw e;
}

interface EventInput {
  key: string;
  source: 'webhook' | 'reconcile';
  type: string;
  referenceId: string | null;
  paymentRequestId: string | null;
  paymentId: string | null;
  status: string | null;
  amount: number | null;
  currency: string | null;
  channel: string | null;
  failureCode: string | null;
  payload: Record<string, unknown>;
}

export interface EventResult {
  outcome: string;
  detail?: string | null;
  transaction?: Transaction;
  entitlement?: { premium: boolean; plan: string; expires_at: string | null };
}

function processEvent(db: ServerDb, e: EventInput): Promise<EventResult> {
  return db.rpc<EventResult>('process_payment_event', {
    p_event_key: e.key,
    p_source: e.source,
    p_event_type: e.type,
    p_reference_id: e.referenceId,
    p_payment_request_id: e.paymentRequestId,
    p_payment_id: e.paymentId,
    p_status: e.status,
    p_amount: e.amount,
    p_currency: e.currency,
    p_channel: e.channel,
    p_failure_code: e.failureCode,
    p_payload: e.payload,
  });
}

/** Feeds a status read from the official API through the same gate as webhooks. */
function reconcile(db: ServerDb, pr: XenditPaymentRequest, statusOverride?: string): Promise<EventResult> {
  const status = statusOverride ?? pr.status;
  return processEvent(db, {
    key: `reconcile:${pr.payment_request_id}:${status}`,
    source: 'reconcile',
    type: `payment_request.${status.toLowerCase()}`,
    referenceId: pr.reference_id,
    paymentRequestId: pr.payment_request_id,
    paymentId: pr.latest_payment_id ?? null,
    status,
    amount: pr.request_amount,
    currency: pr.currency,
    channel: pr.channel_code,
    failureCode: pr.failure_code ?? null,
    payload: { payment_request_id: pr.payment_request_id, reference_id: pr.reference_id, status: pr.status, request_amount: pr.request_amount, currency: pr.currency, channel_code: pr.channel_code },
  });
}

export async function createCheckout(deps: PaymentDeps, userId: string, planId: string, channel: string): Promise<Transaction> {
  if (!CHANNELS.includes(channel as Channel)) throw new PaymentError(400, 'invalid_channel', MESSAGES.invalid_channel[1]);
  const now = deps.now?.() ?? Date.now();
  const intent = await deps.db.rpc<{ transaction: Transaction; reused: boolean }>('create_payment_intent', { p_user: userId, p_plan: planId, p_channel: channel }).catch(mapDbError);
  if (intent.reused) return intent.transaction;
  const tx = intent.transaction;
  const expiresAt = new Date(now + CHECKOUT_MINUTES * 60_000);

  let pr: XenditPaymentRequest;
  try {
    pr = await createPaymentRequest(deps.xendit, {
      referenceId: tx.reference_id,
      amount: tx.amount_idr,
      channel: tx.channel,
      description: `Lentera English ${tx.plan_id === 'premium_yearly' ? 'Premium Tahunan' : 'Premium Bulanan'}`,
      returnUrl: `${deps.appUrl}/app/checkout?tx=${tx.id}`,
      expiresAt,
      // Only our own identifiers. No personal data is sent as metadata.
      metadata: { transaction_id: tx.id, plan_id: tx.plan_id },
    });
  } catch (e) {
    const code = e instanceof XenditError ? e.code : 'GATEWAY_ERROR';
    await deps.db.rpc('fail_payment_intent', { p_tx: tx.id, p_code: code });
    throw new PaymentError(502, code, 'Gerbang pembayaran sedang tidak dapat dihubungi. Belum ada dana yang ditarik. Coba lagi sebentar lagi.');
  }
  if (pr.reference_id !== tx.reference_id || !pr.payment_request_id) {
    await deps.db.rpc('fail_payment_intent', { p_tx: tx.id, p_code: 'GATEWAY_RESPONSE_MISMATCH' });
    throw new PaymentError(502, 'GATEWAY_RESPONSE_MISMATCH', 'Respons gerbang pembayaran tidak sesuai. Transaksi dibatalkan.');
  }
  const attached = await deps.db.rpc<Transaction>('attach_gateway_payment', { p_tx: tx.id, p_request_id: pr.payment_request_id, p_checkout: checkoutAction(pr), p_expires_at: expiresAt.toISOString() });
  // Some flows finish synchronously; they go through the same validation gate.
  if (['SUCCEEDED', 'FAILED', 'EXPIRED', 'CANCELED'].includes(pr.status)) {
    const r = await reconcile(deps.db, pr);
    return r.transaction ?? attached;
  }
  return attached;
}

function tokenMatches(given: string | null, expected: string): boolean {
  if (!given || !expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const str = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 && v.length <= 300 ? v : null);

/**
 * Xendit webhook. Authenticity: the x-callback-token header must equal the
 * token configured in the Xendit dashboard. Always answer quickly with 2xx
 * once the event is recorded so Xendit does not keep retrying.
 */
export async function handleWebhook(deps: PaymentDeps, callbackToken: string | null, rawBody: string): Promise<{ status: number; body: Record<string, unknown> }> {
  if (!tokenMatches(callbackToken, deps.xendit.webhookToken)) return { status: 401, body: { error: 'invalid_callback_token' } };
  let parsed: { event?: unknown; created?: unknown; data?: Record<string, unknown> };
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return { status: 400, body: { error: 'invalid_json' } };
  }
  const event = str(parsed.event);
  const data = parsed.data && typeof parsed.data === 'object' ? parsed.data : null;
  if (!event || !data) return { status: 400, body: { error: 'invalid_payload' } };

  const paymentId = str(data.payment_id);
  const paymentRequestId = str(data.payment_request_id);
  const captures = Array.isArray(data.captures) ? (data.captures as Record<string, unknown>[]) : [];
  const captured = captures.reduce((sum, c) => sum + (num(c.capture_amount) ?? 0), 0);
  const requestAmount = num(data.request_amount);
  // Events that carry no id cannot be de-duplicated, so they are rejected.
  if (!paymentId && !paymentRequestId) return { status: 400, body: { error: 'missing_payment_id' } };

  let status = str(data.status);
  if (event === 'payment_request.expiry' || event === 'payment.expiry') status = 'EXPIRED';
  if (event === 'payment.failure') status = 'FAILED';
  if (event === 'payment.capture' && status !== 'SUCCEEDED') status = 'IGNORED';
  if (!['payment.capture', 'payment.failure', 'payment.expiry', 'payment_request.expiry'].includes(event)) status = 'IGNORED';

  // For a capture, the money actually captured must equal the amount requested.
  const amount = captures.length ? (requestAmount !== null && requestAmount !== captured ? -1 : captured) : requestAmount;

  const result = await processEvent(deps.db, {
    key: `${event}:${paymentId ?? paymentRequestId}`,
    source: 'webhook',
    type: event,
    referenceId: str(data.reference_id),
    paymentRequestId,
    paymentId,
    status,
    amount,
    currency: str(data.currency),
    channel: str(data.channel_code),
    failureCode: str(data.failure_code),
    // Stored for audit. Payer/account details are deliberately not kept.
    payload: {
      event,
      created: str(parsed.created),
      data: {
        payment_id: paymentId,
        payment_request_id: paymentRequestId,
        reference_id: str(data.reference_id),
        status: str(data.status),
        request_amount: requestAmount,
        currency: str(data.currency),
        channel_code: str(data.channel_code),
        failure_code: str(data.failure_code),
        captures: captures.map((c) => ({ capture_id: str(c.capture_id), capture_amount: num(c.capture_amount), capture_timestamp: str(c.capture_timestamp) })),
      },
    },
  });
  return { status: 200, body: { received: true, outcome: result.outcome } };
}

/** Current state of a checkout; while it is pending, asks Xendit directly. */
export async function refreshPayment(deps: PaymentDeps, userId: string, txId: string): Promise<Transaction> {
  const now = deps.now?.() ?? Date.now();
  const tx = await deps.db.rpc<Transaction | null>('get_payment', { p_user: userId, p_tx: txId });
  if (!tx) throw new PaymentError(404, 'not_found', 'Transaksi tidak ditemukan.');
  if (tx.status !== 'PENDING' || !tx.gateway_payment_request_id) return tx;
  let pr: XenditPaymentRequest;
  try {
    pr = await getPaymentRequest(deps.xendit, tx.gateway_payment_request_id);
  } catch {
    return tx; // The webhook remains the source of truth; just report "pending".
  }
  if (['SUCCEEDED', 'FAILED', 'EXPIRED', 'CANCELED'].includes(pr.status)) {
    await reconcile(deps.db, pr);
  } else if (tx.expires_at && new Date(tx.expires_at).getTime() <= now) {
    // Our checkout window is over: close the request at the gateway first.
    try {
      const cancelled = await cancelPaymentRequest(deps.xendit, tx.gateway_payment_request_id);
      await reconcile(deps.db, { ...pr, ...cancelled, payment_request_id: pr.payment_request_id, reference_id: pr.reference_id }, 'EXPIRED');
    } catch {
      /* cannot cancel right now (e.g. payment in flight): stay pending */
    }
  }
  return (await deps.db.rpc<Transaction>('get_payment', { p_user: userId, p_tx: txId }))!;
}

/** Sandbox helper: asks Xendit test mode to simulate the customer paying. */
export async function simulateCheckout(deps: PaymentDeps, userId: string, txId: string): Promise<{ status: string }> {
  if (isLiveKey(deps.xendit.secretKey)) throw new PaymentError(403, 'live_mode', 'Simulasi hanya tersedia di mode uji.');
  const tx = await deps.db.rpc<Transaction | null>('get_payment', { p_user: userId, p_tx: txId });
  if (!tx || !tx.gateway_payment_request_id) throw new PaymentError(404, 'not_found', 'Transaksi tidak ditemukan.');
  if (tx.status !== 'PENDING') throw new PaymentError(409, 'not_pending', 'Transaksi ini sudah tidak menunggu pembayaran.');
  try {
    return await simulatePayment(deps.xendit, tx.gateway_payment_request_id, tx.amount_idr);
  } catch (e) {
    throw new PaymentError(502, e instanceof XenditError ? e.code : 'GATEWAY_ERROR', 'Simulasi pembayaran gagal dijalankan.');
  }
}
