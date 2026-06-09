import {
  handleInvoicePaidSideEffects,
  type HandleInvoicePaidSideEffectsContext,
} from "@/lib/invoices/handle-invoice-paid-side-effects";
import { logInvoicePaid } from "@/lib/invoices/paid-transition-log";
import { safeRevalidateInvoicePayment } from "@/lib/invoices/safe-revalidate-payment";
import type { InvoiceStatus } from "@/lib/invoices/status";

export interface ScheduleInvoicePaidSideEffectsParams
  extends HandleInvoicePaidSideEffectsContext {
  publicToken?: string | null;
}

/**
 * Exécute notification + email après paiement confirmé (synchrone).
 * Notification/email AVANT revalidatePath — ne jamais inverser cet ordre.
 */
export async function runInvoicePaidSideEffects(
  invoiceId: string,
  params: ScheduleInvoicePaidSideEffectsParams,
): Promise<{ notificationCreated: boolean; emailSent: boolean }> {
  logInvoicePaid("run_sync", {
    invoiceId,
    source: params.source,
    transitioned: params.transitioned ?? false,
  });

  const result = await handleInvoicePaidSideEffects(invoiceId, {
    source: params.source,
    transitioned: params.transitioned,
    previousStatus: params.previousStatus,
    paidAt: params.paidAt,
  });

  safeRevalidateInvoicePayment({
    invoiceId,
    publicToken: params.publicToken,
    source: params.source,
  });

  return result;
}

/** @deprecated Utiliser runInvoicePaidSideEffects (synchrone) */
export const scheduleInvoicePaidSideEffects = runInvoicePaidSideEffects;

/** @deprecated Alias explicite */
export const enqueueInvoicePaidSideEffects = runInvoicePaidSideEffects;

export type { InvoiceStatus };
