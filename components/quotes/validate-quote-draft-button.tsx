"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { validateQuoteDraftAction } from "@/lib/actions/quotes";
import { applyActionResult, runServerAction } from "@/lib/client/action-feedback";
import { Button } from "@/components/ui/button";

interface ValidateQuoteDraftButtonProps {
  quoteId: string;
}

export function ValidateQuoteDraftButton({
  quoteId,
}: ValidateQuoteDraftButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleValidate() {
    if (isPending) return;
    startTransition(async () => {
      const result = await runServerAction(() =>
        validateQuoteDraftAction(quoteId),
      );
      if (
        applyActionResult(result, router, {
          successMessage: "Devis validé — prêt à envoyer",
        })
      ) {
        router.refresh();
      }
    });
  }

  return (
    <Button
      type="button"
      className="h-11 w-full gap-2 sm:w-auto"
      disabled={isPending}
      onClick={handleValidate}
    >
      <CheckCircle2 className="size-4" aria-hidden />
      {isPending ? "Validation…" : "Valider le brouillon"}
    </Button>
  );
}
