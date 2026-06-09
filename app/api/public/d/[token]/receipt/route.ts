import {
  getPublicDocumentByToken,
  publicDocumentToInvoiceDetail,
} from "@/lib/data/public-documents";
import { canDownloadPaymentReceipt } from "@/lib/invoices/receipt-eligibility";
import { pdfAttachmentResponse } from "@/lib/http/pdf-response";
import { logServerError } from "@/lib/logger";
import { preparePaymentReceiptPdfData } from "@/lib/pdf/prepare-receipt-data";
import { renderPaymentReceiptPdf } from "@/lib/pdf/render-payment-receipt-pdf";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;

  const supabase = await createClient();
  const payload = await getPublicDocumentByToken(supabase, token);

  if (!payload) {
    return new Response("Document introuvable", { status: 404 });
  }

  const doc = payload.document;
  if ((doc.document_type ?? "invoice") !== "invoice") {
    return new Response("Document introuvable", { status: 404 });
  }

  if (!canDownloadPaymentReceipt(doc)) {
    return new Response("Reçu non disponible", { status: 403 });
  }

  try {
    const detail = publicDocumentToInvoiceDetail(payload);
    const pdfData = preparePaymentReceiptPdfData(detail);
    const buffer = await renderPaymentReceiptPdf(pdfData);

    return pdfAttachmentResponse(buffer, pdfData.filename);
  } catch (error) {
    logServerError("public-payment-receipt", error, { token });
    const message =
      error instanceof Error ? error.message : "Erreur génération reçu";
    return new Response(message, { status: 500 });
  }
}
