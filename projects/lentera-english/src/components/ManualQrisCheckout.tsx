'use client';
// Checkout for the owner's own QRIS. The learner pays, then reports it; an admin
// matches the payment in the merchant app and confirms it. Only that
// confirmation (on the server) grants Premium: nothing on this page does.
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { CheckCircle2, Clock, Download, Hourglass, XCircle } from 'lucide-react';
import { api } from '@/lib/client/api';
import { readQris } from '@/lib/qris';
import { Mascot } from './Mascot';
import { Badge, Button, Card, Field, LinkButton, Notice, dateId, dateTimeId, inputClass, rupiah } from './ui';

export interface ManualTx {
  id: string; reference_id: string; plan_id: string; plan_name: string; duration_days: number; amount_idr: number; status: string;
  checkout: { kind: string; value: string } | null; expires_at: string | null; paid_at: string | null; failure_code: string | null; created_at: string;
  payer_name?: string | null; payer_note?: string | null; claimed_at?: string | null; review_note?: string | null;
}

function ClaimForm({ tx, onDone }: { tx: ManualTx; onDone: () => void }) {
  const [name, setName] = useState(tx.payer_name ?? '');
  const [note, setNote] = useState(tx.payer_note ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(`/api/payments/${tx.id}`, { body: { action: 'claim', payerName: name, note } });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  };
  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <h2 className="font-extrabold">Sudah membayar?</h2>
      <p className="text-sm text-muted">Isi data di bawah agar kami bisa mencocokkan pembayaranmu dengan mutasi QRIS.</p>
      <Field label="Nama pemilik akun yang membayar" hint="Seperti tercantum di aplikasi bank atau e-wallet yang kamu pakai.">
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoComplete="name" className={inputClass} placeholder="mis. Dewi Lestari" />
      </Field>
      <Field label="Catatan (opsional)" hint="mis. aplikasi yang dipakai dan jam pembayaran. Jangan tulis nomor rekening, PIN, atau kode OTP.">
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className={inputClass} placeholder="Dibayar dengan GoPay pukul 14.05" />
      </Field>
      {error && <p className="rounded-xl bg-bad-soft px-3 py-2 text-sm font-bold text-bad" role="alert">{error}</p>}
      <Button type="submit" full size="lg" disabled={busy || !name.trim()}>{busy ? 'Mengirim...' : 'Saya sudah bayar'}</Button>
    </form>
  );
}

export function ManualQrisCheckout({ tx, premiumUntil, reload }: { tx: ManualTx; premiumUntil: string | null; reload: () => void }) {
  const [qr, setQr] = useState<string | null>(null);
  const payload = tx.checkout?.kind === 'qr' ? tx.checkout.value : '';
  const info = (() => { try { return payload ? readQris(payload) : null; } catch { return null; } })();
  useEffect(() => { if (payload) QRCode.toDataURL(payload, { margin: 3, width: 720, errorCorrectionLevel: 'M' }).then(setQr).catch(() => setQr(null)); }, [payload]);

  const summary = (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      <dt className="text-muted">Paket</dt><dd className="text-right font-bold">{tx.plan_name} ({tx.duration_days} hari)</dd>
      <dt className="text-muted">Metode</dt><dd className="text-right font-bold">QRIS</dd>
      <dt className="text-muted">Nomor referensi</dt><dd className="break-all text-right font-mono text-xs">{tx.reference_id}</dd>
      <dt className="text-muted">Dibuat</dt><dd className="text-right">{dateTimeId(tx.created_at)}</dd>
      {tx.claimed_at && <><dt className="text-muted">Dilaporkan</dt><dd className="text-right">{dateTimeId(tx.claimed_at)}</dd></>}
      {tx.payer_name && <><dt className="text-muted">Nama pembayar</dt><dd className="break-words text-right">{tx.payer_name}</dd></>}
      {tx.paid_at && <><dt className="text-muted">Dikonfirmasi</dt><dd className="text-right">{dateTimeId(tx.paid_at)}</dd></>}
      <dt className="border-t border-line pt-2 text-base font-extrabold">Total</dt><dd className="border-t border-line pt-2 text-right text-base font-extrabold">{rupiah(tx.amount_idr)}</dd>
    </dl>
  );

  const qrCard = (
    <div className="grid place-items-center gap-2 rounded-2xl bg-white p-4 text-center">
      <p className="text-sm font-bold text-[#5b5878]">{info?.merchantName ?? 'Lentera English'}</p>
      <p className="text-3xl font-extrabold text-[#1e1b3a]">{rupiah(tx.amount_idr)}</p>
      {qr ? <img src={qr} alt={`Kode QRIS pembayaran ${tx.plan_name}, ${rupiah(tx.amount_idr)}`} className="h-64 w-64" /> : <div className="grid h-64 w-64 place-items-center text-sm text-[#5b5878]">Menyiapkan kode QR...</div>}
      {info?.nmid && <p className="text-xs text-[#5b5878]">NMID: {info.nmid}</p>}
    </div>
  );

  if (tx.status === 'SUCCEEDED') {
    return (
      <Card className="space-y-4">
        <div className="flex flex-col items-center gap-2 text-center"><Mascot mood="cheer" size={88} /><CheckCircle2 size={32} className="text-ok" aria-hidden /><h2 className="text-xl font-extrabold">Pembayaran dikonfirmasi</h2><p className="text-muted">{premiumUntil ? `Premium aktif sampai ${dateId(premiumUntil)}.` : 'Premium sedang diaktifkan.'}</p></div>
        <div className="rounded-2xl border border-line p-4"><p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-muted">Bukti pembayaran</p>{summary}</div>
        <p className="text-xs text-muted">Tidak ada perpanjangan otomatis. Kamu bisa memperpanjang sendiri dari halaman paket sebelum masa aktif berakhir.</p>
        <div className="flex flex-col gap-2 sm:flex-row"><Button variant="secondary" full onClick={() => window.print()}>Cetak bukti</Button><LinkButton href="/app/path" full>Lanjut belajar</LinkButton></div>
      </Card>
    );
  }

  if (tx.status === 'AWAITING_CONFIRMATION') {
    return (
      <Card className="space-y-4">
        <div className="flex flex-col items-center gap-2 text-center"><Mascot mood="happy" size={80} /><Badge tone="accent"><Hourglass size={12} aria-hidden />Menunggu konfirmasi</Badge><h2 className="text-xl font-extrabold">Terima kasih, laporanmu sudah kami terima</h2>
          <p className="text-muted">Kami mencocokkan pembayaranmu dengan mutasi QRIS secara manual. Premium aktif begitu pembayaran dikonfirmasi; halaman ini berubah otomatis dan boleh kamu tutup.</p></div>
        {summary}
        <p className="text-center text-xs text-muted" role="status">Diperiksa ulang otomatis setiap 15 detik.</p>
      </Card>
    );
  }

  if (tx.status === 'FAILED') {
    return (
      <Card className="space-y-4">
        <div className="flex flex-col items-center gap-2 text-center"><Mascot mood="sad" size={80} /><XCircle size={32} className="text-bad" aria-hidden /><h2 className="text-xl font-extrabold">Pembayaran belum bisa dikonfirmasi</h2>
          {tx.review_note && <p className="text-muted"><span className="font-bold text-ink">Alasan: </span>{tx.review_note}</p>}
          <p className="text-sm text-muted">Premium belum diaktifkan. Bila kamu yakin sudah membayar, sebutkan nomor referensi di bawah saat menghubungi kami.</p></div>
        {summary}
        <LinkButton href="/app/subscription" full>Kembali ke halaman paket</LinkButton>
      </Card>
    );
  }

  // PENDING, or EXPIRED (not reported within 24 hours; a late report is still accepted).
  const expired = tx.status === 'EXPIRED';
  return (
    <>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge tone={expired ? 'bad' : 'accent'}><Clock size={12} aria-hidden />{expired ? 'Belum dilaporkan' : 'Menunggu pembayaran'}</Badge>
          {tx.expires_at && !expired && <p className="text-sm text-muted">Laporkan sebelum {dateTimeId(tx.expires_at)}</p>}
        </div>
        {expired && <Notice tone="accent" title="Pembayaran belum dilaporkan dalam 24 jam">Bila kamu sudah membayar, laporkan sekarang lewat formulir di bawah. Bila belum, buat pembayaran baru dari halaman paket.</Notice>}
        {qrCard}
        {qr && <a href={qr} download={`qris-lentera-${tx.plan_id}.png`} className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-line bg-surface px-5 py-2.5 font-bold text-ink hover:bg-surface-2"><Download size={18} aria-hidden />Simpan gambar QR</a>}
        {summary}
      </Card>
      <Card>
        <h2 className="font-extrabold">Cara membayar</h2>
        <ol className="mt-3 space-y-2">
          {[
            'Buka aplikasi mobile banking atau e-wallet apa pun yang mendukung QRIS.',
            'Pilih Scan / Bayar QRIS, lalu pindai kode di atas. Memakai ponsel yang sama? Simpan gambar QR, lalu pilih gambar itu dari galeri di menu scan.',
            `Pastikan nama merchant "${info?.merchantName ?? 'Lentera english'}" dan nominal ${rupiah(tx.amount_idr)}. Nominal sudah terisi otomatis.`,
            'Setelah berhasil membayar, kembali ke sini dan tekan "Saya sudah bayar".',
          ].map((s, i) => <li key={i} className="flex gap-3 text-sm"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-extrabold text-brand">{i + 1}</span>{s}</li>)}
        </ol>
      </Card>
      <Card><ClaimForm tx={tx} onDone={reload} /></Card>
      <p className="text-center text-xs text-muted">Premium aktif setelah pembayaranmu kami konfirmasi, bukan saat halaman ini dibuka. Tidak ada tagihan otomatis.</p>
    </>
  );
}
