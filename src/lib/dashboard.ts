import { prisma } from '@/lib/prisma';
import {
  getSkillMasteryProfiles,
  summarizeDomainPerformance,
  rankDomainPriorities,
  getNextActivity,
} from '@/lib/recommendation-engine';
import { computeReadinessScore, classifyStrongWeakDomains } from '@/lib/readiness';
import { computeStudyStreak } from '@/lib/streak';

export async function getDashboardData(userId: string, examId: string) {
  const [profiles, latestDiagnostic, totalPublishedQuestions, recentActivity, studyPlan, profile] = await Promise.all([
    getSkillMasteryProfiles(userId, examId),
    prisma.diagnosticAssessment.findFirst({
      where: { userId, examId, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      include: { result: true },
    }),
    prisma.question.count({ where: { published: true, skill: { objective: { domain: { examId } } } } }),
    prisma.response.findMany({
      where: { attempt: { userId }, createdAt: { gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true, isCorrect: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.studyPlan.findFirst({
      where: { userId, examId, status: 'ACTIVE' },
      include: { items: { include: { skill: true }, orderBy: { order: 'asc' } } },
    }),
    prisma.profile.findUnique({ where: { userId } }),
  ]);

  const domainPerf = summarizeDomainPerformance(profiles);
  const priorities = rankDomainPriorities(domainPerf);
  const { strong, weak } = classifyStrongWeakDomains(domainPerf);
  const readiness = await computeReadinessScore(userId, examId);
  const nextActivity = getNextActivity(profiles);

  const questionsCompleted = profiles.reduce((sum, p) => sum + p.questionsAttempted, 0);
  const uniqueQuestionsAnswered = await prisma.response.groupBy({
    by: ['questionId'],
    where: { attempt: { userId }, question: { skill: { objective: { domain: { examId } } } } },
  });

  const streak = computeStudyStreak(recentActivity.map((r) => r.createdAt));

  const studyPlanProgress = studyPlan
    ? {
        totalItems: studyPlan.items.length,
        completedItems: studyPlan.items.filter((i) => i.status === 'COMPLETED').length,
        items: studyPlan.items,
      }
    : null;

  let examCountdownDays: number | null = null;
  if (profile?.testDate) {
    examCountdownDays = Math.ceil((profile.testDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  return {
    profiles,
    domainPerf,
    priorities,
    strongDomains: strong,
    weakDomains: weak,
    readiness,
    nextActivity,
    questionsCompleted,
    uniqueQuestionsAnswered: uniqueQuestionsAnswered.length,
    totalPublishedQuestions,
    streak,
    studyPlanProgress,
    examCountdownDays,
    latestDiagnostic,
    recentActivity: recentActivity.slice(0, 5),
  };
}
