import { prisma } from '@/lib/prisma';

export interface ReadinessBreakdown {
  score: number; // 0-100
  diagnosticComponent: number | null;
  masteryComponent: number;
  recentPracticeComponent: number | null;
  practiceExamComponent: number | null;
  consistencyComponent: number;
}

const WEIGHTS = {
  diagnostic: 0.25,
  mastery: 0.35,
  recentPractice: 0.15,
  practiceExam: 0.15,
  consistency: 0.1,
};

/**
 * TX Arts Readiness Score — a transparent, weighted blend of diagnostic
 * performance, current skill mastery, recent practice accuracy, practice
 * exam performance, and study consistency. This is NOT a prediction of an
 * official TExES score (see READINESS_DISCLAIMER, shown wherever this is
 * rendered).
 */
export async function computeReadinessScore(userId: string, examId: string): Promise<ReadinessBreakdown> {
  const latestDiagnostic = await prisma.diagnosticResult.findFirst({
    where: { diagnosticAssessment: { userId, examId, status: 'COMPLETED' } },
    orderBy: { createdAt: 'desc' },
  });

  const masteryRecords = await prisma.masteryRecord.findMany({
    where: { userId, skill: { objective: { domain: { examId } } } },
  });
  const masteryComponent = masteryRecords.length
    ? masteryRecords.reduce((sum, m) => sum + m.masteryScore, 0) / masteryRecords.length
    : 0;

  const recentResponses = await prisma.response.findMany({
    where: { attempt: { userId, type: { in: ['STUDY_PRACTICE', 'MASTERY_CHECK'] } }, question: { skill: { objective: { domain: { examId } } } } },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  const recentPracticeComponent = recentResponses.length
    ? (recentResponses.filter((r) => r.isCorrect).length / recentResponses.length) * 100
    : null;

  const practiceExamAttempts = await prisma.practiceExamAttempt.findMany({
    where: { userId, status: 'COMPLETED', practiceExam: { examId } },
    orderBy: { completedAt: 'desc' },
    take: 5,
  });
  const practiceExamComponent = practiceExamAttempts.length
    ? practiceExamAttempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / practiceExamAttempts.length
    : null;

  // Consistency: distinct study days in the last 14, capped at 100.
  const recentActivity = await prisma.response.findMany({
    where: { attempt: { userId }, createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
    select: { createdAt: true },
  });
  const distinctDays = new Set(recentActivity.map((r) => r.createdAt.toISOString().slice(0, 10))).size;
  const consistencyComponent = Math.min(100, (distinctDays / 10) * 100);

  const components: Array<[number | null, number]> = [
    [latestDiagnostic?.overallScore ?? null, WEIGHTS.diagnostic],
    [masteryComponent, WEIGHTS.mastery],
    [recentPracticeComponent, WEIGHTS.recentPractice],
    [practiceExamComponent, WEIGHTS.practiceExam],
    [consistencyComponent, WEIGHTS.consistency],
  ];

  const availableWeight = components.reduce((sum, [val, w]) => (val !== null ? sum + w : sum), 0);
  const weightedSum = components.reduce((sum, [val, w]) => (val !== null ? sum + val * w : sum), 0);

  const score = availableWeight > 0 ? Math.round(weightedSum / availableWeight) : 0;

  return {
    score,
    diagnosticComponent: latestDiagnostic ? Math.round(latestDiagnostic.overallScore) : null,
    masteryComponent: Math.round(masteryComponent),
    recentPracticeComponent: recentPracticeComponent !== null ? Math.round(recentPracticeComponent) : null,
    practiceExamComponent: practiceExamComponent !== null ? Math.round(practiceExamComponent) : null,
    consistencyComponent: Math.round(consistencyComponent),
  };
}

export function classifyStrongWeakDomains(
  domains: { domainId: string; domainName: string; averageMastery: number }[]
) {
  return {
    strong: domains.filter((d) => d.averageMastery >= 80),
    weak: domains.filter((d) => d.averageMastery < 60).sort((a, b) => a.averageMastery - b.averageMastery),
  };
}
