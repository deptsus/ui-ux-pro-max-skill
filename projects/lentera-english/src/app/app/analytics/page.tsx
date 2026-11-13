'use client';
import Link from 'next/link';
import { Crown } from 'lucide-react';
import { dailySeries, overview, topicRows } from '@/lib/engine/analytics';
import { useApp } from '@/lib/client/hooks';
import { BarChart, LineChart, MasteryBar } from '@/components/Charts';
import { Badge, Card, Empty, LinkButton, PageHeader, dateId } from '@/components/ui';

const STAGE: Record<string, string> = { new: 'Belum dimulai', learning: 'Dipelajari', practicing: 'Berlatih', provisional: 'Menunggu tes ulang', mastered: 'Dikuasai', 'needs-review': 'Perlu diulang' };
const CTX: Record<string, string> = { guided: 'Latihan terbimbing', independent: 'Latihan mandiri', homework: 'PR', mastery: 'Tes penguasaan', drill: 'Latihan perbaikan', review: 'Ulangan', retest: 'Tes ulang', exam: 'Ujian', timed: 'Tantangan kilat', listening: 'Menyimak', placement: 'Tes penempatan' };

export default function AnalyticsPage() {
  const { ix, learner, now, premium } = useApp();
  const o = overview(learner, ix, now);
  const days = premium ? 14 : 7;
  const series = dailySeries(learner, now, days);
  const full = (day: string) => dateId(day + 'T12:00:00', { weekday: 'short', day: 'numeric', month: 'short' });
  const rows = topicRows(learner, ix);
  if (o.exercises === 0) return <div><PageHeader title="Analitik Belajar" /><Empty title="Belum ada data" action={<LinkButton href="/app/path">Mulai belajar</LinkButton>}>Kerjakan beberapa latihan dulu. Semua angka di halaman ini dihitung dari aktivitasmu sendiri.</Empty></div>;

  const stats: [string, string, string][] = [
    ['Soal dikerjakan', o.exercises.toLocaleString('id-ID'), `ketepatan ${o.accuracy}%`],
    ['Waktu belajar', `${o.minutes} mnt`, `rata-rata ${o.avgResponseSec} dtk per soal`],
    ['Pelajaran tuntas', String(o.lessonsCompleted), `dari ${ix.pack.lessons.length} yang tersedia`],
    ['Topik dikuasai', String(o.topicsMastered), `${o.topicsProvisional} menunggu tes ulang`],
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Analitik Belajar" subtitle="Dihitung langsung dari jawaban, waktu respons, dan riwayat ulanganmu." action={premium ? <Badge tone="accent"><Crown size={12} aria-hidden />Analitik lengkap</Badge> : undefined} />
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ringkasan">
        {stats.map(([label, value, sub]) => <Card key={label} className="p-4"><p className="text-sm font-bold text-muted">{label}</p><p className="mt-1 text-2xl font-extrabold">{value}</p><p className="text-xs text-muted">{sub}</p></Card>)}
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <BarChart title="XP per hari" subtitle={`${days} hari terakhir`} unit="XP" data={series.map((d) => ({ label: d.label, title: full(d.day), value: d.xp }))} />
        <LineChart title="Ketepatan jawaban per hari" subtitle={`${days} hari terakhir · hari tanpa latihan dikosongkan`} unit="%" data={series.map((d) => ({ label: d.label, title: full(d.day), value: d.accuracy }))} />
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
                    <li key={m.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-surface-2 p-3">
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
                <thead className="text-xs uppercase text-muted"><tr><th className="py-1.5">Kegiatan</th><th className="py-1.5 text-right">Soal</th><th className="py-1.5 text-right">Benar</th></tr></thead>
                <tbody>{Object.entries(o.byContext).sort((a, b) => b[1].total - a[1].total).map(([k, v]) => <tr key={k} className="border-t border-line"><td className="py-1.5">{CTX[k] ?? k}</td><td className="py-1.5 text-right">{v.total}</td><td className="py-1.5 text-right font-bold">{Math.round((v.ok / v.total) * 100)}%</td></tr>)}</tbody>
              </table>
              <p className="mt-3 text-sm text-muted">Daya ingat ulangan: <span className="font-bold text-ink">{o.retention.total ? `${o.retention.rate}%` : 'belum ada data'}</span>{o.retention.total > 0 && ` (${o.retention.ok}/${o.retention.total})`}. Dihitung dari 400 jawaban terakhir.</p>
            </Card>
          </div>
        </>
      ) : (
        <Card className="flex flex-wrap items-center gap-3 border-2 border-accent">
          <Crown className="text-accent" aria-hidden />
          <div className="min-w-0 flex-1"><p className="font-extrabold">Analitik lengkap ada di Premium</p><p className="text-sm text-muted">Penguasaan per topik, pola kesalahan, ketepatan per jenis kegiatan, daya ingat, dan grafik 14 hari.</p></div>
          <LinkButton href="/app/subscription" variant="accent" size="sm">Lihat Premium</LinkButton>
        </Card>
      )}
    </div>
  );
}
