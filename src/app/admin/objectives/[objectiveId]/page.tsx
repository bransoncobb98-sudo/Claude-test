import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { createSkill, togglePublish, updateObjective } from '../../content-actions';

export default async function AdminObjectiveDetailPage({ params }: { params: { objectiveId: string } }) {
  const objective = await prisma.objective.findUnique({
    where: { id: params.objectiveId },
    include: { domain: true, skills: { include: { questions: true, lessons: true }, orderBy: { order: 'asc' } } },
  });
  if (!objective) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/admin/domains/${objective.domainId}`} className="text-sm text-brand-navy-600 underline">
          &larr; {objective.domain.name}
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">{objective.name}</h1>
          <Badge variant={objective.published ? 'success' : 'neutral'}>{objective.published ? 'Published' : 'Draft'}</Badge>
          <form action={togglePublish.bind(null, 'objective', objective.id, `/admin/objectives/${objective.id}`)}>
            <Button type="submit" size="sm" variant="outline">
              {objective.published ? 'Unpublish' : 'Publish'}
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="font-medium text-brand-navy-900">Edit Objective</p>
          <form action={updateObjective.bind(null, objective.id, objective.domainId)} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" defaultValue={objective.code ?? ''} />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={objective.name} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} defaultValue={objective.description ?? ''} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" defaultChecked={objective.published} /> Published
            </label>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <p className="font-medium text-brand-navy-900">Skills</p>
        <div className="mt-3 grid gap-3">
          {objective.skills.map((skill) => (
            <Link key={skill.id} href={`/admin/skills/${skill.id}`}>
              <Card className="hover:border-brand-navy-300">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-brand-navy-900">{skill.name}</p>
                    <p className="text-xs text-slate-500">
                      {skill.lessons.length} lesson(s) &middot; {skill.questions.length} question(s)
                    </p>
                  </div>
                  <Badge variant={skill.published ? 'success' : 'neutral'}>{skill.published ? 'Published' : 'Draft'}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="font-medium text-brand-navy-900">Add Skill</p>
          <form action={createSkill} className="mt-4 space-y-4">
            <input type="hidden" name="objectiveId" value={objective.id} />
            <div>
              <Label htmlFor="s-name">Name</Label>
              <Input id="s-name" name="name" required />
            </div>
            <div>
              <Label htmlFor="s-slug">Slug</Label>
              <Input id="s-slug" name="slug" required />
            </div>
            <div>
              <Label htmlFor="s-description">Description</Label>
              <Textarea id="s-description" name="description" rows={2} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" /> Publish immediately
            </label>
            <Button type="submit">Add Skill</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
