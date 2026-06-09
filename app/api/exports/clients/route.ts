import { requireAccountingExportAccess } from "@/lib/exports/auth";
import {
  buildClientsCsv,
  buildClientsTableData,
  clientsExportFilename,
  listClientsExportData,
} from "@/lib/exports/clients-export";
import { buildSimpleExcel } from "@/lib/exports/excel";
import { loadFilteredInvoices } from "@/lib/exports/generate-invoices";
import { buildExportLabel, recordExportHistory } from "@/lib/exports/history";
import { parseInvoiceExportFilters } from "@/lib/exports/invoice-export";
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

  const filters = parseInvoiceExportFilters(searchParams);
  const invoices = await loadFilteredInvoices(
    auth.supabase,
    auth.user.id,
    filters,
  );
  const rows = await listClientsExportData(
    auth.supabase,
    auth.user.id,
    invoices,
  );

  const filename = clientsExportFilename(format);

  if (format === "xlsx") {
    const table = buildClientsTableData(rows);
    const buffer = await buildSimpleExcel({
      sheetName: "Clients",
      headers: table.headers,
      rows: table.rows,
    });
    await recordExportHistory(auth.supabase, {
      userId: auth.user.id,
      exportType: "clients",
      format,
      label: buildExportLabel({ exportType: "clients" }),
      filters: { format },
      rowCount: rows.length,
      fileSizeBytes: buffer.length,
    });
    return buildExportResponse({
      body: new Uint8Array(buffer),
      format,
      filename,
      rowCount: rows.length,
      isBeta: auth.access.isBeta,
    });
  }

  const csv = buildClientsCsv(rows);
  const size = new TextEncoder().encode(csv).length;
  await recordExportHistory(auth.supabase, {
    userId: auth.user.id,
    exportType: "clients",
    format,
    label: buildExportLabel({ exportType: "clients" }),
    filters: { format },
    rowCount: rows.length,
    fileSizeBytes: size,
  });

  return buildExportResponse({
    body: csv,
    format: "csv",
    filename,
    rowCount: rows.length,
    isBeta: auth.access.isBeta,
  });
}
