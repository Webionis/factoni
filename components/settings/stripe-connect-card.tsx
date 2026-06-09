"use client";

import { useTransition } from "react";
import { AlertCircle, CheckCircle2, CreditCard } from "lucide-react";
import { toast } from "sonner";

import {
  startStripeConnectOnboardingAction,
  syncStripeConnectStatusAction,
} from "@/lib/actions/stripe-connect";
import { Button } from "@/components/ui/button";
import { surfaceCardClassName } from "@/lib/constants/ui";
import type { StripeConnectProfile } from "@/lib/data/stripe-connect";
import { cn } from "@/lib/utils";

interface StripeConnectCardProps {
  connectProfile: StripeConnectProfile | null;
  stripeConfigured: boolean;
}

export function StripeConnectCard({
  connectProfile,
  stripeConfigured,
}: StripeConnectCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleConnect() {
    startTransition(async () => {
      const result = await startStripeConnectOnboardingAction();
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  function handleRefresh() {
    startTransition(async () => {
      const result = await syncStripeConnectStatusAction();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Statut Stripe mis à jour.");
    });
  }

  const isReady = connectProfile?.isReadyForPayments ?? false;
  const isFullyActive = connectProfile?.isFullyActive ?? false;
  const hasAccount = Boolean(connectProfile?.accountId);

  const connectButtonLabel = isPending
    ? "Redirection…"
    : isFullyActive
      ? "Gérer mon compte Stripe"
      : hasAccount
        ? "Finalisez votre compte Stripe"
        : "Connecter Stripe";

  return (
    <section className={cn(surfaceCardClassName, "space-y-5 p-6 sm:p-7")}>
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(37,99,235,0.08)] dark:bg-[rgba(59,130,246,0.14)]">
          <CreditCard className="size-5 text-[#2563eb] dark:text-[#93c5fd]" />
        </div>
        <div className="min-w-0 space-y-1">
          <h2 className="text-base font-semibold tracking-tight">
            Paiements Stripe Connect
          </h2>
          <p className="text-sm text-muted-foreground">
            Les paiements de vos clients arrivent directement sur votre compte
            bancaire. Factoni n&apos;encaisse pas l&apos;argent.
          </p>
        </div>
      </div>

      {!stripeConfigured ? (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
          Stripe n&apos;est pas encore configuré sur cette instance.
        </p>
      ) : null}

      {isFullyActive ? (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-50">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Paiements activés</p>
            <p className="mt-1 text-emerald-900/80 dark:text-emerald-100/80">
              Votre compte Stripe est actif. Gérez vos virements et paramètres
              depuis le tableau de bord Express.
            </p>
          </div>
        </div>
      ) : isReady ? (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-50">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Paiements activés</p>
            <p className="mt-1 text-emerald-900/80 dark:text-emerald-100/80">
              Vos clients peuvent payer vos factures en ligne via Stripe Checkout.
            </p>
          </div>
        </div>
      ) : hasAccount ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200/70 bg-amber-50/60 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-50">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Finalisez votre compte Stripe</p>
            <p className="mt-1 text-amber-900/80 dark:text-amber-100/80">
              Terminez l&apos;onboarding Stripe pour activer le bouton « Payer
              maintenant » sur vos factures.
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Connectez votre compte Stripe Express pour recevoir les paiements
          directement.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          className="h-11"
          disabled={!stripeConfigured || isPending}
          onClick={handleConnect}
        >
          {connectButtonLabel}
        </Button>
        {hasAccount ? (
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={!stripeConfigured || isPending}
            onClick={handleRefresh}
          >
            Actualiser le statut
          </Button>
        ) : null}
      </div>
    </section>
  );
}
