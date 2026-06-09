import type { VatRegime } from "@/lib/constants/vat";

/** Arrondi commercial à 2 décimales */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(amount: number, locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export interface InvoiceLineInput {
  quantity: number;
  unit_price_ht: number;
  vat_rate: number;
}

export interface CalculatedInvoiceLine {
  line_total_ht: number;
  line_vat: number;
  line_total_ttc: number;
  effective_vat_rate: number;
}

export function effectiveVatRate(
  vatRate: number,
  vatRegime: VatRegime,
): number {
  return vatRegime === "franchise" ? 0 : vatRate;
}

export function calculateInvoiceLine(
  input: InvoiceLineInput,
  vatRegime: VatRegime = "standard",
): CalculatedInvoiceLine {
  const rate = effectiveVatRate(input.vat_rate, vatRegime);
  const line_total_ht = roundMoney(input.quantity * input.unit_price_ht);
  const line_vat = roundMoney(line_total_ht * (rate / 100));
  const line_total_ttc = roundMoney(line_total_ht + line_vat);

  return {
    line_total_ht,
    line_vat,
    line_total_ttc,
    effective_vat_rate: rate,
  };
}

export interface InvoiceTotalsInput {
  lines: CalculatedInvoiceLine[];
  discount_percent?: number | null;
  discount_amount?: number | null;
}

export interface InvoiceTotals {
  subtotal_ht: number;
  subtotal_vat: number;
  total_ht: number;
  total_vat: number;
  total_ttc: number;
}

export function calculateInvoiceTotals(
  input: InvoiceTotalsInput,
): InvoiceTotals {
  const subtotal_ht = roundMoney(
    input.lines.reduce((sum, l) => sum + l.line_total_ht, 0),
  );
  const subtotal_vat = roundMoney(
    input.lines.reduce((sum, l) => sum + l.line_vat, 0),
  );

  let total_ht = subtotal_ht;
  let total_vat = subtotal_vat;

  if (input.discount_percent != null && input.discount_percent > 0) {
    const factor = 1 - input.discount_percent / 100;
    total_ht = roundMoney(subtotal_ht * factor);
    total_vat = roundMoney(subtotal_vat * factor);
  } else if (input.discount_amount != null && input.discount_amount > 0) {
    const discount = Math.min(input.discount_amount, subtotal_ht);
    total_ht = roundMoney(subtotal_ht - discount);
    if (subtotal_ht > 0) {
      const ratio = total_ht / subtotal_ht;
      total_vat = roundMoney(subtotal_vat * ratio);
    } else {
      total_vat = 0;
    }
  }

  const total_ttc = roundMoney(total_ht + total_vat);

  return {
    subtotal_ht,
    subtotal_vat,
    total_ht,
    total_vat,
    total_ttc,
  };
}

export function calculateLinesAndTotals(
  lines: InvoiceLineInput[],
  vatRegime: VatRegime,
  discount?: {
    discount_percent?: number | null;
    discount_amount?: number | null;
  },
): {
  calculatedLines: CalculatedInvoiceLine[];
  totals: InvoiceTotals;
} {
  const calculatedLines = lines.map((line) =>
    calculateInvoiceLine(line, vatRegime),
  );
  const totals = calculateInvoiceTotals({
    lines: calculatedLines,
    discount_percent: discount?.discount_percent,
    discount_amount: discount?.discount_amount,
  });
  return { calculatedLines, totals };
}
