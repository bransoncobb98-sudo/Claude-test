'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { TEXES_QUESTION_DISCLAIMER } from '@/lib/constants';

export interface RunnerOption {
  id: string;
  label: string;
  text: string;
}

export interface RunnerQuestion {
  id: string;
  prompt: string;
  type: string;
  difficulty: number;
  imageUrl?: string | null;
  options: RunnerOption[];
}

interface ResponseResult {
  questionId: string;
  isCorrect: boolean;
  correctOptionIds: string[];
  explanation: string;
  selectedOptionIds: string[];
}

export function QuestionRunner({
  attemptId,
  questions,
  showFeedbackImmediately,
  onComplete,
  completeHref,
  flaggedIds,
  onToggleFlag,
}: {
  attemptId: string;
  questions: RunnerQuestion[];
  showFeedbackImmediately: boolean;
  onComplete: () => Promise<void> | void;
  completeHref: string;
  flaggedIds?: Set<string>;
  onToggleFlag?: (questionId: string) => void;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<ResponseResult | null>(null);
  const [results, setResults] = useState<ResponseResult[]>([]);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [finishing, setFinishing] = useState(false);
  const [completeError, setCompleteError] = useState(false);

  const question = questions[index];
  const isMultiSelect = question?.type === 'MULTIPLE_SELECT';
  const progress = useMemo(() => (index / questions.length) * 100, [index, questions.length]);

  function toggleOption(optionId: string) {
    if (feedback) return;
    if (isMultiSelect) {
      setSelected((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]));
    } else {
      setSelected([optionId]);
    }
  }

  async function submitAnswer() {
    if (selected.length === 0 || !question || submitting || finishing) return;
    setSubmitting(true);
    const timeSpentSeconds = Math.round((Date.now() - startedAt) / 1000);

    const res = await fetch(`/api/attempts/${attemptId}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: question.id, selectedOptionIds: selected, timeSpentSeconds }),
    });
    const data = await res.json();
    setSubmitting(false);

    const result: ResponseResult = {
      questionId: question.id,
      isCorrect: data.isCorrect,
      correctOptionIds: data.correctOptionIds,
      explanation: data.explanation,
      selectedOptionIds: selected,
    };
    setResults((prev) => [...prev, result]);

    if (showFeedbackImmediately) {
      setFeedback(result);
    } else {
      await advance();
    }
  }

  async function advance() {
    setFeedback(null);
    setSelected([]);
    setStartedAt(Date.now());
    if (index + 1 >= questions.length) {
      setFinishing(true);
      setCompleteError(false);
      try {
        await onComplete();
        router.push(completeHref);
        router.refresh();
      } catch {
        setFinishing(false);
        setCompleteError(true);
      }
    } else {
      setIndex((i) => i + 1);
    }
  }

  if (!question) {
    return <p className="text-slate-600">No questions available for this session.</p>;
  }

  if (completeError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-slate-700">
            Something went wrong finishing this session. Your answers were saved — please try again.
          </p>
          <Button onClick={() => advance()} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <ProgressBar
        value={progress}
        label={`Question ${index + 1} of ${questions.length}`}
        className="mb-6"
      />
      <Card>
        <CardContent className="p-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <Badge variant="neutral">Difficulty {question.difficulty}/5</Badge>
            {onToggleFlag && (
              <button
                type="button"
                onClick={() => onToggleFlag(question.id)}
                className={`text-xs font-medium underline ${
                  flaggedIds?.has(question.id) ? 'text-amber-700' : 'text-slate-400'
                }`}
              >
                {flaggedIds?.has(question.id) ? '🚩 Flagged for review' : 'Flag for review'}
              </button>
            )}
          </div>
          <p className="text-lg font-medium text-brand-navy-900">{question.prompt}</p>
          {question.imageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={question.imageUrl} alt="" className="mt-4 max-h-72 rounded-lg" />
          )}

          <div className="mt-6 space-y-2" role={isMultiSelect ? 'group' : 'radiogroup'} aria-label="Answer options">
            {question.options.map((option) => {
              const isSelected = selected.includes(option.id);
              const isCorrectOption = feedback?.correctOptionIds.includes(option.id);
              const showAsCorrect = feedback && isCorrectOption;
              const showAsIncorrect = feedback && isSelected && !isCorrectOption;

              return (
                <button
                  key={option.id}
                  type="button"
                  role={isMultiSelect ? 'checkbox' : 'radio'}
                  aria-checked={isSelected}
                  disabled={!!feedback}
                  onClick={() => toggleOption(option.id)}
                  className={[
                    'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
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

          <p className="mt-4 text-xs text-slate-400">{TEXES_QUESTION_DISCLAIMER}</p>

          <div className="mt-6 flex justify-end gap-3">
            {feedback ? (
              <Button onClick={advance} disabled={finishing}>
                {index + 1 >= questions.length ? 'Finish' : 'Next Question'}
              </Button>
            ) : (
              <Button onClick={submitAnswer} disabled={selected.length === 0 || submitting}>
                {submitting ? 'Checking…' : 'Submit Answer'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
