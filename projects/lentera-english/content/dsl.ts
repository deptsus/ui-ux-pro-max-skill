// Compact authoring helpers. Authors write nested lessons; build() flattens
// them into the ContentPack rows that the app and the database both use.
import type { Exercise, ExerciseType, Lesson, Option, Stage, TeachingSection, TypedError } from '@/lib/content/types';

export type Opt = [text: string, verdict: true | string, tag?: string];
export type Errs = Record<string, [why: string, tag?: string]>;
export interface Extra {
  hint?: string;
  focus?: string;
  topic?: string;
  timeLimitSec?: number;
  level?: Exercise['level'];
}
/** An exercise before it gets its id, lesson, stage and position. */
export type Draft = Omit<Exercise, 'id' | 'stage' | 'position' | 'topic' | 'lessonId'> & { topic?: string };
type D = Exercise['difficulty'];

const opts = (list: Opt[]): Option[] =>
  list.map(([text, verdict, tag]) =>
    verdict === true ? { text, correct: true } : { text, why: verdict, ...(tag ? { tag } : {}) },
  );
const errs = (e?: Errs): Record<string, TypedError> | undefined =>
  e ? Object.fromEntries(Object.entries(e).map(([k, [why, tag]]) => [k, tag ? { why, tag } : { why }])) : undefined;
const base = (type: ExerciseType, difficulty: D, prompt: string, explanation: string, x?: Extra): Draft => ({
  type,
  difficulty,
  prompt,
  explanation,
  ...(x ?? {}),
});
const choice = (type: ExerciseType) =>
  (d: D, prompt: string, text: string | null, o: Opt[], exp: string, x?: Extra): Draft => ({
    ...base(type, d, prompt, exp, x),
    ...(text ? { text } : {}),
    options: opts(o),
  });

export const mc = choice('mc');
export const vocab = choice('vocab');
export const dlg = (d: D, prompt: string, context: string, o: Opt[], exp: string, x?: Extra): Draft => ({
  ...base('dialogue', d, prompt, exp, x),
  context,
  options: opts(o),
});
export const read = (d: D, passage: string, question: string, o: Opt[], exp: string, x?: Extra): Draft => ({
  ...base('read', d, 'Baca teks berikut, lalu jawab pertanyaannya.', exp, x),
  context: passage,
  text: question,
  options: opts(o),
});
export const listen = (d: D, audioText: string, question: string, o: Opt[], exp: string, x?: Extra): Draft => ({
  ...base('listen', d, 'Dengarkan audionya, lalu jawab pertanyaannya.', exp, x),
  audioText,
  text: question,
  options: opts(o),
});
export const tf = (d: D, statement: string, isTrue: boolean, exp: string, whyWrong: string, x?: Extra & { tag?: string }): Draft => {
  const { tag, ...rest } = x ?? {};
  const wrong = (text: string): Option => ({ text, why: whyWrong, ...(tag ? { tag } : {}) });
  return {
    ...base('tf', d, 'Benar atau salah? Nilai kalimat berikut.', exp, rest),
    text: statement,
    options: isTrue ? [{ text: 'Benar', correct: true }, wrong('Salah')] : [wrong('Benar'), { text: 'Salah', correct: true }],
  };
};
const typed = (type: ExerciseType, defaultPrompt: string) =>
  (d: D, text: string, answers: string[], exp: string, e?: Errs, x?: Extra & { prompt?: string }): Draft => {
    const { prompt, ...rest } = x ?? {};
    return { ...base(type, d, prompt ?? defaultPrompt, exp, rest), text, answers, ...(e ? { errors: errs(e) } : {}) };
  };
export const fill = typed('fill', 'Lengkapi kalimat dengan kata yang tepat.');
export const construct = typed('construct', 'Susun kalimat bahasa Inggris yang benar dari kata kunci berikut.');
export const tr = typed('translate', 'Terjemahkan ke dalam bahasa Inggris.');
export const fix = typed('fix', 'Kalimat ini mengandung kesalahan. Tulis ulang dengan benar.');
export const arrange = (d: D, meaning: string, answer: string, distractors: string[], exp: string, x?: Extra & { alt?: string[] }): Draft => {
  const { alt, ...rest } = x ?? {};
  return {
    ...base('arrange', d, 'Susun kata-kata menjadi kalimat yang benar.', exp, rest),
    text: meaning,
    answers: [answer, ...(alt ?? [])],
    tiles: distractors,
  };
};
export const spot = (d: D, sentence: string, wrongWord: string, correction: string, exp: string, x?: Extra): Draft => ({
  ...base('spot', d, 'Ketuk kata yang salah secara tata bahasa.', exp, x),
  text: sentence,
  wrongWord,
  correction,
});
export const match = (d: D, prompt: string, pairs: [string, string][], exp: string, x?: Extra): Draft => ({
  ...base('match', d, prompt, exp, x),
  pairs,
});
export const para = (d: D, prompt: string, sentences: string[], exp: string, x?: Extra): Draft => ({
  ...base('para', d, prompt, exp, x),
  sentences,
});

export interface LessonDraft {
  id: string;
  title: string;
  summary: string;
  topic: string;
  objectives: string[];
  intro: string;
  teaching: TeachingSection[];
  demo: [good: string, bad: string, why: string][];
  vocab?: string[];
  passScore?: number;
  guided: Draft[];
  independent: Draft[];
  homework: Draft[];
  mastery: Draft[];
}

export interface Built {
  lesson: Omit<Lesson, 'unitId' | 'position' | 'premium'>;
  exercises: Exercise[];
}

/** Assigns stable ids (lesson.stage+index) and positions. */
export function stamp(drafts: Draft[], prefix: string, stage: Stage, topic: string, lessonId: string | null, offset = 0): Exercise[] {
  return drafts.map((d, i) => ({
    ...d,
    id: `${prefix}.${stage[0]}${i + 1}`,
    lessonId,
    stage,
    position: offset + i,
    topic: d.topic ?? topic,
  }));
}

export function lesson(l: LessonDraft): Built {
  const stages: [Stage, Draft[]][] = [
    ['guided', l.guided],
    ['independent', l.independent],
    ['homework', l.homework],
    ['mastery', l.mastery],
  ];
  let offset = 0;
  const exercises: Exercise[] = [];
  for (const [stage, drafts] of stages) {
    exercises.push(...stamp(drafts, l.id, stage, l.topic, l.id, offset));
    offset += 100;
  }
  return {
    lesson: {
      id: l.id,
      title: l.title,
      summary: l.summary,
      topic: l.topic,
      passScore: l.passScore ?? 85,
      objectives: l.objectives,
      intro: l.intro,
      teaching: l.teaching,
      demo: l.demo.map(([good, bad, why]) => ({ good, bad, why })),
      ...(l.vocab ? { vocab: l.vocab } : {}),
    },
    exercises,
  };
}
