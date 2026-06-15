import type { VatRegime } from "@/lib/constants/vat";
import type { InvoiceLineItemNature } from "@/lib/invoices/item-nature";
import { isDisbursementLine } from "@/lib/invoices/item-nature";

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
  item_nature?: InvoiceLineItemNature;
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
  const rate = isDisbursementLine(input.item_nature)
    ? 0
    : effectiveVatRate(input.vat_rate, vatRegime);
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
  /** HT prestations (hors débours), avant remise */
  subtotal_ht: number;
  /** TVA prestations, avant remise */
  subtotal_vat: number;
  /** HT prestations après remise */
  total_ht: number;
  /** TVA prestations après remise */
  total_vat: number;
  /** TTC prestations après remise */
  revenue_total_ttc: number;
  /** Frais de débours refacturés (HT) */
  disbursement_ht: number;
  /** Frais de débours refacturés (TTC) */
  disbursement_ttc: number;
  /** Total à payer = prestations TTC + débours TTC */
  total_ttc: number;
}

export function calculateInvoiceTotals(
  input: InvoiceTotalsInput,
): InvoiceTotals {
  const subtotal_ht = roundMoney(
    input.lines.reduce((sum, line) => sum + line.line_total_ht, 0),
  );
  const subtotal_vat = roundMoney(
    input.lines.reduce((sum, line) => sum + line.line_vat, 0),
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

  const revenue_total_ttc = roundMoney(total_ht + total_vat);

  return {
    subtotal_ht,
    subtotal_vat,
    total_ht,
    total_vat,
    revenue_total_ttc,
    disbursement_ht: 0,
    disbursement_ttc: 0,
    total_ttc: revenue_total_ttc,
  };
}

function sumCalculatedLines(
  lines: CalculatedInvoiceLine[],
  field: keyof Pick<
    CalculatedInvoiceLine,
    "line_total_ht" | "line_vat" | "line_total_ttc"
  >,
): number {
  return roundMoney(lines.reduce((sum, line) => sum + line[field], 0));
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

  const revenueCalculated: CalculatedInvoiceLine[] = [];
  const disbursementCalculated: CalculatedInvoiceLine[] = [];

  for (let index = 0; index < lines.length; index++) {
    const calculated = calculatedLines[index];
    if (isDisbursementLine(lines[index]?.item_nature)) {
      disbursementCalculated.push(calculated);
    } else {
      revenueCalculated.push(calculated);
    }
  }

  const revenueTotals = calculateInvoiceTotals({
    lines: revenueCalculated,
    discount_percent: discount?.discount_percent,
    discount_amount: discount?.discount_amount,
  });

  const disbursement_ht = sumCalculatedLines(disbursementCalculated, "line_total_ht");
  const disbursement_ttc = sumCalculatedLines(
    disbursementCalculated,
    "line_total_ttc",
  );

  return {
    calculatedLines,
    totals: {
      ...revenueTotals,
      disbursement_ht,
      disbursement_ttc,
      total_ttc: roundMoney(revenueTotals.revenue_total_ttc + disbursement_ttc),
    },
  };
}

/** CA TTC imposable (hors frais de débours). */
export function invoiceRevenueTtc(document: {
  total_ht?: number | string | null;
  total_vat?: number | string | null;
  total_ttc?: number | string | null;
  disbursement_total_ttc?: number | string | null;
}): number {
  const ht = Number(document.total_ht);
  const vat = Number(document.total_vat);
  if (Number.isFinite(ht) && Number.isFinite(vat)) {
    return roundMoney(ht + vat);
  }

  const ttc = Number(document.total_ttc);
  const disbursement = Number(document.disbursement_total_ttc ?? 0);
  if (Number.isFinite(ttc)) {
    const revenue = ttc - (Number.isFinite(disbursement) ? disbursement : 0);
    return roundMoney(revenue);
  }

  return 0;
}
