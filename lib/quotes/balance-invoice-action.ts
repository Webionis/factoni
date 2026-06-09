import { normalizeQuoteDepositStatus } from "@/lib/quotes/deposit";
import type { QuoteStatus } from "@/lib/quotes/status";

export type QuoteInvoiceActionMode =
  | "convert_full"
  | "create_balance"
  | "view_balance"
  | "view_invoice"
  | "none";

export function resolveQuoteInvoiceId(quote: {
  quote_balance_invoice_id: string | null;
  converted_to_invoice_id: string | null;
}): string | null {
  return quote.quote_balance_invoice_id ?? quote.converted_to_invoice_id;
}

export function getQuoteInvoiceActionMode(params: {
  status: QuoteStatus;
  depositStatus: string | null;
  balanceInvoiceId: string | null;
  convertedToInvoiceId: string | null;
}): QuoteInvoiceActionMode {
  const depositStatus = normalizeQuoteDepositStatus(params.depositStatus);

  if (params.status === "invoiced") {
    const invoiceId = resolveQuoteInvoiceId({
      quote_balance_invoice_id: params.balanceInvoiceId,
      converted_to_invoice_id: params.convertedToInvoiceId,
    });
    return invoiceId ? "view_invoice" : "none";
  }

  if (params.status === "deposit_paid" && depositStatus === "paid") {
    return params.balanceInvoiceId ? "view_balance" : "create_balance";
  }

  if (
    params.status === "accepted" &&
    depositStatus === "none" &&
    !params.convertedToInvoiceId
  ) {
    return "convert_full";
  }

  return "none";
}
