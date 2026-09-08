import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { createObjective, togglePublish, updateDomain } from '../../content-actions';

export default async function AdminDomainDetailPage({ params }: { params: { domainId: string } }) {
  const domain = await prisma.domain.findUnique({
    where: { id: params.domainId },
    include: { exam: true, objectives: { include: { skills: true }, orderBy: { order: 'asc' } } },
  });
  if (!domain) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/admin/exams/${domain.examId}`} className="text-sm text-brand-navy-600 underline">
          &larr; {domain.exam.name}
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">{domain.name}</h1>
          <Badge variant={domain.published ? 'success' : 'neutral'}>{domain.published ? 'Published' : 'Draft'}</Badge>
          <form action={togglePublish.bind(null, 'domain', domain.id, `/admin/domains/${domain.id}`)}>
            <Button type="submit" size="sm" variant="outline">
              {domain.published ? 'Unpublish' : 'Publish'}
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="font-medium text-brand-navy-900">Edit Domain</p>
          <form action={updateDomain.bind(null, domain.id, domain.examId)} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={domain.name} required />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={domain.slug} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} defaultValue={domain.description ?? ''} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input id="weight" name="weight" type="number" defaultValue={domain.weight} />
              </div>
              <div>
                <Label htmlFor="order">Order</Label>
                <Input id="order" name="order" type="number" defaultValue={domain.order} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" defaultChecked={domain.published} /> Published
            </label>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <p className="font-medium text-brand-navy-900">Objectives</p>
        <div className="mt-3 grid gap-3">
          {domain.objectives.map((objective) => (
            <Link key={objective.id} href={`/admin/objectives/${objective.id}`}>
              <Card className="hover:border-brand-navy-300">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-brand-navy-900">{objective.code ? `${objective.code} — ` : ''}{objective.name}</p>
                    <p className="text-xs text-slate-500">{objective.skills.length} skill(s)</p>
                  </div>
                  <Badge variant={objective.published ? 'success' : 'neutral'}>{objective.published ? 'Published' : 'Draft'}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="font-medium text-brand-navy-900">Add Objective</p>
          <form action={createObjective} className="mt-4 space-y-4">
            <input type="hidden" name="domainId" value={domain.id} />
            <div>
              <Label htmlFor="code">Code (optional)</Label>
              <Input id="code" name="code" placeholder="1.1" />
            </div>
            <div>
              <Label htmlFor="o-name">Name</Label>
              <Input id="o-name" name="name" required />
            </div>
            <div>
              <Label htmlFor="o-description">Description</Label>
              <Textarea id="o-description" name="description" rows={2} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" /> Publish immediately
            </label>
            <Button type="submit">Add Objective</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
