"use server";

import { revalidatePath } from "next/cache";

import {
  actionErrorFromSupabase,
  type ActionResult,
} from "@/lib/actions/errors";
import { requireAuthenticatedUser } from "@/lib/actions/utils";
import { requireFeatureForUser } from "@/lib/billing/feature-guard";
import {
  clientNameFromInvoice,
  clientNameFromSnapshot,
} from "@/lib/data/invoices";
import { createQuoteDepositRequestedNotification } from "@/lib/data/notifications";
import { getQuoteById } from "@/lib/data/quotes";
import { getArtisanStripePaymentStatus } from "@/lib/data/stripe-connect";
import { ensureClientPortalUrl } from "@/lib/client-portal/tokens";
import { ensurePublicDocumentUrl } from "@/lib/data/public-documents";
import { sendQuoteDepositRequestedEmail } from "@/lib/email/send-quote-deposit-emails";
import { getInvoiceClientEmail } from "@/lib/invoices/client-contact";
import {
  calculateDepositAmount,
  validateDepositRequest,
  type QuoteDepositType,
} from "@/lib/quotes/deposit";
import { normalizeQuoteStatus, quoteDisplayNumber } from "@/lib/quotes/status";
import { parseCompanySnapshot } from "@/lib/pdf/parse-snapshots";
import { isStripeConfigured } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

export async function requestQuoteDepositAction(
  quoteId: string,
  type: QuoteDepositType,
  value: number,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const featureCheck = await requireFeatureForUser(
    supabase,
    user.id,
    "automation",
  );
  if (!featureCheck.ok) return { error: featureCheck.error };

  const quote = await getQuoteById(supabase, quoteId);
  if (!quote || quote.user_id !== user.id) {
    return { error: "Devis introuvable." };
  }

  const quoteStatus = normalizeQuoteStatus(quote.status);
  const validationError = validateDepositRequest({
    quoteStatus,
    depositStatus:
      quote.quote_deposit_status === "requested" ||
      quote.quote_deposit_status === "paid"
        ? quote.quote_deposit_status
        : "none",
    totalTtc: Number(quote.total_ttc),
    type,
    value,
  });

  if (validationError) {
    return { error: validationError };
  }

  if (!isStripeConfigured()) {
    return { error: "Les paiements en ligne ne sont pas disponibles." };
  }

  const stripeStatus = await getArtisanStripePaymentStatus(user.id);
  if (!stripeStatus?.isReadyForPayments) {
    return {
      error: "Activez les paiements Stripe Connect avant de demander un acompte.",
    };
  }

  const { depositAmount, remainingBalance } = calculateDepositAmount(
    Number(quote.total_ttc),
    type,
    value,
  );

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      status: "deposit_requested",
      quote_deposit_type: type,
      quote_deposit_value: value,
      quote_deposit_amount: depositAmount,
      quote_deposit_status: "requested",
      remaining_balance_amount: remainingBalance,
    })
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .eq("document_type", "quote")
    .eq("status", "accepted")
    .eq("quote_deposit_status", "none");

  if (updateError) {
    return actionErrorFromSupabase(updateError, "Erreur lors de la demande d'acompte");
  }

  const quoteNumber = quoteDisplayNumber(quote.invoice_number, quote.id);
  const clientName =
    clientNameFromSnapshot(quote.client_snapshot) ??
    clientNameFromInvoice(quote);
  const company = parseCompanySnapshot(quote.company_snapshot);
  const companyName = company?.party.name ?? "Entreprise";

  await createQuoteDepositRequestedNotification({
    ownerUserId: user.id,
    quoteId,
    quoteNumber,
    clientName,
    depositAmount,
  });

  const publicUrlResult = await ensurePublicDocumentUrl(
    supabase,
    quoteId,
    user.id,
  );
  const clientEmail = getInvoiceClientEmail(quote.clients, quote.client_snapshot);

  if (clientEmail && publicUrlResult.ok) {
    const portalResult = quote.client_id
      ? await ensureClientPortalUrl(supabase, quote.client_id, user.id)
      : null;

    await sendQuoteDepositRequestedEmail(
      clientEmail,
      {
        clientName,
        companyName,
        quoteNumber,
        depositAmount,
        totalTtc: Number(quote.total_ttc),
        paymentUrl: publicUrlResult.url,
        clientPortalUrl: portalResult?.ok ? portalResult.url : null,
      },
      quoteId,
    );
  }

  revalidatePath("/quotes");
  revalidatePath("/dashboard");
  revalidatePath(`/quotes/${quoteId}`);

  return { success: true };
}
