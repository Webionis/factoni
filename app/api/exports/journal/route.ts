import { requireAccountingExportAccess } from "@/lib/exports/auth";
import { buildSimpleExcel } from "@/lib/exports/excel";
import { loadFilteredInvoices } from "@/lib/exports/generate-invoices";
import { buildExportLabel, recordExportHistory } from "@/lib/exports/history";
import { parseInvoiceExportFilters } from "@/lib/exports/invoice-export";
import { buildExportResponse } from "@/lib/exports/response";
import {
  buildSalesJournalCsv,
  buildSalesJournalTableData,
  journalExportFilename,
} from "@/lib/exports/sales-journal-export";
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
  const format: ExportFormat =
    formatParam === "xlsx" ? "xlsx" : "csv";

  const filters = parseInvoiceExportFilters(searchParams);
  const invoices = await loadFilteredInvoices(
    auth.supabase,
    auth.user.id,
    filters,
  );

  const filename = journalExportFilename(format);

  if (format === "xlsx") {
    const table = buildSalesJournalTableData(invoices, filters);
    const buffer = await buildSimpleExcel({
      sheetName: "Journal",
      headers: table.headers,
      rows: table.rows,
    });
    await recordExportHistory(auth.supabase, {
      userId: auth.user.id,
      exportType: "journal",
      format,
      label: buildExportLabel({
        exportType: "journal",
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      }),
      filters: { ...filters, format },
      rowCount: table.rows.length,
      fileSizeBytes: buffer.length,
    });
    return buildExportResponse({
      body: new Uint8Array(buffer),
      format,
      filename,
      rowCount: table.rows.length,
      isBeta: auth.access.isBeta,
    });
  }

  const csv = buildSalesJournalCsv(invoices, filters);
  const rowCount = csv.split("\r\n").length - 2;
  const size = new TextEncoder().encode(csv).length;

  await recordExportHistory(auth.supabase, {
    userId: auth.user.id,
    exportType: "journal",
    format,
    label: buildExportLabel({
      exportType: "journal",
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
    filters: { ...filters, format },
    rowCount: Math.max(0, rowCount),
    fileSizeBytes: size,
  });

  return buildExportResponse({
    body: csv,
    format: "csv",
    filename,
    rowCount: Math.max(0, rowCount),
    isBeta: auth.access.isBeta,
  });
}
