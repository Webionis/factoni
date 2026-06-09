/**
 * Configuration Stripe — désactivée pendant la bêta.
 * Activer STRIPE_ENABLED + clés au lancement des offres payantes.
 */

export const STRIPE_ENABLED = false;

export const STRIPE_WEBHOOK_PATH = "/api/webhooks/stripe" as const;

/** Price IDs Stripe (à renseigner lors de l'intégration) */
export const STRIPE_PRICE_IDS = {
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? "",
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
} as const;

export function isStripeConfigured(): boolean {
  return (
    STRIPE_ENABLED &&
    Boolean(process.env.STRIPE_SECRET_KEY?.trim()) &&
    Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim())
  );
}
