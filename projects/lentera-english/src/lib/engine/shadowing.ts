// Shadowing practice (Rilis 8): listen to a sentence, say it the same way,
// compare your recording with the model by ear. No automatic scoring: the
// learner rates their own attempt. Sentences come from the content pack the
// learner already has (listening transcripts, vocabulary examples and the
// correct examples of lessons), so nothing Premium leaks to a free pack.
import type { Cefr, ContentPack } from '@/lib/content/types';
import { spokenKey } from '@/lib/content/spoken';
import { CEFR_ORDER } from '@/lib/content/types';
import { rng } from './grading';

export const SHADOW = {
  perSession: 5,
  xpPerSentence: 2,
  minWords: 3,
  maxWords: 22,
  /** Sentences practised recently are picked last. */
  recentKept: 150,
  /** Recordings stop by themselves after this long. */
  maxRecordMs: 30_000,
} as const;

export type ShadowRating = 'good' | 'close' | 'again';

export interface ShadowLine {
  key: string;
  text: string;
  level: Cefr;
  /** Where it comes from, shown above the sentence. */
  source: string;
  translation?: string;
  audioKey?: string;
}

export const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** "Hi! I'm Rina. Nice to meet you." → three sentences. Abbreviations like "Mr." stay attached. */
export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])["”’]?\s+(?=["“‘]?[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean)
    .reduce<string[]>((out, s) => {
      const prev = out[out.length - 1];
      if (prev && /\b(Mr|Mrs|Ms|Dr|St|Prof)\.$/.test(prev)) out[out.length - 1] = `${prev} ${s}`;
      else out.push(s);
      return out;
    }, []);
}

const usable = (s: string) => {
  const n = wordCount(s);
  return n >= SHADOW.minWords && n <= SHADOW.maxWords && /[.!?]["”’]?$/.test(s) && !/_{2,}|\[|\]|\*/.test(s);
};

/** Every sentence of the pack that is good for shadowing, one per spoken text. */
export function shadowLines(pack: ContentPack): ShadowLine[] {
  const out = new Map<string, ShadowLine>();
  const add = (l: Omit<ShadowLine, 'key'>) => {
    const text = l.text.trim();
    if (!usable(text)) return;
    const key = spokenKey(text);
    if (!out.has(key)) out.set(key, { ...l, text, key });
  };
  for (const item of pack.listening) {
    if (item.locked || !item.transcript) continue;
    const parts = splitSentences(item.transcript);
    for (const text of parts) add({ text, level: item.level, source: `Menyimak · ${item.title}`, translation: parts.length === 1 ? item.translation : undefined, audioKey: parts.length === 1 ? item.audioKey : undefined });
  }
  // Main CEFR path only: special-track lessons (Rilis 11) would open a few
  // sentences of a Premium level to free accounts and blur the level lists.
  const unitLevel = new Map(pack.units.map((u) => {
    const c = pack.chapters.find((x) => x.id === u.chapterId);
    return [u.id, c && !c.track ? c.level : undefined];
  }));
  for (const lesson of pack.lessons) {
    if (lesson.locked) continue;
    const level = unitLevel.get(lesson.unitId);
    if (!level) continue;
    for (const d of lesson.demo ?? []) add({ text: d.good, level, source: `Pelajaran · ${lesson.title}` });
  }
  for (const v of pack.vocabulary) {
    if (!v.example) continue;
    add({ text: v.example, level: v.level, source: `Kosakata · ${v.word}` });
  }
  return [...out.values()];
}

export function linesByLevel(lines: ShadowLine[]): Record<Cefr, number> {
  const count = Object.fromEntries(CEFR_ORDER.map((c) => [c, 0])) as Record<Cefr, number>;
  for (const l of lines) count[l.level] += 1;
  return count;
}

/**
 * Five sentences of one level: ones not practised recently first, in an order
 * that changes with `seed`, shorter sentences before longer ones.
 */
export function pickSession(lines: ShadowLine[], level: Cefr, recent: string[], seed: string, n: number = SHADOW.perSession): ShadowLine[] {
  const pool = lines.filter((l) => l.level === level);
  const seen = new Set(recent);
  const rand = rng(seed);
  const shuffled = pool.map((l) => ({ l, r: rand() })).sort((a, b) => a.r - b.r).map((x) => x.l);
  const fresh = shuffled.filter((l) => !seen.has(l.key));
  const old = shuffled.filter((l) => seen.has(l.key)).sort((a, b) => recent.indexOf(a.key) - recent.indexOf(b.key));
  return [...fresh, ...old].slice(0, n).sort((a, b) => wordCount(a.text) - wordCount(b.text));
}

/** "Temponya mirip" when within 15%, otherwise how much slower or faster, in seconds. */
export function tempoNote(modelMs: number, ownMs: number): { tone: 'ok' | 'slow' | 'fast'; text: string } {
  const fmt = (ms: number) => (ms / 1000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const diff = ownMs - modelMs;
  if (!modelMs || !ownMs) return { tone: 'ok', text: '' };
  if (Math.abs(diff) <= modelMs * 0.15) return { tone: 'ok', text: `Temponya sudah mirip (contoh ${fmt(modelMs)} dtk, kamu ${fmt(ownMs)} dtk).` };
  return diff > 0
    ? { tone: 'slow', text: `Kamu ${fmt(diff)} dtk lebih lambat dari contoh (${fmt(modelMs)} dtk). Coba sambungkan kata-katanya.` }
    : { tone: 'fast', text: `Kamu ${fmt(-diff)} dtk lebih cepat dari contoh (${fmt(modelMs)} dtk). Coba beri jeda seperti contoh.` };
}
