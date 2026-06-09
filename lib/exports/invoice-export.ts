import type { InvoiceWithClientExport } from "@/lib/data/invoices";
import { buildCsvRow, csvFileContent } from "@/lib/exports/csv";
import {
  formatFrenchAmount,
  formatFrenchDate,
  formatFrenchDateTime,
} from "@/lib/exports/formatting";
import type { ExportSummary, InvoiceExportFilters } from "@/lib/exports/types";
import { getInvoiceClientEmail } from "@/lib/invoices/client-contact";
import {
  getEffectiveInvoiceStatus,
  todayIsoDate,
} from "@/lib/invoices/overdue";
import { parseClientSnapshot } from "@/lib/pdf/parse-snapshots";
import {
  INVOICE_STATUS_LABELS,
  invoiceDisplayNumber,
  toInvoiceStatus,
  type InvoiceStatus,
} from "@/lib/invoices/status";

export type { InvoiceExportFilters, InvoiceExportStatusFilter } from "@/lib/exports/types";

const BASE_HEADERS = [
  "Numéro facture",
  "Date émission",
  "Date échéance",
  "Statut",
  "Client",
  "Email client",
  "Total HT",
  "TVA",
  "Total TTC",
] as const;

const VAT_DETAIL_HEADERS = [
  "Taux TVA",
  "Date paiement",
  "Mode de paiement",
] as const;

const EXTRA_HEADERS = [
  "Acompte déduit",
  "Remise",
  "Conditions de paiement",
  "Date annulation",
  "Archivée",
  "Notes",
] as const;

function clientDisplayName(invoice: InvoiceWithClientExport): string {
  const client = invoice.clients;
  if (client) {
    if (client.client_type === "company" && client.company_name) {
      return client.company_name;
    }
    return client.name;
  }
  return parseClientSnapshot(invoice.client_snapshot)?.name ?? "";
}

function clientEmail(invoice: InvoiceWithClientExport): string {
  return getInvoiceClientEmail(invoice.clients, invoice.client_snapshot);
}

function formatDiscount(invoice: InvoiceWithClientExport): string {
  if (invoice.discount_percent != null) {
    return `${formatFrenchAmount(invoice.discount_percent)} %`;
  }
  if (invoice.discount_amount != null) {
    return formatFrenchAmount(invoice.discount_amount);
  }
  return "";
}

function paymentMode(invoice: InvoiceWithClientExport): string {
  if (invoice.stripe_checkout_session_id || invoice.stripe_payment_intent_id) {
    return "Stripe en ligne";
  }
  if (toInvoiceStatus(invoice.status) === "paid") {
    return "Manuel";
  }
  return "";
}

function averageVatRate(invoice: InvoiceWithClientExport): string {
  const ht = Number(invoice.total_ht);
  const vat = Number(invoice.total_vat);
  if (!ht || ht <= 0) return "";
  const rate = (vat / ht) * 100;
  return `${formatFrenchAmount(rate)} %`;
}

function statusLabel(status: InvoiceStatus, dueDate: string): string {
  const effective = getEffectiveInvoiceStatus(status, dueDate);
  return INVOICE_STATUS_LABELS[effective];
}

function matchesStatusFilter(
  invoice: InvoiceWithClientExport,
  filters: InvoiceExportFilters,
  reference = new Date(),
): boolean {
  const status = toInvoiceStatus(invoice.status);
  const effective = getEffectiveInvoiceStatus(
    status,
    invoice.due_date,
    reference,
  );

  if (filters.paidOnly && status !== "paid") return false;
  if (filters.excludeDrafts && effective === "draft") return false;
  if (filters.excludeCancelled && status === "cancelled") return false;

  switch (filters.status) {
    case "all":
      return filters.excludeDrafts ? effective !== "draft" : true;
    case "draft":
      return effective === "draft";
    case "sent":
      return effective === "sent";
    case "paid":
      return status === "paid";
    case "overdue":
      return effective === "overdue";
    case "cancelled":
      return status === "cancelled";
    case "archived":
      return Boolean(invoice.archived_at);
    default:
      return false;
  }
}

export function filterInvoicesForExport(
  invoices: InvoiceWithClientExport[],
  filters: InvoiceExportFilters,
  reference = new Date(),
): InvoiceWithClientExport[] {
  return invoices.filter((invoice) => {
    if (!filters.includeArchived && invoice.archived_at) return false;
    if (filters.dateFrom && invoice.issue_date < filters.dateFrom) return false;
    if (filters.dateTo && invoice.issue_date > filters.dateTo) return false;
    return matchesStatusFilter(invoice, filters, reference);
  });
}

export function computeInvoiceExportSummary(
  invoices: InvoiceWithClientExport[],
): ExportSummary {
  let totalHt = 0;
  let totalVat = 0;
  let totalTtc = 0;
  let paidCount = 0;
  let unpaidCount = 0;

  for (const invoice of invoices) {
    totalHt += Number(invoice.total_ht) || 0;
    totalVat += Number(invoice.total_vat) || 0;
    totalTtc += Number(invoice.total_ttc) || 0;

    const status = toInvoiceStatus(invoice.status);
    if (status === "paid") {
      paidCount += 1;
    } else if (status !== "cancelled" && status !== "draft") {
      unpaidCount += 1;
    }
  }

  return {
    invoiceCount: invoices.length,
    totalHt,
    totalVat,
    totalTtc,
    paidCount,
    unpaidCount,
  };
}

function sortInvoices(invoices: InvoiceWithClientExport[]): InvoiceWithClientExport[] {
  return [...invoices].sort((a, b) => {
    if (a.issue_date !== b.issue_date) {
      return b.issue_date.localeCompare(a.issue_date);
    }
    return (b.invoice_number ?? b.id).localeCompare(a.invoice_number ?? b.id);
  });
}

function getHeaders(filters: InvoiceExportFilters): string[] {
  const headers: string[] = [...BASE_HEADERS];
  if (filters.includeVatDetail) {
    headers.push(...VAT_DETAIL_HEADERS);
  }
  headers.push(...EXTRA_HEADERS);
  return headers;
}

function invoiceToRow(
  invoice: InvoiceWithClientExport,
  filters: InvoiceExportFilters,
): string[] {
  const status = toInvoiceStatus(invoice.status);
  const effective = getEffectiveInvoiceStatus(status, invoice.due_date);

  const row: string[] = [
    invoiceDisplayNumber(invoice.invoice_number, invoice.id),
    formatFrenchDate(invoice.issue_date),
    formatFrenchDate(invoice.due_date),
    statusLabel(status, invoice.due_date),
    clientDisplayName(invoice),
    clientEmail(invoice),
    formatFrenchAmount(invoice.total_ht),
    formatFrenchAmount(invoice.total_vat),
    formatFrenchAmount(invoice.total_ttc),
  ];

  if (filters.includeVatDetail) {
    row.push(
      averageVatRate(invoice),
      effective === "paid" ? formatFrenchDateTime(invoice.paid_at) : "",
      paymentMode(invoice),
    );
  }

  row.push(
    invoice.deposit_applied_amount != null
      ? formatFrenchAmount(invoice.deposit_applied_amount)
      : "",
    formatDiscount(invoice),
    invoice.payment_terms ?? "",
    status === "cancelled" ? formatFrenchDateTime(invoice.cancelled_at) : "",
    invoice.archived_at ? "Oui" : "Non",
    invoice.notes ?? "",
  );

  return row;
}

export function buildInvoicesCsv(
  invoices: InvoiceWithClientExport[],
  filters: InvoiceExportFilters,
): string {
  const sorted = sortInvoices(invoices);
  const rows = [
    buildCsvRow(getHeaders(filters)),
    ...sorted.map((inv) => buildCsvRow(invoiceToRow(inv, filters))),
  ];
  return csvFileContent(rows);
}

export function buildInvoicesTableData(
  invoices: InvoiceWithClientExport[],
  filters: InvoiceExportFilters,
): { headers: string[]; rows: string[][] } {
  const sorted = sortInvoices(invoices);
  return {
    headers: getHeaders(filters),
    rows: sorted.map((inv) => invoiceToRow(inv, filters)),
  };
}

export function exportFilename(
  format: "csv" | "xlsx" | "pdf" = "csv",
  reference = new Date(),
): string {
  const iso = todayIsoDate(reference);
  const ext = format === "xlsx" ? "xlsx" : format === "pdf" ? "pdf" : "csv";
  return `export-factures-${iso}.${ext}`;
}

export function parseInvoiceExportFilters(
  searchParams: URLSearchParams,
): InvoiceExportFilters {
  const status = searchParams.get("status");
  const validStatuses = [
    "all",
    "sent",
    "paid",
    "overdue",
    "cancelled",
    "draft",
    "archived",
  ] as const;

  return {
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    status: validStatuses.includes(status as (typeof validStatuses)[number])
      ? (status as InvoiceExportFilters["status"])
      : "all",
    includeArchived: searchParams.get("includeArchived") === "true",
    excludeDrafts: searchParams.get("excludeDrafts") !== "false",
    excludeCancelled: searchParams.get("excludeCancelled") === "true",
    paidOnly: searchParams.get("paidOnly") === "true",
    includeVatDetail: searchParams.get("includeVatDetail") !== "false",
  };
}

/** @deprecated */
export const parseExportFilters = parseInvoiceExportFilters;
