'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionRunner, RunnerQuestion } from '@/components/app/QuestionRunner';

export function DiagnosticRunnerClient({
  attemptId,
  assessmentId,
  questions,
}: {
  attemptId: string;
  assessmentId: string;
  questions: RunnerQuestion[];
}) {
  const router = useRouter();

  async function handleComplete() {
    const res = await fetch(`/api/diagnostic/${assessmentId}/complete`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to complete diagnostic');
  }

  useEffect(() => {
    if (questions.length === 0) {
      // Every question in this session was already answered but scoring
      // hadn't finished (e.g., the user left mid-scoring) — finish now.
      handleComplete()
        .then(() => {
          router.push('/diagnostic/results');
          router.refresh();
        })
        .catch(() => {
          // Swallow here; the user can navigate to /diagnostic again to retry.
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (questions.length === 0) {
    return <p className="text-slate-600">Finishing up your diagnostic…</p>;
  }

  return (
    <QuestionRunner
      attemptId={attemptId}
      questions={questions}
      showFeedbackImmediately={false}
      onComplete={handleComplete}
      completeHref="/diagnostic/results"
    />
  );
}
