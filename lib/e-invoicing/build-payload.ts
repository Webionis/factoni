import { renderInvoiceFacturX } from "@/lib/factur-x/render-factur-x";
import { renderInvoiceFacturXXml } from "@/lib/factur-x/render-xml";
import { renderInvoicePdf } from "@/lib/pdf/render-invoice-pdf";
import type { InvoicePdfData } from "@/lib/pdf/types";

import type { EinvoicingPayload } from "@/lib/e-invoicing/types";

export async function buildEinvoicingPayload(
  pdfData: InvoicePdfData,
): Promise<EinvoicingPayload> {
  const pdfBuffer = await renderInvoicePdf(pdfData);
  const facturXBuffer = await renderInvoiceFacturX(pdfBuffer, pdfData);
  const xml = renderInvoiceFacturXXml(pdfData);

  if (!pdfData.invoiceNumber?.trim()) {
    throw new Error("Numéro de facture requis pour la transmission.");
  }

  return {
    xml,
    pdf: facturXBuffer,
    invoiceNumber: pdfData.invoiceNumber.trim(),
    profile: "EN16931",
    format: "factur-x",
  };
}
