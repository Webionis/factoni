"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  acceptQuoteAction,
  changeQuoteStatusAction,
  rejectQuoteAction,
} from "@/lib/actions/quotes";
import { applyActionResult, runServerAction } from "@/lib/client/action-feedback";
import { Button } from "@/components/ui/button";
import { canAcceptQuote } from "@/lib/quotes/expiry";
import {
  getManualNextQuoteStatuses,
  QUOTE_STATUS_LABELS,
  type QuoteStatus,
} from "@/lib/quotes/status";

const ACTION_LABELS: Partial<Record<QuoteStatus, string>> = {
  viewed: "Marquer comme consulté",
  cancelled: "Annuler le devis",
};

interface QuoteStatusActionsProps {
  quoteId: string;
  currentStatus: QuoteStatus;
  validityDate: string;
  convertedToInvoiceId: string | null;
  /** Masque le titre — utilisé quand la card parente fournit l’en-tête. */
  embedded?: boolean;
}

export function QuoteStatusActions({
  quoteId,
  currentStatus,
  validityDate,
  convertedToInvoiceId,
  embedded = false,
}: QuoteStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const nextStatuses = getManualNextQuoteStatuses(currentStatus);

  const canAccept = canAcceptQuote(
    currentStatus,
    validityDate,
    convertedToInvoiceId,
  );

  const canReject =
    (currentStatus === "sent" || currentStatus === "viewed") &&
    convertedToInvoiceId === null;

  if (nextStatuses.length === 0 && !canAccept && !canReject) {
    return null;
  }

  function handleStatusChange(newStatus: QuoteStatus) {
    if (isPending) return;
    startTransition(async () => {
      const result = await runServerAction(() =>
        changeQuoteStatusAction(quoteId, newStatus),
      );
      if (
        applyActionResult(result, router, {
          successMessage: `Statut : ${QUOTE_STATUS_LABELS[newStatus]}`,
        })
      ) {
        router.refresh();
      }
    });
  }

  function handleAccept() {
    if (isPending) return;
    startTransition(async () => {
      const result = await runServerAction(() => acceptQuoteAction(quoteId));
      if (
        applyActionResult(result, router, {
          successMessage: "Devis accepté",
        })
      ) {
        router.refresh();
      }
    });
  }

  function handleReject() {
    if (isPending) return;
    startTransition(async () => {
      const result = await runServerAction(() => rejectQuoteAction(quoteId));
      if (
        applyActionResult(result, router, {
          successMessage: "Devis refusé",
        })
      ) {
        router.refresh();
      }
    });
  }

  return (
    <div className={embedded ? undefined : "space-y-3"}>
      {!embedded ? (
        <p className="text-sm font-semibold tracking-tight text-foreground">
          Actions
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {canAccept ? (
          <Button
            type="button"
            className="h-11 w-full sm:w-auto sm:min-w-[11.5rem]"
            disabled={isPending}
            onClick={handleAccept}
          >
            {isPending ? "…" : "Accepter le devis"}
          </Button>
        ) : null}
        {canReject ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full sm:w-auto sm:min-w-[11.5rem]"
            disabled={isPending}
            onClick={handleReject}
          >
            {isPending ? "…" : "Refuser le devis"}
          </Button>
        ) : null}
        {nextStatuses.map((status) => (
          <Button
            key={status}
            type="button"
            variant={status === "cancelled" ? "destructive" : "default"}
            className="h-11 w-full sm:w-auto sm:min-w-[11.5rem]"
            disabled={isPending}
            onClick={() => handleStatusChange(status)}
          >
            {isPending
              ? "…"
              : ACTION_LABELS[status] ?? QUOTE_STATUS_LABELS[status]}
          </Button>
        ))}
      </div>
    </div>
  );
}
