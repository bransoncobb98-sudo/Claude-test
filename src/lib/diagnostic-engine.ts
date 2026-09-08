import { prisma } from '@/lib/prisma';
import { DEFAULT_STUDY_PLAN_WEEKS } from '@/lib/constants';
import { seededShuffle } from '@/lib/random';

const QUESTIONS_PER_SKILL = 2;

export async function startOrResumeDiagnostic(userId: string, examId: string) {
  const existing = await prisma.diagnosticAssessment.findFirst({
    where: { userId, examId, status: 'IN_PROGRESS' },
    include: { attempt: true },
  });
  if (existing) return existing;

  const assessment = await prisma.diagnosticAssessment.create({
    data: { userId, examId },
  });
  await prisma.attempt.create({
    data: { userId, type: 'DIAGNOSTIC', diagnosticAssessmentId: assessment.id },
  });

  return prisma.diagnosticAssessment.findUniqueOrThrow({
    where: { id: assessment.id },
    include: { attempt: true },
  });
}

/** Selects a domain-balanced, skill-balanced set of questions for a diagnostic assessment. */
export async function getDiagnosticQuestionSet(examId: string, assessmentId: string) {
  const skills = await prisma.skill.findMany({
    where: { published: true, objective: { domain: { examId } } },
    include: {
      objective: { include: { domain: true } },
      questions: { where: { published: true }, include: { options: { orderBy: { order: 'asc' } } } },
    },
    orderBy: [{ objective: { domain: { order: 'asc' } } }, { order: 'asc' }],
  });

  const selected = skills.flatMap((skill) => {
    const shuffled = seededShuffle(skill.questions, assessmentId + skill.id);
    return shuffled.slice(0, QUESTIONS_PER_SKILL);
  });

  return seededShuffle(selected, assessmentId);
}

interface BreakdownEntry {
  id: string;
  name: string;
  correct: number;
  total: number;
  accuracy: number;
}

export async function scoreDiagnostic(diagnosticAssessmentId: string) {
  const existingResult = await prisma.diagnosticResult.findUnique({ where: { diagnosticAssessmentId } });
  if (existingResult) return existingResult; // idempotent: a retried/duplicate "complete" call is a no-op

  const assessment = await prisma.diagnosticAssessment.findUniqueOrThrow({
    where: { id: diagnosticAssessmentId },
    include: { attempt: { include: { responses: { include: { question: { include: { skill: { include: { objective: { include: { domain: true } } } } } } } } } } },
  });

  const responses = assessment.attempt?.responses ?? [];
  const overallScore = responses.length ? (responses.filter((r) => r.isCorrect).length / responses.length) * 100 : 0;

  const domainMap = new Map<string, BreakdownEntry>();
  const objectiveMap = new Map<string, BreakdownEntry>();
  const skillMap = new Map<string, BreakdownEntry>();

  for (const r of responses) {
    const skill = r.question.skill;
    const objective = skill.objective;
    const domain = objective.domain;

    for (const [map, entity] of [
      [domainMap, domain],
      [objectiveMap, objective],
      [skillMap, skill],
    ] as const) {
      const entry = map.get(entity.id) ?? { id: entity.id, name: entity.name, correct: 0, total: 0, accuracy: 0 };
      entry.total += 1;
      if (r.isCorrect) entry.correct += 1;
      map.set(entity.id, entry);
    }
  }

  const finalize = (map: Map<string, BreakdownEntry>) =>
    Array.from(map.values()).map((e) => ({ ...e, accuracy: Math.round((e.correct / e.total) * 100) }));

  const domainBreakdown = finalize(domainMap).sort((a, b) => a.accuracy - b.accuracy);
  const objectiveBreakdown = finalize(objectiveMap).sort((a, b) => a.accuracy - b.accuracy);
  const skillBreakdown = finalize(skillMap).sort((a, b) => a.accuracy - b.accuracy);

  const priorities = domainBreakdown.map((d, i) => ({ rank: i + 1, domainId: d.id, domainName: d.name, accuracy: d.accuracy }));

  const result = await prisma.diagnosticResult.upsert({
    where: { diagnosticAssessmentId },
    update: {},
    create: {
      diagnosticAssessmentId,
      overallScore,
      domainBreakdown,
      objectiveBreakdown,
      skillBreakdown,
      priorities,
    },
  });

  await prisma.diagnosticAssessment.update({
    where: { id: diagnosticAssessmentId },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });

  await generateStudyPlan(assessment.userId, assessment.examId);

  return result;
}

/**
 * Generates (or refreshes) a student's study plan from current mastery
 * data. Called after the diagnostic, after practice exams, and after any
 * mastery check — so the plan always reflects the latest evidence.
 */
export async function generateStudyPlan(userId: string, examId: string) {
  const { getSkillMasteryProfiles } = await import('@/lib/recommendation-engine');
  const profiles = await getSkillMasteryProfiles(userId, examId);

  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
  const ordered = [...profiles].sort((a, b) => {
    const pa = priorityOrder[a.priority];
    const pb = priorityOrder[b.priority];
    if (pa !== pb) return pa - pb;
    return a.masteryScore - b.masteryScore;
  });

  let plan = await prisma.studyPlan.findFirst({ where: { userId, examId, status: 'ACTIVE' } });
  if (!plan) {
    plan = await prisma.studyPlan.create({
      data: { userId, examId, totalWeeks: DEFAULT_STUDY_PLAN_WEEKS },
    });
  }

  const skillsPerWeek = Math.max(1, Math.ceil(ordered.length / DEFAULT_STUDY_PLAN_WEEKS));

  const existingItems = await prisma.studyPlanItem.findMany({ where: { studyPlanId: plan.id } });
  const existingBySkill = new Map(existingItems.map((i) => [i.skillId, i]));

  for (let i = 0; i < ordered.length; i++) {
    const profile = ordered[i];
    const weekNumber = Math.min(DEFAULT_STUDY_PLAN_WEEKS, Math.floor(i / skillsPerWeek) + 1);
    const existing = existingBySkill.get(profile.skillId);

    if (existing) {
      // Mastered skills move their remaining plan item out of the way (still
      // trackable) but are marked complete; regressed skills are bumped back
      // toward the front by re-ordering below.
      const status = profile.masteryScore >= 80 ? 'COMPLETED' : existing.status;
      await prisma.studyPlanItem.update({
        where: { id: existing.id },
        data: { order: i, priority: profile.priority, status, weekNumber },
      });
    } else {
      await prisma.studyPlanItem.create({
        data: {
          studyPlanId: plan.id,
          skillId: profile.skillId,
          weekNumber,
          order: i,
          priority: profile.priority,
        },
      });
    }
  }

  return plan;
}
