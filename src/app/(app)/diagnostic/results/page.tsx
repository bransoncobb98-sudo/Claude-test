import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { Card, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ButtonLink } from '@/components/ui/Button';

interface Breakdown {
  id: string;
  name: string;
  correct: number;
  total: number;
  accuracy: number;
}
interface Priority {
  rank: number;
  domainId: string;
  domainName: string;
  accuracy: number;
}

export default async function DiagnosticResultsPage() {
  const user = await requireUser();
  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId: user.id } });

  const result = await prisma.diagnosticResult.findFirst({
    where: { diagnosticAssessment: { userId: user.id, examId: profile.targetExamId! } },
    orderBy: { createdAt: 'desc' },
  });

  if (!result) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">No diagnostic results yet.</p>
          <ButtonLink href="/diagnostic" className="mt-4">
            Take Diagnostic
          </ButtonLink>
        </CardContent>
      </Card>
    );
  }

  const domainBreakdown = result.domainBreakdown as unknown as Breakdown[];
  const priorities = result.priorities as unknown as Priority[];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-navy-500">
          Diagnostic Complete
        </p>
        <p className="mt-2 font-serif text-5xl font-semibold text-brand-navy-900">
          {Math.round(result.overallScore)}%
        </p>
        <p className="mt-2 text-slate-600">
          Here&rsquo;s your baseline performance across every domain of your exam.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="font-medium text-brand-navy-900">Domain Performance</p>
          <div className="mt-4 space-y-4">
            {domainBreakdown.map((d) => (
              <ProgressBar key={d.id} label={d.name} value={d.accuracy} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="font-medium text-brand-navy-900">Your Priorities</p>
          <ol className="mt-4 space-y-2">
            {priorities.slice(0, 3).map((p) => (
              <li
                key={p.domainId}
                className="flex items-center justify-between rounded-lg border border-brand-navy-50 px-4 py-3 text-sm"
              >
                <span>
                  <span className="font-semibold text-brand-navy-900">PRIORITY {p.rank}</span> — {p.domainName}
                </span>
                <span className="text-slate-500">{p.accuracy}%</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-slate-600">
            We&rsquo;ve generated a personalized study plan starting with these priorities.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3">
        <ButtonLink href="/dashboard">Go to Dashboard</ButtonLink>
        <Link href="/study-plan" className="inline-flex items-center text-sm font-medium text-brand-navy-700 underline">
          View Study Plan
        </Link>
      </div>
    </div>
  );
}
