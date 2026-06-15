import type { Database } from "@/types/database";

export type QuoteStatus = Extract<
  Database["public"]["Enums"]["invoice_status"],
  | "draft"
  | "ready"
  | "sent"
  | "viewed"
  | "accepted"
  | "deposit_requested"
  | "deposit_paid"
  | "invoiced"
  | "rejected"
  | "expired"
  | "cancelled"
>;

export const QUOTE_STATUSES: QuoteStatus[] = [
  "draft",
  "ready",
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
  "cancelled",
];

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Brouillon",
  ready: "Prêt à envoyer",
  sent: "Envoyé",
  viewed: "Consulté",
  accepted: "Accepté",
  deposit_requested: "Acompte demandé",
  deposit_paid: "Acompte payé",
  invoiced: "Facturé",
  rejected: "Refusé",
  expired: "Expiré",
  cancelled: "Annulé",
};

/** Libellés courts pour les badges dans les tableaux sur mobile. */
export const QUOTE_STATUS_SHORT_LABELS: Record<QuoteStatus, string> = {
  draft: "Brouillon",
  ready: "Prêt",
  sent: "Envoyé",
  viewed: "Consulté",
  accepted: "Accepté",
  deposit_requested: "Acompte",
  deposit_paid: "Payé",
  invoiced: "Facturé",
  rejected: "Refusé",
  expired: "Expiré",
  cancelled: "Annulé",
};

const ALLOWED_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  draft: ["ready"],
  ready: ["sent", "cancelled"],
  sent: ["viewed", "accepted", "rejected", "cancelled"],
  viewed: ["accepted", "rejected", "cancelled"],
  accepted: [],
  deposit_requested: [],
  deposit_paid: [],
  invoiced: [],
  rejected: [],
  expired: [],
  cancelled: [],
};

export function canTransitionQuoteStatus(
  from: QuoteStatus,
  to: QuoteStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAllowedNextQuoteStatuses(from: QuoteStatus): QuoteStatus[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}

/** Transitions gérées par le workflow métier (acompte, facture de solde). */
const AUTOMATED_QUOTE_STATUSES: QuoteStatus[] = [
  "deposit_requested",
  "deposit_paid",
  "invoiced",
];

/** Actions manuelles de statut (hors envoi email ready → sent). */
export function quoteHasManualStatusActions(currentStatus: QuoteStatus): boolean {
  if (currentStatus === "ready") return false;
  if (AUTOMATED_QUOTE_STATUSES.includes(currentStatus)) return false;
  return getAllowedNextQuoteStatuses(currentStatus).filter(
    (status) =>
      status !== "sent" &&
      status !== "ready" &&
      !AUTOMATED_QUOTE_STATUSES.includes(status),
  ).length > 0;
}

export function getManualNextQuoteStatuses(from: QuoteStatus): QuoteStatus[] {
  return getAllowedNextQuoteStatuses(from).filter(
    (status) =>
      status !== "sent" &&
      status !== "ready" &&
      status !== "accepted" &&
      status !== "rejected" &&
      !AUTOMATED_QUOTE_STATUSES.includes(status),
  );
}

export function isQuoteEditable(status: QuoteStatus): boolean {
  return status === "draft";
}

export function isQuoteDeletable(status: QuoteStatus): boolean {
  return status === "draft";
}

export function isQuoteContentFrozen(status: QuoteStatus): boolean {
  return status !== "draft";
}

export function canValidateQuoteDraft(status: QuoteStatus): boolean {
  return status === "draft";
}

export function canSendQuoteByEmail(status: QuoteStatus): boolean {
  return status === "ready";
}

/**
 * Envoi initial signature : uniquement via « Envoyer par email » en statut ready.
 * Pas de renvoi « pour signature » une fois le devis déjà envoyé (sent / viewed).
 */
export function canSendQuoteForSignature(_status: QuoteStatus): boolean {
  return false;
}

/** Lien public partageable après envoi au client (pas en brouillon ni après acceptation). */
export function canCopyQuotePublicLink(status: QuoteStatus): boolean {
  return status === "sent" || status === "viewed";
}

export function isQuotePubliclyAccessible(status: QuoteStatus): boolean {
  return (
    status === "ready" ||
    status === "sent" ||
    status === "viewed" ||
    status === "accepted" ||
    status === "deposit_requested" ||
    status === "deposit_paid" ||
    status === "invoiced"
  );
}

export function quoteDisplayNumber(
  quoteNumber: string | null,
  quoteId: string,
): string {
  if (quoteNumber) return quoteNumber;
  return `Brouillon #${quoteId.slice(0, 8).toUpperCase()}`;
}

export function isQuoteStatus(value: string): value is QuoteStatus {
  return (QUOTE_STATUSES as string[]).includes(value);
}

export function normalizeQuoteStatus(
  status: Database["public"]["Enums"]["invoice_status"],
): QuoteStatus {
  if (status === "ready") return "ready";
  if (status === "deposit_requested") return "deposit_requested";
  if (status === "deposit_paid") return "deposit_paid";
  if (status === "invoiced") return "invoiced";
  return isQuoteStatus(status) ? status : "draft";
}
