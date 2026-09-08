import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { requireActiveAccess } from '@/lib/access';
import { startPracticeExamAttempt, getPracticeExamQuestionSet } from '@/lib/practice-exam-engine';
import { PracticeExamRunnerClient } from './PracticeExamRunnerClient';

export default async function PracticeExamAttemptPage({
  params,
  searchParams,
}: {
  params: { practiceExamId: string };
  searchParams: { mode?: string };
}) {
  const user = await requireUser();
  const practiceExam = await prisma.practiceExam.findUnique({ where: { id: params.practiceExamId } });
  if (!practiceExam || !practiceExam.published) notFound();

  await requireActiveAccess(user, practiceExam.examId);

  const mode = searchParams.mode === 'TIMED' ? 'TIMED' : 'UNTIMED';
  const attempt = await startPracticeExamAttempt(user.id, practiceExam.id, mode);
  const questions = await getPracticeExamQuestionSet(practiceExam.examId, practiceExam.questionCount, attempt.id);

  const alreadyAnswered = attempt.attempt
    ? await prisma.response.findMany({ where: { attemptId: attempt.attempt.id }, select: { questionId: true } })
    : [];
  const answeredIds = new Set(alreadyAnswered.map((r) => r.questionId));
  const remaining = questions.filter((q) => !answeredIds.has(q.id));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">{practiceExam.name}</h1>
      <p className="mt-1 text-sm text-slate-600">
        {attempt.mode === 'TIMED' ? `Timed — ${practiceExam.timeLimitMinutes} minutes` : 'Untimed'}
      </p>
      <div className="mt-6">
        <PracticeExamRunnerClient
          practiceExamAttemptId={attempt.id}
          attemptId={attempt.attempt!.id}
          timeLimitMinutes={attempt.mode === 'TIMED' ? practiceExam.timeLimitMinutes : null}
          questions={remaining.map((q) => ({
            id: q.id,
            prompt: q.prompt,
            type: q.type,
            difficulty: q.difficulty,
            imageUrl: q.imageUrl,
            options: q.options.map((o) => ({ id: o.id, label: o.label, text: o.text })),
          }))}
        />
      </div>
    </div>
  );
}
