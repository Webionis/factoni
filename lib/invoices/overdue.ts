import { parisCalendarIsoDate } from "@/lib/dates/timezone";
import type { InvoiceStatus } from "@/lib/invoices/status";

/** Date du jour au format ISO (calendrier France). */
export function todayIsoDate(reference = new Date()): string {
  return parisCalendarIsoDate(reference);
}

/** Échéance strictement dépassée (comparaison sur dates calendaires). */
export function isPastDueDate(
  dueDate: string,
  reference = new Date(),
): boolean {
  return dueDate < todayIsoDate(reference);
}

/**
 * Statut affiché : une facture « envoyée » dont l'échéance est passée
 * est traitée comme « en retard » sans cron ni mise à jour DB.
 */
export function getEffectiveInvoiceStatus(
  status: InvoiceStatus,
  dueDate: string,
  reference = new Date(),
): InvoiceStatus {
  if (status === "sent" && isPastDueDate(dueDate, reference)) {
    return "overdue";
  }
  return status;
}

export function isEffectivelyOverdue(
  status: InvoiceStatus,
  dueDate: string,
  reference = new Date(),
): boolean {
  return getEffectiveInvoiceStatus(status, dueDate, reference) === "overdue";
}

/** Facture « envoyée » en retard implicite (DB encore `sent`). */
export function isImplicitlyOverdue(
  status: InvoiceStatus,
  dueDate: string,
  reference = new Date(),
): boolean {
  return status === "sent" && isPastDueDate(dueDate, reference);
}

const REVENUE_STATUSES: InvoiceStatus[] = ["sent", "paid", "overdue"];

export function countsTowardRevenue(
  status: InvoiceStatus,
  dueDate: string,
  reference = new Date(),
): boolean {
  const effective = getEffectiveInvoiceStatus(status, dueDate, reference);
  return REVENUE_STATUSES.includes(effective);
}

export function isInCurrentMonth(
  issueDate: string,
  reference = new Date(),
): boolean {
  const monthKey = todayIsoDate(reference).slice(0, 7);
  return issueDate.slice(0, 7) === monthKey;
}
