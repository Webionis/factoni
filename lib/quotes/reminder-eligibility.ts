import { isQuotePending } from "@/lib/quotes/expiry";
import type { QuoteStatus } from "@/lib/quotes/status";

/** Relance client possible tant que le devis est en attente (envoyé / consulté, non expiré). */
export function canRemindQuoteClient(
  status: QuoteStatus,
  validityDate: string,
  convertedToInvoiceId: string | null,
  archivedAt: string | null,
): boolean {
  if (archivedAt) return false;
  if (convertedToInvoiceId) return false;
  return isQuotePending(status, validityDate);
}
