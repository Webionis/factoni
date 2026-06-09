import { sanitizePdfFilename } from "@/lib/pdf/format";

function baseName(
  invoiceNumber: string | null,
  invoiceId: string,
): string {
  if (invoiceNumber?.trim()) {
    return sanitizePdfFilename(invoiceNumber.trim());
  }
  return sanitizePdfFilename(`brouillon-${invoiceId.slice(0, 8)}`);
}

export function buildInvoicePdfFilename(
  invoiceNumber: string | null,
  invoiceId: string,
  documentType: "invoice" | "quote" = "invoice",
): string {
  const core = baseName(invoiceNumber, invoiceId);
  if (documentType === "quote") {
    return invoiceNumber ? `Devis-${core}.pdf` : `Brouillon-devis-${core}.pdf`;
  }
  return invoiceNumber ? `Facture-${core}.pdf` : `Brouillon-facture-${core}.pdf`;
}

export function buildPaymentReceiptFilename(
  invoiceNumber: string | null,
  invoiceId: string,
): string {
  const core = baseName(invoiceNumber, invoiceId);
  return `Recu-paiement-${core}.pdf`;
}
