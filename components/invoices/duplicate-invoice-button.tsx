"use client";

import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { duplicateInvoiceAction } from "@/lib/actions/invoices";
import { applyActionResult, runServerAction } from "@/lib/client/action-feedback";
import { Button } from "@/components/ui/button";

interface DuplicateInvoiceButtonProps {
  invoiceId: string;
  className?: string;
}

export function DuplicateInvoiceButton({
  invoiceId,
  className,
}: DuplicateInvoiceButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDuplicate() {
    startTransition(async () => {
      const result = await runServerAction(() =>
        duplicateInvoiceAction(invoiceId),
      );
      applyActionResult(result, router, {
        successMessage: "Brouillon créé à partir de la facture",
      });
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={className ?? "h-11 w-full gap-2 sm:w-auto"}
      disabled={isPending}
      onClick={handleDuplicate}
    >
      <Copy className="size-4" aria-hidden />
      {isPending ? "Duplication…" : "Dupliquer en brouillon"}
    </Button>
  );
}
