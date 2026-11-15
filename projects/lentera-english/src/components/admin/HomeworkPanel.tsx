'use client';
// "PR" tab (Rilis 4): homework across all learners, read from their synced
// progress and submission history (admin_homework_overview, migration 0010).
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BellRing, RefreshCw } from 'lucide-react';
import { ApiError } from '@/lib/client/api';
import { dayKey } from '@/lib/engine/mastery';
import { weekStart } from '@/lib/engine/plan';
import { BarChart } from '@/components/Charts';
import { Badge, Button, Notice, cx, dateTimeId } from '@/components/ui';
import { admin } from './api';
import { input } from './fields';
import type { Data } from './schema';

interface Overview {
  totals: { learners: number; assigned: number; submitted: number; open: number; overdue: number; late: number; avg_score: number | null; submissions_7d: number; reminder_devices: number; reminders_7d: number };
  by_homework: { id: string; assigned: number; submitted: number; overdue: number; late: number; avg_score: number | null }[];
  learners: { id: string; name: string; assigned: number; submitted: number; open: number; overdue: number; avg_score: number | null; last_submitted_at: string | null; reminders: boolean }[];
  weeks: { week: string; submissions: number; late: number; avg_score: number | null }[];
}

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : '–');
const th = 'py-2 pr-3 text-left';

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="mt-1 text-xl font-extrabold tabular-nums sm:text-2xl">{value}</p>
      {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
    </div>
  );
}

export function HomeworkPanel({ data: content, active }: { data: Data | null; active: boolean }) {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadedAt, setLoadedAt] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await admin<Overview>('homework'));
      setError(null);
      setLoadedAt(Date.now());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ringkasan PR gagal dimuat.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { if (active && !data && !loading && !error) void load(); }, [active, data, loading, error, load]);

  const titles = useMemo(() => new Map((content?.homework ?? []).map((h) => [String(h.id), String(h.title)])), [content]);
  const title = (id: string) => (id === 'hw.week' ? 'PR Mingguan (semua minggu)' : titles.get(id) ?? id);
  const learners = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.learners ?? []).filter((l) => !q || l.name.toLowerCase().includes(q));
  }, [data, query]);

  if (!data) {
    return error
      ? <Notice tone="bad" title="Ringkasan PR gagal dimuat"><p>{error}</p><Button size="sm" className="mt-2" onClick={() => void load()}>Coba lagi</Button></Notice>
      : <p className="py-10 text-center font-bold text-muted" role="status">Memuat ringkasan PR...</p>;
  }
  const t = data.totals;
  // The last 8 weeks (Monday to Sunday), empty ones included, so the trend reads at a glance.
  const counts = new Map(data.weeks.map((w) => [w.week, Number(w.submissions)]));
  const monday = weekStart(loadedAt ?? Date.now());
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const key = dayKey(monday - (7 - i) * 7 * 24 * 3600 * 1000 + 12 * 3600 * 1000);
    return { label: `${key.slice(8)}/${key.slice(5, 7)}`, title: `Minggu mulai ${key}`, value: counts.get(key) ?? 0 };
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <p className="mr-auto text-sm text-muted" role="status">{loadedAt ? `Data per ${dateTimeId(loadedAt)} · dari kemajuan yang sudah disinkronkan perangkat pelajar` : ''}</p>
        <Button size="sm" variant="secondary" onClick={() => void load()} disabled={loading}><RefreshCw size={16} className={cx(loading && 'animate-spin')} aria-hidden />{loading ? 'Memuat...' : 'Muat ulang'}</Button>
      </div>
      {error && <Notice tone="bad" title="Gagal memuat ulang">{error}</Notice>}

      <section>
        <h2 className="text-lg font-extrabold">Ringkasan</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile label="Pelajar dengan PR" value={t.learners.toLocaleString('id-ID')} />
          <Tile label="PR dikumpulkan" value={`${t.submitted.toLocaleString('id-ID')} / ${t.assigned.toLocaleString('id-ID')}`} note={`${pct(t.submitted, t.assigned)} dari PR yang diberikan`} />
          <Tile label="Lewat tenggat" value={t.overdue.toLocaleString('id-ID')} note={`${t.open.toLocaleString('id-ID')} lainnya masih berjalan`} />
          <Tile label="Nilai rata-rata" value={t.avg_score === null ? '–' : `${t.avg_score}%`} note={`${t.late.toLocaleString('id-ID')} dikumpulkan terlambat`} />
          <Tile label="Pengumpulan 7 hari" value={t.submissions_7d.toLocaleString('id-ID')} />
          <Tile label="HP dengan pengingat" value={t.reminder_devices.toLocaleString('id-ID')} note={`${t.reminders_7d.toLocaleString('id-ID')} pengingat terkirim 7 hari terakhir`} />
        </div>
      </section>

      {data.weeks.length > 0 && <BarChart title="Pengumpulan PR per minggu" subtitle="8 minggu terakhir, waktu Jakarta" unit="Pengumpulan" column="Minggu" data={weeks} />}

      <section>
        <h2 className="text-lg font-extrabold">Per PR</h2>
        <p className="text-sm text-muted">Diurutkan dari yang paling banyak diberikan. PR mingguan digabung jadi satu baris.</p>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b border-line text-muted"><tr><th className={cx(th, 'pl-4')}>PR</th><th className={th}>Diberikan</th><th className={th}>Dikumpulkan</th><th className={th}>Lewat tenggat</th><th className={th}>Terlambat</th><th className={th}>Rata-rata</th></tr></thead>
            <tbody>
              {data.by_homework.map((h) => (
                <tr key={h.id} className="border-b border-line last:border-0">
                  <td className="py-2 pl-4 pr-3 font-bold">{title(h.id)}</td>
                  <td className="py-2 pr-3 tabular-nums">{h.assigned}</td>
                  <td className="py-2 pr-3 tabular-nums">{h.submitted} <span className="text-muted">({pct(h.submitted, h.assigned)})</span></td>
                  <td className="py-2 pr-3 tabular-nums">{h.overdue ? <Badge tone="bad">{h.overdue}</Badge> : 0}</td>
                  <td className="py-2 pr-3 tabular-nums">{h.late}</td>
                  <td className="py-2 pr-3 tabular-nums">{h.avg_score === null ? '–' : `${h.avg_score}%`}</td>
                </tr>
              ))}
              {!data.by_homework.length && <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">Belum ada PR yang tersinkron dari perangkat pelajar.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-extrabold">Per pelajar</h2>
        <p className="text-sm text-muted">Yang paling banyak lewat tenggat di atas.</p>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama pelajar" aria-label="Cari nama pelajar" className={cx(input, 'mt-3 max-w-sm')} />
        <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-line text-muted"><tr><th className={cx(th, 'pl-4')}>Pelajar</th><th className={th}>Dikumpulkan</th><th className={th}>Berjalan</th><th className={th}>Lewat tenggat</th><th className={th}>Rata-rata</th><th className={th}>Terakhir mengumpulkan</th></tr></thead>
            <tbody>
              {learners.map((l) => (
                <tr key={l.id} className="border-b border-line last:border-0">
                  <td className="py-2 pl-4 pr-3 font-bold">{l.name}{l.reminders && <BellRing size={14} className="ml-1 inline text-ok" aria-label="pengingat aktif" />}</td>
                  <td className="py-2 pr-3 tabular-nums">{l.submitted} / {l.assigned}</td>
                  <td className="py-2 pr-3 tabular-nums">{l.open}</td>
                  <td className="py-2 pr-3 tabular-nums">{l.overdue ? <Badge tone="bad">{l.overdue}</Badge> : 0}</td>
                  <td className="py-2 pr-3 tabular-nums">{l.avg_score === null ? '–' : `${l.avg_score}%`}</td>
                  <td className="py-2 pr-3">{l.last_submitted_at ? dateTimeId(l.last_submitted_at) : '–'}</td>
                </tr>
              ))}
              {!learners.length && <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">{query ? 'Tidak ada nama yang cocok.' : 'Belum ada pelajar dengan PR.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
