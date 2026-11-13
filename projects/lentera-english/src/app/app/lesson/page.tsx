'use client';
// Interactive lesson room. Every lesson follows the same eight steps:
// introduction, teaching, demonstration, guided practice, independent
// practice, homework, mastery test, review schedule.
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarClock, Check, ClipboardList, Heart, Target, X } from 'lucide-react';
import { lessonExercises } from '@/lib/content/types';
import { SRS } from '@/lib/engine/config';
import { currentHearts } from '@/lib/engine/gamification';
import { buildMasteryTest } from '@/lib/engine/sessions';
import { LESSON_STEPS, assignHomework, finishMastery, finishPractice, reachStep, type LessonStep } from '@/lib/engine/state';
import { lessonLock, lessonsOfUnit, unitExam } from '@/lib/engine/unlock';
import { useApp } from '@/lib/client/hooks';
import { act } from '@/lib/client/store';
import { Demo, Teaching } from '@/components/LessonContent';
import { Mascot } from '@/components/Mascot';
import { SessionRunner, SessionSummary, type SessionResult } from '@/components/SessionRunner';
import { Badge, Button, Card, Empty, LinkButton, Notice, cx, dateId } from '@/components/ui';

const STEP_LABEL: Record<LessonStep, string> = { intro: 'Pengantar', teaching: 'Materi', demo: 'Contoh', guided: 'Latihan terbimbing', independent: 'Latihan mandiri', homework: 'PR', mastery: 'Tes penguasaan', review: 'Jadwal ulangan' };

function LessonRoom() {
  const params = useSearchParams();
  const id = params.get('id') ?? '';
  const revise = params.get('revise') === '1';
  const { ix, learner, ent, now, premium } = useApp();
  const lesson = ix.lessonById.get(id);
  const progress = learner.lessons[id];
  const [step, setStep] = useState<LessonStep>(() => (revise ? 'teaching' : progress?.completedAt ? 'intro' : LESSON_STEPS[Math.min(progress?.step ?? 0, 6)]));
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [attempt, setAttempt] = useState(() => (progress?.masteryAttempts ?? 0) + 1);

  const guided = useMemo(() => lessonExercises(ix, id, 'guided'), [ix, id]);
  const independent = useMemo(() => lessonExercises(ix, id, 'independent'), [ix, id]);
  const mastery = useMemo(() => buildMasteryTest(ix, id, attempt), [ix, id, attempt]);

  if (!lesson) return <Empty title="Pelajaran tidak ditemukan" action={<LinkButton href="/app/path">Kembali ke jalur belajar</LinkButton>} />;
  const lock = lessonLock(learner, ix, lesson, ent, now);
  if (lock.status === 'premium') return <Empty title="Pelajaran Premium" action={<LinkButton href="/app/subscription" variant="accent">Lihat paket Premium</LinkButton>}>{lesson.title} adalah bagian dari kurikulum Premium. Tujuan belajarnya: {lesson.objectives.join(' ')}</Empty>;
  if (lock.status === 'locked') return <Empty title="Pelajaran masih terkunci" action={<LinkButton href="/app/path">Kembali ke jalur belajar</LinkButton>}>{lock.reason}</Empty>;

  const hw = ix.pack.homework.find((h) => h.lessonId === id);
  const hwRec = hw ? learner.homework[hw.id] : undefined;
  const hearts = currentHearts(learner.hearts, now).count;
  const noHearts = !premium && hearts <= 0;
  const go = (s: LessonStep) => {
    act((d, at) => reachStep(d, id, s, at));
    setResult(null);
    setRunning(false);
    setStep(s);
    window.scrollTo({ top: 0 });
  };
  const siblings = lessonsOfUnit(ix, lesson.unitId);
  const nextInUnit = siblings[siblings.findIndex((l) => l.id === id) + 1];
  const exam = unitExam(ix, lesson.unitId);
  const stepIndex = LESSON_STEPS.indexOf(step);

  // ── Running a practice stage ──
  if (running && (step === 'guided' || step === 'independent' || step === 'mastery')) {
    const list = step === 'guided' ? guided : step === 'independent' ? independent : mastery;
    return (
      <SessionRunner key={`${step}:${attempt}`} title={`${lesson.title} · ${STEP_LABEL[step]}`} ctx={step} exercises={list} seed={`${id}:${step}:${attempt}`}
        feedback={step === 'mastery' ? 'deferred' : 'immediate'} hints={step === 'guided'} hearts={step !== 'guided'} exitHref="/app/path"
        onFinish={(r) => {
          if (step === 'mastery') act((d, at) => void finishMastery(d, ix, id, r.score, at));
          else act((d, at) => finishPractice(d, id, step, r.score, at));
          setResult(r);
          setRunning(false);
        }} />
    );
  }

  // ── Result of a practice stage ──
  if (result && step === 'mastery') {
    const passed = result.score >= lesson.passScore;
    return (
      <SessionSummary result={result} title={passed ? 'Lulus tes penguasaan!' : 'Belum lulus tes penguasaan'} passScore={lesson.passScore}
        onRetry={passed || noHearts ? undefined : () => { setAttempt((a) => a + 1); setResult(null); setRunning(true); }}
        doneHref={passed ? `/app/lesson?id=${id}` : '/app/path'} doneLabel={passed ? 'Lihat jadwal ulangan' : 'Kembali ke jalur'}>
        {passed ? (
          <Notice tone="ok" title="Pelajaran tuntas">Topik ini masuk ke ulangan terjadwal. Pelajaran berikutnya sudah terbuka.</Notice>
        ) : (
          <Notice tone="bad" title={`Butuh minimal ${lesson.passScore}%`}>Baca lagi pembahasan di bawah, buka materinya, lalu coba lagi. Soal akan diacak ulang.{noHearts && ' Nyawamu habis: kerjakan ulangan terjadwal atau tunggu nyawa terisi.'}</Notice>
        )}
        {!passed && <Button variant="secondary" full onClick={() => go('teaching')}>Buka materi lagi</Button>}
        {passed && <Button variant="success" full onClick={() => go('review')}>Lanjut</Button>}
      </SessionSummary>
    );
  }
  if (result && (step === 'guided' || step === 'independent')) {
    return (
      <SessionSummary result={result} title={`${STEP_LABEL[step]} selesai`} onRetry={() => { setAttempt((a) => a + 1); setResult(null); setRunning(true); }} doneHref="/app/path" doneLabel="Kembali ke jalur">
        <Button variant="success" full onClick={() => go(step === 'guided' ? 'independent' : 'homework')}>Lanjut ke {STEP_LABEL[step === 'guided' ? 'independent' : 'homework'].toLowerCase()}<ArrowRight size={18} aria-hidden /></Button>
      </SessionSummary>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link href="/app/path" className="inline-flex items-center gap-1 text-sm font-bold text-muted hover:text-ink"><ArrowLeft size={16} aria-hidden />Jalur belajar</Link>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{lesson.title}</h1>
        <ol className="mt-3 flex gap-1.5" aria-label="Langkah pelajaran">
          {LESSON_STEPS.map((s, i) => {
            const reached = i <= Math.max(progress?.step ?? 0, stepIndex);
            return (
              <li key={s} className="flex-1">
                <button type="button" disabled={!reached} onClick={() => go(s)} aria-current={s === step ? 'step' : undefined} title={STEP_LABEL[s]} className={cx('h-2.5 w-full rounded-full transition', s === step ? 'bg-brand' : reached ? 'bg-brand/40' : 'bg-surface-2')}><span className="sr-only">{STEP_LABEL[s]}</span></button>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-sm font-bold text-brand">Langkah {stepIndex + 1} dari 8 · {STEP_LABEL[step]}</p>
      </div>

      {step === 'intro' && (
        <>
          <Card className="flex gap-4"><Mascot size={72} className="shrink-0" /><p className="leading-relaxed">{lesson.intro}</p></Card>
          <Card>
            <h2 className="flex items-center gap-2 font-extrabold"><Target size={18} className="text-brand" aria-hidden />Setelah pelajaran ini kamu bisa</h2>
            <ul className="mt-3 space-y-2">{lesson.objectives.map((o) => <li key={o} className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-ok" aria-hidden />{o}</li>)}</ul>
          </Card>
          {progress?.completedAt && <Notice tone="ok" title="Pelajaran ini sudah tuntas">Nilai tes terbaikmu {progress.masteryBest}%. Kamu boleh mengulang materi dan latihannya kapan saja.</Notice>}
          <Button full size="lg" onClick={() => go('teaching')}>Mulai belajar<ArrowRight size={20} aria-hidden /></Button>
        </>
      )}

      {step === 'teaching' && (
        <>
          <Teaching sections={lesson.teaching} />
          <Button full size="lg" onClick={() => go('demo')}>Lihat contoh benar dan salah<ArrowRight size={20} aria-hidden /></Button>
        </>
      )}

      {step === 'demo' && (
        <>
          <p className="text-muted">Bandingkan kalimat yang benar dengan kesalahan yang paling sering terjadi.</p>
          <Demo lesson={lesson} />
          <Button full size="lg" onClick={() => go('guided')}>Lanjut ke latihan<ArrowRight size={20} aria-hidden /></Button>
        </>
      )}

      {step === 'guided' && (
        <Card className="space-y-3 text-center">
          <Mascot mood="happy" size={80} className="mx-auto" />
          <h2 className="text-xl font-extrabold">Latihan terbimbing</h2>
          <p className="text-muted">{guided.length} soal dengan petunjuk dan pembahasan langsung. Salah di sini tidak mengurangi nyawa.</p>
          {progress?.guidedScore !== undefined && <Badge tone="ok">Nilai terbaik {progress.guidedScore}%</Badge>}
          <Button full size="lg" onClick={() => setRunning(true)}>Mulai latihan</Button>
          {progress?.guidedScore !== undefined && <Button full variant="secondary" onClick={() => go('independent')}>Lewati ke latihan mandiri</Button>}
        </Card>
      )}

      {step === 'independent' && (
        <Card className="space-y-3 text-center">
          <Mascot mood="think" size={80} className="mx-auto" />
          <h2 className="text-xl font-extrabold">Latihan mandiri</h2>
          <p className="text-muted">{independent.length} soal tanpa petunjuk. Pembahasan tetap muncul setelah kamu menjawab.{!premium && ' Tiap jawaban salah mengurangi satu nyawa.'}</p>
          {progress?.independentScore !== undefined && <Badge tone="ok">Nilai terbaik {progress.independentScore}%</Badge>}
          {noHearts ? <Notice tone="bad" title="Nyawamu habis"><span className="inline-flex items-center gap-1"><Heart size={14} aria-hidden />Selesaikan satu sesi ulangan untuk mendapat nyawa, tunggu terisi otomatis, atau pakai Premium.</span></Notice> : <Button full size="lg" onClick={() => setRunning(true)}>Mulai latihan mandiri</Button>}
          {noHearts && <LinkButton href="/app/review" full variant="secondary">Buka ulangan</LinkButton>}
          {progress?.independentScore !== undefined && <Button full variant="secondary" onClick={() => go('homework')}>Lanjut ke PR</Button>}
        </Card>
      )}

      {step === 'homework' && (
        <Card className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl font-extrabold"><ClipboardList size={22} className="text-brand" aria-hidden />Pekerjaan rumah</h2>
          {hw ? (
            <>
              <p className="text-muted">PR &ldquo;{hw.title}&rdquo; berisi {hw.exerciseIds.length} soal tambahan. Kerjakan sekarang atau nanti di Pusat PR sebelum tenggat.</p>
              {hwRec ? (
                <Notice tone={hwRec.submissions.length ? 'ok' : 'accent'} title={hwRec.submissions.length ? `Sudah dikumpulkan · nilai ${hwRec.submissions.at(-1)!.score}%` : `Tenggat: ${dateId(hwRec.dueAt)}`}>{hwRec.submissions.length ? 'Kamu bisa mengerjakannya ulang untuk memperbaiki nilai.' : `PR ditugaskan pada ${dateId(hwRec.assignedAt)}.`}</Notice>
              ) : (
                <Button full onClick={() => act((d, at) => assignHomework(d, hw, at))}>Terima PR (tenggat {hw.dueDays} hari)</Button>
              )}
              {hwRec && <LinkButton href={`/app/homework?id=${hw.id}`} full variant="secondary">Kerjakan PR sekarang</LinkButton>}
            </>
          ) : (
            <p className="text-muted">Pelajaran ini tidak punya PR.</p>
          )}
          <Button full size="lg" disabled={!!hw && !hwRec} onClick={() => go('mastery')}>Lanjut ke tes penguasaan<ArrowRight size={20} aria-hidden /></Button>
        </Card>
      )}

      {step === 'mastery' && (
        <Card className="space-y-3 text-center">
          <Mascot mood="think" size={80} className="mx-auto" />
          <h2 className="text-xl font-extrabold">Tes penguasaan</h2>
          <p className="text-muted">{mastery.length} soal tanpa petunjuk. Pembahasan muncul setelah tes selesai. Nilai minimal <span className="font-bold text-ink">{lesson.passScore}%</span> untuk menuntaskan pelajaran dan membuka pelajaran berikutnya.</p>
          {progress?.masteryAttempts ? <Badge tone={progress.completedAt ? 'ok' : 'muted'}>Percobaan {progress.masteryAttempts} · terbaik {progress.masteryBest}%</Badge> : null}
          {noHearts ? <Notice tone="bad" title="Nyawamu habis">Selesaikan satu sesi ulangan untuk mendapat nyawa, atau tunggu terisi otomatis.</Notice> : <Button full size="lg" onClick={() => setRunning(true)}>Mulai tes</Button>}
          {progress?.completedAt && <Button full variant="secondary" onClick={() => go('review')}>Lihat jadwal ulangan</Button>}
        </Card>
      )}

      {step === 'review' && (
        <>
          <Card className="space-y-3">
            <h2 className="flex items-center gap-2 text-xl font-extrabold"><CalendarClock size={22} className="text-brand" aria-hidden />Jadwal ulangan</h2>
            <p className="text-muted">Agar tidak lupa, topik ini akan muncul lagi di Pusat Ulangan dengan jarak yang makin panjang. Jawaban salah memendekkan jaraknya; jawaban benar memanjangkannya.</p>
            <ol className="grid grid-cols-5 gap-2 text-center">
              {SRS.steps.map((d, i) => <li key={d} className="rounded-2xl bg-surface-2 px-1 py-3"><p className="text-xs font-bold text-muted">Ke-{i + 1}</p><p className="text-lg font-extrabold">{d}</p><p className="text-xs text-muted">hari</p></li>)}
            </ol>
            {learner.reviews[`topic:${lesson.topic}`] && <Notice tone="brand" title="Ulangan berikutnya">{dateId(learner.reviews[`topic:${lesson.topic}`].dueAt, { weekday: 'long', day: 'numeric', month: 'long' })}{lesson.vocab?.length ? ` · ${lesson.vocab.length} kosakata pelajaran ini ikut dijadwalkan.` : ''}</Notice>}
            <Notice tone="accent" title="Kapan topik dianggap dikuasai?">Bukan dari satu tes. Skor penguasaanmu harus mencapai 85% dari cukup banyak soal, lalu kamu harus lulus tes ulang setelah jeda minimal 20 jam.</Notice>
          </Card>
          {nextInUnit ? <LinkButton href={`/app/lesson?id=${nextInUnit.id}`} full size="lg">Pelajaran berikutnya: {nextInUnit.title}<ArrowRight size={20} aria-hidden /></LinkButton> : exam ? <LinkButton href={`/app/exams?id=${exam.id}`} full size="lg" variant="accent">Lanjut ke {exam.title}</LinkButton> : <LinkButton href="/app/path" full size="lg">Kembali ke jalur belajar</LinkButton>}
        </>
      )}
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense>
      <LessonRoom />
    </Suspense>
  );
}
