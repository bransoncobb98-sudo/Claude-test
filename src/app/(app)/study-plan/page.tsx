import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { DEFAULT_STUDY_PLAN_WEEKS } from '@/lib/constants';

const PRIORITY_VARIANT = { HIGH: 'danger', MEDIUM: 'warning', LOW: 'success' } as const;

export default async function StudyPlanPage() {
  const user = await requireUser();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  if (!profile?.targetExamId) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">Complete onboarding to generate your study plan.</p>
        </CardContent>
      </Card>
    );
  }

  const plan = await prisma.studyPlan.findFirst({
    where: { userId: user.id, examId: profile.targetExamId, status: 'ACTIVE' },
    include: { items: { include: { skill: { include: { objective: { include: { domain: true } } } } }, orderBy: { order: 'asc' } } },
  });

  if (!plan || plan.items.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">
          Complete your diagnostic to generate your personalized study plan.
        </h1>
        <ButtonLink href="/diagnostic" size="lg" className="mt-6">
          Take Diagnostic
        </ButtonLink>
      </div>
    );
  }

  const byWeek = new Map<number, typeof plan.items>();
  for (const item of plan.items) {
    byWeek.set(item.weekNumber, [...(byWeek.get(item.weekNumber) ?? []), item]);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">
        Your {plan.totalWeeks ?? DEFAULT_STUDY_PLAN_WEEKS}-Week Study Plan
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Ordered by priority from your diagnostic and practice history. This plan updates
        automatically as your mastery changes.
      </p>

      <div className="mt-8 space-y-6">
        {Array.from({ length: plan.totalWeeks }, (_, i) => i + 1).map((week) => {
          const items = byWeek.get(week) ?? [];
          if (items.length === 0) return null;
          return (
            <Card key={week}>
              <CardContent className="p-6">
                <p className="font-medium text-brand-navy-900">Week {week}</p>
                <ul className="mt-3 space-y-2">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between rounded-lg border border-brand-navy-50 px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-brand-navy-900">{item.skill.name}</p>
                        <p className="text-xs text-slate-500">
                          {item.skill.objective.domain.name} &rsaquo; {item.skill.objective.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={PRIORITY_VARIANT[item.priority]}>{item.priority}</Badge>
                        {item.status === 'COMPLETED' ? (
                          <Badge variant="success">Mastered</Badge>
                        ) : (
                          <ButtonLink href={`/study/${item.skillId}`} size="sm" variant="outline">
                            Study
                          </ButtonLink>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
