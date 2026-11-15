'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookHeart, Check, Crown, GitBranch, Languages, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import type { Exercise, Story } from '@/lib/content/types';
import { play, stopAudio } from '@/lib/client/audio';
import { useApp } from '@/lib/client/hooks';
import { act } from '@/lib/client/store';
import { addXp, completeStory } from '@/lib/engine/state';
import { AudioButton } from '@/components/AudioButton';
import { Mascot } from '@/components/Mascot';
import { SessionRunner, SessionSummary, type SessionResult } from '@/components/SessionRunner';
import { BACKDROP_LABEL, StoryStage } from '@/components/story/StoryStage';
import { BranchPlayer, type BranchResult } from '@/components/story/BranchPlayer';
import { Badge, Button, Card, Empty, LinkButton, PageHeader, Progress, Ring, cx } from '@/components/ui';
import { CEFR_ORDER } from '@/lib/content/types';

const TR_KEY = 'lentera.story.translation';
const SOUND_KEY = 'lentera.story.sound';

/** Every line of the story in order, with where it sits. */
function flatten(story: Story) {
  return story.scenes.flatMap((scene, si) => scene.lines.map((line, li) => ({ scene, si, line, li })));
}

function Player({ story, onDone }: { story: Story; onDone: () => void }) {
  const { ix, learner } = useApp();
  const lines = useMemo(() => flatten(story), [story]);
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(false);
  const [showTr, setShowTr] = useState(story.level === 'A1');
  const [sound, setSound] = useState(true);
  const token = useRef(0);
  const accent = learner.profile.accent;
  const cur = lines[i];
  const last = i === lines.length - 1;
  const names = new Map(story.characters.map((c) => [c.id, c]));
  const speaker = cur.line.who === 'narrator' ? null : names.get(cur.line.who);

  useEffect(() => {
    const tr = localStorage.getItem(TR_KEY);
    if (tr) setShowTr(tr === '1');
    setSound(localStorage.getItem(SOUND_KEY) !== '0');
  }, []);
  useEffect(() => () => stopAudio(), []);

  // Read the line aloud when it appears; in auto mode, move on when it ends.
  useEffect(() => {
    const t = ++token.current;
    if (!sound) {
      if (auto && !last) {
        const timer = setTimeout(() => { if (token.current === t) setI((n) => n + 1); }, 2500);
        return () => clearTimeout(timer);
      }
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    play(ix, cur.line.en, { accent }).then(() => {
      if (token.current === t && auto && !last) timer = setTimeout(() => { if (token.current === t) setI((n) => n + 1); }, 700);
    });
    return () => { if (timer) clearTimeout(timer); };
  }, [i, auto, sound, ix, accent, cur.line.en, last]);

  const go = useCallback((n: number) => { setAuto(false); stopAudio(); setI(Math.max(0, Math.min(lines.length - 1, n))); }, [lines.length]);
  const toggle = (key: string, value: boolean, set: (v: boolean) => void) => { set(value); localStorage.setItem(key, value ? '1' : '0'); };
  const onStage = cur.scene.actors.map((a) => names.get(a.who)?.name).filter(Boolean);
  const label = `Adegan ${cur.si + 1} dari ${story.scenes.length}: ${onStage.join(', ')} di ${BACKDROP_LABEL[cur.scene.backdrop]}.`;

  return (
    <div className="mx-auto max-w-2xl space-y-3 pb-6">
      <div className="flex items-center gap-2">
        <LinkButton href="/app/stories" size="sm" variant="ghost" aria-label="Kembali ke daftar cerita"><ArrowLeft size={18} aria-hidden /></LinkButton>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-extrabold">{story.title}</h1>
          <Progress value={i + 1} max={lines.length} label="Kemajuan cerita" className="mt-1 h-2" />
        </div>
        <Button size="sm" variant="ghost" aria-pressed={sound} aria-label={sound ? 'Matikan suara otomatis' : 'Nyalakan suara otomatis'} onClick={() => { if (sound) stopAudio(); toggle(SOUND_KEY, !sound, setSound); }}>
          {sound ? <Volume2 size={18} aria-hidden /> : <VolumeX size={18} aria-hidden />}
        </Button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
        <div key={cur.si} className="animate-pop">
          <StoryStage scene={cur.scene} characters={story.characters} speaker={cur.line.who} speakerPose={cur.line.pose} beat={i} label={label} />
        </div>
      </div>

      <Card className="space-y-2" aria-live="polite">
        <div className="flex items-center gap-2">
          {speaker ? (
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-extrabold text-white" style={{ background: speaker.shirt }}>{speaker.name}</span>
          ) : (
            <Badge tone="muted">Narator</Badge>
          )}
          <span className="text-xs text-muted">Adegan {cur.si + 1}/{story.scenes.length} · kalimat {i + 1}/{lines.length}</span>
        </div>
        <p className={cx('en text-xl font-bold leading-snug', !speaker && 'italic')} data-line={i}>{cur.line.en}</p>
        {showTr && <p className="text-sm text-muted">{cur.line.tr}</p>}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <AudioButton text={cur.line.en} size="sm" label="Dengarkan kalimat ini" />
          <Button size="sm" variant="ghost" aria-pressed={showTr} onClick={() => toggle(TR_KEY, !showTr, setShowTr)}><Languages size={16} aria-hidden />{showTr ? 'Sembunyikan terjemahan' : 'Terjemahan'}</Button>
          <Button size="sm" variant="ghost" aria-pressed={auto} onClick={() => setAuto((a) => !a)}>{auto ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}{auto ? 'Jeda' : 'Putar otomatis'}</Button>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button variant="secondary" disabled={i === 0} onClick={() => go(i - 1)} aria-label="Kalimat sebelumnya"><ArrowLeft size={18} aria-hidden /></Button>
        {last ? (
          <Button full size="lg" onClick={() => { stopAudio(); onDone(); }}>Jawab {story.questionIds.length} pertanyaan<ArrowRight size={18} aria-hidden /></Button>
        ) : (
          <Button full size="lg" onClick={() => go(i + 1)}>Lanjut<ArrowRight size={18} aria-hidden /></Button>
        )}
      </div>
    </div>
  );
}

/** End of a branching story: the ending reached, the score, and every choice with its explanation. */
function BranchEnd({ story, result, onReplay }: { story: Story; result: BranchResult; onReplay: () => void }) {
  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-10">
      <Card className="flex flex-col items-center gap-3 text-center">
        <Mascot mood={result.ending.good ? (result.score >= 90 ? 'dance' : 'cheer') : 'encourage'} size={88} />
        <Badge tone={result.ending.good ? 'ok' : 'accent'}>{result.ending.good ? 'Akhir terbaik' : 'Akhir lain'}</Badge>
        <h1 className="text-2xl font-extrabold">{result.ending.title}</h1>
        <p className="text-muted">{result.ending.text}</p>
        <Ring value={result.score} tone={result.score >= 80 ? 'ok' : 'accent'} size={110}><span className="text-2xl font-extrabold">{result.score}%</span></Ring>
        <p className="text-sm text-muted">Nilai dari ketepatan dan kewajaran setiap jawabanmu.</p>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button variant="secondary" full onClick={onReplay}>Coba jalur lain</Button>
          <LinkButton href="/app/stories" full>Cerita lain</LinkButton>
        </div>
      </Card>
      <Card>
        <h2 className="font-extrabold">Pilihanmu</h2>
        <ol className="mt-3 space-y-3" data-branch-review>
          {result.picks.map(({ node, choice }, k) => (
            <li key={k} className={cx('rounded-2xl border-2 p-3 text-sm', choice.correct && choice.natural === 3 ? 'border-ok/40' : choice.correct ? 'border-accent/50' : 'border-bad/50')}>
              <p className="font-bold">{k + 1}. {node.ask ?? story.title}</p>
              <p className="en mt-1 font-bold">{choice.text}</p>
              <p className="mt-1">{choice.note}</p>
              {choice.better && <p className="mt-1"><span className="font-bold">Lebih baik: </span><span className="en">{choice.better}</span></p>}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function StoryView({ story }: { story: Story }) {
  const { ix, learner } = useApp();
  const [phase, setPhase] = useState<'intro' | 'story' | 'questions' | 'result'>('intro');
  const [result, setResult] = useState<SessionResult | null>(null);
  const [branchResult, setBranchResult] = useState<BranchResult | null>(null);
  const [run, setRun] = useState(0);
  const questions = useMemo(() => story.questionIds.map((q) => ix.exerciseById.get(q)).filter((e): e is Exercise => !!e), [story, ix]);
  const done = learner.rewards[`story:${story.id}`];

  if (story.branch) {
    if (phase === 'story') {
      return <BranchPlayer key={run} story={story} onDone={(r) => {
        act((d, at) => { const first = !d.rewards[`story:${story.id}`]; completeStory(d, story.id, at); if (first) addXp(d, Math.round(r.score / 5), 'story', at, story.id); });
        setBranchResult(r);
        setPhase('result');
      }} />;
    }
    if (phase === 'result' && branchResult) return <BranchEnd story={story} result={branchResult} onReplay={() => { setBranchResult(null); setRun((n) => n + 1); setPhase('story'); }} />;
  }
  if (phase === 'story') return <Player story={story} onDone={() => setPhase('questions')} />;
  if (phase === 'questions') {
    return <SessionRunner title={story.title} ctx="story" exercises={questions} feedback="immediate" seed={story.id} exitHref="/app/stories"
      onFinish={(r) => { act((d, at) => completeStory(d, story.id, at)); setResult(r); setPhase('result'); }} />;
  }
  if (phase === 'result' && result) {
    return <SessionSummary result={result} title="Cerita selesai" doneHref="/app/stories" doneLabel="Cerita lain" onRetry={() => { setResult(null); setPhase('story'); }} />;
  }
  const first = story.scenes[0];
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title={story.title} subtitle={story.branch ? `Level ${story.level} · cerita bercabang · ${story.branch.nodes.filter((n) => n.choices?.length).length} keputusan` : `Level ${story.level} · ${story.scenes.length} adegan · ${questions.length} pertanyaan`} />
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
        <StoryStage scene={{ ...first, lines: [] }} characters={story.characters} beat={0} label={`Pembuka cerita ${story.title}`} />
      </div>
      <Card className="space-y-3">
        <p>{story.summary}</p>
        <ul className="flex flex-wrap gap-2" aria-label="Tokoh">
          {story.characters.map((c) => <li key={c.id} className="rounded-full px-2.5 py-0.5 text-xs font-extrabold text-white" style={{ background: c.shirt }}>{c.name}</li>)}
        </ul>
        <p className="text-sm text-muted">{story.branch
          ? `Kamu berperan sebagai ${story.characters.find((c) => c.id === story.branch!.as)?.name ?? 'tokoh utama'}. Di setiap keputusan, pilih apa yang dikatakannya. Setiap pilihan dijelaskan, dan pilihanmu menentukan jalan serta akhir cerita.`
          : 'Setiap kalimat dibacakan. Ketuk Lanjut untuk kalimat berikutnya, atau pilih Putar otomatis. Setelah cerita selesai, jawab beberapa pertanyaan.'}</p>
        {done && <Badge tone="ok"><Check size={12} aria-hidden />Sudah pernah diselesaikan</Badge>}
      </Card>
      <Button full size="lg" onClick={() => setPhase('story')}><Play size={18} aria-hidden />Mulai cerita</Button>
    </div>
  );
}

function Stories() {
  const params = useSearchParams();
  const id = params.get('id');
  const { ix, learner } = useApp();
  const story = id ? ix.pack.stories?.find((s) => s.id === id) : undefined;

  if (id && !story) return <Empty title="Cerita tidak ditemukan" action={<LinkButton href="/app/stories">Semua cerita</LinkButton>} />;
  if (story?.locked) return <Empty title={story.decisions ? 'Cerita bercabang Premium' : 'Cerita Premium'} action={<LinkButton href="/app/subscription" variant="accent">Lihat Premium</LinkButton>}>{story.title}: {story.summary}{story.decisions ? ` Kamu yang menentukan jalannya lewat ${story.decisions} keputusan, dan setiap pilihan dijelaskan.` : ''}</Empty>;
  if (story) return <StoryView key={story.id} story={story} />;

  const list = ix.pack.stories ?? [];
  return (
    <div>
      <PageHeader title="Cerita Bergambar" subtitle="Cerita pendek beranimasi dengan tokoh yang sama: dengarkan tiap kalimat, lihat terjemahannya bila perlu, lalu jawab pertanyaannya." />
      {list.length === 0 ? (
        <Empty title="Cerita sedang disiapkan">
          <div className="flex justify-center"><Mascot mood="think" size={80} /></div>
        </Empty>
      ) : CEFR_ORDER.map((level) => {
        const items = list.filter((s) => s.level === level);
        if (!items.length) return null;
        return (
          <section key={level} className="mb-6" aria-labelledby={`level-${level}`}>
            <h2 id={`level-${level}`} className="mb-3 text-sm font-extrabold uppercase tracking-wide text-muted">Level {level} · {ix.pack.levels.find((x) => x.code === level)?.title}</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map((s) => {
                const done = learner.rewards[`story:${s.id}`];
                return (
                  <Card as="li" key={s.id} className={cx('flex flex-col gap-2', s.locked && 'opacity-80')}>
                    <div className="flex flex-wrap items-center gap-2"><Badge>{s.level}</Badge><Badge tone="muted">{s.branch || s.decisions ? <GitBranch size={12} aria-hidden /> : <BookHeart size={12} aria-hidden />}{s.branch || s.decisions ? 'Bercabang' : 'Cerita'}</Badge>{s.locked ? <Badge tone="accent"><Crown size={12} aria-hidden />Premium</Badge> : done ? <Badge tone="ok"><Check size={12} aria-hidden />Selesai</Badge> : null}</div>
                    <h3 className="font-extrabold">{s.title}</h3>
                    <p className="text-sm text-muted">{s.summary}</p>
                    <LinkButton href={s.locked ? '/app/subscription' : `/app/stories?id=${s.id}`} size="sm" variant={s.locked ? 'accent' : done ? 'secondary' : 'primary'} className="mt-auto">{s.locked ? 'Buka dengan Premium' : done ? 'Baca lagi' : 'Mulai cerita'}</LinkButton>
                  </Card>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export default function StoriesPage() {
  return <Suspense><Stories /></Suspense>;
}
