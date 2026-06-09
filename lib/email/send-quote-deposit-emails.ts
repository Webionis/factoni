import { sendTransactionalEmail } from "@/lib/email/send";
import {
  buildQuoteDepositPaidEmailContent,
  type QuoteDepositPaidEmailParams,
} from "@/lib/email/templates/quote-deposit-paid";
import {
  buildQuoteDepositRequestedEmailContent,
  type QuoteDepositRequestedEmailParams,
} from "@/lib/email/templates/quote-deposit-requested";
import { logServerError } from "@/lib/logger";

export async function sendQuoteDepositRequestedEmail(
  to: string,
  params: QuoteDepositRequestedEmailParams,
  quoteId: string,
): Promise<boolean> {
  const email = to.trim();
  if (!email) return false;

  const { subject, text, html } = buildQuoteDepositRequestedEmailContent(params);
  const result = await sendTransactionalEmail({
    to: email,
    subject,
    text,
    html,
    templateKind: "quote_deposit_requested",
    documentId: quoteId,
  });

  if (!result.ok) {
    logServerError("sendQuoteDepositRequestedEmail", result.error, { quoteId });
    return false;
  }
  return true;
}

export async function sendQuoteDepositPaidEmail(
  ownerEmail: string,
  params: QuoteDepositPaidEmailParams,
  quoteId: string,
): Promise<boolean> {
  const email = ownerEmail.trim();
  if (!email) return false;

  const { subject, text, html } = buildQuoteDepositPaidEmailContent(params);
  const result = await sendTransactionalEmail({
    to: email,
    subject,
    text,
    html,
    templateKind: "quote_deposit_paid",
    documentId: quoteId,
  });

  if (!result.ok) {
    logServerError("sendQuoteDepositPaidEmail", result.error, { quoteId });
    return false;
  }
  return true;
}
