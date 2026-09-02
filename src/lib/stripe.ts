import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Lazily constructed so the app (and `next build`) can boot without Stripe
 * configured; only code paths that actually collect a payment need the key.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!_stripe) {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not set");
      }
      _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return Reflect.get(_stripe, prop, _stripe);
  },
});
