import { NextResponse } from "next/server";

import { createBillingPortalSession } from "@/lib/billing/stripe/checkout";
import { isBillingStripeConfigured } from "@/lib/billing/stripe/config";
import { getSubscriptionForUser } from "@/lib/data/subscriptions";
import { logServerError } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  if (!isBillingStripeConfigured()) {
    return NextResponse.json(
      { error: "Le portail client n'est pas disponible." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const subscription = await getSubscriptionForUser(supabase, user.id);
  const customerId = subscription?.stripe_customer_id?.trim();

  if (!customerId) {
    return NextResponse.json(
      { error: "Aucun abonnement Stripe associé à ce compte." },
      { status: 404 },
    );
  }

  try {
    const session = await createBillingPortalSession(customerId);

    if (!session.url) {
      return NextResponse.json(
        { error: "Impossible d'ouvrir le portail client." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logServerError("billing.portal", error, { userId: user.id });
    return NextResponse.json(
      { error: "Erreur lors de l'ouverture du portail client." },
      { status: 500 },
    );
  }
}
