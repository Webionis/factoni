import type { FeatureKey, SubscriptionPlan } from "@/lib/billing/types";

/**
 * Limites quantitatives plan gratuit — actives si isLimitsEnforced() (mode lancement).
 */

export interface PlanLimits {
  maxInvoices: number | null;
  maxClients: number | null;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  beta: { maxInvoices: null, maxClients: null },
  free: { maxInvoices: 10, maxClients: 5 },
  starter: { maxInvoices: null, maxClients: null },
  pro: { maxInvoices: null, maxClients: null },
};

export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  limitKey?: "maxInvoices" | "maxClients";
  current?: number;
  max?: number;
}

export function checkInvoiceLimit(
  plan: SubscriptionPlan,
  currentCount: number,
  limitsEnforced: boolean,
): LimitCheckResult {
  if (!limitsEnforced || plan === "beta" || plan === "starter" || plan === "pro") {
    return { allowed: true };
  }

  const { maxInvoices } = PLAN_LIMITS[plan];
  if (maxInvoices === null || currentCount < maxInvoices) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Limite de ${maxInvoices} factures atteinte sur l'offre Gratuit.`,
    limitKey: "maxInvoices",
    current: currentCount,
    max: maxInvoices,
  };
}

export function checkClientLimit(
  plan: SubscriptionPlan,
  currentCount: number,
  limitsEnforced: boolean,
): LimitCheckResult {
  if (!limitsEnforced || plan === "beta" || plan === "starter" || plan === "pro") {
    return { allowed: true };
  }

  const { maxClients } = PLAN_LIMITS[plan];
  if (maxClients === null || currentCount < maxClients) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Limite de ${maxClients} clients atteinte sur l'offre Gratuit.`,
    limitKey: "maxClients",
    current: currentCount,
    max: maxClients,
  };
}

/** Features liées au branding PDF (futur) */
export const PDF_BRANDING_FEATURES = {
  showFactoniBranding: "removeBranding",
  allowCustomLogo: "customLogo",
} as const satisfies Record<string, FeatureKey>;
