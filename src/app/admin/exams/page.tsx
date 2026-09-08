import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { createExam } from '../content-actions';

export default async function AdminExamsPage() {
  const exams = await prisma.exam.findMany({
    include: { domains: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">Exams</h1>

      <div className="grid gap-4">
        {exams.map((exam) => (
          <Link key={exam.id} href={`/admin/exams/${exam.id}`}>
            <Card className="transition-colors hover:border-brand-navy-300">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="font-medium text-brand-navy-900">{exam.name}</p>
                  <p className="text-xs text-slate-500">{exam.domains.length} domain(s)</p>
                </div>
                <div className="flex gap-2">
                  {exam.isDemo && <Badge variant="demo">DEMO</Badge>}
                  <Badge variant={exam.published ? 'success' : 'neutral'}>
                    {exam.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="font-medium text-brand-navy-900">Create Exam</p>
          <form action={createExam} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="TExES Music EC-12 (177)" />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" required placeholder="texes-music-177" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" /> Publish immediately
            </label>
            <Button type="submit">Create Exam</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
