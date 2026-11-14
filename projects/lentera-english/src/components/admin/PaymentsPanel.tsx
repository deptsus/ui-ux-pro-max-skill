'use client';
// Payment dashboard. Everything shown comes from admin_payment_overview()
// (see supabase/migrations/0004_payments.sql); nothing is computed from
// client-side guesses.
import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Hourglass, RefreshCw, XCircle } from 'lucide-react';
import { BarChart } from '@/components/Charts';
import { Badge, Button, Card, Notice, cx } from '@/components/ui';
import { compactId, dateId, dateTimeId, rupiah } from '@/lib/format';
import { PLANS } from '@/lib/plans';
import { admin } from './api';
import { Confirm } from './Confirm';
import { input } from './fields';

export interface Overview {
  users: { total: number; premium: number; free: number };
  transactions: { succeeded: number; pending: number; awaiting: number; failed: number; needs_review: number };
  queue: QueueItem[];
  revenue: { month: number; year: number; by_month: { month: string; total: number; count: number }[] };
  history: { id: string; reference_id: string; user: string; user_id: string; plan_id: string; amount_idr: number; channel: string; method: string; status: string; failure_code: string | null; created_at: string; paid_at: string | null; payer_name: string | null; claimed_at: string | null; review_note: string | null; reviewed_at: string | null; reviewer: string | null }[];
  subscribers: { user_id: string; user: string; plan_id: string; starts_at: string; expires_at: string }[];
  webhooks: { last_received_at: string | null; last_24h: Record<string, number>; log: { id: number; event_key: string; source: string; event_type: string; reference_id: string | null; outcome: string | null; detail: string | null; duplicates: number; received_at: string }[] };
}

type Tone = 'ok' | 'bad' | 'accent' | 'muted' | 'brand';
export interface QueueItem { id: string; reference_id: string; user: string; user_id: string; plan_id: string; amount_idr: number; status: string; payer_name: string | null; payer_note: string | null; claimed_at: string | null; created_at: string; expires_at: string | null }

const STATUS: Record<string, [string, Tone]> = { SUCCEEDED: ['Berhasil', 'ok'], AWAITING_CONFIRMATION: ['Menunggu konfirmasi', 'accent'], PENDING: ['Menunggu pembayaran', 'accent'], FAILED: ['Gagal', 'bad'], EXPIRED: ['Kedaluwarsa', 'muted'], CANCELED: ['Dibatalkan', 'muted'], NEEDS_REVIEW: ['Perlu ditinjau', 'bad'] };
const OUTCOME: Record<string, [string, Tone]> = {
  activated: ['Premium diaktifkan', 'ok'], rejected: ['Ditolak', 'bad'], already_processed: ['Sudah diproses', 'muted'], duplicate: ['Duplikat', 'muted'], ignored: ['Diabaikan', 'muted'],
  pending: ['Menunggu', 'accent'], failed: ['Gagal', 'bad'], expired: ['Kedaluwarsa', 'muted'], canceled: ['Dibatalkan', 'muted'],
  needs_review: ['Perlu ditinjau', 'bad'], amount_mismatch: ['Nominal tidak cocok', 'bad'], channel_mismatch: ['Metode tidak cocok', 'bad'], request_mismatch: ['ID gateway tidak cocok', 'bad'], unknown_reference: ['Referensi tidak dikenal', 'bad'],
};
const planName = (id: string) => (PLANS as Record<string, { name: string }>)[id]?.name ?? id;
const channelName = (c: string) => (c === 'GOPAY' ? 'GoPay' : c);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS_LONG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

/** The last 12 calendar months in Jakarta time (the server groups by the same zone), oldest first. */
function lastMonths(now: number): string[] {
  const [y, m] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' }).format(now).split('-').map(Number);
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (11 - i), 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  });
}

function Tile({ label, value, note, icon }: { label: string; value: string; note?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="flex items-center gap-1.5 text-sm font-bold text-muted">{icon}{label}</p>
      <p className="mt-1 break-words text-xl font-extrabold tabular-nums sm:text-2xl">{value}</p>
      {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
    </div>
  );
}

function Section({ id, title, subtitle, children }: { id?: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-lg font-extrabold">{title}</h2>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

const th = 'py-2 pr-3 text-left';
const td = 'py-2 pr-3 align-top';
function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-3 flex items-center justify-between gap-2">
      <Button size="sm" variant="secondary" disabled={page === 0} onClick={() => onPage(page - 1)}>Sebelumnya</Button>
      <span className="text-sm text-muted">Halaman {page + 1} dari {pages}</span>
      <Button size="sm" variant="secondary" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>Berikutnya</Button>
    </div>
  );
}

/** Manual QRIS: payments reported by learners, waiting for the admin to match them in the merchant app. */
function ConfirmationQueue({ queue, reload }: { queue: QueueItem[]; reload: () => void }) {
  const [ask, setAsk] = useState<{ kind: 'confirm' | 'reject'; item: QueueItem } | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const run = async () => {
    if (!ask) return;
    setBusy(true);
    setError(null);
    try {
      if (ask.kind === 'confirm') await admin('confirm-payment', { id: ask.item.id });
      else await admin('reject-payment', { id: ask.item.id, reason });
      setDone(ask.kind === 'confirm' ? `Premium ${ask.item.user} aktif (${ask.item.reference_id}).` : `Pembayaran ${ask.item.reference_id} ditolak. Pelajar melihat alasannya di halaman pembayaran.`);
      setAsk(null);
      setReason('');
      reload();
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  };
  const reported = queue.filter((q) => q.status === 'AWAITING_CONFIRMATION');
  const unreported = queue.filter((q) => q.status !== 'AWAITING_CONFIRMATION');
  const row = (q: QueueItem) => (
    <li key={q.id} className="flex flex-wrap items-start gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-extrabold">{q.user} · {planName(q.plan_id)} · <span className="tabular-nums">{rupiah(q.amount_idr)}</span></p>
        {q.payer_name ? <p className="text-sm"><span className="text-muted">Nama pembayar: </span><span className="font-bold">{q.payer_name}</span></p> : <p className="text-sm text-muted">Pelajar belum menekan "Saya sudah bayar".</p>}
        {q.payer_note && <p className="text-sm"><span className="text-muted">Catatan: </span>{q.payer_note}</p>}
        <p className="text-xs text-muted">{q.claimed_at ? `Dilaporkan ${dateTimeId(q.claimed_at)}` : `Dibuat ${dateTimeId(q.created_at)}`} · <span className="font-mono">{q.reference_id}</span></p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button size="sm" variant="success" onClick={() => { setDone(null); setAsk({ kind: 'confirm', item: q }); }}>Konfirmasi</Button>
        <Button size="sm" variant="ghost" className="text-bad" onClick={() => { setDone(null); setAsk({ kind: 'reject', item: q }); }}>Tolak</Button>
      </div>
    </li>
  );
  return (
    <Section id="antrean-konfirmasi" title="Menunggu konfirmasi" subtitle="Cocokkan dengan mutasi di aplikasi merchant QRIS (DANA Bisnis) sebelum mengonfirmasi. Konfirmasi langsung mengaktifkan Premium.">
      {done && <Notice tone="ok" title="Tersimpan">{done}</Notice>}
      <Card className="mt-3">
        {queue.length === 0 ? <p className="text-sm text-muted">Tidak ada pembayaran yang menunggu.</p> : (
          <>
            {reported.length > 0 && <><h3 className="flex items-center gap-2 font-extrabold"><Hourglass size={16} className="text-accent-strong" aria-hidden />Sudah dilaporkan pelajar ({reported.length})</h3><ul className="divide-y divide-line">{reported.map(row)}</ul></>}
            {unreported.length > 0 && <details className={reported.length ? 'mt-4' : ''} open={reported.length === 0}><summary className="cursor-pointer font-extrabold">Belum dilaporkan ({unreported.length})</summary><p className="mt-1 text-sm text-muted">Checkout yang dibuka tetapi belum dilaporkan. Otomatis ditutup setelah 24 jam; tetap bisa dikonfirmasi bila uangnya ternyata masuk.</p><ul className="divide-y divide-line">{unreported.map(row)}</ul></details>}
          </>
        )}
      </Card>
      <Confirm open={ask?.kind === 'confirm'} tone="success" title="Konfirmasi pembayaran?" confirmLabel="Ya, aktifkan Premium" busy={busy} onCancel={() => setAsk(null)} onConfirm={run}>
        {ask && <>
          <p className="font-bold text-ink">{ask.item.user} · {planName(ask.item.plan_id)} · {rupiah(ask.item.amount_idr)}</p>
          <p>Pastikan dana {rupiah(ask.item.amount_idr)}{ask.item.payer_name ? ` atas nama ${ask.item.payer_name}` : ''} sudah masuk di aplikasi merchant QRIS. Premium langsung aktif dan tidak bisa dibatalkan dari dashboard ini.</p>
        </>}
        {error && <p className="font-bold text-bad" role="alert">{error}</p>}
      </Confirm>
      <Confirm open={ask?.kind === 'reject'} title="Tolak pembayaran?" confirmLabel="Tolak pembayaran" busy={busy} confirmDisabled={!reason.trim()} onCancel={() => setAsk(null)} onConfirm={run}>
        {ask && <p className="font-bold text-ink">{ask.item.user} · {rupiah(ask.item.amount_idr)} · {ask.item.reference_id}</p>}
        <label className="block text-sm font-bold text-ink">Alasan (ditampilkan ke pelajar)
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={300} className={`${input} mt-1`} placeholder="mis. Tidak ada dana masuk atas nama ini pada tanggal tersebut." />
        </label>
        {error && <p className="font-bold text-bad" role="alert">{error}</p>}
      </Confirm>
    </Section>
  );
}

export function PaymentsPanel({ data, loadedAt, loading, error, reload, payments }: { data: Overview | null; loadedAt: number | null; loading: boolean; error: string | null; reload: () => void; payments: 'manual' | 'live' | 'test' | 'mock' | 'off' }) {
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [logPage, setLogPage] = useState(0);

  const months = useMemo(() => {
    if (!data || !loadedAt) return [];
    const totals = new Map(data.revenue.by_month.map((m) => [m.month, m]));
    return lastMonths(loadedAt).map((key) => {
      const [y, m] = key.split('-').map(Number);
      return { label: MONTHS[m - 1], title: `${MONTHS_LONG[m - 1]} ${y}`, value: Number(totals.get(key)?.total ?? 0) };
    });
  }, [data, loadedAt]);
  const history = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.history ?? []).filter((t) => (!status || t.status === status) && (!q || `${t.reference_id} ${t.user}`.toLowerCase().includes(q)));
  }, [data, status, query]);

  if (!data) {
    return error
      ? <Notice tone="bad" title="Data pembayaran gagal dimuat"><p>{error}</p><Button size="sm" className="mt-2" onClick={reload}>Coba lagi</Button></Notice>
      : <p className="py-10 text-center font-bold text-muted" role="status">Memuat data pembayaran...</p>;
  }
  const { users, transactions: tx, revenue, subscribers, webhooks } = data;
  const now = loadedAt ?? 0;
  const PER = 20;
  const pages = Math.max(1, Math.ceil(history.length / PER));
  const p = Math.min(page, pages - 1);
  const logPages = Math.max(1, Math.ceil(webhooks.log.length / PER));
  const lp = Math.min(logPage, logPages - 1);
  const share = users.total ? Math.round((users.premium / users.total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <p className="mr-auto text-sm text-muted" role="status">{loadedAt ? `Data per ${dateTimeId(loadedAt)}` : ''}</p>
        <Button size="sm" variant="secondary" onClick={reload} disabled={loading}><RefreshCw size={16} className={cx(loading && 'animate-spin')} aria-hidden />{loading ? 'Memuat...' : 'Muat ulang'}</Button>
      </div>
      {error && <Notice tone="bad" title="Gagal memuat ulang">{error}</Notice>}
      {payments === 'mock' && <Notice tone="accent" title="Mode simulasi lokal">Server ini memakai simulator gerbang pembayaran. Angka di bawah berasal dari transaksi simulasi, bukan uang sungguhan.</Notice>}
      {payments === 'test' && <Notice tone="accent" title="Mode uji (sandbox Xendit)">Transaksi di mode ini tidak memindahkan uang sungguhan.</Notice>}
      {payments === 'off' && <Notice tone="muted" title="Pembayaran belum aktif">Server ini belum dikonfigurasi dengan gerbang pembayaran, jadi belum ada transaksi baru yang bisa masuk.</Notice>}
      {(payments === 'manual' || data.queue.length > 0) && <ConfirmationQueue queue={data.queue} reload={reload} />}
      {tx.needs_review > 0 && (
        <Notice tone="bad" title={`${tx.needs_review} transaksi perlu ditinjau`}>
          Nominal, metode, atau ID gateway tidak cocok dengan pesanan, sehingga Premium tidak diaktifkan. Periksa transaksinya di dashboard Xendit. Aktivasi manual atau pencatatan refund belum tersedia di dashboard ini.
        </Notice>
      )}

      <Section title="Pengguna">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Tile label="Total pengguna terdaftar" value={users.total.toLocaleString('id-ID')} />
          <Tile label="Free" value={users.free.toLocaleString('id-ID')} />
          <Tile label="Premium aktif" value={users.premium.toLocaleString('id-ID')} note={users.total ? `${share}% dari pengguna terdaftar` : undefined} />
        </div>
      </Section>

      <Section title="Pendapatan" subtitle="Hanya transaksi berhasil, dihitung dalam waktu Jakarta.">
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <Tile label="Bulan ini" value={rupiah(Number(revenue.month))} />
            <Tile label="Tahun ini" value={rupiah(Number(revenue.year))} />
          </div>
          <BarChart title="Pendapatan per bulan" subtitle="12 bulan terakhir, dalam rupiah" unit="Rupiah" column="Bulan" data={months} format={{ axis: compactId, value: rupiah }} />
        </div>
      </Section>

      <Section title="Transaksi" subtitle="Jumlah sejak awal, menurut status terakhir.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Tile label="Menunggu konfirmasi" value={String(tx.awaiting)} icon={<Hourglass size={16} className="text-accent-strong" aria-hidden />} />
          <Tile label="Berhasil" value={String(tx.succeeded)} icon={<CheckCircle2 size={16} className="text-ok" aria-hidden />} />
          <Tile label="Tertunda" value={String(tx.pending)} icon={<Clock size={16} className="text-accent-strong" aria-hidden />} />
          <Tile label="Gagal" value={String(tx.failed)} note="Termasuk kedaluwarsa dan dibatalkan" icon={<XCircle size={16} className="text-bad" aria-hidden />} />
          <Tile label="Perlu ditinjau" value={String(tx.needs_review)} icon={<AlertTriangle size={16} className="text-bad" aria-hidden />} />
        </div>
      </Section>

      <Section title="Riwayat pembayaran" subtitle="Paling banyak 200 transaksi terbaru.">
        <Card>
          <div className="flex flex-wrap gap-2">
            <label className="min-w-48 flex-1"><span className="mb-1 block text-xs font-bold text-muted">Cari referensi atau nama</span><input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} className={input} /></label>
            <label className="min-w-44"><span className="mb-1 block text-xs font-bold text-muted">Status</span>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} className={input}>
                <option value="">Semua status</option>
                {Object.entries(STATUS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </label>
          </div>
          {history.length === 0 ? <p className="mt-4 text-sm text-muted">{data.history.length === 0 ? 'Belum ada transaksi.' : 'Tidak ada transaksi yang cocok dengan filter.'}</p> : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[46rem] text-sm">
                <thead className="text-xs uppercase text-muted"><tr><th className={th}>Dibuat</th><th className={th}>Pengguna</th><th className={th}>Paket</th><th className={th}>Metode</th><th className="py-2 pr-3 text-right">Nominal</th><th className={th}>Status</th><th className={th}>Dibayar</th></tr></thead>
                <tbody>
                  {history.slice(p * PER, p * PER + PER).map((t) => (
                    <tr key={t.id} className="border-t border-line">
                      <td className={cx(td, 'whitespace-nowrap')}>{dateTimeId(t.created_at)}</td>
                      <td className={td}><span className="font-bold">{t.user}</span><span className="block font-mono text-xs text-muted">{t.reference_id}</span></td>
                      <td className={td}>{planName(t.plan_id)}</td>
                      <td className={td}>{t.method === 'manual_qris' ? 'QRIS' : channelName(t.channel)}{t.payer_name && <span className="block text-xs text-muted">a.n. {t.payer_name}</span>}</td>
                      <td className="py-2 pr-3 text-right align-top font-bold tabular-nums">{rupiah(t.amount_idr)}</td>
                      <td className={td}>{t.failure_code === 'REJECTED' ? <Badge tone="bad">Ditolak</Badge> : <Badge tone={STATUS[t.status]?.[1] ?? 'muted'}>{STATUS[t.status]?.[0] ?? t.status}</Badge>}
                        {t.review_note && <span className="mt-0.5 block text-xs text-muted">{t.review_note}</span>}
                        {t.reviewer && <span className="mt-0.5 block text-xs text-muted">oleh {t.reviewer}</span>}
                        {t.failure_code && t.failure_code !== 'REJECTED' && <span className="mt-0.5 block font-mono text-xs text-muted">{t.failure_code}</span>}</td>
                      <td className={cx(td, 'whitespace-nowrap')}>{t.paid_at ? dateTimeId(t.paid_at) : <span className="text-muted">Belum</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pager page={p} pages={pages} onPage={setPage} />
        </Card>
      </Section>

      <Section title="Masa aktif Premium" subtitle="Pelanggan yang masih aktif, diurutkan dari yang paling cepat berakhir.">
        <Card>
          {subscribers.length === 0 ? <p className="text-sm text-muted">Belum ada pelanggan Premium aktif.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-sm">
                <thead className="text-xs uppercase text-muted"><tr><th className={th}>Pengguna</th><th className={th}>Paket</th><th className={th}>Mulai</th><th className={th}>Berakhir</th><th className="py-2 text-right">Sisa</th></tr></thead>
                <tbody>
                  {subscribers.map((s) => {
                    const days = Math.max(0, Math.ceil((new Date(s.expires_at).getTime() - now) / 86_400_000));
                    return (
                      <tr key={s.user_id} className="border-t border-line">
                        <td className={cx(td, 'font-bold')}>{s.user}</td><td className={td}>{planName(s.plan_id)}</td><td className={cx(td, 'whitespace-nowrap')}>{dateId(s.starts_at)}</td><td className={cx(td, 'whitespace-nowrap')}>{dateId(s.expires_at)}</td>
                        <td className="py-2 text-right align-top"><span className="tabular-nums">{days} hari</span>{days <= 7 && <Badge tone="bad" className="ml-2">Segera berakhir</Badge>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </Section>

      <Section title="Log pembayaran" subtitle={payments === 'manual' ? 'Keputusan admin atas pembayaran QRIS. Notifikasi Xendit hanya muncul bila Xendit diaktifkan.' : 'Notifikasi dari Xendit, pengecekan status oleh server, dan keputusan admin.'}>
        {payments !== 'manual' && <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <Tile label="Webhook terakhir diterima" value={webhooks.last_received_at ? dateTimeId(webhooks.last_received_at) : 'Belum pernah'} note={webhooks.last_received_at ? undefined : 'Belum ada webhook yang masuk ke server ini.'} />
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-sm font-bold text-muted">Hasil 24 jam terakhir</p>
            {Object.keys(webhooks.last_24h).length === 0 ? <p className="mt-2 text-sm text-muted">Tidak ada event dalam 24 jam terakhir.</p> : (
              <ul className="mt-2 flex flex-wrap gap-2">{Object.entries(webhooks.last_24h).map(([k, n]) => <li key={k}><Badge tone={OUTCOME[k]?.[1] ?? 'muted'}>{OUTCOME[k]?.[0] ?? k}: {n}</Badge></li>)}</ul>
            )}
          </div>
        </div>}
        <Card>
          <h3 className="font-extrabold">Log event</h3>
          <p className="text-sm text-muted">Paling banyak 200 event terbaru. Data pembayar dari payload tidak disimpan.</p>
          {webhooks.log.length === 0 ? <p className="mt-3 text-sm text-muted">Belum ada event.</p> : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[44rem] text-sm">
                <thead className="text-xs uppercase text-muted"><tr><th className={th}>Diterima</th><th className={th}>Sumber</th><th className={th}>Event</th><th className={th}>Referensi</th><th className={th}>Hasil</th><th className="py-2 text-right">Duplikat</th></tr></thead>
                <tbody>
                  {webhooks.log.slice(lp * PER, lp * PER + PER).map((e) => (
                    <tr key={e.id} className="border-t border-line">
                      <td className={cx(td, 'whitespace-nowrap')}>{dateTimeId(e.received_at)}</td>
                      <td className={td}>{e.source === 'webhook' ? 'Webhook' : e.source === 'admin' ? 'Admin' : 'Cek status'}</td>
                      <td className={cx(td, 'font-mono text-xs')}>{e.event_type}</td>
                      <td className={cx(td, 'font-mono text-xs')}>{e.reference_id ?? '-'}</td>
                      <td className={td}>{e.outcome ? <Badge tone={OUTCOME[e.outcome]?.[1] ?? 'muted'}>{OUTCOME[e.outcome]?.[0] ?? e.outcome}</Badge> : <span className="text-muted">-</span>}{e.detail && <span className="mt-0.5 block text-xs text-muted">{e.detail}</span>}</td>
                      <td className="py-2 text-right align-top tabular-nums">{e.duplicates}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pager page={lp} pages={logPages} onPage={setLogPage} />
        </Card>
      </Section>
    </div>
  );
}
