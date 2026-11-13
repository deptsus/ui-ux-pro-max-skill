// Staged placement test. Blocks go from A1 upward; the learner is placed at
// the first level whose block they do not pass, and the test stops there.
import { CEFR_ORDER, type Cefr, type Exercise } from '@/lib/content/types';

export const PLACEMENT_PASS = 0.75;

export interface PlacementBlock {
  level: Cefr;
  exercises: Exercise[];
}

export function placementBlocks(exercises: Exercise[]): PlacementBlock[] {
  return CEFR_ORDER.map((level) => ({
    level,
    exercises: exercises.filter((e) => e.stage === 'placement' && e.level === level).sort((a, b) => a.position - b.position),
  })).filter((b) => b.exercises.length > 0);
}

export interface PlacementProgress {
  /** Next exercise, or null when the test is over. */
  next: Exercise | null;
  done: boolean;
  level: Cefr;
  blockScores: { level: Cefr; correct: number; total: number; passed: boolean }[];
}

export function placementProgress(blocks: PlacementBlock[], results: Record<string, boolean>): PlacementProgress {
  const blockScores: PlacementProgress['blockScores'] = [];
  for (const block of blocks) {
    const pending = block.exercises.find((e) => results[e.id] === undefined);
    if (pending) return { next: pending, done: false, level: block.level, blockScores };
    const correct = block.exercises.filter((e) => results[e.id]).length;
    const passed = correct / block.exercises.length >= PLACEMENT_PASS;
    blockScores.push({ level: block.level, correct, total: block.exercises.length, passed });
    if (!passed) return { next: null, done: true, level: block.level, blockScores };
  }
  // Passed every block: start at the level after the last tested one (capped).
  const last = blocks[blocks.length - 1]?.level ?? 'A1';
  const level = CEFR_ORDER[Math.min(CEFR_ORDER.length - 1, CEFR_ORDER.indexOf(last) + 1)];
  return { next: null, done: true, level, blockScores };
}
