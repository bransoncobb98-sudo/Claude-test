import { prisma } from '@/lib/prisma';
import { MASTERY_THRESHOLDS } from '@/lib/constants';
import type { MasteryTrend, RecommendationPriority } from '@prisma/client';

export type RecommendedActionType =
  | 'START_LESSON'
  | 'TARGETED_PRACTICE'
  | 'MINI_QUIZ'
  | 'REVIEW_MISSED'
  | 'RETEST';

export interface SkillMasteryProfile {
  skillId: string;
  skillName: string;
  skillSlug: string;
  objectiveId: string;
  objectiveName: string;
  domainId: string;
  domainName: string;
  masteryScore: number;
  questionsAttempted: number;
  questionsCorrect: number;
  trend: MasteryTrend;
  priority: RecommendationPriority;
  recommendedAction: RecommendedActionType;
  hasLesson: boolean;
  lessonId: string | null;
  mistakeCount: number;
}

function priorityForMastery(masteryScore: number, trend: MasteryTrend): RecommendationPriority {
  if (masteryScore < MASTERY_THRESHOLDS.DEVELOPING || trend === 'DECLINING') return 'HIGH';
  if (masteryScore < MASTERY_THRESHOLDS.MASTERED) return 'MEDIUM';
  return 'LOW';
}

function actionForProfile(params: {
  masteryScore: number;
  questionsAttempted: number;
  hasLesson: boolean;
  mistakeCount: number;
}): RecommendedActionType {
  const { masteryScore, questionsAttempted, hasLesson, mistakeCount } = params;
  if (questionsAttempted === 0 && hasLesson) return 'START_LESSON';
  if (masteryScore < MASTERY_THRESHOLDS.DEVELOPING) return 'TARGETED_PRACTICE';
  if (mistakeCount > 0 && masteryScore < MASTERY_THRESHOLDS.MASTERED) return 'REVIEW_MISSED';
  if (masteryScore < MASTERY_THRESHOLDS.MASTERED) return 'MINI_QUIZ';
  return 'RETEST';
}

/**
 * The single source of truth for "what does this user need to study."
 * Every mastery number, priority, and recommendation shown anywhere in the
 * product must come from this function (or the readiness score below) —
 * never hard-coded in a component.
 */
export async function getSkillMasteryProfiles(userId: string, examId: string): Promise<SkillMasteryProfile[]> {
  const skills = await prisma.skill.findMany({
    where: { published: true, objective: { domain: { examId } } },
    include: {
      objective: { include: { domain: true } },
      lessons: { where: { published: true }, select: { id: true }, take: 1 },
      masteryRecords: { where: { userId } },
    },
    orderBy: [{ objective: { domain: { order: 'asc' } } }, { order: 'asc' }],
  });

  const mistakeCounts = await prisma.mistake.groupBy({
    by: ['questionId'],
    where: { userId, hidden: false, question: { skill: { objective: { domain: { examId } } } } },
    _count: true,
  });

  // Map mistakes back to skills via question -> skill
  const mistakeQuestionIds = mistakeCounts.map((m) => m.questionId);
  const mistakeQuestions = mistakeQuestionIds.length
    ? await prisma.question.findMany({
        where: { id: { in: mistakeQuestionIds } },
        select: { id: true, skillId: true },
      })
    : [];
  const mistakesPerSkill = new Map<string, number>();
  for (const q of mistakeQuestions) {
    mistakesPerSkill.set(q.skillId, (mistakesPerSkill.get(q.skillId) ?? 0) + 1);
  }

  return skills.map((skill) => {
    const record = skill.masteryRecords[0];
    const masteryScore = record?.masteryScore ?? 0;
    const trend = record?.trend ?? 'NEW';
    const hasLesson = skill.lessons.length > 0;
    const mistakeCount = mistakesPerSkill.get(skill.id) ?? 0;

    return {
      skillId: skill.id,
      skillName: skill.name,
      skillSlug: skill.slug,
      objectiveId: skill.objective.id,
      objectiveName: skill.objective.name,
      domainId: skill.objective.domain.id,
      domainName: skill.objective.domain.name,
      masteryScore: Math.round(masteryScore),
      questionsAttempted: record?.questionsAttempted ?? 0,
      questionsCorrect: record?.questionsCorrect ?? 0,
      trend,
      priority: priorityForMastery(masteryScore, trend),
      recommendedAction: actionForProfile({
        masteryScore,
        questionsAttempted: record?.questionsAttempted ?? 0,
        hasLesson,
        mistakeCount,
      }),
      hasLesson,
      lessonId: skill.lessons[0]?.id ?? null,
      mistakeCount,
    };
  });
}

export interface DomainPerformance {
  domainId: string;
  domainName: string;
  averageMastery: number;
  skillCount: number;
  attemptedSkillCount: number;
}

export function summarizeDomainPerformance(profiles: SkillMasteryProfile[]): DomainPerformance[] {
  const byDomain = new Map<string, { name: string; total: number; count: number; attempted: number }>();
  for (const p of profiles) {
    const entry = byDomain.get(p.domainId) ?? { name: p.domainName, total: 0, count: 0, attempted: 0 };
    entry.total += p.masteryScore;
    entry.count += 1;
    if (p.questionsAttempted > 0) entry.attempted += 1;
    byDomain.set(p.domainId, entry);
  }
  return Array.from(byDomain.entries())
    .map(([domainId, v]) => ({
      domainId,
      domainName: v.name,
      averageMastery: v.count ? Math.round(v.total / v.count) : 0,
      skillCount: v.count,
      attemptedSkillCount: v.attempted,
    }))
    .sort((a, b) => a.averageMastery - b.averageMastery);
}

export interface RankedPriority {
  rank: number;
  domainId: string;
  domainName: string;
  averageMastery: number;
}

export function rankDomainPriorities(domains: DomainPerformance[]): RankedPriority[] {
  return [...domains]
    .sort((a, b) => a.averageMastery - b.averageMastery)
    .map((d, i) => ({ rank: i + 1, domainId: d.domainId, domainName: d.domainName, averageMastery: d.averageMastery }));
}

export interface NextActivity {
  skillId: string;
  skillName: string;
  domainName: string;
  action: RecommendedActionType;
  label: string;
}

const ACTION_LABELS: Record<RecommendedActionType, string> = {
  START_LESSON: 'Start Lesson',
  TARGETED_PRACTICE: 'Targeted Practice',
  MINI_QUIZ: 'Mini Quiz',
  REVIEW_MISSED: 'Review Missed Questions',
  RETEST: 'Retest',
};

export function getNextActivity(profiles: SkillMasteryProfile[]): NextActivity | null {
  const priorityOrder: RecommendationPriority[] = ['HIGH', 'MEDIUM', 'LOW'];
  const sorted = [...profiles].sort((a, b) => {
    const pa = priorityOrder.indexOf(a.priority);
    const pb = priorityOrder.indexOf(b.priority);
    if (pa !== pb) return pa - pb;
    return a.masteryScore - b.masteryScore;
  });
  const next = sorted.find((p) => p.recommendedAction !== 'RETEST') ?? sorted[0];
  if (!next) return null;
  return {
    skillId: next.skillId,
    skillName: next.skillName,
    domainName: next.domainName,
    action: next.recommendedAction,
    label: ACTION_LABELS[next.recommendedAction],
  };
}
