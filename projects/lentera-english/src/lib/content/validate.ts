// Content quality gate. Used by `npm run content:check`, by the test suite and
// by the CMS before a curriculum version is published.
import { STORY_BACKDROPS, STORY_LOOKS, STORY_POSES, type ContentPack, type Exercise } from './types';
import { grade, normalize } from '@/lib/engine/grading';

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
      // Every accepted alternative must also grade as correct.
      for (const alt of e.answers.slice(1)) if (!grade(e, { text: alt }).correct) bad(`jawaban alternatif "${alt}" tidak dinilai benar`);
      for (const wrong of Object.keys(e.errors ?? {})) {
        if (grade(e, { text: wrong }).correct) bad(`jawaban salah "${wrong}" ternyata dinilai benar`);
      }
    }
    if (e.type === 'fill' && !(e.text ?? '').includes('___')) bad('fill butuh tanda ___');
    if (e.type === 'arrange' && (e.answers?.[0] ?? '').split(' ').length < 3) bad('arrange butuh minimal tiga kata');
  }
  if (e.type === 'listen' && !e.audioText && !e.audioKey) bad('listen butuh audioText atau audioKey');
  // Dictation: the model answer, put back into the gap, must be exactly what the audio says.
  if (e.type === 'fill' && e.audioText && e.answers?.length && (e.text ?? '').includes('___')) {
    const heard = ` ${normalize(e.audioText)} `;
    if (!heard.includes(` ${normalize((e.text ?? '').replace('___', e.answers[0]))} `)) bad('dikte: kalimat dengan kunci jawaban tidak sama dengan audionya');
  }
  // A hint must point the way, not give the answer away. Naming the answer
  // among the alternatives ("am / is / are") is fine; naming it alone is not.
  const hint = (e.hint ?? '').toLowerCase();
  const key = e.type === 'fill' ? e.answers?.[0] : e.options?.find((o) => o.correct)?.text;
  const others = e.type === 'fill' ? Object.keys(e.errors ?? {}) : (e.options ?? []).filter((o) => !o.correct).map((o) => o.text);
  const mentions = (w: string) => w.length > 1 && new RegExp(`(^|[^a-z'])${w.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z']|$)`).test(hint);
  if (hint && key && mentions(key) && !others.some(mentions)) bad(`petunjuk membocorkan jawaban "${key}"`);
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
  // The same question twice reads as filler.
  const seen = new Map<string, string>();
  for (const e of pack.exercises) {
    const k = `${e.type}|${e.prompt}|${e.text ?? ''}|${e.context ?? ''}|${(e.options ?? []).map((o) => o.text).join('/')}|${(e.pairs ?? []).flat().join('/')}|${(e.sentences ?? []).join('/')}|${e.audioText ?? ''}`.toLowerCase();
    if (seen.has(k)) errs.push(`${e.id}: sama persis dengan ${seen.get(k)}`);
    else seen.set(k, e.id);
  }
  const PRODUCTION = new Set(['fill', 'translate', 'construct', 'fix', 'arrange']);
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
    for (const t of l.teaching ?? []) for (const x of t.examples ?? []) if (!x.en?.trim() || !x.id?.trim()) errs.push(`${p}: contoh di "${t.heading}" belum lengkap (en/id)`);
    for (const d of l.demo ?? []) if (!d.why?.trim() || d.good.trim() === d.bad.trim()) errs.push(`${p}: contoh benar/salah "${d.good}" tidak lengkap`);
    // Learners must produce English, not only recognise it.
    for (const stage of ['independent', 'mastery'] as const) {
      if (!pack.exercises.some((e) => e.lessonId === l.id && e.stage === stage && PRODUCTION.has(e.type))) errs.push(`${p}: tahap ${stage} tidak punya soal menulis/menyusun`);
    }
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
      if (new Set(n.options.map((o) => o.text)).size !== n.options.length) errs.push(`skenario ${s.id}/${n.id}: pilihan duplikat`);
    }
    // Every node must be reachable from the start, and no path may loop forever.
    const byId = new Map(s.nodes.map((n) => [n.id, n]));
    const seen = new Set<string>();
    const onPath = new Set<string>();
    const walk = (id: string): void => {
      if (onPath.has(id)) { errs.push(`skenario ${s.id}: jalur berputar di "${id}"`); return; }
      if (seen.has(id) || !byId.has(id)) return;
      seen.add(id);
      onPath.add(id);
      for (const o of byId.get(id)!.options) if (o.next !== 'end') walk(o.next);
      onPath.delete(id);
    };
    walk(s.start);
    for (const n of s.nodes) if (!seen.has(n.id)) errs.push(`skenario ${s.id}/${n.id}: tidak bisa dicapai dari awal`);
  }
  for (const l of pack.listening) for (const id of l.questionIds) if (!ids.has(id)) errs.push(`listening ${l.id}: soal ${id} tidak ada`);
  const known = <T extends string>(list: readonly T[], v: string | undefined) => v === undefined || (list as readonly string[]).includes(v);
  const storyIds = new Set<string>();
  const stage = new Map(pack.exercises.map((e) => [e.id, e.stage]));
  for (const s of pack.stories ?? []) {
    if (storyIds.has(s.id)) errs.push(`cerita ${s.id}: id ganda`);
    storyIds.add(s.id);
    if (s.locked) continue;
    if (!s.title.trim() || !s.summary.trim()) errs.push(`cerita ${s.id}: judul dan ringkasan wajib diisi`);
    const cast = new Set(s.characters.map((c) => c.id));
    for (const c of s.characters) {
      if (!known(STORY_LOOKS, c.look)) errs.push(`cerita ${s.id}: tokoh ${c.id} memakai rupa "${c.look}" yang tidak dikenal`);
      for (const color of [c.shirt, c.hair, c.skin, c.hijab]) if (color !== undefined && !/^#[0-9a-f]{6}$/i.test(color)) errs.push(`cerita ${s.id}: warna "${color}" pada tokoh ${c.id} harus berbentuk #rrggbb`);
      if (!c.name.trim()) errs.push(`cerita ${s.id}: tokoh ${c.id} belum punya nama`);
    }
    if (s.scenes.length < 2) errs.push(`cerita ${s.id}: minimal dua adegan`);
    s.scenes.forEach((sc, i) => {
      const p = `cerita ${s.id}/adegan ${i + 1}`;
      if (!known(STORY_BACKDROPS, sc.backdrop)) errs.push(`${p}: latar "${sc.backdrop}" tidak dikenal`);
      if (sc.actors.length > 3) errs.push(`${p}: maksimal tiga tokoh dalam satu adegan`);
      if (new Set(sc.actors.map((a) => a.at)).size !== sc.actors.length) errs.push(`${p}: dua tokoh berdiri di posisi yang sama`);
      for (const a of sc.actors) {
        if (!cast.has(a.who)) errs.push(`${p}: tokoh "${a.who}" tidak ada di daftar tokoh`);
        if (!known(STORY_POSES, a.pose)) errs.push(`${p}: pose "${a.pose}" tidak dikenal`);
      }
      if (!sc.lines.length) errs.push(`${p}: belum ada kalimat`);
      const onStage = new Set(sc.actors.map((a) => a.who));
      for (const l of sc.lines) {
        if (l.who !== 'narrator' && !onStage.has(l.who)) errs.push(`${p}: "${l.who}" berbicara tetapi tidak ada di adegan`);
        if (!l.en.trim() || !l.tr.trim()) errs.push(`${p}: setiap kalimat butuh teks Inggris dan terjemahan`);
        if (!known(STORY_POSES, l.pose)) errs.push(`${p}: pose "${l.pose}" tidak dikenal`);
      }
    });
    if (s.questionIds.length < 3) errs.push(`cerita ${s.id}: minimal tiga soal setelah cerita`);
    for (const id of s.questionIds) {
      if (!ids.has(id)) errs.push(`cerita ${s.id}: soal ${id} tidak ada`);
      else if (stage.get(id) !== 'story') errs.push(`cerita ${s.id}: soal ${id} harus bertahap "story"`);
    }
  }
  return errs;
}
