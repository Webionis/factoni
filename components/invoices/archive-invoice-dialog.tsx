"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

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
import { archiveInvoiceAction } from "@/lib/actions/invoices";
import { invoiceDisplayNumber } from "@/lib/invoices/status";
import { cn } from "@/lib/utils";

interface ArchiveInvoiceDialogProps {
  invoiceId: string;
  invoiceNumber: string | null;
}

export function ArchiveInvoiceDialog({
  invoiceId,
  invoiceNumber,
}: ArchiveInvoiceDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveInvoiceAction(invoiceId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Facture archivée");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        className={cn(
          "inline-flex h-11 w-full items-center justify-center rounded-lg border border-border/60 px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 sm:w-auto",
        )}
      >
        Exclure du dashboard
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archiver cette facture ?</AlertDialogTitle>
          <AlertDialogDescription>
            {invoiceDisplayNumber(invoiceNumber, invoiceId)} sera masquée du
            tableau de bord et du chiffre d&apos;affaires, mais restera
            conservée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              handleArchive();
            }}
          >
            {isPending ? "Archivage…" : "Archiver"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
