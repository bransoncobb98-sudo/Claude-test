/**
 * SM-2-inspired spaced repetition scheduling, simplified to the four bands
 * called out in the product brief (§15): low/moderate/high/very-high mastery.
 */

export interface SpacedRepetitionInput {
  masteryScore: number; // 0-100
  incorrectStreak: number;
}

const DAY_MS = 1000 * 60 * 60 * 24;

export function nextReviewIntervalDays({ masteryScore, incorrectStreak }: SpacedRepetitionInput): number {
  if (incorrectStreak >= 2) return 1; // freshly struggling: come back tomorrow regardless of history
  if (masteryScore < 40) return 1;
  if (masteryScore < 60) return 3;
  if (masteryScore < 80) return 7;
  if (masteryScore < 92) return 14;
  return 30;
}

export function computeNextReviewAt(input: SpacedRepetitionInput, from: Date = new Date()): Date {
  const days = nextReviewIntervalDays(input);
  return new Date(from.getTime() + days * DAY_MS);
}
