import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';

export async function GET(_req: NextRequest, { params }: { params: { skillId: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const record = await prisma.masteryRecord.findUnique({
    where: { userId_skillId: { userId: session.user.id, skillId: params.skillId } },
  });

  return NextResponse.json({ masteryScore: Math.round(record?.masteryScore ?? 0) });
}
