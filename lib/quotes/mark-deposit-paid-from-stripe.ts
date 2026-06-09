import type Stripe from "stripe";

import { getQuoteById } from "@/lib/data/quotes";
import { logServerError } from "@/lib/logger";
import {
  createBalanceInvoiceFromQuote,
  createDepositPaidInvoice,
} from "@/lib/quotes/create-balance-invoice";
import { logDepositPaid } from "@/lib/quotes/deposit-paid-transition-log";
import { normalizeQuoteDepositStatus } from "@/lib/quotes/deposit";
import { runQuoteDepositPaidSideEffects } from "@/lib/quotes/schedule-deposit-paid-side-effects";
import {
  extractCheckoutStripeRefs,
  isDepositCheckoutSession,
  resolveCheckoutSessionQuoteId,
} from "@/lib/stripe/webhooks";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeQuoteStatus } from "@/lib/quotes/status";
import type { QuoteDetail } from "@/lib/data/quotes";

export type MarkDepositPaidResult = {
  handled: boolean;
  skipped?: string;
  quoteId?: string;
  transitioned?: boolean;
  notificationCreated?: boolean;
  emailSent?: boolean;
};

async function ensureDepositInvoices(
  admin: ReturnType<typeof createAdminClient>,
  quote: QuoteDetail,
  depositAmount: number,
  remainingBalance: number,
  paidAt: string,
  stripeRefs: ReturnType<typeof extractCheckoutStripeRefs>,
): Promise<{
  depositInvoiceId: string | null;
  balanceInvoiceId: string | null;
}> {
  let depositInvoiceId = quote.quote_deposit_invoice_id;
  let balanceInvoiceId = quote.quote_balance_invoice_id;

  if (!depositInvoiceId) {
    depositInvoiceId = await createDepositPaidInvoice(
      admin,
      quote,
      depositAmount,
      paidAt,
      stripeRefs,
    );
    if (!depositInvoiceId) {
      logDepositPaid("deposit_invoice_failed", { quoteId: quote.id });
      return { depositInvoiceId: null, balanceInvoiceId: null };
    }

    const { error } = await admin
      .from("invoices")
      .update({ quote_deposit_invoice_id: depositInvoiceId })
      .eq("id", quote.id)
      .eq("document_type", "quote");

    if (error) {
      logServerError("ensureDepositInvoices.deposit_link", error, {
        quoteId: quote.id,
        depositInvoiceId,
      });
    }
  }

  if (!balanceInvoiceId) {
    balanceInvoiceId = await createBalanceInvoiceFromQuote(
      admin,
      quote,
      depositAmount,
      remainingBalance,
    );
    if (!balanceInvoiceId) {
      logDepositPaid("balance_invoice_failed", { quoteId: quote.id });
      return { depositInvoiceId, balanceInvoiceId: null };
    }

    const { error } = await admin
      .from("invoices")
      .update({ quote_balance_invoice_id: balanceInvoiceId })
      .eq("id", quote.id)
      .eq("document_type", "quote");

    if (error) {
      logServerError("ensureDepositInvoices.balance_link", error, {
        quoteId: quote.id,
        balanceInvoiceId,
      });
    }
  }

  return { depositInvoiceId, balanceInvoiceId };
}

export async function applyQuoteDepositPaidFromCheckoutSession(
  session: Stripe.Checkout.Session,
  stripeEventId?: string | null,
): Promise<MarkDepositPaidResult> {
  const admin = createAdminClient();
  const quoteIdEarly = await resolveCheckoutSessionQuoteId(session);
  const source = stripeEventId?.startsWith("sync_checkout_")
    ? "stripe_sync"
    : "stripe_webhook";

  logDepositPaid("start", {
    quoteId: quoteIdEarly,
    sessionId: session.id,
    paymentStatus: session.payment_status,
    depositPayment: session.metadata?.deposit_payment ?? null,
    source,
    stripeEventId: stripeEventId ?? null,
  });

  if (!isDepositCheckoutSession(session)) {
    logDepositPaid("skipped_not_deposit", { sessionId: session.id });
    return { handled: false, skipped: "not_deposit_payment" };
  }

  if (session.payment_status !== "paid") {
    logDepositPaid("skipped_payment_not_paid", {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      quoteId: quoteIdEarly,
    });
    return {
      handled: false,
      skipped: "payment_not_paid",
      quoteId: quoteIdEarly ?? undefined,
    };
  }

  const quoteId = quoteIdEarly;
  if (!quoteId) {
    logDepositPaid("skipped_missing_quote_id", {
      sessionId: session.id,
      metadata: session.metadata ?? null,
    });
    return { handled: false, skipped: "missing_quote_id" };
  }

  if (stripeEventId) {
    const { data: existingEvent } = await admin
      .from("stripe_webhook_events")
      .select("id")
      .eq("stripe_event_id", stripeEventId)
      .maybeSingle();

    if (existingEvent) {
      const quote = await getQuoteById(admin, quoteId);
      if (
        quote &&
        normalizeQuoteDepositStatus(quote.quote_deposit_status) === "paid"
      ) {
        logDepositPaid("already_processed_event", { stripeEventId, quoteId });
        const sideEffects = await runQuoteDepositPaidSideEffects(quoteId, {
          source: `${source}:already_processed`,
          transitioned: false,
          paidAt: quote.quote_deposit_paid_at ?? undefined,
          publicToken: quote.public_document_token,
        });
        return {
          handled: true,
          skipped: "already_processed",
          quoteId,
          transitioned: false,
          ...sideEffects,
        };
      }
      logDepositPaid("event_exists_retry_processing", { stripeEventId, quoteId });
    }
  }

  let quote = await getQuoteById(admin, quoteId);
  if (!quote) {
    logDepositPaid("quote_not_found", { quoteId, sessionId: session.id });
    return { handled: false, skipped: "quote_not_found", quoteId };
  }

  if (quote.document_type !== "quote") {
    return { handled: false, skipped: "not_quote", quoteId };
  }

  const depositStatus = normalizeQuoteDepositStatus(quote.quote_deposit_status);
  const stripeRefs = extractCheckoutStripeRefs(session);
  const depositAmount = Number(quote.quote_deposit_amount);
  const remainingBalance =
    quote.remaining_balance_amount != null
      ? Number(quote.remaining_balance_amount)
      : Number(quote.total_ttc) - depositAmount;

  if (depositStatus === "paid") {
    logDepositPaid("recover_already_paid", { quoteId, source });

    const invoices = await ensureDepositInvoices(
      admin,
      quote,
      depositAmount,
      remainingBalance,
      quote.quote_deposit_paid_at ?? new Date().toISOString(),
      stripeRefs,
    );

    if (stripeEventId) {
      await admin.from("stripe_webhook_events").upsert(
        {
          stripe_event_id: stripeEventId,
          event_type: "checkout.session.completed",
        },
        { onConflict: "stripe_event_id", ignoreDuplicates: true },
      );
    }

    const sideEffects = await runQuoteDepositPaidSideEffects(quoteId, {
      source: `${source}:already_paid`,
      transitioned: false,
      paidAt: quote.quote_deposit_paid_at ?? undefined,
      publicToken: quote.public_document_token,
      balanceInvoiceId: invoices.balanceInvoiceId ?? undefined,
      depositInvoiceId: invoices.depositInvoiceId ?? undefined,
    });

    return {
      handled: true,
      skipped: "already_paid",
      quoteId,
      transitioned: false,
      ...sideEffects,
    };
  }

  const quoteStatus = normalizeQuoteStatus(quote.status);
  if (quoteStatus !== "accepted" && quoteStatus !== "deposit_requested") {
    logDepositPaid("invalid_status", { quoteId, quoteStatus });
    return { handled: false, skipped: "invalid_status", quoteId };
  }

  if (depositStatus !== "requested") {
    logDepositPaid("deposit_not_requested", { quoteId, depositStatus });
    return { handled: false, skipped: "deposit_not_requested", quoteId };
  }

  if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
    return { handled: false, skipped: "invalid_deposit_amount", quoteId };
  }

  const paidAt = new Date().toISOString();

  logDepositPaid("update_quote_attempt", { quoteId, source });

  const { data: updated, error: updateError } = await admin
    .from("invoices")
    .update({
      status: "deposit_paid",
      quote_deposit_status: "paid",
      quote_deposit_paid_at: paidAt,
      deposit_payment_intent_id: stripeRefs.paymentIntentId,
      deposit_checkout_session_id: stripeRefs.checkoutSessionId,
    })
    .eq("id", quoteId)
    .eq("document_type", "quote")
    .eq("quote_deposit_status", "requested")
    .select("id, quote_deposit_paid_at, public_document_token")
    .maybeSingle();

  if (updateError) {
    logServerError("applyQuoteDepositPaid.update", updateError, { quoteId });
    logDepositPaid("update_failed", { quoteId, error: updateError.message });
    return { handled: false, skipped: "update_failed", quoteId };
  }

  if (!updated) {
    const current = await getQuoteById(admin, quoteId);
    if (
      current &&
      normalizeQuoteDepositStatus(current.quote_deposit_status) === "paid"
    ) {
      logDepositPaid("update_race_recovered", { quoteId, source });
      const invoices = await ensureDepositInvoices(
        admin,
        current,
        depositAmount,
        remainingBalance,
        current.quote_deposit_paid_at ?? paidAt,
        stripeRefs,
      );
      const sideEffects = await runQuoteDepositPaidSideEffects(quoteId, {
        source: `${source}:race_recovered`,
        transitioned: false,
        paidAt: current.quote_deposit_paid_at ?? undefined,
        publicToken: current.public_document_token,
        balanceInvoiceId: invoices.balanceInvoiceId ?? undefined,
        depositInvoiceId: invoices.depositInvoiceId ?? undefined,
      });
      return {
        handled: true,
        skipped: "race_recovered",
        quoteId,
        transitioned: false,
        ...sideEffects,
      };
    }
    logDepositPaid("update_no_matching_row", { quoteId, source });
    return { handled: false, skipped: "no_matching_row", quoteId };
  }

  logDepositPaid("update_success", {
    quoteId,
    paidAt: updated.quote_deposit_paid_at,
    source,
  });

  quote = (await getQuoteById(admin, quoteId)) ?? quote;

  const invoices = await ensureDepositInvoices(
    admin,
    quote,
    depositAmount,
    remainingBalance,
    updated.quote_deposit_paid_at ?? paidAt,
    stripeRefs,
  );

  if (stripeEventId) {
    const { error: eventError } = await admin.from("stripe_webhook_events").insert({
      stripe_event_id: stripeEventId,
      event_type: "checkout.session.completed",
    });
    if (eventError && eventError.code !== "23505") {
      logServerError("applyQuoteDepositPaid.event", eventError, { stripeEventId });
    }
  }

  const sideEffects = await runQuoteDepositPaidSideEffects(quoteId, {
    source,
    transitioned: true,
    paidAt: updated.quote_deposit_paid_at ?? paidAt,
    publicToken: updated.public_document_token,
    depositAmount,
    balanceInvoiceId: invoices.balanceInvoiceId ?? undefined,
    depositInvoiceId: invoices.depositInvoiceId ?? undefined,
  });

  logDepositPaid("complete", {
    quoteId,
    transitioned: true,
    notificationCreated: sideEffects.notificationCreated,
    emailSent: sideEffects.emailSent,
    depositInvoiceId: invoices.depositInvoiceId,
    balanceInvoiceId: invoices.balanceInvoiceId,
    source,
  });

  return {
    handled: true,
    quoteId,
    transitioned: true,
    ...sideEffects,
  };
}
