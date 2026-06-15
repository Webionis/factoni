import { calculateLinesAndTotals } from "@/lib/invoices/calculate";
import { DEFAULT_INVOICE_LINE_ITEM_NATURE, isDisbursementLine } from "@/lib/invoices/item-nature";
import { sanitizeText } from "@/lib/sanitize";
import type { InvoiceFormValues } from "@/lib/validations/invoice";
import type { Database } from "@/types/database";

type LineInsert = Database["public"]["Tables"]["invoice_lines"]["Insert"];

export function buildLineInserts(
  invoiceId: string,
  formLines: InvoiceFormValues["lines"],
  vatRegime: Database["public"]["Enums"]["vat_regime"],
): LineInsert[] {
  const { calculatedLines } = calculateLinesAndTotals(
    formLines.map((line) => ({
      quantity: Number(line.quantity),
      unit_price_ht: Number(line.unit_price_ht),
      vat_rate: Number(line.vat_rate),
      item_nature: line.item_nature,
    })),
    vatRegime,
  );

  return formLines.map((line, index) => {
    const calc = calculatedLines[index];
    return {
      invoice_id: invoiceId,
      sort_order: index,
      description: sanitizeText(line.description),
      quantity: Number(line.quantity),
      unit_price_ht: Number(line.unit_price_ht),
      vat_rate:
        vatRegime === "franchise" || isDisbursementLine(line.item_nature)
          ? 0
          : Number(line.vat_rate),
      item_nature: line.item_nature ?? DEFAULT_INVOICE_LINE_ITEM_NATURE,
      line_total_ht: calc.line_total_ht,
      line_vat: calc.line_vat,
      line_total_ttc: calc.line_total_ttc,
    };
  });
}
