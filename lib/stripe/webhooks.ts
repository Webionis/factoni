import type Stripe from "stripe";

import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe/client";

export function constructStripeWebhookEvent(
  payload: string,
  signature: string,
): Stripe.Event {
  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    getStripeWebhookSecret(),
  );
}

export function isDepositCheckoutSession(session: Stripe.Checkout.Session): boolean {
  if (session.metadata?.deposit_payment === "true") {
    return true;
  }

  const paymentIntent = session.payment_intent;
  if (
    paymentIntent &&
    typeof paymentIntent === "object" &&
    "metadata" in paymentIntent
  ) {
    return paymentIntent.metadata?.deposit_payment === "true";
  }

  return false;
}

export function getCheckoutSessionQuoteId(
  session: Stripe.Checkout.Session,
): string | null {
  const fromSession = session.metadata?.quote_id?.trim();
  if (fromSession) return fromSession;

  const paymentIntent = session.payment_intent;
  if (
    paymentIntent &&
    typeof paymentIntent === "object" &&
    "metadata" in paymentIntent
  ) {
    const piMeta = paymentIntent.metadata?.quote_id?.trim();
    if (piMeta) return piMeta;
  }

  return null;
}

export async function resolveCheckoutSessionQuoteId(
  session: Stripe.Checkout.Session,
): Promise<string | null> {
  const direct = getCheckoutSessionQuoteId(session);
  if (direct) return direct;

  const paymentIntent = session.payment_intent;
  if (typeof paymentIntent !== "string" || !paymentIntent.trim()) {
    return null;
  }

  try {
    const stripe = getStripeClient();
    const intent = await stripe.paymentIntents.retrieve(paymentIntent);
    return intent.metadata?.quote_id?.trim() ?? null;
  } catch {
    return null;
  }
}

export function getCheckoutSessionInvoiceId(
  session: Stripe.Checkout.Session,
): string | null {
  if (isDepositCheckoutSession(session)) return null;

  const fromSession = session.metadata?.invoice_id?.trim();
  if (fromSession) return fromSession;

  const paymentIntent = session.payment_intent;
  if (
    paymentIntent &&
    typeof paymentIntent === "object" &&
    "metadata" in paymentIntent
  ) {
    const piMeta = paymentIntent.metadata?.invoice_id?.trim();
    if (piMeta) return piMeta;
  }

  return null;
}

export async function resolveCheckoutSessionInvoiceId(
  session: Stripe.Checkout.Session,
): Promise<string | null> {
  const direct = getCheckoutSessionInvoiceId(session);
  if (direct) return direct;

  const paymentIntent = session.payment_intent;
  if (typeof paymentIntent !== "string" || !paymentIntent.trim()) {
    return null;
  }

  try {
    const stripe = getStripeClient();
    const intent = await stripe.paymentIntents.retrieve(paymentIntent);
    return intent.metadata?.invoice_id?.trim() ?? null;
  } catch {
    return null;
  }
}

export function extractCheckoutStripeRefs(session: Stripe.Checkout.Session): {
  paymentIntentId: string | null;
  checkoutSessionId: string;
} {
  const paymentIntent = session.payment_intent;
  const paymentIntentId =
    typeof paymentIntent === "string"
      ? paymentIntent
      : typeof paymentIntent === "object" && paymentIntent && "id" in paymentIntent
        ? String(paymentIntent.id)
        : null;

  return {
    paymentIntentId,
    checkoutSessionId: session.id,
  };
}
