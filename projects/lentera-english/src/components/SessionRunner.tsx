'use client';
// Runs a practice session: one exercise at a time, feedback, hearts, timers.
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, Check, ChevronDown, Clock, Heart, Lightbulb, X, Zap } from 'lucide-react';
import type { Exercise } from '@/lib/content/types';
import { grade as gradeAnswer, type Answer, type Grade } from '@/lib/engine/grading';
import { currentHearts } from '@/lib/engine/gamification';
import { recordAttempt } from '@/lib/engine/state';
import { isPremium, type AttemptContext } from '@/lib/engine/types';
import { useContent } from '@/lib/client/content';
import { act, getLearner, useEntitlement, useLearner } from '@/lib/client/store';
import { buzz, chime } from '@/lib/client/prefs';
import { ExerciseCard } from './ExerciseCard';
import { Mascot } from './Mascot';
import { CAST, type CastId } from './cast/Kid';
import type { Mood } from './cast/Face';
import { Badge, Button, Card, LinkButton, Progress, Ring, cx } from './ui';

export interface SessionItem {
  ex: Exercise;
  grade: Grade;
  ms: number;
  hint: boolean;
}
export interface SessionResult {
  items: SessionItem[];
  correct: number;
  total: number;
  score: number;
  outOfHearts: boolean;
  timedOut: boolean;
}

interface Props {
  title: string;
  ctx: AttemptContext;
  exercises?: Exercise[];
  /** Adaptive sessions pick the next exercise from the history so far. */
  next?: (history: { id: string; ok: boolean; d: number }[]) => Exercise | null;
  total?: number;
  feedback: 'immediate' | 'deferred';
  hints?: boolean;
  hearts?: boolean;
  timeLimitSec?: number;
  seed: string;
  onFinish: (r: SessionResult) => void;
  exitHref: string;
}

// Rilis 14: who asks each question (varies through the cast) and how they react.
const HOSTS = Object.keys(CAST) as CastId[];
const hostOf = (id: string): CastId => HOSTS[[...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % HOSTS.length];
const CHEERS: Mood[] = ['cheer', 'laugh', 'proud', 'love'];
const COMFORT: Mood[] = ['encourage', 'worried', 'think'];
/** Right answers in a row at the end of the list. */
export const comboOf = (items: { grade: { correct: boolean } }[]) => { let n = 0; for (let i = items.length - 1; i >= 0 && items[i].grade.correct; i--) n++; return n; };

const summarize = (items: SessionItem[], outOfHearts = false, timedOut = false): SessionResult => {
  const correct = items.filter((i) => i.grade.correct).length;
  return { items, correct, total: items.length, score: items.length ? Math.round((correct / items.length) * 100) : 0, outOfHearts, timedOut };
};
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;

export function SessionRunner({ title, ctx, exercises, next, total, feedback, hints, hearts, timeLimitSec, seed, onFinish, exitHref }: Props) {
  const ix = useContent();
  const learner = useLearner();
  const premium = isPremium(useEntitlement(), Date.now());
  const useHearts = !!hearts && !premium;
  const [items, setItems] = useState<SessionItem[]>([]);
  const [current, setCurrent] = useState<Exercise | null>(() => (exercises ? exercises[0] ?? null : next?.([]) ?? null));
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [result, setResult] = useState<Grade | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [left, setLeft] = useState(timeLimitSec ?? 0);
  const [qLeft, setQLeft] = useState(0);
  const startedAt = useRef(Date.now());
  const finished = useRef(false);
  const questionRef = useRef<HTMLElement>(null);
  const count = total ?? exercises?.length ?? 0;
  const heartsNow = currentHearts(learner.hearts, Date.now()).count;

  const finish = useCallback((list: SessionItem[], outOfHearts = false, timedOut = false) => {
    if (finished.current) return;
    finished.current = true;
    onFinish(summarize(list, outOfHearts, timedOut));
  }, [onFinish]);

  const advance = useCallback((list: SessionItem[]) => {
    const upcoming = exercises ? exercises[list.length] ?? null : next?.(list.map((i) => ({ id: i.ex.id, ok: i.grade.correct, d: i.ex.difficulty }))) ?? null;
    if (!upcoming) return finish(list);
    setCurrent(upcoming);
    setAnswer(null);
    setResult(null);
    setHintShown(false);
    startedAt.current = Date.now();
  }, [exercises, next, finish]);

  const submit = useCallback((forced?: Answer) => {
    if (!current || result) return;
    const given = forced ?? answer;
    if (!given) return;
    const g = gradeAnswer(current, given);
    const ms = Date.now() - startedAt.current;
    const item: SessionItem = { ex: current, grade: g, ms, hint: hintShown };
    const list = [...items, item];
    setItems(list);
    act((d, now) => recordAttempt(d, current, g, { ctx, ms, at: now, hint: hintShown, premium }));
    const heartsAfter = useHearts ? currentHearts(getLearner()!.hearts, Date.now()).count : 1;
    if (feedback === 'deferred') {
      if (useHearts && heartsAfter <= 0) return finish(list, true);
      return advance(list);
    }
    buzz(g.correct ? 'ok' : 'bad');
    const combo = comboOf(list);
    chime(!g.correct ? 'bad' : combo >= 3 && combo % 2 === 1 ? 'combo' : 'ok');
    setResult(g);
  }, [current, result, answer, items, hintShown, ctx, premium, useHearts, feedback, advance, finish]);

  // Whole-session timer (exams).
  useEffect(() => {
    if (!timeLimitSec) return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLimitSec]);
  useEffect(() => {
    if (timeLimitSec && left <= 0) finish(items, false, true);
  }, [left, timeLimitSec, items, finish]);

  // Per-question timer (timed challenges).
  useEffect(() => {
    if (!current?.timeLimitSec || result) return;
    setQLeft(current.timeLimitSec);
    const t = setInterval(() => setQLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [current, result]);
  useEffect(() => {
    if (current?.timeLimitSec && !result && qLeft <= 0 && Date.now() - startedAt.current > 900) submit({ timedOut: true });
  }, [qLeft, current, result, submit]);

  // Screen readers (Rilis 13): each new question takes the focus, so "Lanjut" never leaves it on nothing.
  useEffect(() => { questionRef.current?.focus({ preventScroll: true }); }, [current]);

  if (!current) return null;
  const number = items.length + (result ? 0 : 1);
  const announce = !result ? '' : result.correct ? 'Tepat, jawabanmu benar.' : `Jawabanmu belum tepat. Jawaban yang benar: ${result.correctAnswer}.`;
  const tag = result && !result.correct && result.tag ? ix?.tagById.get(result.tag) : undefined;
  const topic = ix?.topicById.get(current.topic);
  const outOfHearts = useHearts && heartsNow <= 0 && !!result;
  const combo = result?.correct ? comboOf(items) : 0;
  const host = hostOf(current.id);
  const hostMood: Mood = !result ? 'happy' : result.correct ? CHEERS[items.length % CHEERS.length] : COMFORT[items.length % COMFORT.length];

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg pt-[env(safe-area-inset-top)]">
      <header className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 pb-2 pt-3">
        <Link href={exitHref} aria-label="Keluar dari sesi" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-surface-2"><X size={22} aria-hidden /></Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-muted">{title}</p>
          <Progress value={items.length} max={Math.max(count, items.length + 1)} tone="ok" label="Progres sesi" />
        </div>
        {timeLimitSec ? (
          <Badge tone={left < 60 ? 'bad' : 'muted'}><Clock size={14} aria-hidden />{mmss(left)}</Badge>
        ) : useHearts ? (
          <Badge tone="bad"><Heart size={14} fill="currentColor" aria-hidden /><span aria-label={`${heartsNow} nyawa`}>{heartsNow}</span></Badge>
        ) : null}
      </header>
      {current.timeLimitSec && !result ? <div className="mx-auto w-full max-w-2xl px-4"><Progress value={qLeft} max={current.timeLimitSec} tone="accent" label="Sisa waktu soal" className="h-1.5" /></div> : null}

      {/* Always present, so the verdict is announced when it changes (a live region added with its text is often missed). */}
      <p className="sr-only" role="status" aria-live="polite">{announce}</p>
      <section ref={questionRef} tabIndex={0} aria-label={`Soal ${number}${count ? ` dari ${count}` : ''}`} className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 pb-6 pt-4 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand">
        <ExerciseCard key={`${current.id}:${items.length}`} ex={current} seed={`${seed}:${items.length}`} grade={result} onChange={setAnswer} onSubmit={() => submit()} host={feedback === 'deferred' ? undefined : { who: host, mood: hostMood }} />
        {hints && current.hint && !result && (
          <div className="mt-5">
            {hintShown ? (
              <div className="animate-pop rounded-xl bg-accent-soft px-4 py-3 text-sm"><span className="font-bold text-accent-strong">Petunjuk: </span>{current.hint}</div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setHintShown(true)}><Lightbulb size={16} aria-hidden />Lihat petunjuk</Button>
            )}
          </div>
        )}
      </section>

      <footer className={cx('border-t bg-surface pb-[env(safe-area-inset-bottom)] shadow-e2', result ? (result.correct ? 'border-t-4 border-ok' : 'border-t-4 border-bad') : 'border-line')}>
        <div className="mx-auto w-full max-w-2xl px-4 py-4">
          {result ? (
            <div className="animate-rise space-y-3">
              <div className="max-h-[45dvh] space-y-3 overflow-y-auto">
                <div className="flex items-center gap-3">
                  <span className="relative shrink-0">
                    <Mascot mood={result.correct ? 'cheer' : 'encourage'} size={48} decorative className="-my-1" />
                    <span className={cx('absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full text-on-brand ring-2 ring-surface', result.correct ? 'bg-ok' : 'bg-bad')}>{result.correct ? <Check size={14} aria-hidden /> : <X size={14} aria-hidden />}</span>
                  </span>
                  <p className={cx('text-xl font-extrabold', result.correct ? 'text-ok' : 'text-bad')}>{result.correct ? 'Benar!' : 'Belum tepat'}</p>
                  {combo >= 3 && <p className="combo-pop ml-auto inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-sm font-extrabold text-on-accent"><Zap size={14} fill="currentColor" aria-hidden />Kombo ×{combo}!</p>}
                </div>
                {!result.correct && (
                  <div className="rounded-xl bg-ok-soft px-3 py-2.5 text-sm">
                    <p><span className="font-bold">Jawaban benar: </span><span className="en text-base font-extrabold">{result.correctAnswer}</span></p>
                    <p className="mt-1"><span className="font-bold">Kenapa salah: </span>{result.feedback}</p>
                  </div>
                )}
                <details className="group text-sm" open={!result.correct && !!tag}>
                  <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 font-bold text-brand-ink dark:text-brand [&::-webkit-details-marker]:hidden">
                    {result.correct ? 'Lihat penjelasan' : 'Penjelasan lengkap'}<ChevronDown size={16} className="transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <div className="space-y-2 pb-1">
                    <p><span className="font-bold">Penjelasan: </span>{result.explanation}</p>
                    {tag && <p className="rounded-xl bg-surface-2 px-3 py-2 dark:bg-line/60"><span className="font-bold">Pola kesalahan: {tag.title}. </span>{tag.tip}</p>}
                    {!result.correct && topic?.lessonId && (
                      <Link href={`/app/grammar?topic=${encodeURIComponent(topic.id)}`} target="_blank" className="inline-flex min-h-11 items-center gap-1 font-bold text-brand underline"><BookOpen size={14} aria-hidden />Buka materi: {topic.title}</Link>
                    )}
                  </div>
                </details>
              </div>
              {outOfHearts ? (
                <Button full size="lg" variant="danger" onClick={() => finish(items, true)}>Nyawa habis. Lihat hasil</Button>
              ) : (
                <Button full size="lg" variant={result.correct ? 'success' : 'primary'} onClick={() => advance(items)} autoFocus>Lanjut</Button>
              )}
            </div>
          ) : (
            <Button full size="lg" disabled={!answer} onClick={() => submit()}>{feedback === 'deferred' ? 'Jawab' : 'Periksa'}</Button>
          )}
        </div>
      </footer>
    </div>
  );
}

const CONFETTI = ['#6d5ff0', '#fbbf24', '#22c55e', '#f43f5e', '#38bdf8', '#fb923c'];
/** A one-off burst of confetti (CSS only; nothing under reduced motion). */
export function Confetti({ pieces = 30 }: { pieces?: number }) {
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: pieces }, (_, i) => (
        <i key={i} style={{ left: `${(i * 37) % 100}%`, background: CONFETTI[i % CONFETTI.length], animationDelay: `${(i % 7) * 0.06}s`, ['--dx' as string]: `${((i * 53) % 120) - 60}px`, ['--rot' as string]: `${360 + ((i * 97) % 540)}deg` }} />
      ))}
    </div>
  );
}

/** Counts up to `to` once (the score on the results screen). */
function useCountUp(to: number, ms = 900) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(to); return; }
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => { const k = Math.min(1, (t - start) / ms); setN(Math.round(to * (1 - (1 - k) ** 3))); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return n;
}

/** Result screen with every question, the answer given, and the explanation. */
export function SessionSummary({ result, title, passScore, children, onRetry, doneHref, doneLabel = 'Selesai' }: { result: SessionResult; title: string; passScore?: number; children?: React.ReactNode; onRetry?: () => void; doneHref: string; doneLabel?: string }) {
  const ix = useContent();
  const passed = passScore === undefined ? result.score >= 60 : result.score >= passScore;
  const wrong = result.items.filter((i) => !i.grade.correct);
  const tags = new Map<string, number>();
  for (const w of wrong) if (w.grade.tag) tags.set(w.grade.tag, (tags.get(w.grade.tag) ?? 0) + 1);
  const shown = useCountUp(result.score);
  // Rilis 14: a fanfare and confetti when the session is passed.
  useEffect(() => { if (passed) chime('done'); }, [passed]);
  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-10">
      <Card className="relative flex flex-col items-center gap-3 overflow-hidden text-center">
        {passed && <Confetti />}
        <Mascot mood={result.score >= 90 ? 'dance' : passed ? 'cheer' : 'encourage'} size={96} />
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <Ring value={shown} tone={passed ? 'ok' : 'bad'} size={128} stroke={12}>
          <span className="font-display text-3xl font-extrabold" aria-hidden>{shown}%</span>
          <span className="sr-only">{result.score}%</span>
        </Ring>
        <p className="text-muted">{result.correct} dari {result.total} benar{passScore !== undefined && ` · batas lulus ${passScore}%`}</p>
        {result.outOfHearts && <Badge tone="bad">Sesi berhenti karena nyawa habis</Badge>}
        {result.timedOut && <Badge tone="bad">Waktu habis</Badge>}
        {children}
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          {onRetry && <Button variant="secondary" full onClick={onRetry}>Ulangi</Button>}
          <LinkButton href={doneHref} full>{doneLabel}</LinkButton>
        </div>
      </Card>

      {tags.size > 0 && ix && (
        <Card>
          <h2 className="font-extrabold">Pola kesalahan yang perlu diperbaiki</h2>
          <ul className="mt-3 space-y-3">
            {[...tags.entries()].sort((a, b) => b[1] - a[1]).map(([id, n]) => {
              const t = ix.tagById.get(id);
              if (!t) return null;
              return (
                <li key={id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-2 p-3 dark:bg-line/60">
                  <div className="min-w-0 flex-1"><p className="font-bold">{t.title} <span className="text-muted">({n}×)</span></p><p className="text-sm text-muted">{t.tip}</p></div>
                  <LinkButton href={`/app/practice?mode=drill&tag=${encodeURIComponent(id)}`} size="sm" variant="accent">Latihan perbaikan</LinkButton>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="font-extrabold">Pembahasan</h2>
        <ol className="mt-2 divide-y divide-line">
          {result.items.map((it, i) => (
            <li key={i} className={cx('border-l-4 py-3 pl-3 text-sm', it.grade.correct ? 'border-l-ok' : 'border-l-bad')}>
              <p className="font-bold">{i + 1}. {it.ex.prompt} <span className="sr-only">{it.grade.correct ? '(benar)' : '(belum tepat)'}</span></p>
              {it.ex.text && <p className="en mt-1 text-muted">{it.ex.text}</p>}
              <p className="mt-2"><span className="font-bold">Jawabanmu: </span><span className={cx('en font-bold', it.grade.correct ? 'text-ok' : 'text-bad')}>{it.grade.given || '(kosong)'}</span></p>
              {!it.grade.correct && <p><span className="font-bold">Jawaban benar: </span><span className="en font-bold">{it.grade.correctAnswer}</span></p>}
              {!it.grade.correct && <p><span className="font-bold">Kenapa salah: </span>{it.grade.feedback}</p>}
              <p><span className="font-bold">Penjelasan: </span>{it.grade.explanation}</p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
