import Link from "next/link";
import { TrendingUp } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MonthEmptyBanner() {
  return (
    <div
      className="flex flex-col gap-4 rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <div className="flex gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <TrendingUp className="size-5 text-primary" aria-hidden />
        </div>
        <div>
          <p className="font-semibold">Aucune facture émise ce mois-ci</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
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
  );
}
