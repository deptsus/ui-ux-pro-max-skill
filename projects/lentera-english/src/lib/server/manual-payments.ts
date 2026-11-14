// Manual QRIS payments: the learner pays the owner's own QRIS and reports it;
// an admin confirms the payment, which is the only thing that grants Premium
// (admin_confirm_payment in 0005_manual_qris.sql).
import { rupiah } from '@/lib/format';
import { PLANS } from '@/lib/plans';
import { qrisProblems } from '@/lib/qris';
import { DbError, type ServerDb } from './db';
import { PaymentError, type Transaction } from './payments';
import type { PushMessage } from './push';

const MESSAGES: Record<string, [number, string]> = {
  invalid_plan: [400, 'Paket tidak tersedia.'],
  qris_not_configured: [503, 'QRIS untuk paket ini belum disiapkan. Coba lagi nanti.'],
  too_many_requests: [429, 'Terlalu banyak percobaan pembayaran. Coba lagi dalam satu jam.'],
  payer_name_required: [400, 'Isi nama pemilik akun yang dipakai membayar.'],
  payment_not_found: [404, 'Transaksi tidak ditemukan.'],
  payment_not_open: [409, 'Transaksi ini sudah tidak bisa diubah.'],
  not_manual_payment: [409, 'Transaksi ini bukan pembayaran QRIS manual.'],
  reason_required: [400, 'Tulis alasan penolakan agar pelajar tahu apa yang harus dilakukan.'],
};

export function mapManualError(e: unknown): never {
  const msg = e instanceof DbError ? e.message : String((e as Error)?.message ?? e);
  for (const [key, [status, text]] of Object.entries(MESSAGES)) if (msg.includes(key)) throw new PaymentError(status, key, text);
  throw e;
}

export async function createManualCheckout(db: ServerDb, userId: string, planId: string): Promise<Transaction> {
  const r = await db.rpc<{ transaction: Transaction }>('create_manual_payment', { p_user: userId, p_plan: planId }).catch(mapManualError);
  const tx = r.transaction;
  // Never show a QR whose embedded amount differs from what this checkout charges.
  const qr = tx.checkout?.kind === 'qr' ? tx.checkout.value : '';
  const problems = qrisProblems(qr, tx.amount_idr);
  if (problems.length) {
    console.error('[payments] QRIS for plan', tx.plan_id, 'is unusable:', problems.join(' '));
    throw new PaymentError(503, 'qris_invalid', 'QRIS untuk paket ini sedang bermasalah. Pembayaran belum bisa dilakukan; kami sudah mencatatnya.');
  }
  return tx;
}

export async function getManualPayment(db: ServerDb, userId: string, txId: string): Promise<Transaction> {
  await db.rpc('expire_manual_payments');
  const tx = await db.rpc<Transaction | null>('get_payment', { p_user: userId, p_tx: txId });
  if (!tx) throw new PaymentError(404, 'payment_not_found', MESSAGES.payment_not_found[1]);
  return tx;
}

/**
 * The admin notification for a learner's "Saya sudah bayar", or null when the
 * report was only re-sent (e.g. the payer name corrected): the SQL keeps the
 * first claimed_at and sets updated_at on every claim, so they are equal only
 * the first time.
 */
export function claimNotification(tx: Transaction & { claimed_at?: string | null; updated_at?: string | null }): PushMessage | null {
  if (tx.status !== 'AWAITING_CONFIRMATION' || !tx.claimed_at || tx.claimed_at !== tx.updated_at) return null;
  const plan = PLANS[tx.plan_id as keyof typeof PLANS]?.name ?? tx.plan_id;
  return {
    title: 'Pembayaran baru menunggu konfirmasi',
    body: `${plan} · ${rupiah(tx.amount_idr)}${tx.payer_name ? ` · dari ${tx.payer_name}` : ''}. Cocokkan dengan mutasi QRIS, lalu konfirmasi.`,
    url: '/admin',
    tag: `payment-${tx.id}`,
  };
}

export function claimManualPayment(db: ServerDb, userId: string, txId: string, payerName: string, note: string): Promise<Transaction> {
  return db.rpc<Transaction>('claim_manual_payment', { p_user: userId, p_tx: txId, p_payer_name: payerName.slice(0, 200), p_note: note.slice(0, 1000) }).catch(mapManualError);
}
