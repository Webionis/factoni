import { NextResponse } from "next/server";

import { logInvoicePaid } from "@/lib/invoices/paid-transition-log";
import { logDepositPaid } from "@/lib/quotes/deposit-paid-transition-log";
import { syncPaymentFromCheckoutSessionId } from "@/lib/payments/sync-from-checkout";
import { logServerError } from "@/lib/logger";
import { isStripeConfigured } from "@/lib/stripe/client";

export const runtime = "nodejs";

/**
 * Confirme un paiement Stripe (sync DB + notification + email).
 * Appelé par le client après redirection success — contexte API fiable, hors RSC.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Stripe désactivé." },
      { status: 503 },
    );
  }

  let sessionId: string | undefined;
  try {
    const body = (await request.json()) as { sessionId?: string };
    sessionId = body.sessionId?.trim();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Corps JSON invalide." },
      { status: 400 },
    );
  }

  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "sessionId manquant." },
      { status: 400 },
    );
  }

  logInvoicePaid("api_confirm", { step: "start", sessionId });
  logDepositPaid("api_confirm_start", { sessionId });

  try {
    const syncResult = await syncPaymentFromCheckoutSessionId(sessionId);

    if (!syncResult.success) {
      logDepositPaid("api_confirm_failed", {
        sessionId,
        skipped: syncResult.skipped,
        kind: syncResult.kind,
      });
      return NextResponse.json({
        ok: false,
        skipped: syncResult.skipped,
        kind: syncResult.kind,
        sessionId,
      });
    }

    logInvoicePaid("api_confirm", {
      step: "complete",
      sessionId,
      documentId: syncResult.documentId,
      kind: syncResult.kind,
      notificationCreated: syncResult.notificationCreated,
      emailSent: syncResult.emailSent,
    });

    return NextResponse.json({
      ok: true,
      documentId: syncResult.documentId,
      kind: syncResult.kind,
      transitioned: syncResult.transitioned,
      skipped: syncResult.skipped,
      notificationCreated: syncResult.notificationCreated,
      emailSent: syncResult.emailSent,
    });
  } catch (error) {
    logServerError("api.public.payment.confirm-side-effects", error, {
      sessionId,
    });
    logInvoicePaid("api_confirm", {
      step: "error",
      sessionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { ok: false, error: "Traitement échoué." },
      { status: 500 },
    );
  }
}
