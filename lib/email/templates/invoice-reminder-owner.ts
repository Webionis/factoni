import { escapeHtml } from "@/lib/email/helpers";
import { buildFactoniEmailHtml } from "@/lib/email/templates/base";
import { siteConfig } from "@/lib/site";
import { reminderTypeLabel, type InvoiceReminderType } from "@/lib/invoices/reminder-types";

export interface InvoiceReminderOwnerEmailParams {
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  reminderType: InvoiceReminderType;
  ownerName?: string | null;
}

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (process.env.NODE_ENV === "production"
      ? siteConfig.productionUrl
      : siteConfig.url)
  );
}

export function buildInvoiceReminderOwnerEmail(
  params: InvoiceReminderOwnerEmailParams,
): { subject: string; text: string; html: string } {
  const isManual = params.reminderType === "manual";
  const typeLabel = reminderTypeLabel(params.reminderType);
  const subject = isManual
    ? `Relance manuelle envoyée — ${params.invoiceNumber}`
    : `Relance automatique envoyée — ${params.invoiceNumber}`;
  const greeting = params.ownerName?.trim()
    ? `Bonjour ${params.ownerName.trim()},`
    : "Bonjour,";
  const invoiceUrl = `${appBaseUrl()}/invoices/${params.invoiceId}`;

  const intro = isManual
    ? `Une relance manuelle a été envoyée au client ${params.clientName} pour la facture ${params.invoiceNumber}.`
    : `Une relance automatique a été envoyée au client ${params.clientName} pour la facture ${params.invoiceNumber}.`;

  const text = `${greeting}

${intro}

Type : ${typeLabel}

Voir la facture : ${invoiceUrl}

—
${siteConfig.name}`;

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">${escapeHtml(greeting)}</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
      ${escapeHtml(intro)}
    </p>
    <p style="margin:0;font-size:14px;color:#64748b;">
      Type : <strong style="color:#0f172a;">${escapeHtml(typeLabel)}</strong>
    </p>`;

  const html = buildFactoniEmailHtml({
    preheader: intro,
    title: isManual ? "Relance manuelle envoyée" : "Relance automatique envoyée",
    bodyHtml,
    buttons: [{ label: "Voir la facture", href: invoiceUrl, variant: "primary" }],
  });

  return { subject, text, html };
}
