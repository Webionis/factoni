import { syncInvoicePaymentFromCheckoutSessionId } from "@/lib/invoices/sync-payment-from-checkout";
import {
  syncQuoteDepositPaymentFromCheckoutSession,
  syncQuoteDepositPaymentFromCheckoutSessionId,
} from "@/lib/quotes/sync-deposit-payment-from-checkout";
import { logServerError } from "@/lib/logger";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe/client";
import { isDepositCheckoutSession } from "@/lib/stripe/webhooks";

export type UnifiedSyncPaymentResult = {
  success: boolean;
  kind: "invoice" | "deposit" | "unknown";
  skipped?: string;
  documentId?: string;
  transitioned?: boolean;
  sessionId?: string;
  notificationCreated?: boolean;
  emailSent?: boolean;
};

export async function syncPaymentFromCheckoutSessionId(
  sessionId: string,
): Promise<UnifiedSyncPaymentResult> {
  const trimmed = sessionId.trim();
  if (!trimmed) {
    return { success: false, kind: "unknown", skipped: "missing_session_id" };
  }

  if (!isStripeConfigured()) {
    return {
      success: false,
      kind: "unknown",
      skipped: "stripe_not_configured",
      sessionId: trimmed,
    };
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(trimmed, {
      expand: ["payment_intent"],
    });

    if (isDepositCheckoutSession(session)) {
      const result = await syncQuoteDepositPaymentFromCheckoutSession(
        session,
        trimmed,
      );
      return {
        success: result.success,
        kind: "deposit",
        skipped: result.skipped,
        documentId: result.quoteId,
        transitioned: result.transitioned,
        sessionId: trimmed,
        notificationCreated: result.notificationCreated,
        emailSent: result.emailSent,
      };
    }

    const result = await syncInvoicePaymentFromCheckoutSessionId(trimmed);
    return {
      success: result.success,
      kind: "invoice",
      skipped: result.skipped,
      documentId: result.invoiceId,
      transitioned: result.transitioned,
      sessionId: trimmed,
      notificationCreated: result.notificationCreated,
      emailSent: result.emailSent,
    };
  } catch (error) {
    logServerError("syncPaymentFromCheckoutSessionId", error, { sessionId: trimmed });
    return {
      success: false,
      kind: "unknown",
      skipped: "retrieve_failed",
      sessionId: trimmed,
    };
  }
}
