import { sendTransactionalEmail } from "@/lib/email/send";
import {
  buildInvoicePaidEmailContent,
  type InvoicePaidEmailContentParams,
} from "@/lib/email/templates/invoice-paid";
import { logServerError } from "@/lib/logger";

export interface SendInvoicePaidEmailParams extends InvoicePaidEmailContentParams {
  ownerEmail: string;
}

/**
 * Notifie l'artisan par email (Resend) qu'un client a payé une facture.
 * Ne lève pas d'exception — le paiement reste valide même si l'email échoue.
 */
export async function sendInvoicePaidEmail(
  params: SendInvoicePaidEmailParams,
): Promise<boolean> {
  const ownerEmail = params.ownerEmail.trim();
  if (!ownerEmail) {
    logServerError("sendInvoicePaidEmail", "owner_email_missing", {
      invoiceId: params.invoiceId,
    });
    return false;
  }

  const { subject, text, html } = buildInvoicePaidEmailContent(params);

  const result = await sendTransactionalEmail({
    to: ownerEmail,
    subject,
    text,
    html,
    templateKind: "invoice_paid",
    documentId: params.invoiceId,
  });

  if (!result.ok) {
    logServerError("sendInvoicePaidEmail", result.error, {
      invoiceId: params.invoiceId,
      code: result.code,
    });
    return false;
  }

  return true;
}
