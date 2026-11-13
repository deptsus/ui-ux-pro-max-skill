'use client';
// Adaptive practice: remediation drills, topic practice, delayed retests and
// timed challenges. Question selection is rule-based (see engine/sessions).
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { DRILL, MASTERY } from '@/lib/engine/config';
import { retestReady } from '@/lib/engine/mastery';
import { buildRetest, buildTimedRound, nextLadderItem, tagPool, topicPool } from '@/lib/engine/sessions';
import { addXp, finishDrill, finishRetest } from '@/lib/engine/state';
import { useApp } from '@/lib/client/hooks';
import { act } from '@/lib/client/store';
import { Mascot } from '@/components/Mascot';
import { SessionRunner, SessionSummary, type SessionResult } from '@/components/SessionRunner';
import { Button, Card, Empty, LinkButton, Notice, dateTimeId } from '@/components/ui';

function Practice() {
  const params = useSearchParams();
  const mode = params.get('mode') ?? 'drill';
  const tagId = params.get('tag') ?? '';
  const topicId = params.get('topic') ?? '';
  const { ix, learner, now } = useApp();
  const [round, setRound] = useState(1);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [outcome, setOutcome] = useState<boolean | null>(null);

  const tag = ix.tagById.get(tagId);
  const topic = ix.topicById.get(mode === 'drill' ? tag?.topic ?? '' : topicId);
  const pool = useMemo(() => (mode === 'drill' ? tagPool(ix, tagId) : mode === 'topic' ? topicPool(ix, topicId) : []), [ix, mode, tagId, topicId]);
  const seed = `${mode}:${tagId || topicId}:${round}:${learner.userId}`;
  const fixed = useMemo(() => (mode === 'retest' ? buildRetest(ix, topicId, seed) : mode === 'timed' ? buildTimedRound(ix, learner, seed) : undefined), [ix, mode, topicId, seed, running]); // eslint-disable-line react-hooks/exhaustive-deps
  const next = useCallback((history: { id: string; ok: boolean; d: number }[]) => nextLadderItem(pool, history, seed), [pool, seed]);

  const title = mode === 'drill' ? `Latihan perbaikan: ${tag?.title ?? ''}` : mode === 'topic' ? `Latihan: ${topic?.title ?? ''}` : mode === 'retest' ? `Tes ulang: ${topic?.title ?? ''}` : 'Tantangan Kilat';
  const stat = learner.topics[topicId];
  const lessonHref = topic?.lessonId ? `/app/lesson?id=${topic.lessonId}&revise=1` : '/app/grammar';

  if (running) {
    return (
      <SessionRunner key={seed} title={title} seed={seed} exitHref="/app"
        ctx={mode === 'drill' || mode === 'topic' ? 'drill' : mode === 'retest' ? 'retest' : 'timed'}
        exercises={fixed} next={fixed ? undefined : next} total={fixed ? undefined : Math.min(DRILL.size, pool.length)}
        feedback={mode === 'retest' ? 'deferred' : 'immediate'}
        onFinish={(r) => {
          if (mode === 'drill') act((d, at) => setOutcome(finishDrill(d, tagId, r.score, at)));
          else if (mode === 'retest') act((d, at) => setOutcome(finishRetest(d, topicId, r.score, at)));
          else if (mode === 'timed' && r.score === 100) act((d, at) => addXp(d, 10, 'timed-perfect', at));
          setResult(r);
          setRunning(false);
        }} />
    );
  }

  if (result) {
    return (
      <SessionSummary result={result} title={title} passScore={mode === 'timed' ? undefined : mode === 'retest' ? MASTERY.retestPassScore : DRILL.passScore} onRetry={mode === 'retest' ? undefined : () => { setRound((n) => n + 1); setResult(null); setRunning(true); }} doneHref="/app">
        {mode === 'drill' && (outcome ? <Notice tone="ok" title="Pola kesalahan ini teratasi">Rekomendasi perbaikan dicabut. Kalau kesalahan yang sama muncul lagi, latihan ini akan ditawarkan kembali.</Notice> : <Notice tone="bad" title={`Butuh ${DRILL.passScore}% untuk lulus latihan perbaikan`}>Baca lagi materinya, lalu ulangi. Soal mulai dari yang mudah dan naik bertahap.</Notice>)}
        {mode === 'drill' && !outcome && <LinkButton href={lessonHref} variant="secondary" full>Buka materi</LinkButton>}
        {mode === 'retest' && (outcome ? <Notice tone="ok" title="Topik resmi dikuasai">Kamu membuktikannya dua kali di hari berbeda. Topik ini sekarang masuk ulangan berjangka panjang.</Notice> : <Notice tone="bad" title="Belum terkonfirmasi">Butuh {MASTERY.retestPassScore}% pada tes ulang. Status topik kembali ke &ldquo;berlatih&rdquo;; kumpulkan lagi bukti penguasaan lalu coba tes ulang berikutnya.</Notice>)}
        {mode === 'timed' && result.score === 100 && <Notice tone="accent" title="Sempurna!">Bonus 10 XP untuk ronde tanpa salah.</Notice>}
      </SessionSummary>
    );
  }

  if ((mode === 'drill' && !tag) || ((mode === 'topic' || mode === 'retest') && !topic)) return <Empty title="Latihan tidak ditemukan" action={<LinkButton href="/app">Ke beranda</LinkButton>} />;
  if ((mode === 'drill' || mode === 'topic') && pool.length === 0) return <Empty title="Soal untuk latihan ini termasuk Premium" action={<LinkButton href="/app/subscription" variant="accent">Lihat Premium</LinkButton>}>Bank soal untuk topik ini belum tersedia di paket gratis.</Empty>;
  if (mode === 'retest' && !retestReady(stat, now)) {
    return <Empty title="Tes ulang belum tersedia" action={<LinkButton href="/app">Ke beranda</LinkButton>}>{stat?.stage === 'mastered' ? 'Topik ini sudah dikuasai.' : stat?.retestDueAt ? `Tes ulang dibuka ${dateTimeId(stat.retestDueAt)}. Jeda ini disengaja agar yang diuji adalah ingatan jangka panjang.` : 'Capai skor penguasaan 85% pada topik ini terlebih dahulu.'}</Empty>;
  }
  if (mode === 'timed' && (!fixed || fixed.length < 4)) return <Empty title="Belum cukup materi" action={<LinkButton href="/app/path">Ke jalur belajar</LinkButton>}>Selesaikan satu pelajaran dulu supaya ada bahan untuk Tantangan Kilat.</Empty>;

  return (
    <div className="mx-auto max-w-xl">
      <Card className="space-y-3 text-center">
        <Mascot mood={mode === 'timed' ? 'cheer' : 'think'} size={88} className="mx-auto" />
        <h1 className="text-2xl font-extrabold">{title}</h1>
        {mode === 'drill' && tag && (
          <>
            <Notice tone="accent" title="Ingat aturannya">{tag.tip}</Notice>
            <p className="text-muted">Hingga {Math.min(DRILL.size, pool.length)} soal khusus untuk pola ini. Mulai dari yang mudah; dua jawaban benar berturut-turut menaikkan tingkat kesulitan, jawaban salah menurunkannya. Lulus dengan {DRILL.passScore}%.</p>
          </>
        )}
        {mode === 'topic' && <p className="text-muted">Latihan bertingkat untuk menaikkan skor penguasaanmu (sekarang {stat?.score ?? 0}%). Butuh 85% untuk membuka tes ulang.</p>}
        {mode === 'retest' && <p className="text-muted">{MASTERY.retestSize} soal campuran tanpa petunjuk. Lulus dengan {MASTERY.retestPassScore}% untuk mengonfirmasi penguasaan topik ini.</p>}
        {mode === 'timed' && <p className="text-muted">{fixed!.length} soal cepat dari materi yang sudah kamu pelajari, 12 detik per soal. Ronde sempurna mendapat bonus XP.</p>}
        <Button full size="lg" onClick={() => setRunning(true)}>Mulai</Button>
        {mode !== 'timed' && <LinkButton href={lessonHref} variant="secondary" full>Baca materi dulu</LinkButton>}
      </Card>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense>
      <Practice />
    </Suspense>
  );
}
