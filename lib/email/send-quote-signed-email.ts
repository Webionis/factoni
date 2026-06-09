import { sendTransactionalEmail } from "@/lib/email/send";
import {
  buildQuoteSignedEmailContent,
  type QuoteSignedEmailContentParams,
} from "@/lib/email/templates/quote-signed";
import { logServerError } from "@/lib/logger";

export interface SendQuoteSignedEmailParams extends QuoteSignedEmailContentParams {
  ownerEmail: string;
}

/**
 * Notifie l'artisan par email (Resend) qu'un client a signé un devis.
 * Ne lève pas d'exception — la signature reste valide même si l'email échoue.
 */
export async function sendQuoteSignedEmail(
  params: SendQuoteSignedEmailParams,
): Promise<void> {
  const ownerEmail = params.ownerEmail.trim();
  if (!ownerEmail) {
    logServerError("sendQuoteSignedEmail", "owner_email_missing", {
      quoteId: params.quoteId,
    });
    return;
  }

  const { subject, text, html } = buildQuoteSignedEmailContent(params);

  const result = await sendTransactionalEmail({
    to: ownerEmail,
    subject,
    text,
    html,
    templateKind: "quote_signed",
    documentId: params.quoteId,
  });

  if (!result.ok) {
    logServerError("sendQuoteSignedEmail", result.error, {
      quoteId: params.quoteId,
      code: result.code,
    });
  }
}
