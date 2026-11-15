// Rilis 5: four more lessons for each of B2, C1 and C2, branching stories,
// and the C1–C2 conversations and listening items that come with them.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'node:path';
import { buildPack } from '@content/index';
import { branchStories } from '@content/stories-branch';
import { indexContent, type Story, type StoryBranch, type StoryChoice } from '@/lib/content/types';
import { packForFree, packToRows, rowsToPack, type Rows } from '@/lib/content/rows';
import { validateBranch, validatePack } from '@/lib/content/validate';
import { branchScore } from '@/lib/engine/branch';
import { planMilestones } from '@/lib/engine/plan';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { newUser } from './helpers';

const pack = buildPack();
const ix = indexContent(pack);
const NEW_CHAPTERS = ['b2-c3', 'c1-c3', 'c2-c3'];
const lessonsOf = (level: string) => pack.lessons.filter((l) => {
  const u = pack.units.find((x) => x.id === l.unitId);
  return pack.chapters.find((c) => c.id === u?.chapterId)?.level === level;
});

describe('Rilis 5: pelajaran B2–C2 lanjutan', () => {
  it('B2, C1 dan C2 masing-masing punya 9 pelajaran', () => {
    for (const level of ['B2', 'C1', 'C2']) expect(lessonsOf(level), level).toHaveLength(9);
  });

  it('setiap bab baru punya 2 unit, 4 pelajaran, ujian unit, PR menulis, PR menyimak, dan kosakata', () => {
    for (const id of NEW_CHAPTERS) {
      const ch = pack.chapters.find((c) => c.id === id)!;
      expect(ch, id).toBeTruthy();
      expect(ch.premium).toBe(true);
      const units = pack.units.filter((u) => u.chapterId === id);
      expect(units).toHaveLength(2);
      const lessons = pack.lessons.filter((l) => units.some((u) => u.id === l.unitId));
      expect(lessons).toHaveLength(4);
      for (const l of lessons) {
        expect(l.premium).toBe(true);
        expect(ix.topicById.get(l.topic)?.lessonId, l.id).toBe(l.id);
        // Teaching, examples, and every practice stage from guided to mastery.
        expect(l.teaching.length).toBeGreaterThanOrEqual(3);
        expect(l.demo.length).toBeGreaterThanOrEqual(3);
        const stages = new Set(pack.exercises.filter((e) => e.lessonId === l.id).map((e) => e.stage));
        for (const s of ['guided', 'independent', 'mastery']) expect(stages.has(s as never), `${l.id} ${s}`).toBe(true);
      }
      const hw = pack.homework.filter((h) => h.chapterId === id);
      expect(hw.some((h) => h.kind === 'writing' && (h.writing?.levels?.length ?? 0) >= 3), `${id} menulis`).toBe(true);
      expect(hw.some((h) => h.kind === 'listening'), `${id} menyimak`).toBe(true);
      expect(pack.vocabulary.filter((v) => v.level === ch.level && v.set === ch.title).length, `${id} kosakata`).toBeGreaterThanOrEqual(4);
    }
  });

  it('salah paham baru punya penjelasan, dan setiap soal salah mengarah ke salah satunya', () => {
    const newTopics = pack.lessons.filter((l) => NEW_CHAPTERS.some((c) => l.unitId.startsWith(c))).map((l) => l.topic);
    expect(newTopics).toHaveLength(12);
    const tags = new Set(pack.exercises.filter((e) => newTopics.includes(e.topic)).flatMap((e) => e.options?.map((o) => o.tag) ?? []).filter(Boolean));
    expect(tags.size).toBeGreaterThanOrEqual(12);
    for (const t of tags) expect(pack.tags.find((x) => x.id === t)?.tip, t).toBeTruthy();
  });

  it('percakapan dan materi menyimak C1–C2 bertambah', () => {
    for (const id of ['pitch', 'extension', 'retro', 'workload']) expect(pack.scenarios.some((s) => s.id.includes(id)), id).toBe(true);
    for (const id of ['listen-c1-pitch', 'listen-c1-ship', 'listen-c2-briefing', 'listen-c2-rivers']) expect(pack.listening.some((l) => l.id === id), id).toBe(true);
    expect(pack.scenarios.filter((s) => s.level === 'C1' || s.level === 'C2').length).toBeGreaterThanOrEqual(8);
  });
});

// ─────────────────────────────── branching stories ───────────────────────────────
const best = (cs: StoryChoice[]) => cs.find((c) => c.correct && c.natural === 3)!;
function walk(b: StoryBranch, pick: (cs: StoryChoice[]) => StoryChoice) {
  const nodes = new Map(b.nodes.map((n) => [n.id, n]));
  const picks: StoryChoice[] = [];
  let id = b.start;
  for (let k = 0; k < 50; k++) {
    const n = nodes.get(id)!;
    if (n.ending) return { picks, ending: n.ending };
    const c = pick(n.choices!);
    picks.push(c);
    id = c.next;
  }
  throw new Error('loop');
}
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const sample = (): Story => clone(pack.stories.find((s) => s.id === 'story-cafe-interview')!);

describe('Rilis 5: cerita bercabang', () => {
  it('ada empat cerita bercabang B1–C2, Premium, tanpa soal di akhir', () => {
    const stories = pack.stories.filter((s) => s.branch);
    expect(stories.map((s) => s.level).sort()).toEqual(['B1', 'B2', 'C1', 'C2']);
    expect(stories.map((s) => s.id).sort()).toEqual(branchStories.map((s) => s.id).sort());
    for (const s of stories) {
      expect(s.premium).toBe(true);
      expect(s.questionIds).toEqual([]);
      expect(s.scenes.length).toBeGreaterThanOrEqual(1);
      expect(validateBranch(s.id, s.branch!, new Set(s.characters.map((c) => c.id)))).toEqual([]);
    }
  });

  it('jawaban terbaik mencapai akhir yang baik dengan nilai 100; jawaban yang kurang tepat bisa ke akhir lain', () => {
    for (const s of pack.stories.filter((x) => x.branch)) {
      const top = walk(s.branch!, best);
      expect(top.ending.good, s.id).toBe(true);
      expect(branchScore(top.picks.map((choice) => ({ choice })))).toBe(100);
      const weak = walk(s.branch!, (cs) => [...cs].sort((a, b) => (a.correct ? a.natural : 0) - (b.correct ? b.natural : 0))[0]);
      expect(branchScore(weak.picks.map((choice) => ({ choice }))), s.id).toBeLessThan(60);
      expect(s.branch!.nodes.filter((n) => n.ending).length, s.id).toBeGreaterThanOrEqual(2);
      // Every weaker reply shows a better one to learn from.
      for (const n of s.branch!.nodes) for (const c of n.choices ?? []) if (c !== best(n.choices!)) expect(c.better, `${s.id}/${n.id}: ${c.text}`).toBeTruthy();
    }
  });

  it('nilai cerita: benar dan wajar 3, kurang tepat 1–2, salah tata bahasa 0', () => {
    const c = (correct: boolean, natural: 1 | 2 | 3) => ({ choice: { text: 'x', correct, natural, note: 'x', next: 'x' } });
    expect(branchScore([c(true, 3), c(true, 3)])).toBe(100);
    expect(branchScore([c(true, 3), c(false, 3)])).toBe(50);
    expect(branchScore([c(true, 1), c(true, 2), c(true, 3)])).toBe(67);
    expect(branchScore([])).toBe(0);
  });

  it('validator menolak cerita bercabang yang rusak', () => {
    const errs = (mutate: (s: Story) => void) => {
      const s = sample();
      mutate(s);
      return validatePack({ ...pack, stories: pack.stories.map((x) => (x.id === s.id ? s : x)) }).join('\n');
    };
    const node = (s: Story, id: string) => s.branch!.nodes.find((n) => n.id === id)!;
    expect(errs(() => {})).toBe('');
    expect(errs((s) => { s.branch!.as = 'nobody'; })).toMatch(/tokoh pelajar "nobody"/);
    expect(errs((s) => { s.branch!.start = 'zz'; })).toMatch(/cabang awal "zz"/);
    expect(errs((s) => { node(s, 'n2').choices![0].next = 'zz'; })).toMatch(/tujuan "zz" tidak ada/);
    expect(errs((s) => { node(s, 'n3').choices![0].next = 'n1'; })).toMatch(/jalur berputar/);
    expect(errs((s) => { node(s, 'n1').choices![2].next = 'n2'; })).toMatch(/cabang n1b: tidak bisa dicapai/);
    expect(errs((s) => { for (const c of node(s, 'n2').choices!) c.natural = 2; })).toMatch(/tidak ada jawaban terbaik/);
    expect(errs((s) => { delete node(s, 'n2').choices![1].better; })).toMatch(/butuh contoh yang lebih baik/);
    expect(errs((s) => { node(s, 'n2').choices![1].note = ' '; })).toMatch(/butuh teks dan penjelasan/);
    expect(errs((s) => { node(s, 'n2').choices = node(s, 'n2').choices!.slice(0, 1); })).toMatch(/minimal dua pilihan/);
    expect(errs((s) => { node(s, 'n2').choices![1].text = node(s, 'n2').choices![0].text; })).toMatch(/pilihan ganda/);
    expect(errs((s) => { node(s, 'n2').scene.actors = node(s, 'n2').scene.actors.filter((a) => a.who !== 'sari'); })).toMatch(/tokoh pelajar harus ada di adegan/);
    expect(errs((s) => { node(s, 'e-good').choices = node(s, 'n3').choices; })).toMatch(/harus punya pilihan atau akhir cerita/);
    expect(errs((s) => { for (const n of s.branch!.nodes) if (n.ending) n.ending.good = false; })).toMatch(/belum ada akhir cerita yang baik/);
    expect(errs((s) => { s.branch!.nodes.push(clone(node(s, 'n2'))); })).toMatch(/cabang "n2" ganda/);
    expect(errs((s) => { s.scenes = []; })).toMatch(/adegan/);
  });

  it('cerita biasa tetap wajib punya soal, cerita bercabang tidak', () => {
    const plain = clone(pack.stories.find((s) => !s.branch && s.questionIds.length)!);
    plain.questionIds = [];
    expect(validatePack({ ...pack, stories: pack.stories.map((x) => (x.id === plain.id ? plain : x)) }).join('\n')).toMatch(/pertanyaan|soal/);
  });

  it('rencana mingguan menaruh cerita bercabang di akhir levelnya, sebelum ujian level', () => {
    for (const level of ['B1', 'B2', 'C1', 'C2'] as const) {
      const m = planMilestones(ix, level).filter((x) => x.level === level);
      const lastLesson = m.map((x) => x.kind).lastIndexOf('lesson');
      const exam = m.findIndex((x) => x.kind === 'level-exam');
      for (const s of pack.stories.filter((x) => x.branch && x.level === level)) {
        const at = m.findIndex((x) => x.kind === 'story' && x.ref === s.id);
        expect(at, s.id).toBeGreaterThan(lastLesson);
        expect(at, s.id).toBeLessThan(exam);
      }
    }
  });

  it('paket tamu tidak membawa isi cabang cerita Premium', () => {
    const free = packForFree(pack);
    for (const s of free.stories.filter((x) => x.premium)) {
      expect(s.locked).toBe(true);
      expect(s.branch).toBeUndefined();
      expect(s.scenes).toEqual([]);
    }
    expect(JSON.stringify(free)).not.toContain("aunt's food stall");
  });

  it('cabang ikut tersimpan dan kembali utuh lewat baris CMS', () => {
    const back = rowsToPack(packToRows(pack), pack.version);
    for (const s of pack.stories.filter((x) => x.branch)) expect(back.stories.find((x) => x.id === s.id)).toEqual(s);
    for (const s of back.stories.filter((x) => !x.branch)) expect('branch' in s).toBe(false);
  });
});

describe('Rilis 5: basis data (0011)', () => {
  let db: RawDb;
  let admin: string;
  const ROOT = path.resolve(__dirname, '..');
  beforeAll(async () => {
    db = await openEmbedded(undefined, ROOT);
    admin = await newUser(db, 'Admin Cerita', 'admin');
  });
  afterAll(async () => {
    await db.close();
  });

  it('kolom branch ada, fitur terdaftar, dan cabang tersimpan lewat impor lalu terbit', async () => {
    expect(await db.query("select 1 from information_schema.columns where table_name = 'stories' and column_name = 'branch' and data_type = 'jsonb'")).toHaveLength(1);
    const [f] = await db.query<{ f: string[] }>('select content_features() as f');
    expect(f.f).toContain('branching_stories');
    await db.rpc('import_content', { p_actor: admin, p_rows: packToRows(pack) });
    const pub = await db.rpc<{ published: boolean }>('publish_curriculum', { p_actor: admin, p_label: 'r5', p_notes: 'cerita bercabang' });
    expect(pub.published).toBe(true);
    const served = await db.rpc<{ rows: Rows }>('get_published_content');
    const back = rowsToPack(served.rows, pack.version);
    for (const s of branchStories) expect(back.stories.find((x) => x.id === s.id)?.branch).toEqual(s.branch);
  });

  it('cabang yang bukan objek JSON ditolak', async () => {
    const row = (packToRows(pack) as Record<string, Record<string, unknown>[]>).stories.find((r) => r.id === 'story-cafe-interview')!;
    await expect(db.rpc('admin_upsert', { p_actor: admin, p_table: 'stories', p_row: { ...row, branch: [1, 2] } })).rejects.toThrow();
    await db.rpc('admin_upsert', { p_actor: admin, p_table: 'stories', p_row: { ...row, branch: null } });
    const [r] = await db.query<{ branch: unknown }>("select branch from stories where id = 'story-cafe-interview'");
    expect(r.branch).toBeNull();
  });
});
