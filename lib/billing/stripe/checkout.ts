import type Stripe from "stripe";

import {
  type BillingCheckoutPlan,
  getStripePriceIdForPlan,
} from "@/lib/billing/stripe/config";
import { getAppBaseUrl, getStripeClient } from "@/lib/stripe/client";
import { ensureStripePaymentDescriptors } from "@/lib/stripe/ensure-payment-descriptor";

interface CreateSubscriptionCheckoutParams {
  userId: string;
  email: string;
  plan: BillingCheckoutPlan;
  stripeCustomerId?: string | null;
}

export async function getOrCreateStripeCustomer(
  params: Pick<CreateSubscriptionCheckoutParams, "userId" | "email" | "stripeCustomerId">,
): Promise<string> {
  if (params.stripeCustomerId?.trim()) {
    return params.stripeCustomerId.trim();
  }

  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    email: params.email,
    metadata: { user_id: params.userId },
  });

  return customer.id;
}

export async function createSubscriptionCheckoutSession(
  params: CreateSubscriptionCheckoutParams,
): Promise<Stripe.Checkout.Session> {
  const priceId = getStripePriceIdForPlan(params.plan);
  if (!priceId) {
    throw new Error(`Price ID manquant pour le plan ${params.plan}.`);
  }

  const stripe = getStripeClient();
  const customerId = await getOrCreateStripeCustomer(params);
  const baseUrl = getAppBaseUrl();

  await ensureStripePaymentDescriptors(priceId);

  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/settings/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/settings/billing?checkout=cancelled`,
    client_reference_id: params.userId,
    metadata: {
      factoni_billing: "subscription",
      user_id: params.userId,
      plan: params.plan,
    },
    subscription_data: {
      metadata: {
        user_id: params.userId,
        plan: params.plan,
      },
    },
    // Paiement 0 € (promo 100 %) → SetupIntent : Revolut affiche le descripteur COMPTE.
    setup_intent_data: {
      description: "Abonnement Factoni",
      metadata: {
        brand: "Factoni",
      },
    },
    allow_promotion_codes: true,
  });
}

export async function createBillingPortalSession(
  stripeCustomerId: string,
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripeClient();
  const baseUrl = getAppBaseUrl();

  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${baseUrl}/settings/billing?portal=return`,
  });
}
