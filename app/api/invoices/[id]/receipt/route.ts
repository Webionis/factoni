import { getInvoiceById } from "@/lib/data/invoices";
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
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Non authentifié", { status: 401 });
  }

  const invoice = await getInvoiceById(supabase, id);

  if (
    !invoice ||
    invoice.user_id !== user.id ||
    invoice.document_type !== "invoice"
  ) {
    return new Response("Document introuvable", { status: 404 });
  }

  if (!canDownloadPaymentReceipt(invoice)) {
    return new Response("Reçu non disponible", { status: 403 });
  }

  try {
    const pdfData = preparePaymentReceiptPdfData(invoice);
    const buffer = await renderPaymentReceiptPdf(pdfData);

    return pdfAttachmentResponse(buffer, pdfData.filename, "private, no-cache");
  } catch (error) {
    logServerError("invoice-payment-receipt", error, { invoiceId: id });
    const message =
      error instanceof Error ? error.message : "Erreur génération reçu";
    return new Response(message, { status: 500 });
  }
}
