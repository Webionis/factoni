"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteDraftInvoiceAction } from "@/lib/actions/invoices";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { invoiceDisplayNumber } from "@/lib/invoices/status";
import { cn } from "@/lib/utils";

interface DeleteDraftInvoiceDialogProps {
  invoiceId: string;
  invoiceNumber: string | null;
  variant?: "default" | "outline";
}

export function DeleteDraftInvoiceDialog({
  invoiceId,
  invoiceNumber,
  variant = "default",
}: DeleteDraftInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteDraftInvoiceAction(invoiceId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Brouillon supprimé");
      setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        className={cn(
          "inline-flex items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors sm:w-auto",
          variant === "outline"
            ? "h-10 border border-destructive/25 text-destructive hover:bg-destructive/5 dark:border-destructive/30 dark:hover:bg-destructive/10"
            : "h-11 w-full border border-destructive/30 text-destructive hover:bg-destructive/10",
        )}
      >
        Supprimer le brouillon
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce brouillon ?</AlertDialogTitle>
          <AlertDialogDescription>
            {invoiceDisplayNumber(invoiceNumber, invoiceId)} sera supprimé
            définitivement.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
          >
            {isPending ? "Suppression…" : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
