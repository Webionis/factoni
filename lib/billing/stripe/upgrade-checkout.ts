import type Stripe from "stripe";

import {
  type BillingCheckoutPlan,
  getStripePriceIdForPlan,
} from "@/lib/billing/stripe/config";
import {
  computeFairUpgradeAmountCents,
  enforceStripeCheckoutMinimum,
  STRIPE_CHECKOUT_MIN_CENTS,
} from "@/lib/billing/stripe/upgrade-amount";
import { getAppBaseUrl, getStripeClient } from "@/lib/stripe/client";
import { getCheckoutPaymentIntentDescriptorData } from "@/lib/stripe/statement-descriptor";
import { ensureStripePaymentDescriptors } from "@/lib/stripe/ensure-payment-descriptor";

export class UpgradeRequiresPaymentError extends Error {
  readonly amountDueCents: number;

  constructor(amountDueCents: number) {
    super(
      amountDueCents <= 0
        ? "Un complément est requis pour passer à l'offre supérieure."
        : "Paiement du complément requis.",
    );
    this.name = "UpgradeRequiresPaymentError";
    this.amountDueCents = amountDueCents;
  }
}

interface UpgradePreviewParams {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  subscriptionItemId: string;
  targetPlan: BillingCheckoutPlan;
}

export async function previewUpgradeAmountCents(
  params: UpgradePreviewParams,
): Promise<number> {
  const priceId = getStripePriceIdForPlan(params.targetPlan);
  if (!priceId) {
    throw new Error(`Price ID manquant pour ${params.targetPlan}.`);
  }

  const stripe = getStripeClient();
  const preview = await stripe.invoices.createPreview({
    customer: params.stripeCustomerId,
    subscription: params.stripeSubscriptionId,
    subscription_details: {
      items: [{ id: params.subscriptionItemId, price: priceId }],
      proration_behavior: "always_invoice",
    },
  });

  return preview.amount_due;
}

async function previewUpgradeWithAnchorNow(
  params: UpgradePreviewParams,
): Promise<number> {
  const priceId = getStripePriceIdForPlan(params.targetPlan);
  if (!priceId) return 0;

  const stripe = getStripeClient();
  const preview = await stripe.invoices.createPreview({
    customer: params.stripeCustomerId,
    subscription: params.stripeSubscriptionId,
    subscription_details: {
      items: [{ id: params.subscriptionItemId, price: priceId }],
      proration_behavior: "always_invoice",
      billing_cycle_anchor: "now",
    },
  });

  return preview.amount_due;
}

interface CreateUpgradePaymentCheckoutParams {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  subscriptionItemId: string;
  targetPlan: BillingCheckoutPlan;
  amountDueCents: number;
}

export async function createUpgradePaymentCheckoutSession(
  params: CreateUpgradePaymentCheckoutParams,
): Promise<Stripe.Checkout.Session> {
  const targetPriceId = getStripePriceIdForPlan(params.targetPlan);
  if (!targetPriceId) {
    throw new Error(`Price ID manquant pour ${params.targetPlan}.`);
  }

  const chargeCents = enforceStripeCheckoutMinimum(params.amountDueCents);
  const stripe = getStripeClient();
  const baseUrl = getAppBaseUrl();

  await ensureStripePaymentDescriptors(targetPriceId);

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer: params.stripeCustomerId,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: chargeCents,
          product_data: {
            name:
              params.targetPlan === "pro"
                ? "Passage à Factoni Pro"
                : "Changement d'offre Factoni",
            description:
              "Complément au prorata pour le reste de la période en cours.",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/settings/billing?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/settings/billing?checkout=cancelled`,
    client_reference_id: params.userId,
    metadata: {
      factoni_billing: "upgrade_payment",
      user_id: params.userId,
      target_plan: params.targetPlan,
      subscription_id: params.stripeSubscriptionId,
      subscription_item_id: params.subscriptionItemId,
      target_price_id: targetPriceId,
      charged_amount_cents: String(chargeCents),
    },
    payment_intent_data: getCheckoutPaymentIntentDescriptorData(),
  });
}

export async function resolveUpgradeChargeCents(
  subscription: Stripe.Subscription,
  params: {
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    subscriptionItemId: string;
    targetPlan: BillingCheckoutPlan;
  },
): Promise<number> {
  const previewParams: UpgradePreviewParams = {
    stripeCustomerId: params.stripeCustomerId,
    stripeSubscriptionId: params.stripeSubscriptionId,
    subscriptionItemId: params.subscriptionItemId,
    targetPlan: params.targetPlan,
  };

  let amountDueCents = await previewUpgradeAmountCents(previewParams);

  if (amountDueCents < STRIPE_CHECKOUT_MIN_CENTS) {
    amountDueCents = await previewUpgradeWithAnchorNow(previewParams);
  }

  if (amountDueCents < STRIPE_CHECKOUT_MIN_CENTS) {
    amountDueCents = await computeFairUpgradeAmountCents(
      subscription,
      params.targetPlan,
    );
  }

  return enforceStripeCheckoutMinimum(amountDueCents);
}

export async function prepareUpgradeCheckout(params: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  targetPlan: BillingCheckoutPlan;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(
    params.stripeSubscriptionId,
  );

  const subscriptionItemId = subscription.items.data[0]?.id;
  if (!subscriptionItemId) {
    throw new Error("Aucune ligne d'abonnement Stripe trouvée.");
  }

  const amountDueCents = await resolveUpgradeChargeCents(subscription, {
    stripeCustomerId: params.stripeCustomerId,
    stripeSubscriptionId: params.stripeSubscriptionId,
    subscriptionItemId,
    targetPlan: params.targetPlan,
  });

  if (amountDueCents < STRIPE_CHECKOUT_MIN_CENTS) {
    throw new UpgradeRequiresPaymentError(amountDueCents);
  }

  return createUpgradePaymentCheckoutSession({
    userId: params.userId,
    stripeCustomerId: params.stripeCustomerId,
    stripeSubscriptionId: params.stripeSubscriptionId,
    subscriptionItemId,
    targetPlan: params.targetPlan,
    amountDueCents,
  });
}
