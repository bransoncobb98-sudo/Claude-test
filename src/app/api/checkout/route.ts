import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { getStripeClient, isStripeConfigured } from '@/lib/stripe';
import { computeDiscountedAmountCents, grantAccessForPurchase } from '@/lib/commerce';

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const productId = body?.productId as string | undefined;
  const couponCode = body?.couponCode as string | undefined;

  if (!productId) return NextResponse.json({ error: 'productId is required' }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  let coupon = null;
  if (couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase().trim() } });
    if (
      !coupon ||
      !coupon.active ||
      (coupon.expiresAt && coupon.expiresAt < new Date()) ||
      (coupon.maxRedemptions !== null && coupon.timesRedeemed >= coupon.maxRedemptions)
    ) {
      return NextResponse.json({ error: 'This coupon code is invalid or has expired.' }, { status: 400 });
    }
  }

  const amountCents = computeDiscountedAmountCents(product.priceCents, coupon);

  const stripe = getStripeClient();

  if (!isStripeConfigured() || !stripe) {
    // Dev/demo fallback: no Stripe keys configured. We never touch card
    // data here — we simply record the purchase as paid and grant access
    // directly, clearly labeled as demo mode. See docs/development-roadmap.md.
    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        productId: product.id,
        couponId: coupon?.id,
        amountCents,
        status: 'PAID',
      },
    });
    await grantAccessForPurchase(purchase, product);
    if (coupon) {
      await prisma.coupon.update({ where: { id: coupon.id }, data: { timesRedeemed: { increment: 1 } } });
    }
    return NextResponse.json({ url: '/account/success?demo=1', demoMode: true });
  }

  const purchase = await prisma.purchase.create({
    data: {
      userId: session.user.id,
      productId: product.id,
      couponId: coupon?.id,
      amountCents,
      status: 'PENDING',
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: product.name, description: product.description ?? undefined },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    metadata: { purchaseId: purchase.id, userId: session.user.id, productId: product.id },
    success_url: `${appUrl}/account/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/account?checkout=cancelled`,
  });

  await prisma.purchase.update({ where: { id: purchase.id }, data: { stripeSessionId: checkoutSession.id } });

  return NextResponse.json({ url: checkoutSession.url });
}
