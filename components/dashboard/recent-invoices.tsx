import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

import { InvoicesTable } from "@/components/invoices/invoices-table";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import type { InvoiceWithClient } from "@/lib/data/invoices";
import {
  sectionHeadingClassName,
} from "@/lib/constants/ui";
import { dashboardSectionSubheadingClassName } from "@/lib/constants/dashboard-mobile";
import { cn } from "@/lib/utils";

interface RecentInvoicesProps {
  invoices: InvoiceWithClient[];
  maxItems?: number;
}

export function RecentInvoices({ invoices, maxItems }: RecentInvoicesProps) {
  const visibleInvoices =
    maxItems !== undefined ? invoices.slice(0, maxItems) : invoices;

  return (
    <section className="min-w-0 space-y-4" aria-labelledby="recent-invoices-heading">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id="recent-invoices-heading" className={sectionHeadingClassName}>
            Dernières factures
          </h2>
          <p className={cn("mt-0.5", dashboardSectionSubheadingClassName)}>
            Vos factures les plus récentes, prêtes à consulter.
          </p>
        </div>
        {invoices.length > 0 ? (
          <Link
            href="/invoices"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-10 shrink-0 gap-1 px-2",
            )}
          >
            Tout voir
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>

      {visibleInvoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucune facture pour le moment"
          description="Créez votre première facture en moins d'une minute."
          actionLabel="Nouvelle facture"
          actionHref="/invoices/new"
        />
      ) : (
        <InvoicesTable invoices={visibleInvoices} />
      )}
    </section>
  );
}
