import { CheckCircle2 } from "lucide-react";

import type { PortalActionBreakdown } from "@/lib/client-portal/status";
import { cn } from "@/lib/utils";

interface PortalHeroProps {
  breakdown: PortalActionBreakdown;
  actionRequired: number;
}

function pluralize(count: number, singular: string, plural: string): string {
  return count > 1 ? plural : singular;
}

export function PortalHero({ breakdown, actionRequired }: PortalHeroProps) {
  const hasActions = actionRequired > 0;

  const items: { key: string; text: string }[] = [];

  if (breakdown.quotesToSign > 0) {
    items.push({
      key: "quotes",
      text: `${breakdown.quotesToSign} ${pluralize(breakdown.quotesToSign, "devis à signer", "devis à signer")}`,
    });
  }
  if (breakdown.invoicesToPay > 0) {
    items.push({
      key: "invoices",
      text: `${breakdown.invoicesToPay} ${pluralize(breakdown.invoicesToPay, "facture à payer", "factures à payer")}`,
    });
  }
  if (breakdown.invoicesOverdue > 0) {
    items.push({
      key: "overdue",
      text: `${breakdown.invoicesOverdue} ${pluralize(breakdown.invoicesOverdue, "facture en retard", "factures en retard")}`,
    });
  }
  if (breakdown.depositsToPay > 0) {
    items.push({
      key: "deposits",
      text: `${breakdown.depositsToPay} ${pluralize(breakdown.depositsToPay, "acompte à payer", "acomptes à payer")}`,
    });
  }

  return (
    <section
      className={cn(
        "rounded-xl border px-4 py-4 transition-[box-shadow,background-color] duration-200 sm:px-5 sm:py-5",
        hasActions
          ? "border-blue-200/70 bg-gradient-to-br from-blue-50/90 to-indigo-50/40 dark:border-blue-900/40 dark:from-blue-950/30 dark:to-indigo-950/20"
          : "border-emerald-200/70 bg-gradient-to-br from-emerald-50/80 to-teal-50/30 dark:border-emerald-900/40 dark:from-emerald-950/25 dark:to-teal-950/15",
      )}
      aria-live="polite"
    >
      {hasActions ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
            À faire maintenant
          </h2>
          <ul className="space-y-1.5 text-sm text-foreground/90">
            {items.map((item) => (
              <li key={item.key} className="flex items-start gap-2">
                <span
                  className="mt-[7px] size-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400"
                  aria-hidden
                />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden
          />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight sm:text-base">
              Tout est à jour
            </h2>
            <p className="text-sm text-muted-foreground">
              Aucun document en attente.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
