import type Stripe from "stripe";

export function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription,
): string | null {
  const fromItem = subscription.items?.data?.[0]?.current_period_end;
  if (fromItem) {
    return new Date(fromItem * 1000).toISOString();
  }

  const legacyEnd = (
    subscription as Stripe.Subscription & { current_period_end?: number }
  ).current_period_end;

  if (legacyEnd) {
    return new Date(legacyEnd * 1000).toISOString();
  }

  return null;
}

/** Stripe récente : cancel_at / canceled_at au lieu de cancel_at_period_end seul. */
export function isSubscriptionScheduledForCancellation(
  subscription: Stripe.Subscription,
): boolean {
  if (subscription.cancel_at_period_end) return true;
  if (subscription.cancel_at != null) return true;
  return (
    subscription.canceled_at != null &&
    (subscription.status === "active" || subscription.status === "trialing")
  );
}

export function getSubscriptionBillingPeriodEnd(
  subscription: Stripe.Subscription,
): string | null {
  if (subscription.cancel_at != null) {
    return new Date(subscription.cancel_at * 1000).toISOString();
  }
  return getSubscriptionPeriodEnd(subscription);
}

export interface LiveSubscriptionDisplay {
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

export function getLiveSubscriptionDisplay(
  subscription: Stripe.Subscription,
): LiveSubscriptionDisplay {
  const cancelAtPeriodEnd = isSubscriptionScheduledForCancellation(subscription);
  return {
    cancelAtPeriodEnd,
    currentPeriodEnd: cancelAtPeriodEnd
      ? getSubscriptionBillingPeriodEnd(subscription)
      : getSubscriptionPeriodEnd(subscription),
  };
}
