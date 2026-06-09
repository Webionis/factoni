"use client";

import { Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sendManualInvoiceReminderAction } from "@/lib/actions/invoice-reminder";
import { applyActionResult, runServerAction } from "@/lib/client/action-feedback";

interface InvoiceReminderButtonProps {
  invoiceId: string;
  recipientEmail: string;
  disabled?: boolean;
  disabledReason?: string;
}

export function InvoiceReminderButton({
  invoiceId,
  recipientEmail,
  disabled = false,
  disabledReason,
}: InvoiceReminderButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fullyDisabled = disabled || !recipientEmail;

  function handleConfirm() {
    if (isPending) return;
    startTransition(async () => {
      const result = await runServerAction(() =>
        sendManualInvoiceReminderAction(invoiceId),
      );
      applyActionResult(result, router, {
        successMessage: "Relance envoyée au client",
      });
      if (!result.error) {
        setOpen(false);
      }
    });
  }

  if (disabled && disabledReason) {
    return (
      <div className="flex w-full flex-col gap-1.5 sm:w-auto">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-2 sm:w-auto"
          disabled
          title={disabledReason}
        >
          <Mail className="size-4" aria-hidden />
          Relancer le client
        </Button>
        <p className="text-xs text-muted-foreground">{disabledReason}</p>
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full gap-2 sm:w-auto"
        disabled={fullyDisabled || isPending}
        onClick={() => setOpen(true)}
      >
        <Mail className="size-4" aria-hidden />
        Relancer le client
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Relancer le client</DialogTitle>
            <DialogDescription>
              Un email professionnel sera envoyé immédiatement à{" "}
              <span className="font-medium text-foreground">{recipientEmail}</span>{" "}
              avec le lien vers la facture.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            La relance sera enregistrée dans l&apos;historique et apparaîtra dans
            votre activité récente.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose disabled={isPending}>Annuler</DialogClose>
            <Button
              type="button"
              className="gap-2"
              disabled={isPending}
              onClick={handleConfirm}
            >
              <Mail className="size-4" aria-hidden />
              {isPending ? "Envoi…" : "Envoyer la relance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
