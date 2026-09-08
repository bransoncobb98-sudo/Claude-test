import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { submitOnboarding } from './actions';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const GOALS: { value: string; label: string }[] = [
  { value: 'NEED_TO_PASS', label: 'I need to pass my exam.' },
  { value: 'HAVE_NOT_TAKEN_YET', label: 'I have not taken the exam yet.' },
  { value: 'FAILED_PREVIOUSLY', label: 'I failed previously and need targeted preparation.' },
  { value: 'ASSESS_READINESS', label: 'I want to assess my readiness.' },
  { value: 'STUDYING_WHILE_WORKING', label: 'I am studying while working full-time.' },
];

export default async function OnboardingPage() {
  const user = await requireUser();
  const exams = await prisma.exam.findMany({ where: { published: true }, orderBy: { name: 'asc' } });
  const existingProfile = await prisma.profile.findUnique({ where: { userId: user.id } });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-brand-navy-900">
        Welcome, {user.firstName}. Let&rsquo;s build your pathway.
      </h1>
      <p className="mt-2 text-slate-600">
        A few quick questions so we can point your diagnostic and study plan in the right
        direction.
      </p>

      <Card className="mt-8">
        <CardContent className="p-6">
          <form action={submitOnboarding} className="space-y-6">
            <div>
              <Label htmlFor="targetExamId">Which exam are you preparing for?</Label>
              <Select
                id="targetExamId"
                name="targetExamId"
                required
                defaultValue={existingProfile?.targetExamId ?? ''}
              >
                <option value="" disabled>
                  Select an exam
                </option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="certificationArea">Certification area</Label>
              <Input
                id="certificationArea"
                name="certificationArea"
                required
                placeholder="e.g., Theatre EC-12"
                defaultValue={existingProfile?.certificationArea ?? ''}
              />
            </div>

            <div>
              <Label htmlFor="testDate">Testing date (if known)</Label>
              <Input
                id="testDate"
                name="testDate"
                type="date"
                defaultValue={existingProfile?.testDate?.toISOString().slice(0, 10) ?? ''}
              />
            </div>

            <div>
              <Label htmlFor="teachingExperience">Current teaching experience</Label>
              <Input
                id="teachingExperience"
                name="teachingExperience"
                placeholder="e.g., 3 years, middle school theatre"
                defaultValue={existingProfile?.teachingExperience ?? ''}
              />
            </div>

            <div>
              <Label htmlFor="priorAttempts">Prior exam attempts (if applicable)</Label>
              <Input
                id="priorAttempts"
                name="priorAttempts"
                type="number"
                min={0}
                max={10}
                defaultValue={existingProfile?.priorAttempts ?? 0}
              />
            </div>

            <div>
              <Label htmlFor="confidenceRating">
                How confident do you feel right now? (1 = not at all, 5 = very confident)
              </Label>
              <Select
                id="confidenceRating"
                name="confidenceRating"
                defaultValue={existingProfile?.confidenceRating?.toString() ?? '3'}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </div>

            <fieldset>
              <legend className="mb-2 block text-sm font-medium text-brand-navy-900">
                What is your goal?
              </legend>
              <div className="space-y-2">
                {GOALS.map((g) => (
                  <label
                    key={g.value}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-brand-navy-100 p-3 text-sm hover:bg-brand-navy-50"
                  >
                    <input
                      type="radio"
                      name="goal"
                      value={g.value}
                      required
                      defaultChecked={
                        existingProfile?.goal === g.value || (!existingProfile && g.value === 'ASSESS_READINESS')
                      }
                      className="mt-0.5"
                    />
                    {g.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <Label htmlFor="goalDetails">Anything else about your goals? (optional)</Label>
              <Textarea
                id="goalDetails"
                name="goalDetails"
                rows={3}
                defaultValue={existingProfile?.goalDetails ?? ''}
              />
            </div>

            <Button type="submit" className="w-full justify-center">
              Continue to Diagnostic
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
