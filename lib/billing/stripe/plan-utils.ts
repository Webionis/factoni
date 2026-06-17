import type { BillingCheckoutPlan } from "@/lib/billing/stripe/config";

const PLAN_RANK: Record<BillingCheckoutPlan, number> = {
  starter: 1,
  pro: 2,
};

export function isPlanUpgrade(
  currentPlan: BillingCheckoutPlan,
  targetPlan: BillingCheckoutPlan,
): boolean {
  return PLAN_RANK[targetPlan] > PLAN_RANK[currentPlan];
}

export function isPaidPlan(
  plan: string,
): plan is BillingCheckoutPlan {
  return plan === "starter" || plan === "pro";
}
