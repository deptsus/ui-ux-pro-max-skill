'use client';
// "Pasangan Kilat" (Rilis 15): flip two cards, match the English word with its
// picture. Timer, combo points and a best score per theme kept on this device.
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Crown, Lock, RotateCcw, Shapes, Sparkles, Timer, Trophy, Zap } from 'lucide-react';
import { PAIRS, PAIR_THEMES, dealPairs, matchPoints, pairMeaning, pairWord, pairsXpToday, readBest, saveBest, timeBonus, type PairCard, type PairTheme } from '@/lib/engine/pairs';
import { addXp } from '@/lib/engine/state';
import type { PicKey } from '@/lib/content/pics';
import { play } from '@/lib/client/audio';
import { useContent } from '@/lib/client/content';
import { useApp } from '@/lib/client/hooks';
import { chime, soundOn } from '@/lib/client/prefs';
import { act } from '@/lib/client/store';
import { AudioButton } from '@/components/AudioButton';
import { LogoMark, Mascot } from '@/components/Mascot';
import { Pic } from '@/components/pics/Pic';
import { Confetti } from '@/components/SessionRunner';
import { Badge, Button, Card, LinkButton, PageHeader, cx } from '@/components/ui';

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

interface Done { score: number; bonus: number; seconds: number; maxCombo: number; misses: number; record: boolean; xp: number }

export default function PairsPage() {
  const { learner, now, premium } = useApp();
  // A new seed per board, so the cards stay put while the clock ticks.
  const [game, setGame] = useState<{ theme: PairTheme; seed: string } | null>(null);
  const [best, setBest] = useState<Record<string, number>>({});
  useEffect(() => setBest(readBest()), [game]);
  const start = (theme: PairTheme) => setGame({ theme, seed: `${theme.id}:${learner.userId}:${Date.now()}` });
  const theme = game?.theme;

  if (!game || !theme) {
    const xpLeft = pairsXpToday(learner, now) > 0;
    return (
      <div>
        <PageHeader title="Pasangan Kilat" subtitle="Balik dua kartu dan cocokkan kata bahasa Inggris dengan gambarnya. Makin cepat dan makin beruntun, makin tinggi skormu." />
        <Card className="mb-4 flex items-center gap-3">
          <Mascot mood="wink" size={64} decorative />
          <p className="min-w-0 flex-1 text-sm text-muted">
            {PAIRS.size} pasang kartu tiap papan. Pasangan beruntun memberi poin kombo, dan papan yang selesai di bawah {PAIRS.parSeconds} detik mendapat bonus waktu.
            {xpLeft ? ` ${PAIRS.xpGamesPerDay} papan pertama tiap hari memberi +${PAIRS.xp} XP.` : ' XP harian dari permainan ini sudah penuh; main terus untuk latihan.'}
          </p>
        </Card>
        <h2 className="mb-2 text-lg font-extrabold">Pilih tema</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {PAIR_THEMES.map((t) => {
            const locked = t.premium && !premium;
            const body = (
              <>
                <span className="flex shrink-0 -space-x-3" aria-hidden>
                  {t.keys.slice(0, 3).map((k) => <span key={k} className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-line bg-surface"><Pic k={k} size={36} label={false} /></span>)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-extrabold leading-tight">{t.title}</span>
                  <span className="block text-sm text-muted">{t.keys.length} kata{best[t.id] ? ` · Rekor ${best[t.id]}` : ''}</span>
                </span>
                {locked ? <Badge tone="accent"><Lock size={12} aria-hidden />Premium</Badge> : t.premium && <Crown size={18} className="text-accent-strong" aria-label="Tema Premium" />}
              </>
            );
            return (
              <li key={t.id}>
                {locked ? (
                  <Link href="/app/subscription" className="flex h-full items-center gap-3 rounded-2xl border-2 border-dashed border-line-strong bg-surface-2 p-4">{body}<span className="sr-only">: khusus Premium, lihat paket Premium</span></Link>
                ) : (
                  <button type="button" onClick={() => start(t)}
                    className="flex h-full w-full items-center gap-3 rounded-2xl border-2 border-line bg-surface p-4 text-left shadow-[0_3px_0_var(--line)] transition active:translate-y-[3px] active:shadow-[0_1px_0_var(--line)]">{body}</button>
                )}
              </li>
            );
          })}
        </ul>
        {!premium && <p className="mt-4 text-sm text-muted">Paket gratis: tema Hewan, Warna, serta Makanan &amp; Minuman. Premium membuka semua tema.</p>}
      </div>
    );
  }
  return <Board key={game.seed} theme={theme} best={best[theme.id] ?? 0} seed={game.seed} onAgain={() => start(theme)} onExit={() => setGame(null)} />;
}

function Board({ theme, best, seed, onAgain, onExit }: { theme: PairTheme; best: number; seed: string; onAgain: () => void; onExit: () => void }) {
  const ix = useContent();
  const { learner, now } = useApp();
  const accent = learner.profile.accent;
  const cards = useMemo(() => dealPairs(theme, seed), [theme, seed]);
  const total = cards.length / 2;
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<PicKey[]>([]);
  const [miss, setMiss] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [misses, setMisses] = useState(0);
  const [score, setScore] = useState(0);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [announce, setAnnounce] = useState('');
  const [done, setDone] = useState<Done | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!startAt || done) return;
    const id = setInterval(() => setElapsed((Date.now() - startAt) / 1000), 250);
    return () => clearInterval(id);
  }, [startAt, done]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const flip = (c: PairCard) => {
    if (busy || done || open.includes(c.id) || matched.includes(c.key)) return;
    const start = startAt ?? Date.now();
    if (!startAt) setStartAt(start);
    if (c.face === 'word' && soundOn()) void play(ix, pairWord(c.key), { accent, slow: false });
    const next = [...open, c.id];
    setOpen(next);
    if (next.length < 2) {
      setAnnounce(c.face === 'word' ? `Kata: ${pairWord(c.key)}` : `Gambar: ${pairMeaning(c.key)}`);
      return;
    }
    const first = cards[next[0]];
    if (first.key === c.key) {
      const run = combo + 1;
      const got = [...matched, c.key];
      const points = score + matchPoints(run);
      setMatched(got);
      setOpen([]);
      setCombo(run);
      setMaxCombo((m) => Math.max(m, run));
      setScore(points);
      chime(run >= 3 ? 'combo' : 'ok');
      setAnnounce(`Cocok! ${pairWord(c.key)} artinya ${pairMeaning(c.key)}.${run >= 2 ? ` Kombo ×${run}.` : ''}`);
      if (got.length === total) {
        const seconds = (Date.now() - start) / 1000;
        const bonus = timeBonus(seconds);
        const final = points + bonus;
        const record = saveBest(theme.id, final);
        const xp = pairsXpToday(learner, now);
        if (xp > 0) act((d, at) => addXp(d, xp, 'pairs', at, theme.id));
        setElapsed(seconds);
        setDone({ score: final, bonus, seconds, maxCombo: Math.max(maxCombo, run), misses, record, xp });
        setTimeout(() => chime('done'), 250);
        setAnnounce(`Selesai! Skor ${final}.`);
      }
    } else {
      setCombo(0);
      setMisses((m) => m + 1);
      setBusy(true);
      setMiss(next);
      chime('bad');
      setAnnounce(c.face === 'word' ? `Kata: ${pairWord(c.key)}. Belum cocok.` : `Gambar: ${pairMeaning(c.key)}. Belum cocok.`);
      timer.current = setTimeout(() => { setOpen([]); setMiss([]); setBusy(false); }, PAIRS.mismatchMs);
    }
  };

  const words = useMemo(() => [...new Set(cards.map((c) => c.key))], [cards]);

  return (
    <div className="mx-auto max-w-xl">
      <p className="sr-only" role="status" aria-live="polite">{announce}</p>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold"><Shapes size={24} className="text-brand" aria-hidden />{theme.title}</h1>
        <Button variant="secondary" size="sm" onClick={onExit}>Ganti tema</Button>
      </div>

      {done ? (
        <Card className="relative space-y-4 overflow-hidden text-center">
          <Confetti />
          <Mascot mood={done.record ? 'dance' : 'cheer'} size={96} className="mx-auto" />
          <h2 className="text-2xl font-extrabold">Semua pasangan ketemu!</h2>
          {done.record && <p><Badge tone="accent"><Trophy size={14} aria-hidden />Rekor baru!</Badge></p>}
          <dl className="grid grid-cols-2 gap-2 text-left sm:grid-cols-4">
            {([['Skor', String(done.score)], ['Waktu', clock(done.seconds)], ['Kombo terbaik', `×${done.maxCombo}`], ['Salah tebak', String(done.misses)]] as const).map(([k, v]) => (
              <div key={k} className="rounded-xl bg-surface-2 p-3 dark:bg-line/60"><dt className="text-xs font-bold text-muted">{k}</dt><dd className="font-display text-2xl font-bold">{v}</dd></div>
            ))}
          </dl>
          <p className="text-sm text-muted">
            Termasuk bonus waktu {done.bonus}.{best > 0 && !done.record ? ` Rekormu ${best}.` : ''} {done.xp > 0 ? `+${done.xp} XP.` : 'XP harian dari permainan ini sudah penuh.'}
          </p>
          <div>
            <h3 className="mb-2 text-left font-extrabold">Kata di papan ini</h3>
            <ul className="grid gap-2 text-left sm:grid-cols-2">
              {words.map((k) => (
                <li key={k} className="flex items-center gap-3 rounded-2xl border-2 border-line bg-surface p-2">
                  <Pic k={k} size={40} label={false} />
                  <span className="min-w-0 flex-1"><span lang="en" className="block text-lg font-extrabold leading-tight">{pairWord(k)}</span><span className="block text-sm text-muted">{pairMeaning(k)}</span></span>
                  <AudioButton text={pairWord(k)} size="sm" label={`Dengar "${pairWord(k)}"`} />
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button full size="lg" onClick={onAgain}><RotateCcw size={18} aria-hidden />Main lagi</Button>
            <LinkButton href="/app/review" variant="secondary" full size="lg">Ke Ulangan</LinkButton>
          </div>
        </Card>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2" aria-label="Papan skor">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-surface px-3 py-1 font-bold"><Timer size={16} aria-hidden /><span className="sr-only">Waktu </span><span role="timer" aria-live="off">{clock(elapsed)}</span></span>
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-surface px-3 py-1 font-bold"><Sparkles size={16} className="text-accent-strong" aria-hidden />Skor {score}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-surface px-3 py-1 font-bold">Pasangan {matched.length}/{total}</span>
            {combo >= 2 && <span key={combo} className="combo-pop inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-extrabold text-on-accent"><Zap size={16} aria-hidden />Kombo ×{combo}!</span>}
          </div>
          {!startAt && <p className="mb-3 text-sm text-muted">Waktu mulai berjalan saat kamu membalik kartu pertama.</p>}
          <div role="group" aria-label="Papan kartu" className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {cards.map((c, i) => {
              const isMatched = matched.includes(c.key);
              const isOpen = isMatched || open.includes(c.id);
              const face = c.face === 'word' ? `kata ${pairWord(c.key)}` : `gambar ${pairMeaning(c.key)}`;
              return (
                <button key={c.id} type="button" onClick={() => flip(c)} data-open={isOpen} data-pair={isOpen ? c.key : undefined} aria-disabled={isMatched || undefined}
                  className={cx('flip aspect-square w-full rounded-2xl transition-transform active:translate-y-[2px]', isMatched && 'pair-hit', miss.includes(c.id) && 'pair-miss')}>
                  {/* The name comes from this text; the drawn faces are decoration. */}
                  <span className="sr-only">{isOpen ? `Kartu ${i + 1}: ${face}${isMatched ? ', sudah cocok' : ''}` : `Kartu ${i + 1}, tertutup`}</span>
                  <span className="flip-inner block" aria-hidden>
                    <span className="flip-face grid place-items-center rounded-2xl border-2 border-line bg-brand text-on-brand shadow-[0_3px_0_var(--line)]">
                      <LogoMark size={34} />
                    </span>
                    <span className={cx('flip-face flip-front grid place-items-center rounded-2xl border-2 shadow-[0_3px_0_var(--line)]', isMatched ? 'border-ok bg-ok-soft' : miss.includes(c.id) ? 'border-bad bg-bad-soft' : 'border-outline bg-surface')}>
                      {c.face === 'pic' ? (
                        <Pic k={c.key} size={64} label={false} className="h-[62%] w-[62%]" />
                      ) : (
                        <span className="px-1 text-center leading-tight">
                          <span lang="en" className="block break-words text-xl font-extrabold sm:text-2xl">{pairWord(c.key)}</span>
                          {isMatched && <span className="block text-xs font-bold text-muted">{pairMeaning(c.key)}</span>}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-center text-sm text-muted">Tiap pasangan {PAIRS.matchPoints} poin, +{PAIRS.comboStep} untuk tiap pasangan beruntun.</p>
        </>
      )}
    </div>
  );
}
