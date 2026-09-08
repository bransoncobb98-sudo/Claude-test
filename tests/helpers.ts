import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/** Creates a fully isolated Exam -> Domain -> Objective -> Skill -> Question
 * fixture tree for a test run, tagged with a unique suffix so parallel test
 * files never collide. Deleting the returned exam cascades to everything
 * beneath it. */
export async function createFixtureExam(suffix: string) {
  const exam = await prisma.exam.create({
    data: {
      slug: `test-exam-${suffix}`,
      name: `Test Exam ${suffix}`,
      published: true,
      isDemo: true,
    },
  });

  const domainA = await prisma.domain.create({
    data: { examId: exam.id, name: 'Domain A', slug: 'domain-a', published: true, order: 0 },
  });
  const domainB = await prisma.domain.create({
    data: { examId: exam.id, name: 'Domain B', slug: 'domain-b', published: true, order: 1 },
  });

  const objectiveA = await prisma.objective.create({
    data: { domainId: domainA.id, name: 'Objective A1', published: true, order: 0 },
  });
  const objectiveB = await prisma.objective.create({
    data: { domainId: domainB.id, name: 'Objective B1', published: true, order: 0 },
  });

  const skillA = await prisma.skill.create({
    data: { objectiveId: objectiveA.id, name: 'Skill A1', slug: 'skill-a1', published: true, order: 0 },
  });
  const skillB = await prisma.skill.create({
    data: { objectiveId: objectiveB.id, name: 'Skill B1', slug: 'skill-b1', published: true, order: 0 },
  });

  async function makeQuestions(skillId: string, count: number) {
    const created = [];
    for (let i = 0; i < count; i++) {
      const question = await prisma.question.create({
        data: {
          skillId,
          prompt: `Fixture question ${i} for ${skillId}`,
          explanation: 'Fixture explanation.',
          difficulty: 3,
          published: true,
          isDemo: true,
          reviewStatus: 'APPROVED',
          options: {
            create: [
              { label: 'A', text: 'Correct', isCorrect: true, order: 0 },
              { label: 'B', text: 'Wrong', isCorrect: false, order: 1 },
            ],
          },
        },
        include: { options: true },
      });
      created.push(question);
    }
    return created;
  }

  const questionsA = await makeQuestions(skillA.id, 3);
  const questionsB = await makeQuestions(skillB.id, 3);

  return { exam, domainA, domainB, objectiveA, objectiveB, skillA, skillB, questionsA, questionsB };
}

/**
 * Deletes a fixture exam and everything under it. Question rows are
 * deliberately protected from cascade deletes in the real schema (a
 * Question with recorded Responses can't be hard-deleted — that's real
 * student history, not something a schema-level cascade should ever
 * silently destroy), so test cleanup has to remove the response/attempt
 * graph itself before removing the content tree.
 */
export async function deleteFixtureExam(examId: string) {
  const questionIds = (
    await prisma.question.findMany({ where: { skill: { objective: { domain: { examId } } } }, select: { id: true } })
  ).map((q) => q.id);

  if (questionIds.length > 0) {
    await prisma.mistake.deleteMany({ where: { questionId: { in: questionIds } } });
    await prisma.bookmark.deleteMany({ where: { questionId: { in: questionIds } } });
    await prisma.response.deleteMany({ where: { questionId: { in: questionIds } } });
  }

  const attemptIds = (
    await prisma.attempt.findMany({
      where: {
        OR: [
          { skill: { objective: { domain: { examId } } } },
          { diagnosticAssessment: { examId } },
          { practiceExamAttempt: { practiceExam: { examId } } },
        ],
      },
      select: { id: true },
    })
  ).map((a) => a.id);
  if (attemptIds.length > 0) {
    await prisma.response.deleteMany({ where: { attemptId: { in: attemptIds } } });
  }

  await prisma.diagnosticResult.deleteMany({ where: { diagnosticAssessment: { examId } } });
  await prisma.practiceExamAttempt.deleteMany({ where: { practiceExam: { examId } } });
  if (attemptIds.length > 0) {
    await prisma.attempt.deleteMany({ where: { id: { in: attemptIds } } });
  }
  await prisma.diagnosticAssessment.deleteMany({ where: { examId } });
  await prisma.studyPlanItem.deleteMany({ where: { skill: { objective: { domain: { examId } } } } });
  await prisma.studyPlan.deleteMany({ where: { examId } });
  await prisma.masteryRecord.deleteMany({ where: { skill: { objective: { domain: { examId } } } } });

  await prisma.exam.delete({ where: { id: examId } });
}

export async function createFixtureUser(suffix: string, overrides: { suspended?: boolean; password?: string } = {}) {
  const password = overrides.password ?? 'FixtureUser!2026';
  const passwordHash = await bcrypt.hash(password, 4); // low cost factor for fast tests
  const user = await prisma.user.create({
    data: {
      email: `fixture+${suffix}@example.com`,
      passwordHash,
      firstName: 'Fixture',
      lastName: 'User',
      suspended: overrides.suspended ?? false,
    },
  });
  return { user, password };
}

export async function deleteFixtureUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
}
