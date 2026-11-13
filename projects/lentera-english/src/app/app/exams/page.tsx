'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { Check, Compass, Crown, Lock } from 'lucide-react';
import type { ExamDef } from '@/lib/content/types';
import { buildExam, scoreExam, type ExamResult } from '@/lib/engine/sessions';
import { recordExam } from '@/lib/engine/state';
import { levelExamStatus, unitExamStatus } from '@/lib/engine/unlock';
import type { Cefr } from '@/lib/content/types';
import { useApp } from '@/lib/client/hooks';
import { act } from '@/lib/client/store';
import { SessionRunner, SessionSummary, type SessionResult } from '@/components/SessionRunner';
import { Badge, Button, Card, Empty, LinkButton, Notice, PageHeader, Progress, dateTimeId } from '@/components/ui';

function Exams() {
  const params = useSearchParams();
  const id = params.get('id');
  const { ix, learner, ent, now } = useApp();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<{ session: SessionResult; exam: ExamResult } | null>(null);
  const exam = id ? ix.pack.exams.find((e) => e.id === id) : undefined;
  const attempt = (exam ? learner.exams[exam.id]?.attempts.length ?? 0 : 0) + (done ? 0 : 1);
  const questions = useMemo(() => (exam ? buildExam(ix, exam, attempt) : []), [ix, exam, attempt]);
  const status = (e: ExamDef) => (e.scope === 'unit' ? unitExamStatus(learner, ix, e.ref) : levelExamStatus(learner, ix, e.ref as Cefr, ent, now));

  if (id && !exam) return <Empty title="Ujian tidak ditemukan" action={<LinkButton href="/app/exams">Pusat Ujian</LinkButton>} />;
  if (exam && running) {
    return <SessionRunner key={attempt} title={exam.title} ctx="exam" exercises={questions} feedback="deferred" timeLimitSec={exam.timeLimitSec} seed={`${exam.id}:${attempt}`} exitHref="/app/exams"
      onFinish={(r) => {
        const results = Object.fromEntries(r.items.map((i) => [i.ex.id, i.grade.correct]));
        const scored = scoreExam(questions, results, exam.passScore);
        act((d, at) => void recordExam(d, ix, exam, scored.score, at));
        setDone({ session: { ...r, total: scored.total, correct: scored.correct, score: scored.score }, exam: scored });
        setRunning(false);
      }} />;
  }
  if (exam && done) {
    return (
      <SessionSummary result={done.session} title={done.exam.passed ? `Lulus: ${exam.title}` : `Belum lulus: ${exam.title}`} passScore={exam.passScore} doneHref="/app/path" doneLabel="Ke jalur belajar" onRetry={done.exam.passed ? undefined : () => { setDone(null); setRunning(true); }}>
        {done.exam.total > done.session.items.length && <Notice tone="bad">Soal yang tidak sempat dijawab dihitung salah.</Notice>}
        <div className="w-full space-y-2 text-left">
          <p className="text-sm font-extrabold">Nilai per topik</p>
          {done.exam.byTopic.map((t) => <div key={t.topic}><div className="flex justify-between text-sm"><span>{ix.topicById.get(t.topic)?.title ?? t.topic}</span><span className="font-bold">{t.correct}/{t.total}</span></div><Progress value={t.score} tone={t.score >= exam.passScore ? 'ok' : 'accent'} className="h-2" label={t.topic} /></div>)}
        </div>
      </SessionSummary>
    );
  }
  if (exam) {
    const st = status(exam);
    const attempts = learner.exams[exam.id]?.attempts ?? [];
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <PageHeader title={exam.title} subtitle={`${questions.length} soal · ${Math.round(exam.timeLimitSec / 60)} menit · lulus ${exam.passScore}%`} />
        {st === 'premium' ? <Notice tone="accent" title="Ujian level termasuk Premium"><LinkButton href="/app/subscription" size="sm" variant="accent" className="mt-2">Lihat paket</LinkButton></Notice>
          : st === 'locked' ? <Notice tone="muted" title="Ujian masih terkunci">Tuntaskan semua pelajaran {exam.scope === 'unit' ? 'unit' : 'dan ujian unit di level'} ini terlebih dahulu.</Notice>
          : <Card className="space-y-3"><ul className="list-disc space-y-1 pl-5 text-sm text-muted"><li>Tidak ada petunjuk. Pembahasan lengkap muncul setelah ujian selesai.</li><li>Soal diambil merata dari semua pelajaran dalam cakupan ujian dan diacak tiap percobaan.</li><li>Saat waktu habis, soal yang belum dijawab dihitung salah.</li></ul><Button full size="lg" onClick={() => setRunning(true)}>{attempts.length ? 'Ulangi ujian' : 'Mulai ujian'}</Button></Card>}
        {attempts.length > 0 && <Card><h2 className="font-extrabold">Riwayat percobaan</h2><ul className="mt-2 divide-y divide-line">{[...attempts].reverse().map((a, i) => <li key={i} className="flex items-center justify-between py-2 text-sm"><span>{dateTimeId(a.at)}</span><Badge tone={a.passed ? 'ok' : 'bad'}>{a.score}% · {a.passed ? 'lulus' : 'belum lulus'}</Badge></li>)}</ul></Card>}
      </div>
    );
  }

  const groups: [string, ExamDef[]][] = [['Ujian unit', ix.pack.exams.filter((e) => e.scope === 'unit')], ['Ujian level CEFR', ix.pack.exams.filter((e) => e.scope === 'level')]];
  return (
    <div>
      <PageHeader title="Pusat Ujian" subtitle="Tiga tingkat ujian: tes penguasaan di tiap pelajaran, ujian unit, dan ujian level CEFR. Kamu naik hanya setelah membuktikan kemampuan." />
      <Card className="mb-5 flex flex-wrap items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand"><Compass size={24} aria-hidden /></span>
        <div className="min-w-0 flex-1"><h2 className="font-extrabold">Tes penempatan</h2><p className="text-sm text-muted">{learner.profile.placementDone ? `Hasil terakhir: level ${learner.profile.placementLevel} (${dateTimeId(learner.profile.placementAt ?? now)}).` : 'Belum pernah diikuti. Tes ini menentukan level awalmu.'}</p></div>
        <LinkButton href="/app/placement" size="sm" variant={learner.profile.placementDone ? 'secondary' : 'primary'}>{learner.profile.placementDone ? 'Ulangi' : 'Mulai'}</LinkButton>
      </Card>
      {groups.map(([title, list]) => (
        <section key={title} className="mb-6">
          <h2 className="mb-2 text-lg font-extrabold">{title}</h2>
          <ul className="space-y-3">
            {list.map((e) => {
              const st = status(e);
              const best = Math.max(0, ...(learner.exams[e.id]?.attempts.map((a) => a.score) ?? []));
              return (
                <li key={e.id}><Card className="flex flex-wrap items-center gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-full ${st === 'passed' ? 'bg-ok text-on-brand' : st === 'available' ? 'bg-brand text-on-brand' : 'bg-surface-2 text-muted'}`}>{st === 'passed' ? <Check size={18} aria-hidden /> : st === 'premium' ? <Crown size={18} aria-hidden /> : st === 'locked' ? <Lock size={18} aria-hidden /> : <span className="text-sm font-extrabold">{e.scope === 'level' ? e.ref : 'U'}</span>}</span>
                  <div className="min-w-0 flex-1"><p className="font-extrabold">{e.title}</p><p className="text-sm text-muted">{Math.round(e.timeLimitSec / 60)} menit · lulus {e.passScore}%{best ? ` · nilai terbaik ${best}%` : ''}</p></div>
                  {st === 'passed' && <Badge tone="ok">Lulus</Badge>}
                  {st === 'locked' && <Badge tone="muted">Terkunci</Badge>}
                  {st === 'premium' && <Badge tone="accent">Premium</Badge>}
                  <LinkButton href={`/app/exams?id=${e.id}`} size="sm" variant={st === 'available' ? 'primary' : 'secondary'}>{st === 'available' ? 'Ikuti' : 'Detail'}</LinkButton>
                </Card></li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default function ExamsPage() {
  return <Suspense><Exams /></Suspense>;
}
