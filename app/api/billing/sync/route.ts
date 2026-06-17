import { NextResponse } from "next/server";

import { syncFromCheckoutSessionId } from "@/lib/billing/stripe/sync";
import { isBillingStripeConfigured } from "@/lib/billing/stripe/config";
import { logServerError } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Réservé aux usages internes — la sync au retour checkout se fait côté serveur. */
export async function POST(request: Request) {
  if (!isBillingStripeConfigured()) {
    return NextResponse.json(
      { error: "Synchronisation indisponible." },
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

  let body: { sessionId?: string };
  try {
    body = (await request.json()) as { sessionId?: string };
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const sessionId = body.sessionId?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "Session manquante." }, { status: 400 });
  }

  try {
    await syncFromCheckoutSessionId(sessionId, user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    logServerError("billing.sync", error, { userId: user.id, sessionId });
    return NextResponse.json(
      { error: "Impossible de synchroniser l'abonnement." },
      { status: 500 },
    );
  }
}
