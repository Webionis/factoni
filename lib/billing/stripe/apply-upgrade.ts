import type Stripe from "stripe";

import {
  type BillingCheckoutPlan,
  getPlanForStripePriceId,
} from "@/lib/billing/stripe/config";
import { syncSubscriptionFromStripe } from "@/lib/billing/stripe/sync";
import { releaseSubscriptionScheduleIfAny } from "@/lib/billing/stripe/subscription-schedule";
import { getStripeClient } from "@/lib/stripe/client";

interface ApplyPaidUpgradeParams {
  userId: string;
  stripeSubscriptionId: string;
  subscriptionItemId: string;
  targetPriceId: string;
  targetPlan: BillingCheckoutPlan;
}

export async function applyPaidSubscriptionUpgrade(
  params: ApplyPaidUpgradeParams,
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(
    params.stripeSubscriptionId,
  );

  const updateParams: Stripe.SubscriptionUpdateParams = {
    items: [
      {
        id: params.subscriptionItemId,
        price: params.targetPriceId,
      },
    ],
    // Complément déjà réglé via Checkout — pas de double facturation.
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

  await releaseSubscriptionScheduleIfAny(params.stripeSubscriptionId);

  const updated = await stripe.subscriptions.update(
    params.stripeSubscriptionId,
    {
      ...updateParams,
      metadata: {
        ...subscription.metadata,
        user_id: params.userId,
        plan: params.targetPlan,
        pending_plan: "",
      },
    },
  );

  const priceId = updated.items.data[0]?.price?.id;
  const resolved = getPlanForStripePriceId(
    typeof priceId === "string" ? priceId : undefined,
  );

  if (resolved !== params.targetPlan) {
    throw new Error("Le changement d'offre n'a pas été appliqué.");
  }

  await syncSubscriptionFromStripe(updated, params.userId);
  return updated;
}

export async function completeUpgradePaymentSession(
  sessionId: string,
  expectedUserId: string,
): Promise<void> {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.metadata?.factoni_billing !== "upgrade_payment") {
    throw new Error("Session de paiement invalide.");
  }

  const userId = session.metadata?.user_id?.trim() || session.client_reference_id?.trim();
  if (!userId || userId !== expectedUserId) {
    throw new Error("Session non autorisée.");
  }

  if (session.payment_status !== "paid") {
    throw new Error("Paiement du complément non finalisé.");
  }

  const targetPlan = session.metadata?.target_plan?.trim();
  if (targetPlan !== "starter" && targetPlan !== "pro") {
    throw new Error("Plan cible invalide.");
  }

  const subscriptionId = session.metadata?.subscription_id?.trim();
  const subscriptionItemId = session.metadata?.subscription_item_id?.trim();
  const targetPriceId = session.metadata?.target_price_id?.trim();

  if (!subscriptionId || !subscriptionItemId || !targetPriceId) {
    throw new Error("Métadonnées de mise à niveau incomplètes.");
  }

  await applyPaidSubscriptionUpgrade({
    userId,
    stripeSubscriptionId: subscriptionId,
    subscriptionItemId,
    targetPriceId,
    targetPlan,
  });
}
