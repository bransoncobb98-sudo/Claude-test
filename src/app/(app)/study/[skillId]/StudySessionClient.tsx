'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RunnerQuestion } from '@/components/app/QuestionRunner';
import { DEMO_CONTENT_LABEL } from '@/lib/constants';

type Phase = 'learn' | 'check' | 'practice' | 'review' | 'mastery' | 'summary';

interface Lesson {
  title: string;
  content: string;
  keyConcepts: string[];
  example: string | null;
}

interface ReviewItem {
  question: RunnerQuestion;
  isCorrect: boolean;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  explanation: string;
}

export function StudySessionClient({
  skillId,
  skillName,
  lesson,
  masteryBefore,
  checkAttemptId,
  practiceAttemptId,
  masteryAttemptId,
  checkQuestions,
  practiceQuestions,
  masteryQuestions,
}: {
  skillId: string;
  skillName: string;
  lesson: Lesson | null;
  masteryBefore: number;
  checkAttemptId: string;
  practiceAttemptId: string;
  masteryAttemptId: string;
  checkQuestions: RunnerQuestion[];
  practiceQuestions: RunnerQuestion[];
  masteryQuestions: RunnerQuestion[];
}) {
  const [phase, setPhase] = useState<Phase>(lesson ? 'learn' : 'check');
  const [masteryAfter, setMasteryAfter] = useState<number | null>(null);
  const [practiceReview, setPracticeReview] = useState<ReviewItem[]>([]);

  async function fetchMastery() {
    const res = await fetch(`/api/mastery/${skillId}`);
    const data = await res.json();
    return data.masteryScore as number;
  }

  if (phase === 'learn' && lesson) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="demo">{DEMO_CONTENT_LABEL}</Badge>
          </div>
          <h2 className="text-lg font-semibold text-brand-navy-900">{lesson.title}</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{lesson.content}</p>
          {lesson.keyConcepts.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-brand-navy-900">Key Concepts</p>
              <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                {lesson.keyConcepts.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          {lesson.example && (
            <div className="mt-4 rounded-lg bg-brand-navy-50/60 p-4 text-sm text-slate-700">
              <p className="font-medium text-brand-navy-900">Example</p>
              <p className="mt-1">{lesson.example}</p>
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setPhase('check')}>Check Your Understanding</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'check') {
    return (
      <div>
        <p className="mb-4 text-sm font-medium uppercase tracking-wide text-brand-navy-500">
          Check Your Understanding
        </p>
        <SessionRunner
          attemptId={checkAttemptId}
          questions={checkQuestions}
          showFeedbackImmediately
          onFinished={() => setPhase('practice')}
        />
      </div>
    );
  }

  if (phase === 'practice') {
    return (
      <div>
        <p className="mb-4 text-sm font-medium uppercase tracking-wide text-brand-navy-500">
          Practice ({practiceQuestions.length} questions)
        </p>
        <SessionRunner
          attemptId={practiceAttemptId}
          questions={practiceQuestions}
          showFeedbackImmediately={false}
          onFinished={(items) => {
            setPracticeReview(items);
            setPhase('review');
          }}
        />
      </div>
    );
  }

  if (phase === 'review') {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-navy-500">Review</p>
        {practiceReview.map((item, i) => (
          <Card key={`${item.question.id}-${i}`}>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-brand-navy-900">
                {i + 1}. {item.question.prompt}
              </p>
              <p className={`mt-2 text-sm font-semibold ${item.isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
                {item.isCorrect ? 'You answered correctly' : 'You missed this one'}
              </p>
              <p className="mt-1 text-sm text-slate-600">{item.explanation}</p>
            </CardContent>
          </Card>
        ))}
        <div className="flex justify-end">
          <Button onClick={() => setPhase('mastery')}>Continue to Mastery Check</Button>
        </div>
      </div>
    );
  }

  if (phase === 'mastery') {
    return (
      <div>
        <p className="mb-4 text-sm font-medium uppercase tracking-wide text-brand-navy-500">Mastery Check</p>
        <SessionRunner
          attemptId={masteryAttemptId}
          questions={masteryQuestions}
          showFeedbackImmediately={false}
          onFinished={async () => {
            const after = await fetchMastery();
            setMasteryAfter(after);
            setPhase('summary');
          }}
        />
      </div>
    );
  }

  // summary
  const improved = masteryAfter !== null && masteryAfter > masteryBefore;
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <p className="font-serif text-2xl font-semibold text-brand-navy-900">Session Complete</p>
        <p className="mt-4 text-lg text-slate-700">
          You {improved ? 'improved' : 'moved'} from{' '}
          <span className="font-semibold">{masteryBefore}%</span> to{' '}
          <span className="font-semibold">{masteryAfter ?? masteryBefore}%</span> in {skillName}.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/dashboard">Back to Dashboard</ButtonLink>
          <Link href="/study-plan" className="inline-flex items-center text-sm font-medium text-brand-navy-700 underline">
            View Study Plan
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * A study-session question runner that stays within the current phase
 * (no route navigation) and reports full per-question results when the
 * set is finished, so the parent can drive Check -> Practice -> Review ->
 * Mastery Check without leaving the page.
 */
function SessionRunner({
  attemptId,
  questions,
  showFeedbackImmediately,
  onFinished,
}: {
  attemptId: string;
  questions: RunnerQuestion[];
  showFeedbackImmediately: boolean;
  onFinished: (items: ReviewItem[]) => void | Promise<void>;
}) {
  const [index, setIndex] = useState(0);
  const [collected, setCollected] = useState<ReviewItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<ReviewItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const question = questions[index];
  const isMultiSelect = question?.type === 'MULTIPLE_SELECT';

  if (!question) {
    return <p className="text-slate-600">No questions available for this section.</p>;
  }

  function toggle(optionId: string) {
    if (feedback) return;
    if (isMultiSelect) {
      setSelected((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]));
    } else {
      setSelected([optionId]);
    }
  }

  async function submit() {
    if (selected.length === 0) return;
    setSubmitting(true);
    const res = await fetch(`/api/attempts/${attemptId}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: question.id, selectedOptionIds: selected }),
    });
    const data = await res.json();
    setSubmitting(false);

    const item: ReviewItem = {
      question,
      isCorrect: data.isCorrect,
      selectedOptionIds: selected,
      correctOptionIds: data.correctOptionIds,
      explanation: data.explanation,
    };
    const nextCollected = [...collected, item];
    setCollected(nextCollected);

    if (showFeedbackImmediately) {
      setFeedback(item);
    } else {
      await advance(nextCollected);
    }
  }

  async function advance(currentCollected: ReviewItem[]) {
    setFeedback(null);
    setSelected([]);
    if (index + 1 >= questions.length) {
      await fetch(`/api/attempts/${attemptId}/complete`, { method: 'POST' });
      await onFinished(currentCollected);
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <p className="mb-4 text-xs font-medium text-slate-500">
          Question {index + 1} of {questions.length}
        </p>
        <p className="text-lg font-medium text-brand-navy-900">{question.prompt}</p>
        <div className="mt-6 space-y-2">
          {question.options.map((option) => {
            const isSelected = selected.includes(option.id);
            const isCorrectOption = feedback?.correctOptionIds.includes(option.id);
            const showAsCorrect = feedback && isCorrectOption;
            const showAsIncorrect = feedback && isSelected && !isCorrectOption;
            return (
              <button
                key={option.id}
                type="button"
                disabled={!!feedback}
                onClick={() => toggle(option.id)}
                className={[
                  'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm',
                  showAsCorrect
                    ? 'border-emerald-400 bg-emerald-50'
                    : showAsIncorrect
                    ? 'border-red-400 bg-red-50'
                    : isSelected
                    ? 'border-brand-navy-500 bg-brand-navy-50'
                    : 'border-brand-navy-100 bg-white hover:bg-brand-navy-50',
                ].join(' ')}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-semibold">
                  {option.label}
                </span>
                {option.text}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div
            className={`mt-5 rounded-lg border p-4 text-sm ${
              feedback.isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            <p className="font-semibold">{feedback.isCorrect ? 'Correct!' : 'Not quite.'}</p>
            <p className="mt-1">{feedback.explanation}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          {feedback ? (
            <Button onClick={() => advance(collected)}>
              {index + 1 >= questions.length ? 'Finish' : 'Next Question'}
            </Button>
          ) : (
            <Button onClick={submit} disabled={selected.length === 0 || submitting}>
              {submitting ? 'Checking…' : index + 1 >= questions.length ? 'Finish' : 'Next Question'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
