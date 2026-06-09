import { toInvoiceStatus } from "@/lib/invoices/status";
import type { Database } from "@/types/database";

export function canSendInvoiceReminder(invoice: {
  status: Database["public"]["Enums"]["invoice_status"];
  archived_at: string | null;
  document_type?: Database["public"]["Enums"]["document_type"];
}): boolean {
  if (invoice.document_type === "quote") return false;
  if (invoice.archived_at) return false;

  const status = toInvoiceStatus(invoice.status);
  if (
    status === "draft" ||
    status === "ready" ||
    status === "paid" ||
    status === "cancelled"
  ) {
    return false;
  }
  return status === "sent" || status === "overdue";
}
