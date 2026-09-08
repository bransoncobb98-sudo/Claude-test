import Stripe from 'stripe';

let client: Stripe | null | undefined;

/** Returns null (never throws) when Stripe isn't configured, so routes can degrade gracefully in dev/demo. */
export function getStripeClient(): Stripe | null {
  if (client !== undefined) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  client = key ? new Stripe(key, { apiVersion: '2024-06-20' }) : null;
  return client;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
