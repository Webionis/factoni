"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Banknote, Download, Percent } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestQuoteDepositAction } from "@/lib/actions/quote-deposit";
import { formatCurrency } from "@/lib/invoices/calculate";
import {
  calculateDepositAmount,
  canRequestQuoteDeposit,
  getQuoteDepositInfo,
  type QuoteDepositType,
} from "@/lib/quotes/deposit";
import type { QuoteDetail } from "@/lib/data/quotes";
import { cn } from "@/lib/utils";

interface QuoteDepositSectionProps {
  quote: QuoteDetail;
}

export function QuoteDepositSection({ quote }: QuoteDepositSectionProps) {
  const [enabled, setEnabled] = useState(false);
  const [depositType, setDepositType] = useState<QuoteDepositType>("percent");
  const [value, setValue] = useState("30");
  const [isPending, startTransition] = useTransition();

  const totalTtc = Number(quote.total_ttc);
  const depositInfo = getQuoteDepositInfo(quote);
  const canRequest = canRequestQuoteDeposit(quote);

  const preview = useMemo(() => {
    const numericValue = Number(value.replace(",", "."));
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return null;
    }
    return calculateDepositAmount(totalTtc, depositType, numericValue);
  }, [depositType, totalTtc, value]);

  function handleRequest() {
    const numericValue = Number(value.replace(",", "."));
    startTransition(async () => {
      const result = await requestQuoteDepositAction(
        quote.id,
        depositType,
        numericValue,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Demande d'acompte envoyée au client.");
    });
  }

  if (depositInfo.depositStatus === "paid") {
    return (
      <Card className="border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <CardHeader className="px-5 pb-2 pt-5 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-emerald-800 dark:text-emerald-300">
            <Banknote className="size-4" aria-hidden />
            Acompte payé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-5 pb-5 text-sm sm:px-6 sm:pb-6">
          <p>
            Montant :{" "}
            <span className="font-semibold tabular-nums">
              {formatCurrency(depositInfo.depositAmount ?? 0)}
            </span>
            {depositInfo.typeLabel ? ` (${depositInfo.typeLabel})` : null}
          </p>
          {depositInfo.paidAt ? (
            <p className="text-muted-foreground">
              Payé le{" "}
              {new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(depositInfo.paidAt))}
            </p>
          ) : null}
          {depositInfo.remainingBalance != null ? (
            <p>
              Reste à facturer :{" "}
              <span className="font-semibold tabular-nums">
                {formatCurrency(depositInfo.remainingBalance)}
              </span>
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href={`/api/quotes/${quote.id}/deposit-receipt`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5",
              )}
            >
              <Download className="size-3.5" aria-hidden />
              Télécharger le reçu
            </a>
            {depositInfo.balanceInvoiceId ? (
              <Link
                href={`/invoices/${depositInfo.balanceInvoiceId}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                )}
              >
                Voir la facture de solde
              </Link>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (depositInfo.depositStatus === "requested") {
    return (
      <Card>
        <CardHeader className="px-5 pb-2 pt-5 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Banknote className="size-4 text-primary" aria-hidden />
            Acompte demandé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-5 pb-5 text-sm sm:px-6 sm:pb-6">
          <p>
            {depositInfo.typeLabel} —{" "}
            <span className="font-semibold tabular-nums">
              {formatCurrency(depositInfo.depositAmount ?? 0)}
            </span>
          </p>
          {depositInfo.remainingBalance != null ? (
            <p className="text-muted-foreground">
              Reste final : {formatCurrency(depositInfo.remainingBalance)}
            </p>
          ) : null}
          <p className="text-muted-foreground">
            En attente du paiement client via le lien public du devis.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!canRequest) return null;

  return (
    <Card>
      <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Banknote className="size-4 text-primary" aria-hidden />
          Acompte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-6 sm:px-6">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="size-4 rounded border-input"
          />
          <span className="text-sm font-medium">Activer l&apos;acompte</span>
        </label>

        {enabled ? (
          <>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={depositType === "percent" ? "default" : "outline"}
                size="sm"
                onClick={() => setDepositType("percent")}
                className="gap-1.5"
              >
                <Percent className="size-3.5" aria-hidden />
                Pourcentage
              </Button>
              <Button
                type="button"
                variant={depositType === "fixed" ? "default" : "outline"}
                size="sm"
                onClick={() => setDepositType("fixed")}
                className="gap-1.5"
              >
                <Banknote className="size-3.5" aria-hidden />
                Montant fixe
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit-value">
                {depositType === "percent" ? "Pourcentage (%)" : "Montant (€)"}
              </Label>
              <Input
                id="deposit-value"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="max-w-[200px]"
              />
            </div>

            {preview ? (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm">
                <div className="flex justify-between gap-4 py-1">
                  <span className="text-muted-foreground">Devis TTC</span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(totalTtc)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-1">
                  <span className="text-muted-foreground">Acompte demandé</span>
                  <span className="font-semibold tabular-nums text-primary">
                    {formatCurrency(preview.depositAmount)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 border-t border-border/50 pt-2">
                  <span className="font-medium">Reste final</span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(preview.remainingBalance)}
                  </span>
                </div>
              </div>
            ) : null}

            <Button
              type="button"
              onClick={handleRequest}
              disabled={isPending || !preview}
              className={cn("h-11 w-full sm:w-auto")}
            >
              {isPending ? "Envoi…" : "Demander l'acompte"}
            </Button>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
