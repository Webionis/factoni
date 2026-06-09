import {
  clientNameFromInvoice,
  clientNameFromSnapshot,
} from "@/lib/data/invoices";
import { getQuoteById } from "@/lib/data/quotes";
import {
  createQuoteDepositPaidNotification,
  hasQuoteDepositPaidNotification,
} from "@/lib/data/notifications";
import { sendQuoteDepositPaidEmail } from "@/lib/email/send-quote-deposit-emails";
import { logDepositPaid } from "@/lib/quotes/deposit-paid-transition-log";
import { normalizeQuoteDepositStatus } from "@/lib/quotes/deposit";
import { getAppBaseUrl } from "@/lib/stripe/client";
import { quoteDisplayNumber } from "@/lib/quotes/status";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { logServerError } from "@/lib/logger";

async function resolveOwnerEmail(
  userId: string,
): Promise<{ email: string | null; fullName: string | null }> {
  if (!isAdminClientConfigured()) {
    return { email: null, fullName: null };
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    logServerError("resolveOwnerEmail", error, { userId });
    return { email: null, fullName: null };
  }
  return {
    email: data?.email?.trim() ?? null,
    fullName: data?.full_name ?? null,
  };
}

export interface HandleDepositPaidSideEffectsContext {
  source: string;
  transitioned?: boolean;
  paidAt?: string;
}

export async function handleQuoteDepositPaidSideEffects(
  quoteId: string,
  context: HandleDepositPaidSideEffectsContext,
): Promise<{ notificationCreated: boolean; emailSent: boolean }> {
  logDepositPaid("side_effects_enter", { quoteId, source: context.source });

  const admin = createAdminClient();
  const quote = await getQuoteById(admin, quoteId);
  if (!quote) {
    logDepositPaid("side_effects_quote_missing", { quoteId });
    return { notificationCreated: false, emailSent: false };
  }

  if (normalizeQuoteDepositStatus(quote.quote_deposit_status) !== "paid") {
    logDepositPaid("side_effects_not_paid_yet", {
      quoteId,
      depositStatus: quote.quote_deposit_status,
    });
    return { notificationCreated: false, emailSent: false };
  }

  const quoteNumber = quoteDisplayNumber(quote.invoice_number, quote.id);
  const clientName =
    clientNameFromSnapshot(quote.client_snapshot) ??
    clientNameFromInvoice(quote);
  const depositAmount = Number(quote.quote_deposit_amount);
  const paidAt =
    context.paidAt ?? quote.quote_deposit_paid_at ?? new Date().toISOString();

  const alreadyNotified = await hasQuoteDepositPaidNotification(
    admin,
    quote.user_id,
    quote.id,
  );

  if (alreadyNotified) {
    logDepositPaid("side_effects_already_notified", { quoteId });
    return { notificationCreated: false, emailSent: false };
  }

  const notificationCreated = await createQuoteDepositPaidNotification({
    ownerUserId: quote.user_id,
    quoteId: quote.id,
    quoteNumber,
    clientName,
    depositAmount,
    paidAt,
  });

  let emailSent = false;

  if (notificationCreated) {
    const { email: ownerEmail, fullName } = await resolveOwnerEmail(quote.user_id);

    if (ownerEmail) {
      const baseUrl = getAppBaseUrl();
      const paidAtLabel = new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(paidAt));

      const publicToken = quote.public_document_token;
      const receiptUrl = publicToken
        ? `${baseUrl}/api/public/d/${publicToken}/deposit-receipt`
        : `${baseUrl}/quotes/${quote.id}`;

      emailSent = await sendQuoteDepositPaidEmail(
        ownerEmail,
        {
          ownerName: fullName ?? "Bonjour",
          clientName,
          quoteNumber,
          depositAmount,
          paidAtLabel,
          quoteUrl: `${baseUrl}/quotes/${quote.id}`,
          receiptUrl,
        },
        quote.id,
      );
    } else {
      logServerError("handleQuoteDepositPaidSideEffects", "owner_email_missing", {
        quoteId,
        source: context.source,
      });
    }
  }

  logDepositPaid("side_effects_exit", {
    quoteId,
    notificationCreated,
    emailSent,
    source: context.source,
  });

  return { notificationCreated, emailSent };
}
