'use client';
import { useCallback, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { CEFR_ORDER, type Cefr } from '@/lib/content/types';
import { PLACEMENT_PASS, placementBlocks, placementProgress, type PlacementProgress } from '@/lib/engine/placement';
import { setPlacement } from '@/lib/engine/state';
import { nextLesson } from '@/lib/engine/unlock';
import { useApp } from '@/lib/client/hooks';
import { act } from '@/lib/client/store';
import { Mascot } from '@/components/Mascot';
import { SessionRunner } from '@/components/SessionRunner';
import { Button, Card, LinkButton, Notice, PageHeader } from '@/components/ui';

export default function PlacementPage() {
  const { ix, learner, ent, now } = useApp();
  const blocks = useMemo(() => placementBlocks(ix.pack.exercises), [ix]);
  const [running, setRunning] = useState(false);
  const [outcome, setOutcome] = useState<PlacementProgress | null>(null);
  const total = blocks.reduce((n, b) => n + b.exercises.length, 0);
  const toResults = (h: { id: string; ok: boolean }[]) => Object.fromEntries(h.map((x) => [x.id, x.ok]));
  const next = useCallback((history: { id: string; ok: boolean; d: number }[]) => placementProgress(blocks, toResults(history)).next, [blocks]);

  if (running) {
    return <SessionRunner title="Tes penempatan" ctx="placement" next={next} total={total} feedback="deferred" seed={`placement:${learner.profile.placementAt ?? 0}`} exitHref="/app"
      onFinish={(r) => {
        const p = placementProgress(blocks, toResults(r.items.map((i) => ({ id: i.ex.id, ok: i.grade.correct }))));
        // Place the learner at the highest level that actually has lessons.
        const available = CEFR_ORDER.filter((c) => ix.pack.chapters.some((ch) => ch.level === c && !ch.planned));
        const level = ([...available].reverse().find((c) => CEFR_ORDER.indexOf(c) <= CEFR_ORDER.indexOf(p.level)) ?? 'A1') as Cefr;
        act((d, at) => setPlacement(d, level, at));
        setOutcome({ ...p, level });
        setRunning(false);
      }} />;
  }

  if (outcome) {
    const first = nextLesson(learner, ix, ent, now);
    const levelInfo = ix.pack.levels.find((l) => l.code === outcome.level);
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Card className="space-y-3 text-center">
          <Mascot mood="cheer" size={96} className="mx-auto" />
          <p className="text-sm font-bold text-muted">Level awalmu</p>
          <p className="text-5xl font-extrabold text-brand">{outcome.level}</p>
          <p className="text-lg font-bold">{levelInfo?.title}</p>
          <p className="text-muted">{levelInfo?.description}</p>
        </Card>
        <Card>
          <h2 className="font-extrabold">Rincian per level</h2>
          <ul className="mt-3 space-y-2">
            {outcome.blockScores.map((b) => (
              <li key={b.level} className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3 py-2">
                <span className={`grid h-7 w-7 place-items-center rounded-full text-on-brand ${b.passed ? 'bg-ok' : 'bg-bad'}`}>{b.passed ? <Check size={16} aria-hidden /> : <X size={16} aria-hidden />}</span>
                <span className="font-bold">{b.level}</span><span className="text-sm text-muted">{b.correct} dari {b.total} benar</span>
                <span className="ml-auto text-sm font-bold">{b.passed ? 'Dikuasai' : 'Mulai dari sini'}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">Tes berhenti di level pertama yang belum kamu kuasai (di bawah {Math.round(PLACEMENT_PASS * 100)}%). Pelajaran di level yang lebih rendah tetap terbuka kalau kamu ingin mengulang.</p>
        </Card>
        {first && <LinkButton href={`/app/lesson?id=${first.id}`} full size="lg">Mulai dari: {first.title}</LinkButton>}
        <LinkButton href="/app/path" full variant="secondary">Lihat jalur belajar</LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Tes penempatan" subtitle="Temukan level CEFR yang pas supaya kamu tidak mengulang yang sudah dikuasai dan tidak melompati dasar yang penting." />
      <Card className="space-y-3">
        <Mascot mood="think" size={88} className="mx-auto" />
        <ul className="list-disc space-y-1.5 pl-5 text-muted">
          <li>Maksimal {total} soal pilihan ganda, bertingkat dari A1 sampai C1.</li>
          <li>Tes berhenti otomatis di level pertama yang belum kamu kuasai, jadi biasanya lebih pendek.</li>
          <li>Jawab sejujurnya tanpa bantuan. Tidak ada nyawa yang berkurang dan tidak ada XP di tes ini.</li>
        </ul>
        {learner.profile.placementDone && <Notice tone="accent" title={`Hasil sebelumnya: ${learner.profile.placementLevel}`}>Mengulang tes akan mengganti level penempatanmu. Progres pelajaran tidak terhapus.</Notice>}
        <Button full size="lg" onClick={() => setRunning(true)}>Mulai tes</Button>
        <LinkButton href="/app/lesson?id=a1-greetings" full variant="secondary">Saya pemula, mulai dari awal</LinkButton>
      </Card>
    </div>
  );
}
