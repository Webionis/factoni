import {
  getManualNextQuoteStatuses,
  quoteHasManualStatusActions,
  type QuoteStatus,
} from "@/lib/quotes/status";

/** Devis expiré si envoyé et date de validité dépassée (affichage, DB inchangée). */
export function getEffectiveQuoteStatus(
  status: QuoteStatus,
  validityDate: string,
  reference = new Date(),
): QuoteStatus {
  if (status !== "sent" && status !== "viewed") {
    return status;
  }

  const today = reference.toISOString().slice(0, 10);
  if (validityDate < today) {
    return "expired";
  }

  return status;
}

export function isQuoteExpired(
  status: QuoteStatus,
  validityDate: string,
  reference = new Date(),
): boolean {
  return getEffectiveQuoteStatus(status, validityDate, reference) === "expired";
}

export function isQuotePending(
  status: QuoteStatus,
  validityDate: string,
  reference = new Date(),
): boolean {
  const effective = getEffectiveQuoteStatus(status, validityDate, reference);
  return effective === "sent" || effective === "viewed";
}

export function canAcceptQuote(
  status: QuoteStatus,
  validityDate: string,
  convertedToInvoiceId: string | null,
  reference = new Date(),
): boolean {
  if (convertedToInvoiceId) return false;
  const effective = getEffectiveQuoteStatus(status, validityDate, reference);
  return effective === "sent" || effective === "viewed";
}

export function canConvertQuoteToInvoice(
  status: QuoteStatus,
  convertedToInvoiceId: string | null,
  quoteDepositStatus: string | null = "none",
): boolean {
  return (
    status === "accepted" &&
    convertedToInvoiceId === null &&
    (quoteDepositStatus === "none" || quoteDepositStatus == null)
  );
}

/** Indique si la section « Actions » doit afficher des boutons de statut. */
export function quoteHasVisibleActions(
  currentStatus: QuoteStatus,
  validityDate: string,
  convertedToInvoiceId: string | null,
): boolean {
  if (currentStatus === "ready") return false;

  const nextStatuses = getManualNextQuoteStatuses(currentStatus);
  const canAccept = canAcceptQuote(
    currentStatus,
    validityDate,
    convertedToInvoiceId,
  );
  const canReject =
    (currentStatus === "sent" || currentStatus === "viewed") &&
    convertedToInvoiceId === null;

  return (
    quoteHasManualStatusActions(currentStatus) ||
    nextStatuses.length > 0 ||
    canAccept ||
    canReject
  );
}
