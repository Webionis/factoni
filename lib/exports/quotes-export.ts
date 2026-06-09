import type { QuoteWithClient } from "@/lib/data/quotes";
import { buildCsvRow, csvFileContent } from "@/lib/exports/csv";
import {
  formatFrenchAmount,
  formatFrenchDate,
  formatFrenchDateTime,
} from "@/lib/exports/formatting";
import type { QuoteExportFilters } from "@/lib/exports/types";
import { parseClientSnapshot } from "@/lib/pdf/parse-snapshots";
import { getEffectiveQuoteStatus } from "@/lib/quotes/expiry";
import {
  formatDepositTypeLabel,
  normalizeQuoteDepositStatus,
} from "@/lib/quotes/deposit";
import {
  normalizeQuoteStatus,
  QUOTE_STATUS_LABELS,
  quoteDisplayNumber,
} from "@/lib/quotes/status";

const HEADERS = [
  "Numéro devis",
  "Client",
  "Montant TTC",
  "Statut",
  "Date signature",
  "Date émission",
  "Validité",
] as const;

function clientName(quote: QuoteWithClient): string {
  const client = quote.clients;
  if (client) {
    if (client.client_type === "company" && client.company_name) {
      return client.company_name;
    }
    return client.name;
  }
  return parseClientSnapshot(quote.client_snapshot)?.name ?? "";
}

export function filterQuotesForExport(
  quotes: QuoteWithClient[],
  filters: QuoteExportFilters,
  reference = new Date(),
): QuoteWithClient[] {
  return quotes.filter((quote) => {
    if (filters.dateFrom && quote.issue_date < filters.dateFrom) return false;
    if (filters.dateTo && quote.issue_date > filters.dateTo) return false;

    const status = normalizeQuoteStatus(quote.status);
    const effective = getEffectiveQuoteStatus(status, quote.due_date, reference);

    if (filters.status === "all") return true;
    return effective === filters.status;
  });
}

function quoteToRow(quote: QuoteWithClient, reference = new Date()): string[] {
  const status = normalizeQuoteStatus(quote.status);
  const effective = getEffectiveQuoteStatus(status, quote.due_date, reference);

  const depositStatus = normalizeQuoteDepositStatus(quote.quote_deposit_status);
  const depositLabel =
    depositStatus !== "none" &&
    quote.quote_deposit_type &&
    quote.quote_deposit_value != null
      ? `${formatDepositTypeLabel(quote.quote_deposit_type, Number(quote.quote_deposit_value))} (${formatFrenchAmount(quote.quote_deposit_amount ?? 0)})`
      : "";
  const remainingLabel =
    quote.remaining_balance_amount != null
      ? formatFrenchAmount(quote.remaining_balance_amount)
      : depositStatus !== "none" && quote.quote_deposit_amount != null
        ? formatFrenchAmount(
            Number(quote.total_ttc) - Number(quote.quote_deposit_amount),
          )
        : "";

  return [
    quoteDisplayNumber(quote.invoice_number, quote.id),
    clientName(quote),
    formatFrenchAmount(quote.total_ttc),
    QUOTE_STATUS_LABELS[effective],
    depositLabel,
    remainingLabel,
    quote.quote_deposit_paid_at
      ? formatFrenchDateTime(quote.quote_deposit_paid_at)
      : "",
    quote.accepted_at ? formatFrenchDateTime(quote.accepted_at) : "",
    formatFrenchDate(quote.issue_date),
    formatFrenchDate(quote.due_date),
  ];
}

export function buildQuotesCsv(
  quotes: QuoteWithClient[],
  filters: QuoteExportFilters,
): string {
  const filtered = filterQuotesForExport(quotes, filters);
  const sorted = [...filtered].sort((a, b) =>
    b.issue_date.localeCompare(a.issue_date),
  );
  return csvFileContent([
    buildCsvRow([...HEADERS]),
    ...sorted.map((q) => buildCsvRow(quoteToRow(q))),
  ]);
}

export function buildQuotesTableData(
  quotes: QuoteWithClient[],
  filters: QuoteExportFilters,
): { headers: string[]; rows: string[][] } {
  const filtered = filterQuotesForExport(quotes, filters);
  const sorted = [...filtered].sort((a, b) =>
    b.issue_date.localeCompare(a.issue_date),
  );
  return {
    headers: [...HEADERS],
    rows: sorted.map((q) => quoteToRow(q)),
  };
}

export function parseQuoteExportFilters(
  searchParams: URLSearchParams,
): QuoteExportFilters {
  const status = searchParams.get("status");
  const valid = [
    "all",
    "draft",
    "ready",
    "sent",
    "viewed",
    "accepted",
    "rejected",
    "expired",
    "cancelled",
  ] as const;

  return {
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    status: valid.includes(status as (typeof valid)[number])
      ? (status as QuoteExportFilters["status"])
      : "all",
  };
}

export function quotesExportFilename(format: "csv" | "xlsx"): string {
  const iso = new Date().toISOString().slice(0, 10);
  return `export-devis-${iso}.${format}`;
}
