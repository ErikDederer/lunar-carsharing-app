import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

// loadStripe() fetches Stripe.js once and caches the connection — calling
// it more than once per page just wastes a request, so we memoize it here
// the same way Stripe's own docs recommend.
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    stripePromise = loadStripe(key ?? '');
  }
  return stripePromise;
}
