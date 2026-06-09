import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/billing/types";

/**
 * Événements Stripe à traiter (webhook) — implémentation future.
 * @see https://stripe.com/docs/webhooks
 */
export const STRIPE_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
] as const;

export type StripeWebhookEventType = (typeof STRIPE_WEBHOOK_EVENTS)[number];

export interface SubscriptionSyncPayload {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodEnd: string | null;
}

/** Mapping statut Stripe → statut interne (à affiner avec l'intégration) */
export function mapStripeSubscriptionStatus(
  stripeStatus: string,
): SubscriptionStatus {
  switch (stripeStatus) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "cancelled";
    default:
      return "active";
  }
}
