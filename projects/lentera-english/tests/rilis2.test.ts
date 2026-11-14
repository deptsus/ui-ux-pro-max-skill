// Rilis 2: A2 and B1 depth (lessons, stories, conversations, listening) and the
// chapter writing tasks with their deterministic checklist.
import { describe, expect, it } from 'vitest';
import { buildPack } from '@content/index';
import { checkWriting } from '@/lib/engine/writing';

const pack = buildPack();
const levelOf = new Map(pack.chapters.map((c) => [c.id, c.level]));
const unitLevel = new Map(pack.units.map((u) => [u.id, levelOf.get(u.chapterId)]));
const lessonsAt = (level: string) => pack.lessons.filter((l) => unitLevel.get(l.unitId) === level);

describe('kedalaman A2 dan B1', () => {
  it('A2 punya 12 pelajaran dan B1 punya 9, semuanya Premium', () => {
    expect(lessonsAt('A2').length).toBe(12);
    expect(lessonsAt('B1').length).toBe(9);
    for (const l of [...lessonsAt('A2'), ...lessonsAt('B1')]) expect(l.premium, l.id).toBe(true);
  });
  it('setiap bab baru punya ujian unit untuk setiap unitnya', () => {
    for (const u of pack.units.filter((x) => ['a2-c3', 'a2-c4', 'b1-c3'].includes(x.chapterId))) {
      expect(pack.exams.some((e) => e.scope === 'unit' && e.ref === u.id), u.id).toBe(true);
    }
  });
  it('cerita, percakapan, dan materi menyimak A2–B1 bertambah', () => {
    expect(pack.stories.filter((s) => s.level === 'A2').length).toBeGreaterThanOrEqual(5);
    expect(pack.stories.filter((s) => s.level === 'B1').length).toBeGreaterThanOrEqual(2);
    expect(pack.scenarios.filter((s) => s.level === 'A2').length).toBeGreaterThanOrEqual(5);
    expect(pack.scenarios.filter((s) => s.level === 'B1').length).toBeGreaterThanOrEqual(4);
    expect(pack.listening.filter((l) => l.level === 'A2').length).toBeGreaterThanOrEqual(3);
  });
});

describe('PR menulis per bab', () => {
  const tasks = pack.homework.filter((h) => h.kind === 'writing' && h.id.endsWith('.write'));
  it('setiap bab A2 dan B1 punya tugas menulis', () => {
    for (const c of pack.chapters.filter((x) => x.level === 'A2' || x.level === 'B1')) {
      expect(tasks.some((h) => h.chapterId === c.id), c.id).toBe(true);
    }
  });
  it('contoh jawaban setiap tugas lolos daftar periksanya sendiri (100%)', () => {
    for (const h of tasks) {
      const r = checkWriting(h.writing!.model, h.writing!);
      expect(r.items.filter((i) => !i.ok).map((i) => i.label), h.id).toEqual([]);
      expect(r.score, h.id).toBe(100);
    }
  });
  it('tulisan yang terlalu pendek atau tanpa unsur wajib tidak mendapat 100%', () => {
    for (const h of tasks) {
      expect(checkWriting('I like it', h.writing!).score, h.id).toBeLessThan(50);
    }
  });
});
