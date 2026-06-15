import { getQuoteById } from "@/lib/data/quotes";
import { buildFacturXFilename } from "@/lib/factur-x/filenames";
import { renderInvoiceFacturX } from "@/lib/factur-x/render-factur-x";
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

  if (!quote || quote.user_id !== user.id || quote.document_type !== "quote") {
    return new Response("Document introuvable", { status: 404 });
  }

  if (quote.invoice_lines.length === 0) {
    return new Response("Devis sans lignes", { status: 400 });
  }

  try {
    const pdfData = await prepareInvoicePdfData(quote, supabase, user.id);
    const pdfBuffer = await renderInvoicePdf(pdfData);
    const facturXBuffer = await renderInvoiceFacturX(pdfBuffer, pdfData);
    const filename = buildFacturXFilename(
      quote.invoice_number,
      quote.id,
      "quote",
    );

    return pdfAttachmentResponse(facturXBuffer, filename, "private, no-cache");
  } catch (error) {
    logServerError("factur-x", error, { quoteId: id });
    const message =
      error instanceof Error ? error.message : "Erreur génération Factur-X";
    return new Response(message, { status: 500 });
  }
}
