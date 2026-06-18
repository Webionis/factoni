import type StripeTypes from "stripe";

import {
  type BillingCheckoutPlan,
  getPlanForStripePriceId,
  getStripePriceIdForPlan,
} from "@/lib/billing/stripe/config";
import {
  getSubscriptionPeriodEndUnix,
  releaseSubscriptionScheduleIfAny,
} from "@/lib/billing/stripe/subscription-schedule";
import { syncSubscriptionFromStripe } from "@/lib/billing/stripe/sync";
import { upsertSubscriptionPendingChange } from "@/lib/data/subscriptions";
import { getStripeClient } from "@/lib/stripe/client";

interface ChangeSubscriptionPlanParams {
  stripeSubscriptionId: string;
  userId: string;
  targetPlan: BillingCheckoutPlan;
}

export interface ScheduledPlanChangeResult {
  subscription: StripeTypes.Subscription;
  effectiveAt: string;
}

/** Rétrogradation en fin de période (ex. Pro → Starter) — l'offre actuelle reste active jusqu'au renouvellement. */
export async function scheduleSubscriptionDowngrade(
  params: ChangeSubscriptionPlanParams,
): Promise<ScheduledPlanChangeResult> {
  const targetPriceId = getStripePriceIdForPlan(params.targetPlan);
  if (!targetPriceId) {
    throw new Error(`Price ID manquant pour le plan ${params.targetPlan}.`);
  }

  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(
    params.stripeSubscriptionId,
  );

  const subscriptionItem = subscription.items.data[0];
  const subscriptionItemId = subscriptionItem?.id;
  const currentPriceRef = subscriptionItem?.price;
  const currentPriceId =
    typeof currentPriceRef === "string"
      ? currentPriceRef
      : currentPriceRef?.id;

  const currentPlan = getPlanForStripePriceId(currentPriceId);
  const periodEnd = getSubscriptionPeriodEndUnix(subscription);

  if (!subscriptionItemId || !currentPriceId || !periodEnd || !currentPlan) {
    throw new Error("Abonnement Stripe incomplet pour programmer le changement.");
  }

  await releaseSubscriptionScheduleIfAny(params.stripeSubscriptionId);

  if (subscription.cancel_at != null) {
    await stripe.subscriptions.update(params.stripeSubscriptionId, {
      cancel_at: "",
    });
  } else if (subscription.cancel_at_period_end) {
    await stripe.subscriptions.update(params.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });
  }

  const schedule = await stripe.subscriptionSchedules.create({
    from_subscription: params.stripeSubscriptionId,
  });

  const phaseStart = schedule.phases[0]?.start_date;
  if (!phaseStart) {
    throw new Error("Impossible de lire la phase courante de l'abonnement.");
  }

  await stripe.subscriptionSchedules.update(schedule.id, {
    end_behavior: "release",
    phases: [
      {
        items: [{ price: currentPriceId, quantity: 1 }],
        start_date: phaseStart,
        end_date: periodEnd,
        proration_behavior: "none",
      },
      {
        items: [{ price: targetPriceId, quantity: 1 }],
        start_date: periodEnd,
        proration_behavior: "none",
        billing_cycle_anchor: "phase_start",
        collection_method: "charge_automatically",
      },
    ],
    metadata: {
      user_id: params.userId,
      pending_plan: params.targetPlan,
    },
  });

  const updated = await stripe.subscriptions.retrieve(params.stripeSubscriptionId, {
    expand: ["schedule"],
  });

  await stripe.subscriptions.update(params.stripeSubscriptionId, {
    metadata: {
      ...updated.metadata,
      user_id: params.userId,
      plan: currentPlan,
      pending_plan: params.targetPlan,
    },
  });

  const effectiveAt = new Date(periodEnd * 1000).toISOString();

  return {
    subscription: await stripe.subscriptions.retrieve(params.stripeSubscriptionId, {
      expand: ["schedule"],
    }),
    effectiveAt,
  };
}

export async function scheduleSubscriptionDowngradeAndSync(
  params: ChangeSubscriptionPlanParams,
): Promise<ScheduledPlanChangeResult> {
  const result = await scheduleSubscriptionDowngrade(params);
  await syncSubscriptionFromStripe(result.subscription, params.userId);

  await upsertSubscriptionPendingChange({
    userId: params.userId,
    pendingPlan: params.targetPlan,
    pendingPlanEffectiveAt: result.effectiveAt,
  });

  return result;
}

export function getPlanChangeErrorMessage(): string {
  return "Impossible de programmer le changement d'offre pour le moment.";
}

export function isPlanChangePaymentError(): boolean {
  return false;
}
