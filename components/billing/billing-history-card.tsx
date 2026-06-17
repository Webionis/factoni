import { ExternalLink, Receipt } from "lucide-react";

import type { BillingHistoryEntry } from "@/lib/billing/stripe/billing-history";
import {
  interactiveRowClassName,
  sectionHeadingClassName,
  surfaceCardClassName,
} from "@/lib/constants/ui";
import { formatParisCalendarDate } from "@/lib/format/datetime";
import { cn } from "@/lib/utils";

interface BillingHistoryCardProps {
  entries: BillingHistoryEntry[];
  className?: string;
}

const STATUS_LABELS = {
  paid: "Payé",
  pending: "En attente",
  failed: "Échoué",
} as const;

const STATUS_CLASS_NAMES = {
  paid:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  pending:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  failed: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
} as const;

function formatBillingDate(isoDate: string): string {
  return formatParisCalendarDate(isoDate, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBillingAmount(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

export function BillingHistoryCard({
  entries,
  className,
}: BillingHistoryCardProps) {
  return (
    <section
      className={cn(surfaceCardClassName, "p-6 sm:p-7", className)}
      aria-labelledby="billing-history-heading"
    >
      <h2 id="billing-history-heading" className={sectionHeadingClassName}>
        Historique de facturation
      </h2>

      {entries.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-[rgba(15,23,42,0.08)] bg-[#f8fafc]/80 px-6 py-10 text-center dark:border-[rgba(148,163,184,0.14)] dark:bg-[rgba(15,23,42,0.4)]">
          <span className="flex size-11 items-center justify-center rounded-xl bg-white text-[#94a3b8] shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:bg-[rgba(30,41,59,0.72)] dark:text-[#64748b] dark:shadow-[0_1px_2px_rgba(0,0,0,0.18)]">
            <Receipt className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <p className="mt-4 text-sm font-medium text-[#334155] dark:text-[#cbd5e1]">
            Aucune facture pour le moment
          </p>
          <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-[#64748b] dark:text-[#94a3b8]">
            Vos paiements d&apos;abonnement et compléments de changement
            d&apos;offre apparaîtront ici dès qu&apos;ils seront enregistrés.
          </p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-[rgba(15,23,42,0.06)] dark:divide-[rgba(148,163,184,0.12)]">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className={cn(
                interactiveRowClassName,
                "-mx-2 flex flex-col gap-3 rounded-lg px-2 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between",
              )}
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-medium text-[#0f172a] dark:text-[#e2e8f0]">
                  {entry.label}
                </p>
                <p className="text-[13px] text-[#64748b] dark:text-[#94a3b8]">
                  {formatBillingDate(entry.dateIso)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                    STATUS_CLASS_NAMES[entry.status],
                  )}
                >
                  {STATUS_LABELS[entry.status]}
                </span>

                <p className="min-w-[5.5rem] text-right text-sm font-semibold tabular-nums text-[#0f172a] dark:text-[#e2e8f0]">
                  {formatBillingAmount(entry.amountCents, entry.currency)}
                </p>

                {entry.documentUrl ? (
                  <a
                    href={entry.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-[#2563eb] hover:text-[#1d4ed8] dark:text-[#60a5fa] dark:hover:text-[#93c5fd]"
                  >
                    Facture
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
