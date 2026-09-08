import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { completeAttempt } from '@/lib/response-engine';
import { scoreDiagnostic } from '@/lib/diagnostic-engine';

export async function POST(_req: NextRequest, { params }: { params: { assessmentId: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const assessment = await prisma.diagnosticAssessment.findUnique({
    where: { id: params.assessmentId },
    include: { attempt: true },
  });
  if (!assessment || assessment.userId !== session.user.id) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
  }

  if (assessment.attempt) {
    await completeAttempt(assessment.attempt.id);
  }
  const result = await scoreDiagnostic(assessment.id);

  return NextResponse.json({ resultId: result.id, assessmentId: assessment.id });
}
