'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Crown, Eye, EyeOff, Mic, Square } from 'lucide-react';
import type { Exercise } from '@/lib/content/types';
import { audioSource } from '@/lib/client/audio';
import { useApp } from '@/lib/client/hooks';
import { act } from '@/lib/client/store';
import { AudioButton } from '@/components/AudioButton';
import { Mouth } from '@/components/Mouth';
import { SessionRunner, SessionSummary, type SessionResult } from '@/components/SessionRunner';
import { Badge, Button, Card, Empty, LinkButton, Notice, PageHeader, cx } from '@/components/ui';

/** Records the learner's own voice for self-comparison. Nothing is uploaded. */
function Recorder() {
  const [state, setState] = useState<'idle' | 'recording' | 'denied' | 'unsupported'>('idle');
  const [url, setUrl] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return setState('unsupported');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const r = new MediaRecorder(stream);
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => { stream.getTracks().forEach((t) => t.stop()); setUrl(URL.createObjectURL(new Blob(chunks, { type: r.mimeType }))); setState('idle'); };
      rec.current = r;
      r.start();
      setState('recording');
    } catch {
      setState('denied');
    }
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {state === 'recording' ? <Button size="sm" variant="danger" onClick={() => rec.current?.stop()}><Square size={14} aria-hidden />Berhenti</Button> : <Button size="sm" variant="secondary" onClick={start}><Mic size={14} aria-hidden />Rekam suaraku</Button>}
        {url && state !== 'recording' && <audio controls src={url} className="h-9 max-w-full" aria-label="Rekaman suaramu" />}
      </div>
      {state === 'denied' && <p className="text-xs text-bad">Izin mikrofon ditolak. Aktifkan izin mikrofon di peramban untuk merekam.</p>}
      {state === 'unsupported' && <p className="text-xs text-bad">Peramban ini tidak mendukung perekaman suara.</p>}
      <p className="text-xs text-muted">Rekaman hanya diputar di perangkatmu dan tidak diunggah. Bandingkan sendiri dengan contoh: aplikasi ini tidak menilai pelafalan secara otomatis.</p>
    </div>
  );
}

function Listening() {
  const params = useSearchParams();
  const id = params.get('id');
  const tab = params.get('tab') === 'pelafalan' ? 'pelafalan' : 'menyimak';
  const { ix, learner } = useApp();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [show, setShow] = useState(false);
  const item = id ? ix.pack.listening.find((l) => l.id === id) : undefined;
  const questions = useMemo(() => (item?.questionIds ?? []).map((q) => ix.exerciseById.get(q)).filter((e): e is Exercise => !!e), [item, ix]);
  const accent = learner.profile.accent;

  if (item && running) return <SessionRunner title={item.title} ctx="listening" exercises={questions} feedback="immediate" seed={item.id} exitHref="/app/listening" onFinish={(r) => { setResult(r); setRunning(false); }} />;
  if (item && result) return <SessionSummary result={result} title="Latihan menyimak selesai" doneHref="/app/listening" doneLabel="Pusat Menyimak" onRetry={() => { setResult(null); setRunning(true); }} />;
  if (item) {
    if (item.locked) return <Empty title="Audio Premium" action={<LinkButton href="/app/subscription" variant="accent">Lihat Premium</LinkButton>}>{item.title} tersedia di paket Premium.</Empty>;
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <PageHeader title={item.title} subtitle={`Level ${item.level} · dengarkan dulu tanpa membaca, ulangi sesukamu, lalu jawab pertanyaannya.`} />
        <Card className="space-y-3">
          <AudioButton text={item.transcript} audioKey={item.audioKey} size="lg" showSource />
          <Button size="sm" variant="ghost" onClick={() => setShow((s) => !s)}>{show ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}{show ? 'Sembunyikan transkrip' : 'Tampilkan transkrip'}</Button>
          {show && <div className="rounded-2xl bg-surface-2 p-3"><p className="en font-semibold">{item.transcript}</p><p className="mt-1 text-sm text-muted">{item.translation}</p></div>}
        </Card>
        <Button full size="lg" onClick={() => setRunning(true)}>Jawab {questions.length} pertanyaan</Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Pusat Menyimak dan Pelafalan" subtitle="Latih telinga dengan audio, lalu latih mulut dengan panduan posisi lidah dan bibir." />
      <Card className="mb-4 flex flex-wrap items-center gap-3 p-4">
        <p className="text-sm font-bold">Aksen audio</p>
        {(['us', 'uk'] as const).map((a) => <Button key={a} size="sm" variant={accent === a ? 'primary' : 'secondary'} aria-pressed={accent === a} onClick={() => act((d) => { d.profile.accent = a; })}>{a === 'us' ? 'Amerika' : 'Inggris (British)'}</Button>)}
        <p className="w-full text-xs text-muted">{audioSource(ix) === 'none' ? 'Perangkat ini tidak punya pemutar suara.' : ix.pack.audio.length ? 'Rekaman penutur asli dipakai bila tersedia untuk aksen pilihanmu.' : 'Rekaman penutur asli belum diunggah untuk materi ini. Sementara itu audio dibacakan oleh suara bawaan perangkatmu (tanpa internet, tanpa AI generatif) sesuai aksen yang kamu pilih.'}</p>
      </Card>
      <div className="mb-4 flex gap-2" role="tablist">
        <LinkButton href="/app/listening" size="sm" variant={tab === 'menyimak' ? 'primary' : 'secondary'}>Menyimak</LinkButton>
        <LinkButton href="/app/listening?tab=pelafalan" size="sm" variant={tab === 'pelafalan' ? 'primary' : 'secondary'}>Pelafalan</LinkButton>
      </div>

      {tab === 'menyimak' ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {ix.pack.listening.map((l) => (
            <Card as="li" key={l.id} className={cx('flex flex-col gap-2', l.locked && 'opacity-80')}>
              <div className="flex flex-wrap items-center gap-2"><Badge>{l.level}</Badge><Badge tone="muted">{l.kind === 'word' ? 'Pengenalan kata' : l.kind === 'sentence' ? 'Kalimat' : 'Pemahaman'}</Badge>{l.locked && <Badge tone="accent"><Crown size={12} aria-hidden />Premium</Badge>}</div>
              <p className="font-extrabold">{l.title}</p>
              <LinkButton href={l.locked ? '/app/subscription' : `/app/listening?id=${l.id}`} size="sm" variant={l.locked ? 'accent' : 'secondary'} className="mt-auto">{l.locked ? 'Buka dengan Premium' : 'Buka latihan'}</LinkButton>
            </Card>
          ))}
        </ul>
      ) : (
        <div className="space-y-4">
          <Notice tone="brand" title="Cara berlatih">Dengarkan contoh (normal lalu lambat), lihat ilustrasi posisi mulut, rekam suaramu, dan bandingkan sendiri.</Notice>
          {ix.pack.phonemes.map((p) => (
            <Card key={p.id} className="grid gap-4 sm:grid-cols-[1fr_15rem]">
              <div className="space-y-3">
                <h2 className="text-xl font-extrabold"><span className="en text-brand">{p.ipa}</span> · {p.label}</h2>
                <p>{p.howTo}</p>
                <p className="rounded-xl bg-accent-soft px-3 py-2 text-sm"><span className="font-bold text-accent-strong">Kesalahan umum: </span>{p.commonError}</p>
                <ul className="flex flex-wrap gap-2">{p.examples.map((e) => <li key={e.word} className="flex items-center gap-2 rounded-2xl bg-surface-2 py-1.5 pl-1.5 pr-3"><AudioButton text={e.word} size="sm" label={`Dengarkan ${e.word}`} /><span className="en"><span className="font-extrabold">{e.word}</span> <span className="text-sm text-muted">{e.ipa}</span></span></li>)}</ul>
                <Recorder />
              </div>
              <Mouth mouth={p.mouth} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ListeningPage() {
  return <Suspense><Listening /></Suspense>;
}
