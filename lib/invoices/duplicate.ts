import { addOneMonthToIsoDate, todayIsoDate } from "@/lib/dates/invoice-dates";
import type { InvoiceDetail } from "@/lib/data/invoices";
import type { InvoiceFormValues } from "@/lib/validations/invoice";

/** Valeurs formulaire pour une copie — dates du jour, pas de numéro ni statut. */
export function invoiceToDuplicateFormValues(
  invoice: InvoiceDetail,
): InvoiceFormValues {
  const today = todayIsoDate();

  return {
    client_id: invoice.client_id,
    issue_date: today,
    due_date: addOneMonthToIsoDate(today) ?? today,
    notes: invoice.notes ?? "",
    payment_terms: invoice.payment_terms ?? "",
    discount_percent: invoice.discount_percent ?? undefined,
    discount_amount: invoice.discount_amount ?? undefined,
    lines: invoice.invoice_lines.map((line) => ({
      description: line.description,
      quantity: Number(line.quantity),
      unit_price_ht: Number(line.unit_price_ht),
      vat_rate: Number(line.vat_rate),
    })),
  };
}
