import { requireAccountingExportAccess } from "@/lib/exports/auth";
import { generateInvoiceExport } from "@/lib/exports/generate-invoices";
import { getExportHistoryById } from "@/lib/exports/history";
import type { InvoiceExportFilters } from "@/lib/exports/invoice-export";
import { buildExportResponse } from "@/lib/exports/response";
import type { ExportFormat } from "@/lib/exports/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAccountingExportAccess();
  if (!auth.ok) {
    return new Response(auth.message, { status: auth.status });
  }

  const { id } = await context.params;
  const record = await getExportHistoryById(auth.supabase, auth.user.id, id);

  if (!record) {
    return new Response("Export introuvable", { status: 404 });
  }

  if (record.exportType !== "invoices") {
    return new Response(
      "Retéléchargement disponible uniquement pour les exports factures",
      { status: 400 },
    );
  }

  const filters = record.filters as unknown as InvoiceExportFilters & {
    format?: string;
  };
  const format = (filters.format ?? record.format) as ExportFormat;

  const generated = await generateInvoiceExport({
    supabase: auth.supabase,
    userId: auth.user.id,
    filters,
    format,
  });

  return buildExportResponse({
    body: generated.body,
    format,
    filename: generated.filename,
    rowCount: generated.rowCount,
    isBeta: auth.access.isBeta,
  });
}
