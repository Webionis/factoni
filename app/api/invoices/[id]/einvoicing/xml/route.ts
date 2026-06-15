import { getInvoiceById } from "@/lib/data/invoices";
import { renderInvoiceFacturXXml } from "@/lib/factur-x/render-xml";
import { logServerError } from "@/lib/logger";
import { prepareInvoicePdfData } from "@/lib/pdf/prepare-data";
import { createClient } from "@/lib/supabase/server";

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

  if (invoice.invoice_lines.length === 0) {
    return new Response("Facture sans lignes", { status: 400 });
  }

  try {
    const pdfData = await prepareInvoicePdfData(invoice, supabase, user.id);
    const xml = renderInvoiceFacturXXml(pdfData);
    const core = pdfData.invoiceNumber?.trim() || invoice.id.slice(0, 8);
    const filename = `Facture-${core}-factur-x.xml`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    logServerError("einvoicing-xml", error, { invoiceId: id });
    const message =
      error instanceof Error ? error.message : "Erreur génération XML";
    return new Response(message, { status: 500 });
  }
}
