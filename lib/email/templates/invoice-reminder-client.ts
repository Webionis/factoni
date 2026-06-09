import { escapeHtml } from "@/lib/email/helpers";
import {
  buildFactoniEmailHtml,
  type EmailButton,
} from "@/lib/email/templates/base";
import { formatCurrency } from "@/lib/invoices/calculate";
import { formatReminderDueDate } from "@/lib/invoices/reminder-template-vars";

export interface InvoiceReminderClientEmailParams {
  subject: string;
  clientName: string;
  companyName: string;
  invoiceNumber: string;
  totalTtc: number;
  dueDate: string;
  publicDocumentUrl: string;
  clientPortalUrl?: string | null;
  messageBody: string;
}

export function buildInvoiceReminderClientEmail(
  params: InvoiceReminderClientEmailParams,
): { subject: string; text: string; html: string } {
  const subject = params.subject;
  const amountLabel = `${formatCurrency(params.totalTtc)} TTC`;
  const dueDateLabel = formatReminderDueDate(params.dueDate);

  const text = params.messageBody;

  const paragraphs = params.messageBody
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(
      (block) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;white-space:pre-wrap;">${escapeHtml(block)}</p>`,
    )
    .join("");

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
      Bonjour <strong style="color:#0f172a;">${escapeHtml(params.clientName)}</strong>,
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:13px;color:#64748b;">Facture</p>
          <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0f172a;font-family:ui-monospace,Menlo,monospace;">${escapeHtml(params.invoiceNumber)}</p>
          <p style="margin:0 0 4px;font-size:13px;color:#64748b;">Montant TTC</p>
          <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0f172a;">${escapeHtml(amountLabel)}</p>
          <p style="margin:0 0 4px;font-size:13px;color:#64748b;">Échéance</p>
          <p style="margin:0;font-size:15px;color:#0f172a;">${escapeHtml(dueDateLabel)}</p>
        </td>
      </tr>
    </table>
    ${paragraphs}
    <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#64748b;">
      Merci de ne pas tenir compte de ce message si le paiement a déjà été effectué.
    </p>`;

  const buttons: EmailButton[] = [
    {
      label: "Voir la facture",
      href: params.publicDocumentUrl,
      variant: "primary",
    },
  ];

  if (params.clientPortalUrl?.trim()) {
    buttons.push({
      label: "Mon espace client",
      href: params.clientPortalUrl.trim(),
      variant: "secondary",
    });
  }

  const html = buildFactoniEmailHtml({
    preheader: `Rappel de paiement — ${params.invoiceNumber} (${amountLabel})`,
    title: "Rappel de paiement",
    bodyHtml,
    buttons,
  });

  return { subject, text, html };
}
