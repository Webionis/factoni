import type Stripe from "stripe";

import {
  getPlanForStripePriceId,
  type BillingCheckoutPlan,
} from "@/lib/billing/stripe/config";
import type { SubscriptionSyncPayload } from "@/lib/billing/stripe/events";
import { mapStripeSubscriptionStatus } from "@/lib/billing/stripe/events";
import {
  getSubscriptionByStripeCustomerId,
  upsertSubscriptionFromStripe,
} from "@/lib/data/subscriptions";
import { logServerError } from "@/lib/logger";
import type { SubscriptionPlan } from "@/lib/billing/types";
import { getStripeClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

function resolveUserId(
  subscription: Stripe.Subscription,
  fallbackUserId?: string | null,
): string | null {
  const fromMeta = subscription.metadata?.user_id?.trim();
  if (fromMeta) return fromMeta;
  if (fallbackUserId?.trim()) return fallbackUserId.trim();
  return null;
}

function resolvePlanFromSubscription(
  subscription: Stripe.Subscription,
): SubscriptionPlan {
  const metaPlan = subscription.metadata?.plan?.trim();
  if (metaPlan === "starter" || metaPlan === "pro") {
    return metaPlan;
  }

  for (const item of subscription.items.data) {
    const mapped = getPlanForStripePriceId(item.price?.id);
    if (mapped) return mapped;
  }

  return "starter";
}

function resolveCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): string | null {
  if (!customer) return null;
  if (typeof customer === "string") return customer;
  if ("deleted" in customer && customer.deleted) return null;
  return customer.id;
}

import {
  getSubscriptionBillingPeriodEnd,
  isSubscriptionScheduledForCancellation,
} from "@/lib/billing/stripe/subscription-state";

function toSyncPayload(
  subscription: Stripe.Subscription,
  userId: string,
): SubscriptionSyncPayload {
  const customerId = resolveCustomerId(subscription.customer);
  if (!customerId) {
    throw new Error("Customer Stripe manquant sur l'abonnement.");
  }

  return {
    userId,
    plan: resolvePlanFromSubscription(subscription),
    status: mapStripeSubscriptionStatus(subscription.status),
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    currentPeriodEnd: getSubscriptionBillingPeriodEnd(subscription),
    cancelAtPeriodEnd: isSubscriptionScheduledForCancellation(subscription),
  };
}

export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  fallbackUserId?: string | null,
): Promise<void> {
  let userId = resolveUserId(subscription, fallbackUserId);

  if (!userId) {
    const customerId = resolveCustomerId(subscription.customer);
    if (customerId) {
      const admin = createAdminClient();
      const existing = await getSubscriptionByStripeCustomerId(admin, customerId);
      userId = existing?.user_id ?? null;
    }
  }

  if (!userId) {
    throw new Error("Impossible de résoudre user_id pour l'abonnement Stripe.");
  }

  await upsertSubscriptionFromStripe(toSyncPayload(subscription, userId));
}

export async function syncSubscriptionById(
  subscriptionId: string,
  fallbackUserId?: string | null,
): Promise<void> {
  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncSubscriptionFromStripe(subscription, fallbackUserId);
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const userId = resolveUserId(subscription);
  if (!userId) {
    const customerId = resolveCustomerId(subscription.customer);
    if (!customerId) return;

    const admin = createAdminClient();
    const existing = await getSubscriptionByStripeCustomerId(admin, customerId);
    if (!existing) return;

    await upsertSubscriptionFromStripe({
      userId: existing.user_id,
      plan: "free",
      status: "cancelled",
      stripeCustomerId: customerId,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    });
    return;
  }

  const customerId = resolveCustomerId(subscription.customer);
  if (!customerId) return;

  await upsertSubscriptionFromStripe({
    userId,
    plan: "free",
    status: "cancelled",
    stripeCustomerId: customerId,
    stripeSubscriptionId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  });
}

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId =
    session.metadata?.user_id?.trim() ||
    session.client_reference_id?.trim() ||
    null;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!subscriptionId) {
    throw new Error("Session checkout sans abonnement Stripe.");
  }

  await syncSubscriptionById(subscriptionId, userId);
}

export async function syncFromCheckoutSessionId(
  sessionId: string,
  expectedUserId: string,
): Promise<void> {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.metadata?.factoni_billing !== "subscription") {
    throw new Error("Session checkout invalide.");
  }

  const sessionUserId =
    session.metadata?.user_id?.trim() ||
    session.client_reference_id?.trim() ||
    null;

  if (!sessionUserId || sessionUserId !== expectedUserId) {
    throw new Error("Session checkout non autorisée.");
  }

  if (session.payment_status !== "paid" && session.status !== "complete") {
    throw new Error("Paiement non finalisé.");
  }

  await handleCheckoutSessionCompleted(session);
}

export async function recoverSubscriptionForUser(
  userId: string,
  email: string,
): Promise<boolean> {
  const stripe = getStripeClient();
  const customers = await stripe.customers.list({ email, limit: 5 });

  const customer = customers.data.find(
    (entry) => entry.metadata?.user_id === userId,
  ) ?? customers.data[0];

  if (!customer) return false;

  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id,
    status: "all",
    limit: 10,
  });

  const activeSubscription =
    subscriptions.data.find((entry) =>
      ["active", "trialing", "past_due"].includes(entry.status),
    ) ?? subscriptions.data[0];

  if (!activeSubscription) return false;

  await syncSubscriptionFromStripe(activeSubscription, userId);
  return true;
}

export async function syncActiveSubscriptionForUser(
  userId: string,
  stripeSubscriptionId: string,
): Promise<void> {
  await syncSubscriptionById(stripeSubscriptionId, userId);
}

export async function recordBillingWebhookEvent(
  eventId: string,
  eventType: string,
): Promise<boolean> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("stripe_webhook_events")
    .select("id")
    .eq("stripe_event_id", eventId)
    .maybeSingle();

  if (existing) return false;

  const { error } = await admin.from("stripe_webhook_events").insert({
    stripe_event_id: eventId,
    event_type: eventType,
  });

  if (error) {
    if (error.code === "23505") return false;
    logServerError("billing.webhook.idempotency", error, { eventId, eventType });
    throw error;
  }

  return true;
}

export function isBillingCheckoutPlan(
  value: string,
): value is BillingCheckoutPlan {
  return value === "starter" || value === "pro";
}
