'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Crown, Languages, Star, X } from 'lucide-react';
import type { ScenarioOption } from '@/lib/content/types';
import { shuffle } from '@/lib/engine/grading';
import { completeConversation } from '@/lib/engine/state';
import { useApp } from '@/lib/client/hooks';
import { act } from '@/lib/client/store';
import { AudioButton } from '@/components/AudioButton';
import { Mascot } from '@/components/Mascot';
import { Badge, Button, Card, Empty, LinkButton, Notice, PageHeader, Ring, cx } from '@/components/ui';

const NATURAL = ['', 'Kurang wajar', 'Cukup wajar', 'Wajar dan alami'];
interface Turn { speaker: string; line: string; lineId: string; choice?: ScenarioOption }

function Conversations() {
  const params = useSearchParams();
  const id = params.get('id');
  const { ix, learner } = useApp();
  const scenario = id ? ix.pack.scenarios.find((s) => s.id === id) : undefined;
  const [nodeId, setNodeId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [picked, setPicked] = useState<ScenarioOption | null>(null);
  const [translate, setTranslate] = useState(false);
  const [play, setPlay] = useState(0);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => { setNodeId(scenario?.start ?? null); setTurns([]); setPicked(null); }, [scenario, play]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [turns, picked]);

  if (id && !scenario) return <Empty title="Skenario tidak ditemukan" action={<LinkButton href="/app/conversations">Semua skenario</LinkButton>} />;
  if (scenario?.locked) return <Empty title="Skenario Premium" action={<LinkButton href="/app/subscription" variant="accent">Lihat Premium</LinkButton>}>{scenario.title}: {scenario.goal}</Empty>;

  if (scenario) {
    const node = scenario.nodes.find((n) => n.id === nodeId);
    const ended = nodeId === 'end';
    const answered = turns.filter((t) => t.choice);
    const max = answered.length * 3;
    const points = answered.reduce((n, t) => n + (t.choice!.correct ? t.choice!.natural : 0), 0);
    const score = max ? Math.round((points / max) * 100) : 0;
    const options = node ? shuffle(node.options, `${scenario.id}:${node.id}:${play}`) : [];
    const choose = (o: ScenarioOption) => { if (!picked) setPicked(o); };
    const proceed = () => {
      if (!node || !picked) return;
      const list = [...turns, { speaker: node.speaker, line: node.line, lineId: node.lineId, choice: picked }];
      setTurns(list);
      setPicked(null);
      setNodeId(picked.next);
      if (picked.next === 'end') {
        const pts = list.reduce((n, t) => n + (t.choice!.correct ? t.choice!.natural : 0), 0);
        act((d, at) => completeConversation(d, scenario.id, Math.round((pts / (list.length * 3)) * 100), at));
      }
    };
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Link href="/app/conversations" className="inline-flex items-center gap-1 text-sm font-bold text-muted hover:text-ink"><ArrowLeft size={16} aria-hidden />Semua skenario</Link>
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-extrabold">{scenario.title}</h1><Badge>{scenario.level}</Badge></div>
          <p className="mt-1 text-sm text-muted">{scenario.setting}</p>
          <p className="mt-1 text-sm"><span className="font-bold">Tujuanmu: </span>{scenario.goal}</p>
          <Button size="sm" variant="ghost" className="mt-1" aria-pressed={translate} onClick={() => setTranslate((t) => !t)}><Languages size={16} aria-hidden />{translate ? 'Sembunyikan terjemahan' : 'Tampilkan terjemahan'}</Button>
        </Card>

        <div className="space-y-3" aria-live="polite">
          {[...turns, ...(node ? [{ speaker: node.speaker, line: node.line, lineId: node.lineId } as Turn] : [])].map((t, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-extrabold" aria-hidden>{t.speaker.slice(0, 2)}</span>
                <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-surface p-3 shadow-card">
                  <p className="text-xs font-bold text-muted">{t.speaker}</p>
                  <p className="en font-semibold">{t.line}</p>
                  {translate && t.lineId && <p className="mt-1 text-sm text-muted">{t.lineId}</p>}
                  {!t.line.startsWith('(') && <div className="mt-2"><AudioButton text={t.line} size="sm" label="Dengarkan kalimat ini" /></div>}
                </div>
              </div>
              {t.choice && <div className="flex justify-end"><p className={cx('en max-w-[85%] rounded-2xl rounded-br-md p-3 font-semibold', t.choice.correct ? 'bg-brand text-on-brand' : 'bg-bad-soft')}>{t.choice.text}</p></div>}
            </div>
          ))}
        </div>

        {node && !picked && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-muted">Pilih responsmu:</p>
            {options.map((o) => <button key={o.text} type="button" onClick={() => choose(o)} className="en w-full rounded-2xl border-2 border-b-4 border-line bg-surface px-4 py-3 text-left font-semibold transition hover:bg-surface-2">{o.text}</button>)}
          </div>
        )}

        {node && picked && (
          <Card className={cx('animate-rise space-y-2 border-2', picked.correct && picked.natural === 3 ? 'border-ok' : picked.correct ? 'border-accent' : 'border-bad')}>
            <p className="en font-extrabold">&ldquo;{picked.text}&rdquo;</p>
            <div className="flex flex-wrap gap-2">
              <Badge tone={picked.correct ? 'ok' : 'bad'}>{picked.correct ? <Check size={12} aria-hidden /> : <X size={12} aria-hidden />}{picked.correct ? 'Tata bahasa benar' : 'Ada kesalahan tata bahasa'}</Badge>
              <Badge tone={picked.natural === 3 ? 'ok' : picked.natural === 2 ? 'accent' : 'bad'}><span className="inline-flex" aria-hidden>{[1, 2, 3].map((n) => <Star key={n} size={12} fill={n <= picked.natural ? 'currentColor' : 'none'} />)}</span>{NATURAL[picked.natural]}</Badge>
            </div>
            <p className="text-sm"><span className="font-bold">Penjelasan: </span>{picked.grammar}</p>
            <div className="text-sm"><span className="font-bold">Ungkapan lain yang bisa dipakai: </span><ul className="en mt-1 list-disc pl-5">{picked.alternatives.map((a) => <li key={a}>{a}</li>)}</ul></div>
            <Button full onClick={proceed}>{picked.next === 'end' ? 'Selesaikan percakapan' : 'Lanjut'}</Button>
          </Card>
        )}

        {ended && (
          <Card className="space-y-3 text-center">
            <Mascot mood={score >= 70 ? 'cheer' : 'think'} size={80} className="mx-auto" />
            <Ring value={score} tone={score >= 70 ? 'ok' : 'accent'} size={104}><span className="text-2xl font-extrabold">{score}%</span></Ring>
            <p className="text-sm text-muted">Nilai menggabungkan ketepatan tata bahasa dan kewajaran tiap responsmu.</p>
            <Notice tone="brand">{scenario.closing}</Notice>
            <div className="flex flex-col gap-2 sm:flex-row"><Button full variant="secondary" onClick={() => setPlay((p) => p + 1)}>Coba jalur lain</Button><LinkButton href="/app/conversations" full>Skenario lain</LinkButton></div>
          </Card>
        )}
        <div ref={bottom} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Simulator Percakapan" subtitle="Latihan situasi nyata dengan dialog bercabang. Tiap pilihanmu dinilai dari sisi tata bahasa dan kewajaran, lengkap dengan ungkapan alternatif." />
      <ul className="grid gap-3 sm:grid-cols-2">
        {ix.pack.scenarios.map((s) => {
          const rec = learner.conversations[s.id];
          return (
            <Card as="li" key={s.id} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2"><Badge>{s.level}</Badge>{s.locked ? <Badge tone="accent"><Crown size={12} aria-hidden />Premium</Badge> : rec ? <Badge tone="ok">Terbaik {rec.best}%</Badge> : null}</div>
              <h2 className="text-lg font-extrabold">{s.title}</h2>
              <p className="text-sm text-muted">{s.goal}</p>
              <LinkButton href={s.locked ? '/app/subscription' : `/app/conversations?id=${s.id}`} size="sm" variant={s.locked ? 'accent' : rec ? 'secondary' : 'primary'} className="mt-auto">{s.locked ? 'Buka dengan Premium' : rec ? 'Main lagi' : 'Mulai percakapan'}</LinkButton>
            </Card>
          );
        })}
      </ul>
    </div>
  );
}

export default function ConversationsPage() {
  return <Suspense><Conversations /></Suspense>;
}
