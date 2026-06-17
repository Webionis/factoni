import type Stripe from "stripe";

import { getStripeClient } from "@/lib/stripe/client";
import { logServerError } from "@/lib/logger";

export type BillingHistoryStatus = "paid" | "pending" | "failed";

export interface BillingHistoryEntry {
  id: string;
  dateIso: string;
  label: string;
  amountCents: number;
  currency: string;
  status: BillingHistoryStatus;
  documentUrl: string | null;
}

function invoiceLabel(invoice: Stripe.Invoice): string {
  const lineDescription = invoice.lines?.data?.[0]?.description?.trim();
  if (lineDescription) {
    return lineDescription;
  }

  switch (invoice.billing_reason) {
    case "subscription_create":
      return "Abonnement Factoni";
    case "subscription_cycle":
      return "Renouvellement d'abonnement";
    case "subscription_update":
      return "Mise à jour d'abonnement";
    case "manual":
      return "Paiement";
    default:
      return "Facture d'abonnement";
  }
}

function mapInvoiceStatus(
  status: Stripe.Invoice.Status | null,
): BillingHistoryStatus {
  switch (status) {
    case "paid":
      return "paid";
    case "open":
    case "draft":
      return "pending";
    default:
      return "failed";
  }
}

function isDuplicateCheckoutPayment(
  session: Stripe.Checkout.Session,
  invoices: Stripe.Invoice[],
): boolean {
  const sessionAmount = session.amount_total ?? 0;
  const sessionTime = session.created;

  return invoices.some((invoice) => {
    if (invoice.amount_paid !== sessionAmount) {
      return false;
    }

    const invoiceTime =
      invoice.status_transitions?.paid_at ?? invoice.created ?? 0;
    return Math.abs(invoiceTime - sessionTime) < 300;
  });
}

function checkoutSessionLabel(session: Stripe.Checkout.Session): string {
  if (session.metadata?.target_plan === "pro") {
    return "Passage à Factoni Pro";
  }
  if (session.metadata?.target_plan === "starter") {
    return "Passage à Factoni Starter";
  }
  return "Complément d'abonnement";
}

function invoiceEntryDate(invoice: Stripe.Invoice): Date {
  const paidAt = invoice.status_transitions?.paid_at;
  if (paidAt) {
    return new Date(paidAt * 1000);
  }
  return new Date(invoice.created * 1000);
}

async function fetchCheckoutReceiptUrl(sessionId: string): Promise<string | null> {
  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent.latest_charge"],
    });

    const paymentIntent = session.payment_intent;
    if (!paymentIntent || typeof paymentIntent === "string") {
      return null;
    }

    const charge = paymentIntent.latest_charge;
    if (!charge || typeof charge === "string") {
      return null;
    }

    return charge.receipt_url ?? null;
  } catch {
    return null;
  }
}

function toEntry(
  partial: Omit<BillingHistoryEntry, "dateIso"> & { date: Date },
): BillingHistoryEntry {
  return {
    id: partial.id,
    dateIso: partial.date.toISOString(),
    label: partial.label,
    amountCents: partial.amountCents,
    currency: partial.currency,
    status: partial.status,
    documentUrl: partial.documentUrl,
  };
}

export async function fetchBillingHistory(
  stripeCustomerId: string,
): Promise<BillingHistoryEntry[]> {
  const customerId = stripeCustomerId.trim();
  if (!customerId) {
    return [];
  }

  try {
    const stripe = getStripeClient();
    const [invoicesResult, sessionsResult] = await Promise.all([
      stripe.invoices.list({ customer: customerId, limit: 24 }),
      stripe.checkout.sessions.list({ customer: customerId, limit: 24 }),
    ]);

    const entries: BillingHistoryEntry[] = [];

    for (const invoice of invoicesResult.data) {
      if (invoice.status === "draft" || invoice.status === "void") {
        continue;
      }

      if (invoice.status === "paid" && invoice.amount_paid === 0) {
        continue;
      }

      entries.push(
        toEntry({
          id: `invoice_${invoice.id}`,
          date: invoiceEntryDate(invoice),
          label: invoiceLabel(invoice),
          amountCents: invoice.amount_paid,
          currency: invoice.currency ?? "eur",
          status: mapInvoiceStatus(invoice.status),
          documentUrl:
            invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? null,
        }),
      );
    }

    const upgradeSessions = sessionsResult.data.filter(
      (session) =>
        session.mode === "payment" &&
        session.payment_status === "paid" &&
        session.metadata?.factoni_billing === "upgrade_payment" &&
        !isDuplicateCheckoutPayment(session, invoicesResult.data),
    );

    const receiptUrls = await Promise.all(
      upgradeSessions.map((session) => fetchCheckoutReceiptUrl(session.id)),
    );

    upgradeSessions.forEach((session, index) => {
      entries.push(
        toEntry({
          id: `checkout_${session.id}`,
          date: new Date(session.created * 1000),
          label: checkoutSessionLabel(session),
          amountCents: session.amount_total ?? 0,
          currency: session.currency ?? "eur",
          status: "paid",
          documentUrl: receiptUrls[index],
        }),
      );
    });

    entries.sort(
      (a, b) =>
        new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime(),
    );

    return entries;
  } catch (error) {
    logServerError("billing.fetch_history", error, { stripeCustomerId });
    return [];
  }
}
