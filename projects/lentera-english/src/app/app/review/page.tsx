'use client';
import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Timer } from 'lucide-react';
import { GAME } from '@/lib/engine/config';
import { dayKey, retestReady } from '@/lib/engine/mastery';
import { buildReviewTasks, type ReviewTask } from '@/lib/engine/sessions';
import { dueItems, retention } from '@/lib/engine/srs';
import { refillHeart, reviewResult } from '@/lib/engine/state';
import { useApp } from '@/lib/client/hooks';
import { act } from '@/lib/client/store';
import { SessionRunner, SessionSummary, type SessionResult } from '@/components/SessionRunner';
import { Badge, Button, Card, LinkButton, Notice, PageHeader, dateId } from '@/components/ui';

const DAY = 86_400_000;

export default function ReviewPage() {
  const { ix, learner, now, premium } = useApp();
  const [tasks, setTasks] = useState<ReviewTask[] | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);
  const due = dueItems(learner.reviews, now);
  const doneToday = learner.daily[dayKey(now)]?.reviews ?? 0;
  const quota = premium ? 20 : Math.max(0, GAME.freeDailyReviewItems - doneToday);
  const all = Object.values(learner.reviews).sort((a, b) => a.dueAt - b.dueAt);
  const ret = retention(learner.reviews);
  const retests = Object.entries(learner.topics).filter(([, t]) => t.stage === 'provisional');
  const exercises = useMemo(() => tasks?.flatMap((t) => t.exercises) ?? [], [tasks]);
  const label = (key: string) => (key.startsWith('vocab:') ? `Kosakata: ${ix.vocabById.get(key.slice(6))?.word ?? key.slice(6)}` : `Topik: ${ix.topicById.get(key.slice(6))?.title ?? key.slice(6)}`);

  if (tasks && !result) {
    return (
      <SessionRunner title="Ulangan terjadwal" ctx="review" exercises={exercises} feedback="immediate" seed={`review:${now}`} exitHref="/app/review"
        onFinish={(r) => {
          act((d, at) => {
            for (const t of tasks) {
              const answered = r.items.filter((i) => t.exercises.some((e) => e.id === i.ex.id));
              if (answered.length === t.exercises.length) reviewResult(d, t.item.key, answered.every((i) => i.grade.correct), at);
            }
            if (!premium && r.items.length >= Math.min(3, exercises.length)) refillHeart(d, at);
          });
          setResult(r);
        }} />
    );
  }
  if (result) {
    return (
      <SessionSummary result={result} title="Ulangan selesai" doneHref="/app" onRetry={undefined}>
        <Notice tone="brand" title="Jadwal diperbarui">Materi yang kamu jawab benar akan muncul lagi dengan jarak lebih panjang. Yang salah akan kembali lebih cepat.{!premium && ' Kamu juga mendapat +1 nyawa.'}</Notice>
        <Button variant="secondary" full onClick={() => { setTasks(null); setResult(null); }}>Kembali ke Pusat Ulangan</Button>
      </SessionSummary>
    );
  }

  return (
    <div>
      <PageHeader title="Pusat Ulangan" subtitle="Ulangan terjadwal memunculkan kembali materi tepat sebelum kamu melupakannya: 1, 3, 7, 14, lalu 30 hari." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-2xl font-extrabold text-on-brand">{due.length}</span>
            <div><h2 className="text-lg font-extrabold">Ulangan menunggu</h2><p className="text-sm text-muted">{due.length ? 'Kerjakan sekarang supaya jadwalmu tetap terjaga.' : all.length ? `Tidak ada yang jatuh tempo. Berikutnya ${dateId(all[0].dueAt, { weekday: 'long', day: 'numeric', month: 'long' })}.` : 'Tuntaskan pelajaran pertamamu untuk mulai menjadwalkan ulangan.'}</p></div>
          </div>
          {due.length > 0 && quota > 0 && <Button full size="lg" onClick={() => setTasks(buildReviewTasks(ix, learner, due, quota, `${learner.userId}:${dayKey(now)}`))}>Mulai ulangan ({Math.min(due.length, quota)} materi)</Button>}
          {due.length > 0 && quota <= 0 && <Notice tone="accent" title="Batas harian paket gratis tercapai">Paket gratis mencakup {GAME.freeDailyReviewItems} ulangan per hari. Sisanya menunggu besok, atau buka semua dengan Premium.</Notice>}
          {!premium && <p className="text-xs text-muted">Paket gratis: {Math.min(doneToday, GAME.freeDailyReviewItems)}/{GAME.freeDailyReviewItems} ulangan hari ini. Menyelesaikan sesi ulangan memberi +1 nyawa.</p>}
        </Card>
        <Card className="space-y-1">
          <h2 className="font-extrabold">Daya ingat</h2>
          <p className="text-3xl font-extrabold">{ret.total ? `${ret.rate}%` : '—'}</p>
          <p className="text-sm text-muted">{ret.total ? `${ret.ok} dari ${ret.total} ulangan dijawab benar.` : 'Belum ada riwayat ulangan.'}</p>
        </Card>
      </div>

      {retests.length > 0 && (
        <Card className="mt-4">
          <h2 className="flex items-center gap-2 font-extrabold"><CheckCircle2 size={18} className="text-ok" aria-hidden />Tes ulang untuk konfirmasi penguasaan</h2>
          <ul className="mt-3 space-y-2">
            {retests.map(([id, t]) => (
              <li key={id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-surface-2 p-3">
                <div><p className="font-bold">{ix.topicById.get(id)?.title ?? id}</p><p className="text-sm text-muted">Skor {t.score}% · {retestReady(t, now) ? 'siap diuji sekarang' : `dibuka ${dateId(t.retestDueAt ?? now, { weekday: 'long', hour: '2-digit', minute: '2-digit' })}`}</p></div>
                {retestReady(t, now) ? <LinkButton size="sm" href={`/app/practice?mode=retest&topic=${encodeURIComponent(id)}`}>Tes ulang</LinkButton> : <Badge tone="muted">Menunggu jeda</Badge>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="mt-4 flex flex-wrap items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-[#1e1b3a]"><Timer size={24} aria-hidden /></span>
        <div className="min-w-0 flex-1"><h2 className="font-extrabold">Tantangan Kilat</h2><p className="text-sm text-muted">Soal cepat berbatas waktu dari materi yang sudah kamu pelajari.</p></div>
        <LinkButton href="/app/practice?mode=timed" variant="accent" size="sm">Main</LinkButton>
      </Card>

      <h2 className="mb-2 mt-6 flex items-center gap-2 text-lg font-extrabold"><CalendarClock size={20} aria-hidden />Jadwal semua materi</h2>
      {all.length === 0 ? (
        <Card className="text-muted">Belum ada materi terjadwal.</Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2 text-xs uppercase text-muted"><tr><th className="px-4 py-2.5">Materi</th><th className="px-4 py-2.5">Jarak</th><th className="px-4 py-2.5">Berikutnya</th><th className="px-4 py-2.5">Riwayat</th></tr></thead>
            <tbody>
              {all.map((r) => (
                <tr key={r.key} className="border-t border-line">
                  <td className="px-4 py-2.5 font-bold">{label(r.key)}</td>
                  <td className="px-4 py-2.5">{r.intervalDays} hari</td>
                  <td className="px-4 py-2.5">{r.dueAt <= now ? <Badge tone="accent">Sekarang</Badge> : `${Math.ceil((r.dueAt - now) / DAY)} hari lagi`}</td>
                  <td className="px-4 py-2.5"><span className="inline-flex gap-1" aria-label={`${r.history.filter((h) => h.ok).length} benar dari ${r.history.length}`}>{r.history.length ? r.history.slice(-8).map((h, i) => <span key={i} className={`h-2.5 w-2.5 rounded-full ${h.ok ? 'bg-ok' : 'bg-bad'}`} />) : <span className="text-muted">baru</span>}</span>{r.lapses > 0 && <span className="ml-2 text-xs text-muted">{r.lapses}× lupa</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
