import { requireAccountingExportAccess } from "@/lib/exports/auth";
import { generateInvoiceExport } from "@/lib/exports/generate-invoices";
import { recordExportHistory, buildExportLabel } from "@/lib/exports/history";
import { parseInvoiceExportFilters } from "@/lib/exports/invoice-export";
import { buildExportResponse } from "@/lib/exports/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Rétrocompatibilité — délègue au générateur unifié (CSV). */
export async function GET(request: Request) {
  const auth = await requireAccountingExportAccess();
  if (!auth.ok) {
    return new Response(auth.message, { status: auth.status });
  }

  const filters = parseInvoiceExportFilters(
    new URL(request.url).searchParams,
  );

  const generated = await generateInvoiceExport({
    supabase: auth.supabase,
    userId: auth.user.id,
    filters,
    format: "csv",
  });

  await recordExportHistory(auth.supabase, {
    userId: auth.user.id,
    exportType: "invoices",
    format: "csv",
    label: buildExportLabel({
      exportType: "invoices",
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
    filters: { ...filters, format: "csv" },
    rowCount: generated.rowCount,
    fileSizeBytes: generated.fileSizeBytes,
  });

  return buildExportResponse({
    body: generated.body,
    format: "csv",
    filename: generated.filename,
    rowCount: generated.rowCount,
    isBeta: auth.access.isBeta,
  });
}
