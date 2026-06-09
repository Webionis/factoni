"use client";

import { FileInput } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { convertQuoteToInvoiceAction } from "@/lib/actions/quotes";
import { applyActionResult, runServerAction } from "@/lib/client/action-feedback";
import { Button } from "@/components/ui/button";

interface ConvertQuoteButtonProps {
  quoteId: string;
}

export function ConvertQuoteButton({ quoteId }: ConvertQuoteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleConvert() {
    if (isPending) return;
    startTransition(async () => {
      const result = await runServerAction(() =>
        convertQuoteToInvoiceAction(quoteId),
      );
      applyActionResult(result, router, {
        successMessage: "Facture créée depuis le devis",
      });
    });
  }

  return (
    <Button
      type="button"
      className="h-11 w-full gap-2 sm:w-auto"
      disabled={isPending}
      onClick={handleConvert}
    >
      <FileInput className="size-4" aria-hidden />
      {isPending ? "Création…" : "Transformer en facture"}
    </Button>
  );
}
