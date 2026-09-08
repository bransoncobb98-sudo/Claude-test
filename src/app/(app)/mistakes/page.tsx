import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { startAttempt } from '@/lib/response-engine';
import { Card, CardContent } from '@/components/ui/Card';
import { MistakeCard } from './MistakeCard';

export default async function MistakesPage() {
  const user = await requireUser();

  const mistakes = await prisma.mistake.findMany({
    where: { userId: user.id, hidden: false },
    orderBy: { lastMissedAt: 'desc' },
    include: {
      question: {
        include: {
          options: { orderBy: { order: 'asc' } },
          skill: { include: { objective: { include: { domain: true } } } },
        },
      },
    },
  });

  if (mistakes.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">
          Great work! You don&rsquo;t currently have any missed questions.
        </h1>
        <p className="mt-2 text-slate-600">Keep practicing — anything you miss will show up here for review.</p>
      </div>
    );
  }

  const retryAttempt = await startAttempt({ userId: user.id, type: 'MISTAKE_REVIEW' });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">Your Mistakes</h1>
      <p className="mt-2 text-sm text-slate-600">
        Review, retry, favorite, or hide questions you&rsquo;ve missed.
      </p>
      <div className="mt-6 space-y-4">
        {mistakes.map((m) => (
          <MistakeCard
            key={m.id}
            attemptId={retryAttempt.id}
            questionId={m.questionId}
            prompt={m.question.prompt}
            options={m.question.options.map((o) => ({ id: o.id, label: o.label, text: o.text }))}
            domainName={m.question.skill.objective.domain.name}
            skillName={m.question.skill.name}
            skillId={m.question.skillId}
            timesMissed={m.timesMissed}
            lastMissedAt={m.lastMissedAt.toISOString()}
            favorited={m.favorited}
          />
        ))}
      </div>
    </div>
  );
}
