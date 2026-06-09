import type { Database } from "@/types/database";

export type InvoiceStatus = Extract<
  Database["public"]["Enums"]["invoice_status"],
  "draft" | "ready" | "sent" | "paid" | "overdue" | "cancelled"
>;

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "draft",
  "ready",
  "sent",
  "paid",
  "overdue",
  "cancelled",
];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Brouillon",
  ready: "Prête à envoyer",
  sent: "Envoyée",
  paid: "Payée",
  overdue: "En retard",
  cancelled: "Annulée",
};

const ALLOWED_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ["ready"],
  ready: ["sent", "draft", "cancelled"],
  sent: ["paid", "overdue", "cancelled"],
  overdue: ["paid", "cancelled"],
  paid: [],
  cancelled: [],
};

export function canTransitionStatus(
  from: InvoiceStatus,
  to: InvoiceStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAllowedNextStatuses(from: InvoiceStatus): InvoiceStatus[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}

/** Actions manuelles de statut (hors envoi email ready → sent). */
export function invoiceHasVisibleActions(
  currentStatus: InvoiceStatus,
): boolean {
  if (currentStatus === "ready" || currentStatus === "paid") return false;
  return getAllowedNextStatuses(currentStatus).filter(
    (status) => status !== "sent" && status !== "ready",
  ).length > 0;
}

export function isInvoiceStatus(value: string): value is InvoiceStatus {
  return (INVOICE_STATUSES as string[]).includes(value);
}

export function normalizeInvoiceStatus(
  status: Database["public"]["Enums"]["invoice_status"],
): InvoiceStatus {
  if (status === "ready") return "ready";
  return isInvoiceStatus(status) ? status : "draft";
}

export function isInvoiceEditable(status: InvoiceStatus): boolean {
  return status === "draft";
}

export function isInvoiceDeletable(status: InvoiceStatus): boolean {
  return status === "draft";
}

/** Contenu figé après validation (ready, sent, paid…). */
export function isInvoiceContentFrozen(status: InvoiceStatus): boolean {
  return status !== "draft";
}

export function canValidateInvoiceDraft(status: InvoiceStatus): boolean {
  return status === "draft";
}

export function canSendInvoiceByEmail(status: InvoiceStatus): boolean {
  return status === "ready";
}

/** Lien public partageable après envoi au client (pas en brouillon ni après paiement). */
export function canCopyInvoicePublicLink(status: InvoiceStatus): boolean {
  return status === "sent" || status === "overdue";
}

export function canRevertInvoiceToDraft(status: InvoiceStatus): boolean {
  return status === "ready";
}

/** Lien public accessible (aperçu ou envoi). */
export function isInvoicePubliclyAccessible(
  status: InvoiceStatus,
): boolean {
  return status === "ready" || status === "sent" || status === "paid" || status === "overdue";
}

/** Paiement Stripe uniquement après envoi réel au client. */
export function canPayInvoiceOnline(status: InvoiceStatus): boolean {
  return status === "sent" || status === "overdue";
}

export function toInvoiceStatus(
  status: Database["public"]["Enums"]["invoice_status"],
): InvoiceStatus {
  return normalizeInvoiceStatus(status);
}

export function invoiceDisplayNumber(
  invoiceNumber: string | null,
  invoiceId: string,
): string {
  if (invoiceNumber) return invoiceNumber;
  return `Brouillon #${invoiceId.slice(0, 8).toUpperCase()}`;
}
