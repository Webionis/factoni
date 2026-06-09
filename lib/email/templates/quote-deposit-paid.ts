import { formatCurrency } from "@/lib/invoices/calculate";

export interface QuoteDepositPaidEmailParams {
  ownerName: string;
  clientName: string;
  quoteNumber: string;
  depositAmount: number;
  paidAtLabel: string;
  quoteUrl: string;
  receiptUrl: string;
}

export function buildQuoteDepositPaidEmailSubject(
  quoteNumber: string,
): string {
  return `Acompte reçu — ${quoteNumber}`;
}

export function buildQuoteDepositPaidEmailContent(
  params: QuoteDepositPaidEmailParams,
): { subject: string; text: string; html: string } {
  const subject = buildQuoteDepositPaidEmailSubject(params.quoteNumber);
  const amountLabel = formatCurrency(params.depositAmount);

  const text = [
    `Bonjour ${params.ownerName},`,
    "",
    `Un acompte de ${amountLabel} a été reçu de ${params.clientName} pour le devis ${params.quoteNumber}.`,
    `Date de paiement : ${params.paidAtLabel}`,
    "",
    `Voir le devis : ${params.quoteUrl}`,
    `Télécharger le reçu : ${params.receiptUrl}`,
  ].join("\n");

  const html = `
    <p>Bonjour <strong>${params.ownerName}</strong>,</p>
    <p>Un acompte de <strong>${amountLabel}</strong> a été reçu de <strong>${params.clientName}</strong> pour le devis <strong>${params.quoteNumber}</strong>.</p>
    <p>Date de paiement : ${params.paidAtLabel}</p>
    <p><a href="${params.quoteUrl}">Voir le devis</a> · <a href="${params.receiptUrl}">Télécharger le reçu</a></p>
  `;

  return { subject, text, html };
}
