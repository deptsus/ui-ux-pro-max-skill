// Every threshold of the learning engine lives here so that pedagogy can be
// tuned without touching the algorithms.

export const MASTERY = {
  /** Only the most recent attempts on a topic count as evidence. */
  window: 20,
  /** Below this many attempts the score is scaled down (no mastery from one quiz). */
  minAttempts: 8,
  /** Harder questions weigh more. Index = difficulty 1..5. */
  difficultyWeight: [0, 0.8, 1.0, 1.2, 1.4, 1.6],
  /** Oldest attempt in the window weighs this much; newest weighs 1. */
  oldestRecencyWeight: 0.4,
  /** Credit for a correct answer that needed a hint. */
  hintCredit: 0.5,
  /** Credit for a correct answer slower than slowFactor x expected time. */
  slowCredit: 0.9,
  slowFactor: 3,
  expectedMsByDifficulty: [0, 12000, 16000, 22000, 30000, 40000],
  bands: [
    { min: 95, id: 'excellent', label: 'Penguasaan sangat baik' },
    { min: 85, id: 'strong', label: 'Pemahaman kuat' },
    { min: 70, id: 'developing', label: 'Pemahaman berkembang' },
    { min: 50, id: 'practice', label: 'Perlu latihan tambahan' },
    { min: 0, id: 'fundamental', label: 'Perlu mengulang dasar' },
  ],
  /** Minimum score to unlock the next mastery level. */
  unlockScore: 85,
  /** A topic is confirmed "mastered" only after a delayed retest. */
  retestDelayHours: 20,
  retestSize: 7,
  retestPassScore: 85,
  /** Mastery must be shown on at least this many distinct days. */
  minDistinctDays: 2,
} as const;

export const SRS = {
  /** Review intervals in days: 1, 3, 7, 14, 30. */
  steps: [1, 3, 7, 14, 30],
  /** After the last step, each success multiplies the interval. */
  growth: 1.5,
  maxIntervalDays: 120,
  /** A lapse moves the item back this many steps. */
  lapseStepBack: 2,
} as const;

export const RECOMMEND = {
  /** A misconception is "active" with this many errors inside the window. */
  tagErrorThreshold: 2,
  tagWindowDays: 7,
  weights: {
    placement: 95,
    remediateTag: 100,
    reviseTopic: 90,
    retest: 85,
    homeworkOverdue: 75,
    practiceTopic: 70,
    homeworkDue: 65,
    reviewsDue: 60,
    examReady: 58,
    continueLesson: 55,
    nextLesson: 50,
  },
} as const;

export const DRILL = {
  size: 8,
  /** Consecutive correct answers needed to step difficulty up. */
  upAfter: 2,
  passScore: 85,
} as const;

export const GAME = {
  xp: {
    guidedCorrect: 2,
    independentCorrect: 4,
    masteryCorrect: 5,
    reviewCorrect: 3,
    drillCorrect: 4,
    lessonComplete: 20,
    homeworkComplete: 15,
    unitExamPass: 50,
    levelExamPass: 150,
    conversationComplete: 15,
    chapterComplete: 100,
    topicMastered: 30,
    timedCorrect: 2,
  },
  hearts: { max: 5, regenMinutes: 60 },
  freeDailyReviewItems: 10,
  dailyGoalOptions: [20, 40, 60, 100],
  milestones: [100, 500, 1000, 2500, 5000, 10000],
} as const;

export const LIMITS = {
  attemptsKept: 400,
  xpLogKept: 200,
  topicHistoryKept: 30,
  reviewHistoryKept: 20,
  dailyKeptDays: 180,
} as const;
