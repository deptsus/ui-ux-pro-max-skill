'use client';
// Branching story player (Rilis 5). The opening scenes play line by line as in
// a normal story; then, at each node, the learner picks what their character
// says, sees why the reply works (or not), and the choice decides the next
// scene, until an ending.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Languages, MessageCircle, Volume2, VolumeX, X } from 'lucide-react';
import type { Story, StoryChoice, StoryLine, StoryNode, StoryScene } from '@/lib/content/types';
import { play, stopAudio } from '@/lib/client/audio';
import { useApp } from '@/lib/client/hooks';
import { buzz } from '@/lib/client/prefs';
import { shuffle } from '@/lib/engine/grading';
import { branchScore, type BranchPick, type BranchResult } from '@/lib/engine/branch';
import { AudioButton } from '@/components/AudioButton';
import { BACKDROP_LABEL, StoryStage } from './StoryStage';
import { Badge, Button, Card, LinkButton, NameChip, Progress, cx } from '@/components/ui';

export type { BranchPick, BranchResult };

const TR_KEY = 'lentera.story.translation';
const SOUND_KEY = 'lentera.story.sound';

export function BranchPlayer({ story, onDone }: { story: Story; onDone: (r: BranchResult) => void }) {
  const { ix, learner } = useApp();
  const branch = story.branch!;
  const nodes = useMemo(() => new Map(branch.nodes.map((n) => [n.id, n])), [branch]);
  const names = useMemo(() => new Map(story.characters.map((c) => [c.id, c])), [story]);
  const [nodeId, setNodeId] = useState<string | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<StoryChoice | null>(null);
  const [picks, setPicks] = useState<BranchPick[]>([]);
  const [showTr, setShowTr] = useState(false);
  const [sound, setSound] = useState(true);
  const accent = learner.profile.accent;

  const node = nodeId ? nodes.get(nodeId)! : null;
  const lines: { scene: StoryScene; line: StoryLine }[] = useMemo(
    () => (node ? node.scene.lines.map((line) => ({ scene: node.scene, line })) : story.scenes.flatMap((scene) => scene.lines.map((line) => ({ scene, line })))),
    [node, story.scenes],
  );
  const atEnd = i >= lines.length - 1;
  const cur = lines[Math.min(i, lines.length - 1)];
  const choosing = !!node?.choices?.length && atEnd && !picked;
  const ended = !!node?.ending && atEnd;
  const order = useMemo(() => (node?.choices ? shuffle(node.choices.map((_, k) => k), `${story.id}:${node.id}:${picks.length}`) : []), [node, story.id, picks.length]);

  useEffect(() => {
    const tr = localStorage.getItem(TR_KEY);
    if (tr) setShowTr(tr === '1');
    setSound(localStorage.getItem(SOUND_KEY) !== '0');
  }, []);
  useEffect(() => () => stopAudio(), []);
  // Read each line aloud as it appears, and the learner's reply once chosen (unless sound is off).
  useEffect(() => {
    const text = picked ? picked.text : cur?.line.en;
    if (sound && text) void play(ix, text, { accent });
  }, [i, nodeId, picked, sound, ix, accent, cur?.line.en]);

  const next = useCallback(() => {
    stopAudio();
    if (!atEnd) return setI((n) => n + 1);
    if (!node) { setNodeId(branch.start); setI(0); }
  }, [atEnd, node, branch.start]);

  function choose(c: StoryChoice) {
    buzz(c.correct && c.natural === 3 ? 'ok' : 'bad');
    setPicked(c);
    setPicks((p) => [...p, { node: node!, choice: c }]);
  }
  function goOn() {
    stopAudio();
    const target = picked!.next;
    setPicked(null);
    setNodeId(target);
    setI(0);
  }

  const speaker = picked ? branch.as : cur.line.who;
  const who = speaker === 'narrator' ? null : names.get(speaker);
  const scene = node ? node.scene : cur.scene;
  const onStage = scene.actors.map((a) => names.get(a.who)?.name).filter(Boolean);
  // Paths differ in length: measure against the longest one, and fill the bar at an ending.
  const steps = useMemo(() => {
    const depth = (id: string): number => { const n = nodes.get(id); return n?.choices?.length ? 1 + Math.max(...n.choices.map((c) => depth(c.next))) : 0; };
    return depth(branch.start);
  }, [nodes, branch.start]);
  const me = names.get(branch.as);

  return (
    <div className="mx-auto max-w-2xl space-y-3 pb-6">
      <div className="flex items-center gap-2">
        <LinkButton href="/app/stories" size="sm" variant="ghost" aria-label="Kembali ke daftar cerita"><ArrowLeft size={18} aria-hidden /></LinkButton>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-extrabold">{story.title}</h1>
          <Progress value={ended ? steps + 1 : node ? picks.length + (picked ? 1 : 0.5) : 0.25} max={steps + 1} label="Kemajuan cerita" className="mt-1 h-2" />
        </div>
        {me && <Badge tone="brand">Kamu: {me.name}</Badge>}
        <Button size="sm" variant="ghost" aria-pressed={sound} aria-label={sound ? 'Matikan suara otomatis' : 'Nyalakan suara otomatis'} onClick={() => { if (sound) stopAudio(); setSound(!sound); localStorage.setItem(SOUND_KEY, sound ? '0' : '1'); }}>
          {sound ? <Volume2 size={18} aria-hidden /> : <VolumeX size={18} aria-hidden />}
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div key={`${nodeId ?? 'intro'}:${picked ? 'reply' : 'scene'}`} className="animate-pop">
          <StoryStage scene={scene} characters={story.characters} speaker={speaker} speakerPose={picked ? (picked.correct && picked.natural === 3 ? 'happy' : 'think') : cur.line.pose} beat={i + picks.length * 10}
            label={`${onStage.join(', ')} di ${BACKDROP_LABEL[scene.backdrop]}.`} />
        </div>
      </div>

      {!picked && (
        <Card className="space-y-2" aria-live="polite">
          <div className="flex items-center gap-2">
            {who ? <NameChip name={who.name} color={who.shirt} /> : <Badge tone="muted">Narator</Badge>}
          </div>
          <p className={cx('en text-xl font-bold leading-snug', !who && 'italic')} data-line={`${nodeId ?? 'intro'}-${i}`}>{cur.line.en}</p>
          {showTr && <p className="text-sm text-muted">{cur.line.tr}</p>}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <AudioButton text={cur.line.en} size="sm" label="Dengarkan kalimat ini" />
            <Button size="sm" variant="ghost" aria-pressed={showTr} onClick={() => { setShowTr(!showTr); localStorage.setItem(TR_KEY, showTr ? '0' : '1'); }}><Languages size={16} aria-hidden />{showTr ? 'Sembunyikan terjemahan' : 'Terjemahan'}</Button>
          </div>
        </Card>
      )}

      {choosing && (
        <Card className="space-y-3" as="section">
          <p className="flex items-center gap-2 font-extrabold"><MessageCircle size={18} className="text-brand" aria-hidden />{node!.ask ?? 'Apa yang kamu katakan?'}</p>
          <div className="grid gap-2" role="group" aria-label="Pilihan jawaban">
            {order.map((k) => (
              <button key={k} type="button" onClick={() => choose(node!.choices![k])} className="en min-h-12 rounded-xl tile border-line bg-surface px-4 py-3 text-left font-semibold hover:bg-surface-2">
                {node!.choices![k].text}
              </button>
            ))}
          </div>
        </Card>
      )}

      {picked && (
        <Card className={cx('space-y-2 border-2', picked.correct ? (picked.natural === 3 ? 'border-ok/50' : 'border-accent/60') : 'border-bad/50')} aria-live="polite">
          <div className="flex flex-wrap items-center gap-2">
            {me && <NameChip name={me.name} color={me.shirt} />}
            {!picked.correct ? <Badge tone="bad"><X size={12} aria-hidden />Salah tata bahasa</Badge> : picked.natural === 3 ? <Badge tone="ok"><Check size={12} aria-hidden />Tepat dan wajar</Badge> : <Badge tone="accent">Benar, tetapi kurang tepat</Badge>}
          </div>
          <p className="en text-xl font-bold leading-snug">{picked.text}</p>
          <p className="text-sm">{picked.note}</p>
          {picked.better && <p className="text-sm"><span className="font-bold">Lebih baik: </span><span className="en">{picked.better}</span></p>}
          <Button full size="lg" onClick={goOn}>Lanjut<ArrowRight size={18} aria-hidden /></Button>
        </Card>
      )}

      {ended && (
        <Button full size="lg" onClick={() => { stopAudio(); onDone({ score: branchScore(picks), ending: node!.ending!, picks }); }}>Lihat akhir cerita<ArrowRight size={18} aria-hidden /></Button>
      )}
      {!choosing && !picked && !ended && (
        <div className="flex gap-2">
          <Button variant="secondary" disabled={i === 0} onClick={() => { stopAudio(); setI(i - 1); }} aria-label="Kalimat sebelumnya"><ArrowLeft size={18} aria-hidden /></Button>
          <Button full size="lg" onClick={next}>Lanjut<ArrowRight size={18} aria-hidden /></Button>
        </div>
      )}
    </div>
  );
}
