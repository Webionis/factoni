import type Stripe from "stripe";

import { getInvoiceById } from "@/lib/data/invoices";
import {
  logInvoicePaid,
  logStripePayment,
} from "@/lib/invoices/paid-transition-log";
import { runInvoicePaidSideEffects } from "@/lib/invoices/schedule-invoice-paid-side-effects";
import { logServerError } from "@/lib/logger";
import {
  extractCheckoutStripeRefs,
  resolveCheckoutSessionInvoiceId,
} from "@/lib/stripe/webhooks";
import { createAdminClient } from "@/lib/supabase/admin";
import { toInvoiceStatus } from "@/lib/invoices/status";

export type MarkInvoicePaidResult = {
  handled: boolean;
  skipped?: string;
  invoiceId?: string;
  transitioned?: boolean;
  notificationCreated?: boolean;
  emailSent?: boolean;
};

async function persistStripeRefsOptional(
  admin: ReturnType<typeof createAdminClient>,
  invoiceId: string,
  stripeRefs: ReturnType<typeof extractCheckoutStripeRefs>,
): Promise<void> {
  const { error } = await admin
    .from("invoices")
    .update({
      stripe_payment_intent_id: stripeRefs.paymentIntentId,
      stripe_checkout_session_id: stripeRefs.checkoutSessionId,
    })
    .eq("id", invoiceId);

  if (error?.code === "42703") {
    logStripePayment("stripe_refs_skipped", {
      invoiceId,
      reason: "columns_not_migrated",
    });
    return;
  }

  if (error) {
    logServerError("persistStripeRefsOptional", error, { invoiceId });
  }
}

async function runPaidSideEffects(
  invoiceId: string,
  source: string,
  options: {
    transitioned: boolean;
    previousStatus?: ReturnType<typeof toInvoiceStatus>;
    paidAt?: string | null;
    publicToken?: string | null;
  },
): Promise<{ notificationCreated: boolean; emailSent: boolean }> {
  return runInvoicePaidSideEffects(invoiceId, {
    source,
    transitioned: options.transitioned,
    previousStatus: options.previousStatus,
    paidAt: options.paidAt ?? undefined,
    publicToken: options.publicToken,
  });
}

export async function applyInvoicePaidFromCheckoutSession(
  session: Stripe.Checkout.Session,
  stripeEventId?: string | null,
): Promise<MarkInvoicePaidResult> {
  const admin = createAdminClient();
  const invoiceIdEarly = await resolveCheckoutSessionInvoiceId(session);
  const source = stripeEventId?.startsWith("sync_checkout_")
    ? "stripe_sync"
    : "stripe_webhook";

  logStripePayment("start", {
    invoiceId: invoiceIdEarly,
    sessionId: session.id,
    paymentStatus: session.payment_status,
    stripeEventId: stripeEventId ?? null,
    source,
    metadata: session.metadata ?? null,
  });

  if (session.payment_status !== "paid") {
    logStripePayment("payment_not_paid", {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      invoiceId: invoiceIdEarly,
    });
    return {
      handled: false,
      skipped: "payment_not_paid",
      invoiceId: invoiceIdEarly ?? undefined,
    };
  }

  const invoiceId = invoiceIdEarly;
  if (!invoiceId) {
    logStripePayment("missing_invoice_id", {
      sessionId: session.id,
      metadata: session.metadata ?? null,
    });
    return { handled: false, skipped: "missing_invoice_id" };
  }

  if (stripeEventId) {
    const { data: existingEvent } = await admin
      .from("stripe_webhook_events")
      .select("id")
      .eq("stripe_event_id", stripeEventId)
      .maybeSingle();

    if (existingEvent) {
      logStripePayment("already_processed", { stripeEventId, invoiceId, source });
      const invoice = await getInvoiceById(admin, invoiceId);
      let sideEffects = { notificationCreated: false, emailSent: false };
      if (invoice && toInvoiceStatus(invoice.status) === "paid") {
        sideEffects = await runPaidSideEffects(invoiceId, `${source}:already_processed`, {
          transitioned: false,
          paidAt: invoice.paid_at,
          publicToken: invoice.public_document_token,
        });
      }
      return {
        handled: true,
        skipped: "already_processed",
        invoiceId,
        transitioned: false,
        ...sideEffects,
      };
    }
  }

  const invoice = await getInvoiceById(admin, invoiceId);
  if (!invoice) {
    logStripePayment("invoice_not_found", { invoiceId, sessionId: session.id });
    return { handled: false, skipped: "invoice_not_found", invoiceId };
  }

  if (invoice.document_type !== "invoice") {
    return { handled: false, skipped: "not_invoice", invoiceId };
  }

  const status = toInvoiceStatus(invoice.status);
  const stripeRefs = extractCheckoutStripeRefs(session);

  logStripePayment("current_status", { invoiceId, status, source });

  if (status === "paid") {
    if (stripeEventId) {
      await admin.from("stripe_webhook_events").upsert(
        {
          stripe_event_id: stripeEventId,
          event_type: "checkout.session.completed",
        },
        { onConflict: "stripe_event_id", ignoreDuplicates: true },
      );
    }

    await persistStripeRefsOptional(admin, invoiceId, stripeRefs);

    logStripePayment("update_paid_result", {
      invoiceId,
      transitioned: false,
      alreadyPaid: true,
      source,
    });

    logInvoicePaid("skipped_already_paid", { invoiceId, source: `${source}:already_paid` });

    const sideEffects = await runPaidSideEffects(invoiceId, `${source}:already_paid`, {
      transitioned: false,
      paidAt: invoice.paid_at,
      publicToken: invoice.public_document_token,
    });

    return {
      handled: true,
      skipped: "already_paid",
      invoiceId,
      transitioned: false,
      ...sideEffects,
    };
  }

  if (status !== "sent" && status !== "overdue") {
    logStripePayment("invalid_status", {
      invoiceId,
      currentStatus: status,
      sessionId: session.id,
    });
    return { handled: false, skipped: "invalid_status", invoiceId };
  }

  logStripePayment("update_paid_attempt", { invoiceId, previousStatus: status, source });

  const paidAt = new Date().toISOString();
  const { data: updated, error: updateError } = await admin
    .from("invoices")
    .update({
      status: "paid",
      paid_at: paidAt,
    })
    .eq("id", invoiceId)
    .eq("document_type", "invoice")
    .in("status", ["sent", "overdue"])
    .select("id, status, paid_at, public_document_token")
    .maybeSingle();

  if (updateError) {
    logStripePayment("update_failed", {
      invoiceId,
      error: updateError.message,
      code: updateError.code,
    });
    return { handled: false, skipped: "update_failed", invoiceId };
  }

  if (!updated || updated.status !== "paid") {
    const current = await getInvoiceById(admin, invoiceId);
    if (current && toInvoiceStatus(current.status) === "paid") {
      if (stripeEventId) {
        await admin.from("stripe_webhook_events").upsert(
          {
            stripe_event_id: stripeEventId,
            event_type: "checkout.session.completed",
          },
          { onConflict: "stripe_event_id", ignoreDuplicates: true },
        );
      }

      logStripePayment("update_paid_result", {
        invoiceId,
        transitioned: false,
        alreadyPaid: true,
        recovered: true,
        source,
      });

      await runPaidSideEffects(invoiceId, `${source}:no_matching_row`, {
        transitioned: false,
        paidAt: current.paid_at,
        publicToken: current.public_document_token,
      });

      return {
        handled: true,
        skipped: "no_matching_row_recovered",
        invoiceId,
        transitioned: false,
      };
    }

    logStripePayment("no_matching_row", {
      invoiceId,
      previousStatus: status,
      sessionId: session.id,
    });
    return { handled: false, skipped: "no_matching_row", invoiceId };
  }

  await persistStripeRefsOptional(admin, invoiceId, stripeRefs);

  if (stripeEventId) {
    const { error: eventError } = await admin.from("stripe_webhook_events").insert({
      stripe_event_id: stripeEventId,
      event_type: "checkout.session.completed",
    });

    if (eventError && eventError.code !== "23505") {
      logServerError("applyInvoicePaidFromCheckoutSession.event", eventError, {
        stripeEventId,
      });
    }
  }

  logStripePayment("update_paid_result", {
    invoiceId,
    transitioned: true,
    alreadyPaid: false,
    paidAt: updated.paid_at,
    source,
  });

  const sideEffects = await runPaidSideEffects(invoiceId, source, {
    transitioned: true,
    previousStatus: status,
    paidAt: updated.paid_at ?? paidAt,
    publicToken: updated.public_document_token ?? invoice.public_document_token,
  });

  return { handled: true, invoiceId, transitioned: true, ...sideEffects };
}

/** @deprecated Utiliser applyInvoicePaidFromCheckoutSession */
export async function markInvoicePaidFromCheckoutSession(
  session: Stripe.Checkout.Session,
  stripeEventId: string,
): Promise<MarkInvoicePaidResult> {
  return applyInvoicePaidFromCheckoutSession(session, stripeEventId);
}
