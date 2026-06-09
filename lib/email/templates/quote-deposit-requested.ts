import { formatCurrency } from "@/lib/invoices/calculate";

export interface QuoteDepositRequestedEmailParams {
  clientName: string;
  companyName: string;
  quoteNumber: string;
  depositAmount: number;
  totalTtc: number;
  paymentUrl: string;
  clientPortalUrl?: string | null;
}

export function buildQuoteDepositRequestedEmailSubject(
  companyName: string,
): string {
  return `Demande d'acompte — ${companyName}`;
}

export function buildQuoteDepositRequestedEmailContent(
  params: QuoteDepositRequestedEmailParams,
): { subject: string; text: string; html: string } {
  const subject = buildQuoteDepositRequestedEmailSubject(params.companyName);
  const depositLabel = formatCurrency(params.depositAmount);
  const totalLabel = formatCurrency(params.totalTtc);

  const text = [
    `Bonjour ${params.clientName},`,
    "",
    `${params.companyName} vous demande un acompte pour le devis ${params.quoteNumber}.`,
    "",
    `Montant de l'acompte : ${depositLabel}`,
    `Montant total du devis : ${totalLabel}`,
    "",
    `Réglez l'acompte en ligne : ${params.paymentUrl}`,
    params.clientPortalUrl
      ? `\nRetrouvez tous vos documents dans votre espace client : ${params.clientPortalUrl}`
      : "",
    "",
    "Merci pour votre confiance.",
  ].join("\n");

  const html = `
    <p>Bonjour <strong>${params.clientName}</strong>,</p>
    <p><strong>${params.companyName}</strong> vous demande un acompte pour le devis <strong>${params.quoteNumber}</strong>.</p>
    <ul>
      <li>Montant de l'acompte : <strong>${depositLabel}</strong></li>
      <li>Montant total du devis : ${totalLabel}</li>
    </ul>
    <p><a href="${params.paymentUrl}">Payer l'acompte en ligne</a></p>
    <p>Merci pour votre confiance.</p>
  `;

  return { subject, text, html };
}
