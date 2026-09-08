import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { getAccessStatus } from '@/lib/access';
import { isStripeConfigured } from '@/lib/stripe';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PurchaseForm } from './PurchaseForm';

export default async function AccountPage({ searchParams }: { searchParams: { reason?: string } }) {
  const user = await requireUser();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const status = await getAccessStatus(user.id, profile?.targetExamId ?? undefined);

  const products = await prisma.product.findMany({ where: { active: true }, orderBy: { durationDays: 'asc' } });
  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">Account &amp; Access</h1>

      {searchParams.reason === 'access-required' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          That feature requires an active access plan. Purchase access below to continue.
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <p className="font-medium text-brand-navy-900">Current Access</p>
          {user.role === 'ADMIN' ? (
            <Badge variant="success" className="mt-2">
              Free Administrator Access
            </Badge>
          ) : status.active ? (
            <>
              <Badge variant="success" className="mt-2">
                Active
              </Badge>
              <p className="mt-2 text-sm text-slate-600">
                Your access is valid through {status.grant?.expiresAt.toLocaleDateString()}{' '}
                ({status.daysRemaining} days remaining).
              </p>
            </>
          ) : (
            <>
              <Badge variant="danger" className="mt-2">
                {status.grant ? 'Expired' : 'No Active Access'}
              </Badge>
              <p className="mt-2 text-sm text-slate-600">
                {status.grant
                  ? `Your access expired on ${status.grant.expiresAt.toLocaleDateString()}.`
                  : 'Purchase access below to unlock the diagnostic, study sessions, and practice exams.'}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {user.role !== 'ADMIN' && (
        <Card>
          <CardContent className="p-6">
            <p className="font-medium text-brand-navy-900">Purchase / Renew Access</p>
            {!isStripeConfigured() && (
              <p className="mt-2 rounded-lg bg-brand-gold-100 p-3 text-xs text-brand-gold-800">
                Demo mode: Stripe is not configured in this environment, so purchases here grant
                access immediately without a real charge.
              </p>
            )}
            <div className="mt-4">
              <PurchaseForm
                products={products.map((p) => ({
                  id: p.id,
                  name: p.name,
                  description: p.description,
                  priceCents: p.priceCents,
                  durationDays: p.durationDays,
                }))}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {purchases.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="font-medium text-brand-navy-900">Payment History</p>
            <ul className="mt-3 divide-y divide-brand-navy-50 text-sm">
              {purchases.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span>
                    {p.product.name} &middot; {p.createdAt.toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-2">
                    <span>${(p.amountCents / 100).toFixed(2)}</span>
                    <Badge variant={p.status === 'PAID' ? 'success' : p.status === 'PENDING' ? 'warning' : 'danger'}>
                      {p.status}
                    </Badge>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
