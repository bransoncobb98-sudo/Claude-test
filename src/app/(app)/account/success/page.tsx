import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { Card, CardContent } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string; demo?: string };
}) {
  const user = await requireUser();

  let accessActive = false;
  if (searchParams.session_id) {
    const purchase = await prisma.purchase.findUnique({ where: { stripeSessionId: searchParams.session_id } });
    accessActive = purchase?.status === 'PAID';
  } else if (searchParams.demo) {
    accessActive = true;
  }

  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <Card>
        <CardContent className="p-8">
          <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">
            {accessActive ? 'You&rsquo;re all set!' : 'Payment received'}
          </h1>
          <p className="mt-3 text-slate-600">
            {accessActive
              ? 'Your access has been activated. Take your diagnostic to build your personalized study plan.'
              : "Your payment was received, but we're still activating your access. Please refresh in a moment."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <ButtonLink href="/dashboard">Go to Dashboard</ButtonLink>
            {!accessActive && <ButtonLink href="/account/success" variant="outline">Refresh</ButtonLink>}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Signed in as {user.email}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
