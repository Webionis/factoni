import { escapeHtml } from "@/lib/email/helpers";
import { buildFactoniEmailHtml } from "@/lib/email/templates/base";
import { formatCurrency } from "@/lib/invoices/calculate";
import { siteConfig } from "@/lib/site";

export interface InvoicePaidEmailContentParams {
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  totalTtc: number;
  paidAt: string;
  ownerName?: string | null;
}

function formatPaidAt(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (process.env.NODE_ENV === "production"
      ? siteConfig.productionUrl
      : siteConfig.url)
  );
}

export function buildInvoicePaidEmailSubject(invoiceNumber: string): string {
  return `🎉 Votre facture ${invoiceNumber} a été payée`;
}

export function buildInvoicePaidEmailContent(
  params: InvoicePaidEmailContentParams,
): { subject: string; text: string; html: string } {
  const subject = buildInvoicePaidEmailSubject(params.invoiceNumber);
  const paidAtLabel = formatPaidAt(params.paidAt);
  const amountLabel = `${formatCurrency(params.totalTtc)} TTC`;
  const greeting = params.ownerName?.trim()
    ? `Bonjour ${params.ownerName.trim()},`
    : "Bonjour,";
  const invoiceUrl = `${appBaseUrl()}/invoices/${params.invoiceId}`;

  const text = `${greeting}

Votre client ${params.clientName} vient de payer la facture :

${params.invoiceNumber}

Montant payé :
${amountLabel}

Date de paiement :
${paidAtLabel}

La facture est désormais marquée comme payée dans ${siteConfig.name}.

Voir la facture : ${invoiceUrl}

—
${siteConfig.name}`;

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">${escapeHtml(greeting)}</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
      Votre client <strong style="color:#0f172a;">${escapeHtml(params.clientName)}</strong> vient de payer la facture :
    </p>
    <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0f172a;font-family:ui-monospace,Menlo,monospace;">${escapeHtml(params.invoiceNumber)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:13px;color:#64748b;">Montant payé</p>
          <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0f172a;">${escapeHtml(amountLabel)}</p>
          <p style="margin:0 0 4px;font-size:13px;color:#64748b;">Date de paiement</p>
          <p style="margin:0;font-size:15px;color:#0f172a;">${escapeHtml(paidAtLabel)}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">
      La facture est désormais marquée comme payée dans ${escapeHtml(siteConfig.name)}.
    </p>`;

  const html = buildFactoniEmailHtml({
    preheader: `${params.clientName} a payé la facture ${params.invoiceNumber} (${amountLabel})`,
    title: "Facture payée avec succès",
    bodyHtml,
    buttons: [{ label: "Voir la facture", href: invoiceUrl, variant: "primary" }],
  });

  return { subject, text, html };
}
