import { listQuotesForUser } from "@/lib/data/quotes";
import { requireAccountingExportAccess } from "@/lib/exports/auth";
import { buildSimpleExcel } from "@/lib/exports/excel";
import { buildExportLabel, recordExportHistory } from "@/lib/exports/history";
import {
  buildQuotesCsv,
  buildQuotesTableData,
  parseQuoteExportFilters,
  quotesExportFilename,
} from "@/lib/exports/quotes-export";
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
  const format: ExportFormat =
    formatParam === "xlsx" ? "xlsx" : "csv";

  const filters = parseQuoteExportFilters(searchParams);
  const quotes = await listQuotesForUser(auth.supabase, auth.user.id);
  const filename = quotesExportFilename(format);

  if (format === "xlsx") {
    const table = buildQuotesTableData(quotes, filters);
    const buffer = await buildSimpleExcel({
      sheetName: "Devis",
      headers: table.headers,
      rows: table.rows,
    });
    await recordExportHistory(auth.supabase, {
      userId: auth.user.id,
      exportType: "quotes",
      format,
      label: buildExportLabel({
        exportType: "quotes",
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

  const csv = buildQuotesCsv(quotes, filters);
  const rowCount = csv.split("\r\n").length - 2;
  const size = new TextEncoder().encode(csv).length;

  await recordExportHistory(auth.supabase, {
    userId: auth.user.id,
    exportType: "quotes",
    format,
    label: buildExportLabel({
      exportType: "quotes",
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
