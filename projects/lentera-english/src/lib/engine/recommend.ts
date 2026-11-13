// Deterministic recommendation engine: rules + weighted priorities.
// Every recommendation carries the evidence that triggered it, so the learner
// (and a teacher reading the code) can see exactly why it was suggested.
import type { ContentIndex } from '@/lib/content/types';
import { RECOMMEND } from './config';
import { evidenceScore, retestReady } from './mastery';
import { dueItems } from './srs';
import { lessonLock, nextLesson, unitExamStatus, unitExam } from './unlock';
import type { Entitlement, LearnerState } from './types';

export interface Recommendation {
  id: string;
  kind: 'placement' | 'remediate' | 'revise' | 'practice' | 'retest' | 'review' | 'homework' | 'exam' | 'lesson';
  priority: number;
  title: string;
  reason: string;
  cta: string;
  href: string;
}

const DAY = 86_400_000;

/** Errors on a misconception inside the window, since it was last cleared. */
export function activeTagErrors(s: LearnerState, tag: string, now: number): number {
  const t = s.tags[tag];
  if (!t) return 0;
  const since = Math.max(now - RECOMMEND.tagWindowDays * DAY, t.clearedAt ?? 0);
  return t.recent.filter((at) => at > since).length;
}

export function recommend(s: LearnerState, ix: ContentIndex, ent: Entitlement, now: number): Recommendation[] {
  const W = RECOMMEND.weights;
  const out: Recommendation[] = [];
  const started = Object.keys(s.lessons).length > 0;

  if (!s.profile.placementDone && !started) {
    out.push({ id: 'placement', kind: 'placement', priority: W.placement, title: 'Ikuti tes penempatan', reason: 'Kami belum tahu levelmu. Tes singkat ini menentukan titik mulai yang pas.', cta: 'Mulai tes', href: '/placement' });
  }

  // 1. Repeated wrong-answer patterns -> targeted drill.
  const remediatedTopics = new Set<string>();
  for (const tag of ix.pack.tags) {
    const n = activeTagErrors(s, tag.id, now);
    if (n < RECOMMEND.tagErrorThreshold) continue;
    remediatedTopics.add(tag.topic);
    out.push({
      id: `tag:${tag.id}`,
      kind: 'remediate',
      priority: W.remediateTag + Math.min(20, n * 4),
      title: `Latihan perbaikan: ${tag.title}`,
      reason: `Kamu ${n}× keliru pada pola ini dalam ${RECOMMEND.tagWindowDays} hari terakhir. ${tag.tip}`,
      cta: 'Latihan bertahap',
      href: `/app/practice?mode=drill&tag=${encodeURIComponent(tag.id)}`,
    });
  }

  // 2. Weak topics -> revise the lesson (<50) or practise more (50-69).
  for (const [topicId, stat] of Object.entries(s.topics)) {
    const topic = ix.topicById.get(topicId);
    if (!topic || stat.attempts < 4) continue;
    if (stat.stage === 'needs-review') {
      out.push({ id: `revise:${topicId}`, kind: 'revise', priority: W.reviseTopic + 2, title: `Ulangi materi: ${topic.title}`, reason: 'Ulangan terjadwal terakhirmu pada topik ini gagal, jadi status "dikuasai" dicabut sampai kamu membuktikannya lagi.', cta: 'Buka materi', href: topic.lessonId ? `/app/lesson?id=${topic.lessonId}&revise=1` : `/app/grammar?topic=${topicId}` });
      continue;
    }
    if (stat.stage === 'mastered' || stat.stage === 'provisional') continue;
    // Weakness is judged on the evidence itself: a few all-correct answers
    // mean "not enough evidence yet", which is not the same as "weak".
    const accuracy = Math.round(evidenceScore(stat.history));
    const href = topic.lessonId ? `/app/lesson?id=${topic.lessonId}&revise=1` : `/app/grammar?topic=${topicId}`;
    if (accuracy < 50) {
      out.push({ id: `revise:${topicId}`, kind: 'revise', priority: W.reviseTopic + (remediatedTopics.has(topicId) ? -15 : 0), title: `Ulangi materi: ${topic.title}`, reason: `Ketepatanmu baru ${accuracy}% dari ${stat.attempts} percobaan. Baca ulang penjelasannya sebelum berlatih lagi.`, cta: 'Buka materi', href });
    } else if (accuracy < 70) {
      out.push({ id: `practice:${topicId}`, kind: 'practice', priority: W.practiceTopic + (remediatedTopics.has(topicId) ? -15 : 0), title: `Latihan tambahan: ${topic.title}`, reason: `Ketepatanmu ${accuracy}%. Butuh minimal 85% yang konsisten untuk naik tingkat.`, cta: 'Latihan', href: `/app/practice?mode=topic&topic=${encodeURIComponent(topicId)}` });
    }
  }

  // 3. Delayed retests that confirm mastery.
  for (const [topicId, stat] of Object.entries(s.topics)) {
    const topic = ix.topicById.get(topicId);
    if (topic && retestReady(stat, now)) {
      out.push({ id: `retest:${topicId}`, kind: 'retest', priority: W.retest, title: `Tes ulang: ${topic.title}`, reason: `Skormu sudah ${stat.score}%. Buktikan sekali lagi setelah jeda agar topik ini resmi dikuasai.`, cta: 'Tes ulang', href: `/app/practice?mode=retest&topic=${encodeURIComponent(topicId)}` });
    }
  }

  // 4. Homework.
  for (const def of ix.pack.homework) {
    const rec = s.homework[def.id];
    if (!rec || rec.submissions.length) continue;
    const overdue = now > rec.dueAt;
    const soon = rec.dueAt - now < 2 * DAY;
    if (!overdue && !soon) continue;
    out.push({ id: `hw:${def.id}`, kind: 'homework', priority: overdue ? W.homeworkOverdue : W.homeworkDue, title: `PR: ${def.title}`, reason: overdue ? 'PR ini sudah melewati tenggat.' : 'Tenggat PR ini kurang dari 2 hari lagi.', cta: 'Kerjakan PR', href: `/app/homework?id=${def.id}` });
  }

  // 5. Spaced reviews.
  const due = dueItems(s.reviews, now);
  if (due.length) {
    const overdueDays = Math.floor((now - due[0].dueAt) / DAY);
    out.push({ id: 'reviews', kind: 'review', priority: W.reviewsDue + Math.min(20, due.length * 2) + Math.min(10, overdueDays * 2), title: `${due.length} ulangan terjadwal menunggu`, reason: 'Mengulang tepat sebelum lupa adalah cara tercepat memindahkan materi ke ingatan jangka panjang.', cta: 'Mulai ulangan', href: '/app/review' });
  }

  // 6. Unit exams that are ready.
  for (const unit of ix.pack.units) {
    if (unitExamStatus(s, ix, unit.id) === 'available') {
      const exam = unitExam(ix, unit.id)!;
      out.push({ id: `exam:${exam.id}`, kind: 'exam', priority: W.examReady, title: exam.title, reason: 'Semua pelajaran di unit ini sudah tuntas. Lulus ujian unit untuk membuka unit berikutnya.', cta: 'Ikuti ujian', href: `/app/exams?id=${exam.id}` });
    }
  }

  // 7. Continue / next lesson.
  const next = nextLesson(s, ix, ent, now);
  if (next) {
    const inProgress = lessonLock(s, ix, next, ent, now).status === 'in-progress';
    out.push({ id: `lesson:${next.id}`, kind: 'lesson', priority: inProgress ? W.continueLesson : W.nextLesson, title: inProgress ? `Lanjutkan: ${next.title}` : `Pelajaran berikutnya: ${next.title}`, reason: next.summary, cta: inProgress ? 'Lanjutkan' : 'Mulai', href: `/app/lesson?id=${next.id}` });
  }

  return out.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
}
