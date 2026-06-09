import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { InvoiceArchivedBadge } from "@/components/invoices/invoice-archived-badge";
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge";
import {
  clientNameFromInvoice,
  clientNameFromSnapshot,
} from "@/lib/data/invoices";
import type { QuoteWithClient } from "@/lib/data/quotes";
import { isQuoteDocument } from "@/lib/documents/types";
import { isInvoiceArchived } from "@/lib/invoices/archive";
import { formatCurrency } from "@/lib/invoices/calculate";
import { getEffectiveQuoteStatus } from "@/lib/quotes/expiry";
import { quoteDisplayNumber } from "@/lib/quotes/status";
import { surfaceCardInteractiveClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface QuoteCardProps {
  quote: QuoteWithClient;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function QuoteCard({ quote }: QuoteCardProps) {
  if (!isQuoteDocument(quote.document_type)) {
    return null;
  }

  const displayStatus = getEffectiveQuoteStatus(
    quote.status as Parameters<typeof getEffectiveQuoteStatus>[0],
    quote.due_date,
  );
  const clientLabel =
    clientNameFromSnapshot(quote.client_snapshot) ??
    clientNameFromInvoice(quote);
  const archived = isInvoiceArchived(quote.archived_at);

  return (
    <Link href={`/quotes/${quote.id}`} className="block group touch-manipulation">
      <article
        className={cn(
          surfaceCardInteractiveClassName,
          "p-3.5 transition-transform duration-150 active:scale-[0.99] sm:p-5",
        )}
      >
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="font-mono text-[13px] font-semibold tracking-tight sm:text-sm">
                {quoteDisplayNumber(quote.invoice_number, quote.id)}
              </p>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                {archived ? <InvoiceArchivedBadge /> : null}
                <QuoteStatusBadge status={displayStatus} />
              </div>
            </div>
            <p className="mt-0.5 truncate text-[13px] text-muted-foreground sm:text-sm">
              {clientLabel}
            </p>
            <div className="mt-2 flex items-end justify-between gap-2">
              <p className="text-base font-semibold tabular-nums tracking-tight sm:text-lg">
                {formatCurrency(Number(quote.total_ttc))}
              </p>
              <p className="shrink-0 text-[11px] text-muted-foreground sm:text-xs">
                {formatDate(quote.issue_date)}
              </p>
            </div>
          </div>
          <ChevronRight
            className="mt-1 hidden size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:block"
            aria-hidden
          />
        </div>
      </article>
    </Link>
  );
}
