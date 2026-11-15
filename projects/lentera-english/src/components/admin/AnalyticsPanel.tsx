'use client';
// Owner analytics (Rilis 9): signups through the funnel to Premium, by weekly
// cohort, plus active learners and revenue. Everything is counted in the
// database (admin_analytics); admin accounts are left out.
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { BarChart, type Point } from '@/components/Charts';
import { Button, Card, Notice, cx, rupiah } from '@/components/ui';
import { admin } from './api';

interface Funnel { signed_up: number; placement: number; first_lesson: number; week1_eligible: number; week1: number; premium: number }
interface Cohort { week: string; signed_up: number; placement: number; first_lesson: number; week1_eligible: number; week1: number; premium: number }
export interface Analytics {
  funnel: Funnel;
  all_time: { signed_up: number; premium: number };
  cohorts: Cohort[];
  active: { day: number; week: number; month: number };
  signups_30d: { day: string; n: number }[];
  revenue: { month: string; amount: number; payments: number }[];
}

const pct = (n: number, d: number) => (d > 0 ? `${Math.round((n / d) * 100)}%` : '–');
const shortDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function AnalyticsPanel({ active }: { active: boolean }) {
  const [weeks, setWeeks] = useState(12);
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async (w = weeks) => {
    setLoading(true);
    setError(null);
    try {
      setData(await admin<Analytics>('analytics', { weeks: w }));
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };
  useEffect(() => { if (active && !data && !loading) void load(); }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <Notice tone="bad" title="Analitik gagal dimuat"><p>{error}</p><Button size="sm" className="mt-2" onClick={() => void load()}>Coba lagi</Button></Notice>;
  if (!data) return <p className="py-10 text-center font-bold text-muted" role="status">Memuat analitik...</p>;

  const f = data.funnel;
  const steps: { label: string; hint: string; n: number; base: number; prev: number }[] = [
    { label: 'Mendaftar', hint: 'Akun pelajar baru', n: f.signed_up, base: f.signed_up, prev: f.signed_up },
    { label: 'Ikut tes penempatan', hint: 'Level awal tersimpan', n: f.placement, base: f.signed_up, prev: f.signed_up },
    { label: 'Menyelesaikan pelajaran pertama', hint: 'Minimal satu pelajaran tuntas', n: f.first_lesson, base: f.signed_up, prev: f.placement },
    { label: 'Bertahan seminggu', hint: `Kembali belajar di hari ke-7 sampai 13 (dari ${f.week1_eligible} akun yang sudah berumur 2 minggu)`, n: f.week1, base: f.week1_eligible, prev: f.week1_eligible },
    { label: 'Membeli Premium', hint: 'Pernah membayar Premium', n: f.premium, base: f.signed_up, prev: f.first_lesson },
  ];
  const signups: Point[] = data.signups_30d.map((d) => ({ label: String(new Date(`${d.day}T00:00:00`).getDate()), title: shortDate(d.day), value: d.n }));
  const revenue: Point[] = data.revenue.map((r) => ({ label: MONTHS[Number(r.month.slice(5)) - 1], title: `${MONTHS[Number(r.month.slice(5)) - 1]} ${r.month.slice(0, 4)}`, value: r.amount }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-xl font-extrabold">Analitik pelajar</h2>
        <div className="flex gap-1" role="radiogroup" aria-label="Rentang pendaftaran">
          {[4, 12, 26].map((w) => <Button key={w} size="sm" role="radio" aria-checked={weeks === w} variant={weeks === w ? 'primary' : 'secondary'} onClick={() => { setWeeks(w); void load(w); }}>{w} minggu</Button>)}
        </div>
        <Button size="sm" variant="ghost" onClick={() => void load()} disabled={loading} aria-label="Muat ulang analitik"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden /></Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4"><p className="text-sm font-bold text-muted">Aktif hari ini</p><p className="text-2xl font-extrabold">{data.active.day}</p></Card>
        <Card className="p-4"><p className="text-sm font-bold text-muted">Aktif 7 hari</p><p className="text-2xl font-extrabold">{data.active.week}</p></Card>
        <Card className="p-4"><p className="text-sm font-bold text-muted">Aktif 30 hari</p><p className="text-2xl font-extrabold">{data.active.month}</p></Card>
        <Card className="p-4"><p className="text-sm font-bold text-muted">Total pelajar</p><p className="text-2xl font-extrabold">{data.all_time.signed_up}</p><p className="text-xs text-muted">{data.all_time.premium} pernah Premium ({pct(data.all_time.premium, data.all_time.signed_up)})</p></Card>
      </div>

      <Card className="space-y-3">
        <div>
          <h3 className="font-extrabold">Corong pelajar · pendaftar {weeks} minggu terakhir</h3>
          <p className="text-sm text-muted">Persen dihitung dari semua pendaftar di rentang ini; angka kecil menunjukkan persen dari langkah sebelumnya.</p>
        </div>
        <ol className="space-y-3" aria-label="Corong pelajar">
          {steps.map((s, i) => (
            <li key={s.label}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="font-bold">{i + 1}. {s.label}</span>
                <span className="font-extrabold tabular-nums">{s.n} <span className="text-muted">· {pct(s.n, s.base)}</span>{i > 0 && <span className="ml-1 text-xs text-muted">({pct(s.n, s.prev)} dari langkah sebelumnya)</span>}</span>
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-surface-2" role="img" aria-label={`${s.label}: ${s.n} (${pct(s.n, s.base)})`}>
                <div className={cx('h-full rounded-full', i === steps.length - 1 ? 'bg-ok' : 'bg-brand')} style={{ width: s.base ? `${Math.max(2, (s.n / s.base) * 100)}%` : '0%' }} />
              </div>
              <p className="mt-0.5 text-xs text-muted">{s.hint}</p>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="px-4 pt-4 text-left font-extrabold">Kohort mingguan (minggu mendaftar, WIB)</caption>
          <thead className="text-xs uppercase text-muted"><tr><th className="px-4 py-2">Minggu</th><th className="px-2 py-2 text-right">Daftar</th><th className="px-2 py-2 text-right">Tes</th><th className="px-2 py-2 text-right">Pelajaran 1</th><th className="px-2 py-2 text-right">Bertahan 1 minggu</th><th className="px-4 py-2 text-right">Premium</th></tr></thead>
          <tbody>
            {data.cohorts.length === 0 && <tr><td colSpan={6} className="px-4 py-4 text-center text-muted">Belum ada pendaftar di rentang ini.</td></tr>}
            {data.cohorts.map((c) => (
              <tr key={c.week} className="border-t border-line">
                <td className="px-4 py-2 font-bold">{shortDate(c.week)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{c.signed_up}</td>
                <td className="px-2 py-2 text-right tabular-nums">{pct(c.placement, c.signed_up)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{pct(c.first_lesson, c.signed_up)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{c.week1_eligible ? pct(c.week1, c.week1_eligible) : <span className="text-muted">belum bisa diukur</span>}</td>
                <td className="px-4 py-2 text-right tabular-nums">{pct(c.premium, c.signed_up)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {signups.length > 0 && <BarChart title="Pendaftar per hari" subtitle="30 hari terakhir" unit="Pendaftar" column="Tanggal" data={signups} />}
        {revenue.length > 0 && <BarChart title="Pendapatan per bulan" subtitle="Pembayaran berhasil, 12 bulan terakhir" unit="Rupiah" column="Bulan" data={revenue} format={{ axis: (v) => (v >= 1_000_000 ? `${(v / 1_000_000).toLocaleString('id-ID')}jt` : `${Math.round(v / 1000)}rb`), value: (v) => rupiah(v) }} />}
      </div>
    </div>
  );
}
