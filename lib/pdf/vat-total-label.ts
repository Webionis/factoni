import { formatPdfMoney, formatPdfPercent } from "@/lib/pdf/format";
import type { PdfVatBreakdownRow } from "@/lib/pdf/types";
import type { VatRegime } from "@/lib/constants/vat";

/**
 * Libellé « Total TVA » avec détail intégré (sans section Détail TVA redondante).
 */
export function buildPdfVatTotalLabel(
  vatRegime: VatRegime,
  breakdown: PdfVatBreakdownRow[],
): string {
  if (vatRegime === "franchise" || breakdown.length === 0) {
    return "Total TVA";
  }

  if (breakdown.length === 1) {
    const row = breakdown[0]!;
    return `Total TVA (${formatPdfPercent(row.rate)} sur ${formatPdfMoney(row.baseHt)})`;
  }

  const rates = breakdown.map((row) => formatPdfPercent(row.rate)).join(" + ");
  return `Total TVA (${rates})`;
}
