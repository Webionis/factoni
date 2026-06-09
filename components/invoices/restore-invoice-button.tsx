"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { restoreInvoiceAction } from "@/lib/actions/invoices";

interface RestoreInvoiceButtonProps {
  invoiceId: string;
}

export function RestoreInvoiceButton({ invoiceId }: RestoreInvoiceButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRestore() {
    startTransition(async () => {
      const result = await restoreInvoiceAction(invoiceId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Facture restaurée dans le tableau de bord");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full sm:w-auto"
      disabled={isPending}
      onClick={handleRestore}
    >
      {isPending ? "Restauration…" : "Restaurer dans le dashboard"}
    </Button>
  );
}
