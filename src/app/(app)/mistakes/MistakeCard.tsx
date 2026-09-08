'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toggleFavoriteMistake, hideMistake } from './actions';

interface Option {
  id: string;
  label: string;
  text: string;
}

export function MistakeCard({
  attemptId,
  questionId,
  prompt,
  options,
  domainName,
  skillName,
  skillId,
  timesMissed,
  lastMissedAt,
  favorited,
}: {
  attemptId: string;
  questionId: string;
  prompt: string;
  options: Option[];
  domainName: string;
  skillName: string;
  skillId: string;
  timesMissed: number;
  lastMissedAt: string;
  favorited: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [retrying, setRetrying] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{ isCorrect: boolean; explanation: string; correctOptionIds: string[] } | null>(null);
  const [isFavorited, setIsFavorited] = useState(favorited);

  async function submitRetry() {
    if (!selected) return;
    const res = await fetch(`/api/attempts/${attemptId}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, selectedOptionIds: [selected] }),
    });
    const data = await res.json();
    setResult(data);
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">
              {domainName} &rsaquo; {skillName}
            </p>
            <p className="mt-1 font-medium text-brand-navy-900">{prompt}</p>
          </div>
          <Badge variant="warning">Missed {timesMissed}x</Badge>
        </div>
        <p className="mt-1 text-xs text-slate-400">Last missed {new Date(lastMissedAt).toLocaleDateString()}</p>

        {retrying && !result && (
          <div className="mt-4 space-y-2">
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setSelected(o.id)}
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm ${
                  selected === o.id ? 'border-brand-navy-500 bg-brand-navy-50' : 'border-brand-navy-100 hover:bg-brand-navy-50'
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs">
                  {o.label}
                </span>
                {o.text}
              </button>
            ))}
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={submitRetry} disabled={!selected}>
                Submit
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div
            className={`mt-4 rounded-lg border p-3 text-sm ${
              result.isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            <p className="font-semibold">{result.isCorrect ? 'Correct!' : 'Still not quite.'}</p>
            <p className="mt-1">{result.explanation}</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {!retrying && !result && (
            <Button size="sm" variant="outline" onClick={() => setRetrying(true)}>
              Retry
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsFavorited((f) => !f);
              startTransition(() => toggleFavoriteMistake(questionId));
            }}
          >
            {isFavorited ? '★ Favorited' : '☆ Favorite'}
          </Button>
          <Button size="sm" variant="ghost" disabled={isPending} onClick={() => startTransition(() => hideMistake(questionId))}>
            Hide
          </Button>
          <a href={`/study/${skillId}?mode=practice`} className="inline-flex items-center text-sm text-brand-navy-700 underline">
            Practice similar questions
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
