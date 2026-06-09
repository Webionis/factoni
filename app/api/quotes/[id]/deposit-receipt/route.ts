import { getQuoteById } from "@/lib/data/quotes";
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

  const quote = await getQuoteById(supabase, id);
  if (!quote || quote.user_id !== user.id) {
    return new Response("Devis introuvable", { status: 404 });
  }

  if (normalizeQuoteDepositStatus(quote.quote_deposit_status) !== "paid") {
    return new Response("Reçu non disponible", { status: 403 });
  }

  try {
    const pdfData = prepareDepositReceiptPdfData(quote);
    const buffer = await renderDepositReceiptPdf(pdfData);
    return pdfAttachmentResponse(buffer, pdfData.filename, "private, no-cache");
  } catch (error) {
    logServerError("quote-deposit-receipt", error, { quoteId: id });
    const message =
      error instanceof Error ? error.message : "Erreur génération reçu";
    return new Response(message, { status: 500 });
  }
}
