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
  | 'listening'
  | 'story';

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
  /** Special track (Rilis 11) instead of the main CEFR path; see src/lib/content/tracks.ts. */
  track?: TrackId;
}

export type TrackId = 'exam' | 'work' | 'kids';

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

/** Illustrated story exercises (Rilis 1). The app draws every scene; content only says who stands where and what they say. */
export const STORY_BACKDROPS = ['home', 'bedroom', 'school', 'street', 'market', 'station', 'cafe', 'park', 'shop', 'temple'] as const;
export type StoryBackdrop = (typeof STORY_BACKDROPS)[number];
export const STORY_POSES = ['stand', 'wave', 'happy', 'sad', 'surprised', 'think', 'point'] as const;
export type StoryPose = (typeof STORY_POSES)[number];
export const STORY_LOOKS = ['pijar', 'girl', 'boy', 'woman', 'man', 'grandma', 'grandpa'] as const;
export type StoryLook = (typeof STORY_LOOKS)[number];

export interface StoryCharacter {
  id: string;
  name: string;
  look: StoryLook;
  /** Shirt colour (hex). */
  shirt: string;
  /** Hair colour (hex); ignored for Pijar. */
  hair?: string;
  /** Skin tone (hex); ignored for Pijar. */
  skin?: string;
  /** Hijab colour (hex); drawn instead of hair when set. */
  hijab?: string;
}
export interface StoryActor {
  who: string;
  at: 'left' | 'center' | 'right';
  pose?: StoryPose;
  /** How the actor arrives when the scene opens. */
  enter?: 'left' | 'right' | 'fade';
}
export interface StoryLine {
  /** A character id, or "narrator" for a caption. */
  who: string;
  en: string;
  /** Indonesian translation. */
  tr: string;
  /** Pose of the speaker while saying this line. */
  pose?: StoryPose;
}
export interface StoryScene {
  backdrop: StoryBackdrop;
  time?: 'day' | 'evening' | 'night';
  actors: StoryActor[];
  lines: StoryLine[];
}
/** A reply the learner can choose in a branching story (Rilis 5). Graded like a conversation option. */
export interface StoryChoice {
  text: string;
  /** false = grammar error. A grammatical but tactless reply is true with low naturalness. */
  correct: boolean;
  natural: 1 | 2 | 3;
  /** Why this reply works or not (Indonesian). */
  note: string;
  /** A better way to say it, shown when the reply is not the best. */
  better?: string;
  /** Node shown next. */
  next: string;
}
export interface StoryNode {
  id: string;
  scene: StoryScene;
  /** What the learner decides here, e.g. "Apa jawaban Sari?". */
  ask?: string;
  choices?: StoryChoice[];
  /** Ending nodes have no choices. */
  ending?: { good: boolean; title: string; text: string };
}
/** Branching part of a story: after the opening scenes, the learner speaks as `as` and the choices decide the path. */
export interface StoryBranch {
  as: string;
  start: string;
  nodes: StoryNode[];
}
export interface Story {
  id: string;
  level: Cefr;
  title: string;
  summary: string;
  premium: boolean;
  locked?: boolean;
  characters: StoryCharacter[];
  /** For a branching story: the opening scenes before the first choice. */
  scenes: StoryScene[];
  /** Exercise ids (stage "story") answered after the story. Branching stories are scored by their choices instead. */
  questionIds: string[];
  branch?: StoryBranch;
  /** Guest packs only (Rilis 6): a locked branching story keeps its number of decisions, never the branch itself. */
  decisions?: number;
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
  writing?: WritingTask;
}

/** A writing task. `model` is the best example; `levels` (Rilis 4) shows the same task answered at rising quality. */
export interface WritingTask {
  prompt: string;
  minWords: number;
  /** Upper limit, for summaries (Rilis 4). */
  maxWords?: number;
  mustInclude: string[];
  model: string;
  /** Text to summarise or reply to, shown above the writing box (Rilis 4). */
  source?: string;
  /** Example answers from "meets the checklist" to "excellent", each with a note on what makes it better. The last one is `model`. */
  levels?: { label: string; text: string; note: string }[];
}

export type ExamSectionKind = 'grammar' | 'reading' | 'listening' | 'writing';
/** Question types allowed in the server-graded exam bank: none of them gives its answer away in the question itself. */
export const EXAM_BANK_TYPES = ['mc', 'tf', 'fill', 'read', 'listen', 'dialogue', 'translate', 'fix', 'construct'] as const;

/**
 * One part of a CEFR-style level exam (Rilis 3). Questions come from an
 * exam-only bank that never reaches the learner's device with its keys: the
 * server draws them, sends them without answers, and grades the submission.
 */
export interface ExamSection {
  id: string;
  kind: ExamSectionKind;
  title: string;
  /** Groups of question ids shown together (a passage and its questions); grammar groups hold one question. */
  pool: string[][];
  /** Groups drawn per attempt. */
  take: number;
  /** Writing prompts; one is drawn per attempt. */
  writing?: WritingTask[];
  /** Minimum score for this part. */
  passScore: number;
  /** Set in packs sent to devices: pool and prompts were removed, only `count` remains. */
  hidden?: boolean;
  /** Questions (or writing tasks) per attempt, for the exam intro. */
  count?: number;
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
  /** Sectioned, server-graded level exam (Rilis 3). Without it the exam runs the older lesson-pool format. */
  sections?: ExamSection[];
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
  stories: Story[];
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
  /** Lessons of the main CEFR path, in curriculum order (special tracks excluded). */
  orderedLessons: Lesson[];
  /** Lessons of the special tracks (Rilis 11), in track order. */
  trackLessons: Lesson[];
  /** Every lesson of a unit, in order (main path and tracks). */
  lessonsByUnit: Map<string, Lesson[]>;
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
  const sorted = [...pack.lessons].sort((a, b) => {
    const ka = lessonKey(a);
    const kb = lessonKey(b);
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];
    return a.id.localeCompare(b.id);
  });
  const trackOf = (l: Lesson) => chapterById.get(unitById.get(l.unitId)?.chapterId ?? '')?.track;
  const orderedLessons = sorted.filter((l) => !trackOf(l));
  const trackLessons = sorted.filter((l) => !!trackOf(l));
  const lessonsByUnit = new Map<string, Lesson[]>();
  for (const l of sorted) {
    const list = lessonsByUnit.get(l.unitId) ?? [];
    list.push(l);
    lessonsByUnit.set(l.unitId, list);
  }
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
    trackLessons,
    lessonsByUnit,
    exercisesByLesson,
  };
}

export function lessonExercises(ix: ContentIndex, lessonId: string, stage: Stage): Exercise[] {
  return (ix.exercisesByLesson.get(lessonId) ?? []).filter((e) => e.stage === stage);
}
