'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

export async function toggleFavoriteMistake(questionId: string) {
  const user = await requireUser();
  const mistake = await prisma.mistake.findUnique({ where: { userId_questionId: { userId: user.id, questionId } } });
  if (!mistake) return;
  await prisma.mistake.update({ where: { id: mistake.id }, data: { favorited: !mistake.favorited } });
  revalidatePath('/mistakes');
}

export async function hideMistake(questionId: string) {
  const user = await requireUser();
  await prisma.mistake.update({
    where: { userId_questionId: { userId: user.id, questionId } },
    data: { hidden: true },
  });
  revalidatePath('/mistakes');
}
