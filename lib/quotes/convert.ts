import { addOneMonthToIsoDate, todayIsoDate } from "@/lib/dates/invoice-dates";
import { DEFAULT_INVOICE_PAYMENT_TERM } from "@/lib/constants/payment-terms";
import type { QuoteDetail } from "@/lib/data/quotes";
import type { InvoiceFormValues } from "@/lib/validations/invoice";

/** Valeurs formulaire pour une facture créée depuis un devis accepté. */
export function quoteToInvoiceFormValues(quote: QuoteDetail): InvoiceFormValues {
  const today = todayIsoDate();

  return {
    client_id: quote.client_id,
    client_location_id: quote.client_location_id ?? null,
    issue_date: today,
    due_date: addOneMonthToIsoDate(today) ?? today,
    notes: quote.notes ?? "",
    payment_terms: DEFAULT_INVOICE_PAYMENT_TERM,
    discount_percent: quote.discount_percent ?? undefined,
    discount_amount: quote.discount_amount ?? undefined,
    lines: quote.invoice_lines.map((line) => ({
      description: line.description,
      quantity: Number(line.quantity),
      unit_price_ht: Number(line.unit_price_ht),
      vat_rate: Number(line.vat_rate),
    })),
  };
}
