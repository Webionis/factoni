import type Stripe from "stripe";

import { applyQuoteDepositPaidFromCheckoutSession } from "@/lib/quotes/mark-deposit-paid-from-stripe";
import { logStripeDepositSync } from "@/lib/quotes/deposit-paid-transition-log";
import { logServerError } from "@/lib/logger";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe/client";
import {
  isDepositCheckoutSession,
  resolveCheckoutSessionQuoteId,
} from "@/lib/stripe/webhooks";

export type SyncDepositPaymentResult = {
  success: boolean;
  skipped?: string;
  quoteId?: string;
  transitioned?: boolean;
  sessionId?: string;
  notificationCreated?: boolean;
  emailSent?: boolean;
};

export async function syncQuoteDepositPaymentFromCheckoutSessionId(
  sessionId: string,
): Promise<SyncDepositPaymentResult> {
  const trimmed = sessionId.trim();

  logStripeDepositSync("start", { sessionId: trimmed });

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

    const quoteId = await resolveCheckoutSessionQuoteId(session);

    logStripeDepositSync("session_loaded", {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      quoteId,
      depositPayment: isDepositCheckoutSession(session),
      metadata: session.metadata ?? null,
    });

    if (!isDepositCheckoutSession(session)) {
      return { success: false, skipped: "not_deposit_payment", sessionId: trimmed };
    }

    const result = await applyQuoteDepositPaidFromCheckoutSession(
      session,
      `sync_checkout_${trimmed}`,
    );

    const success =
      result.transitioned === true ||
      result.skipped === "already_paid" ||
      result.skipped === "already_processed" ||
      result.skipped === "race_recovered";

    logStripeDepositSync(success ? "complete" : "failed", {
      sessionId: trimmed,
      quoteId: result.quoteId,
      skipped: result.skipped,
      transitioned: result.transitioned,
      handled: result.handled,
    });

    return {
      success,
      skipped: result.skipped,
      quoteId: result.quoteId,
      transitioned: result.transitioned,
      sessionId: trimmed,
      notificationCreated: result.notificationCreated,
      emailSent: result.emailSent,
    };
  } catch (error) {
    logServerError("syncQuoteDepositPaymentFromCheckoutSessionId", error, {
      sessionId: trimmed,
    });
    logStripeDepositSync("exception", {
      sessionId: trimmed,
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, skipped: "retrieve_failed", sessionId: trimmed };
  }
}

export async function syncQuoteDepositPaymentFromCheckoutSession(
  session: Stripe.Checkout.Session,
  sessionId: string,
): Promise<SyncDepositPaymentResult> {
  const result = await applyQuoteDepositPaidFromCheckoutSession(
    session,
    `sync_checkout_${sessionId.trim()}`,
  );

  const success =
    result.transitioned === true ||
    result.skipped === "already_paid" ||
    result.skipped === "already_processed" ||
    result.skipped === "race_recovered";

  return {
    success,
    skipped: result.skipped,
    quoteId: result.quoteId,
    transitioned: result.transitioned,
    sessionId,
    notificationCreated: result.notificationCreated,
    emailSent: result.emailSent,
  };
}
