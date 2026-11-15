// Deterministic checklist for short writing homework. It checks form, not
// quality: length, required elements (each rule is "label::alt1|alt2", matched
// as lowercase text), and a final full stop. The learner compares their text
// with the model answer to judge quality themselves.
import type { WritingTask } from '@/lib/content/types';

export type { WritingTask };

export const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

export function checkWriting(text: string, w: WritingTask) {
  const lower = ` ${text.toLowerCase().replace(/[‘’]/g, "'")} `;
  const words = countWords(text);
  const items = [
    w.maxWords
      ? { label: `${w.minWords}–${w.maxWords} kata (kamu menulis ${words})`, ok: words >= w.minWords && words <= w.maxWords }
      : { label: `Minimal ${w.minWords} kata (kamu menulis ${words})`, ok: words >= w.minWords },
    ...w.mustInclude.map((rule) => {
      const [label, alts] = rule.split('::');
      return { label, ok: alts.split('|').some((a) => lower.includes(a)) };
    }),
    { label: 'Tiap kalimat diakhiri tanda baca', ok: /[.!?]\s*$/.test(text.trim()) },
  ];
  return { items, score: Math.round((items.filter((i) => i.ok).length / items.length) * 100) };
}
