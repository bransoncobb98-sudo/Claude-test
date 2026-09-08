'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionRunner, RunnerQuestion } from '@/components/app/QuestionRunner';

export function PracticeExamRunnerClient({
  practiceExamAttemptId,
  attemptId,
  timeLimitMinutes,
  questions,
}: {
  practiceExamAttemptId: string;
  attemptId: string;
  timeLimitMinutes: number | null;
  questions: RunnerQuestion[];
}) {
  const router = useRouter();
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [secondsLeft, setSecondsLeft] = useState(timeLimitMinutes ? timeLimitMinutes * 60 : null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      setExpired(true);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s !== null ? s - 1 : s)), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  async function handleComplete() {
    const res = await fetch(`/api/practice-exams/${practiceExamAttemptId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flaggedQuestionIds: Array.from(flagged) }),
    });
    if (!res.ok) throw new Error('Failed to complete practice exam');
  }

  useEffect(() => {
    if (expired) {
      handleComplete()
        .then(() => {
          router.push(`/practice-exams/results/${practiceExamAttemptId}`);
          router.refresh();
        })
        .catch(() => {
          // Swallow here; QuestionRunner's own retry path handles the common case
          // (finishing on the last question) — this only covers the timer-expiry path.
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);

  function toggleFlag(questionId: string) {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }

  if (expired) {
    return <p className="text-slate-600">Time&rsquo;s up — submitting your exam…</p>;
  }

  return (
    <div>
      {secondsLeft !== null && (
        <p className="mb-4 text-right text-sm font-medium text-brand-navy-700">
          Time remaining: {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
        </p>
      )}
      <QuestionRunner
        attemptId={attemptId}
        questions={questions}
        showFeedbackImmediately={false}
        onComplete={handleComplete}
        completeHref={`/practice-exams/results/${practiceExamAttemptId}`}
        flaggedIds={flagged}
        onToggleFlag={toggleFlag}
      />
    </div>
  );
}
