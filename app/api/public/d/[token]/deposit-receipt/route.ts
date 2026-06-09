import {
  getPublicDocumentByToken,
  publicDocumentToInvoiceDetail,
} from "@/lib/data/public-documents";
import { normalizeQuoteDepositStatus } from "@/lib/quotes/deposit";
import { pdfAttachmentResponse } from "@/lib/http/pdf-response";
import { logServerError } from "@/lib/logger";
import { prepareDepositReceiptPdfData } from "@/lib/pdf/prepare-deposit-receipt-data";
import { renderDepositReceiptPdf } from "@/lib/pdf/render-deposit-receipt-pdf";
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
  if ((doc.document_type ?? "invoice") !== "quote") {
    return new Response("Document introuvable", { status: 404 });
  }

  if (normalizeQuoteDepositStatus(doc.quote_deposit_status) !== "paid") {
    return new Response("Reçu non disponible", { status: 403 });
  }

  try {
    const detail = publicDocumentToInvoiceDetail(payload);
    const pdfData = prepareDepositReceiptPdfData(detail);
    const buffer = await renderDepositReceiptPdf(pdfData);
    return pdfAttachmentResponse(buffer, pdfData.filename);
  } catch (error) {
    logServerError("public-deposit-receipt", error, { token });
    const message =
      error instanceof Error ? error.message : "Erreur génération reçu";
    return new Response(message, { status: 500 });
  }
}
