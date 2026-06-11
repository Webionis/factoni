import { formatCurrency } from "@/lib/invoices/calculate";

export function buildQuoteSignatureMailtoDefaults(params: {
  clientName: string;
  companyName: string;
  quoteNumber: string;
  totalTtc: number;
  publicDocumentUrl: string;
  clientPortalUrl?: string | null;
  interventionLocationLine?: string | null;
}): { subject: string; message: string } {
  const subject = `Votre devis ${params.quoteNumber} — ${params.companyName}`;
  const locationLine = params.interventionLocationLine
    ? `\n${params.interventionLocationLine}\n`
    : "";
  const message = `Bonjour ${params.clientName},

Je vous transmets votre devis ${params.quoteNumber} d'un montant de ${formatCurrency(params.totalTtc)} TTC.
${locationLine}
Vous pouvez le consulter, le télécharger et le signer en ligne depuis le lien sécurisé ci-dessous :

${params.publicDocumentUrl.trim()}
${params.clientPortalUrl ? `\n\nRetrouvez tous vos documents dans votre espace client :\n${params.clientPortalUrl.trim()}` : ""}

Une fois le devis signé, je pourrai poursuivre la prestation et générer la facture correspondante.

N'hésitez pas à me contacter si vous avez la moindre question.

Cordialement,

${params.companyName}`;

  return { subject, message };
}
