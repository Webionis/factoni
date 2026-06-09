"use client";

import Link from "next/link";
import { FileInput, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { convertQuoteToInvoiceAction } from "@/lib/actions/quotes";
import { openOrCreateBalanceInvoiceAction } from "@/lib/actions/quote-balance-invoice";
import { applyActionResult, runServerAction } from "@/lib/client/action-feedback";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import type { QuoteInvoiceActionMode } from "@/lib/quotes/balance-invoice-action";
import { cn } from "@/lib/utils";

interface QuoteInvoiceActionButtonProps {
  quoteId: string;
  mode: QuoteInvoiceActionMode;
  invoiceId?: string | null;
}

const LABELS: Record<
  Exclude<QuoteInvoiceActionMode, "none">,
  { label: string; pending: string; icon: typeof FileInput }
> = {
  convert_full: {
    label: "Transformer en facture",
    pending: "Création…",
    icon: FileInput,
  },
  create_balance: {
    label: "Créer la facture de solde",
    pending: "Création…",
    icon: FileInput,
  },
  view_balance: {
    label: "Voir la facture de solde",
    pending: "Ouverture…",
    icon: FileText,
  },
  view_invoice: {
    label: "Voir la facture",
    pending: "Ouverture…",
    icon: FileText,
  },
};

export function QuoteInvoiceActionButton({
  quoteId,
  mode,
  invoiceId,
}: QuoteInvoiceActionButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (mode === "none") {
    return null;
  }

  const config = LABELS[mode];
  const Icon = config.icon;

  if ((mode === "view_balance" || mode === "view_invoice") && invoiceId) {
    return (
      <Link
        href={`/invoices/${invoiceId}/edit`}
        className={cn(
          buttonVariants({ variant: "default" }),
          "h-11 w-full gap-2 sm:w-auto",
        )}
      >
        <Icon className="size-4" aria-hidden />
        {config.label}
      </Link>
    );
  }

  function handleClick() {
    if (isPending) return;
    startTransition(async () => {
      const action =
        mode === "convert_full"
          ? () => convertQuoteToInvoiceAction(quoteId)
          : () => openOrCreateBalanceInvoiceAction(quoteId);

      const result = await runServerAction(action);
      applyActionResult(result, router, {
        successMessage:
          mode === "convert_full"
            ? "Facture créée depuis le devis"
            : "Facture de solde créée",
      });
    });
  }

  return (
    <Button
      type="button"
      className="h-11 w-full gap-2 sm:w-auto"
      disabled={isPending}
      onClick={handleClick}
    >
      <Icon className="size-4" aria-hidden />
      {isPending ? config.pending : config.label}
    </Button>
  );
}
