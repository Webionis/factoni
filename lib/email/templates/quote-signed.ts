import { escapeHtml } from "@/lib/email/helpers";
import { buildFactoniEmailHtml } from "@/lib/email/templates/base";
import { formatFrenchDateTime } from "@/lib/format/datetime";
import { formatCurrency } from "@/lib/invoices/calculate";
import { siteConfig } from "@/lib/site";

export interface QuoteSignedEmailContentParams {
  quoteId: string;
  quoteNumber: string;
  clientName: string;
  acceptedByName: string;
  totalTtc: number;
  signedAt: string;
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

export function buildQuoteSignedEmailSubject(quoteNumber: string): string {
  return `🎉 Votre devis ${quoteNumber} a été signé`;
}

export function buildQuoteSignedEmailContent(
  params: QuoteSignedEmailContentParams,
): { subject: string; text: string; html: string } {
  const subject = buildQuoteSignedEmailSubject(params.quoteNumber);
  const signedAtLabel = formatFrenchDateTime(params.signedAt);
  const amountLabel = `${formatCurrency(params.totalTtc)} TTC`;
  const greeting = params.ownerName?.trim()
    ? `Bonjour ${params.ownerName.trim()},`
    : "Bonjour,";
  const quoteUrl = `${appBaseUrl()}/quotes/${params.quoteId}`;

  const text = `${greeting}

Votre client ${params.clientName} vient de signer le devis :

${params.quoteNumber}

Montant accepté :
${amountLabel}

Signataire :
${params.acceptedByName}

Date de signature :
${signedAtLabel}

Le devis est désormais validé et prêt à être transformé en facture.

Voir le devis : ${quoteUrl}

—
${siteConfig.name}`;

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">${escapeHtml(greeting)}</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
      Votre client <strong style="color:#0f172a;">${escapeHtml(params.clientName)}</strong> vient de signer le devis :
    </p>
    <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0f172a;font-family:ui-monospace,Menlo,monospace;">${escapeHtml(params.quoteNumber)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Montant accepté</p>
          <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0f172a;">${escapeHtml(amountLabel)}</p>
          <p style="margin:0 0 4px;font-size:13px;color:#64748b;">Signataire</p>
          <p style="margin:0 0 12px;font-size:15px;color:#0f172a;">${escapeHtml(params.acceptedByName)}</p>
          <p style="margin:0 0 4px;font-size:13px;color:#64748b;">Date de signature</p>
          <p style="margin:0;font-size:15px;color:#0f172a;">${escapeHtml(signedAtLabel)}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">
      Le devis est désormais validé et prêt à être transformé en facture.
    </p>`;

  const html = buildFactoniEmailHtml({
    preheader: `${params.clientName} a signé le devis ${params.quoteNumber}`,
    title: "Devis signé avec succès",
    bodyHtml,
    buttons: [
      { label: "Voir le devis", href: quoteUrl, variant: "primary" },
      { label: "Transformer en facture", href: quoteUrl, variant: "secondary" },
    ],
  });

  return { subject, text, html };
}
