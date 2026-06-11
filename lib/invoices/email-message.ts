import { formatCurrency } from "@/lib/invoices/calculate";

export function buildInvoiceMailtoDefaults(params: {
  clientName: string;
  companyName: string;
  invoiceNumber: string;
  totalTtc: number;
  publicDocumentUrl: string;
  clientPortalUrl?: string | null;
  interventionLocationLine?: string | null;
}): { subject: string; message: string } {
  const subject = `Votre facture ${params.invoiceNumber} — ${params.companyName}`;
  const locationLine = params.interventionLocationLine
    ? `\n${params.interventionLocationLine}\n`
    : "";
  const message = `Bonjour ${params.clientName},

Je vous transmets la facture ${params.invoiceNumber} d'un montant de ${formatCurrency(params.totalTtc)} TTC.
${locationLine}
Vous pouvez la consulter, la télécharger et la régler en ligne depuis le lien sécurisé ci-dessous :

${params.publicDocumentUrl.trim()}
${params.clientPortalUrl ? `\n\nRetrouvez tous vos documents dans votre espace client :\n${params.clientPortalUrl.trim()}` : ""}

N'hésitez pas à me contacter si vous avez la moindre question.

Cordialement,

${params.companyName}`;

  return { subject, message };
}

/** Ajoute le lien public facture au corps d'une relance (sent / overdue). */
export function appendInvoiceReminderPublicLink(
  message: string,
  publicDocumentUrl: string,
): string {
  const trimmed = message.trimEnd();
  const url = publicDocumentUrl.trim();

  if (!url || trimmed.includes(url)) {
    return trimmed;
  }

  return `${trimmed}

Vous pouvez consulter et régler la facture en ligne via le lien sécurisé ci-dessous :

${url}`;
}
