import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

import { InvoiceCard } from "@/components/invoices/invoice-card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import type { InvoiceWithClient } from "@/lib/data/invoices";
import { sectionHeadingClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface RecentInvoicesProps {
  invoices: InvoiceWithClient[];
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <section className="space-y-4" aria-labelledby="recent-invoices-heading">
      <div className="flex items-center justify-between gap-3">
        <h2
          id="recent-invoices-heading"
          className={sectionHeadingClassName}
        >
          Dernières factures
        </h2>
        {invoices.length > 0 ? (
          <Link
            href="/invoices"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-10 gap-1 px-2",
            )}
          >
            Tout voir
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucune facture pour le moment"
          description="Créez votre première facture en moins d'une minute."
          actionLabel="Nouvelle facture"
          actionHref="/invoices/new"
        />
      ) : (
        <ul className="space-y-3">
          {invoices.map((invoice) => (
            <li key={invoice.id}>
              <InvoiceCard invoice={invoice} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
