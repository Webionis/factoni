"use client";

import { formatCurrency } from "@/lib/invoices/calculate";
import type { InvoiceTotals } from "@/lib/invoices/calculate";

interface InvoiceTotalsSummaryProps {
  totals: InvoiceTotals;
  discountPercent?: number | null;
  discountAmount?: number | null;
}

export function InvoiceTotalsSummary({
  totals,
  discountPercent,
  discountAmount,
}: InvoiceTotalsSummaryProps) {
  const hasDiscount =
    (discountPercent != null && discountPercent > 0) ||
    (discountAmount != null && discountAmount > 0);
  const hasDisbursements = totals.disbursement_ttc > 0;

  return (
    <div className="space-y-2 rounded-xl border bg-card p-4">
      {hasDiscount ? (
        <>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Sous-total prestations HT</span>
            <span className="tabular-nums">{formatCurrency(totals.subtotal_ht)}</span>
          </div>
          <div className="flex justify-between text-sm text-primary">
            <span>
              Remise
              {discountPercent ? ` (${discountPercent} %)` : ""}
            </span>
            <span className="tabular-nums">
              −
              {formatCurrency(totals.subtotal_ht - totals.total_ht)}
            </span>
          </div>
        </>
      ) : null}
      <div className="flex justify-between text-sm">
        <span>Total prestations HT</span>
        <span className="font-medium tabular-nums">
          {formatCurrency(totals.total_ht)}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span>TVA</span>
        <span className="tabular-nums">{formatCurrency(totals.total_vat)}</span>
      </div>
      {hasDisbursements ? (
        <>
          <div className="flex justify-between border-t border-dashed pt-2 text-sm text-muted-foreground">
            <span>Frais de débours refacturés</span>
            <span className="tabular-nums">
              {formatCurrency(totals.disbursement_ttc)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Les débours sont refacturés au client et ne comptent pas dans le
            chiffre d&apos;affaires imposable.
          </p>
        </>
      ) : null}
      <div className="flex justify-between border-t pt-2 text-base font-bold">
        <span>Total TTC à payer</span>
        <span className="tabular-nums text-primary">
          {formatCurrency(totals.total_ttc)}
        </span>
      </div>
    </div>
  );
}
