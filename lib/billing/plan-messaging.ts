import type { BillingCheckoutPlan } from "@/lib/billing/stripe/config";

import { PLAN_DISPLAY_NAMES } from "./plans";

const PLAN_MONTHLY_PRICE: Record<BillingCheckoutPlan, string> = {
  starter: "19 €",
  pro: "39 €",
};

export function getPlanMonthlyPriceLabel(plan: BillingCheckoutPlan): string {
  return PLAN_MONTHLY_PRICE[plan];
}

export function getScheduledDowngradeMessage(params: {
  currentPlan: BillingCheckoutPlan;
  targetPlan: BillingCheckoutPlan;
  effectiveDateLabel: string;
}): string {
  const currentName = PLAN_DISPLAY_NAMES[params.currentPlan];
  const targetName = PLAN_DISPLAY_NAMES[params.targetPlan];
  const targetPrice = getPlanMonthlyPriceLabel(params.targetPlan);

  return `Offre ${currentName} — changement d'abonnement vers ${targetName} le ${params.effectiveDateLabel}. Votre carte sera débitée de ${targetPrice} / mois à cette date.`;
}

export function getScheduledDowngradeToast(params: {
  currentPlan: BillingCheckoutPlan;
  targetPlan: BillingCheckoutPlan;
  effectiveDateLabel: string;
}): string {
  const currentName = PLAN_DISPLAY_NAMES[params.currentPlan];
  const targetName = PLAN_DISPLAY_NAMES[params.targetPlan];
  const targetPrice = getPlanMonthlyPriceLabel(params.targetPlan);

  return `Changement enregistré. Vous conservez l'offre ${currentName} jusqu'au ${params.effectiveDateLabel}, puis passage à ${targetName} (${targetPrice} / mois débités sur votre carte).`;
}
