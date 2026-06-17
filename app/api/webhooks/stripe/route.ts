import { NextResponse } from "next/server";

import { STRIPE_WEBHOOK_EVENTS } from "@/lib/billing/stripe/events";
import {
  handleCheckoutSessionCompleted,
  handleSubscriptionDeleted,
  recordBillingWebhookEvent,
  syncSubscriptionFromStripe,
  syncSubscriptionById,
} from "@/lib/billing/stripe/sync";
import {
  isBillingStripeConfigured,
  STRIPE_BILLING_ENABLED,
} from "@/lib/billing/stripe/config";
import {
  constructBillingWebhookEvent,
  getInvoiceSubscriptionId,
} from "@/lib/billing/stripe/webhooks";
import { logServerError } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!STRIPE_BILLING_ENABLED) {
    return NextResponse.json(
      { error: "Abonnements Factoni désactivés." },
      { status: 503 },
    );
  }

  if (!isBillingStripeConfigured()) {
    return NextResponse.json(
      { error: "Configuration Stripe billing incomplète." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  const payload = await request.text();

  let event;
  try {
    event = constructBillingWebhookEvent(payload, signature);
  } catch (error) {
    logServerError("billing.webhook.signature", error);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  if (
    !STRIPE_WEBHOOK_EVENTS.includes(
      event.type as (typeof STRIPE_WEBHOOK_EVENTS)[number],
    )
  ) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const shouldProcess = await recordBillingWebhookEvent(event.id, event.type);
  if (!shouldProcess) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.metadata?.factoni_billing === "subscription") {
          await handleCheckoutSessionCompleted(session);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await syncSubscriptionFromStripe(event.data.object);
        break;
      }
      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object);
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object;
        const subscriptionId = getInvoiceSubscriptionId(invoice);
        if (subscriptionId) {
          await syncSubscriptionById(subscriptionId);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = getInvoiceSubscriptionId(invoice);
        if (subscriptionId) {
          await syncSubscriptionById(subscriptionId);
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    logServerError("billing.webhook.handler", error, {
      eventId: event.id,
      eventType: event.type,
    });
    return NextResponse.json({ error: "Traitement webhook échoué." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
