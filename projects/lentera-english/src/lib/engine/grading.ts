// Deterministic answer checking and feedback. No fuzzy AI matching: an answer
// is accepted when, after normalization, it equals one of the authored answers.
import type { Exercise } from '@/lib/content/types';

export interface Answer {
  /** Index into exercise.options. */
  choice?: number;
  /** Typed text, or the sentence built from tiles. */
  text?: string;
  /** Paragraph arrangement: sentence indexes in the order chosen. */
  order?: number[];
  /** Match: number of wrong pairings made before finishing. */
  mistakes?: number;
  /** Spot: index of the tapped word. */
  wordIndex?: number;
  timedOut?: boolean;
}

export interface Grade {
  correct: boolean;
  /** Model answer, ready to display. */
  correctAnswer: string;
  /** Why the given answer is wrong (empty when correct). */
  feedback: string;
  explanation: string;
  /** Misconception revealed by this answer, if any. */
  tag?: string;
  /** What the learner answered, for the attempt log. */
  given: string;
}

const CONTRACTIONS: [RegExp, string][] = [
  [/\bcan't\b/g, 'cannot'],
  [/\bcan not\b/g, 'cannot'],
  [/\bwon't\b/g, 'will not'],
  [/\bshan't\b/g, 'shall not'],
  [/\bi'm\b/g, 'i am'],
  [/\b(\w+)n't\b/g, '$1 not'],
  [/\b(\w+)'re\b/g, '$1 are'],
  [/\b(\w+)'ve\b/g, '$1 have'],
  [/\b(\w+)'ll\b/g, '$1 will'],
  [/\b(he|she|it|that|there|what|who|where|here)'s\b/g, '$1 is'],
  [/\blet's\b/g, 'let us'],
];

/** Lowercase, unify quotes, drop punctuation, expand contractions. */
export function normalize(input: string): string {
  let s = input.toLowerCase().replace(/[‘’`]/g, "'").replace(/[“”]/g, '"');
  s = s.replace(/[.,!?;:"()]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const [re, to] of CONTRACTIONS) s = s.replace(re, to);
  return s.replace(/\s+/g, ' ').trim();
}

export const tokens = (s: string): string[] => normalize(s).split(' ').filter(Boolean);

/** Word pairs learners commonly swap, mapped to a misconception tag. */
const CONFUSABLES: [string, string, string][] = [
  ['was', 'were', 'was-were'],
  ['is', 'are', 'am-is-are'],
  ['am', 'is', 'am-is-are'],
  ['am', 'are', 'am-is-are'],
  ['a', 'an', 'a-an'],
  ['do', 'does', 'do-does'],
  ['has', 'have', 'has-have'],
  ['this', 'these', 'this-these'],
  ['that', 'those', 'this-these'],
];

function confusableTag(a: string, b: string): string | undefined {
  return CONFUSABLES.find(([x, y]) => (x === a && y === b) || (x === b && y === a))?.[2];
}

/** If two token lists differ in exactly one position, return that pair. */
function singleDiff(given: string[], expected: string[]): [string, string] | null {
  if (given.length !== expected.length) return null;
  let found: [string, string] | null = null;
  for (let i = 0; i < given.length; i++) {
    if (given[i] !== expected[i]) {
      if (found) return null;
      found = [given[i], expected[i]];
    }
  }
  return found;
}

function gradeTyped(ex: Exercise, raw: string): Grade {
  const answers = ex.answers ?? [];
  const model = answers[0] ?? '';
  const given = normalize(raw);
  const out = (correct: boolean, feedback = '', tag?: string): Grade => ({
    correct,
    correctAnswer: model,
    feedback,
    explanation: ex.explanation,
    tag: correct ? undefined : tag ?? ex.focus,
    given: raw.trim(),
  });
  if (!given) return out(false, 'Kamu belum mengisi jawaban.');
  if (answers.some((a) => normalize(a) === given)) return out(true);

  for (const [wrong, err] of Object.entries(ex.errors ?? {})) {
    if (normalize(wrong) === given) return out(false, err.why, err.tag);
  }
  // Closest authored answer by number of differing tokens.
  const g = given.split(' ');
  let best: { pair: [string, string] | null; expected: string[] } | null = null;
  for (const a of answers) {
    const expected = normalize(a).split(' ');
    const pair = singleDiff(g, expected);
    if (pair) {
      best = { pair, expected };
      break;
    }
    best ??= { pair: null, expected };
  }
  if (best?.pair) {
    const [got, want] = best.pair;
    // A known wrong word used inside a longer sentence.
    const err = ex.errors?.[got];
    if (err) return out(false, err.why, err.tag);
    return out(false, `Kamu menulis "${got}", padahal yang tepat "${want}".`, confusableTag(got, want));
  }
  if (best && g.length !== best.expected.length) {
    const missing = best.expected.filter((t) => !g.includes(t));
    const extra = g.filter((t) => !best!.expected.includes(t));
    const parts: string[] = [];
    if (missing.length) parts.push(`kata yang kurang: ${missing.join(', ')}`);
    if (extra.length) parts.push(`kata yang tidak perlu: ${extra.join(', ')}`);
    if (parts.length) return out(false, `Periksa lagi susunan kalimatmu (${parts.join('; ')}).`);
  }
  const sameWords = best && [...g].sort().join(' ') === [...best.expected].sort().join(' ');
  return out(false, sameWords ? 'Kata-katanya sudah benar, tetapi urutannya belum tepat.' : 'Jawabanmu belum sesuai dengan kunci jawaban.');
}

export function grade(ex: Exercise, answer: Answer): Grade {
  const fail = (correctAnswer: string, feedback: string, given: string, tag?: string): Grade => ({
    correct: false,
    correctAnswer,
    feedback,
    explanation: ex.explanation,
    tag: tag ?? ex.focus,
    given,
  });
  const pass = (correctAnswer: string, given: string): Grade => ({
    correct: true,
    correctAnswer,
    feedback: '',
    explanation: ex.explanation,
    given,
  });

  if (ex.options) {
    const right = ex.options.find((o) => o.correct)?.text ?? '';
    if (answer.timedOut) return fail(right, 'Waktu habis sebelum kamu menjawab.', '(waktu habis)');
    const chosen = answer.choice === undefined ? undefined : ex.options[answer.choice];
    if (!chosen) return fail(right, 'Kamu belum memilih jawaban.', '');
    if (chosen.correct) return pass(right, chosen.text);
    return fail(right, chosen.why ?? `"${chosen.text}" bukan jawaban yang tepat.`, chosen.text, chosen.tag);
  }

  switch (ex.type) {
    case 'spot': {
      const words = (ex.text ?? '').split(' ');
      const strip = (w: string) => w.replace(/[.,!?;:"]/g, '');
      const picked = answer.wordIndex === undefined ? '' : strip(words[answer.wordIndex] ?? '');
      const model = `${ex.wrongWord} → ${ex.correction}`;
      if (answer.timedOut) return fail(model, 'Waktu habis sebelum kamu menjawab.', '(waktu habis)');
      if (picked && picked === ex.wrongWord) return pass(model, picked);
      return fail(model, picked ? `"${picked}" sudah benar. Kata yang salah adalah "${ex.wrongWord}".` : 'Kamu belum memilih kata.', picked);
    }
    case 'match': {
      const model = (ex.pairs ?? []).map(([a, b]) => `${a} = ${b}`).join(' · ');
      const mistakes = answer.mistakes ?? 0;
      if (answer.timedOut) return fail(model, 'Waktu habis sebelum semua pasangan selesai.', '(waktu habis)');
      if (mistakes === 0) return pass(model, 'semua pasangan benar');
      return fail(model, `Ada ${mistakes} pasangan yang sempat keliru. Perhatikan lagi daftar pasangan yang benar.`, `${mistakes} salah pasang`);
    }
    case 'para': {
      const sentences = ex.sentences ?? [];
      const model = sentences.join(' ');
      const order = answer.order ?? [];
      const given = order.map((i) => sentences[i]).join(' ');
      if (answer.timedOut) return fail(model, 'Waktu habis sebelum kamu menjawab.', '(waktu habis)');
      if (order.length === sentences.length && order.every((v, i) => v === i)) return pass(model, given);
      const firstWrong = order.findIndex((v, i) => v !== i);
      return fail(model, `Urutan mulai keliru pada kalimat ke-${firstWrong + 1}. Cari kalimat pembuka, lalu ikuti kata penghubung dan urutan waktunya.`, given);
    }
    default: {
      if (answer.timedOut) {
        return { ...gradeTyped(ex, ''), feedback: 'Waktu habis sebelum kamu menjawab.', given: '(waktu habis)' };
      }
      return gradeTyped(ex, answer.text ?? '');
    }
  }
}

/** Deterministic PRNG (mulberry32) so shuffles are reproducible per seed. */
export function rng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(list: T[], seed: string): T[] {
  const r = rng(seed);
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
