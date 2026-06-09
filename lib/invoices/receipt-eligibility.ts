import { toInvoiceStatus } from "@/lib/invoices/status";
import type { Database } from "@/types/database";

export function canDownloadPaymentReceipt(invoice: {
  status: Database["public"]["Enums"]["invoice_status"];
  document_type?: Database["public"]["Enums"]["document_type"];
  paid_at: string | null;
}): boolean {
  if ((invoice.document_type ?? "invoice") !== "invoice") return false;
  if (!invoice.paid_at) return false;
  return toInvoiceStatus(invoice.status) === "paid";
}
