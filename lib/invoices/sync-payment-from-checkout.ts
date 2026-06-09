import { applyInvoicePaidFromCheckoutSession } from "@/lib/invoices/mark-paid-from-stripe";
import { logStripeSync } from "@/lib/invoices/paid-transition-log";
import { logServerError } from "@/lib/logger";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe/client";
import { resolveCheckoutSessionInvoiceId } from "@/lib/stripe/webhooks";

export type SyncPaymentResult = {
  success: boolean;
  skipped?: string;
  invoiceId?: string;
  transitioned?: boolean;
  sessionId?: string;
  notificationCreated?: boolean;
  emailSent?: boolean;
};

/**
 * Synchronisation immédiate après redirection Stripe success.
 * Vérifie la session côté API Stripe et applique status=paid.
 */
export async function syncInvoicePaymentFromCheckoutSessionId(
  sessionId: string,
): Promise<SyncPaymentResult> {
  const trimmed = sessionId.trim();

  logStripeSync("start", { sessionId: trimmed });

  if (!isStripeConfigured()) {
    return { success: false, skipped: "stripe_not_configured", sessionId: trimmed };
  }

  if (!trimmed) {
    return { success: false, skipped: "missing_session_id" };
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(trimmed, {
      expand: ["payment_intent"],
    });

    const invoiceId = await resolveCheckoutSessionInvoiceId(session);

    logStripeSync("payment_status", {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      invoiceId,
      metadata: session.metadata ?? null,
    });

    const result = await applyInvoicePaidFromCheckoutSession(
      session,
      `sync_checkout_${trimmed}`,
    );

    const success =
      result.transitioned === true ||
      result.skipped === "already_paid" ||
      result.skipped === "already_processed" ||
      result.skipped === "no_matching_row_recovered";

    logStripeSync(success ? "complete" : "failed", {
      sessionId: trimmed,
      invoiceId: result.invoiceId,
      skipped: result.skipped,
      transitioned: result.transitioned,
      handled: result.handled,
    });

    return {
      success,
      skipped: result.skipped,
      invoiceId: result.invoiceId,
      transitioned: result.transitioned,
      sessionId: trimmed,
      notificationCreated: result.notificationCreated,
      emailSent: result.emailSent,
    };
  } catch (error) {
    logServerError("syncInvoicePaymentFromCheckoutSessionId", error, {
      sessionId: trimmed,
    });

    logStripeSync("exception", {
      sessionId: trimmed,
      error: error instanceof Error ? error.message : String(error),
    });

    return { success: false, skipped: "retrieve_failed", sessionId: trimmed };
  }
}
