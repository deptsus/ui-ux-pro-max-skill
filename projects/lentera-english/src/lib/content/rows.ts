// Mapping between the runtime ContentPack and the database rows
// (see supabase/migrations/0001_schema.sql and content_rows()).
import { ACHIEVEMENTS } from '@/lib/engine/gamification';
import type { ContentPack, Exercise, Lesson, ListeningItem } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Rows = Record<string, any[]>;

const PAYLOAD_KEYS = ['text', 'context', 'answers', 'errors', 'tiles', 'pairs', 'sentences', 'wrongWord', 'correction', 'audioText'] as const;
const clean = <T extends object>(o: T): T => {
  const r = o as Record<string, unknown>;
  for (const k of Object.keys(r)) if (r[k] === undefined) delete r[k];
  return o;
};

export function packToRows(pack: ContentPack): Rows {
  const listeningOf = new Map<string, string>();
  for (const l of pack.listening) for (const q of l.questionIds) listeningOf.set(q, l.id);
  return {
    cefr_levels: pack.levels.map((l) => ({ code: l.code, title: l.title, description: l.description, position: l.position, exam_pass_score: l.examPassScore })),
    courses: pack.levels.map((l) => ({ id: `course-${l.code.toLowerCase()}`, level_code: l.code, title: `Bahasa Inggris ${l.code}: ${l.title}`, description: l.description })),
    chapters: pack.chapters.map((c) => ({ id: c.id, course_id: `course-${c.level.toLowerCase()}`, position: c.position, title: c.title, description: c.description, is_premium: c.premium, is_planned: !!c.planned })),
    units: pack.units.map((u) => clean({ id: u.id, chapter_id: u.chapterId, position: u.position, title: u.title, description: u.description, exam_pass_score: u.examPassScore, planned_lessons: u.plannedLessons ?? [] })),
    grammar_topics: pack.topics.map((t) => clean({ id: t.id, kind: t.kind, level_code: t.level, title: t.title, summary: t.summary, lesson_id: t.lessonId })),
    misconception_tags: pack.tags.map((t) => ({ id: t.id, topic_id: t.topic, title: t.title, tip: t.tip })),
    audio_resources: pack.audio.map((a) => clean({ key: a.key, accent: a.accent, url: a.url, speaker: a.speaker, transcript: a.transcript })),
    listening_items: pack.listening.map((l) => clean({ id: l.id, level_code: l.level, title: l.title, kind: l.kind, transcript: l.transcript, translation: l.translation, is_premium: l.premium, audio_key: l.audioKey })),
    lessons: pack.lessons.map((l) => ({ id: l.id, unit_id: l.unitId, position: l.position, title: l.title, summary: l.summary, topic_id: l.topic, is_premium: l.premium, passing_score: l.passScore, status: 'published', intro: l.intro, teaching: l.teaching, demo: l.demo, vocab: l.vocab ?? [], objectives: l.objectives })),
    questions: pack.exercises.map((e) => {
      const payload: Record<string, unknown> = {};
      for (const k of PAYLOAD_KEYS) if (e[k] !== undefined) payload[k] = e[k];
      return clean({ id: e.id, lesson_id: e.lessonId ?? null, listening_item_id: listeningOf.get(e.id), stage: e.stage, position: e.position, type: e.type, topic_id: e.topic, focus_tag: e.focus, difficulty: e.difficulty, prompt: e.prompt, explanation: e.explanation, hint: e.hint, time_limit_sec: e.timeLimitSec, audio_key: e.audioKey, cefr_level: e.level, payload, status: 'published', options: e.options ?? [] });
    }),
    vocabulary: pack.vocabulary.map((v) => clean({ id: v.id, word: v.word, ipa: v.ipa, part_of_speech: v.pos, meaning: v.meaning, example: v.example, example_translation: v.exampleId, level_code: v.level, set_name: v.set, is_premium: v.premium, audio_key: v.audioKey })),
    conversation_scenarios: pack.scenarios.map((s) => ({ id: s.id, title: s.title, level_code: s.level, setting: s.setting, goal: s.goal, closing: s.closing, is_premium: s.premium, start_node: s.start, nodes: s.nodes })),
    pronunciation_guides: pack.phonemes.map((p) => ({ id: p.id, ipa: p.ipa, label: p.label, examples: p.examples, how_to: p.howTo, common_error: p.commonError, mouth: p.mouth })),
    homework: pack.homework.map((h) => clean({ id: h.id, chapter_id: h.chapterId, lesson_id: h.lessonId, title: h.title, kind: h.kind, due_days: h.dueDays, writing: h.writing, question_ids: h.exerciseIds })),
    exams: pack.exams.map((x) => ({ id: x.id, scope: x.scope, ref: x.ref, title: x.title, passing_score: x.passScore, time_limit_sec: x.timeLimitSec, is_premium: x.premium, sample_size: x.sampleSize, question_ids: x.exerciseIds })),
    achievements: ACHIEVEMENTS.map((a) => ({ id: a.id, title: a.title, description: a.desc, icon: a.icon })),
  };
}

const opt = <T>(v: T | null | undefined): T | undefined => (v === null || v === undefined ? undefined : v);

export function rowsToPack(rows: Rows, version: string): ContentPack {
  const courseLevel = new Map<string, string>((rows.courses ?? []).map((c) => [c.id, c.level_code]));
  const exercises: Exercise[] = (rows.questions ?? []).map((q) =>
    clean({
      id: q.id,
      lessonId: q.lesson_id ?? null,
      stage: q.stage,
      position: q.position,
      type: q.type,
      topic: q.topic_id,
      focus: opt(q.focus_tag),
      difficulty: q.difficulty,
      prompt: q.prompt,
      ...(q.payload ?? {}),
      options: q.options?.length ? q.options.map((o: any) => clean({ text: o.text, correct: o.correct ? true : undefined, why: opt(o.why), tag: opt(o.tag) })) : undefined,
      explanation: q.explanation,
      hint: opt(q.hint),
      timeLimitSec: opt(q.time_limit_sec),
      audioKey: opt(q.audio_key),
      level: opt(q.cefr_level),
    } as Exercise),
  );
  const listeningQuestions = new Map<string, { id: string; position: number }[]>();
  for (const q of rows.questions ?? []) {
    if (!q.listening_item_id) continue;
    const list = listeningQuestions.get(q.listening_item_id) ?? [];
    list.push({ id: q.id, position: q.position });
    listeningQuestions.set(q.listening_item_id, list);
  }
  return {
    version,
    levels: (rows.cefr_levels ?? []).map((l) => ({ code: l.code, title: l.title, description: l.description, position: l.position, examPassScore: l.exam_pass_score })),
    chapters: (rows.chapters ?? []).map((c) => clean({ id: c.id, level: courseLevel.get(c.course_id) as any, position: c.position, title: c.title, description: c.description, premium: c.is_premium, planned: c.is_planned ? true : undefined })),
    units: (rows.units ?? []).map((u) => clean({ id: u.id, chapterId: u.chapter_id, position: u.position, title: u.title, description: opt(u.description), examPassScore: u.exam_pass_score, plannedLessons: u.planned_lessons?.length ? u.planned_lessons : undefined })),
    lessons: (rows.lessons ?? []).map((l): Lesson => clean({ id: l.id, unitId: l.unit_id, position: l.position, title: l.title, summary: l.summary, topic: l.topic_id, premium: l.is_premium, passScore: l.passing_score, objectives: l.objectives ?? [], intro: l.intro, teaching: l.teaching ?? [], demo: l.demo ?? [], vocab: l.vocab?.length ? l.vocab : undefined })),
    exercises,
    topics: (rows.grammar_topics ?? []).map((t) => clean({ id: t.id, kind: t.kind, level: t.level_code, title: t.title, summary: t.summary, lessonId: opt(t.lesson_id) })),
    tags: (rows.misconception_tags ?? []).map((t) => ({ id: t.id, topic: t.topic_id, title: t.title, tip: t.tip })),
    vocabulary: (rows.vocabulary ?? []).map((v) => clean({ id: v.id, word: v.word, ipa: v.ipa, pos: v.part_of_speech, meaning: v.meaning, example: v.example, exampleId: v.example_translation, level: v.level_code, set: v.set_name, premium: v.is_premium, audioKey: opt(v.audio_key) })),
    scenarios: (rows.conversation_scenarios ?? []).map((s) => ({ id: s.id, title: s.title, level: s.level_code, setting: s.setting, goal: s.goal, premium: s.is_premium, start: s.start_node, nodes: s.nodes, closing: s.closing })),
    listening: (rows.listening_items ?? []).map((l): ListeningItem => clean({ id: l.id, level: l.level_code, title: l.title, kind: l.kind, transcript: l.transcript, translation: l.translation, premium: l.is_premium, audioKey: opt(l.audio_key), questionIds: (listeningQuestions.get(l.id) ?? []).sort((a, b) => a.position - b.position).map((q) => q.id) })),
    phonemes: (rows.pronunciation_guides ?? []).map((p) => ({ id: p.id, ipa: p.ipa, label: p.label, examples: p.examples, howTo: p.how_to, commonError: p.common_error, mouth: p.mouth })),
    homework: (rows.homework ?? []).map((h) => clean({ id: h.id, chapterId: h.chapter_id, lessonId: opt(h.lesson_id), title: h.title, kind: h.kind, dueDays: h.due_days, exerciseIds: h.question_ids ?? [], writing: opt(h.writing) })),
    exams: (rows.exams ?? []).map((x) => ({ id: x.id, scope: x.scope, ref: x.ref, title: x.title, passScore: x.passing_score, timeLimitSec: x.time_limit_sec, premium: x.is_premium, exerciseIds: x.question_ids ?? [], sampleSize: x.sample_size })),
    audio: (rows.audio_resources ?? []).map((a) => clean({ key: a.key, accent: a.accent, url: a.url, speaker: opt(a.speaker), transcript: opt(a.transcript) })),
  };
}

/**
 * What a learner without Premium receives: premium lessons keep their title
 * and objectives (so the path can show them) but lose their body and all of
 * their exercises. This runs on the server; locked content never leaves it.
 */
export function packForFree(pack: ContentPack): ContentPack {
  const lockedLessons = new Set(pack.lessons.filter((l) => l.premium).map((l) => l.id));
  const lockedListening = new Set(pack.listening.filter((l) => l.premium).map((l) => l.id));
  const lockedQuestions = new Set(pack.listening.filter((l) => l.premium).flatMap((l) => l.questionIds));
  const freeTopics = new Set(pack.lessons.filter((l) => !l.premium).map((l) => l.topic));
  freeTopics.add('skill.listening');
  return {
    ...pack,
    lessons: pack.lessons.map((l) => (l.premium ? { ...l, locked: true, intro: '', teaching: [], demo: [], vocab: undefined } : l)),
    exercises: pack.exercises.filter((e) => {
      if (e.lessonId && lockedLessons.has(e.lessonId)) return false;
      if (lockedQuestions.has(e.id)) return false;
      if (e.stage === 'placement') return true;
      // Drill banks and exam extras follow their topic.
      return e.lessonId ? true : freeTopics.has(e.topic);
    }),
    vocabulary: pack.vocabulary.filter((v) => !v.premium),
    scenarios: pack.scenarios.map((s) => (s.premium ? { ...s, locked: true, nodes: [], closing: '' } : s)),
    listening: pack.listening.map((l) => (lockedListening.has(l.id) ? { ...l, locked: true, transcript: '', translation: '', questionIds: [] } : l)),
    homework: pack.homework.filter((h) => !h.lessonId || !lockedLessons.has(h.lessonId)),
  };
}
