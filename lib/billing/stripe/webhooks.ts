import type Stripe from "stripe";

import { getStripeBillingWebhookSecret } from "@/lib/billing/stripe/config";
import { getStripeClient } from "@/lib/stripe/client";

export function constructBillingWebhookEvent(
  payload: string,
  signature: string,
): Stripe.Event {
  const secret = getStripeBillingWebhookSecret();
  if (!secret) {
    throw new Error("STRIPE_BILLING_WEBHOOK_SECRET manquant.");
  }

  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

export function isFactoniSubscriptionCheckout(
  session: Stripe.Checkout.Session,
): boolean {
  return session.metadata?.factoni_billing === "subscription";
}

export function getInvoiceSubscriptionId(
  invoice: Stripe.Invoice,
): string | null {
  const parent = invoice.parent;
  if (
    parent?.type === "subscription_details" &&
    parent.subscription_details?.subscription
  ) {
    const subscription = parent.subscription_details.subscription;
    return typeof subscription === "string" ? subscription : subscription.id;
  }

  const legacySubscription = (
    invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    }
  ).subscription;

  if (!legacySubscription) return null;
  return typeof legacySubscription === "string"
    ? legacySubscription
    : legacySubscription.id;
}
