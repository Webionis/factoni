import { NextResponse } from "next/server";

import { BILLING_CHECKOUT_PLANS } from "@/lib/billing/stripe/config";
import {
  changeSubscriptionPlanAndSync,
  getPlanChangeErrorMessage,
} from "@/lib/billing/stripe/change-plan";
import { createSubscriptionCheckoutSession } from "@/lib/billing/stripe/checkout";
import { isPaidPlan, isPlanUpgrade } from "@/lib/billing/stripe/plan-utils";
import { isBillingCheckoutPlan } from "@/lib/billing/stripe/sync";
import { isBillingStripeConfigured } from "@/lib/billing/stripe/config";
import {
  prepareUpgradeCheckout,
  UpgradeRequiresPaymentError,
} from "@/lib/billing/stripe/upgrade-checkout";
import {
  buildSubscriptionAccess,
  hasActiveSubscription,
} from "@/lib/billing/access";
import { getSubscriptionForUser } from "@/lib/data/subscriptions";
import { logServerError } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isBillingStripeConfigured()) {
    return NextResponse.json(
      { error: "Les abonnements ne sont pas encore disponibles." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  let body: { plan?: string };
  try {
    body = (await request.json()) as { plan?: string };
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const plan = body.plan?.trim();
  if (!plan || !isBillingCheckoutPlan(plan)) {
    return NextResponse.json(
      {
        error: `Plan invalide. Valeurs acceptées : ${BILLING_CHECKOUT_PLANS.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  const subscription = await getSubscriptionForUser(supabase, user.id);
  const access = buildSubscriptionAccess(subscription);
  const stripeSubscriptionId = subscription?.stripe_subscription_id?.trim();
  const stripeCustomerId = subscription?.stripe_customer_id?.trim();
  const hasPaidSubscription =
    !access.isBeta &&
    hasActiveSubscription(subscription) &&
    Boolean(stripeSubscriptionId) &&
    Boolean(stripeCustomerId);

  if (access.plan === plan && hasPaidSubscription) {
    return NextResponse.json(
      { error: "Vous êtes déjà sur cette offre." },
      { status: 409 },
    );
  }

  if (hasPaidSubscription && stripeSubscriptionId && stripeCustomerId && access.plan !== plan) {
    if (!isPaidPlan(access.plan)) {
      return NextResponse.json(
        { error: "Offre actuelle non compatible avec un changement de plan." },
        { status: 400 },
      );
    }

    if (isPlanUpgrade(access.plan, plan)) {
      try {
        const session = await prepareUpgradeCheckout({
          userId: user.id,
          stripeCustomerId,
          stripeSubscriptionId,
          targetPlan: plan,
        });

        if (!session.url) {
          return NextResponse.json(
            { error: "Impossible d'ouvrir la page de paiement." },
            { status: 500 },
          );
        }

        return NextResponse.json({ url: session.url });
      } catch (error) {
        logServerError("billing.upgrade_checkout", error, {
          userId: user.id,
          plan,
          currentPlan: access.plan,
        });

        if (error instanceof UpgradeRequiresPaymentError) {
          return NextResponse.json(
            {
              error:
                "Un complément est requis pour passer à Pro. Réessayez ou contactez le support si le problème persiste.",
            },
            { status: 402 },
          );
        }

        return NextResponse.json(
          { error: "Impossible de préparer le passage à l'offre supérieure." },
          { status: 500 },
        );
      }
    }

    try {
      await changeSubscriptionPlanAndSync({
        stripeSubscriptionId,
        userId: user.id,
        targetPlan: plan,
      });

      return NextResponse.json({ upgraded: true, plan });
    } catch (error) {
      logServerError("billing.change_plan", error, {
        userId: user.id,
        plan,
        stripeSubscriptionId,
        currentPlan: access.plan,
      });

      return NextResponse.json(
        { error: getPlanChangeErrorMessage() },
        { status: 500 },
      );
    }
  }

  try {
    const session = await createSubscriptionCheckoutSession({
      userId: user.id,
      email: user.email,
      plan,
      stripeCustomerId: subscription?.stripe_customer_id,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Impossible de créer la session de paiement." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logServerError("billing.checkout", error, { userId: user.id, plan });
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement." },
      { status: 500 },
    );
  }
}
