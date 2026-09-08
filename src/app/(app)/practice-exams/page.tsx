import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default async function PracticeExamsPage() {
  const user = await requireUser();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  if (!profile?.targetExamId) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">Complete onboarding to see available practice exams.</p>
        </CardContent>
      </Card>
    );
  }

  const practiceExams = await prisma.practiceExam.findMany({
    where: { examId: profile.targetExamId, published: true },
  });

  const attempts = await prisma.practiceExamAttempt.findMany({
    where: { userId: user.id, practiceExamId: { in: practiceExams.map((p) => p.id) } },
    orderBy: { completedAt: 'desc' },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">Practice Exams</h1>
      <p className="mt-2 text-sm text-slate-600">
        Full-length, domain-balanced exams. Choose timed mode to simulate real testing
        conditions, or untimed to focus purely on accuracy.
      </p>

      <div className="mt-8 space-y-6">
        {practiceExams.map((exam) => {
          const examAttempts = attempts.filter((a) => a.practiceExamId === exam.id);
          const inProgress = examAttempts.find((a) => a.status === 'IN_PROGRESS');
          const completed = examAttempts.filter((a) => a.status === 'COMPLETED');
          const best = completed.reduce((max, a) => Math.max(max, a.score ?? 0), 0);

          return (
            <Card key={exam.id}>
              <CardContent className="p-6">
                <CardTitle>{exam.name}</CardTitle>
                <CardDescription>
                  {exam.questionCount} questions &middot; {exam.timeLimitMinutes} minute suggested time limit
                </CardDescription>
                {completed.length > 0 && (
                  <p className="mt-2 text-sm text-slate-600">
                    Best score: <span className="font-semibold text-brand-navy-900">{Math.round(best)}%</span> across {completed.length} attempt{completed.length === 1 ? '' : 's'}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  {inProgress ? (
                    <ButtonLink href={`/practice-exams/${exam.id}/attempt`}>Resume Attempt</ButtonLink>
                  ) : (
                    <>
                      <ButtonLink href={`/practice-exams/${exam.id}/attempt?mode=TIMED`}>Start Timed</ButtonLink>
                      <ButtonLink href={`/practice-exams/${exam.id}/attempt?mode=UNTIMED`} variant="outline">
                        Start Untimed
                      </ButtonLink>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {practiceExams.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Badge variant="neutral">No practice exams published yet</Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
