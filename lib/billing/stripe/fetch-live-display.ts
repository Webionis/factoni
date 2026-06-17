import { getStripeClient } from "@/lib/stripe/client";
import {
  getLiveSubscriptionDisplay,
  type LiveSubscriptionDisplay,
} from "@/lib/billing/stripe/subscription-state";

export async function fetchLiveSubscriptionDisplay(
  stripeSubscriptionId: string,
): Promise<LiveSubscriptionDisplay | null> {
  try {
    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    return getLiveSubscriptionDisplay(subscription);
  } catch {
    return null;
  }
}
