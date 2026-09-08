import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { getAccessStatus } from '@/lib/access';
import { AppNav } from '@/components/app/AppNav';
import { AccessBanner } from '@/components/app/AccessBanner';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  if (user.role !== 'ADMIN' && !profile?.onboardingCompletedAt) {
    redirect('/onboarding');
  }

  // Admins have free access per the product brief; students are subject to
  // the real access-window check computed in lib/access.ts.
  const accessStatus =
    user.role === 'ADMIN'
      ? { active: true, grant: null, daysRemaining: null, expiringSoon: null as null }
      : await getAccessStatus(user.id, profile?.targetExamId ?? undefined);

  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppNav firstName={user.firstName} role={user.role} />
      <AccessBanner status={accessStatus} />
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
