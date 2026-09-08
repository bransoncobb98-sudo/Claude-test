import { prisma } from '@/lib/prisma';
import { computeNextReviewAt } from '@/lib/spaced-repetition';
import type { MasteryTrend } from '@prisma/client';

/**
 * The implied mastery level of a single response, before blending with
 * history. Harder questions answered correctly imply higher mastery;
 * missing an easy question is a stronger negative signal than missing a
 * hard one.
 */
function impliedMasteryFromResponse(isCorrect: boolean, difficulty: number): number {
  if (isCorrect) return Math.min(100, 40 + difficulty * 12);
  return Math.max(0, (difficulty - 1) * 10);
}

const EMA_ALPHA = 0.35;

/**
 * Records the effect of a single answered question on a user's mastery of
 * a skill. This is the only place MasteryRecord rows are written, so every
 * mastery number on screen is traceable back to real Response history.
 */
export async function updateMasteryForResponse(params: {
  userId: string;
  skillId: string;
  isCorrect: boolean;
  difficulty: number;
}) {
  const { userId, skillId, isCorrect, difficulty } = params;

  const existing = await prisma.masteryRecord.findUnique({
    where: { userId_skillId: { userId, skillId } },
  });

  const impliedMastery = impliedMasteryFromResponse(isCorrect, difficulty);
  const isFirstAttempt = !existing || existing.questionsAttempted === 0;

  const oldScore = existing?.masteryScore ?? 0;
  const newScore = isFirstAttempt ? impliedMastery : oldScore * (1 - EMA_ALPHA) + impliedMastery * EMA_ALPHA;

  const correctStreak = isCorrect ? (existing?.correctStreak ?? 0) + 1 : 0;
  const incorrectStreak = isCorrect ? 0 : (existing?.incorrectStreak ?? 0) + 1;

  let trend: MasteryTrend = 'STABLE';
  if (isFirstAttempt) trend = 'NEW';
  else if (newScore > oldScore + 1) trend = 'IMPROVING';
  else if (newScore < oldScore - 1) trend = 'DECLINING';

  const nextReviewAt = computeNextReviewAt({ masteryScore: newScore, incorrectStreak });

  return prisma.masteryRecord.upsert({
    where: { userId_skillId: { userId, skillId } },
    create: {
      userId,
      skillId,
      masteryScore: newScore,
      questionsAttempted: 1,
      questionsCorrect: isCorrect ? 1 : 0,
      correctStreak,
      incorrectStreak,
      trend,
      lastReviewedAt: new Date(),
      reviewCount: 1,
      nextReviewAt,
    },
    update: {
      masteryScore: newScore,
      questionsAttempted: { increment: 1 },
      questionsCorrect: isCorrect ? { increment: 1 } : undefined,
      correctStreak,
      incorrectStreak,
      trend,
      lastReviewedAt: new Date(),
      reviewCount: { increment: 1 },
      nextReviewAt,
    },
  });
}

/** Adaptive difficulty: what difficulty should the next question for this skill be? */
export function nextDifficultyForMastery(masteryScore: number, incorrectStreak: number): number {
  if (incorrectStreak >= 2) return Math.max(1, Math.round(masteryScore / 100 * 5) - 1);
  if (masteryScore >= 80) return 5;
  if (masteryScore >= 60) return 4;
  if (masteryScore >= 40) return 3;
  if (masteryScore >= 20) return 2;
  return 1;
}
