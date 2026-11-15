// Matching recordings to text (Rilis 6). A recording is stored with the text
// it reads; any place in the app that plays the same text, ignoring case,
// punctuation and curly quotes, uses that recording.
import type { AudioResource, ContentPack } from './types';

/** "Nice to meet you!" and "nice to meet you." give the same key. */
export function spokenKey(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[‘’ʼ`]/g, "'")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}' ]+/gu, ' ')
    .replace(/(^|\s)'+|'+(?=\s|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Short stable hash (cyrb53, base 36) used in recording keys and file names. */
export function textHash(s: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/** One recording per text and accent: uploading again replaces it. */
export const recordingKey = (text: string, accent: 'us' | 'uk') => `rec.${textHash(spokenKey(text))}.${accent}`;

/**
 * Only the recordings of text the pack itself contains: a learner never gets
 * the audio (or the transcript) of a Premium passage or an exam text that was
 * stripped from their pack.
 */
export function audioForPack(pack: ContentPack): AudioResource[] {
  if (!pack.audio.length) return pack.audio;
  const texts = new Set<string>();
  const keys = new Set<string>();
  const walk = (v: unknown, field?: string): void => {
    if (typeof v === 'string') {
      if (field === 'audioKey') keys.add(v);
      else if (v.length <= 5000) texts.add(spokenKey(v));
    } else if (Array.isArray(v)) {
      for (const x of v) walk(x);
    } else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) walk(x, k);
    }
  };
  walk({ ...pack, audio: [] });
  return pack.audio.filter((a) => keys.has(a.key) || (!!a.transcript && texts.has(spokenKey(a.transcript))));
}
