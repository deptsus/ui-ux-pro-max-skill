// Scoring for branching stories (Rilis 5), kept free of UI code so tests and
// the player share it.
import type { StoryChoice, StoryNode } from '@/lib/content/types';

export interface BranchPick { node: StoryNode; choice: StoryChoice }
export interface BranchResult { score: number; ending: NonNullable<StoryNode['ending']>; picks: BranchPick[] }

/** Like a conversation: the best reply scores 3, a less fitting one 1–2, a grammar error 0. */
export const branchScore = (picks: Pick<BranchPick, 'choice'>[]) =>
  (picks.length ? Math.round((picks.reduce((n, p) => n + (p.choice.correct ? p.choice.natural : 0), 0) / (3 * picks.length)) * 100) : 0);
