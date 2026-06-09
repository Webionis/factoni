import type { InvoiceStatus } from "@/lib/invoices/status";

export function isInvoiceArchived(archivedAt: string | null | undefined): boolean {
  return archivedAt != null;
}

/** Factures envoyées / payées : archivables ; brouillons et prêtes à envoyer : non. */
export function canArchiveInvoice(
  status: InvoiceStatus,
  archivedAt: string | null | undefined,
): boolean {
  if (status === "draft" || status === "ready") return false;
  return !isInvoiceArchived(archivedAt);
}

export function canRestoreInvoice(
  archivedAt: string | null | undefined,
): boolean {
  return isInvoiceArchived(archivedAt);
}
