import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { completeAttempt } from '@/lib/response-engine';

export async function POST(_req: NextRequest, { params }: { params: { attemptId: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const attempt = await prisma.attempt.findUnique({ where: { id: params.attemptId } });
  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }

  const updated = await completeAttempt(attempt.id);
  return NextResponse.json({ id: updated.id, score: updated.score });
}
