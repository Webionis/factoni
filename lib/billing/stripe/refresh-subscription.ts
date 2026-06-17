import { logServerError } from "@/lib/logger";
import { fetchLiveSubscriptionDisplay } from "@/lib/billing/stripe/fetch-live-display";
import {
  recoverSubscriptionForUser,
  syncActiveSubscriptionForUser,
} from "@/lib/billing/stripe/sync";
import { isBillingStripeConfigured } from "@/lib/billing/stripe/config";
import type { SubscriptionRow } from "@/lib/billing/types";
import type { LiveSubscriptionDisplay } from "@/lib/billing/stripe/subscription-state";

export interface RefreshedSubscriptionView {
  subscription: SubscriptionRow | null;
  liveDisplay: LiveSubscriptionDisplay | null;
}

/**
 * Rafraîchit l'abonnement depuis Stripe et retourne l'état d'affichage live.
 */
export async function refreshSubscriptionView(
  userId: string,
  email: string | undefined,
  subscription: SubscriptionRow | null,
  reload: () => Promise<SubscriptionRow | null>,
): Promise<RefreshedSubscriptionView> {
  if (!isBillingStripeConfigured()) {
    return { subscription, liveDisplay: null };
  }

  const stripeSubscriptionId = subscription?.stripe_subscription_id?.trim();

  try {
    if (stripeSubscriptionId) {
      await syncActiveSubscriptionForUser(userId, stripeSubscriptionId);
    } else if (email) {
      await recoverSubscriptionForUser(userId, email);
    }
  } catch (error) {
    logServerError("billing.refresh_subscription", error, { userId });
  }

  const updated = await reload();
  const subId = updated?.stripe_subscription_id?.trim();
  const liveDisplay = subId ? await fetchLiveSubscriptionDisplay(subId) : null;

  return { subscription: updated, liveDisplay };
}
