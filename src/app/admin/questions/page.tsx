import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';

export default async function AdminQuestionsPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim();
  const questions = await prisma.question.findMany({
    where: q ? { prompt: { contains: q, mode: 'insensitive' } } : undefined,
    include: { skill: { include: { objective: { include: { domain: true } } } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">Questions</h1>
        <div className="flex gap-2">
          <ButtonLink href="/admin/questions/import" variant="outline">Import CSV</ButtonLink>
          <ButtonLink href="/admin/questions/new">Add Question</ButtonLink>
        </div>
      </div>

      <form method="get" className="max-w-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search question text"
          className="w-full rounded-lg border border-brand-navy-200 px-3.5 py-2.5 text-sm"
        />
      </form>

      <div className="grid gap-3">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500">
                    {question.skill.objective.domain.name} &rsaquo; {question.skill.name}
                  </p>
                  <p className="mt-1 text-sm text-brand-navy-900">{question.prompt}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {question.isDemo && <Badge variant="demo">DEMO</Badge>}
                  <Badge variant={question.published ? 'success' : 'neutral'}>
                    {question.published ? 'Published' : 'Draft'}
                  </Badge>
                  <Link href={`/admin/skills/${question.skillId}`} className="text-xs text-brand-navy-600 underline">
                    Manage
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {questions.length === 0 && <p className="text-sm text-slate-500">No questions found.</p>}
      </div>
    </div>
  );
}
