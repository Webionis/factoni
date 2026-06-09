"use client";

import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { duplicateQuoteAction } from "@/lib/actions/quotes";
import { applyActionResult, runServerAction } from "@/lib/client/action-feedback";
import { Button } from "@/components/ui/button";

interface DuplicateQuoteButtonProps {
  quoteId: string;
  className?: string;
}

export function DuplicateQuoteButton({
  quoteId,
  className,
}: DuplicateQuoteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDuplicate() {
    startTransition(async () => {
      const result = await runServerAction(() =>
        duplicateQuoteAction(quoteId),
      );
      applyActionResult(result, router, {
        successMessage: "Brouillon créé à partir du devis",
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
