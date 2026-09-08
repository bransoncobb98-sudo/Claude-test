import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { evaluateAndRecordResponse } from '@/lib/response-engine';

export async function POST(req: NextRequest, { params }: { params: { attemptId: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const attempt = await prisma.attempt.findUnique({ where: { id: params.attemptId } });
  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.questionId) {
    return NextResponse.json({ error: 'questionId is required' }, { status: 400 });
  }

  const result = await evaluateAndRecordResponse({
    attemptId: attempt.id,
    questionId: body.questionId,
    selectedOptionIds: body.selectedOptionIds ?? [],
    orderedOptionIds: body.orderedOptionIds ?? [],
    shortAnswerText: body.shortAnswerText,
    timeSpentSeconds: body.timeSpentSeconds ?? 0,
    confidence: body.confidence,
  });

  return NextResponse.json(result);
}
