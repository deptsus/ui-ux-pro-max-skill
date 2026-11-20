'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import type { Exercise, HomeworkDef } from '@/lib/content/types';
import { weekStart } from '@/lib/engine/plan';
import { assignHomework, submitHomework } from '@/lib/engine/state';
import { allHomework, isWeekly, weeklyId, WEEKLY } from '@/lib/engine/weekly';
import { checkWriting, countWords } from '@/lib/engine/writing';
import { useApp } from '@/lib/client/hooks';
import { act } from '@/lib/client/store';
import { SessionRunner, SessionSummary, type SessionResult } from '@/components/SessionRunner';
import { HomeworkCalendar, type CalendarItem } from '@/components/homework/HomeworkCalendar';
import { ReminderToggle } from '@/components/homework/ReminderToggle';
import { Badge, Button, Card, Empty, LinkButton, Notice, PageHeader, cx, dateId, dateTimeId, inputClass } from '@/components/ui';

const KIND: Record<HomeworkDef['kind'], string> = { vocabulary: 'Kosakata', grammar: 'Tata bahasa', translation: 'Terjemahan', reading: 'Membaca', listening: 'Menyimak', construction: 'Menyusun kalimat', writing: 'Menulis' };

function Writing({ def }: { def: HomeworkDef }) {
  const { learner } = useApp();
  const rec = learner.homework[def.id];
  const [text, setText] = useState(rec?.submissions.at(-1)?.text ?? '');
  const [checked, setChecked] = useState<ReturnType<typeof checkWriting> | null>(null);
  const w = def.writing!;
  const words = countWords(text);
  const levels = w.levels?.length ? w.levels : [{ label: 'Contoh jawaban', text: w.model, note: '' }];
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title={def.title} subtitle={w.prompt} />
      {w.source && (
        <Card>
          <p className="mb-2 text-xs font-bold text-brand-ink dark:text-brand">Teks sumber</p>
          <p className="en whitespace-pre-line leading-relaxed">{w.source}</p>
        </Card>
      )}
      <textarea value={text} onChange={(e) => { setText(e.target.value); setChecked(null); }} rows={w.minWords >= 100 ? 12 : 7} lang="en" spellCheck={false} aria-label="Tulisanmu" placeholder="Write here..." className={`${inputClass} en`} />
      <p className={cx('text-sm', words >= w.minWords && (!w.maxWords || words <= w.maxWords) ? 'text-ok' : 'text-muted')}>{words} kata · {w.maxWords ? `${w.minWords}–${w.maxWords}` : `minimal ${w.minWords}`}</p>
      <Button full disabled={text.trim().length < 5} onClick={() => { const c = checkWriting(text, w); setChecked(c); act((d, at) => submitHomework(d, def, c.score, at, text)); }}>Kumpulkan</Button>
      {checked && (
        <Card className="space-y-3">
          <h2 className="font-extrabold">Hasil pemeriksaan · {checked.score}%</h2>
          <ul className="space-y-1.5">{checked.items.map((i) => <li key={i.label} className="flex items-start gap-2"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${i.ok ? 'bg-ok' : 'bg-bad'}`} />{i.label}{!i.ok && <span className="font-bold text-bad">belum terpenuhi</span>}</li>)}</ul>
          <Notice tone="muted">Pemeriksaan ini berbasis daftar periksa, bukan penilaian mutu tulisan. {levels.length > 1 ? 'Semua contoh di bawah lolos daftar periksa yang sama; bandingkan tulisanmu dengan tiap tingkat untuk melihat apa yang membuat tulisan lebih baik.' : 'Bandingkan tulisanmu dengan contoh di bawah untuk menilai sendiri tata bahasa dan pilihan katamu.'}</Notice>
          <div className="space-y-2">
            <p className="text-sm font-bold">{levels.length > 1 ? 'Contoh jawaban bertingkat' : 'Contoh jawaban'}</p>
            {levels.map((l, i) => (
              <details key={l.label} open={i === levels.length - 1} className="rounded-2xl bg-surface-2 p-3">
                <summary className="cursor-pointer font-bold">{levels.length > 1 ? `${i + 1}. ${l.label}` : l.label} <span className="font-normal text-muted">· {countWords(l.text)} kata</span></summary>
                <p className="en mt-2 leading-relaxed">{l.text}</p>
                {l.note && <p className="mt-2 text-sm text-muted"><span className="font-bold text-ink">Catatan: </span>{l.note}</p>}
              </details>
            ))}
          </div>
          <LinkButton href="/app/homework" variant="secondary" full>Kembali ke Pusat PR</LinkButton>
        </Card>
      )}
    </div>
  );
}

function WeeklyNote({ id }: { id: string }) {
  const { ix, learner } = useApp();
  const parts = learner.homework[id]?.parts;
  if (!parts) return null;
  const names = parts.topics.map((t) => ix.topicById.get(t)?.title ?? t);
  return (
    <p className="text-sm text-muted">
      {parts.fromTopics > 0 && <>{parts.fromTopics} soal dari topik minggu ini{names.length ? ` (${names.join(', ')})` : ''}</>}
      {parts.fromTopics > 0 && parts.fromMistakes > 0 && ' · '}
      {parts.fromMistakes > 0 && <>{parts.fromMistakes} soal dari kesalahanmu sendiri</>}
    </p>
  );
}

function Homework() {
  const params = useSearchParams();
  const id = params.get('id');
  const { ix, learner, now } = useApp();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SessionResult | null>(null);
  const defs = useMemo(() => allHomework(ix, learner), [ix, learner]);
  const def = id ? defs.find((h) => h.id === id) : undefined;
  const exercises = useMemo(() => (def?.exerciseIds ?? []).map((x) => ix.exerciseById.get(x)).filter((e): e is Exercise => !!e), [def, ix]);

  if (id && !def) return <Empty title="PR tidak ditemukan" action={<LinkButton href="/app/homework">Pusat PR</LinkButton>} />;
  if (def?.writing) return <Writing def={def} />;
  if (def && running) {
    return <SessionRunner title={`PR: ${def.title}`} ctx="homework" exercises={exercises} feedback="immediate" seed={`${def.id}:${learner.homework[def.id]?.submissions.length ?? 0}`} exitHref="/app/homework"
      onFinish={(r) => { act((d, at) => submitHomework(d, def, r.score, at)); setResult(r); setRunning(false); }} />;
  }
  if (def && result) return <SessionSummary result={result} title="PR dikumpulkan" doneHref="/app/homework" doneLabel="Kembali ke Pusat PR" onRetry={() => { setResult(null); setRunning(true); }}><Notice tone="ok" title="Tersimpan di riwayat pengumpulan">Kamu boleh mengerjakan ulang untuk memperbaiki nilai.</Notice></SessionSummary>;
  if (def) {
    const rec = learner.homework[def.id];
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <PageHeader title={def.title} subtitle={`${isWeekly(def.id) ? 'PR mingguan' : KIND[def.kind]} · ${exercises.length} soal · pembahasan muncul setelah tiap jawaban`} />
        {isWeekly(def.id) && <Card className="space-y-1"><p className="font-bold">Disusun khusus untukmu</p><WeeklyNote id={def.id} /><p className="text-sm text-muted">Soalnya dipilih dengan aturan tetap dari kemajuanmu sendiri, tanpa AI, dan tidak berubah sampai minggu berakhir.</p></Card>}
        {rec && <Notice tone={rec.submissions.length ? 'ok' : now > rec.dueAt ? 'bad' : 'accent'} title={`Tenggat ${dateTimeId(rec.dueAt)}`}>{rec.submissions.length ? `Sudah ${rec.submissions.length}× dikumpulkan.` : now > rec.dueAt ? 'Tenggat sudah lewat. PR tetap bisa dikumpulkan dan dicatat sebagai terlambat.' : 'Belum dikumpulkan.'}</Notice>}
        <Button full size="lg" disabled={!exercises.length} onClick={() => { act((d, at) => assignHomework(d, def, at)); setRunning(true); }}>{rec?.submissions.length ? 'Kerjakan ulang' : 'Kerjakan PR'}</Button>
        {rec?.submissions.length ? (
          <Card><h2 className="font-extrabold">Riwayat pengumpulan</h2><ul className="mt-2 divide-y divide-line">{[...rec.submissions].reverse().map((s, i) => <li key={i} className="flex items-center justify-between py-2 text-sm"><span>{dateTimeId(s.at)}{s.late && <Badge tone="bad" className="ml-2">Terlambat</Badge>}</span><span className="font-extrabold">{s.score}%</span></li>)}</ul></Card>
        ) : null}
      </div>
    );
  }

  const assigned = defs.filter((h) => learner.homework[h.id]);
  const pending = assigned.filter((h) => !learner.homework[h.id].submissions.length).sort((a, b) => learner.homework[a.id].dueAt - learner.homework[b.id].dueAt);
  const submitted = assigned.filter((h) => learner.homework[h.id].submissions.length).sort((a, b) => learner.homework[b.id].submissions.at(-1)!.at - learner.homework[a.id].submissions.at(-1)!.at);
  const startedChapters = new Set(Object.keys(learner.lessons).map((l) => ix.unitById.get(ix.lessonById.get(l)?.unitId ?? '')?.chapterId));
  const available = ix.pack.homework.filter((h) => !learner.homework[h.id] && !h.lessonId && startedChapters.has(h.chapterId));
  const total = ix.pack.homework.filter((h) => startedChapters.has(h.chapterId)).length + assigned.filter((h) => isWeekly(h.id)).length;
  const thisWeek = weeklyId(weekStart(now));
  const weekly = learner.homework[thisWeek] ? defs.find((h) => h.id === thisWeek) : undefined;
  const calendar: CalendarItem[] = assigned.map((h) => {
    const r = learner.homework[h.id];
    return { id: h.id, title: h.title, dueAt: r.dueAt, status: r.submissions.length ? 'done' : now > r.dueAt ? 'overdue' : 'pending' };
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Pusat PR" subtitle="PR tiap pelajaran, tugas bab (kosakata, menyimak, menulis), dan PR mingguan yang disusun dari kemajuanmu sendiri." action={total > 0 ? <Badge tone="ok">{submitted.length}/{total} dikumpulkan</Badge> : undefined} />

      {weekly ? (
        <Card className={cx('space-y-2 border-2', learner.homework[weekly.id].submissions.length ? 'border-ok/40' : 'border-accent')}>
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="text-accent-strong" size={20} aria-hidden />
            <h2 className="min-w-0 flex-1 font-extrabold">{weekly.title}</h2>
            {learner.homework[weekly.id].submissions.length ? <Badge tone="ok">{learner.homework[weekly.id].submissions.at(-1)!.score}%</Badge> : <Badge tone="accent"><Clock size={12} aria-hidden />Tenggat {dateId(learner.homework[weekly.id].dueAt, { weekday: 'long', day: 'numeric', month: 'short' })}</Badge>}
          </div>
          <WeeklyNote id={weekly.id} />
          <LinkButton href={`/app/homework?id=${weekly.id}`} size="sm" variant={learner.homework[weekly.id].submissions.length ? 'secondary' : 'primary'}>{learner.homework[weekly.id].submissions.length ? 'Lihat' : 'Kerjakan PR mingguan'}</LinkButton>
        </Card>
      ) : (
        <Card className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 shrink-0 text-brand" aria-hidden />
          <p className="text-sm text-muted"><span className="font-bold text-ink">PR Mingguan</span> disusun setiap minggu dari topik yang kamu pelajari dalam 7 hari terakhir dan kesalahanmu sendiri (sekitar {WEEKLY.size} soal). Kerjakan beberapa latihan dulu; PR-nya muncul di sini begitu bahannya cukup.</p>
        </Card>
      )}

      {calendar.length > 0 && <HomeworkCalendar items={calendar} now={now} />}
      <ReminderToggle />

      {assigned.length === 0 && available.length === 0 && <Empty title="Belum ada PR" action={<LinkButton href="/app/path">Buka jalur belajar</LinkButton>}>PR pertama diberikan pada langkah ke-6 setiap pelajaran.</Empty>}
      {pending.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-extrabold">Harus dikerjakan</h2>
          <ul className="space-y-3">
            {pending.map((h) => {
              const rec = learner.homework[h.id];
              const overdue = now > rec.dueAt;
              return (
                <li key={h.id}><Card className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1 basis-48"><p className="font-extrabold">{h.title}</p><p className="text-sm text-muted">{isWeekly(h.id) ? 'PR mingguan' : KIND[h.kind]} · {h.writing ? 'tugas menulis' : `${h.exerciseIds.length} soal`}</p></div>
                  <Badge tone={overdue ? 'bad' : 'accent'}><Clock size={12} aria-hidden />{overdue ? 'Lewat tenggat' : `Tenggat ${dateId(rec.dueAt, { day: 'numeric', month: 'short' })}`}</Badge>
                  <LinkButton href={`/app/homework?id=${h.id}`} size="sm">Kerjakan</LinkButton>
                </Card></li>
              );
            })}
          </ul>
        </section>
      )}
      {available.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-extrabold">Tugas bab yang bisa diambil</h2>
          <ul className="space-y-3">
            {available.map((h) => (
              <li key={h.id}><Card className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1 basis-48"><p className="font-extrabold">{h.title}</p><p className="text-sm text-muted">{KIND[h.kind]} · tenggat {h.dueDays} hari setelah diambil</p></div>
                <Button size="sm" variant="secondary" onClick={() => act((d, at) => assignHomework(d, h, at))}>Ambil tugas</Button>
              </Card></li>
            ))}
          </ul>
        </section>
      )}
      {submitted.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-extrabold">Sudah dikumpulkan</h2>
          <ul className="space-y-3">
            {submitted.map((h) => {
              const last = learner.homework[h.id].submissions.at(-1)!;
              return (
                <li key={h.id}><Card className="flex flex-wrap items-center gap-3">
                  <CheckCircle2 className="text-ok" aria-hidden />
                  <div className="min-w-0 flex-1 basis-48"><p className="font-extrabold">{h.title}</p><p className="text-sm text-muted">{isWeekly(h.id) ? 'PR mingguan' : KIND[h.kind]} · {dateTimeId(last.at)}{last.late && ' · terlambat'}</p></div>
                  <Badge tone={last.score >= 70 ? 'ok' : 'bad'}>{last.score}%</Badge>
                  <LinkButton href={`/app/homework?id=${h.id}`} size="sm" variant="secondary">Detail</LinkButton>
                </Card></li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function HomeworkPage() {
  return <Suspense><Homework /></Suspense>;
}
