import type StripeTypes from "stripe";

import {
  type BillingCheckoutPlan,
  getPlanForStripePriceId,
  getStripePriceIdForPlan,
} from "@/lib/billing/stripe/config";
import { syncSubscriptionFromStripe } from "@/lib/billing/stripe/sync";
import { getStripeClient } from "@/lib/stripe/client";

interface ChangeSubscriptionPlanParams {
  stripeSubscriptionId: string;
  userId: string;
  targetPlan: BillingCheckoutPlan;
}

function assertTargetPriceApplied(
  subscription: StripeTypes.Subscription,
  targetPlan: BillingCheckoutPlan,
): void {
  const priceId =
    typeof subscription.items.data[0]?.price === "object"
      ? subscription.items.data[0]?.price?.id
      : subscription.items.data[0]?.price;

  const resolvedPlan = getPlanForStripePriceId(
    typeof priceId === "string" ? priceId : null,
  );

  if (resolvedPlan !== targetPlan) {
    throw new Error("Le changement d'offre n'a pas été appliqué par Stripe.");
  }
}

/** Rétrogradation immédiate sans crédit client (Pro → Starter). */
export async function changeSubscriptionPlan(
  params: ChangeSubscriptionPlanParams,
): Promise<StripeTypes.Subscription> {
  const priceId = getStripePriceIdForPlan(params.targetPlan);
  if (!priceId) {
    throw new Error(`Price ID manquant pour le plan ${params.targetPlan}.`);
  }

  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(
    params.stripeSubscriptionId,
  );

  const subscriptionItemId = subscription.items.data[0]?.id;
  if (!subscriptionItemId) {
    throw new Error("Aucune ligne d'abonnement Stripe trouvée.");
  }

  const updateParams: StripeTypes.SubscriptionUpdateParams = {
    items: [{ id: subscriptionItemId, price: priceId }],
    proration_behavior: "none",
    metadata: {
      user_id: params.userId,
      plan: params.targetPlan,
    },
  };

  if (subscription.cancel_at != null) {
    updateParams.cancel_at = "";
  } else if (subscription.cancel_at_period_end) {
    updateParams.cancel_at_period_end = false;
  }

  const updated = await stripe.subscriptions.update(
    params.stripeSubscriptionId,
    updateParams,
  );

  assertTargetPriceApplied(updated, params.targetPlan);
  return updated;
}

export async function changeSubscriptionPlanAndSync(
  params: ChangeSubscriptionPlanParams,
): Promise<StripeTypes.Subscription> {
  const updated = await changeSubscriptionPlan(params);
  await syncSubscriptionFromStripe(updated, params.userId);
  return updated;
}

export function getPlanChangeErrorMessage(): string {
  return "Impossible de changer d'offre pour le moment.";
}

export function isPlanChangePaymentError(): boolean {
  return false;
}
