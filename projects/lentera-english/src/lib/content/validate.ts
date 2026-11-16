// Content quality gate. Used by `npm run content:check`, by the test suite and
// by the CMS before a curriculum version is published.
import { EXAM_BANK_TYPES, STORY_BACKDROPS, STORY_LOOKS, STORY_POSES, type ContentPack, type Exercise, type StoryBranch, type StoryNode, type StoryScene, type WritingTask } from './types';
import { grade, normalize } from '@/lib/engine/grading';
import { checkWriting } from '@/lib/engine/writing';
import { isPic } from './pics';

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
  // Rilis 15 interactive types.
  if (e.type === 'picture') {
    for (const o of e.options ?? []) if (!isPic(o.pic)) bad(`gambar "${o.pic ?? ''}" untuk pilihan "${o.text}" tidak ada di pustaka gambar`);
    if (new Set((e.options ?? []).map((o) => o.pic)).size !== (e.options ?? []).length) bad('gambar pilihan duplikat');
  }
  if (e.type === 'scene') {
    const places: Record<string, string[]> = { table: ['on', 'under', 'next', 'behind'], box: ['in', 'on', 'next', 'behind', 'front'], bed: ['on', 'under', 'next'], chair: ['on', 'under', 'next', 'behind'] };
    if (!e.scene || !places[e.scene.place]) bad('scene butuh tempat (table, box, bed, chair)');
    else {
      if (!isPic(e.scene.object)) bad(`benda "${e.scene.object}" tidak ada di pustaka gambar`);
      for (const o of e.options ?? []) if (!o.spot || !places[e.scene.place].includes(o.spot)) bad(`posisi "${o.spot ?? ''}" tidak tersedia untuk ${e.scene.place}`);
      if (new Set((e.options ?? []).map((o) => o.spot)).size !== (e.options ?? []).length) bad('posisi pilihan duplikat');
    }
  }
  if (e.type === 'timeline') {
    for (const o of e.options ?? []) if (!o.zone || !['past', 'now', 'future', 'past-now', 'always'].includes(o.zone)) bad(`zona waktu "${o.zone ?? ''}" tidak dikenal`);
    if (new Set((e.options ?? []).map((o) => o.zone)).size !== (e.options ?? []).length) bad('zona waktu duplikat');
  }
  if (e.type === 'spell') {
    const w = e.answers?.[0] ?? '';
    if (!/^[a-z]{3,10}$/.test(w) || (e.answers?.length ?? 0) !== 1) bad('eja butuh tepat satu kata 3–10 huruf kecil');
    if (e.pic !== undefined && !isPic(e.pic)) bad(`gambar "${e.pic}" tidak ada di pustaka gambar`);
    if (!e.pic && !e.audioText && !e.text) bad('eja butuh gambar, audio, atau arti');
  }
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

/** A writing task: complete, rules well-formed, and every example answer meets its own checklist. */
export function validateWriting(p: string, w: WritingTask): string[] {
  const errs: string[] = [];
  if (!w.prompt?.trim() || !(w.minWords > 0) || !w.mustInclude?.length || !w.model?.trim()) return [`${p}: tugas menulis belum lengkap`];
  for (const rule of w.mustInclude) if (!rule.includes('::')) errs.push(`${p}: aturan "${rule}" harus berbentuk "label::kata1|kata2"`);
  if (w.maxWords !== undefined && w.maxWords !== null && !(w.maxWords >= w.minWords)) errs.push(`${p}: jumlah kata maksimal harus sama dengan atau lebih dari minimal`);
  if (w.source !== undefined && w.source !== null && !w.source.trim()) errs.push(`${p}: teks sumber kosong`);
  // The model answer must meet its own checklist, or no learner could.
  if (checkWriting(w.model, w).score < 100) errs.push(`${p}: contoh jawaban tidak memenuhi daftar periksanya sendiri`);
  if (w.levels?.length) {
    if (w.levels.length < 2) errs.push(`${p}: contoh bertingkat minimal dua`);
    if (w.levels.at(-1)!.text !== w.model) errs.push(`${p}: contoh bertingkat terakhir harus sama dengan contoh jawaban`);
    for (const l of w.levels) {
      if (!l.label?.trim() || !l.note?.trim() || !l.text?.trim()) errs.push(`${p}: contoh bertingkat "${l.label ?? ''}" belum lengkap (label, catatan, teks)`);
      else if (checkWriting(l.text, w).score < 100) errs.push(`${p}: contoh "${l.label}" tidak memenuhi daftar periksa`);
    }
  }
  return errs;
}

/** Branching story (Rilis 5): every path reaches an ending, nothing loops, every choice is explained. */
export function validateBranch(id: string, b: StoryBranch, cast: Set<string>): string[] {
  const errs: string[] = [];
  const p = `cerita ${id}`;
  if (!cast.has(b.as)) errs.push(`${p}: tokoh pelajar "${b.as}" tidak ada di daftar tokoh`);
  const byId = new Map<string, StoryNode>();
  for (const n of b.nodes) {
    if (byId.has(n.id)) errs.push(`${p}: cabang "${n.id}" ganda`);
    byId.set(n.id, n);
  }
  if (!byId.has(b.start)) errs.push(`${p}: cabang awal "${b.start}" tidak ada`);
  for (const n of b.nodes) {
    const q = `${p}/cabang ${n.id}`;
    if (!!n.ending === !!n.choices?.length) errs.push(`${q}: harus punya pilihan atau akhir cerita, tidak keduanya`);
    if (n.ending && (!n.ending.title.trim() || !n.ending.text.trim())) errs.push(`${q}: akhir cerita butuh judul dan teks`);
    if (n.choices?.length) {
      if (n.choices.length < 2) errs.push(`${q}: minimal dua pilihan`);
      if (!n.choices.some((c) => c.correct && c.natural === 3)) errs.push(`${q}: tidak ada jawaban terbaik (benar dan kewajaran 3)`);
      if (new Set(n.choices.map((c) => c.text)).size !== n.choices.length) errs.push(`${q}: pilihan ganda`);
      if (!n.scene.actors.some((a) => a.who === b.as)) errs.push(`${q}: tokoh pelajar harus ada di adegan sebelum memilih`);
      for (const c of n.choices) {
        if (!c.text.trim() || !c.note.trim()) errs.push(`${q}: setiap pilihan butuh teks dan penjelasan`);
        if (!byId.has(c.next)) errs.push(`${q}: tujuan "${c.next}" tidak ada`);
        if (!(c.correct && c.natural === 3) && !c.better?.trim()) errs.push(`${q}: pilihan "${c.text}" butuh contoh yang lebih baik`);
      }
    }
  }
  // Reachable from the start, no loops, and at least one good ending.
  const seen = new Set<string>();
  const onPath = new Set<string>();
  const walk = (nid: string): void => {
    if (onPath.has(nid)) { errs.push(`${p}: jalur berputar di "${nid}"`); return; }
    if (seen.has(nid) || !byId.has(nid)) return;
    seen.add(nid);
    onPath.add(nid);
    for (const c of byId.get(nid)!.choices ?? []) walk(c.next);
    onPath.delete(nid);
  };
  walk(b.start);
  for (const n of b.nodes) if (!seen.has(n.id)) errs.push(`${p}/cabang ${n.id}: tidak bisa dicapai dari awal`);
  if (!b.nodes.some((n) => n.ending?.good)) errs.push(`${p}: belum ada akhir cerita yang baik`);
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
    const k = `${e.type}|${e.prompt}|${e.text ?? ''}|${e.context ?? ''}|${(e.options ?? []).map((o) => o.text).join('/')}|${(e.pairs ?? []).flat().join('/')}|${(e.sentences ?? []).join('/')}|${e.audioText ?? ''}|${e.pic ?? ''}|${e.type === 'spell' ? (e.answers ?? []).join('/') : ''}|${e.scene ? `${e.scene.object}@${e.scene.place}` : ''}`.toLowerCase();
    if (seen.has(k)) errs.push(`${e.id}: sama persis dengan ${seen.get(k)}`);
    else seen.set(k, e.id);
  }
  const PRODUCTION = new Set(['fill', 'translate', 'construct', 'fix', 'arrange', 'spell']);
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
    if (h.writing) errs.push(...validateWriting(`PR ${h.id}`, h.writing));
  }
  for (const x of pack.exams) for (const id of x.exerciseIds) if (!ids.has(id)) errs.push(`ujian ${x.id}: soal ${id} tidak ada`);
  // Sectioned level exams (Rilis 3): the bank is exam-only, keyed and answerable on the server.
  const bankOwner = new Map<string, string>();
  for (const x of pack.exams) {
    if (!x.sections?.length) continue;
    const p = `ujian ${x.id}`;
    if (x.scope !== 'level') errs.push(`${p}: bagian ujian hanya untuk ujian level`);
    const kinds = x.sections.map((s) => s.kind);
    for (const k of ['grammar', 'reading', 'listening', 'writing'] as const) if (!kinds.includes(k)) errs.push(`${p}: bagian ${k} tidak ada`);
    if (new Set(x.sections.map((s) => s.id)).size !== x.sections.length) errs.push(`${p}: ID bagian ganda`);
    for (const sec of x.sections) {
      const q = `${p}/${sec.id}`;
      // Packs sent to devices carry only the size of each part (packForClient); nothing to check there.
      if (sec.hidden) continue;
      if (!(sec.passScore >= 1 && sec.passScore <= 100)) errs.push(`${q}: batas lulus bagian harus 1–100`);
      if (!sec.title?.trim()) errs.push(`${q}: judul kosong`);
      if (sec.kind === 'writing') {
        if (!sec.writing?.length) errs.push(`${q}: belum ada tugas menulis`);
        for (const w of sec.writing ?? []) errs.push(...validateWriting(q, w));
        continue;
      }
      if (!(sec.take >= 1) || sec.take > sec.pool.length) errs.push(`${q}: jumlah yang diambil (${sec.take}) harus 1–${sec.pool.length}`);
      if (sec.pool.length < sec.take + 1) errs.push(`${q}: bank perlu minimal satu kelompok cadangan agar percobaan ulang tidak selalu sama`);
      const sizes = new Set(sec.pool.map((g) => g.length));
      if (sizes.size > 1) errs.push(`${q}: semua kelompok soal harus sama besar agar skor setara antarpercobaan`);
      for (const g of sec.pool) {
        if (!g.length) errs.push(`${q}: kelompok soal kosong`);
        for (const id of g) {
          const e = ids.has(id) ? pack.exercises.find((y) => y.id === id) : undefined;
          if (!e) { errs.push(`${q}: soal ${id} tidak ada`); continue; }
          const other = bankOwner.get(id);
          if (other && other !== x.id) errs.push(`${q}: soal ${id} sudah dipakai ujian ${other}`);
          bankOwner.set(id, x.id);
          if (e.stage !== 'exam' || e.lessonId) errs.push(`${q}: soal ${id} harus bertahap "exam" tanpa pelajaran`);
          if (!(EXAM_BANK_TYPES as readonly string[]).includes(e.type)) errs.push(`${q}: jenis soal ${e.type} (${id}) tidak dipakai di ujian level`);
          if (e.type === 'fill' && e.audioText) errs.push(`${q}: dikte tidak dipakai di ujian level (${id})`);
          if (sec.kind === 'reading' && e.type !== 'read') errs.push(`${q}: bagian membaca hanya memuat soal "read" (${id})`);
          if (sec.kind === 'listening' && e.type !== 'listen') errs.push(`${q}: bagian menyimak hanya memuat soal "listen" (${id})`);
          if (sec.kind === 'grammar' && (e.type === 'read' || e.type === 'listen')) errs.push(`${q}: bagian tata bahasa tidak memuat soal bacaan/simakan (${id})`);
        }
      }
    }
  }
  // Bank questions must not leak into lessons, homework, stories or older exams.
  for (const h of pack.homework) for (const id of h.exerciseIds) if (bankOwner.has(id)) errs.push(`PR ${h.id}: soal ${id} milik bank ujian level`);
  for (const x of pack.exams) for (const id of x.exerciseIds) if (bankOwner.has(id)) errs.push(`ujian ${x.id}: soal ${id} milik bank ujian level`);
  for (const st of pack.stories ?? []) for (const id of st.questionIds) if (bankOwner.has(id)) errs.push(`cerita ${st.id}: soal ${id} milik bank ujian level`);
  for (const e of pack.exercises) if (e.stage === 'exam' && !e.lessonId && !bankOwner.has(e.id) && e.id.startsWith('exam.level.')) errs.push(`soal ${e.id}: bank ujian level tetapi tidak dipakai bagian mana pun`);
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
    if (s.scenes.length < (s.branch ? 1 : 2)) errs.push(`cerita ${s.id}: minimal ${s.branch ? 'satu adegan pembuka' : 'dua adegan'}`);
    const scenes: [string, StoryScene][] = [...s.scenes.map((sc, i): [string, StoryScene] => [`cerita ${s.id}/adegan ${i + 1}`, sc]), ...(s.branch?.nodes ?? []).map((n): [string, StoryScene] => [`cerita ${s.id}/cabang ${n.id}`, n.scene])];
    scenes.forEach(([p, sc]) => {
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
    if (s.branch) errs.push(...validateBranch(s.id, s.branch, cast));
    else if (s.questionIds.length < 3) errs.push(`cerita ${s.id}: minimal tiga soal setelah cerita`);
    for (const id of s.questionIds) {
      if (!ids.has(id)) errs.push(`cerita ${s.id}: soal ${id} tidak ada`);
      else if (stage.get(id) !== 'story') errs.push(`cerita ${s.id}: soal ${id} harus bertahap "story"`);
    }
  }
  return errs;
}
