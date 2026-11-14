'use client';
// Checkout status page. It only DISPLAYS the state of a transaction: Premium
// is activated on the server, by an admin confirming a manual QRIS payment
// (default) or, with Xendit enabled, by a verified webhook or the official
// status API. Never by reaching this page.
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { CheckCircle2, Clock, ExternalLink, XCircle } from 'lucide-react';
import { api } from '@/lib/client/api';
import { useNow } from '@/lib/client/hooks';
import { useSession } from '@/lib/client/session';
import { syncNow } from '@/lib/client/store';
import { ManualQrisCheckout, type ManualTx } from '@/components/ManualQrisCheckout';
import { Mascot } from '@/components/Mascot';
import { Badge, Button, Card, Empty, LinkButton, Notice, dateId, dateTimeId, rupiah } from '@/components/ui';

interface Tx { id: string; reference_id: string; plan_id: string; plan_name: string; duration_days: number; amount_idr: number; currency: string; channel: 'QRIS' | 'DANA' | 'GOPAY'; status: string; checkout: { kind: 'qr' | 'redirect' | 'none'; value: string; deeplink?: string } | null; expires_at: string | null; paid_at: string | null; failure_code: string | null; created_at: string }
interface Res { transaction: Tx; entitlement: { premium: boolean; expires_at: string | null }; mode: 'manual' | 'live' | 'test' | 'mock' | 'off' }
const NAME = { QRIS: 'QRIS', DANA: 'DANA', GOPAY: 'GoPay' };
const STEPS: Record<Tx['channel'], string[]> = {
  QRIS: ['Buka aplikasi mobile banking atau e-wallet apa pun yang mendukung QRIS.', 'Pilih menu Scan / Bayar, lalu pindai kode QR di atas.', 'Periksa nama merchant dan nominalnya, lalu konfirmasi pembayaran.', 'Kembali ke halaman ini. Status akan berubah otomatis.'],
  DANA: ['Tekan tombol "Buka DANA" di atas.', 'Masuk ke akun DANA dan periksa nominalnya.', 'Konfirmasi pembayaran dengan PIN DANA.', 'Kembali ke halaman ini. Status akan berubah otomatis.'],
  GOPAY: ['Tekan tombol "Buka GoPay" di atas dari ponsel yang terpasang aplikasi GoPay.', 'Pembayaran GoPay hanya dapat diselesaikan di aplikasi GoPay.', 'Periksa nominalnya, lalu konfirmasi dengan PIN GoPay.', 'Kembali ke halaman ini. Status akan berubah otomatis.'],
};
const FAIL: Record<string, string> = { USER_DECLINED_PAYMENT: 'Pembayaran dibatalkan di aplikasi.', USER_DID_NOT_AUTHORIZE: 'Pembayaran tidak dikonfirmasi tepat waktu.', INSUFFICIENT_BALANCE: 'Saldo tidak mencukupi.', PAYMENT_REQUEST_EXPIRED: 'Batas waktu pembayaran habis.', CHANNEL_UNAVAILABLE: 'Metode pembayaran sedang tidak tersedia.', AMOUNT_MISMATCH: 'Nominal yang diterima tidak sesuai.' };

function Checkout() {
  const id = useSearchParams().get('tx');
  const session = useSession();
  const now = useNow(1000);
  const [data, setData] = useState<Res | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setData(await api<Res>(`/api/payments/${id}`));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id]);
  useEffect(() => { if (session) void load(); }, [session, load]);
  const status = data?.transaction.status;
  const manual = data?.mode === 'manual';
  useEffect(() => {
    // Xendit: poll while waiting for the gateway. Manual: poll only after the
    // learner reported paying, while an admin checks it.
    if (manual ? status !== 'AWAITING_CONFIRMATION' : status !== 'PENDING') return;
    const t = setInterval(() => void load(), manual ? 15000 : 4000);
    return () => clearInterval(t);
  }, [status, load, manual]);
  // Once the server reports success, refresh the local entitlement.
  useEffect(() => { if (status === 'SUCCEEDED') void syncNow(); }, [status]);
  const qrValue = data?.transaction.checkout?.kind === 'qr' ? data.transaction.checkout.value : null;
  useEffect(() => { if (qrValue) QRCode.toDataURL(qrValue, { margin: 2, width: 512, errorCorrectionLevel: 'M' }).then(setQr).catch(() => setQr(null)); }, [qrValue]);

  if (!id) return <Empty title="Transaksi tidak ditemukan" action={<LinkButton href="/app/subscription">Ke halaman paket</LinkButton>} />;
  if (!session) return <Empty title="Masuk untuk melihat transaksi" action={<LinkButton href="/masuk">Masuk</LinkButton>} />;
  if (error && !data) return <Empty title="Transaksi belum bisa dimuat" action={<Button onClick={load}>Coba lagi</Button>}>{error}</Empty>;
  if (!data) return <Card className="mx-auto max-w-xl text-muted"><span role="status">Memuat transaksi...</span></Card>;

  if (data.mode === 'manual') {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-extrabold">Pembayaran</h1>
        <ManualQrisCheckout tx={data.transaction as unknown as ManualTx} premiumUntil={data.entitlement.premium ? data.entitlement.expires_at : null} reload={() => void load()} />
      </div>
    );
  }

  const tx = data.transaction;
  const left = tx.expires_at ? Math.max(0, Math.floor((new Date(tx.expires_at).getTime() - now) / 1000)) : null;
  const simulate = async () => {
    setSimulating(true);
    try { await api(`/api/payments/${tx.id}`, { body: { action: 'simulate' } }); await load(); } catch (e) { setError((e as Error).message); }
    setSimulating(false);
  };
  const summary = (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      <dt className="text-muted">Paket</dt><dd className="text-right font-bold">{tx.plan_name} ({tx.duration_days} hari)</dd>
      <dt className="text-muted">Metode</dt><dd className="text-right font-bold">{NAME[tx.channel]}</dd>
      <dt className="text-muted">Nomor referensi</dt><dd className="break-all text-right font-mono text-xs">{tx.reference_id}</dd>
      <dt className="text-muted">Dibuat</dt><dd className="text-right">{dateTimeId(tx.created_at)}</dd>
      {tx.paid_at && <><dt className="text-muted">Dibayar</dt><dd className="text-right">{dateTimeId(tx.paid_at)}</dd></>}
      <dt className="border-t border-line pt-2 text-base font-extrabold">Total</dt><dd className="border-t border-line pt-2 text-right text-base font-extrabold">{rupiah(tx.amount_idr)}</dd>
    </dl>
  );

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-extrabold">Pembayaran</h1>
      {data.mode !== 'live' && <Notice tone="accent" title={data.mode === 'mock' ? 'Mode simulasi lokal' : 'Mode uji (sandbox)'}>Tidak ada uang sungguhan yang berpindah pada transaksi ini.</Notice>}

      {status === 'PENDING' && (
        <>
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><Badge tone="accent"><Clock size={12} aria-hidden />Menunggu pembayaran</Badge>{left !== null && <p className="text-sm font-bold" aria-live="off">Bayar sebelum {dateTimeId(tx.expires_at!)} · <span className={left < 120 ? 'text-bad' : ''}>{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</span></p>}</div>
            {tx.checkout?.kind === 'qr' && (
              <div className="grid place-items-center gap-2 rounded-2xl bg-white p-4">
                {qr ? <img src={qr} alt="Kode QRIS untuk pembayaran ini" className="h-64 w-64" /> : <div className="grid h-64 w-64 place-items-center text-sm text-[#5b5878]">Menyiapkan kode QR...</div>}
                <p className="text-sm font-extrabold text-[#1e1b3a]">Lentera English · {rupiah(tx.amount_idr)}</p>
              </div>
            )}
            {tx.checkout?.kind === 'redirect' && (data.mode === 'mock'
              ? <Notice tone="muted">Simulator lokal tidak punya halaman {NAME[tx.channel]} sungguhan. Gunakan tombol simulasi di bawah.</Notice>
              : <a href={tx.checkout.deeplink ?? tx.checkout.value} target="_blank" rel="noopener noreferrer" className="flex min-h-13 items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-brand-strong bg-brand px-6 py-3.5 text-lg font-bold text-on-brand">Buka {NAME[tx.channel]}<ExternalLink size={18} aria-hidden /></a>)}
            {tx.checkout?.kind === 'redirect' && data.mode !== 'mock' && tx.checkout.deeplink && <a href={tx.checkout.value} target="_blank" rel="noopener noreferrer" className="block text-center text-sm font-bold text-brand underline">Aplikasi tidak terbuka? Bayar lewat halaman web</a>}
            {summary}
          </Card>
          <Card>
            <h2 className="font-extrabold">Cara membayar dengan {NAME[tx.channel]}</h2>
            <ol className="mt-3 space-y-2">{STEPS[tx.channel].map((s, i) => <li key={i} className="flex gap-3 text-sm"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-extrabold text-brand">{i + 1}</span>{s}</li>)}</ol>
          </Card>
          <p className="text-center text-sm text-muted" role="status">Status diperiksa otomatis setiap beberapa detik. Premium aktif setelah Xendit mengonfirmasi pembayaranmu ke server kami.</p>
          {data.mode !== 'live' && <Button full variant="accent" disabled={simulating} onClick={simulate}>{simulating ? 'Menjalankan simulasi...' : 'Simulasikan pembayaran berhasil (mode uji)'}</Button>}
          {error && <p className="text-center text-sm text-bad" role="alert">{error}</p>}
        </>
      )}

      {status === 'SUCCEEDED' && (
        <Card className="space-y-4">
          <div className="flex flex-col items-center gap-2 text-center"><Mascot mood="cheer" size={88} /><CheckCircle2 size={32} className="text-ok" aria-hidden /><h2 className="text-xl font-extrabold">Pembayaran berhasil</h2><p className="text-muted">{data.entitlement.premium && data.entitlement.expires_at ? `Premium aktif sampai ${dateId(data.entitlement.expires_at)}.` : 'Premium sedang diaktifkan.'}</p></div>
          <div className="rounded-2xl border border-line p-4"><p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-muted">Bukti pembayaran</p>{summary}</div>
          <p className="text-xs text-muted">Tidak ada perpanjangan otomatis. Kamu bisa memperpanjang sendiri dari halaman paket sebelum masa aktif berakhir.</p>
          <div className="flex flex-col gap-2 sm:flex-row"><Button variant="secondary" full onClick={() => window.print()}>Cetak bukti</Button><LinkButton href="/app/path" full>Lanjut belajar</LinkButton></div>
        </Card>
      )}

      {status && !['PENDING', 'SUCCEEDED'].includes(status) && (
        <Card className="space-y-4">
          <div className="flex flex-col items-center gap-2 text-center"><Mascot mood="sad" size={80} /><XCircle size={32} className={status === 'NEEDS_REVIEW' ? 'text-accent' : 'text-bad'} aria-hidden />
            <h2 className="text-xl font-extrabold">{status === 'EXPIRED' ? 'Batas waktu pembayaran habis' : status === 'CANCELED' ? 'Pembayaran dibatalkan' : status === 'NEEDS_REVIEW' ? 'Pembayaran sedang ditinjau' : 'Pembayaran gagal'}</h2>
            <p className="text-muted">{status === 'NEEDS_REVIEW' ? 'Kami menerima pemberitahuan pembayaran yang tidak cocok dengan transaksi ini. Tim kami akan memeriksanya; Premium belum diaktifkan.' : `${FAIL[tx.failure_code ?? ''] ?? ''} Premium tidak diaktifkan dan kamu bisa mencoba lagi.`}</p></div>
          {summary}
          <LinkButton href="/app/subscription" full>Buat pembayaran baru</LinkButton>
        </Card>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense><Checkout /></Suspense>;
}
