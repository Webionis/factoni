import type { SupabaseClient } from "@supabase/supabase-js";

import { getCompanyForUser } from "@/lib/auth/profile";
import type { InvoiceWithClientExport } from "@/lib/data/invoices";
import { listInvoicesForExport } from "@/lib/data/invoices";
import { buildExcelWorkbook } from "@/lib/exports/excel";
import { formatFrenchAmount, formatFrenchDate } from "@/lib/exports/formatting";
import {
  buildInvoicesCsv,
  buildInvoicesTableData,
  computeInvoiceExportSummary,
  exportFilename,
  filterInvoicesForExport,
  type InvoiceExportFilters,
} from "@/lib/exports/invoice-export";
import {
  renderAccountingPdf,
  type AccountingPdfRow,
} from "@/lib/exports/pdf-accounting";
import type { ExportFormat } from "@/lib/exports/types";
import { getEffectiveInvoiceStatus } from "@/lib/invoices/overdue";
import {
  INVOICE_STATUS_LABELS,
  invoiceDisplayNumber,
  toInvoiceStatus,
} from "@/lib/invoices/status";
import { parseClientSnapshot } from "@/lib/pdf/parse-snapshots";
import type { Database } from "@/types/database";

export interface GeneratedInvoiceExport {
  body: BodyInit;
  filename: string;
  rowCount: number;
  fileSizeBytes: number;
  summary: ReturnType<typeof computeInvoiceExportSummary>;
}

function clientName(invoice: InvoiceWithClientExport): string {
  const client = invoice.clients;
  if (client) {
    return client.company_name ?? client.name;
  }
  return parseClientSnapshot(invoice.client_snapshot)?.name ?? "";
}

function periodLabel(filters: InvoiceExportFilters): string {
  if (filters.dateFrom && filters.dateTo) {
    return `${formatFrenchDate(filters.dateFrom)} — ${formatFrenchDate(filters.dateTo)}`;
  }
  if (filters.dateFrom) return `Depuis ${formatFrenchDate(filters.dateFrom)}`;
  if (filters.dateTo) return `Jusqu'au ${formatFrenchDate(filters.dateTo)}`;
  return "Toutes périodes";
}

export async function loadFilteredInvoices(
  supabase: SupabaseClient<Database>,
  userId: string,
  filters: InvoiceExportFilters,
): Promise<InvoiceWithClientExport[]> {
  const invoices = await listInvoicesForExport(supabase, userId, {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    includeArchived: filters.includeArchived,
  });
  return filterInvoicesForExport(invoices, filters);
}

export async function generateInvoiceExport(params: {
  supabase: SupabaseClient<Database>;
  userId: string;
  filters: InvoiceExportFilters;
  format: ExportFormat;
}): Promise<GeneratedInvoiceExport> {
  const filtered = await loadFilteredInvoices(
    params.supabase,
    params.userId,
    params.filters,
  );
  const summary = computeInvoiceExportSummary(filtered);
  const filename = exportFilename(params.format);

  if (params.format === "csv") {
    const csv = buildInvoicesCsv(filtered, params.filters);
    const encoder = new TextEncoder();
    return {
      body: csv,
      filename,
      rowCount: filtered.length,
      fileSizeBytes: encoder.encode(csv).length,
      summary,
    };
  }

  if (params.format === "xlsx") {
    const table = buildInvoicesTableData(filtered, params.filters);
    const buffer = await buildExcelWorkbook({
      sheetName: "Factures",
      summarySheetName: "Résumé",
      headers: table.headers,
      rows: table.rows,
      summary,
      title: "Export comptable — Factures",
    });
    return {
      body: new Uint8Array(buffer),
      filename,
      rowCount: filtered.length,
      fileSizeBytes: buffer.length,
      summary,
    };
  }

  const company = await getCompanyForUser(params.supabase, params.userId);
  const rows: AccountingPdfRow[] = filtered.map((invoice) => {
    const status = toInvoiceStatus(invoice.status);
    const effective = getEffectiveInvoiceStatus(status, invoice.due_date);
    return {
      number: invoiceDisplayNumber(invoice.invoice_number, invoice.id),
      issueDate: formatFrenchDate(invoice.issue_date),
      client: clientName(invoice),
      totalHt: formatFrenchAmount(invoice.total_ht),
      totalVat: formatFrenchAmount(invoice.total_vat),
      totalTtc: formatFrenchAmount(invoice.total_ttc),
      status: INVOICE_STATUS_LABELS[effective],
    };
  });

  const pdfBuffer = await renderAccountingPdf({
    companyName: company?.trade_name ?? "Mon entreprise",
    periodLabel: periodLabel(params.filters),
    generatedAt: new Date().toLocaleString("fr-FR"),
    summary,
    rows,
  });

  return {
    body: new Uint8Array(pdfBuffer),
    filename,
    rowCount: filtered.length,
    fileSizeBytes: pdfBuffer.length,
    summary,
  };
}
