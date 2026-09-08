import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStripeClient } from '@/lib/stripe';
import { grantAccessForPurchase } from '@/lib/commerce';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe is not configured on this deployment.' }, { status: 503 });
  }

  const signature = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature ?? '', webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${(err as Error).message}` }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const purchaseId = session.metadata?.purchaseId;
      if (!purchaseId) break;

      const purchase = await prisma.purchase.update({
        where: { id: purchaseId },
        data: { status: 'PAID', stripePaymentIntentId: session.payment_intent as string | null },
      });
      const product = await prisma.product.findUniqueOrThrow({ where: { id: purchase.productId } });
      await grantAccessForPurchase(purchase, product);
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string | null;
      if (!paymentIntentId) break;

      const purchase = await prisma.purchase.findUnique({ where: { stripePaymentIntentId: paymentIntentId } });
      if (!purchase) break;

      await prisma.purchase.update({ where: { id: purchase.id }, data: { status: 'REFUNDED' } });
      await prisma.accessGrant.updateMany({ where: { purchaseId: purchase.id }, data: { revoked: true } });
      break;
    }
    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const purchaseId = session.metadata?.purchaseId;
      if (!purchaseId) break;
      await prisma.purchase.update({ where: { id: purchaseId }, data: { status: 'FAILED' } });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
