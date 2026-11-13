// Content quality gate. Used by `npm run content:check`, by the test suite and
// by the CMS before a curriculum version is published.
import type { ContentPack, Exercise } from './types';
import { grade } from '@/lib/engine/grading';

export function validateExercise(e: Exercise): string[] {
  const errs: string[] = [];
  const bad = (m: string) => errs.push(`${e.id}: ${m}`);
  if (!e.prompt?.trim()) bad('prompt kosong');
  if (!e.explanation?.trim()) bad('tidak ada penjelasan');
  if (e.difficulty < 1 || e.difficulty > 5) bad('tingkat kesulitan harus 1-5');
  if (e.options) {
    const right = e.options.filter((o) => o.correct);
    if (right.length !== 1) bad(`harus ada tepat satu jawaban benar (ada ${right.length})`);
    if (e.options.length < 2) bad('minimal dua pilihan');
    for (const o of e.options) if (!o.correct && !o.why?.trim()) bad(`pilihan salah "${o.text}" belum punya alasan`);
    if (new Set(e.options.map((o) => o.text)).size !== e.options.length) bad('pilihan ganda duplikat');
  } else if (e.type === 'match') {
    if (!e.pairs || e.pairs.length < 2) bad('match butuh minimal dua pasangan');
  } else if (e.type === 'para') {
    if (!e.sentences || e.sentences.length < 3) bad('para butuh minimal tiga kalimat');
  } else if (e.type === 'spot') {
    const words = (e.text ?? '').split(' ').map((w) => w.replace(/[.,!?;:"]/g, ''));
    if (!e.wrongWord || !e.correction) bad('spot butuh wrongWord dan correction');
    else if (words.filter((w) => w === e.wrongWord).length !== 1) bad(`kata salah "${e.wrongWord}" harus muncul tepat sekali di kalimat`);
  } else {
    if (!e.answers?.length) bad('tidak ada kunci jawaban');
    else {
      // The model answer must grade as correct, and listed errors as wrong.
      if (!grade(e, { text: e.answers[0] }).correct) bad('kunci jawaban tidak lolos pemeriksaan');
      for (const wrong of Object.keys(e.errors ?? {})) {
        if (grade(e, { text: wrong }).correct) bad(`jawaban salah "${wrong}" ternyata dinilai benar`);
      }
    }
    if (e.type === 'fill' && !(e.text ?? '').includes('___')) bad('fill butuh tanda ___');
    if (e.type === 'arrange' && (e.answers?.[0] ?? '').split(' ').length < 3) bad('arrange butuh minimal tiga kata');
  }
  if (e.type === 'listen' && !e.audioText && !e.audioKey) bad('listen butuh audioText atau audioKey');
  return errs;
}

export function validatePack(pack: ContentPack): string[] {
  const errs: string[] = [];
  const ids = new Set<string>();
  for (const e of pack.exercises) {
    if (ids.has(e.id)) errs.push(`${e.id}: id ganda`);
    ids.add(e.id);
    errs.push(...validateExercise(e));
  }
  const topics = new Set(pack.topics.map((t) => t.id));
  const tags = new Set(pack.tags.map((t) => t.id));
  const vocab = new Set(pack.vocabulary.map((v) => v.id));
  const units = new Set(pack.units.map((u) => u.id));
  for (const e of pack.exercises) {
    if (!topics.has(e.topic) && !e.topic.startsWith('vocab.')) errs.push(`${e.id}: topik "${e.topic}" tidak terdaftar`);
    if (e.focus && !tags.has(e.focus)) errs.push(`${e.id}: focus "${e.focus}" tidak terdaftar`);
    for (const o of e.options ?? []) if (o.tag && !tags.has(o.tag)) errs.push(`${e.id}: tag "${o.tag}" tidak terdaftar`);
    for (const x of Object.values(e.errors ?? {})) if (x.tag && !tags.has(x.tag)) errs.push(`${e.id}: tag "${x.tag}" tidak terdaftar`);
  }
  for (const t of pack.tags) if (!topics.has(t.topic)) errs.push(`tag ${t.id}: topik "${t.topic}" tidak terdaftar`);
  for (const l of pack.lessons) {
    const p = `pelajaran ${l.id}`;
    if (!units.has(l.unitId)) errs.push(`${p}: unit tidak ditemukan`);
    if (!topics.has(l.topic)) errs.push(`${p}: topik tidak terdaftar`);
    if (l.locked) continue;
    if (!l.intro?.trim()) errs.push(`${p}: tidak ada pengantar`);
    if (!l.objectives?.length) errs.push(`${p}: tidak ada tujuan belajar`);
    if (!l.teaching?.length) errs.push(`${p}: tidak ada penjelasan materi`);
    if (!l.demo?.length) errs.push(`${p}: tidak ada contoh benar/salah`);
    for (const v of l.vocab ?? []) if (!vocab.has(v)) errs.push(`${p}: kosakata "${v}" tidak ada`);
    for (const stage of ['guided', 'independent', 'homework', 'mastery'] as const) {
      const n = pack.exercises.filter((e) => e.lessonId === l.id && e.stage === stage).length;
      if (n < 3) errs.push(`${p}: tahap ${stage} hanya punya ${n} soal`);
    }
  }
  for (const h of pack.homework) {
    for (const id of h.exerciseIds) if (!ids.has(id)) errs.push(`PR ${h.id}: soal ${id} tidak ada`);
    if (!h.exerciseIds.length && !h.writing) errs.push(`PR ${h.id}: kosong`);
  }
  for (const x of pack.exams) for (const id of x.exerciseIds) if (!ids.has(id)) errs.push(`ujian ${x.id}: soal ${id} tidak ada`);
  for (const s of pack.scenarios) {
    if (s.locked) continue;
    const nodeIds = new Set(s.nodes.map((n) => n.id));
    if (!nodeIds.has(s.start)) errs.push(`skenario ${s.id}: node awal tidak ada`);
    for (const n of s.nodes) {
      if (n.options.length < 2) errs.push(`skenario ${s.id}/${n.id}: minimal dua pilihan`);
      if (!n.options.some((o) => o.correct && o.natural === 3)) errs.push(`skenario ${s.id}/${n.id}: tidak ada jawaban terbaik`);
      for (const o of n.options) {
        if (o.next !== 'end' && !nodeIds.has(o.next)) errs.push(`skenario ${s.id}/${n.id}: tujuan "${o.next}" tidak ada`);
        if (!o.grammar.trim() || !o.alternatives.length) errs.push(`skenario ${s.id}/${n.id}: umpan balik belum lengkap`);
      }
    }
  }
  for (const l of pack.listening) for (const id of l.questionIds) if (!ids.has(id)) errs.push(`listening ${l.id}: soal ${id} tidak ada`);
  return errs;
}
