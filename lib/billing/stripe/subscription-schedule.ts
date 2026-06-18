import type Stripe from "stripe";

import { getStripeClient } from "@/lib/stripe/client";

export async function releaseSubscriptionScheduleIfAny(
  stripeSubscriptionId: string,
): Promise<void> {
  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const scheduleRef = subscription.schedule;

  if (!scheduleRef) return;

  const scheduleId =
    typeof scheduleRef === "string" ? scheduleRef : scheduleRef.id;

  await stripe.subscriptionSchedules.release(scheduleId);

  const refreshed = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  await stripe.subscriptions.update(stripeSubscriptionId, {
    metadata: {
      ...refreshed.metadata,
      pending_plan: "",
    },
  });
}

export function getSubscriptionPeriodEndUnix(
  subscription: Stripe.Subscription,
): number | null {
  const fromItem = subscription.items.data[0]?.current_period_end;
  if (fromItem) return fromItem;

  const legacyEnd = (
    subscription as Stripe.Subscription & { current_period_end?: number }
  ).current_period_end;

  return legacyEnd ?? null;
}
