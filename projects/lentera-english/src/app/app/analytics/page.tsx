'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Crown } from 'lucide-react';
import { dailySeries, overview, topicRows } from '@/lib/engine/analytics';
import { useApp } from '@/lib/client/hooks';
import { BarChart, LineChart, MasteryBar } from '@/components/Charts';
import { Badge, Card, Empty, LinkButton, ListGroup, ListRow, PageHeader, Segmented, StatRow, dateId } from '@/components/ui';

const STAGE: Record<string, string> = { new: 'Belum dimulai', learning: 'Dipelajari', practicing: 'Berlatih', provisional: 'Menunggu tes ulang', mastered: 'Dikuasai', 'needs-review': 'Perlu diulang' };
const CTX: Record<string, string> = { guided: 'Latihan terbimbing', independent: 'Latihan mandiri', homework: 'PR', mastery: 'Tes penguasaan', drill: 'Latihan perbaikan', review: 'Ulangan', retest: 'Tes ulang', exam: 'Ujian', timed: 'Tantangan kilat', listening: 'Menyimak', placement: 'Tes penempatan' };

export default function AnalyticsPage() {
  const { ix, learner, now, premium } = useApp();
  const o = overview(learner, ix, now);
  // Free: the last 7 days. Premium: 7 or 14 days.
  const [period, setPeriod] = useState<'7' | '14'>(premium ? '14' : '7');
  const days = premium ? Number(period) : 7;
  const series = dailySeries(learner, now, days);
  const full = (day: string) => dateId(day + 'T12:00:00', { weekday: 'short', day: 'numeric', month: 'short' });
  const rows = topicRows(learner, ix);
  if (o.exercises === 0) return <div><PageHeader title="Analitik Belajar" /><Empty title="Belum ada data" action={<LinkButton href="/app/path">Mulai belajar</LinkButton>}>Kerjakan beberapa latihan dulu. Semua angka di halaman ini dihitung dari aktivitasmu sendiri.</Empty></div>;

  const stats = [
    { label: 'Soal dikerjakan', value: o.exercises.toLocaleString('id-ID'), hint: `ketepatan ${o.accuracy}%` },
    { label: 'Waktu belajar', value: `${o.minutes} mnt`, hint: `rata-rata ${o.avgResponseSec} dtk per soal` },
    { label: 'Pelajaran tuntas', value: String(o.lessonsCompleted), hint: `dari ${ix.pack.lessons.length} yang tersedia` },
    { label: 'Topik dikuasai', value: String(o.topicsMastered), hint: `${o.topicsProvisional} menunggu tes ulang` },
  ];
  // Insights: plain sentences computed from the same numbers the charts show.
  const xpTotal = series.reduce((n, d) => n + d.xp, 0);
  const active = series.filter((d) => d.xp > 0).length;
  const accDays = series.filter((d) => d.accuracy !== null);
  const accAvg = accDays.length ? Math.round(accDays.reduce((n, d) => n + (d.accuracy ?? 0), 0) / accDays.length) : null;
  const xpInsight = `${xpTotal.toLocaleString('id-ID')} XP dalam ${days} hari, aktif ${active} dari ${days} hari.${active < Math.ceil(days / 2) ? ' Belajar sebentar tiap hari lebih membantu daripada sekaligus banyak.' : ''}`;
  const weakest = premium ? rows.find((r) => r.score < 85) : undefined;
  const accInsight = accAvg === null ? 'Belum ada jawaban di periode ini.'
    : `Rata-rata ketepatan ${accAvg}%.${weakest ? ` Topik yang paling perlu perhatian: ${weakest.title} (${weakest.score}%).` : accAvg < 70 ? ' Baca lagi materinya sebelum latihan mandiri agar lebih tepat.' : ' Pertahankan, lalu lanjutkan ke pelajaran berikutnya.'}`;
  return (
    <div className="space-y-4">
      <PageHeader title="Analitik Belajar" subtitle="Dihitung langsung dari jawaban, waktu respons, dan riwayat ulanganmu." action={premium ? <Badge tone="accent"><Crown size={12} aria-hidden />Analitik lengkap</Badge> : undefined} />
      <section aria-label="Ringkasan"><StatRow items={stats} /></section>
      {premium && <Segmented label="Periode grafik" value={period} onChange={setPeriod} options={[{ value: '7', label: '7 hari' }, { value: '14', label: '14 hari' }]} />}
      <div className="grid gap-4 lg:grid-cols-2">
        <BarChart title="XP per hari" subtitle={`${days} hari terakhir`} unit="XP" insight={xpInsight} data={series.map((d) => ({ label: d.label, title: full(d.day), value: d.xp }))} />
        <LineChart title="Ketepatan jawaban per hari" subtitle={`${days} hari terakhir · hari tanpa latihan dikosongkan`} unit="%" insight={accInsight} data={series.map((d) => ({ label: d.label, title: full(d.day), value: d.accuracy }))} />
      </div>

      {premium ? (
        <>
          <Card>
            <h2 className="font-extrabold">Penguasaan per topik</h2>
            <p className="text-sm text-muted">Garis tegak menandai ambang 85%. Diurutkan dari yang paling perlu perhatian.</p>
            <ul className="mt-4 space-y-4">
              {rows.map((r) => (
                <li key={r.id}>
                  <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3"><Link href={`/app/grammar?topic=${encodeURIComponent(r.id)}`} className="font-bold underline-offset-2 hover:underline">{r.title}</Link><span className="text-sm text-muted"><span className="font-extrabold text-ink">{r.score}%</span> · {STAGE[r.stage]} · {r.attempts} percobaan</span></div>
                  <MasteryBar score={r.score} />
                  <p className="mt-1 text-xs text-muted">{r.band}</p>
                </li>
              ))}
            </ul>
          </Card>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="font-extrabold">Pola kesalahan</h2>
              {o.misconceptions.length === 0 ? <p className="mt-2 text-sm text-muted">Belum ada pola kesalahan yang tercatat.</p> : (
                <ul className="mt-3 space-y-2">
                  {o.misconceptions.slice(0, 8).map((m) => (
                    <li key={m.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-2 p-3 dark:bg-line/60">
                      <div className="min-w-0 flex-1"><p className="font-bold">{m.title}</p><p className="text-xs text-muted">{m.total}× total · {m.active}× dalam 7 hari terakhir</p></div>
                      {m.active >= 2 && <LinkButton href={`/app/practice?mode=drill&tag=${encodeURIComponent(m.id)}`} size="sm" variant="accent">Perbaiki</LinkButton>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card>
              <h2 className="font-extrabold">Ketepatan per jenis kegiatan</h2>
              <table className="mt-3 w-full text-left text-sm">
                <thead className="text-xs font-bold text-muted"><tr><th className="py-1.5">Kegiatan</th><th className="py-1.5 text-right">Soal</th><th className="py-1.5 text-right">Benar</th></tr></thead>
                <tbody>{Object.entries(o.byContext).sort((a, b) => b[1].total - a[1].total).map(([k, v]) => <tr key={k} className="border-t border-line"><td className="py-1.5">{CTX[k] ?? k}</td><td className="py-1.5 text-right">{v.total}</td><td className="py-1.5 text-right font-bold">{Math.round((v.ok / v.total) * 100)}%</td></tr>)}</tbody>
              </table>
              <p className="mt-3 text-sm text-muted">Daya ingat ulangan: <span className="font-bold text-ink">{o.retention.total ? `${o.retention.rate}%` : 'belum ada data'}</span>{o.retention.total > 0 && ` (${o.retention.ok}/${o.retention.total})`}. Dihitung dari 400 jawaban terakhir.</p>
            </Card>
          </div>
        </>
      ) : (
        <ListGroup>
          <ListRow href="/app/subscription" icon={<Crown size={20} />} iconTone="accent" title="Analitik lengkap ada di Premium" subtitle="Penguasaan per topik, pola kesalahan, ketepatan per jenis kegiatan, daya ingat, dan grafik 14 hari." />
        </ListGroup>
      )}
    </div>
  );
}
