"use client";

import { Link2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { useHasFeature } from "@/components/billing/subscription-provider";
import { UpgradePlanPrompt } from "@/components/billing/upgrade-plan-prompt";
import { getInvoicePublicLinkAction } from "@/lib/actions/invoices";
import { getQuotePublicLinkAction } from "@/lib/actions/quotes";
import { Button } from "@/components/ui/button";
import type { DocumentType } from "@/lib/documents/types";

interface CopyPublicDocumentLinkButtonProps {
  documentId: string;
  documentKind: DocumentType;
}

export function CopyPublicDocumentLinkButton({
  documentId,
  documentKind,
}: CopyPublicDocumentLinkButtonProps) {
  const [isPending, startTransition] = useTransition();
  const hasAccess = useHasFeature("advancedTracking");

  if (!hasAccess) {
    return (
      <UpgradePlanPrompt feature="advancedTracking" compact className="w-full" />
    );
  }

  function handleCopy() {
    if (isPending) return;
    startTransition(async () => {
      const result =
        documentKind === "quote"
          ? await getQuotePublicLinkAction(documentId)
          : await getInvoicePublicLinkAction(documentId);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      try {
        await navigator.clipboard.writeText(result.url);
        toast.success("Lien client copié");
      } catch {
        toast.error("Impossible de copier le lien client.");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full gap-2 sm:w-auto"
      disabled={isPending}
      onClick={handleCopy}
    >
      <Link2 className="size-4" aria-hidden />
      {isPending ? "…" : "Copier le lien"}
    </Button>
  );
}
