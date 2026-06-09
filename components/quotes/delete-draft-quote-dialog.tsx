"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteDraftQuoteAction } from "@/lib/actions/quotes";
import { applyActionResult, runServerAction } from "@/lib/client/action-feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteDraftQuoteDialogProps {
  quoteId: string;
  variant?: "default" | "outline";
}

export function DeleteDraftQuoteDialog({
  quoteId,
  variant = "default",
}: DeleteDraftQuoteDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (isPending) return;
    startTransition(async () => {
      const result = await runServerAction(() =>
        deleteDraftQuoteAction(quoteId),
      );
      applyActionResult(result, router, {
        successMessage: "Devis supprimé",
      });
    });
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant={variant === "outline" ? "outline" : "destructive"}
            className={
              variant === "outline"
                ? "h-10 border-destructive/25 text-destructive hover:bg-destructive/5 hover:text-destructive dark:border-destructive/30 dark:hover:bg-destructive/10"
                : "h-11"
            }
          >
            Supprimer le brouillon
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer ce devis ?</DialogTitle>
          <DialogDescription>
            Cette action est définitive. Le brouillon et ses lignes seront
            supprimés.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending ? "Suppression…" : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
