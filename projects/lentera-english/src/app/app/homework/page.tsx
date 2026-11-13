'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import type { Exercise, HomeworkDef } from '@/lib/content/types';
import { assignHomework, submitHomework } from '@/lib/engine/state';
import { useApp } from '@/lib/client/hooks';
import { act } from '@/lib/client/store';
import { SessionRunner, SessionSummary, type SessionResult } from '@/components/SessionRunner';
import { Badge, Button, Card, Empty, LinkButton, Notice, PageHeader, dateId, dateTimeId, inputClass } from '@/components/ui';

const KIND: Record<HomeworkDef['kind'], string> = { vocabulary: 'Kosakata', grammar: 'Tata bahasa', translation: 'Terjemahan', reading: 'Membaca', listening: 'Menyimak', construction: 'Menyusun kalimat', writing: 'Menulis singkat' };

/** Deterministic checklist for short writing. It checks form, not quality. */
function checkWriting(text: string, w: NonNullable<HomeworkDef['writing']>) {
  const lower = ` ${text.toLowerCase().replace(/[‘’]/g, "'")} `;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const items = [
    { label: `Minimal ${w.minWords} kata (kamu menulis ${words})`, ok: words >= w.minWords },
    ...w.mustInclude.map((rule) => {
      const [label, alts] = rule.split('::');
      return { label, ok: alts.split('|').some((a) => lower.includes(a)) };
    }),
    { label: 'Tiap kalimat diakhiri tanda baca', ok: /[.!?]\s*$/.test(text.trim()) },
  ];
  return { items, score: Math.round((items.filter((i) => i.ok).length / items.length) * 100) };
}

function Writing({ def }: { def: HomeworkDef }) {
  const { learner } = useApp();
  const rec = learner.homework[def.id];
  const [text, setText] = useState(rec?.submissions.at(-1)?.text ?? '');
  const [checked, setChecked] = useState<ReturnType<typeof checkWriting> | null>(null);
  const w = def.writing!;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title={def.title} subtitle={w.prompt} />
      <textarea value={text} onChange={(e) => { setText(e.target.value); setChecked(null); }} rows={7} lang="en" spellCheck={false} aria-label="Tulisanmu" placeholder="Write here..." className={`${inputClass} en`} />
      <Button full disabled={text.trim().length < 5} onClick={() => { const c = checkWriting(text, w); setChecked(c); act((d, at) => submitHomework(d, def, c.score, at, text)); }}>Kumpulkan</Button>
      {checked && (
        <Card className="space-y-3">
          <h2 className="font-extrabold">Hasil pemeriksaan · {checked.score}%</h2>
          <ul className="space-y-1.5">{checked.items.map((i) => <li key={i.label} className="flex items-start gap-2"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${i.ok ? 'bg-ok' : 'bg-bad'}`} />{i.label}{!i.ok && <span className="font-bold text-bad">belum terpenuhi</span>}</li>)}</ul>
          <Notice tone="muted">Pemeriksaan ini berbasis daftar periksa, bukan penilaian mutu tulisan. Bandingkan tulisanmu dengan contoh di bawah untuk menilai sendiri tata bahasa dan pilihan katamu.</Notice>
          <div><p className="text-sm font-bold">Contoh jawaban</p><p className="en mt-1 rounded-2xl bg-surface-2 p-3">{w.model}</p></div>
          <LinkButton href="/app/homework" variant="secondary" full>Kembali ke Pusat PR</LinkButton>
        </Card>
      )}
    </div>
  );
}

function Homework() {
  const params = useSearchParams();
  const id = params.get('id');
  const { ix, learner, now } = useApp();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SessionResult | null>(null);
  const def = id ? ix.pack.homework.find((h) => h.id === id) : undefined;
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
        <PageHeader title={def.title} subtitle={`${KIND[def.kind]} · ${exercises.length} soal · pembahasan muncul setelah tiap jawaban`} />
        {rec && <Notice tone={rec.submissions.length ? 'ok' : now > rec.dueAt ? 'bad' : 'accent'} title={`Tenggat ${dateId(rec.dueAt)}`}>{rec.submissions.length ? `Sudah ${rec.submissions.length}× dikumpulkan.` : now > rec.dueAt ? 'Tenggat sudah lewat. PR tetap bisa dikumpulkan dan dicatat sebagai terlambat.' : 'Belum dikumpulkan.'}</Notice>}
        <Button full size="lg" onClick={() => { act((d, at) => assignHomework(d, def, at)); setRunning(true); }}>{rec?.submissions.length ? 'Kerjakan ulang' : 'Kerjakan PR'}</Button>
        {rec?.submissions.length ? (
          <Card><h2 className="font-extrabold">Riwayat pengumpulan</h2><ul className="mt-2 divide-y divide-line">{[...rec.submissions].reverse().map((s, i) => <li key={i} className="flex items-center justify-between py-2 text-sm"><span>{dateTimeId(s.at)}{s.late && <Badge tone="bad" className="ml-2">Terlambat</Badge>}</span><span className="font-extrabold">{s.score}%</span></li>)}</ul></Card>
        ) : null}
      </div>
    );
  }

  const assigned = ix.pack.homework.filter((h) => learner.homework[h.id]);
  const pending = assigned.filter((h) => !learner.homework[h.id].submissions.length).sort((a, b) => learner.homework[a.id].dueAt - learner.homework[b.id].dueAt);
  const submitted = assigned.filter((h) => learner.homework[h.id].submissions.length);
  const startedChapters = new Set(Object.keys(learner.lessons).map((l) => ix.unitById.get(ix.lessonById.get(l)?.unitId ?? '')?.chapterId));
  const available = ix.pack.homework.filter((h) => !learner.homework[h.id] && !h.lessonId && startedChapters.has(h.chapterId));
  const total = ix.pack.homework.filter((h) => startedChapters.has(h.chapterId)).length;

  return (
    <div>
      <PageHeader title="Pusat PR" subtitle="Tiap pelajaran memberi PR bertenggat, dan tiap bab punya tugas kosakata, membaca, menyimak, dan menulis." action={total > 0 ? <Badge tone="ok">{submitted.length}/{total} dikumpulkan</Badge> : undefined} />
      {assigned.length === 0 && available.length === 0 && <Empty title="Belum ada PR" action={<LinkButton href="/app/path">Buka jalur belajar</LinkButton>}>PR pertama diberikan pada langkah ke-6 setiap pelajaran.</Empty>}
      {pending.length > 0 && <h2 className="mb-2 text-lg font-extrabold">Harus dikerjakan</h2>}
      <ul className="space-y-3">
        {pending.map((h) => {
          const rec = learner.homework[h.id];
          const overdue = now > rec.dueAt;
          return (
            <li key={h.id}><Card className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1"><p className="font-extrabold">{h.title}</p><p className="text-sm text-muted">{KIND[h.kind]} · {h.writing ? 'tugas menulis' : `${h.exerciseIds.length} soal`}</p></div>
              <Badge tone={overdue ? 'bad' : 'accent'}><Clock size={12} aria-hidden />{overdue ? 'Lewat tenggat' : `Tenggat ${dateId(rec.dueAt, { day: 'numeric', month: 'short' })}`}</Badge>
              <LinkButton href={`/app/homework?id=${h.id}`} size="sm">Kerjakan</LinkButton>
            </Card></li>
          );
        })}
      </ul>
      {available.length > 0 && <h2 className="mb-2 mt-6 text-lg font-extrabold">Tugas bab yang bisa diambil</h2>}
      <ul className="space-y-3">
        {available.map((h) => (
          <li key={h.id}><Card className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1"><p className="font-extrabold">{h.title}</p><p className="text-sm text-muted">{KIND[h.kind]} · tenggat {h.dueDays} hari setelah diambil</p></div>
            <Button size="sm" variant="secondary" onClick={() => act((d, at) => assignHomework(d, h, at))}>Ambil tugas</Button>
          </Card></li>
        ))}
      </ul>
      {submitted.length > 0 && <h2 className="mb-2 mt-6 text-lg font-extrabold">Sudah dikumpulkan</h2>}
      <ul className="space-y-3">
        {submitted.map((h) => {
          const last = learner.homework[h.id].submissions.at(-1)!;
          return (
            <li key={h.id}><Card className="flex flex-wrap items-center gap-3">
              <CheckCircle2 className="text-ok" aria-hidden />
              <div className="min-w-0 flex-1"><p className="font-extrabold">{h.title}</p><p className="text-sm text-muted">{KIND[h.kind]} · {dateTimeId(last.at)}{last.late && ' · terlambat'}</p></div>
              <Badge tone={last.score >= 70 ? 'ok' : 'bad'}>{last.score}%</Badge>
              <LinkButton href={`/app/homework?id=${h.id}`} size="sm" variant="secondary">Detail</LinkButton>
            </Card></li>
          );
        })}
      </ul>
    </div>
  );
}

export default function HomeworkPage() {
  return <Suspense><Homework /></Suspense>;
}
