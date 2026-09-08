import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import type { Product, Purchase } from '@prisma/client';

export function computeDiscountedAmountCents(
  priceCents: number,
  coupon: { discountType: 'PERCENT' | 'FIXED'; amount: number } | null
): number {
  if (!coupon) return priceCents;
  if (coupon.discountType === 'PERCENT') {
    return Math.max(0, Math.round(priceCents * (1 - coupon.amount / 100)));
  }
  return Math.max(0, priceCents - coupon.amount);
}

/** Creates the AccessGrant for a paid Purchase. Called from both the dev-mode
 * checkout fallback and the real Stripe webhook so the entitlement logic
 * lives in exactly one place. */
export async function grantAccessForPurchase(purchase: Purchase, product: Product) {
  const startDate = new Date();
  const expiresAt = new Date(startDate.getTime() + product.durationDays * 24 * 60 * 60 * 1000);

  const grant = await prisma.accessGrant.upsert({
    where: { purchaseId: purchase.id },
    update: { startDate, expiresAt, revoked: false },
    create: {
      userId: purchase.userId,
      productId: product.id,
      purchaseId: purchase.id,
      examId: product.examId,
      source: 'PURCHASE',
      startDate,
      expiresAt,
    },
  });

  const user = await prisma.user.findUnique({ where: { id: purchase.userId } });
  if (user) {
    sendEmail(user.email, {
      type: 'PURCHASE_CONFIRMATION',
      firstName: user.firstName,
      productName: product.name,
      amountCents: purchase.amountCents,
      expiresAt,
    }).catch(() => {});
  }

  return grant;
}
