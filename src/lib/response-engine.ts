import { prisma } from '@/lib/prisma';
import { updateMasteryForResponse } from '@/lib/mastery';
import type { AttemptType } from '@prisma/client';

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const as = [...a].sort();
  const bs = [...b].sort();
  return as.every((v, i) => v === bs[i]);
}

export async function evaluateAndRecordResponse(params: {
  attemptId: string;
  questionId: string;
  selectedOptionIds?: string[];
  orderedOptionIds?: string[];
  shortAnswerText?: string;
  timeSpentSeconds?: number;
  confidence?: number;
}) {
  const {
    attemptId,
    questionId,
    selectedOptionIds = [],
    orderedOptionIds = [],
    shortAnswerText,
    timeSpentSeconds = 0,
    confidence,
  } = params;

  const attempt = await prisma.attempt.findUniqueOrThrow({ where: { id: attemptId } });
  const question = await prisma.question.findUniqueOrThrow({
    where: { id: questionId },
    include: { options: { orderBy: { order: 'asc' } } },
  });

  let isCorrect: boolean;

  if (question.type === 'ORDERING') {
    const correctSequence = [...question.options]
      .sort((a, b) => (a.correctOrder ?? 0) - (b.correctOrder ?? 0))
      .map((o) => o.id);
    isCorrect =
      orderedOptionIds.length === correctSequence.length &&
      orderedOptionIds.every((id, i) => id === correctSequence[i]);
  } else if (question.type === 'SHORT_ANSWER') {
    isCorrect = !!shortAnswerText && !!question.shortAnswer && normalize(shortAnswerText) === normalize(question.shortAnswer);
  } else {
    const correctOptionIds = question.options.filter((o) => o.isCorrect).map((o) => o.id);
    isCorrect = sameSet(selectedOptionIds, correctOptionIds);
  }

  const response = await prisma.response.create({
    data: {
      attemptId,
      questionId,
      selectedOptionIds,
      orderedOptionIds,
      shortAnswerText,
      isCorrect,
      timeSpentSeconds,
      confidence,
    },
  });

  if (attempt.skillId) {
    await updateMasteryForResponse({
      userId: attempt.userId,
      skillId: attempt.skillId,
      isCorrect,
      difficulty: question.difficulty,
    });
  } else {
    // Attempts without a fixed skillId (diagnostics, practice exams) still
    // update mastery, scoped to the question's own skill.
    await updateMasteryForResponse({
      userId: attempt.userId,
      skillId: question.skillId,
      isCorrect,
      difficulty: question.difficulty,
    });
  }

  if (!isCorrect) {
    await prisma.mistake.upsert({
      where: { userId_questionId: { userId: attempt.userId, questionId } },
      create: { userId: attempt.userId, questionId },
      update: { timesMissed: { increment: 1 }, lastMissedAt: new Date(), hidden: false },
    });
  }

  return {
    responseId: response.id,
    isCorrect,
    correctOptionIds: question.options.filter((o) => o.isCorrect).map((o) => o.id),
    explanation: question.explanation,
  };
}

export async function startAttempt(params: { userId: string; type: AttemptType; skillId?: string }) {
  return prisma.attempt.create({
    data: { userId: params.userId, type: params.type, skillId: params.skillId },
  });
}

export async function completeAttempt(attemptId: string) {
  const responses = await prisma.response.findMany({ where: { attemptId } });
  const score = responses.length ? (responses.filter((r) => r.isCorrect).length / responses.length) * 100 : 0;
  return prisma.attempt.update({
    where: { id: attemptId },
    data: { status: 'COMPLETED', completedAt: new Date(), score },
  });
}
