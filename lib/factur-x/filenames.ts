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

export function buildFacturXFilename(
  invoiceNumber: string | null,
  invoiceId: string,
  documentType: "invoice" | "quote" = "invoice",
): string {
  const core = baseName(invoiceNumber, invoiceId);
  if (documentType === "quote") {
    return invoiceNumber ? `Devis-${core}-factur-x.pdf` : `Brouillon-devis-${core}-factur-x.pdf`;
  }
  return invoiceNumber
    ? `Facture-${core}-factur-x.pdf`
    : `Brouillon-facture-${core}-factur-x.pdf`;
}
