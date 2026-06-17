/**
 * Abonnement SaaS Factoni — activable via STRIPE_BILLING_ENABLED=true
 */

export const STRIPE_BILLING_ENABLED =
  process.env.STRIPE_BILLING_ENABLED === "true";

/** Alias historique */
export const STRIPE_ENABLED = STRIPE_BILLING_ENABLED;

export const STRIPE_WEBHOOK_PATH = "/api/webhooks/stripe" as const;

export const BILLING_CHECKOUT_PLANS = ["starter", "pro"] as const;
export type BillingCheckoutPlan = (typeof BILLING_CHECKOUT_PLANS)[number];

/** Price IDs Stripe — Dashboard → Produits → prix récurrents */
export const STRIPE_PRICE_IDS: Record<BillingCheckoutPlan, string> = {
  starter: process.env.STRIPE_PRICE_STARTER_MONTHLY?.trim() ?? "",
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY?.trim() ?? "",
};

const PRICE_ID_TO_PLAN = new Map<string, BillingCheckoutPlan>([
  [STRIPE_PRICE_IDS.starter, "starter"],
  [STRIPE_PRICE_IDS.pro, "pro"],
]);

export function getStripePriceIdForPlan(
  plan: BillingCheckoutPlan,
): string | null {
  const priceId = STRIPE_PRICE_IDS[plan];
  return priceId || null;
}

export function getPlanForStripePriceId(
  priceId: string | null | undefined,
): BillingCheckoutPlan | null {
  if (!priceId?.trim()) return null;
  return PRICE_ID_TO_PLAN.get(priceId.trim()) ?? null;
}

export function isBillingStripeConfigured(): boolean {
  return (
    STRIPE_BILLING_ENABLED &&
    Boolean(process.env.STRIPE_SECRET_KEY?.trim()) &&
    Boolean(getStripeBillingWebhookSecret()) &&
    Boolean(STRIPE_PRICE_IDS.starter) &&
    Boolean(STRIPE_PRICE_IDS.pro)
  );
}

export function getStripeBillingWebhookSecret(): string {
  return (
    process.env.STRIPE_BILLING_WEBHOOK_SECRET?.trim() ||
    process.env.STRIPE_WEBHOOK_SECRET_BILLING?.trim() ||
    ""
  );
}

/** @deprecated Préférer isBillingStripeConfigured */
export function isStripeConfigured(): boolean {
  return isBillingStripeConfigured();
}
