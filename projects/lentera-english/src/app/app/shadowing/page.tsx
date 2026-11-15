'use client';
// Shadowing (Rilis 8): listen to a sentence, say it the same way, then compare
// your recording with the model side by side. No AI scoring: the learner's own
// ear is the judge, helped by a loudness outline and the speaking time.
// Recordings never leave the device.
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Crown, Ear, Eye, EyeOff, Headphones, Mic, Play, RotateCcw, Snail, Square, Volume2 } from 'lucide-react';
import { CEFR_ORDER, type Cefr } from '@/lib/content/types';
import { analyse, playUrl, recordingSupported, startRecording, type ActiveRecording, type Recording, type Shape } from '@/lib/client/recorder';
import { play, recordingFor, stopAudio } from '@/lib/client/audio';
import { useApp } from '@/lib/client/hooks';
import { act } from '@/lib/client/store';
import { completeShadowing } from '@/lib/engine/state';
import { linesByLevel, pickSession, shadowLines, SHADOW, tempoNote, type ShadowLine, type ShadowRating } from '@/lib/engine/shadowing';
import { Badge, Button, Card, LinkButton, Notice, PageHeader, Progress, cx } from '@/components/ui';

const RATINGS: { id: ShadowRating; label: string; tone: string }[] = [
  { id: 'good', label: 'Sudah mirip', tone: 'border-ok bg-ok-soft' },
  { id: 'close', label: 'Hampir', tone: 'border-accent-strong bg-accent-soft' },
  { id: 'again', label: 'Perlu diulang', tone: 'border-bad bg-bad-soft' },
];
const secs = (ms: number) => `${(ms / 1000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} dtk`;

function Wave({ peaks, tone }: { peaks: number[]; tone: 'brand' | 'accent' }) {
  return (
    <svg viewBox={`0 0 ${peaks.length * 4} 32`} preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
      {peaks.map((p, i) => {
        const h = Math.max(2, p * 30);
        return <rect key={i} x={i * 4 + 0.5} y={16 - h / 2} width={3} height={h} rx={1.5} className={tone === 'brand' ? 'fill-brand' : 'fill-accent-strong'} />;
      })}
    </svg>
  );
}

function Step({ line, n, total, onRate }: { line: ShadowLine; n: number; total: number; onRate: (r: ShadowRating) => void }) {
  const { ix, learner } = useApp();
  const accent = learner.profile.accent;
  const [showText, setShowText] = useState(true);
  const [showMeaning, setShowMeaning] = useState(false);
  const [together, setTogether] = useState(false);
  const [listened, setListened] = useState(false);
  const [modelMs, setModelMs] = useState(0);
  const [modelShape, setModelShape] = useState<Shape | null>(null);
  const [busy, setBusy] = useState<'model' | 'slow' | 'mine' | 'both' | null>(null);
  const [rec, setRec] = useState<'idle' | 'recording'>('idle');
  const [level, setLevel] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [mine, setMine] = useState<(Recording & { shape: Shape | null }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const active = useRef<ActiveRecording | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const supported = useMemo(() => recordingSupported(), []);
  const modelRec = recordingFor(ix, line.text, accent, line.audioKey);

  // An uploaded recording can be measured like the learner's own voice.
  useEffect(() => {
    let live = true;
    if (modelRec) void analyse(modelRec.url).then((s) => { if (live && s) { setModelShape(s); setModelMs(s.voicedMs); } });
    return () => { live = false; };
  }, [modelRec?.url]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => {
    active.current?.cancel();
    window.clearInterval(timer.current);
    stopAudio();
  }, []);
  useEffect(() => () => { if (mine) URL.revokeObjectURL(mine.url); }, [mine]);

  const playModel = async (slow = false) => {
    setBusy(slow ? 'slow' : 'model');
    const t0 = performance.now();
    await play(ix, line.text, { accent, slow, audioKey: line.audioKey });
    if (!slow && !modelRec) setModelMs(Math.max(300, performance.now() - t0 - 150));
    setListened(true);
    setBusy(null);
  };
  const stop = async () => {
    const r = active.current;
    active.current = null;
    window.clearInterval(timer.current);
    if (!r) return;
    stopAudio();
    const got = await r.stop();
    setRec('idle');
    setLevel(0);
    setMine({ ...got, shape: await analyse(got.blob) });
  };
  const record = async () => {
    setError(null);
    if (mine) setMine(null);
    try {
      active.current = await startRecording(setLevel);
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    setRec('recording');
    const t0 = Date.now();
    setElapsed(0);
    timer.current = window.setInterval(() => {
      const ms = Date.now() - t0;
      setElapsed(ms);
      if (ms >= SHADOW.maxRecordMs) void stop();
    }, 200);
    if (together) {
      await play(ix, line.text, { accent, audioKey: line.audioKey });
      setListened(true);
      window.setTimeout(() => { if (active.current) void stop(); }, 1200);
    }
  };
  const playMine = async () => {
    if (!mine) return;
    setBusy('mine');
    await playUrl(mine.url);
    setBusy(null);
  };
  const playBoth = async () => {
    if (!mine) return;
    setBusy('both');
    await play(ix, line.text, { accent, audioKey: line.audioKey });
    await new Promise((r) => setTimeout(r, 350));
    await playUrl(mine.url);
    setBusy(null);
  };

  const ownMs = mine?.shape?.voicedMs || (mine ? mine.ms : 0);
  const tempo = mine && modelMs ? tempoNote(modelMs, ownMs) : null;
  const canRate = !!mine || ((!supported || !!error) && listened);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Progress value={n} max={total} label={`Kalimat ${n} dari ${total}`} className="h-2.5" />
        <span className="shrink-0 text-sm font-bold text-muted">{n}/{total}</span>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{line.level}</Badge>
          <span className="text-xs font-bold text-muted">{line.source}</span>
        </div>
        <p className={cx('en text-2xl font-extrabold leading-snug transition', !showText && 'select-none blur-md')} aria-hidden={!showText}>{line.text}</p>
        {!showText && <p className="sr-only">Teks disembunyikan. Dengarkan contohnya.</p>}
        {showMeaning && line.translation && <p className="text-muted">{line.translation}</p>}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" onClick={() => setShowText((v) => !v)}>{showText ? <EyeOff size={14} aria-hidden /> : <Eye size={14} aria-hidden />}{showText ? 'Sembunyikan teks' : 'Tampilkan teks'}</Button>
          {line.translation && <Button size="sm" variant="ghost" onClick={() => setShowMeaning((v) => !v)}>{showMeaning ? 'Sembunyikan arti' : 'Lihat arti'}</Button>}
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="flex items-center gap-2 font-extrabold"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-sm text-on-brand">1</span>Dengarkan contohnya</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void playModel(false)} disabled={!!busy || rec === 'recording'} className={busy === 'model' ? 'animate-pulse' : ''}><Volume2 size={18} aria-hidden />Dengarkan</Button>
          <Button variant="secondary" onClick={() => void playModel(true)} disabled={!!busy || rec === 'recording'} className={busy === 'slow' ? 'animate-pulse' : ''}><Snail size={18} aria-hidden />Pelan</Button>
        </div>
        <p className="text-sm text-muted">Dengarkan 2–3 kali. Perhatikan kata yang ditekan, naik-turun nadanya, dan kata-kata yang disambung.</p>
      </Card>

      <Card className="space-y-3">
        <h2 className="flex items-center gap-2 font-extrabold"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-sm text-on-brand">2</span>Tirukan dan rekam suaramu</h2>
        {!supported ? (
          <Notice tone="accent">Browser ini belum bisa merekam suara. Kamu tetap bisa menirukan dengan suara keras sambil mendengarkan contohnya, lalu menilai sendiri.</Notice>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              {rec === 'recording'
                ? <Button variant="danger" onClick={() => void stop()}><Square size={16} aria-hidden />Berhenti · {secs(elapsed)}</Button>
                : <Button onClick={() => void record()} disabled={!!busy}><Mic size={18} aria-hidden />{mine ? 'Rekam ulang' : 'Rekam suaraku'}</Button>}
              {rec === 'recording' && (
                <span className="flex h-8 w-28 items-center gap-0.5" role="img" aria-label="Mikrofon sedang merekam">
                  {Array.from({ length: 10 }, (_, i) => <span key={i} className={cx('h-full w-2 rounded-full transition', level * 10 > i ? 'bg-bad' : 'bg-surface-2')} />)}
                </span>
              )}
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--brand)]" checked={together} disabled={rec === 'recording'} onChange={(e) => setTogether(e.target.checked)} />
              <span><span className="font-bold">Putar contoh sambil merekam</span> <span className="text-muted">(shadowing sungguhan: bicara bersamaan dengan contoh. Pakai earphone agar contohnya tidak ikut terekam.)</span></span>
            </label>
            {rec === 'recording' && <p className="text-sm font-bold text-bad" role="status">Merekam... tekan Berhenti setelah selesai bicara.</p>}
          </>
        )}
        {error && <Notice tone="bad">{error}</Notice>}
        <p className="text-xs text-muted">Rekamanmu hanya ada di HP ini selama latihan dan tidak pernah diunggah ke server.</p>
      </Card>

      {mine && (
        <Card className="space-y-3">
          <h2 className="flex items-center gap-2 font-extrabold"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-sm text-on-brand">3</span>Bandingkan berdampingan</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 rounded-2xl border-2 border-brand/30 p-3">
              <div className="flex items-center justify-between gap-2"><p className="font-bold">Contoh</p><span className="text-sm text-muted">{modelMs ? `±${secs(modelMs)}` : ''}</span></div>
              {modelShape ? <Wave peaks={modelShape.peaks} tone="brand" /> : <p className="flex h-8 items-center text-xs text-muted">Suara bawaan perangkat (gelombang tidak tersedia)</p>}
              <Button size="sm" variant="secondary" full onClick={() => void playModel(false)} disabled={!!busy}><Play size={14} aria-hidden />Putar contoh</Button>
            </div>
            <div className="space-y-2 rounded-2xl border-2 border-accent-strong/40 p-3">
              <div className="flex items-center justify-between gap-2"><p className="font-bold">Suaramu</p><span className="text-sm text-muted">{secs(ownMs)}</span></div>
              {mine.shape ? <Wave peaks={mine.shape.peaks} tone="accent" /> : <p className="flex h-8 items-center text-xs text-muted">Gelombang tidak tersedia di browser ini</p>}
              <Button size="sm" variant="secondary" full onClick={() => void playMine()} disabled={!!busy}><Play size={14} aria-hidden />Putar suaraku</Button>
            </div>
          </div>
          <Button full onClick={() => void playBoth()} disabled={!!busy} className={busy === 'both' ? 'animate-pulse' : ''}><Headphones size={18} aria-hidden />Putar berurutan: contoh, lalu suaraku</Button>
          {tempo?.text && <p className={cx('rounded-2xl px-3 py-2 text-sm', tempo.tone === 'ok' ? 'bg-ok-soft' : 'bg-surface-2')}><span className="font-bold">Info tempo: </span>{tempo.text}</p>}
          <details className="rounded-2xl bg-surface-2 p-3 text-sm">
            <summary className="cursor-pointer font-bold">Apa yang dibandingkan?</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Tekanan:</strong> kata yang paling keras dan panjang di contoh, apakah sama di suaramu?</li>
              <li><strong>Nada:</strong> pernyataan biasanya turun di akhir; pertanyaan ya/tidak naik.</li>
              <li><strong>Sambungan:</strong> kata yang menyambung, misalnya <span className="en">&quot;an apple&quot;</span> terdengar <span className="en">&quot;a-napple&quot;</span>.</li>
              <li><strong>Bunyi sulit:</strong> <span className="en">th, v, r</span>, dan akhiran <span className="en">-s, -ed</span> yang sering hilang.</li>
            </ul>
          </details>
        </Card>
      )}

      <Card className="space-y-3">
        <h2 className="flex items-center gap-2 font-extrabold"><Ear size={18} className="text-brand" aria-hidden />Menurut telingamu?</h2>
        {!canRate && <p className="text-sm text-muted">{supported ? 'Rekam suaramu dulu, lalu bandingkan dengan contohnya.' : 'Dengarkan contohnya dulu.'}</p>}
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Nilai sendiri hasil tiruanmu">
          {RATINGS.map((r) => (
            <button key={r.id} type="button" disabled={!canRate} onClick={() => onRate(r.id)}
              className={cx('min-h-12 rounded-2xl border-2 px-2 py-2 text-sm font-extrabold transition disabled:opacity-40', r.tone, 'hover:brightness-95')}>{r.label}</button>
          ))}
        </div>
        <p className="text-xs text-muted">Tidak ada nilai otomatis: kamu yang menilai. Kalimat yang kamu tandai &quot;Perlu diulang&quot; bisa dilatih lagi di akhir.</p>
      </Card>
    </div>
  );
}

export default function ShadowingPage() {
  const { ix, learner, premium } = useApp();
  const lines = useMemo(() => shadowLines(ix.pack), [ix]);
  const counts = useMemo(() => linesByLevel(lines), [lines]);
  const start = learner.profile.placementLevel && counts[learner.profile.placementLevel] ? learner.profile.placementLevel : CEFR_ORDER.find((c) => counts[c] > 0) ?? 'A1';
  const [level, setLevel] = useState<Cefr>(start);
  const [session, setSession] = useState<ShadowLine[] | null>(null);
  const [i, setI] = useState(0);
  const [ratings, setRatings] = useState<Record<string, ShadowRating>>({});
  const [finished, setFinished] = useState<{ xp: number } | null>(null);
  const stats = learner.shadowing;

  const begin = (list: ShadowLine[]) => {
    setSession(list);
    setI(0);
    setRatings({});
    setFinished(null);
    window.scrollTo({ top: 0 });
  };
  const fresh = () => begin(pickSession(lines, level, stats?.recent ?? [], `${learner.userId}:${level}:${stats?.sessions ?? 0}:${Date.now() >> 16}`));
  const rate = (r: ShadowRating) => {
    if (!session) return;
    const next = { ...ratings, [session[i].key]: r };
    setRatings(next);
    if (i + 1 < session.length) {
      setI(i + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    const keys = session.map((l) => l.key);
    act((d, at) => completeShadowing(d, keys, at));
    setFinished({ xp: Math.min(keys.length, SHADOW.perSession) * SHADOW.xpPerSentence });
  };

  if (session && finished) {
    const again = session.filter((l) => ratings[l.key] === 'again');
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Card className="grid place-items-center gap-2 py-8 text-center">
          <CheckCircle2 size={44} className="text-ok" aria-hidden />
          <h1 className="text-2xl font-extrabold">{session.length} kalimat dilatih</h1>
          <p className="text-lg font-bold text-brand">+{finished.xp} XP</p>
          <p className="max-w-md text-muted">Latihan ini ikut menjaga beruntun harianmu. Shadowing sedikit tapi rutin lebih ampuh daripada banyak sekaligus.</p>
        </Card>
        <Card className="p-0">
          <ul>
            {session.map((l) => {
              const r = RATINGS.find((x) => x.id === ratings[l.key]);
              return (
                <li key={l.key} className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-0">
                  <span className="en min-w-0 flex-1 font-semibold">{l.text}</span>
                  {r && <span className={cx('shrink-0 rounded-full border-2 px-2 py-0.5 text-xs font-bold', r.tone)}>{r.label}</span>}
                </li>
              );
            })}
          </ul>
        </Card>
        <div className="grid gap-2 sm:grid-cols-3">
          {again.length > 0 && <Button onClick={() => begin(again)}><RotateCcw size={16} aria-hidden />Ulangi {again.length} kalimat</Button>}
          <Button variant={again.length ? 'secondary' : 'primary'} onClick={fresh}><ArrowRight size={16} aria-hidden />{SHADOW.perSession} kalimat baru</Button>
          <Button variant="ghost" onClick={() => { setSession(null); setFinished(null); }}>Selesai</Button>
        </div>
      </div>
    );
  }
  if (session) {
    return (
      <div>
        <div className="mx-auto mb-3 flex max-w-2xl items-center justify-between gap-2">
          <h1 className="text-lg font-extrabold">Shadowing · {session[i].level}</h1>
          <Button size="sm" variant="ghost" onClick={() => { stopAudio(); setSession(null); }}>Keluar</Button>
        </div>
        <Step key={`${session[i].key}:${i}`} line={session[i]} n={i + 1} total={session.length} onRate={rate} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Latihan Shadowing" subtitle="Dengarkan kalimat, tirukan dengan suaramu, lalu bandingkan berdampingan. Tanpa penilaian AI: telingamu jurinya." />
      <ol className="grid gap-3 sm:grid-cols-3">
        {[[Volume2, 'Dengar', 'Putar contohnya, normal atau pelan, sampai iramanya terasa.'], [Mic, 'Rekam', 'Tirukan persis: tekanan, nada, dan jedanya. Atau bicara bersamaan dengan contoh.'], [Headphones, 'Bandingkan', 'Putar contoh dan suaramu berdampingan, lalu nilai sendiri.']].map(([Icon, t, d], k) => {
          const I = Icon as typeof Mic;
          return (
            <Card as="li" key={k} className="flex gap-3 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><I size={20} aria-hidden /></span>
              <span><span className="block font-extrabold">{k + 1}. {t as string}</span><span className="block text-sm text-muted">{d as string}</span></span>
            </Card>
          );
        })}
      </ol>
      <Card className="space-y-4">
        <h2 className="font-extrabold" id="level-shadowing">Pilih level</h2>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="level-shadowing">
          {CEFR_ORDER.map((c) => counts[c] > 0
            ? <Button key={c} size="sm" role="radio" aria-checked={level === c} variant={level === c ? 'primary' : 'secondary'} onClick={() => setLevel(c)}>{c} · {counts[c]}</Button>
            : <LinkButton key={c} size="sm" variant="secondary" href="/app/subscription" className="opacity-70"><Crown size={12} aria-hidden />{c}</LinkButton>)}
        </div>
        {!premium && <p className="text-sm text-muted">Kalimat level A2–C2 terbuka dengan Premium.</p>}
        <Button size="lg" full onClick={fresh} disabled={!counts[level]}>Mulai {SHADOW.perSession} kalimat {level}</Button>
        <p className="text-sm text-muted">+{SHADOW.xpPerSentence} XP per kalimat, dan latihan ini menjaga beruntunmu. {stats?.total ? `Sudah ${stats.total} kalimat dilatih dalam ${stats.sessions} sesi.` : ''}</p>
      </Card>
      <Notice tone="brand" title="Privasi">Rekaman suaramu hanya ada di HP ini selama latihan dan tidak pernah diunggah. Butuh izin mikrofon saat pertama merekam.</Notice>
    </div>
  );
}
