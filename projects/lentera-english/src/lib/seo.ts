// Public, indexable pages (Rilis 11): the site's address and the lesson data
// the /materi pages are built from. Built at deploy time from the bundled
// curriculum, so the pages are static files that cost nothing per visit.
// Exercises are never published; Premium lessons show their introduction only.
import { buildPack } from '@content/index';
import { CEFR_ORDER, indexContent, type Cefr, type Chapter, type Lesson } from '@/lib/content/types';

export const SITE = 'https://lentera-english-app.netlify.app';

export interface PublicLesson { lesson: Lesson; chapter: Chapter; level: Cefr }

let cache: { all: PublicLesson[]; byId: Map<string, PublicLesson> } | null = null;
function load() {
  if (cache) return cache;
  const ix = indexContent(buildPack());
  const all = [...ix.orderedLessons, ...ix.trackLessons].map((lesson) => {
    const chapter = ix.chapterById.get(ix.unitById.get(lesson.unitId)!.chapterId)!;
    return { lesson, chapter, level: chapter.level };
  });
  cache = { all, byId: new Map(all.map((p) => [p.lesson.id, p])) };
  return cache;
}

export const publicLessons = () => load().all;
export const publicLesson = (id: string) => load().byId.get(id);
export const mainLessonsByLevel = () => CEFR_ORDER.map((level) => ({ level, lessons: load().all.filter((p) => p.level === level && !p.chapter.track) }));
export const trackLessonsOf = (track: string) => load().all.filter((p) => p.chapter.track === track);
