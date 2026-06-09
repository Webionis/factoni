import { Receipt } from "lucide-react";

import { sectionHeadingClassName, surfaceCardClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface BillingHistoryCardProps {
  className?: string;
}

export function BillingHistoryCard({ className }: BillingHistoryCardProps) {
  return (
    <section
      className={cn(surfaceCardClassName, "p-6 sm:p-7", className)}
      aria-labelledby="billing-history-heading"
    >
      <h2
        id="billing-history-heading"
        className={sectionHeadingClassName}
      >
        Historique de facturation
      </h2>

      <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-[rgba(15,23,42,0.08)] bg-[#f8fafc]/80 px-6 py-10 text-center dark:border-[rgba(148,163,184,0.14)] dark:bg-[rgba(15,23,42,0.4)]">
        <span className="flex size-11 items-center justify-center rounded-xl bg-white text-[#94a3b8] shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:bg-[rgba(30,41,59,0.72)] dark:text-[#64748b] dark:shadow-[0_1px_2px_rgba(0,0,0,0.18)]">
          <Receipt className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <p className="mt-4 text-sm font-medium text-[#334155] dark:text-[#cbd5e1]">
          Aucun paiement pour le moment
        </p>
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-[#64748b] dark:text-[#94a3b8]">
          Factoni est actuellement gratuit pendant la phase bêta. Vos futures
          factures d&apos;abonnement apparaîtront ici.
        </p>
      </div>
    </section>
  );
}
