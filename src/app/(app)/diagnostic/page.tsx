import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { requireActiveAccess } from '@/lib/access';
import { startOrResumeDiagnostic, getDiagnosticQuestionSet } from '@/lib/diagnostic-engine';
import { DiagnosticRunnerClient } from './DiagnosticRunnerClient';

export default async function DiagnosticPage() {
  const user = await requireUser();
  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId: user.id } });
  const examId = profile.targetExamId!;

  await requireActiveAccess(user, examId);

  const exam = await prisma.exam.findUniqueOrThrow({ where: { id: examId } });
  const assessment = await startOrResumeDiagnostic(user.id, examId);
  const questions = await getDiagnosticQuestionSet(examId, assessment.id);

  const alreadyAnswered = assessment.attempt
    ? await prisma.response.findMany({ where: { attemptId: assessment.attempt.id }, select: { questionId: true } })
    : [];
  const answeredIds = new Set(alreadyAnswered.map((r) => r.questionId));
  const remaining = questions.filter((q) => !answeredIds.has(q.id));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">
        {exam.name} — Diagnostic Assessment
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Answer each question as best you can. This assessment spans every domain of your exam so
        we can build your personalized study plan — there&rsquo;s no need to rush.
      </p>

      <div className="mt-8">
        <DiagnosticRunnerClient
          attemptId={assessment.attempt!.id}
          assessmentId={assessment.id}
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
