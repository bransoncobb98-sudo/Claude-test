import { prisma } from '@/lib/prisma';
import { generateStudyPlan } from '@/lib/diagnostic-engine';
import { seededShuffle } from '@/lib/random';

/**
 * Domain-balanced question selection for a practice exam attempt. Seeded by
 * the practiceExamAttemptId so the same set is returned across page
 * reloads/resumes rather than reshuffling every request.
 */
export async function getPracticeExamQuestionSet(examId: string, questionCount: number, seed: string) {
  const domains = await prisma.domain.findMany({
    where: { examId, published: true },
    include: {
      objectives: {
        where: { published: true },
        include: {
          skills: {
            where: { published: true },
            include: { questions: { where: { published: true }, include: { options: { orderBy: { order: 'asc' } } } } },
          },
        },
      },
    },
  });

  const perDomain = domains.map((d) => ({
    domain: d,
    questions: seededShuffle(d.objectives.flatMap((o) => o.skills.flatMap((s) => s.questions)), seed + d.id),
  }));

  const totalAvailable = perDomain.reduce((sum, d) => sum + d.questions.length, 0);
  const targetCount = Math.min(questionCount, totalAvailable);
  const perDomainTarget = Math.ceil(targetCount / Math.max(1, perDomain.length));

  const selected = perDomain.flatMap((d) => d.questions.slice(0, perDomainTarget));
  return seededShuffle(selected, seed).slice(0, targetCount);
}

export async function startPracticeExamAttempt(userId: string, practiceExamId: string, mode: 'TIMED' | 'UNTIMED') {
  const existing = await prisma.practiceExamAttempt.findFirst({
    where: { userId, practiceExamId, status: 'IN_PROGRESS' },
    include: { attempt: true },
  });
  if (existing) return existing;

  const attempt = await prisma.practiceExamAttempt.create({
    data: { userId, practiceExamId, mode },
  });
  await prisma.attempt.create({
    data: { userId, type: 'PRACTICE_EXAM', practiceExamAttemptId: attempt.id },
  });

  return prisma.practiceExamAttempt.findUniqueOrThrow({ where: { id: attempt.id }, include: { attempt: true } });
}

export async function completePracticeExamAttempt(practiceExamAttemptId: string, flaggedQuestionIds: string[] = []) {
  const practiceAttempt = await prisma.practiceExamAttempt.findUniqueOrThrow({
    where: { id: practiceExamAttemptId },
    include: {
      practiceExam: true,
      attempt: { include: { responses: { include: { question: { include: { skill: { include: { objective: { include: { domain: true } } } } } } } } } },
    },
  });

  const responses = practiceAttempt.attempt?.responses ?? [];
  const score = responses.length ? (responses.filter((r) => r.isCorrect).length / responses.length) * 100 : 0;

  const domainMap = new Map<string, { name: string; correct: number; total: number }>();
  for (const r of responses) {
    const domain = r.question.skill.objective.domain;
    const entry = domainMap.get(domain.id) ?? { name: domain.name, correct: 0, total: 0 };
    entry.total += 1;
    if (r.isCorrect) entry.correct += 1;
    domainMap.set(domain.id, entry);
  }
  const domainBreakdown = Array.from(domainMap.entries()).map(([id, v]) => ({
    id,
    name: v.name,
    correct: v.correct,
    total: v.total,
    accuracy: Math.round((v.correct / v.total) * 100),
  }));

  if (practiceAttempt.attempt) {
    await prisma.attempt.update({
      where: { id: practiceAttempt.attempt.id },
      data: { status: 'COMPLETED', completedAt: new Date(), score },
    });
  }

  const updated = await prisma.practiceExamAttempt.update({
    where: { id: practiceExamAttemptId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      score,
      domainBreakdown,
      flaggedQuestionIds,
    },
  });

  await generateStudyPlan(practiceAttempt.userId, practiceAttempt.practiceExam.examId);

  return updated;
}
