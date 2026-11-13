// In-process Xendit simulator for local development and the test suite.
// It mirrors the documented request/response shapes of the Payments API v3
// so the real client code runs unchanged. It is NOT proof that live Xendit
// accepts our requests: that needs sandbox credentials.
import { randomUUID } from 'node:crypto';
import { XENDIT_API_VERSION, type XenditConfig, type XenditPaymentRequest } from './xendit';

export const MOCK_SECRET = 'xnd_development_mock_key';

type Deliver = (callbackToken: string, rawBody: string) => Promise<unknown>;

interface Stored extends XenditPaymentRequest {
  payment_id?: string;
}

export class MockXendit {
  requests = new Map<string, Stored>();
  calls: { method: string; path: string; body: unknown }[] = [];
  /** When set, the next create call fails with this error code. */
  failNextCreate: { status: number; code: string } | null = null;

  constructor(private webhookToken: string, private deliver: Deliver) {}

  config(): XenditConfig {
    return { secretKey: MOCK_SECRET, webhookToken: this.webhookToken, baseUrl: 'https://mock.xendit.local', fetch: this.fetch, mock: true };
  }

  private json(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  }

  fetch: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    const method = init?.method ?? 'GET';
    const headers = new Headers(init?.headers);
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    this.calls.push({ method, path: url.pathname, body });
    const expectedAuth = 'Basic ' + Buffer.from(`${MOCK_SECRET}:`).toString('base64');
    if (headers.get('Authorization') !== expectedAuth) return this.json(401, { error_code: 'INVALID_API_KEY', message: 'API key is invalid.' });
    if (headers.get('api-version') !== XENDIT_API_VERSION) return this.json(400, { error_code: 'API_VALIDATION_ERROR', message: 'api-version header is required.' });

    const m = url.pathname.match(/^\/v3\/payment_requests(?:\/([^/]+))?(?:\/(cancel|simulate))?$/);
    if (!m) return this.json(404, { error_code: 'DATA_NOT_FOUND', message: 'Not found.' });
    const [, id, action] = m;

    if (!id && method === 'POST') {
      if (this.failNextCreate) {
        const f = this.failNextCreate;
        this.failNextCreate = null;
        return this.json(f.status, { error_code: f.code, message: 'Simulated gateway error.' });
      }
      const ok = body && body.type === 'PAY' && body.country === 'ID' && body.currency === 'IDR' && typeof body.reference_id === 'string' && body.reference_id.length <= 255 && typeof body.request_amount === 'number' && ['QRIS', 'DANA', 'GOPAY'].includes(body.channel_code);
      if (!ok) return this.json(400, { error_code: 'API_VALIDATION_ERROR', message: 'Invalid request body.' });
      if ([...this.requests.values()].some((r) => r.reference_id === body.reference_id)) return this.json(409, { error_code: 'DUPLICATE_ERROR', message: 'Duplication is not allowed.' });
      const prId = `pr-${randomUUID()}`;
      const actions =
        body.channel_code === 'QRIS'
          ? [{ type: 'PRESENT_TO_CUSTOMER', descriptor: 'QR_STRING', value: `00020101021226570011ID.MOCK.WWW0118${prId.slice(3, 21)}5204581253033605802ID5915LENTERA ENGLISH6007JAKARTA6304ABCD` }]
          : [
              { type: 'REDIRECT_CUSTOMER', descriptor: 'WEB_URL', value: `https://mock.xendit.local/pay/${prId}` },
              { type: 'REDIRECT_CUSTOMER', descriptor: 'DEEPLINK_URL', value: `${body.channel_code.toLowerCase()}://pay/${prId}` },
            ];
      const pr: Stored = { payment_request_id: prId, reference_id: body.reference_id, status: 'REQUIRES_ACTION', request_amount: body.request_amount, currency: 'IDR', channel_code: body.channel_code, actions };
      this.requests.set(prId, pr);
      return this.json(201, pr);
    }
    const pr = id ? this.requests.get(id) : undefined;
    if (!pr) return this.json(404, { error_code: 'DATA_NOT_FOUND', message: 'Payment request not found.' });
    if (!action && method === 'GET') return this.json(200, { ...pr, latest_payment_id: pr.payment_id ?? null });
    if (action === 'cancel' && method === 'POST') {
      if (pr.status !== 'REQUIRES_ACTION') return this.json(400, { error_code: 'INELIGIBLE_TRANSACTION_STATUS', message: 'Cannot cancel.' });
      pr.status = 'CANCELED';
      return this.json(200, pr);
    }
    if (action === 'simulate' && method === 'POST') {
      if (pr.status !== 'REQUIRES_ACTION') return this.json(400, { error_code: 'INELIGIBLE_TRANSACTION_STATUS', message: 'Cannot simulate.' });
      await this.capture(pr.payment_request_id, { amount: typeof body?.amount === 'number' ? body.amount : pr.request_amount });
      return this.json(200, { status: 'PENDING', message: 'The simulation result will be sent through a webhook.' });
    }
    return this.json(404, { error_code: 'DATA_NOT_FOUND', message: 'Not found.' });
  };

  /** Builds a webhook body exactly as documented (event, business_id, created, data). */
  webhookBody(event: string, pr: Stored, data: Record<string, unknown> = {}): string {
    return JSON.stringify({
      event,
      business_id: 'mock-business',
      created: new Date().toISOString(),
      data: {
        payment_id: pr.payment_id,
        business_id: 'mock-business',
        reference_id: pr.reference_id,
        payment_request_id: pr.payment_request_id,
        type: 'PAY',
        country: 'ID',
        currency: pr.currency,
        request_amount: pr.request_amount,
        capture_method: 'AUTOMATIC',
        channel_code: pr.channel_code,
        status: pr.status,
        // Present in real payloads; must never be stored by our handler.
        payment_details: { payer_name: 'MOCK PAYER', issuer_name: 'MOCK BANK' },
        ...data,
      },
    });
  }

  async capture(prId: string, opts: { amount?: number; currency?: string; times?: number } = {}) {
    const pr = this.requests.get(prId)!;
    pr.status = 'SUCCEEDED';
    pr.payment_id ??= `py-${randomUUID()}`;
    const amount = opts.amount ?? pr.request_amount;
    const body = this.webhookBody('payment.capture', pr, {
      currency: opts.currency ?? pr.currency,
      request_amount: amount,
      captures: [{ capture_id: `cp-${pr.payment_id.slice(3)}`, capture_timestamp: new Date().toISOString(), capture_amount: amount }],
    });
    const out = [];
    for (let i = 0; i < (opts.times ?? 1); i++) out.push(await this.deliver(this.webhookToken, body));
    return { body, results: out };
  }

  async fail(prId: string, failureCode = 'USER_DECLINED_PAYMENT') {
    const pr = this.requests.get(prId)!;
    pr.status = 'FAILED';
    pr.failure_code = failureCode;
    pr.payment_id ??= `py-${randomUUID()}`;
    return this.deliver(this.webhookToken, this.webhookBody('payment.failure', pr, { failure_code: failureCode }));
  }

  async expire(prId: string) {
    const pr = this.requests.get(prId)!;
    pr.status = 'EXPIRED';
    return this.deliver(this.webhookToken, this.webhookBody('payment_request.expiry', pr));
  }
}
