import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { createDomain, togglePublish, updateExam } from '../../content-actions';

export default async function AdminExamDetailPage({ params }: { params: { examId: string } }) {
  const exam = await prisma.exam.findUnique({
    where: { id: params.examId },
    include: { domains: { include: { objectives: true }, orderBy: { order: 'asc' } } },
  });
  if (!exam) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/exams" className="text-sm text-brand-navy-600 underline">
          &larr; All Exams
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">{exam.name}</h1>
          <Badge variant={exam.published ? 'success' : 'neutral'}>{exam.published ? 'Published' : 'Draft'}</Badge>
          <form action={togglePublish.bind(null, 'exam', exam.id, `/admin/exams/${exam.id}`)}>
            <Button type="submit" size="sm" variant="outline">
              {exam.published ? 'Unpublish' : 'Publish'}
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="font-medium text-brand-navy-900">Edit Exam</p>
          <form action={updateExam.bind(null, exam.id)} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={exam.name} required />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={exam.slug} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} defaultValue={exam.description ?? ''} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" defaultChecked={exam.published} /> Published
            </label>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <p className="font-medium text-brand-navy-900">Domains</p>
        <div className="mt-3 grid gap-3">
          {exam.domains.map((domain) => (
            <Link key={domain.id} href={`/admin/domains/${domain.id}`}>
              <Card className="hover:border-brand-navy-300">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-brand-navy-900">{domain.name}</p>
                    <p className="text-xs text-slate-500">{domain.objectives.length} objective(s)</p>
                  </div>
                  <Badge variant={domain.published ? 'success' : 'neutral'}>{domain.published ? 'Published' : 'Draft'}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="font-medium text-brand-navy-900">Add Domain</p>
          <form action={createDomain} className="mt-4 space-y-4">
            <input type="hidden" name="examId" value={exam.id} />
            <div>
              <Label htmlFor="d-name">Name</Label>
              <Input id="d-name" name="name" required />
            </div>
            <div>
              <Label htmlFor="d-slug">Slug</Label>
              <Input id="d-slug" name="slug" required />
            </div>
            <div>
              <Label htmlFor="d-description">Description</Label>
              <Textarea id="d-description" name="description" rows={2} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" /> Publish immediately
            </label>
            <Button type="submit">Add Domain</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
