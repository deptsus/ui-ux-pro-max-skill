'use client';
// Rilis 15 interactive exercises: choose the picture, place the object in a
// scene, tap when it happens on a timeline, and spell with letter tiles. Every
// target is a real button (radio or tile) with an Indonesian label, so the
// exercises work with a keyboard and a screen reader as well as by touch.
import { useMemo } from 'react';
import type { Exercise, Option, Spot, Zone } from '@/lib/content/types';
import { shuffle } from '@/lib/engine/grading';
import { PICS, isPic } from '@/lib/content/pics';
import { Pic } from '../pics/Pic';
import { INK } from '../cast/Face';
import { cx } from '../ui';

type State = 'idle' | 'chosen' | 'right' | 'wrong';
const TILE_TONE: Record<State, string> = {
  idle: 'border-line bg-surface',
  chosen: 'border-brand bg-brand-soft [--edge:var(--brand)]',
  right: 'border-ok bg-ok-soft [--edge:var(--ok)]',
  wrong: 'border-bad bg-bad-soft [--edge:var(--bad)]',
};
const stateOf = (i: number, choice: number | null, locked: boolean, right: number): State =>
  locked && i === right ? 'right' : locked && i === choice ? 'wrong' : i === choice ? 'chosen' : 'idle';

interface ChoiceProps { ex: Exercise; order: number[]; choice: number | null; locked: boolean; onPick: (i: number) => void }

/** Choose the picture: a 2×2 grid of big illustrated tiles. */
export function PictureChoice({ ex, order, choice, locked, onPick }: ChoiceProps) {
  const right = ex.options!.findIndex((o) => o.correct);
  return (
    <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Pilihan gambar">
      {order.map((i) => {
        const o = ex.options![i];
        return (
          <button key={i} type="button" role="radio" aria-checked={choice === i} aria-label={o.text} disabled={locked} onClick={() => onPick(i)}
            className={cx('tile grid aspect-square place-items-center rounded-2xl p-2', TILE_TONE[stateOf(i, choice, locked, right)])}>
            {isPic(o.pic) && <Pic k={o.pic} size={92} label={false} />}
          </button>
        );
      })}
    </div>
  );
}

// ───────────── Scene: prepositions of place ─────────────
/** Where each spot sits in the 240×160 scene, per piece of furniture. */
/** Where the object rests (x, the line its base sits on) and, when it differs, the height of the tap target. */
const SPOTS: Record<NonNullable<Exercise['scene']>['place'], Partial<Record<Spot, [x: number, base: number, tapY?: number]>>> = {
  table: { on: [86, 66], under: [120, 150], next: [216, 150], behind: [162, 80, 50] },
  box: { in: [120, 118, 118], on: [108, 90, 66], next: [212, 150], behind: [158, 100, 62], front: [84, 158, 140] },
  bed: { on: [128, 66], under: [96, 150], next: [212, 150] },
  chair: { on: [120, 90], under: [120, 150], next: [204, 150], behind: [130, 58, 26] },
};
/** Spots each place offers (the validator uses the same list). */
export const PLACE_SPOTS = Object.fromEntries(Object.entries(SPOTS).map(([k, v]) => [k, Object.keys(v)])) as Record<NonNullable<Exercise['scene']>['place'], Spot[]>;

function Furniture({ place, part }: { place: NonNullable<Exercise['scene']>['place']; part: 'back' | 'front' }) {
  const o = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  if (place === 'table') return part === 'front' ? (
    <g><path d="M40 66 H200 L190 80 H50 Z" fill="#d97706" {...o} /><path d="M58 80 V150 M182 80 V150" stroke="#78350f" strokeWidth="7" strokeLinecap="round" /></g>
  ) : null;
  if (place === 'box') return part === 'back' ? (
    <path d="M70 86 L120 74 L170 86 L170 94 L70 94 Z" fill="#92400e" {...o} />
  ) : (
    <g><path d="M70 94 L170 94 L170 150 L70 150 Z" fill="#d97706" {...o} /><path d="M70 94 L52 80 M170 94 L188 80" {...o} stroke="#b45309" strokeWidth="6" /></g>
  );
  if (place === 'bed') return part === 'front' ? (
    <g><path d="M14 38 V150 M180 70 V150" stroke="#78350f" strokeWidth="7" strokeLinecap="round" /><path d="M14 70 H180 V92 H14 Z" fill="#fff" {...o} /><path d="M78 66 H180 V92 H78 Z" fill="#60a5fa" {...o} /><path d="M20 60 C20 54 46 54 46 60 V70 H20 Z" fill="#fde68a" {...o} /></g>
  ) : null;
  return part === 'front' ? (
    <g><path d="M92 36 H148 V86 H92 Z" fill="#f59e0b" {...o} /><path d="M86 86 H154 V98 H86 Z" fill="#b45309" {...o} /><path d="M94 98 V150 M146 98 V150" stroke="#78350f" strokeWidth="6" strokeLinecap="round" /></g>
  ) : null;
}

/** Place the object: tap the spot; the object moves there. */
export function SceneChoice({ ex, order, choice, locked, onPick }: ChoiceProps) {
  const scene = ex.scene!;
  const right = ex.options!.findIndex((o) => o.correct);
  const shown = locked ? choice ?? right : choice;
  const at = shown !== null && shown !== undefined ? SPOTS[scene.place][ex.options![shown].spot!] : undefined;
  const object = isPic(scene.object) ? scene.object : 'ball';
  const spot = shown !== null && shown !== undefined ? ex.options![shown].spot : undefined;
  // Drawing order: behind the furniture, inside the box (between its back and front), or in front.
  const layer = spot === 'behind' ? 0 : scene.place === 'box' && spot === 'in' ? 1 : 2;
  const figure = at ? (
    <g style={{ transform: `translate(${at[0] - 22}px, ${at[1] - 40}px)`, transition: 'transform 0.35s cubic-bezier(0.3, 1.3, 0.5, 1)' }}>
      <Pic k={object} size={44} label={false} />
    </g>
  ) : null;
  return (
    <div className="space-y-3">
      <div className="relative mx-auto w-full max-w-sm rounded-2xl border border-line bg-[#eef6ff] dark:bg-surface-2" style={{ aspectRatio: '240 / 160' }}>
        <svg viewBox="0 0 240 160" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d="M0 150 H240" stroke={INK} strokeWidth="2" opacity="0.25" />
          {layer === 0 && figure}
          <Furniture place={scene.place} part="back" />
          {layer === 1 && figure}
          <Furniture place={scene.place} part="front" />
          {layer === 2 && figure}
        </svg>
        <div role="radiogroup" aria-label={`Tempat untuk ${isPic(scene.object) ? PICS[scene.object][1] : scene.object}`} className="absolute inset-0">
          {order.map((i) => {
            const o = ex.options![i];
            const p = SPOTS[scene.place][o.spot!];
            if (!p) return null;
            const st = stateOf(i, choice, locked, right);
            return (
              <button key={i} type="button" role="radio" aria-checked={choice === i} aria-label={o.text} disabled={locked} onClick={() => onPick(i)}
                className={cx('absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[2.5px] border-dashed text-sm font-bold transition',
                  st === 'right' ? 'border-ok bg-ok/25' : st === 'wrong' ? 'border-bad bg-bad/20' : st === 'chosen' ? 'border-brand bg-brand/15' : 'border-line-strong/70 bg-white/50 hover:bg-white/80')}
                style={{ left: `${(p[0] / 240) * 100}%`, top: `${((p[2] ?? p[1] - 18) / 160) * 100}%` }} />
            );
          })}
        </div>
      </div>
      {!at && <p className="flex items-center justify-center gap-2 text-sm text-muted"><Pic k={object} size={28} label={false} />Ketuk lingkaran tempat benda ini seharusnya berada.</p>}
    </div>
  );
}

// ───────────── Timeline: when does it happen? ─────────────
const ZONE_ORDER: Zone[] = ['past', 'past-now', 'now', 'always', 'future'];
const ZONE_ICON: Record<Zone, string> = { past: '◀', 'past-now': '◀▶', now: '●', always: '↻', future: '▶' };

/** Tap the part of the timeline when the action happens. */
export function TimelineChoice({ ex, choice, locked, onPick }: Omit<ChoiceProps, 'order'>) {
  const right = ex.options!.findIndex((o) => o.correct);
  const order = ex.options!.map((_, i) => i).sort((a, b) => ZONE_ORDER.indexOf(ex.options![a].zone!) - ZONE_ORDER.indexOf(ex.options![b].zone!));
  const shown = locked ? right : choice;
  const zone = shown !== null && shown !== undefined ? ex.options![shown].zone : undefined;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 300 70" className="w-full" aria-hidden>
        <path d="M14 36 H286" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <path d="M278 28 L290 36 L278 44" fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        {zone === 'past' && <rect x="18" y="24" width="112" height="24" rx="12" fill="var(--brand)" opacity="0.35" />}
        {zone === 'future' && <rect x="170" y="24" width="106" height="24" rx="12" fill="var(--brand)" opacity="0.35" />}
        {zone === 'past-now' && <rect x="18" y="24" width="134" height="24" rx="12" fill="var(--brand)" opacity="0.35" />}
        {zone === 'always' && [40, 90, 150, 210, 260].map((x) => <circle key={x} cx={x} cy="36" r="8" fill="var(--brand)" opacity="0.5" />)}
        <circle cx="150" cy="36" r="10" fill={zone === 'now' ? 'var(--brand)' : '#fff'} stroke={INK} strokeWidth="3.5" />
        <text x="150" y="66" textAnchor="middle" fontSize="13" fontWeight="800" fill="currentColor">sekarang</text>
        <text x="40" y="66" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" opacity="0.7">dulu</text>
        <text x="262" y="66" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" opacity="0.7">nanti</text>
      </svg>
      <div className={cx('grid gap-2', order.length > 3 ? 'grid-cols-2' : 'grid-cols-3')} role="radiogroup" aria-label="Kapan terjadinya">
        {order.map((i) => {
          const o: Option = ex.options![i];
          return (
            <button key={i} type="button" role="radio" aria-checked={choice === i} disabled={locked} onClick={() => onPick(i)}
              className={cx('tile flex min-h-14 flex-col items-center justify-center rounded-xl px-2 py-2 text-base font-bold leading-tight', TILE_TONE[stateOf(i, choice, locked, right)])}>
              <span aria-hidden className="text-xs opacity-70">{ZONE_ICON[o.zone!]}</span>{o.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ───────────── Spell with letter tiles ─────────────
const ALPHA = 'abcdefghijklmnopqrstuvwxyz';
/** The word's letters plus two decoys, shuffled per attempt. */
export function spellTiles(word: string, seed: string): string[] {
  const letters = word.toLowerCase().split('');
  const decoys = shuffle(ALPHA.split('').filter((c) => !letters.includes(c)), seed + 'd').slice(0, 2);
  return shuffle([...letters, ...decoys], seed);
}

/** Build the word: tap letters to add them, tap a placed letter to take it back. */
export function SpellTiles({ ex, seed, picked, locked, onChange }: { ex: Exercise; seed: string; picked: number[]; locked: boolean; onChange: (picked: number[], text: string) => void }) {
  const tiles = useMemo(() => spellTiles(ex.answers?.[0] ?? '', seed + ex.id), [ex, seed]);
  const word = picked.map((i) => tiles[i]).join('');
  const answer = ex.answers?.[0] ?? '';
  const length = answer.length;
  // After the answer is checked with nothing placed (the card was redrawn), show the right spelling.
  const reveal = locked && !picked.length;
  return (
    <div className="space-y-4">
      {isPic(ex.pic) && <div className="grid place-items-center"><Pic k={ex.pic} size={104} /></div>}
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label={reveal ? `Ejaan yang benar: ${answer}` : `Kata yang kamu susun: ${word || 'kosong'}`}>
        {Array.from({ length }, (_, s) => {
          const t = picked[s];
          if (reveal) return <span key={s} className="tile en grid h-12 w-10 place-items-center rounded-xl border-ok bg-ok-soft text-2xl font-extrabold [--edge:var(--ok)]" aria-hidden>{answer[s]}</span>;
          return t === undefined ? (
            <span key={s} className="grid h-12 w-10 place-items-center rounded-xl border-[2.5px] border-dashed border-line-strong" aria-hidden />
          ) : (
            <button key={s} type="button" disabled={locked} aria-label={`Hapus huruf ${tiles[t]}`} onClick={() => { const next = picked.filter((_, j) => j !== s); onChange(next, next.map((i) => tiles[i]).join('')); }}
              className="tile en grid h-12 w-10 place-items-center rounded-xl border-brand bg-brand-soft text-2xl font-extrabold [--edge:var(--brand)]">{tiles[t]}</button>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Huruf">
        {tiles.map((c, i) => (
          <button key={i} type="button" disabled={locked || picked.includes(i) || picked.length >= length} onClick={() => { const next = [...picked, i]; onChange(next, next.map((j) => tiles[j]).join('')); }}
            className={cx('tile en grid h-12 w-11 place-items-center rounded-xl border-line bg-surface text-2xl font-extrabold disabled:opacity-35', picked.includes(i) && 'invisible')}>{c}</button>
        ))}
      </div>
    </div>
  );
}
