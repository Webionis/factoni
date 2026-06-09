import { NextResponse } from "next/server";

import { STRIPE_ENABLED } from "@/lib/billing/stripe/config";

/**
 * Webhook Stripe — stub pendant la bêta.
 * Implémenter la vérification de signature + sync subscriptions au lancement payant.
 */
export async function POST() {
  if (!STRIPE_ENABLED) {
    return NextResponse.json(
      { error: "Stripe désactivé pendant la bêta" },
      { status: 503 },
    );
  }

  return NextResponse.json({ received: true });
}
