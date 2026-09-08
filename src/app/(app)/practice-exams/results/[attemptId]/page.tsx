import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { Card, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ButtonLink } from '@/components/ui/Button';

interface DomainBreakdown {
  id: string;
  name: string;
  correct: number;
  total: number;
  accuracy: number;
}

export default async function PracticeExamResultsPage({ params }: { params: { attemptId: string } }) {
  const user = await requireUser();
  const attempt = await prisma.practiceExamAttempt.findUnique({
    where: { id: params.attemptId },
    include: { practiceExam: true },
  });
  if (!attempt || attempt.userId !== user.id) notFound();

  if (attempt.status !== 'COMPLETED') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">This attempt is still in progress.</p>
          <ButtonLink href={`/practice-exams/${attempt.practiceExamId}/attempt`} className="mt-4">
            Resume Attempt
          </ButtonLink>
        </CardContent>
      </Card>
    );
  }

  const breakdown = (attempt.domainBreakdown as unknown as DomainBreakdown[]) ?? [];
  const strong = breakdown.filter((d) => d.accuracy >= 75).sort((a, b) => b.accuracy - a.accuracy);
  const weak = breakdown.filter((d) => d.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-navy-500">Practice Exam Results</p>
        <p className="mt-2 font-serif text-5xl font-semibold text-brand-navy-900">{Math.round(attempt.score ?? 0)}%</p>
        <p className="mt-1 text-slate-600">{attempt.practiceExam.name}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="font-medium text-brand-navy-900">Domain Breakdown</p>
          <div className="mt-4 space-y-4">
            {breakdown.map((d) => (
              <ProgressBar key={d.id} label={d.name} value={d.accuracy} />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="font-medium text-brand-navy-900">Strong Areas</p>
            {strong.length ? (
              <ul className="mt-2 space-y-1 text-sm text-emerald-700">
                {strong.map((d) => (
                  <li key={d.id}>✓ {d.name}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Keep practicing to build strong areas.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="font-medium text-brand-navy-900">Needs Improvement</p>
            {weak.length ? (
              <ul className="mt-2 space-y-1 text-sm text-amber-700">
                {weak.map((d) => (
                  <li key={d.id}>⚠ {d.name}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No significant weak areas from this exam.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-sm text-slate-500">
        Your study recommendations and plan have been updated based on this result.
      </p>

      <div className="flex justify-center gap-3">
        <ButtonLink href="/dashboard">Back to Dashboard</ButtonLink>
        <ButtonLink href="/study-plan" variant="outline">
          View Study Plan
        </ButtonLink>
      </div>
    </div>
  );
}
