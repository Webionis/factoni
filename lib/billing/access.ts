import { resolvePlanFeatures } from "@/lib/billing/features";
import { getDefaultSubscriptionPlan, isLimitsEnforced } from "@/lib/billing/launch-config";
import type {
  FeatureKey,
  PlanFeatures,
  SubscriptionAccess,
  SubscriptionPlan,
  SubscriptionRow,
  SubscriptionStatus,
} from "@/lib/billing/types";

/** @deprecated Utiliser isLimitsEnforced() depuis launch-config */
export { isLimitsEnforced as LIMITS_ENFORCED } from "@/lib/billing/launch-config";

const ACTIVE_STATUSES: SubscriptionStatus[] = ["active", "trialing"];

export function isActiveStatus(status: SubscriptionStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export function isBetaPlan(plan: SubscriptionPlan): boolean {
  return plan === "beta";
}

export function getCurrentPlan(
  subscription: SubscriptionRow | null | undefined,
): SubscriptionPlan {
  return subscription?.plan ?? getDefaultSubscriptionPlan();
}

export function getCurrentStatus(
  subscription: SubscriptionRow | null | undefined,
): SubscriptionStatus {
  return subscription?.status ?? "active";
}

export function isBetaUser(
  subscription: SubscriptionRow | null | undefined,
): boolean {
  return isBetaPlan(getCurrentPlan(subscription));
}

export function hasActiveSubscription(
  subscription: SubscriptionRow | null | undefined,
): boolean {
  const plan = getCurrentPlan(subscription);
  const status = getCurrentStatus(subscription);

  if (plan === "beta") return true;
  return isActiveStatus(status);
}

export function hasFeature(
  subscription: SubscriptionRow | null | undefined,
  feature: FeatureKey,
): boolean {
  const plan = getCurrentPlan(subscription);
  const status = getCurrentStatus(subscription);

  if (plan === "beta") return true;
  if (!isActiveStatus(status)) return false;

  return resolvePlanFeatures(plan)[feature];
}

export function getFeaturesForSubscription(
  subscription: SubscriptionRow | null | undefined,
): PlanFeatures {
  const plan = getCurrentPlan(subscription);
  const status = getCurrentStatus(subscription);

  if (plan === "beta") return resolvePlanFeatures("beta");
  if (!isActiveStatus(status)) {
    return resolvePlanFeatures("free");
  }
  return resolvePlanFeatures(plan);
}

export function buildSubscriptionAccess(
  subscription: SubscriptionRow | null | undefined,
): SubscriptionAccess {
  const plan = getCurrentPlan(subscription);
  const status = getCurrentStatus(subscription);

  return {
    plan,
    status,
    features: getFeaturesForSubscription(subscription),
    isBeta: isBetaPlan(plan),
    isActive: hasActiveSubscription(subscription),
    limitsEnforced: isLimitsEnforced(),
  };
}
