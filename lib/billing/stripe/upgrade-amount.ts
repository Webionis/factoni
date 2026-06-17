import type Stripe from "stripe";

import {
  type BillingCheckoutPlan,
  getStripePriceIdForPlan,
} from "@/lib/billing/stripe/config";
import { getStripeClient } from "@/lib/stripe/client";

/** Minimum Stripe Checkout en EUR (0,50 €). */
export const STRIPE_CHECKOUT_MIN_CENTS = 50;

async function getPriceUnitAmountCents(priceId: string): Promise<number> {
  const stripe = getStripeClient();
  const price = await stripe.prices.retrieve(priceId);
  if (price.unit_amount == null) {
    throw new Error(`Prix Stripe invalide : ${priceId}`);
  }
  return price.unit_amount;
}

/**
 * Complément théorique Starter → Pro au prorata de la période restante.
 * Utilisé quand le preview Stripe est faussé par des crédits (comptes de test).
 */
export async function computeFairUpgradeAmountCents(
  subscription: Stripe.Subscription,
  targetPlan: BillingCheckoutPlan,
): Promise<number> {
  const item = subscription.items.data[0];
  if (!item) {
    throw new Error("Abonnement Stripe sans ligne de prix.");
  }

  const currentPriceId =
    typeof item.price === "string" ? item.price : item.price.id;
  const targetPriceId = getStripePriceIdForPlan(targetPlan);
  if (!targetPriceId) {
    throw new Error(`Price ID manquant pour ${targetPlan}.`);
  }

  const [currentUnit, targetUnit] = await Promise.all([
    getPriceUnitAmountCents(currentPriceId),
    getPriceUnitAmountCents(targetPriceId),
  ]);

  const diff = targetUnit - currentUnit;
  if (diff <= 0) {
    throw new Error("Le passage à cette offre ne nécessite pas de complément.");
  }

  const periodEnd = item.current_period_end;
  const periodStart = item.current_period_start;
  if (!periodEnd || !periodStart || periodEnd <= periodStart) {
    return diff;
  }

  const now = Math.floor(Date.now() / 1000);
  const remainingSeconds = Math.max(periodEnd - now, 0);
  const totalSeconds = periodEnd - periodStart;
  const fraction = remainingSeconds / totalSeconds;

  return Math.max(Math.round(diff * fraction), STRIPE_CHECKOUT_MIN_CENTS);
}

export function enforceStripeCheckoutMinimum(amountCents: number): number {
  return Math.max(amountCents, STRIPE_CHECKOUT_MIN_CENTS);
}
