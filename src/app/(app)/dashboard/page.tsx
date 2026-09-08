import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { getDashboardData } from '@/lib/dashboard';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ButtonLink } from '@/components/ui/Button';
import { READINESS_DISCLAIMER } from '@/lib/constants';
import type { RecommendedActionType } from '@/lib/recommendation-engine';

const ACTION_HREF: Record<RecommendedActionType, (skillId: string) => string> = {
  START_LESSON: (skillId) => `/study/${skillId}`,
  TARGETED_PRACTICE: (skillId) => `/study/${skillId}?mode=practice`,
  MINI_QUIZ: (skillId) => `/study/${skillId}?mode=quiz`,
  REVIEW_MISSED: () => `/mistakes`,
  RETEST: () => `/practice-exams`,
};

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  if (!profile?.targetExamId) {
    if (user.role === 'ADMIN') {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">
              You&rsquo;re signed in as an administrator without a student profile. Visit{' '}
              <Link href="/admin" className="font-medium text-brand-navy-800 underline">
                the admin dashboard
              </Link>{' '}
              to manage content, or complete onboarding to preview the student experience.
            </p>
          </CardContent>
        </Card>
      );
    }
    redirect('/onboarding');
  }

  const exam = await prisma.exam.findUniqueOrThrow({ where: { id: profile.targetExamId } });
  const data = await getDashboardData(user.id, exam.id);

  if (!data.latestDiagnostic) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">
          Your personalized pathway starts here.
        </h1>
        <p className="mt-3 text-slate-600">
          Take a short diagnostic assessment across every domain of {exam.name}. We&rsquo;ll use
          your results to build a study plan focused on exactly what you need.
        </p>
        <ButtonLink href="/diagnostic" size="lg" className="mt-6">
          Take Diagnostic
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-navy-500">
              Your TExES Readiness
            </p>
            <p className="mt-2 font-serif text-5xl font-semibold text-brand-navy-900">
              {data.readiness.score}%
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {data.readiness.score >= 80
                ? "You're in strong shape."
                : data.readiness.score >= 50
                ? "You're making progress."
                : "Let's build some momentum."}
            </p>
            <p className="mt-3 text-xs text-slate-400">{READINESS_DISCLAIMER}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Diagnostic Score" value={`${Math.round(data.latestDiagnostic.result?.overallScore ?? 0)}%`} />
              <Stat label="Questions Completed" value={`${data.uniqueQuestionsAnswered}/${data.totalPublishedQuestions}`} />
              <Stat label="Study Streak" value={`${data.streak} day${data.streak === 1 ? '' : 's'}`} />
              <Stat
                label="Exam Countdown"
                value={data.examCountdownDays !== null ? `${data.examCountdownDays}d` : '—'}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="font-medium text-brand-navy-900">You have mastered:</p>
            {data.strongDomains.length ? (
              <ul className="mt-2 space-y-1 text-sm text-emerald-700">
                {data.strongDomains.map((d) => (
                  <li key={d.domainId}>✓ {d.domainName}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No domains mastered yet — keep practicing.</p>
            )}

            <p className="mt-5 font-medium text-brand-navy-900">Focus next:</p>
            {data.weakDomains.length ? (
              <ul className="mt-2 space-y-1 text-sm text-amber-700">
                {data.weakDomains.map((d) => (
                  <li key={d.domainId}>⚠ {d.domainName} ({d.averageMastery}%)</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No weak domains detected right now.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Your Next Step</p>
            {data.nextActivity ? (
              <>
                <p className="mt-1 font-medium text-brand-navy-900">
                  {data.nextActivity.label}: {data.nextActivity.skillName}
                </p>
                <p className="text-sm text-slate-500">{data.nextActivity.domainName}</p>
                <ButtonLink
                  href={ACTION_HREF[data.nextActivity.action](data.nextActivity.skillId)}
                  size="sm"
                  className="mt-4"
                >
                  Start Study Session
                </ButtonLink>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Great work! You don&rsquo;t currently have any priority items — try a practice exam.
              </p>
            )}

            {data.studyPlanProgress && (
              <div className="mt-6">
                <ProgressBar
                  label="Study Plan Progress"
                  value={
                    data.studyPlanProgress.totalItems
                      ? (data.studyPlanProgress.completedItems / data.studyPlanProgress.totalItems) * 100
                      : 0
                  }
                />
                <Link href="/study-plan" className="mt-2 inline-block text-sm text-brand-navy-700 underline">
                  View full study plan
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="font-medium text-brand-navy-900">Domain Performance</p>
          <div className="mt-4 space-y-4">
            {data.domainPerf.map((d) => (
              <ProgressBar key={d.domainId} label={d.domainName} value={d.averageMastery} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <p className="font-medium text-brand-navy-900">Priorities</p>
            <Badge variant="neutral">From your diagnostic + practice history</Badge>
          </div>
          <ol className="mt-4 space-y-2">
            {data.priorities.slice(0, 3).map((p) => (
              <li key={p.domainId} className="flex items-center justify-between rounded-lg border border-brand-navy-50 px-4 py-3 text-sm">
                <span>
                  <span className="font-semibold text-brand-navy-900">PRIORITY {p.rank}</span> — {p.domainName}
                </span>
                <span className="text-slate-500">{p.averageMastery}%</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {data.recentActivity.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="font-medium text-brand-navy-900">Recent Performance</p>
            <ul className="mt-3 divide-y divide-brand-navy-50 text-sm">
              {data.recentActivity.map((r, i) => (
                <li key={i} className="flex justify-between py-2">
                  <span className="text-slate-600">{r.createdAt.toLocaleDateString()}</span>
                  <span className={r.isCorrect ? 'text-emerald-700' : 'text-red-600'}>
                    {r.isCorrect ? 'Correct' : 'Missed'}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <ButtonLink href="/practice-exams" variant="outline">
          Take a Practice Exam
        </ButtonLink>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-brand-navy-900">{value}</p>
    </div>
  );
}
