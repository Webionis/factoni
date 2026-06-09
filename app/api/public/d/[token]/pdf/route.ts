import {
  getPublicDocumentByToken,
  publicDocumentToInvoiceDetail,
} from "@/lib/data/public-documents";
import { pdfAttachmentResponse } from "@/lib/http/pdf-response";
import { logServerError } from "@/lib/logger";
import { prepareInvoicePdfData } from "@/lib/pdf/prepare-data";
import { renderInvoicePdf } from "@/lib/pdf/render-invoice-pdf";
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

  if (!payload || payload.lines.length === 0) {
    return new Response("Document introuvable", { status: 404 });
  }

  try {
    const detail = publicDocumentToInvoiceDetail(payload);
    const pdfData = await prepareInvoicePdfData(
      detail,
      supabase,
      detail.user_id,
    );
    const buffer = await renderInvoicePdf(pdfData);

    return pdfAttachmentResponse(buffer, pdfData.filename, "private, no-store");
  } catch (error) {
    logServerError("public-document-pdf", error, { token });
    const message =
      error instanceof Error ? error.message : "Erreur génération PDF";
    return new Response(message, { status: 500 });
  }
}
