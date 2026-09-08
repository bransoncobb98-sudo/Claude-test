'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/session';

export async function toggleSuspendUser(userId: string) {
  const admin = await requireAdmin();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  await prisma.user.update({ where: { id: userId }, data: { suspended: !user.suspended } });
  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      action: user.suspended ? 'UNSUSPEND_USER' : 'SUSPEND_USER',
      entityType: 'User',
      entityId: userId,
    },
  });
  revalidatePath('/admin/users');
}

export async function grantAdminAccess(formData: FormData) {
  const admin = await requireAdmin();
  const userId = formData.get('userId')?.toString();
  const durationDays = Number(formData.get('durationDays') ?? 365);
  const examId = formData.get('examId')?.toString() || null;
  if (!userId) throw new Error('userId is required');

  const startDate = new Date();
  const expiresAt = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  await prisma.accessGrant.create({
    data: { userId, examId, source: 'ADMIN_GRANT', startDate, expiresAt },
  });
  await prisma.auditLog.create({
    data: { actorUserId: admin.id, action: 'GRANT_ACCESS', entityType: 'User', entityId: userId, metadata: { durationDays, examId } },
  });
  revalidatePath('/admin/users');
}
