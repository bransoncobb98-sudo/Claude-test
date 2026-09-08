import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export interface AccessStatus {
  active: boolean;
  grant: Awaited<ReturnType<typeof prisma.accessGrant.findFirst>> | null;
  daysRemaining: number | null;
  expiringSoon: 30 | 7 | 1 | null;
}

/**
 * The single place that decides whether a user currently has paid access.
 * "Active" is always computed at query time (expiresAt > now, not revoked)
 * rather than cached on a boolean column, so it can never drift.
 */
export async function getAccessStatus(userId: string, examId?: string): Promise<AccessStatus> {
  const now = new Date();

  const grants = await prisma.accessGrant.findMany({
    where: {
      userId,
      revoked: false,
      OR: [{ examId: null }, ...(examId ? [{ examId }] : [])],
    },
    orderBy: { expiresAt: 'desc' },
  });

  const activeGrant = grants.find((g) => g.expiresAt > now) ?? null;

  if (!activeGrant) {
    // Still report the most-recently-expired grant so we can show a
    // "your access expired on X" message instead of a generic paywall.
    const mostRecentlyExpired = grants[0] ?? null;
    return { active: false, grant: mostRecentlyExpired, daysRemaining: null, expiringSoon: null };
  }

  const msRemaining = activeGrant.expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  let expiringSoon: 30 | 7 | 1 | null = null;
  if (daysRemaining <= 1) expiringSoon = 1;
  else if (daysRemaining <= 7) expiringSoon = 7;
  else if (daysRemaining <= 30) expiringSoon = 30;

  return { active: true, grant: activeGrant, daysRemaining, expiringSoon };
}

export async function hasActiveAccess(userId: string, examId?: string): Promise<boolean> {
  const status = await getAccessStatus(userId, examId);
  return status.active;
}

/**
 * Gate for paid-content pages (diagnostic, study sessions, practice exams).
 * Admins always pass (free admin access per the product brief). Anyone
 * without an active AccessGrant is redirected to the renew/purchase page.
 */
export async function requireActiveAccess(
  user: { id: string; role: 'STUDENT' | 'ADMIN' },
  examId?: string
) {
  if (user.role === 'ADMIN') return;
  const active = await hasActiveAccess(user.id, examId);
  if (!active) redirect('/account?reason=access-required');
}
