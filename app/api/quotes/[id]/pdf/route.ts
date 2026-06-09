import { getQuoteById } from "@/lib/data/quotes";
import { pdfAttachmentResponse } from "@/lib/http/pdf-response";
import { logServerError } from "@/lib/logger";
import { prepareInvoicePdfData } from "@/lib/pdf/prepare-data";
import { renderInvoicePdf } from "@/lib/pdf/render-invoice-pdf";
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

  if (quote.invoice_lines.length === 0) {
    return new Response("Devis sans lignes", { status: 400 });
  }

  try {
    const pdfData = await prepareInvoicePdfData(quote, supabase, user.id);
    const buffer = await renderInvoicePdf(pdfData);

    return pdfAttachmentResponse(buffer, pdfData.filename, "private, no-cache");
  } catch (error) {
    logServerError("quote-pdf", error, { quoteId: id });
    const message =
      error instanceof Error ? error.message : "Erreur génération PDF";
    return new Response(message, { status: 500 });
  }
}
