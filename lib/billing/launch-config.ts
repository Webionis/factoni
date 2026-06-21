import { isBillingStripeConfigured } from "@/lib/billing/stripe/config";

function readTriState(
  value: string | undefined,
): true | false | null {
  const trimmed = value?.trim().toLowerCase();
  if (trimmed === "true" || trimmed === "1" || trimmed === "yes") return true;
  if (trimmed === "false" || trimmed === "0" || trimmed === "no") return false;
  return null;
}

/** Production Vercel ou NODE_ENV=production */
export function isProductionRuntime(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  );
}

/**
 * Mode lancement commercial : gating Starter/Pro actif, nouveaux comptes en free.
 * FACTONI_PRODUCTION_LAUNCH=true|false — sinon auto si prod + billing Stripe configuré.
 */
export function isProductionLaunchActive(): boolean {
  const explicit = readTriState(process.env.FACTONI_PRODUCTION_LAUNCH);
  if (explicit !== null) return explicit;
  return isProductionRuntime() && isBillingStripeConfigured();
}

/**
 * Quotas plan gratuit (10 factures / 5 clients).
 * BILLING_LIMITS_ENFORCED=true|false — sinon suit le mode lancement.
 */
export function isLimitsEnforced(): boolean {
  const explicit = readTriState(process.env.BILLING_LIMITS_ENFORCED);
  if (explicit !== null) return explicit;
  return isProductionLaunchActive();
}

/** Plan par défaut si aucune ligne subscription (ne doit plus arriver après inscription). */
export function getDefaultSubscriptionPlan(): "free" | "beta" {
  return isProductionLaunchActive() ? "free" : "beta";
}
