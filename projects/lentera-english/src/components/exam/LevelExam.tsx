'use client';
// CEFR-style level exam (Rilis 3). The questions come from the server without
// keys, the answers go back to the server for grading, and only then does the
// learner see the keys and explanations. A draft (questions, answers, start
// time) is kept on the device so a reload or a dropped connection loses nothing
// and does not reset the clock.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Award, BookOpen, Check, Clock, Headphones, PenLine, Printer, X } from 'lucide-react';
import type { ExamDef, ExamSectionKind, Exercise } from '@/lib/content/types';
import type { Answer, Grade } from '@/lib/engine/grading';
import { RETAKE_HOURS, weakTopics, type SectionResult } from '@/lib/engine/levelExam';
import { topicPool } from '@/lib/engine/sessions';
import { recordExam } from '@/lib/engine/state';
import { examOpensAt, levelExamStatus } from '@/lib/engine/unlock';
import { planWaitReason } from '@/lib/engine/plan';
import type { Cefr } from '@/lib/content/types';
import { api, ApiError } from '@/lib/client/api';
import { useApp, useNow } from '@/lib/client/hooks';
import { act } from '@/lib/client/store';
import { AudioButton } from '@/components/AudioButton';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Mascot } from '@/components/Mascot';
import { Badge, Button, Card, LinkButton, Notice, PageHeader, Progress, Ring, cx, dateTimeId, inputClass } from '@/components/ui';

interface StartSection { id: string; kind: ExamSectionKind; title: string; passScore: number; questions: Exercise[]; writing?: { prompt: string; minWords: number } }
interface Started { attempt: number; startedAt?: number | null; timeLimitSec: number; certificate: string | null; sections: StartSection[] }
interface Draft { attempt: number; startedAt: number; data: Started; answers: Record<string, Answer>; writing: string }
export interface Submitted {
  attempt: number;
  score: number;
  passed: boolean;
  sections: SectionResult[];
  byTopic: { topic: string; correct: number; total: number; score: number }[];
  items: { sectionId: string; ex: Exercise; grade: Grade }[];
  certificate: string | null;
  /** Sent after the time limit (checked on the server): scored but not passed. */
  late?: boolean;
  nextAt: number | null;
  /** Kept on the device for the review page. */
  writing?: string;
  at?: number;
}

const ICON: Record<ExamSectionKind, typeof BookOpen> = { grammar: PenLine, reading: BookOpen, listening: Headphones, writing: PenLine };
const draftKey = (user: string, exam: string) => `lentera.exam.${user}.${exam}`;
const resultKey = (user: string, exam: string) => `lentera.exam-result.${user}.${exam}`;
const read = <T,>(key: string): T | null => { try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : null; } catch { return null; } };
const write = (key: string, v: unknown) => { try { if (v === null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage full or blocked: the exam still works */ } };
const words = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
const clock = (ms: number) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

export function LevelExam({ exam }: { exam: ExamDef }) {
  const { ix, learner, ent, now } = useApp();
  const user = learner.userId;
  const [draft, setDraft] = useState<Draft | null>(null);
  const [result, setResult] = useState<Submitted | null>(null);
  const [view, setView] = useState<'intro' | 'run' | 'result'>('intro');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [certs, setCerts] = useState<{ code: string; exam: string }[]>([]);

  // A draft left by a reload resumes the attempt; the last result stays reviewable.
  useEffect(() => {
    const d = read<Draft>(draftKey(user, exam.id));
    if (d && d.data?.sections?.length) { setDraft(d); setView('run'); }
    setResult(read<Submitted>(resultKey(user, exam.id)));
    api<{ certificates: { code: string; exam: string }[] }>('/api/certificates').then((r) => setCerts(r.certificates ?? [])).catch(() => setCerts([]));
  }, [user, exam.id]);

  const attempts = learner.exams[exam.id]?.attempts ?? [];
  const last = attempts.at(-1);
  // The weekly plan holds the exam back until its week (16 Nov 2026).
  const planWait = examOpensAt(learner, ix, exam, ent, now);
  const rawStatus = levelExamStatus(learner, ix, exam.ref as Cefr, ent, now);
  const status = rawStatus === 'available' && planWait ? 'locked' : rawStatus;
  const waitUntil = last && !last.passed ? last.at + RETAKE_HOURS * 3600 * 1000 : 0;
  const required = last && !last.passed ? (last.weak ?? []) : [];
  const pending = required.filter((t) => (learner.rewards[`practice:${t}`] ?? 0) <= (last?.at ?? 0));
  const cert = certs.find((c) => c.exam === exam.id)?.code ?? result?.certificate ?? null;
  const sections = exam.sections ?? [];

  async function start() {
    setBusy(true);
    setError('');
    try {
      const data = await api<Started>('/api/exams/level', { body: { action: 'start', id: exam.id } });
      // The server's start time wins, so the clock is the same on every device.
      const d: Draft = { attempt: data.attempt, startedAt: data.startedAt ?? Date.now(), data, answers: {}, writing: '' };
      write(draftKey(user, exam.id), d);
      setDraft(d);
      setView('run');
    } catch (e) {
      setError(e instanceof ApiError && e.code === 'cooldown' ? 'Jeda sebelum mengulang belum selesai.' : (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const finish = useCallback((res: Submitted, writing: string) => {
    const at = Date.now();
    const weak = res.passed ? [] : weakTopics(res, (t) => topicPool(ix, t).length > 0);
    act((d) => void recordExam(d, ix, exam, res.score, at, res.passed, weak));
    const saved = { ...res, writing, at };
    write(resultKey(user, exam.id), saved);
    write(draftKey(user, exam.id), null);
    setResult(saved);
    setDraft(null);
    setView('result');
    if (res.certificate) setCerts((c) => [...c.filter((x) => x.exam !== exam.id), { code: res.certificate!, exam: exam.id }]);
  }, [ix, exam, user]);

  if (view === 'run' && draft) {
    return <ExamRunner exam={exam} draft={draft} storageKey={draftKey(user, exam.id)} onDone={finish}
      onStale={() => { write(draftKey(user, exam.id), null); setDraft(null); setView('intro'); setError('Percobaan ini sudah pernah dikumpulkan (mungkin dari perangkat lain). Mulai ujian lagi bila sudah boleh.'); }} />;
  }
  if (view === 'result' && result) return <ExamResult exam={exam} res={result} onBack={() => setView('intro')} />;

  const canStart = (status === 'available' || status === 'passed') && now >= waitUntil && pending.length === 0;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title={exam.title} subtitle={`Empat bagian · ${Math.round(exam.timeLimitSec / 60)} menit · dinilai di server`} />
      {cert && (
        <Notice tone="ok" title="Kamu sudah lulus level ini">
          Sertifikatmu bisa dilihat, dicetak, dan diverifikasi siapa pun dengan kodenya.
          <LinkButton href={`/sertifikat?kode=${cert}`} size="sm" className="mt-2"><Award size={16} aria-hidden /> Lihat sertifikat</LinkButton>
        </Notice>
      )}
      <Card className="space-y-3">
        <h2 className="font-extrabold">Isi ujian</h2>
        <ul className="divide-y divide-line">
          {sections.map((s) => {
            const Icon = ICON[s.kind];
            return (
              <li key={s.id} className="flex items-center gap-3 py-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand"><Icon size={18} aria-hidden /></span>
                <span className="flex-1 font-bold">{s.title}</span>
                <span className="text-sm text-muted">{s.kind === 'writing' ? '1 tugas' : `${s.count ?? s.take} soal`} · min. {s.passScore}%</span>
              </li>
            );
          })}
        </ul>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Lulus bila <b>setiap bagian</b> mencapai batasnya dan <b>rata-rata keempat bagian</b> minimal {exam.passScore}%.</li>
          <li>Soal diambil dari bank khusus ujian yang tidak muncul di pelajaran, dan dinilai di server. Kunci dan pembahasan muncul setelah kamu mengumpulkan.</li>
          <li>Waktu dihitung server sejak kamu menekan Mulai dan terus berjalan walau halaman tertutup atau kamu pindah perangkat. Jawaban tersimpan otomatis; buka lagi ujian ini untuk melanjutkan. Jawaban yang dikumpulkan setelah waktu habis tidak bisa lulus.</li>
          <li>Bagian menulis diperiksa dengan daftar periksa (panjang, unsur wajib, tanda baca), bukan dinilai oleh guru.</li>
          <li>Belum lulus? Kamu bisa mengulang setelah jeda {RETAKE_HOURS} jam dan setelah menuntaskan latihan wajib untuk topik yang lemah.</li>
          <li>Lulus pertama kali memberimu sertifikat penyelesaian dari Lentera English dengan kode verifikasi. Ini bukan sertifikat CEFR resmi.</li>
        </ul>
      </Card>

      {status === 'premium' && <Notice tone="accent" title="Ujian level termasuk Premium"><LinkButton href="/app/subscription" size="sm" variant="accent" className="mt-2">Lihat paket</LinkButton></Notice>}
      {status === 'locked' && (planWait
        ? <Notice tone="muted" title="Ujian ini terbuka minggu depan">{planWaitReason(planWait, now)} <LinkButton href="/app/plan" size="sm" variant="secondary" className="mt-2">Lihat rencana mingguan</LinkButton></Notice>
        : <Notice tone="muted" title="Ujian masih terkunci">Tuntaskan semua pelajaran dan ujian unit di level {exam.ref} terlebih dahulu.</Notice>)}
      {(status === 'available' || status === 'passed') && (
        <Card className="space-y-3">
          {now < waitUntil && <Notice tone="muted" title="Jeda sebelum mengulang">Ujian bisa diulang mulai {dateTimeId(waitUntil)}. Gunakan waktunya untuk latihan di bawah.</Notice>}
          {pending.length > 0 && (
            <Notice tone="accent" title="Latihan wajib sebelum mengulang">
              <ul className="mt-1 space-y-2">
                {pending.map((t) => (
                  <li key={t} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold">{ix.topicById.get(t)?.title ?? t}</span>
                    <LinkButton href={`/app/practice?mode=topic&topic=${encodeURIComponent(t)}&exam=${exam.id}`} size="sm" variant="accent">Latihan</LinkButton>
                  </li>
                ))}
              </ul>
            </Notice>
          )}
          {required.length > 0 && pending.length === 0 && now < waitUntil && <p className="text-sm text-ok">Latihan wajib sudah tuntas.</p>}
          {error && <Notice tone="bad">{error}</Notice>}
          <Button full size="lg" disabled={!canStart || busy} onClick={start}>{busy ? 'Menyiapkan soal…' : attempts.length ? (status === 'passed' ? 'Ulangi ujian (sertifikat tidak berubah)' : 'Ulangi ujian') : 'Mulai ujian'}</Button>
        </Card>
      )}

      {result && (
        <Card className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1"><p className="font-extrabold">Hasil terakhir: {result.score}% · {result.passed ? 'lulus' : 'belum lulus'}</p><p className="text-sm text-muted">Pembahasan lengkap tersimpan di perangkat ini.</p></div>
          <Button variant="secondary" size="sm" onClick={() => setView('result')}>Lihat pembahasan</Button>
        </Card>
      )}
      {attempts.length > 0 && (
        <Card>
          <h2 className="font-extrabold">Riwayat percobaan</h2>
          <ul className="mt-2 divide-y divide-line">{[...attempts].reverse().map((a, i) => <li key={i} className="flex items-center justify-between py-2 text-sm"><span>{dateTimeId(a.at)}</span><Badge tone={a.passed ? 'ok' : 'bad'}>{a.score}% · {a.passed ? 'lulus' : 'belum lulus'}</Badge></li>)}</ul>
        </Card>
      )}
    </div>
  );
}

function ExamRunner({ exam, draft, storageKey, onDone, onStale }: { exam: ExamDef; draft: Draft; storageKey: string; onDone: (r: Submitted, writing: string) => void; onStale: () => void }) {
  const now = useNow(1000);
  const [answers, setAnswers] = useState<Record<string, Answer>>(draft.answers);
  const [writing, setWriting] = useState(draft.writing);
  const [current, setCurrent] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const sent = useRef(false);
  const { sections } = draft.data;
  const deadline = draft.startedAt + draft.data.timeLimitSec * 1000;
  const left = deadline - now;
  const initial = useRef(draft.answers).current;

  useEffect(() => { write(storageKey, { ...draft, answers, writing }); }, [storageKey, draft, answers, writing]);

  const setAnswer = useCallback((id: string, a: Answer | null) => {
    setAnswers((prev) => {
      if (!a) { if (!(id in prev)) return prev; const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: a };
    });
  }, []);

  const submit = useCallback(async () => {
    if (sent.current) return;
    sent.current = true;
    setSending(true);
    setError('');
    try {
      const res = await api<Submitted>('/api/exams/level', { body: { action: 'submit', id: exam.id, attempt: draft.attempt, answers, writing } });
      onDone(res, writing);
    } catch (e) {
      sent.current = false;
      setSending(false);
      if (e instanceof ApiError && e.code === 'stale_attempt') onStale();
      else setError(`${(e as Error).message} Jawabanmu tetap tersimpan; coba kumpulkan lagi.`);
    }
  }, [exam.id, draft.attempt, answers, writing, onDone, onStale]);

  // Time is up: hand in what is there, once. If that fails (offline), the button stays for another try.
  const autoSent = useRef(false);
  useEffect(() => { if (left <= 0 && !autoSent.current) { autoSent.current = true; void submit(); } }, [left, submit]);

  const answered = (s: StartSection) => (s.kind === 'writing' ? (writing.trim() ? 1 : 0) : s.questions.filter((q) => answers[q.id]).length);
  const total = (s: StartSection) => (s.kind === 'writing' ? 1 : s.questions.length);
  const empty = sections.reduce((n, s) => n + total(s) - answered(s), 0);

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-10">
      <div className="sticky top-0 z-10 -mx-4 space-y-2 bg-bg/95 px-4 py-2 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate font-extrabold">{exam.title}</p>
          <Badge tone={left < 5 * 60 * 1000 ? 'bad' : 'muted'}><Clock size={14} aria-hidden /> <span aria-live="polite">{clock(left)}</span></Badge>
        </div>
        <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Bagian ujian">
          {sections.map((s, i) => (
            <button key={s.id} type="button" role="tab" aria-selected={i === current} onClick={() => setCurrent(i)}
              className={cx('shrink-0 rounded-xl border-2 px-3 py-1.5 text-sm font-bold', i === current ? 'border-brand bg-brand-soft' : 'border-line bg-surface')}>
              {i + 1}. {s.title} <span className="text-muted">{answered(s)}/{total(s)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Every section stays mounted, so moving between them keeps the answers on screen. */}
      {sections.map((s, i) => (
        <section key={s.id} hidden={i !== current} aria-label={s.title} className="space-y-4">
          <h2 className="text-xl font-extrabold">Bagian {i + 1}: {s.title}</h2>
          {s.kind === 'reading' && s.questions[0]?.context && <Card><p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand">Teks bacaan</p><div className="en whitespace-pre-line leading-relaxed">{s.questions[0].context}</div></Card>}
          {s.kind === 'listening' && s.questions[0]?.audioText && (
            <Card className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-brand">Rekaman</p>
              <AudioButton text={s.questions[0].audioText} size="lg" label="Putar rekaman" showSource />
              <p className="text-sm text-muted">Dengarkan dulu sampai selesai, lalu jawab keempat pertanyaan. Kamu boleh memutarnya lagi.</p>
            </Card>
          )}
          {s.kind === 'writing' && s.writing && (
            <Card className="space-y-3">
              <p className="font-bold">{s.writing.prompt}</p>
              <textarea value={writing} onChange={(e) => setWriting(e.target.value)} rows={10} lang="en" spellCheck={false} aria-label="Tulisanmu" className={cx(inputClass, 'en leading-relaxed')} placeholder="Tulis dalam bahasa Inggris…" />
              <p className={cx('text-sm', words(writing) >= s.writing.minWords ? 'text-ok' : 'text-muted')}>{words(writing)} kata · minimal {s.writing.minWords}</p>
            </Card>
          )}
          {s.questions.map((q, qi) => (
            <Card key={q.id}>
              <p className="mb-2 text-xs font-bold text-muted">Soal {qi + 1} dari {s.questions.length}</p>
              <ExerciseCard ex={s.kind === 'reading' ? { ...q, context: undefined } : s.kind === 'listening' ? { ...q, audioText: undefined } : q}
                seed={`${exam.id}:${draft.attempt}`} initial={initial[q.id]} onChange={(a) => setAnswer(q.id, a)} />
            </Card>
          ))}
        </section>
      ))}

      {left <= 0 && <Notice tone="bad" title="Waktu habis">Jawabanmu dikumpulkan apa adanya.</Notice>}
      {error && <Notice tone="bad">{error}</Notice>}
      {confirm ? (
        <Card className="space-y-3">
          <p className="font-bold">{empty ? `Masih ada ${empty} soal atau tugas yang kosong. Yang kosong dihitung salah.` : 'Semua sudah terisi.'} Kumpulkan sekarang? Jawaban tidak bisa diubah setelah dikumpulkan.</p>
          <div className="flex gap-2"><Button variant="secondary" full onClick={() => setConfirm(false)}>Periksa lagi</Button><Button full disabled={sending} onClick={submit}>{sending ? 'Menilai…' : 'Ya, kumpulkan'}</Button></div>
        </Card>
      ) : (
        <div className="flex gap-2">
          {current > 0 && <Button variant="secondary" full onClick={() => { setCurrent(current - 1); window.scrollTo(0, 0); }}>Bagian sebelumnya</Button>}
          {current < sections.length - 1
            ? <Button full onClick={() => { setCurrent(current + 1); window.scrollTo(0, 0); }}>Bagian berikutnya</Button>
            : <Button full disabled={sending} onClick={() => setConfirm(true)}>Kumpulkan ujian</Button>}
        </div>
      )}
      {sending && <p className="text-center text-sm text-muted">Menilai jawabanmu…</p>}
    </div>
  );
}

export function ExamResult({ exam, res, onBack }: { exam: ExamDef; res: Submitted; onBack: () => void }) {
  const { ix } = useApp();
  const remedy = (topic: string) => {
    if (topic === 'skill.reading') return { href: '/app/stories', label: 'Latihan membaca (cerita)' };
    if (topic === 'skill.listening') return { href: '/app/listening', label: 'Latihan menyimak' };
    const t = ix.topicById.get(topic);
    return t?.lessonId ? { href: `/app/lesson?id=${t.lessonId}&revise=1`, label: 'Pelajari lagi' } : null;
  };
  const bySection = useMemo(() => {
    const m = new Map<string, Submitted['items']>();
    for (const it of res.items) m.set(it.sectionId, [...(m.get(it.sectionId) ?? []), it]);
    return m;
  }, [res.items]);

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-10">
      <Card className="flex flex-col items-center gap-3 text-center">
        <Mascot mood={res.passed ? 'cheer' : 'encourage'} size={88} />
        <h1 className="text-2xl font-extrabold">{res.passed ? `Lulus: ${exam.title}` : `Belum lulus: ${exam.title}`}</h1>
        <Ring value={res.score} tone={res.passed ? 'ok' : 'bad'} size={120}><span className="text-3xl font-extrabold">{res.score}%</span></Ring>
        <p className="text-muted">Rata-rata keempat bagian · batas lulus {exam.passScore}% dan setiap bagian mencapai batasnya</p>
        {res.certificate && <LinkButton href={`/sertifikat?kode=${res.certificate}`} variant="accent"><Printer size={16} aria-hidden /> Lihat & cetak sertifikat</LinkButton>}
        {res.late && <Notice tone="bad" title="Dikumpulkan setelah waktu habis">Nilainya tetap dihitung untuk pembahasan, tetapi percobaan yang melewati batas waktu tidak bisa lulus.</Notice>}
        {!res.passed && <p className="text-sm text-muted">Ujian bisa diulang setelah jeda {RETAKE_HOURS} jam{res.nextAt ? ` (mulai ${dateTimeId(res.nextAt)})` : ''}, setelah latihan wajib untuk topik terlemah.</p>}
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button variant="secondary" full onClick={onBack}>Kembali ke ujian</Button>
          <LinkButton href="/app/path" full>Ke jalur belajar</LinkButton>
        </div>
      </Card>

      <Card>
        <h2 className="font-extrabold">Nilai per bagian</h2>
        <ul className="mt-3 space-y-3">
          {res.sections.map((s) => (
            <li key={s.id}>
              <div className="flex items-center justify-between text-sm"><span className="font-bold">{s.passed ? <Check size={14} className="inline text-ok" aria-hidden /> : <X size={14} className="inline text-bad" aria-hidden />} {s.title}</span><span className="font-bold">{s.score}% <span className="font-normal text-muted">(min. {s.passScore}%)</span></span></div>
              <Progress value={s.score} tone={s.passed ? 'ok' : 'accent'} className="h-2" label={s.title} />
              {s.checklist && (
                <ul className="mt-2 space-y-1 text-sm">
                  {s.checklist.map((c, i) => <li key={i} className={c.ok ? 'text-ok' : 'text-bad'}>{c.ok ? '✓' : '✗'} {c.label}</li>)}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </Card>

      {res.byTopic.length > 0 && (
        <Card>
          <h2 className="font-extrabold">Nilai per topik</h2>
          <p className="text-sm text-muted">Topik di bawah 60% punya tautan untuk memperbaikinya.</p>
          <ul className="mt-3 space-y-3">
            {[...res.byTopic].sort((a, b) => a.score - b.score).map((t) => {
              const r = t.score < 60 ? remedy(t.topic) : null;
              return (
                <li key={t.topic}>
                  <div className="flex justify-between gap-2 text-sm"><span>{ix.topicById.get(t.topic)?.title ?? t.topic}</span><span className="font-bold">{t.correct}/{t.total}</span></div>
                  <Progress value={t.score} tone={t.score >= 60 ? 'ok' : 'accent'} className="h-2" label={t.topic} />
                  {r && (
                    <div className="mt-1 flex flex-wrap gap-2">
                      <LinkButton href={r.href} size="sm" variant="secondary">{r.label}</LinkButton>
                      {!t.topic.startsWith('skill.') && <LinkButton href={`/app/practice?mode=topic&topic=${encodeURIComponent(t.topic)}&exam=${exam.id}`} size="sm" variant="accent">Latihan topik</LinkButton>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="font-extrabold">Pembahasan</h2>
        {res.sections.map((s) => {
          const items = bySection.get(s.id) ?? [];
          if (s.kind === 'writing') {
            return (
              <section key={s.id} className="mt-4">
                <h3 className="font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">Tulisanmu:</p>
                <p className="en mt-1 whitespace-pre-line rounded-2xl bg-surface-2 p-3 text-sm">{res.writing?.trim() || '(kosong)'}</p>
              </section>
            );
          }
          return (
            <section key={s.id} className="mt-4">
              <h3 className="font-bold">{s.title} · {s.correct}/{s.total}</h3>
              {s.kind === 'reading' && items[0]?.ex.context && <details className="mt-1 text-sm"><summary className="cursor-pointer font-bold text-brand">Teks bacaan</summary><p className="en mt-1 rounded-2xl bg-surface-2 p-3">{items[0].ex.context}</p></details>}
              {s.kind === 'listening' && items[0]?.ex.audioText && <details className="mt-1 text-sm"><summary className="cursor-pointer font-bold text-brand">Transkrip rekaman</summary><p className="en mt-1 rounded-2xl bg-surface-2 p-3">{items[0].ex.audioText}</p></details>}
              <ol className="mt-2 space-y-3">
                {items.map(({ ex, grade }, i) => (
                  <li key={ex.id} className={cx('rounded-2xl border-2 p-3 text-sm', grade.correct ? 'border-ok/40' : 'border-bad/50')}>
                    <p className="font-bold">{i + 1}. {ex.prompt}</p>
                    {ex.text && <p className="en mt-1 text-muted">{ex.text}</p>}
                    <p className="mt-2"><span className="font-bold">Jawabanmu: </span><span className={cx('en font-bold', grade.correct ? 'text-ok' : 'text-bad')}>{grade.given || '(kosong)'}</span></p>
                    {!grade.correct && <p><span className="font-bold">Jawaban benar: </span><span className="en font-bold">{grade.correctAnswer}</span></p>}
                    {!grade.correct && grade.feedback && <p><span className="font-bold">Kenapa salah: </span>{grade.feedback}</p>}
                    <p><span className="font-bold">Penjelasan: </span>{grade.explanation}</p>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </Card>
    </div>
  );
}
