"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { retryInvoiceEinvoicingTransmissionAction } from "@/lib/actions/einvoicing-retry";
import { useHasFeature } from "@/components/billing/subscription-provider";
import { UpgradePlanPrompt } from "@/components/billing/upgrade-plan-prompt";
import { runServerAction } from "@/lib/client/action-feedback";
import { Button } from "@/components/ui/button";
import type { InvoiceEinvoicingTransmission } from "@/lib/data/einvoicing";

interface RetryEinvoicingTransmissionButtonProps {
  invoiceId: string;
  latestTransmission: InvoiceEinvoicingTransmission | null;
}

export function RetryEinvoicingTransmissionButton({
  invoiceId,
  latestTransmission,
}: RetryEinvoicingTransmissionButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const hasAccess = useHasFeature("automation");

  if (!latestTransmission || latestTransmission.status !== "failed") {
    return null;
  }

  if (!hasAccess) {
    return <UpgradePlanPrompt feature="automation" compact />;
  }

  function handleRetry() {
    if (isPending) return;
    startTransition(async () => {
      const result = await runServerAction(() =>
        retryInvoiceEinvoicingTransmissionAction(invoiceId),
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.successDetail) {
        toast.success(result.successDetail);
      }
      if (result.warning) {
        toast.warning(result.warning);
      }
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full sm:w-auto"
      disabled={isPending}
      onClick={handleRetry}
    >
      {isPending ? "Transmission…" : "Réessayer la transmission PA"}
    </Button>
  );
}
