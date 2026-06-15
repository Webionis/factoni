import Link from "next/link";
import { TrendingUp } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { surfaceInfoBannerClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

export function MonthEmptyBanner() {
  return (
    <div className={cn(surfaceInfoBannerClassName, "p-5 sm:p-6")} role="status">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(37,99,235,0.08)] text-[#2563eb] dark:bg-blue-500/15 dark:text-[#60a5fa]">
            <TrendingUp className="size-5" aria-hidden />
          </div>
          <div>
            <p className="font-semibold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              Aucune facture émise ce mois-ci
            </p>
            <p className="mt-0.5 text-sm text-[#64748b] dark:text-[#94a3b8]">
              Envoyez une facture pour voir votre CA apparaître ici.
            </p>
          </div>
        </div>
        <Link
          href="/invoices/new"
          className={cn(buttonVariants({ size: "sm" }), "h-11 shrink-0 px-5")}
        >
          Nouvelle facture
        </Link>
      </div>
    </div>
  );
}
