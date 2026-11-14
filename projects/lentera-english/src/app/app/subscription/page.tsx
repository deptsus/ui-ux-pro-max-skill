'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, Crown, QrCode, Smartphone, Wallet } from 'lucide-react';
import { api } from '@/lib/client/api';
import { useApp } from '@/lib/client/hooks';
import { useServerInfo, useSession } from '@/lib/client/session';
import { BENCHMARK_MONTHLY, CHANNELS, FREE_FEATURES, PLANS, PREMIUM_FEATURES, type PlanId } from '@/lib/plans';
import { Badge, Button, Card, LinkButton, Notice, PageHeader, cx, dateId, dateTimeId, rupiah } from '@/components/ui';

interface Tx { id: string; reference_id: string; plan_name: string; amount_idr: number; channel: string; status: string; created_at: string; paid_at: string | null }
const STATUS: Record<string, [string, 'ok' | 'bad' | 'accent' | 'muted']> = { SUCCEEDED: ['Berhasil', 'ok'], PENDING: ['Menunggu pembayaran', 'accent'], AWAITING_CONFIRMATION: ['Menunggu konfirmasi', 'accent'], FAILED: ['Gagal', 'bad'], EXPIRED: ['Kedaluwarsa', 'muted'], CANCELED: ['Dibatalkan', 'muted'], NEEDS_REVIEW: ['Sedang ditinjau', 'accent'] };
const ICON = { QRIS: QrCode, DANA: Wallet, GOPAY: Smartphone };

export default function SubscriptionPage() {
  const router = useRouter();
  const { ent, now, premium } = useApp();
  const session = useSession();
  const info = useServerInfo();
  const [plan, setPlan] = useState<PlanId>('premium_yearly');
  const [channel, setChannel] = useState<string>('QRIS');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Tx[] | null>(null);
  useEffect(() => { if (session) api<{ transactions: Tx[] }>('/api/payments').then((r) => setHistory(r.transactions)).catch(() => setHistory([])); }, [session?.userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ transaction: { id: string } }>('/api/payments', { body: { planId: plan, channel } });
      router.push(`/app/checkout?tx=${r.transaction.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };
  const manual = info.payments === 'manual';
  const daysLeft = premium ? Math.ceil((ent.expiresAt! - now) / 86_400_000) : 0;
  const saving = Math.round((1 - PLANS.premium_monthly.price / BENCHMARK_MONTHLY) * 100);

  return (
    <div className="space-y-5">
      <PageHeader title="Paket Belajar" subtitle="Harga tetap, tanpa perpanjangan otomatis, tanpa biaya tersembunyi." />
      {premium ? (
        <Card className="flex flex-wrap items-center gap-3 border-2 border-accent">
          <Crown className="text-accent" size={28} aria-hidden />
          <div className="min-w-0 flex-1"><p className="text-lg font-extrabold">Premium aktif sampai {dateId(ent.expiresAt!)}</p><p className="text-sm text-muted">{daysLeft} hari lagi. Tidak ada tagihan otomatis: perpanjang sendiri kapan pun. Perpanjangan lebih awal ditambahkan setelah masa aktif sekarang berakhir.</p></div>
          {daysLeft <= 7 && <Badge tone="bad">Segera berakhir</Badge>}
        </Card>
      ) : (
        <Notice tone="muted" title="Kamu memakai paket Free">Saat Premium berakhir, akun kembali ke Free secara otomatis. Riwayat belajar, XP, beruntun, pencapaian, dan progres tetap tersimpan.</Notice>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-extrabold">Free</h2>
          <p className="mt-1 text-3xl font-extrabold">Rp0</p>
          <ul className="mt-4 space-y-2">{FREE_FEATURES.map((f) => <li key={f} className="flex gap-2 text-sm"><Check size={18} className="mt-0.5 shrink-0 text-ok" aria-hidden />{f}</li>)}</ul>
        </Card>
        <Card className="border-2 border-brand">
          <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-extrabold">Premium</h2><Badge tone="accent">±{saving}% di bawah patokan {rupiah(BENCHMARK_MONTHLY)}/bulan</Badge></div>
          <p className="mt-1 text-3xl font-extrabold">{rupiah(PLANS.premium_monthly.price)}<span className="text-base font-bold text-muted"> / bulan</span></p>
          <p className="text-sm text-muted">atau <span className="line-through">{rupiah(PLANS.premium_yearly.listPrice)}</span> <span className="font-bold text-ink">{rupiah(PLANS.premium_yearly.price)}</span> per tahun (diskon {PLANS.premium_yearly.discountPct}%)</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">{PREMIUM_FEATURES.map((f) => <li key={f} className="flex gap-2 text-sm"><Check size={18} className="mt-0.5 shrink-0 text-ok" aria-hidden />{f}</li>)}</ul>
        </Card>
      </div>

      <Card className="space-y-4">
        <h2 className="text-lg font-extrabold">{premium ? 'Perpanjang Premium' : 'Berlangganan Premium'}</h2>
        <fieldset>
          <legend className="mb-2 text-sm font-bold">1. Pilih paket</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.values(PLANS)).map((p) => (
              <label key={p.id} className={cx('flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3', plan === p.id ? 'border-brand bg-brand-soft' : 'border-line')}>
                <input type="radio" name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} className="h-5 w-5 accent-[var(--brand)]" />
                <span className="min-w-0 flex-1"><span className="block font-extrabold">{p.name}{p.discountPct > 0 && <Badge tone="ok" className="ml-2">Diskon {p.discountPct}%</Badge>}</span><span className="block text-sm text-muted">{p.note}</span></span>
                <span className="text-right">{p.listPrice && <span className="block text-sm text-muted line-through" aria-label={`Harga normal ${rupiah(p.listPrice)}`}>{rupiah(p.listPrice)}</span>}<span className="block font-extrabold">{rupiah(p.price)}</span></span>
              </label>
            ))}
          </div>
        </fieldset>
        {manual ? (
          <div>
            <p className="mb-2 text-sm font-bold">2. Metode pembayaran</p>
            <div className="flex items-center gap-3 rounded-2xl border-2 border-brand bg-brand-soft p-3">
              <QrCode size={22} className="text-brand" aria-hidden />
              <span><span className="block font-extrabold">QRIS</span><span className="block text-xs text-muted">Bayar dari aplikasi mobile banking atau e-wallet apa pun</span></span>
            </div>
          </div>
        ) : (
        <fieldset>
          <legend className="mb-2 text-sm font-bold">2. Pilih metode pembayaran</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {CHANNELS.map((c) => { const Icon = ICON[c.id]; return (
              <label key={c.id} className={cx('flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3', channel === c.id ? 'border-brand bg-brand-soft' : 'border-line')}>
                <input type="radio" name="channel" value={c.id} checked={channel === c.id} onChange={() => setChannel(c.id)} className="h-5 w-5 accent-[var(--brand)]" />
                <Icon size={22} className="text-brand" aria-hidden />
                <span><span className="block font-extrabold">{c.name}</span><span className="block text-xs text-muted">{c.desc}</span></span>
              </label>
            ); })}
          </div>
        </fieldset>
        )}
        {info.payments === 'mock' && <Notice tone="accent" title="Mode simulasi lokal">Server ini memakai simulator gerbang pembayaran. Tidak ada uang sungguhan yang berpindah.</Notice>}
        {info.payments === 'test' && <Notice tone="accent" title="Mode uji (sandbox Xendit)">Transaksi di mode ini tidak memindahkan uang sungguhan.</Notice>}
        {info.payments === 'off' && <Notice tone="bad" title="Pembayaran belum aktif">Server ini belum dikonfigurasi dengan gerbang pembayaran.</Notice>}
        {error && <p className="rounded-xl bg-bad-soft px-3 py-2 text-sm font-bold text-bad" role="alert">{error}</p>}
        {session ? (
          <Button full size="lg" disabled={busy || info.payments === 'off'} onClick={pay}>{busy ? 'Membuat pembayaran...' : `Bayar ${rupiah(PLANS[plan].price)} dengan ${manual ? 'QRIS' : CHANNELS.find((c) => c.id === channel)!.name}`}</Button>
        ) : (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface-2 p-3"><p className="min-w-0 flex-1 text-sm">Buat akun dulu supaya Premium terikat ke akunmu, bukan ke satu perangkat.</p><LinkButton href="/daftar" size="sm">Daftar</LinkButton><LinkButton href="/masuk" size="sm" variant="secondary">Masuk</LinkButton></div>
        )}
        <p className="text-xs text-muted">{manual
          ? 'Setelah membayar, laporkan pembayaranmu di halaman berikutnya. Premium aktif setelah pembayaran kami cocokkan dan konfirmasi. Kami tidak menyimpan data rekening atau e-wallet.'
          : 'Pembayaran diproses oleh Xendit. Kami tidak menyimpan data rekening atau e-wallet. Premium aktif otomatis setelah Xendit mengonfirmasi pembayaran ke server kami.'}</p>
      </Card>

      {session && (
        <Card>
          <h2 className="text-lg font-extrabold">Riwayat transaksi</h2>
          {!history ? <p className="mt-2 text-sm text-muted" role="status">Memuat...</p> : history.length === 0 ? <p className="mt-2 text-sm text-muted">Belum ada transaksi.</p> : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-muted"><tr><th className="py-2 pr-3">Tanggal</th><th className="py-2 pr-3">Paket</th><th className="py-2 pr-3">Metode</th><th className="py-2 pr-3 text-right">Nominal</th><th className="py-2 pr-3">Status</th><th className="py-2" /></tr></thead>
                <tbody>
                  {history.map((t) => (
                    <tr key={t.id} className="border-t border-line">
                      <td className="py-2 pr-3 whitespace-nowrap">{dateTimeId(t.created_at)}</td><td className="py-2 pr-3">{t.plan_name}</td><td className="py-2 pr-3">{t.channel === 'GOPAY' ? 'GoPay' : t.channel}</td><td className="py-2 pr-3 text-right font-bold">{rupiah(t.amount_idr)}</td>
                      <td className="py-2 pr-3"><Badge tone={STATUS[t.status]?.[1] ?? 'muted'}>{STATUS[t.status]?.[0] ?? t.status}</Badge></td>
                      <td className="py-2"><Link href={`/app/checkout?tx=${t.id}`} className="font-bold text-brand underline">{t.status === 'SUCCEEDED' ? 'Bukti' : 'Detail'}</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
