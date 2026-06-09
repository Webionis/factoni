import type { InvoiceDetail } from "@/lib/data/invoices";
import { getEffectiveInvoiceStatus } from "@/lib/invoices/overdue";
import {
  INVOICE_STATUS_LABELS,
  normalizeInvoiceStatus,
  type InvoiceStatus,
} from "@/lib/invoices/status";
import { getEffectiveQuoteStatus } from "@/lib/quotes/expiry";
import {
  normalizeQuoteStatus,
  QUOTE_STATUS_LABELS,
  type QuoteStatus,
} from "@/lib/quotes/status";

/** Statut affiché dans le PDF — aligné pro / public (normalisation + effet validité). */
export function resolvePdfDocumentStatus(
  invoice: InvoiceDetail,
): InvoiceStatus | QuoteStatus {
  const isQuote = invoice.document_type === "quote";

  if (isQuote) {
    const normalized = normalizeQuoteStatus(invoice.status);
    if (
      normalized === "deposit_requested" ||
      normalized === "deposit_paid" ||
      normalized === "invoiced"
    ) {
      return normalized;
    }
    if (invoice.accepted_at) {
      return "accepted";
    }
    return getEffectiveQuoteStatus(normalized, invoice.due_date);
  }

  return getEffectiveInvoiceStatus(
    normalizeInvoiceStatus(invoice.status),
    invoice.due_date,
  );
}

export function getPdfStatusLabel(
  status: InvoiceStatus | QuoteStatus,
  documentKind: InvoiceDetail["document_type"],
): string {
  if (documentKind === "quote") {
    return QUOTE_STATUS_LABELS[status as QuoteStatus] ?? status;
  }
  return INVOICE_STATUS_LABELS[status as InvoiceStatus] ?? status;
}
