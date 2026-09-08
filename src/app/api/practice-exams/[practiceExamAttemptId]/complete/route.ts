import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { completePracticeExamAttempt } from '@/lib/practice-exam-engine';

export async function POST(req: NextRequest, { params }: { params: { practiceExamAttemptId: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const attempt = await prisma.practiceExamAttempt.findUnique({ where: { id: params.practiceExamAttemptId } });
  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const updated = await completePracticeExamAttempt(attempt.id, body?.flaggedQuestionIds ?? []);

  return NextResponse.json({ id: updated.id, score: updated.score });
}
