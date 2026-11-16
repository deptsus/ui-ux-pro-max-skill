// Listening and conversation material (tahap 3): coverage per level, the
// dictation and scenario checks of the quality gate, and the chapter homework
// that brings listening into the B1–C2 path.
import { describe, expect, it } from 'vitest';
import { buildPack } from '@content/index';
import type { Cefr, ContentPack, Exercise, Scenario } from '@/lib/content/types';
import { validateExercise, validatePack } from '@/lib/content/validate';
import { grade, normalize } from '@/lib/engine/grading';

const pack = buildPack();
const byId = new Map(pack.exercises.map((e) => [e.id, e]));
const UPPER: Cefr[] = ['B1', 'B2', 'C1', 'C2'];

describe('materi menyimak B1–C2', () => {
  it('setiap level B1–C2 punya minimal tiga materi menyimak, semuanya Premium', () => {
    for (const level of UPPER) {
      const items = pack.listening.filter((l) => l.level === level);
      expect(items.length, level).toBeGreaterThanOrEqual(3);
      for (const l of items) expect(l.premium, l.id).toBe(true);
    }
  });

  it('setiap materi punya transkrip, terjemahan, dan minimal tiga pertanyaan yang lolos gerbang mutu', () => {
    for (const l of pack.listening.filter((x) => UPPER.includes(x.level))) {
      expect(l.transcript.length, l.id).toBeGreaterThan(20);
      expect(l.translation.length, l.id).toBeGreaterThan(20);
      expect(l.questionIds.length, l.id).toBeGreaterThanOrEqual(3);
      for (const q of l.questionIds) {
        const ex = byId.get(q)!;
        expect(ex.stage).toBe('listening');
        expect(ex.audioText, q).toBeTruthy();
        expect(validateExercise(ex), q).toEqual([]);
      }
    }
  });

  it('soal pemahaman memakai rekaman materinya sendiri, kata per kata', () => {
    for (const l of pack.listening.filter((x) => x.kind === 'passage' && UPPER.includes(x.level))) {
      const comprehension = l.questionIds.map((q) => byId.get(q)!).filter((e) => e.type === 'listen');
      for (const e of comprehension) expect(e.audioText, e.id).toBe(l.transcript);
    }
  });

  it('kalimat dikte diambil persis dari rekamannya, dan kuncinya dinilai benar', () => {
    const dictations = pack.exercises.filter((e) => e.type === 'fill' && e.audioText);
    // Dictations in listening items come from their recording; those inside a
    // lesson (e.g. TOEFL Listening, Rilis 12) carry their own audio sentence.
    const fromItems = dictations.filter((e) => pack.listening.some((l) => l.questionIds.includes(e.id)));
    expect(fromItems.length).toBeGreaterThanOrEqual(8);
    for (const e of fromItems) {
      const item = pack.listening.find((l) => l.questionIds.includes(e.id))!;
      expect(` ${normalize(item.transcript)} `.includes(` ${normalize(e.audioText!)} `), e.id).toBe(true);
    }
    for (const e of dictations) {
      expect(` ${normalize(e.audioText!)} `.includes(` ${normalize(e.text!.replace('___', e.answers![0]))} `), e.id).toBe(true);
      expect(grade(e, { text: e.answers![0] }).correct, e.id).toBe(true);
    }
  });

  it('gerbang mutu menolak dikte yang kuncinya tidak sama dengan audionya', () => {
    const e: Exercise = { id: 'uji.dikte', stage: 'listening', position: 1, type: 'fill', topic: 'skill.listening', difficulty: 3, prompt: 'Dengarkan.', explanation: 'x', text: 'The scheme will be ___ after six months.', answers: ['reviewing'], audioText: 'The scheme will be reviewed after six months.' };
    expect(validateExercise(e).join()).toMatch(/dikte/);
    expect(validateExercise({ ...e, answers: ['reviewed'] })).toEqual([]);
  });

  it('kontraksi diterima dalam bentuk panjang maupun pendek', () => {
    const e: Exercise = { id: 'uji.kontraksi', stage: 'listening', position: 1, type: 'fill', topic: 'skill.listening', difficulty: 2, prompt: 'Dengarkan.', explanation: 'x', text: '___ call you tomorrow.', answers: ["We'll", 'We will'], audioText: "We'll call you tomorrow." };
    expect(validateExercise(e)).toEqual([]);
    expect(grade(e, { text: 'we will' }).correct).toBe(true);
    expect(grade(e, { text: 'we' }).correct).toBe(false);
  });

  it('setiap bab B1–C2 punya PR menyimak yang menunjuk soal menyimak yang ada', () => {
    for (const c of pack.chapters.filter((x) => UPPER.includes(x.level) && !x.track)) {
      const hw = pack.homework.find((h) => h.id === `hw.${c.id}.listen`);
      expect(hw, c.id).toBeDefined();
      expect(hw!.kind).toBe('listening');
      expect(hw!.exerciseIds.length).toBeGreaterThanOrEqual(3);
      for (const id of hw!.exerciseIds) expect(byId.get(id)?.stage, id).toBe('listening');
    }
  });
});

describe('percakapan bercabang B2–C2', () => {
  it('B1–C2 masing-masing punya minimal dua skenario Premium', () => {
    for (const level of UPPER) {
      const list = pack.scenarios.filter((s) => s.level === level);
      expect(list.length, level).toBeGreaterThanOrEqual(2);
      for (const s of list) expect(s.premium, s.id).toBe(true);
    }
  });

  it('id skenario unik, dan setiap jalur terbaik sampai ke akhir', () => {
    expect(new Set(pack.scenarios.map((s) => s.id)).size).toBe(pack.scenarios.length);
    for (const s of pack.scenarios) {
      const nodes = new Map(s.nodes.map((n) => [n.id, n]));
      let at = s.start;
      let steps = 0;
      while (at !== 'end' && steps < 20) {
        const best = nodes.get(at)!.options.find((o) => o.correct && o.natural === 3)!;
        at = best.next;
        steps++;
      }
      expect(at, s.id).toBe('end');
      expect(steps, s.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('jawaban yang salah tata bahasanya tidak pernah diberi nilai kewajaran tertinggi', () => {
    for (const s of pack.scenarios) for (const n of s.nodes) for (const o of n.options) {
      if (!o.correct) expect(o.natural, `${s.id}/${n.id}: ${o.text}`).toBeLessThan(3);
    }
  });

  const withScenario = (s: Scenario): ContentPack => ({ ...pack, scenarios: [s] });
  const base: Scenario = {
    id: 'uji', title: 'Uji', level: 'B2', premium: true, setting: 'x', goal: 'x', closing: 'x', start: 'a',
    nodes: [
      { id: 'a', speaker: 'A', line: 'Hi.', lineId: 'Hai.', options: [
        { text: 'Hello.', correct: true, natural: 3, grammar: 'x', alternatives: ['Hi.'], next: 'b' },
        { text: 'Hullo.', correct: true, natural: 2, grammar: 'x', alternatives: ['Hi.'], next: 'b' },
      ] },
      { id: 'b', speaker: 'A', line: 'Bye.', lineId: 'Dah.', options: [
        { text: 'Bye.', correct: true, natural: 3, grammar: 'x', alternatives: ['See you.'], next: 'end' },
        { text: 'Goodbye.', correct: true, natural: 3, grammar: 'x', alternatives: ['See you.'], next: 'end' },
      ] },
    ],
  };

  it('gerbang mutu menerima skenario yang utuh', () => {
    expect(validatePack(withScenario(base)).filter((e) => e.startsWith('skenario'))).toEqual([]);
  });

  it('gerbang mutu menolak node yang tidak bisa dicapai', () => {
    const s: Scenario = { ...base, nodes: [...base.nodes, { ...base.nodes[1], id: 'c' }] };
    expect(validatePack(withScenario(s)).join()).toMatch(/uji\/c: tidak bisa dicapai/);
  });

  it('gerbang mutu menolak jalur yang berputar tanpa akhir', () => {
    const loop = { ...base.nodes[1], options: base.nodes[1].options.map((o, i) => (i === 0 ? { ...o, next: 'a' } : o)) };
    expect(validatePack(withScenario({ ...base, nodes: [base.nodes[0], loop] })).join()).toMatch(/berputar/);
  });

  it('gerbang mutu menolak pilihan yang sama dalam satu giliran', () => {
    const dup = { ...base.nodes[1], options: [base.nodes[1].options[0], { ...base.nodes[1].options[0] }] };
    expect(validatePack(withScenario({ ...base, nodes: [base.nodes[0], dup] })).join()).toMatch(/pilihan duplikat/);
  });
});
