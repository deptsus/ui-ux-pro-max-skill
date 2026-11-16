// "Pasangan Kilat" (Rilis 15): a memory game that pairs an English word with
// its picture. Pure rules here; the page in app/app/pasangan draws the board.
import { PICS, type PicKey } from '@/lib/content/pics';
import { dayKey } from './mastery';
import { shuffle } from './grading';
import type { LearnerState } from './types';

export interface PairTheme { id: string; title: string; premium: boolean; keys: PicKey[] }

/** Free learners get three themes; Premium unlocks the rest. */
export const PAIR_THEMES: PairTheme[] = [
  { id: 'hewan', title: 'Hewan', premium: false, keys: ['cat', 'dog', 'bird', 'fish', 'chicken', 'cow', 'rabbit', 'elephant', 'duck', 'frog', 'butterfly', 'snake', 'monkey', 'turtle'] },
  { id: 'warna', title: 'Warna', premium: false, keys: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'purple', 'pink', 'brown'] },
  { id: 'makanan', title: 'Makanan & Minuman', premium: false, keys: ['apple', 'banana', 'orange', 'mango', 'watermelon', 'rice', 'bread', 'egg', 'milk', 'water', 'noodles', 'cake', 'grape', 'strawberry', 'pineapple', 'coconut', 'icecream', 'tea'] },
  { id: 'angka', title: 'Angka 1–10', premium: true, keys: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'] },
  { id: 'tubuh', title: 'Tubuh', premium: true, keys: ['eye', 'ear', 'nose', 'mouth', 'hand', 'tooth'] },
  { id: 'sekolah', title: 'Sekolah', premium: true, keys: ['book', 'pen', 'pencil', 'bag', 'ruler', 'eraser', 'table', 'chair', 'clock'] },
  { id: 'rumah', title: 'Rumah', premium: true, keys: ['bed', 'door', 'window', 'lamp', 'house', 'table', 'chair', 'clock', 'phone', 'box', 'cup', 'spoon', 'key', 'television', 'computer', 'toothbrush'] },
  { id: 'kendaraan', title: 'Kendaraan', premium: true, keys: ['car', 'bus', 'bicycle', 'motorbike', 'plane', 'boat'] },
  { id: 'alam', title: 'Alam & Pakaian', premium: true, keys: ['sun', 'rain', 'cloud', 'wind', 'snow', 'rainbow', 'storm', 'tree', 'flower', 'shirt', 'hat', 'shoes', 'umbrella', 'ball'] },
  { id: 'campur', title: 'Campur Semua', premium: true, keys: Object.keys(PICS) as PicKey[] },
];

export const PAIRS = {
  /** Pairs on one board (12 cards). */
  size: 6,
  /** Points for a match; each match in a row adds `comboStep`. */
  matchPoints: 100,
  comboStep: 25,
  /** Seconds that still earn a time bonus, and the bonus per second left. */
  parSeconds: 90,
  bonusPerSecond: 5,
  /** XP for a finished board, for the first `xpGamesPerDay` boards of the day. */
  xp: 5,
  xpGamesPerDay: 3,
  /** How long two different cards stay face up. */
  mismatchMs: 900,
} as const;

export interface PairCard { id: number; key: PicKey; face: 'word' | 'pic' }

/** A shuffled board: `size` pictures from the theme, each as a word card and a picture card. */
export function dealPairs(theme: PairTheme, seed: string, size: number = PAIRS.size): PairCard[] {
  const keys = shuffle(theme.keys, `${seed}:keys`).slice(0, Math.min(size, theme.keys.length));
  const cards = keys.flatMap((key) => [{ key, face: 'word' as const }, { key, face: 'pic' as const }]);
  return shuffle(cards, `${seed}:cards`).map((c, id) => ({ ...c, id }));
}

/** Points for a match made as the `combo`-th match in a row (1 = first). */
export const matchPoints = (combo: number) => PAIRS.matchPoints + PAIRS.comboStep * Math.max(0, combo - 1);
/** Bonus for finishing quickly. */
export const timeBonus = (seconds: number) => Math.max(0, PAIRS.parSeconds - Math.floor(seconds)) * PAIRS.bonusPerSecond;

export const pairWord = (k: PicKey) => PICS[k][0];
export const pairMeaning = (k: PicKey) => PICS[k][1];

/** XP still on offer today (the first few boards of the day earn XP). */
export function pairsXpToday(s: LearnerState, now: number): number {
  const today = dayKey(now);
  const played = s.xpLog.filter((x) => x.reason === 'pairs' && dayKey(x.at) === today).length;
  return played < PAIRS.xpGamesPerDay ? PAIRS.xp : 0;
}

// Best scores stay on this device (no account data needed).
const BEST_KEY = 'lentera.pairs.best';
export function readBest(): Record<string, number> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const v = JSON.parse(localStorage.getItem(BEST_KEY) ?? '{}');
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}
/** Saves the score if it beats the theme's best; returns true for a new record. */
export function saveBest(themeId: string, score: number): boolean {
  const best = readBest();
  if ((best[themeId] ?? 0) >= score) return false;
  best[themeId] = score;
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(best));
  } catch {
    // Private mode: the record just is not kept.
  }
  return true;
}
