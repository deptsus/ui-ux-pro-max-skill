// Runtime content model. Everything a learner sees comes from a ContentPack:
// structured, human-authored data. Nothing is generated at runtime.

export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export const CEFR_ORDER: Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export type Stage =
  | 'guided'
  | 'independent'
  | 'homework'
  | 'mastery'
  | 'drill'
  | 'exam'
  | 'placement'
  | 'listening';

export type ExerciseType =
  | 'mc' // multiple choice
  | 'fill' // fill in the blank (typed)
  | 'arrange' // word arrangement (tiles)
  | 'construct' // sentence construction from cues (typed)
  | 'match' // word matching (pairs)
  | 'translate' // translation (typed)
  | 'fix' // correct the mistake (typed)
  | 'listen' // listening comprehension
  | 'read' // reading comprehension
  | 'dialogue' // dialogue completion
  | 'tf' // true or false
  | 'spot' // identify the grammatical error (tap the word)
  | 'vocab' // context-based vocabulary
  | 'para'; // paragraph arrangement
// "Timed challenge" is a delivery mode: any exercise may carry timeLimitSec,
// and the Review Center runs timed rounds over quick exercise types.

export interface Option {
  text: string;
  correct?: boolean;
  /** Why this option is wrong (shown when chosen). */
  why?: string;
  /** Misconception this wrong choice reveals, e.g. "was-were". */
  tag?: string;
}

export interface TypedError {
  why: string;
  tag?: string;
}

export interface Exercise {
  id: string;
  lessonId?: string | null;
  stage: Stage;
  position: number;
  type: ExerciseType;
  topic: string;
  /** Sub-skill this item tests; used to build targeted drills. */
  focus?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prompt: string;
  text?: string;
  context?: string;
  options?: Option[];
  /** Accepted answers for typed/tile types. First one is the model answer. */
  answers?: string[];
  /** Known wrong answers -> targeted explanation. */
  errors?: Record<string, TypedError>;
  tiles?: string[];
  pairs?: [string, string][];
  sentences?: string[];
  wrongWord?: string;
  correction?: string;
  audioText?: string;
  audioKey?: string;
  explanation: string;
  hint?: string;
  timeLimitSec?: number;
  level?: Cefr;
}

export interface Level {
  code: Cefr;
  title: string;
  description: string;
  position: number;
  examPassScore: number;
}

export interface Chapter {
  id: string;
  level: Cefr;
  position: number;
  title: string;
  description: string;
  premium: boolean;
  /** True when the chapter is on the syllabus but lessons are not authored yet. */
  planned?: boolean;
}

export interface Unit {
  id: string;
  chapterId: string;
  position: number;
  title: string;
  description?: string;
  examPassScore: number;
  /** Lesson titles on the syllabus that are not authored yet. */
  plannedLessons?: string[];
}

export interface TeachingSection {
  heading: string;
  body: string;
  examples?: { en: string; id: string; note?: string }[];
  table?: string[][];
}

export interface Lesson {
  id: string;
  unitId: string;
  position: number;
  title: string;
  summary: string;
  topic: string;
  premium: boolean;
  passScore: number;
  objectives: string[];
  /** Body is stripped (locked=true) when the learner has no entitlement. */
  locked?: boolean;
  intro: string;
  teaching: TeachingSection[];
  demo: { good: string; bad: string; why: string }[];
  /** Vocabulary ids introduced by this lesson (enter spaced repetition). */
  vocab?: string[];
}

export interface Topic {
  id: string;
  kind: 'grammar' | 'vocabulary' | 'skill';
  level: Cefr;
  title: string;
  summary: string;
  lessonId?: string;
}

export interface MisconceptionTag {
  id: string;
  topic: string;
  title: string;
  /** Short remediation note shown with recommendations and drills. */
  tip: string;
}

export interface VocabItem {
  id: string;
  word: string;
  ipa: string;
  pos: string;
  meaning: string;
  example: string;
  exampleId: string;
  level: Cefr;
  set: string;
  premium: boolean;
  audioKey?: string;
}

export interface ScenarioOption {
  text: string;
  /** Is the response grammatically correct and appropriate? */
  correct: boolean;
  /** 1 = unnatural, 2 = acceptable, 3 = natural. */
  natural: 1 | 2 | 3;
  grammar: string;
  alternatives: string[];
  next: string; // node id or "end"
}

export interface ScenarioNode {
  id: string;
  speaker: string;
  line: string;
  lineId: string;
  options: ScenarioOption[];
}

export interface Scenario {
  id: string;
  title: string;
  level: Cefr;
  setting: string;
  goal: string;
  premium: boolean;
  locked?: boolean;
  start: string;
  nodes: ScenarioNode[];
  closing: string;
}

export interface ListeningItem {
  id: string;
  level: Cefr;
  title: string;
  kind: 'sentence' | 'word' | 'passage';
  transcript: string;
  translation: string;
  premium: boolean;
  locked?: boolean;
  audioKey?: string;
  /** Exercise ids (stage "listening") attached to this item. */
  questionIds: string[];
}

export interface Phoneme {
  id: string;
  ipa: string;
  label: string;
  examples: { word: string; ipa: string }[];
  howTo: string;
  commonError: string;
  /** Parameters for the schematic mouth illustration. */
  mouth: { lips: 'spread' | 'round' | 'neutral' | 'teeth-lip'; tongue: 'dental' | 'alveolar' | 'post-alveolar' | 'low-front' | 'high-front' | 'back' | 'retroflex'; voiced: boolean };
}

export interface HomeworkDef {
  id: string;
  chapterId: string;
  lessonId?: string;
  title: string;
  kind: 'vocabulary' | 'grammar' | 'translation' | 'reading' | 'listening' | 'construction' | 'writing';
  dueDays: number;
  exerciseIds: string[];
  /** Short writing task: checked against a deterministic checklist. */
  writing?: { prompt: string; minWords: number; mustInclude: string[]; model: string };
}

export interface ExamDef {
  id: string;
  scope: 'unit' | 'level' | 'placement';
  ref: string; // unit id or level code
  title: string;
  passScore: number;
  timeLimitSec: number;
  premium: boolean;
  /** Fixed questions. Unit and level exams also sample lesson pools. */
  exerciseIds: string[];
  sampleSize: number;
}

export interface AudioResource {
  key: string;
  accent: 'us' | 'uk';
  url: string;
  speaker?: string;
  transcript?: string;
}

export interface ContentPack {
  version: string;
  levels: Level[];
  chapters: Chapter[];
  units: Unit[];
  lessons: Lesson[];
  exercises: Exercise[];
  topics: Topic[];
  tags: MisconceptionTag[];
  vocabulary: VocabItem[];
  scenarios: Scenario[];
  listening: ListeningItem[];
  phonemes: Phoneme[];
  homework: HomeworkDef[];
  exams: ExamDef[];
  audio: AudioResource[];
}

/** Indexed view over a pack, built once on the client. */
export interface ContentIndex {
  pack: ContentPack;
  lessonById: Map<string, Lesson>;
  unitById: Map<string, Unit>;
  chapterById: Map<string, Chapter>;
  exerciseById: Map<string, Exercise>;
  topicById: Map<string, Topic>;
  tagById: Map<string, MisconceptionTag>;
  vocabById: Map<string, VocabItem>;
  /** Lessons in curriculum order. */
  orderedLessons: Lesson[];
  exercisesByLesson: Map<string, Exercise[]>;
}

export function indexContent(pack: ContentPack): ContentIndex {
  const byId = <T extends { id: string }>(rows: T[]) => new Map(rows.map((r) => [r.id, r]));
  const chapterById = byId(pack.chapters);
  const unitById = byId(pack.units);
  const levelPos = new Map(pack.levels.map((l) => [l.code, l.position]));
  const lessonKey = (l: Lesson): number[] => {
    const u = unitById.get(l.unitId);
    const c = u ? chapterById.get(u.chapterId) : undefined;
    return [c ? levelPos.get(c.level) ?? 99 : 99, c?.position ?? 99, u?.position ?? 99, l.position];
  };
  const orderedLessons = [...pack.lessons].sort((a, b) => {
    const ka = lessonKey(a);
    const kb = lessonKey(b);
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];
    return a.id.localeCompare(b.id);
  });
  const exercisesByLesson = new Map<string, Exercise[]>();
  for (const e of pack.exercises) {
    if (!e.lessonId) continue;
    const list = exercisesByLesson.get(e.lessonId) ?? [];
    list.push(e);
    exercisesByLesson.set(e.lessonId, list);
  }
  for (const list of exercisesByLesson.values()) list.sort((a, b) => a.position - b.position);
  return {
    pack,
    lessonById: byId(pack.lessons),
    unitById,
    chapterById,
    exerciseById: byId(pack.exercises),
    topicById: byId(pack.topics),
    tagById: byId(pack.tags),
    vocabById: byId(pack.vocabulary),
    orderedLessons,
    exercisesByLesson,
  };
}

export function lessonExercises(ix: ContentIndex, lessonId: string, stage: Stage): Exercise[] {
  return (ix.exercisesByLesson.get(lessonId) ?? []).filter((e) => e.stage === stage);
}
