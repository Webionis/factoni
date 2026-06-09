import { sendTransactionalEmail } from "@/lib/email/send";
import { buildInvoiceReminderClientEmail } from "@/lib/email/templates/invoice-reminder-client";
import { buildInvoiceReminderOwnerEmail } from "@/lib/email/templates/invoice-reminder-owner";
import type { InvoiceReminderType } from "@/lib/invoices/reminder-types";
import { logServerError } from "@/lib/logger";

export interface SendInvoiceReminderClientEmailParams {
  subject: string;
  invoiceId: string;
  clientEmail: string;
  clientName: string;
  companyName: string;
  invoiceNumber: string;
  totalTtc: number;
  dueDate: string;
  publicDocumentUrl: string;
  clientPortalUrl?: string | null;
  messageBody: string;
}

export async function sendInvoiceReminderClientEmail(
  params: SendInvoiceReminderClientEmailParams,
): Promise<{ ok: boolean; providerMessageId: string | null; error?: string }> {
  const { subject, text, html } = buildInvoiceReminderClientEmail(params);

  const result = await sendTransactionalEmail({
    to: params.clientEmail,
    subject,
    text,
    html,
    templateKind: "invoice_reminder",
    documentId: params.invoiceId,
  });

  if (!result.ok) {
    logServerError("sendInvoiceReminderClientEmail", result.error, {
      invoiceId: params.invoiceId,
      code: result.code,
    });
    return { ok: false, providerMessageId: null, error: result.error };
  }

  return { ok: true, providerMessageId: result.providerMessageId };
}

export interface SendInvoiceReminderOwnerEmailParams {
  ownerEmail: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  reminderType: InvoiceReminderType;
  ownerName?: string | null;
}

export async function sendInvoiceReminderOwnerEmail(
  params: SendInvoiceReminderOwnerEmailParams,
): Promise<boolean> {
  const ownerEmail = params.ownerEmail.trim();
  if (!ownerEmail) return false;

  const { subject, text, html } = buildInvoiceReminderOwnerEmail(params);

  const result = await sendTransactionalEmail({
    to: ownerEmail,
    subject,
    text,
    html,
    templateKind: "invoice_reminder",
    documentId: params.invoiceId,
  });

  if (!result.ok) {
    logServerError("sendInvoiceReminderOwnerEmail", result.error, {
      invoiceId: params.invoiceId,
    });
    return false;
  }

  return true;
}
