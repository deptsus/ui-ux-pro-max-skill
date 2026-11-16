// Rilis 15 "Pelajaran Interaktif": picture, scene, timeline and spelling items.
import { describe, expect, it } from 'vitest';
import { buildPack } from '@content/index';
import { picture, scene, spell, stamp, timeline } from '@content/dsl';
import { grade } from '@/lib/engine/grading';
import { packForFree, packToRows, rowsToPack } from '@/lib/content/rows';
import { validateExercise, validatePack } from '@/lib/content/validate';
import { PICS } from '@/lib/content/pics';
import { spellTiles } from '@/components/interactive/Interactive';
import type { Exercise } from '@/lib/content/types';
import type { LearnerState } from '@/lib/engine/types';
import { PAIRS, PAIR_THEMES, dealPairs, matchPoints, pairsXpToday, timeBonus } from '@/lib/engine/pairs';

const pack = buildPack();
const NEW = ['picture', 'scene', 'timeline', 'spell'] as const;
const one = (d: Parameters<typeof stamp>[0][number]): Exercise => stamp([d], 't', 'guided', 'a1.greetings', null)[0];

describe('Rilis 15 content', () => {
  it('the bundled pack is valid and carries every interactive type', () => {
    expect(validatePack(pack)).toEqual([]);
    for (const t of NEW) expect(pack.exercises.filter((e) => e.type === t).length, t).toBeGreaterThan(2);
  });
  it('Free learners meet all four kinds in free lessons', () => {
    const free = packForFree(pack);
    for (const t of NEW) expect(free.exercises.some((e) => e.type === t && e.lessonId), t).toBe(true);
  });
  it('interactive items sit after the authored ones in their stage, with their own ids', () => {
    const items = pack.exercises.filter((e) => e.lessonId === 'kids-colors-animals' && e.stage === 'guided');
    const extra = items.filter((e) => e.id.includes('.x.'));
    expect(extra.length).toBeGreaterThan(0);
    expect(Math.min(...extra.map((e) => e.position))).toBeGreaterThan(Math.max(...items.filter((e) => !e.id.includes('.x.')).map((e) => e.position)));
    expect(new Set(pack.exercises.map((e) => e.id)).size).toBe(pack.exercises.length);
  });
  it('every picture used by the content is in the illustration library', () => {
    for (const e of pack.exercises) {
      for (const o of e.options ?? []) if (o.pic) expect(PICS, `${e.id}: ${o.pic}`).toHaveProperty(o.pic);
      if (e.pic) expect(PICS, `${e.id}: ${e.pic}`).toHaveProperty(e.pic);
      if (e.scene) expect(PICS, `${e.id}: ${e.scene.object}`).toHaveProperty(e.scene.object);
    }
  });
});

describe('Rilis 15 validator', () => {
  const ok = (e: Exercise) => expect(validateExercise(e)).toEqual([]);
  const bad = (e: Exercise, re: RegExp) => expect(validateExercise(e).join(' | ')).toMatch(re);
  it('picture: keys must exist and be different', () => {
    ok(one(picture(1, 'Ketuk gambarnya.', 'cat', [['cat', 'kucing', true], ['dog', 'anjing', 'Bukan.']], 'x')));
    bad(one(picture(1, 'Ketuk gambarnya.', 'cat', [['cat', 'kucing', true], ['dragon', 'naga', 'Bukan.']], 'x')), /gambar "dragon"/);
    bad(one(picture(1, 'Ketuk gambarnya.', 'cat', [['cat', 'kucing', true], ['cat', 'kucing lagi', 'Bukan.']], 'x')), /gambar pilihan duplikat/);
  });
  it('scene: place, object and spots must fit together', () => {
    ok(one(scene(1, 'On the table.', 'table', 'book', [['on', 'di atas', true], ['under', 'di bawah', 'Bukan.']], 'x')));
    bad(one(scene(1, 'In the bed.', 'bed', 'book', [['in', 'di dalam', true], ['on', 'di atas', 'Bukan.']], 'x')), /posisi "in" tidak tersedia untuk bed/);
    bad(one(scene(1, 'On the table.', 'table', 'dragon', [['on', 'di atas', true], ['under', 'di bawah', 'Bukan.']], 'x')), /benda "dragon"/);
    bad(one(scene(1, 'On the table.', 'table', 'book', [['on', 'di atas', true], ['on', 'di atas juga', 'Bukan.']], 'x')), /posisi pilihan duplikat/);
  });
  it('timeline: zones must be known and different', () => {
    ok(one(timeline(1, 'I was here.', [['past', 'lampau', true], ['now', 'sekarang', 'Bukan.']], 'x')));
    bad(one(timeline(1, 'I was here.', [['past', 'lampau', true], ['past', 'lampau lagi', 'Bukan.']], 'x')), /zona waktu duplikat/);
    bad(one(timeline(1, 'I was here.', [['past', 'lampau', true], ['someday' as never, 'kapan-kapan', 'Bukan.']], 'x')), /zona waktu "someday"/);
  });
  it('spell: one lowercase word with a picture, audio or meaning', () => {
    ok(one(spell(1, 'cat', 'x', { pic: 'cat' })));
    ok(one(spell(1, 'mom', 'x', { meaning: 'ibu' })));
    bad(one(spell(1, 'Cat', 'x', { pic: 'cat' })), /tepat satu kata/);
    bad(one(spell(1, 'ice cream', 'x', { meaning: 'es krim' })), /tepat satu kata/);
    bad(one(spell(1, 'cat', 'x')), /gambar, audio, atau arti/);
    bad(one(spell(1, 'cat', 'x', { pic: 'dragon' })), /gambar "dragon"/);
  });
  it('two spelling items with the same prompt but different words are not duplicates', () => {
    const p = { ...pack, exercises: [...pack.exercises, ...stamp([spell(1, 'sun', 'x', { pic: 'sun' }), spell(1, 'bus', 'x', { pic: 'bus' })], 'dup', 'drill', 'a1.greetings', null)] };
    expect(validatePack(p).filter((e) => e.startsWith('dup.'))).toEqual([]);
  });
});

describe('Rilis 15 storage and grading', () => {
  it('pictures, spots, zones and scenes survive the database round trip', () => {
    const back = rowsToPack(packToRows(pack), pack.version);
    for (const t of NEW) {
      const before = pack.exercises.filter((e) => e.type === t);
      for (const e of before) {
        const b = back.exercises.find((x) => x.id === e.id)!;
        expect(b.options?.map((o) => [o.pic, o.spot, o.zone]), e.id).toEqual(e.options?.map((o) => [o.pic, o.spot, o.zone]));
        expect(b.scene).toEqual(e.scene);
        expect(b.pic).toEqual(e.pic);
      }
    }
  });
  it('option metadata does not leak into the stored option rows', () => {
    const rows = packToRows(pack);
    const q = rows.questions.find((r: { id: string }) => r.id === 'kids-colors-animals.x.g1');
    expect(JSON.stringify(q.options)).not.toMatch(/"pic"/);
    expect(q.payload.optionMeta[0]).toEqual({ pic: 'cat' });
  });
  it('picture, scene and timeline grade by the chosen option', () => {
    for (const t of ['picture', 'scene', 'timeline'] as const) {
      const e = pack.exercises.find((x) => x.type === t)!;
      const right = e.options!.findIndex((o) => o.correct);
      const wrong = e.options!.findIndex((o) => !o.correct);
      expect(grade(e, { choice: right }).correct).toBe(true);
      const g = grade(e, { choice: wrong });
      expect(g.correct).toBe(false);
      expect(g.feedback).toBe(e.options![wrong].why);
    }
  });
  it('spell grades the built word', () => {
    const e = pack.exercises.find((x) => x.type === 'spell' && x.answers?.[0] === 'cat')!;
    expect(grade(e, { text: 'cat' }).correct).toBe(true);
    expect(grade(e, { text: 'cta' }).correct).toBe(false);
  });
  it('letter tiles hold the word plus two decoys, the same for the same attempt', () => {
    for (const w of ['cat', 'egg', 'milk', 'pencil']) {
      const tiles = spellTiles(w, 'seed');
      expect(tiles).toHaveLength(w.length + 2);
      const rest = [...tiles];
      for (const c of w) rest.splice(rest.indexOf(c), 1);
      expect(rest).toHaveLength(2);
      for (const c of rest) expect(w).not.toContain(c);
      expect(spellTiles(w, 'seed')).toEqual(tiles);
    }
  });
});

describe('Pasangan Kilat', () => {
  it('deals each picture twice, once as a word and once as a picture', () => {
    for (const t of PAIR_THEMES) {
      const cards = dealPairs(t, 'seed');
      expect(cards).toHaveLength(Math.min(PAIRS.size, t.keys.length) * 2);
      const keys = new Set(cards.map((c) => c.key));
      for (const k of keys) expect(cards.filter((c) => c.key === k).map((c) => c.face).sort()).toEqual(['pic', 'word']);
      for (const k of t.keys) expect(PICS, `${t.id}: ${k}`).toHaveProperty(k);
      expect(cards.map((c) => c.id)).toEqual(cards.map((_, i) => i));
    }
  });
  it('the same seed deals the same board; another seed reshuffles', () => {
    const t = PAIR_THEMES.find((x) => x.id === 'campur')!;
    expect(dealPairs(t, 'a')).toEqual(dealPairs(t, 'a'));
    expect(dealPairs(t, 'a')).not.toEqual(dealPairs(t, 'b'));
  });
  it('Free gets three themes, Premium the rest', () => {
    expect(PAIR_THEMES.filter((t) => !t.premium).map((t) => t.id)).toEqual(['hewan', 'warna', 'makanan']);
    expect(PAIR_THEMES.filter((t) => t.premium).length).toBeGreaterThan(3);
  });
  it('combo raises the points per match and speed earns a bonus', () => {
    expect(matchPoints(1)).toBe(100);
    expect(matchPoints(3)).toBe(150);
    expect(timeBonus(30)).toBe(300);
    expect(timeBonus(90)).toBe(0);
    expect(timeBonus(200)).toBe(0);
  });
  it('only the first boards of the day earn XP', () => {
    const now = new Date(2026, 10, 16, 10).getTime();
    const s = { xpLog: [] as { at: number; amount: number; reason: string }[] } as unknown as LearnerState;
    expect(pairsXpToday(s, now)).toBe(PAIRS.xp);
    for (let i = 0; i < PAIRS.xpGamesPerDay; i++) s.xpLog.push({ at: now - 1000 * i, amount: PAIRS.xp, reason: 'pairs' });
    expect(pairsXpToday(s, now)).toBe(0);
    expect(pairsXpToday(s, now + 86_400_000)).toBe(PAIRS.xp);
  });
});

describe('scene spots', () => {
  it('the validator and the drawing offer the same spots for each place', async () => {
    const { PLACE_SPOTS } = await import('@/components/interactive/Interactive');
    for (const [place, spots] of Object.entries(PLACE_SPOTS)) {
      for (const sp of spots) expect(validateExercise(one(scene(1, 'x', place as 'table', 'book', [[sp, 'a', true], [spots.find((x) => x !== sp)!, 'b', 'Bukan.']], 'x'))).filter((e) => /posisi/.test(e)), `${place}/${sp}`).toEqual([]);
    }
    expect(validateExercise(one(scene(1, 'x', 'table', 'book', [['front', 'a', true], ['on', 'b', 'Bukan.']], 'x'))).join()).toMatch(/posisi "front" tidak tersedia untuk table/);
  });
});
