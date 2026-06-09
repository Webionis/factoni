import { requireAccountingExportAccess } from "@/lib/exports/auth";
import { generateInvoiceExport } from "@/lib/exports/generate-invoices";
import { buildExportLabel, recordExportHistory } from "@/lib/exports/history";
import {
  parseInvoiceExportFilters,
} from "@/lib/exports/invoice-export";
import { buildExportResponse } from "@/lib/exports/response";
import type { ExportFormat } from "@/lib/exports/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAccountingExportAccess();
  if (!auth.ok) {
    return new Response(auth.message, { status: auth.status });
  }

  const searchParams = new URL(request.url).searchParams;
  const formatParam = searchParams.get("format") ?? "csv";
  const validFormats: ExportFormat[] = ["csv", "xlsx", "pdf"];
  const format = validFormats.includes(formatParam as ExportFormat)
    ? (formatParam as ExportFormat)
    : "csv";

  const filters = parseInvoiceExportFilters(searchParams);

  const generated = await generateInvoiceExport({
    supabase: auth.supabase,
    userId: auth.user.id,
    filters,
    format,
  });

  await recordExportHistory(auth.supabase, {
    userId: auth.user.id,
    exportType: "invoices",
    format,
    label: buildExportLabel({
      exportType: "invoices",
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
    filters: { ...filters, format },
    rowCount: generated.rowCount,
    fileSizeBytes: generated.fileSizeBytes,
  });

  return buildExportResponse({
    body: generated.body,
    format,
    filename: generated.filename,
    rowCount: generated.rowCount,
    isBeta: auth.access.isBeta,
  });
}
