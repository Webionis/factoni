import type { Database } from "@/types/database";

import { handleInvoicePaidSideEffects } from "@/lib/invoices/handle-invoice-paid-side-effects";
import { toInvoiceStatus, type InvoiceStatus } from "@/lib/invoices/status";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];

/** @deprecated Utiliser handleInvoicePaidSideEffects */
export async function handleInvoicePaidTransition(params: {
  invoice: InvoiceRow;
  paidAt: string;
  previousStatus: InvoiceStatus | Database["public"]["Enums"]["invoice_status"];
  source?: string;
}): Promise<void> {
  const previous = toInvoiceStatus(params.previousStatus);
  if (previous === "paid") {
    return;
  }

  await handleInvoicePaidSideEffects(params.invoice.id, {
    source: params.source ?? "handleInvoicePaidTransition",
    transitioned: true,
    previousStatus: previous,
    paidAt: params.paidAt,
  });
}
