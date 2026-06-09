import { NextResponse } from "next/server";

import { applyInvoicePaidFromCheckoutSession } from "@/lib/invoices/mark-paid-from-stripe";
import { applyQuoteDepositPaidFromCheckoutSession } from "@/lib/quotes/mark-deposit-paid-from-stripe";
import { isDepositCheckoutSession } from "@/lib/stripe/webhooks";
import { logStripeDepositWebhook } from "@/lib/quotes/deposit-paid-transition-log";
import { logStripeWebhook } from "@/lib/invoices/paid-transition-log";
import { logServerError } from "@/lib/logger";
import { isStripeConfigured } from "@/lib/stripe/client";
import { constructStripeWebhookEvent } from "@/lib/stripe/webhooks";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe désactivé." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  const payload = await request.text();

  let event;
  try {
    event = constructStripeWebhookEvent(payload, signature);
  } catch (error) {
    logServerError("stripe.webhook.signature", error);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  logStripeWebhook("event_received", {
    type: event.type,
    eventId: event.id,
  });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    logStripeWebhook("checkout_completed", {
      eventId: event.id,
      sessionId: session.id,
      paymentStatus: session.payment_status,
      metadata: session.metadata ?? null,
    });

    try {
      if (isDepositCheckoutSession(session)) {
        logStripeDepositWebhook("deposit_detected", {
          eventId: event.id,
          sessionId: session.id,
          quoteId: session.metadata?.quote_id ?? null,
          metadata: session.metadata ?? null,
        });
      }

      const result = isDepositCheckoutSession(session)
        ? await applyQuoteDepositPaidFromCheckoutSession(session, event.id)
        : await applyInvoicePaidFromCheckoutSession(session, event.id);

      logStripeWebhook("checkout_result", {
        eventId: event.id,
        sessionId: session.id,
        ...result,
      });

      if (!result.handled && result.skipped !== "already_processed") {
        logServerError("stripe.webhook.checkout_completed.skipped", result.skipped, {
          eventId: event.id,
          documentId:
            "invoiceId" in result
              ? result.invoiceId
              : "quoteId" in result
                ? result.quoteId
                : undefined,
        });
      }
    } catch (error) {
      logServerError("stripe.webhook.checkout_completed", error, {
        eventId: event.id,
      });
      return NextResponse.json({ error: "Traitement échoué." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
