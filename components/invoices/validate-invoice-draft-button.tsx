"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { validateInvoiceDraftAction } from "@/lib/actions/invoices";
import { applyActionResult, runServerAction } from "@/lib/client/action-feedback";
import { Button } from "@/components/ui/button";

interface ValidateInvoiceDraftButtonProps {
  invoiceId: string;
  disabled?: boolean;
  disabledReason?: string;
}

export function ValidateInvoiceDraftButton({
  invoiceId,
  disabled = false,
  disabledReason,
}: ValidateInvoiceDraftButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleValidate() {
    if (disabled || isPending) return;
    startTransition(async () => {
      const result = await runServerAction(() =>
        validateInvoiceDraftAction(invoiceId),
      );
      if (
        applyActionResult(result, router, {
          successMessage: "Facture validée — prête à envoyer",
        })
      ) {
        router.refresh();
      }
    });
  }

  if (disabled && disabledReason) {
    return (
      <div className="flex w-full flex-col gap-1.5 sm:w-auto">
        <Button
          type="button"
          className="h-11 w-full gap-2 sm:w-auto"
          disabled
          title={disabledReason}
        >
          <CheckCircle2 className="size-4" aria-hidden />
          Valider le brouillon
        </Button>
        <p className="text-xs text-muted-foreground">{disabledReason}</p>
      </div>
    );
  }

  return (
    <Button
      type="button"
      className="h-11 w-full gap-2 sm:w-auto"
      disabled={disabled || isPending}
      onClick={handleValidate}
    >
      <CheckCircle2 className="size-4" aria-hidden />
      {isPending ? "Validation…" : "Valider le brouillon"}
    </Button>
  );
}
