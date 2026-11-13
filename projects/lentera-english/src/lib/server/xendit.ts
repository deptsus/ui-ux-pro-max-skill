// Xendit Payments API client (one-off payments: QRIS, DANA, GoPay).
//
// Written against the official reference at docs.xendit.co (Payments API v3):
//   POST /v3/payment_requests                      create
//   GET  /v3/payment_requests/{id}                 status
//   POST /v3/payment_requests/{id}/cancel          cancel
//   POST /v3/payment_requests/{id}/simulate        test mode only
// with header `api-version: 2024-11-11` and HTTP Basic auth.
//
// Points the public docs do not spell out and that MUST be confirmed in the
// Xendit sandbox before go-live are marked "VERIFY" below.

export const XENDIT_BASE_URL = 'https://api.xendit.co';
export const XENDIT_API_VERSION = '2024-11-11';

export type Channel = 'QRIS' | 'DANA' | 'GOPAY';
export const CHANNELS: Channel[] = ['QRIS', 'DANA', 'GOPAY'];

export interface XenditConfig {
  secretKey: string;
  /** Verification token from Dashboard > Webhooks (sent as x-callback-token). */
  webhookToken: string;
  baseUrl?: string;
  fetch?: typeof fetch;
  /** True for the in-process simulator used in development and tests. */
  mock?: boolean;
}

export interface XenditAction {
  type: 'PRESENT_TO_CUSTOMER' | 'REDIRECT_CUSTOMER' | 'API_POST_REQUEST' | string;
  descriptor: 'QR_STRING' | 'WEB_URL' | 'DEEPLINK_URL' | string;
  value: string;
}

export interface XenditPaymentRequest {
  payment_request_id: string;
  reference_id: string;
  status: 'ACCEPTING_PAYMENTS' | 'REQUIRES_ACTION' | 'AUTHORIZED' | 'CANCELED' | 'EXPIRED' | 'SUCCEEDED' | 'FAILED' | string;
  request_amount: number;
  currency: string;
  channel_code: string;
  actions?: XenditAction[];
  failure_code?: string | null;
  latest_payment_id?: string | null;
}

export class XenditError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

async function call<T>(cfg: XenditConfig, method: string, path: string, body?: unknown): Promise<T> {
  const doFetch = cfg.fetch ?? fetch;
  // VERIFY: Basic auth with the secret key as username and an empty password
  // (Xendit's long-standing convention; the v3 spec only says "http basic").
  const auth = Buffer.from(`${cfg.secretKey}:`).toString('base64');
  let res: Response;
  try {
    res = await doFetch(`${cfg.baseUrl ?? XENDIT_BASE_URL}${path}`, {
      method,
      headers: { Authorization: `Basic ${auth}`, 'api-version': XENDIT_API_VERSION, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
    });
  } catch (e) {
    throw new XenditError(0, 'NETWORK_ERROR', (e as Error).message);
  }
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    /* non-JSON error body */
  }
  if (!res.ok) throw new XenditError(res.status, String(json.error_code ?? 'UNKNOWN_ERROR'), String(json.message ?? `Xendit responded ${res.status}`));
  return json as T;
}

/** Per-channel properties. Override without a deploy via XENDIT_CHANNEL_PROPERTIES_JSON. */
export function channelProperties(channel: Channel, returnUrl: string, expiresAt: Date): Record<string, unknown> {
  const override = process.env.XENDIT_CHANNEL_PROPERTIES_JSON;
  if (override) {
    try {
      const parsed = JSON.parse(override) as Record<string, Record<string, unknown>>;
      if (parsed[channel]) return JSON.parse(JSON.stringify(parsed[channel]).replaceAll('{RETURN_URL}', returnUrl).replaceAll('{EXPIRES_AT}', expiresAt.toISOString()));
    } catch {
      /* fall through to defaults */
    }
  }
  // VERIFY: the QRIS channel page lists "Set Expiry" as supported; the field
  // name follows the documented QR example (channel_properties.expires_at).
  if (channel === 'QRIS') return { expires_at: expiresAt.toISOString() };
  // VERIFY: e-wallet redirect channels use return URLs in the documented
  // samples; DANA and GoPay do not support a custom expiry ("Set Expiry: -").
  return { success_return_url: returnUrl, failure_return_url: returnUrl };
}

export interface CreateInput {
  referenceId: string;
  amount: number;
  channel: Channel;
  description: string;
  returnUrl: string;
  expiresAt: Date;
  metadata?: Record<string, string>;
}

export function createPaymentRequest(cfg: XenditConfig, input: CreateInput): Promise<XenditPaymentRequest> {
  return call<XenditPaymentRequest>(cfg, 'POST', '/v3/payment_requests', {
    reference_id: input.referenceId,
    type: 'PAY',
    country: 'ID',
    currency: 'IDR',
    request_amount: input.amount,
    capture_method: 'AUTOMATIC',
    channel_code: input.channel,
    channel_properties: channelProperties(input.channel, input.returnUrl, input.expiresAt),
    description: input.description,
    metadata: input.metadata,
  });
}

export const getPaymentRequest = (cfg: XenditConfig, id: string) =>
  call<XenditPaymentRequest>(cfg, 'GET', `/v3/payment_requests/${encodeURIComponent(id)}`);

export const cancelPaymentRequest = (cfg: XenditConfig, id: string) =>
  call<XenditPaymentRequest>(cfg, 'POST', `/v3/payment_requests/${encodeURIComponent(id)}/cancel`);

/** Test-mode only. The result arrives through the webhook, as in production. */
export const simulatePayment = (cfg: XenditConfig, id: string, amount: number) =>
  call<{ status: string; message?: string }>(cfg, 'POST', `/v3/payment_requests/${encodeURIComponent(id)}/simulate`, { amount });

// VERIFY: key prefixes are a Xendit convention (xnd_development_ / xnd_production_).
export const isLiveKey = (key: string) => key.startsWith('xnd_production_');

/** The step the customer must take, reduced to what the checkout page needs. */
export function checkoutAction(pr: XenditPaymentRequest): { kind: 'qr' | 'redirect' | 'none'; value: string; deeplink?: string } {
  const actions = pr.actions ?? [];
  const qr = actions.find((a) => a.descriptor === 'QR_STRING');
  if (qr) return { kind: 'qr', value: qr.value };
  const web = actions.find((a) => a.descriptor === 'WEB_URL');
  const deep = actions.find((a) => a.descriptor === 'DEEPLINK_URL');
  if (web || deep) return { kind: 'redirect', value: (web ?? deep)!.value, ...(deep ? { deeplink: deep.value } : {}) };
  return { kind: 'none', value: '' };
}
