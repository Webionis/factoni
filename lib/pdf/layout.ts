import type { InvoicePdfData } from "@/lib/pdf/types";

/**
 * Hauteur estimée du encadré récapitulatif seul (sans footer métier).
 * Utilisé uniquement avec wrap={false} sur totalsBox.
 */
export function estimateTotalsBoxMinPresence(data: InvoicePdfData): number {
  let height = 102;

  const hasDiscount =
    (data.discountPercent != null && data.discountPercent > 0) ||
    (data.discountAmount != null && data.discountAmount > 0);
  if (hasDiscount) height += 26;
  if (data.disbursementTtc > 0) height += 22;

  return Math.round(height + 4);
}
