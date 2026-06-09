"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { changeInvoiceStatusAction } from "@/lib/actions/invoices";
import { applyActionResult, runServerAction } from "@/lib/client/action-feedback";
import { Button } from "@/components/ui/button";
import {
  getAllowedNextStatuses,
  INVOICE_STATUS_LABELS,
  type InvoiceStatus,
} from "@/lib/invoices/status";

const ACTION_LABELS: Partial<Record<InvoiceStatus, string>> = {
  draft: "Revenir en brouillon",
  paid: "Marquer comme payée",
  overdue: "Marquer en retard",
  cancelled: "Annuler la facture",
};

interface InvoiceStatusActionsProps {
  invoiceId: string;
  currentStatus: InvoiceStatus;
  /** Masque le titre — utilisé quand la card parente fournit l’en-tête. */
  embedded?: boolean;
}

export function InvoiceStatusActions({
  invoiceId,
  currentStatus,
  embedded = false,
}: InvoiceStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const nextStatuses = getAllowedNextStatuses(currentStatus).filter(
    (status) => status !== "sent" && status !== "ready",
  );

  if (nextStatuses.length === 0) {
    return null;
  }

  function handleStatusChange(newStatus: InvoiceStatus) {
    if (isPending) return;
    startTransition(async () => {
      const result = await runServerAction(() =>
        changeInvoiceStatusAction(invoiceId, newStatus),
      );
      if (
        applyActionResult(result, router, {
          successMessage: `Statut : ${INVOICE_STATUS_LABELS[newStatus]}`,
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
              : ACTION_LABELS[status] ?? INVOICE_STATUS_LABELS[status]}
          </Button>
        ))}
      </div>
    </div>
  );
}
