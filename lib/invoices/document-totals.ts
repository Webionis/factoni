import type { VatRegime } from "@/lib/constants/vat";
import type { InvoiceLineRow } from "@/lib/data/invoices";
import {
  calculateLinesAndTotals,
  type InvoiceTotals,
} from "@/lib/invoices/calculate";
import { DEFAULT_INVOICE_LINE_ITEM_NATURE } from "@/lib/invoices/item-nature";

interface DocumentTotalsSource {
  discount_percent?: number | null;
  discount_amount?: number | null;
  disbursement_total_ht?: number | null;
  disbursement_total_ttc?: number | null;
  total_ht: number | string;
  total_vat: number | string;
  total_ttc: number | string;
  invoice_lines: InvoiceLineRow[];
}

export function buildDocumentTotalsDisplay(
  document: DocumentTotalsSource,
  vatRegime: VatRegime = "standard",
): InvoiceTotals {
  const { totals } = calculateLinesAndTotals(
    document.invoice_lines.map((line) => ({
      quantity: Number(line.quantity),
      unit_price_ht: Number(line.unit_price_ht),
      vat_rate: Number(line.vat_rate),
      item_nature: line.item_nature ?? DEFAULT_INVOICE_LINE_ITEM_NATURE,
    })),
    vatRegime,
    {
      discount_percent: document.discount_percent,
      discount_amount: document.discount_amount,
    },
  );

  return totals;
}
