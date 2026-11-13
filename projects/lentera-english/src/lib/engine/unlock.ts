// Unlocking rules: learners must demonstrate competency before advancing.
import { CEFR_ORDER, type Cefr, type Chapter, type ContentIndex, type ExamDef, type Lesson, type Unit } from '@/lib/content/types';
import { isPremium, type Entitlement, type LearnerState } from './types';

export type LessonStatus = 'premium' | 'locked' | 'available' | 'in-progress' | 'completed';

export interface LockInfo {
  status: LessonStatus;
  /** Why it is locked, in Indonesian. */
  reason?: string;
}

const passedExam = (s: LearnerState, examId: string) => !!s.exams[examId]?.attempts.some((a) => a.passed);
export const unitExam = (ix: ContentIndex, unitId: string): ExamDef | undefined => ix.pack.exams.find((e) => e.scope === 'unit' && e.ref === unitId);
export const levelExam = (ix: ContentIndex, level: Cefr): ExamDef | undefined => ix.pack.exams.find((e) => e.scope === 'level' && e.ref === level);

export function unitsOfLevel(ix: ContentIndex, level: Cefr): Unit[] {
  const chapters = ix.pack.chapters.filter((c) => c.level === level).sort((a, b) => a.position - b.position);
  return chapters.flatMap((c) => ix.pack.units.filter((u) => u.chapterId === c.id).sort((a, b) => a.position - b.position));
}
export const lessonsOfUnit = (ix: ContentIndex, unitId: string): Lesson[] => ix.orderedLessons.filter((l) => l.unitId === unitId);

/** A level is done when its exam is passed, or (no exam) all its lessons are. */
export function levelCompleted(s: LearnerState, ix: ContentIndex, level: Cefr): boolean {
  const exam = levelExam(ix, level);
  if (exam) return passedExam(s, exam.id);
  const lessons = unitsOfLevel(ix, level).flatMap((u) => lessonsOfUnit(ix, u.id));
  return lessons.length > 0 && lessons.every((l) => s.lessons[l.id]?.completedAt);
}

export function levelOpen(s: LearnerState, ix: ContentIndex, level: Cefr): boolean {
  const i = CEFR_ORDER.indexOf(level);
  if (i === 0) return true;
  const placed = s.profile.placementLevel ? CEFR_ORDER.indexOf(s.profile.placementLevel) : 0;
  if (placed >= i) return true;
  return levelCompleted(s, ix, CEFR_ORDER[i - 1]);
}

export function unitExamStatus(s: LearnerState, ix: ContentIndex, unitId: string): 'none' | 'locked' | 'available' | 'passed' {
  const exam = unitExam(ix, unitId);
  if (!exam) return 'none';
  if (passedExam(s, exam.id)) return 'passed';
  const lessons = lessonsOfUnit(ix, unitId);
  return lessons.length > 0 && lessons.every((l) => s.lessons[l.id]?.completedAt) ? 'available' : 'locked';
}

export function lessonLock(s: LearnerState, ix: ContentIndex, lesson: Lesson, ent: Entitlement, now: number): LockInfo {
  const unit = ix.unitById.get(lesson.unitId);
  const chapter: Chapter | undefined = unit ? ix.chapterById.get(unit.chapterId) : undefined;
  if (!unit || !chapter) return { status: 'locked', reason: 'Pelajaran tidak ditemukan dalam kurikulum.' };
  const progress = s.lessons[lesson.id];
  if ((lesson.premium || lesson.locked) && !isPremium(ent, now)) return { status: 'premium', reason: 'Pelajaran ini bagian dari Premium.' };
  if (progress?.completedAt) return { status: 'completed' };
  if (!levelOpen(s, ix, chapter.level)) {
    const prev = CEFR_ORDER[CEFR_ORDER.indexOf(chapter.level) - 1];
    return { status: 'locked', reason: `Selesaikan level ${prev} atau ikuti tes penempatan untuk membuka level ${chapter.level}.` };
  }
  // Learners placed above this level may enter any lesson below their level.
  const placed = s.profile.placementLevel ? CEFR_ORDER.indexOf(s.profile.placementLevel) : 0;
  const open = (): LockInfo => ({ status: progress ? 'in-progress' : 'available' });
  if (placed > CEFR_ORDER.indexOf(chapter.level)) return open();

  const siblings = lessonsOfUnit(ix, unit.id);
  const idx = siblings.findIndex((l) => l.id === lesson.id);
  if (idx > 0) {
    const prev = siblings[idx - 1];
    if (!s.lessons[prev.id]?.completedAt) return { status: 'locked', reason: `Lulus tes penguasaan "${prev.title}" (min. ${prev.passScore}%) terlebih dahulu.` };
    return open();
  }
  const units = unitsOfLevel(ix, chapter.level);
  const uIdx = units.findIndex((u) => u.id === unit.id);
  if (uIdx > 0) {
    const prevUnit = units[uIdx - 1];
    const status = unitExamStatus(s, ix, prevUnit.id);
    if (status === 'none') {
      const prevLessons = lessonsOfUnit(ix, prevUnit.id);
      if (!prevLessons.every((l) => s.lessons[l.id]?.completedAt)) return { status: 'locked', reason: `Tuntaskan unit "${prevUnit.title}" terlebih dahulu.` };
    } else if (status !== 'passed') {
      return { status: 'locked', reason: `Lulus ujian unit "${prevUnit.title}" terlebih dahulu.` };
    }
  }
  return open();
}

export function levelExamStatus(s: LearnerState, ix: ContentIndex, level: Cefr, ent: Entitlement, now: number): 'none' | 'premium' | 'locked' | 'available' | 'passed' {
  const exam = levelExam(ix, level);
  if (!exam) return 'none';
  if (passedExam(s, exam.id)) return 'passed';
  if (exam.premium && !isPremium(ent, now)) return 'premium';
  const units = unitsOfLevel(ix, level).filter((u) => lessonsOfUnit(ix, u.id).length > 0);
  const ready = units.length > 0 && units.every((u) => ['passed', 'none'].includes(unitExamStatus(s, ix, u.id)) && lessonsOfUnit(ix, u.id).every((l) => s.lessons[l.id]?.completedAt));
  return ready ? 'available' : 'locked';
}

/** The next lesson the learner should take, in curriculum order. */
export function nextLesson(s: LearnerState, ix: ContentIndex, ent: Entitlement, now: number): Lesson | undefined {
  const start = s.profile.placementLevel ? CEFR_ORDER.indexOf(s.profile.placementLevel) : 0;
  const candidates = ix.orderedLessons.filter((l) => {
    const st = lessonLock(s, ix, l, ent, now).status;
    return st === 'available' || st === 'in-progress';
  });
  const levelOf = (l: Lesson) => CEFR_ORDER.indexOf(ix.chapterById.get(ix.unitById.get(l.unitId)!.chapterId)!.level);
  return candidates.find((l) => s.lessons[l.id] && !s.lessons[l.id].completedAt) ?? candidates.find((l) => levelOf(l) >= start) ?? candidates[0];
}
