import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { createQuestion } from '../../content-actions';

export default async function NewQuestionPage({ searchParams }: { searchParams: { skillId?: string } }) {
  const skills = await prisma.skill.findMany({
    include: { objective: { include: { domain: { include: { exam: true } } } } },
    orderBy: { name: 'asc' },
  });
  const preselected = searchParams.skillId;
  if (preselected && !skills.some((s) => s.id === preselected)) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">Add Question</h1>
      <Card className="mt-6">
        <CardContent className="p-6">
          <form action={createQuestion} className="space-y-4">
            <div>
              <Label htmlFor="skillId">Skill</Label>
              <Select id="skillId" name="skillId" required defaultValue={preselected ?? ''}>
                <option value="" disabled>Select a skill</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.objective.domain.exam.name} &rsaquo; {s.objective.domain.name} &rsaquo; {s.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select id="type" name="type" defaultValue="MULTIPLE_CHOICE">
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="MULTIPLE_SELECT">Multiple Select</option>
                  <option value="SCENARIO">Scenario</option>
                  <option value="IMAGE_BASED">Image-Based</option>
                  <option value="ORDERING">Ordering</option>
                  <option value="MATCHING">Matching</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty (1-5)</Label>
                <Input id="difficulty" name="difficulty" type="number" min={1} max={5} defaultValue={3} />
              </div>
            </div>

            <div>
              <Label htmlFor="topic">Topic (optional)</Label>
              <Input id="topic" name="topic" />
            </div>

            <div>
              <Label htmlFor="prompt">Question Prompt</Label>
              <Textarea id="prompt" name="prompt" rows={3} required />
            </div>

            <fieldset className="space-y-2">
              <legend className="mb-1 text-sm font-medium text-brand-navy-900">Answer Options</legend>
              {['A', 'B', 'C', 'D'].map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-6 text-sm font-semibold">{label}</span>
                  <Input name={`option_${label}`} placeholder={`Option ${label}`} className="flex-1" />
                  <label className="flex items-center gap-1 text-xs">
                    <input type="radio" name="correctOption" value={label} required={label === 'A'} /> Correct
                  </label>
                </div>
              ))}
            </fieldset>

            <div>
              <Label htmlFor="explanation">Explanation (required)</Label>
              <Textarea
                id="explanation"
                name="explanation"
                rows={4}
                required
                placeholder="Explain why the correct answer is correct and why each distractor is incorrect."
              />
            </div>

            <div>
              <Label htmlFor="source">Source / reference (optional)</Label>
              <Input id="source" name="source" />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" name="tags" placeholder="lighting, stagecraft" />
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input id="imageUrl" name="imageUrl" type="url" />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" /> Publish immediately
            </label>

            <Button type="submit" className="w-full justify-center">
              Create Question
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
