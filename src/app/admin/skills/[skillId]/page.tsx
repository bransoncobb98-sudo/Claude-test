import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { createLesson, togglePublish, updateSkill } from '../../content-actions';

export default async function AdminSkillDetailPage({ params }: { params: { skillId: string } }) {
  const skill = await prisma.skill.findUnique({
    where: { id: params.skillId },
    include: {
      objective: true,
      lessons: { orderBy: { order: 'asc' } },
      questions: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!skill) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/admin/objectives/${skill.objectiveId}`} className="text-sm text-brand-navy-600 underline">
          &larr; {skill.objective.name}
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">{skill.name}</h1>
          <Badge variant={skill.published ? 'success' : 'neutral'}>{skill.published ? 'Published' : 'Draft'}</Badge>
          <form action={togglePublish.bind(null, 'skill', skill.id, `/admin/skills/${skill.id}`)}>
            <Button type="submit" size="sm" variant="outline">
              {skill.published ? 'Unpublish' : 'Publish'}
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="font-medium text-brand-navy-900">Edit Skill</p>
          <form action={updateSkill.bind(null, skill.id, skill.objectiveId)} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={skill.name} required />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={skill.slug} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} defaultValue={skill.description ?? ''} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" defaultChecked={skill.published} /> Published
            </label>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <p className="font-medium text-brand-navy-900">Lessons</p>
        <div className="mt-3 grid gap-3">
          {skill.lessons.map((lesson) => (
            <Card key={lesson.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-brand-navy-900">{lesson.title}</p>
                  {lesson.isDemo && <Badge variant="demo" className="mt-1">DEMO</Badge>}
                </div>
                <form action={togglePublish.bind(null, 'lesson', lesson.id, `/admin/skills/${skill.id}`)}>
                  <Button type="submit" size="sm" variant="outline">
                    {lesson.published ? 'Unpublish' : 'Publish'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
          {skill.lessons.length === 0 && <p className="text-sm text-slate-500">No lessons yet.</p>}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="font-medium text-brand-navy-900">Add Lesson</p>
          <form action={createLesson} className="mt-4 space-y-4">
            <input type="hidden" name="skillId" value={skill.id} />
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" rows={6} required />
            </div>
            <div>
              <Label htmlFor="keyConcepts">Key concepts (comma-separated)</Label>
              <Input id="keyConcepts" name="keyConcepts" placeholder="Concept 1, Concept 2" />
            </div>
            <div>
              <Label htmlFor="example">Example</Label>
              <Textarea id="example" name="example" rows={3} />
            </div>
            <div>
              <Label htmlFor="videoUrl">Video URL (optional)</Label>
              <Input id="videoUrl" name="videoUrl" type="url" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" /> Publish immediately
            </label>
            <Button type="submit">Add Lesson</Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between">
          <p className="font-medium text-brand-navy-900">Questions ({skill.questions.length})</p>
          <ButtonLink href={`/admin/questions/new?skillId=${skill.id}`} size="sm">
            Add Question
          </ButtonLink>
        </div>
        <div className="mt-3 grid gap-3">
          {skill.questions.map((question) => (
            <Card key={question.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-brand-navy-900">{question.prompt}</p>
                  <div className="mt-1 flex gap-2">
                    {question.isDemo && <Badge variant="demo">DEMO</Badge>}
                    <Badge variant="neutral">Difficulty {question.difficulty}/5</Badge>
                  </div>
                </div>
                <form action={togglePublish.bind(null, 'question', question.id, `/admin/skills/${skill.id}`)}>
                  <Button type="submit" size="sm" variant="outline">
                    {question.published ? 'Unpublish' : 'Publish'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
          {skill.questions.length === 0 && <p className="text-sm text-slate-500">No questions yet.</p>}
        </div>
      </div>
    </div>
  );
}
