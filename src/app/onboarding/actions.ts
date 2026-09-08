'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { onboardingSchema } from '@/lib/validation';

export async function submitOnboarding(formData: FormData) {
  const user = await requireUser();

  const raw = {
    certificationArea: formData.get('certificationArea')?.toString() ?? '',
    targetExamId: formData.get('targetExamId')?.toString() ?? '',
    testDate: formData.get('testDate')?.toString() || null,
    teachingExperience: formData.get('teachingExperience')?.toString() || null,
    priorAttempts: formData.get('priorAttempts')?.toString() || null,
    confidenceRating: formData.get('confidenceRating')?.toString() ?? '3',
    goal: formData.get('goal')?.toString() ?? 'ASSESS_READINESS',
    goalDetails: formData.get('goalDetails')?.toString() || null,
  };

  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      'Please complete the required onboarding fields: ' +
        Object.keys(parsed.error.flatten().fieldErrors).join(', ')
    );
  }

  const data = parsed.data;

  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      certificationArea: data.certificationArea,
      targetExamId: data.targetExamId,
      testDate: data.testDate ? new Date(data.testDate) : null,
      teachingExperience: data.teachingExperience,
      priorAttempts: data.priorAttempts ?? null,
      confidenceRating: data.confidenceRating,
      goal: data.goal,
      goalDetails: data.goalDetails,
      onboardingCompletedAt: new Date(),
    },
    update: {
      certificationArea: data.certificationArea,
      targetExamId: data.targetExamId,
      testDate: data.testDate ? new Date(data.testDate) : null,
      teachingExperience: data.teachingExperience,
      priorAttempts: data.priorAttempts ?? null,
      confidenceRating: data.confidenceRating,
      goal: data.goal,
      goalDetails: data.goalDetails,
      onboardingCompletedAt: new Date(),
    },
  });

  redirect('/diagnostic');
}
