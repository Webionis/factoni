import { Calendar } from "lucide-react";

import { InvoiceArchivedBadge } from "@/components/invoices/invoice-archived-badge";
import { InvoiceTotalsSummary } from "@/components/invoices/invoice-totals-summary";
import { QuoteAcceptanceReceived } from "@/components/quotes/quote-acceptance-received";
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { surfaceCardClassName } from "@/lib/constants/ui";
import type { InvoiceTotals } from "@/lib/invoices/calculate";
import type { QuoteStatus } from "@/lib/quotes/status";
import { cn } from "@/lib/utils";

interface QuoteDetailSidebarProps {
  displayStatus: QuoteStatus;
  archived: boolean;
  snapshotFrozen: boolean;
  quoteStatus: QuoteStatus;
  showQuoteAccepted: boolean;
  acceptedAt: string | null;
  totals: InvoiceTotals;
  discountPercent: number | null;
  discountAmount: number | null;
  actions: React.ReactNode;
  className?: string;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

interface QuoteDetailDatesProps {
  issueDate: string;
  validityDate: string;
  className?: string;
}

export function QuoteDetailDates({
  issueDate,
  validityDate,
  className,
}: QuoteDetailDatesProps) {
  return (
    <Card className={className}>
      <CardHeader className="px-5 pb-2 pt-5 sm:px-6">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Dates
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 px-5 pb-5 sm:grid-cols-2 sm:px-6 sm:pb-6">
        <div className="flex gap-2 text-sm">
          <Calendar className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Émission</p>
            <p>{formatDate(issueDate)}</p>
          </div>
        </div>
        <div className="flex gap-2 text-sm">
          <Calendar className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Validité</p>
            <p>{formatDate(validityDate)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuoteDetailSidebar({
  displayStatus,
  archived,
  snapshotFrozen,
  quoteStatus,
  showQuoteAccepted,
  acceptedAt,
  totals,
  discountPercent,
  discountAmount,
  actions,
  className,
}: QuoteDetailSidebarProps) {
  return (
    <aside className={cn("space-y-4 md:sticky md:top-24 md:self-start", className)}>
      <div className={cn(surfaceCardClassName, "space-y-4 p-5 sm:p-6")}>
        <div className="flex flex-wrap items-center gap-2">
          <QuoteStatusBadge status={displayStatus} />
          {archived ? <InvoiceArchivedBadge /> : null}
        </div>
        {displayStatus === "expired" ? (
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
            Date de validité dépassée
          </p>
        ) : null}
        {snapshotFrozen ? (
          <p className="text-xs text-muted-foreground">
            {quoteStatus === "ready"
              ? "Contenu figé — prêt à envoyer"
              : "Données figées à la validation"}
          </p>
        ) : null}
        {showQuoteAccepted ? (
          <QuoteAcceptanceReceived acceptedAt={acceptedAt} className="w-full" />
        ) : null}

        <InvoiceTotalsSummary
          totals={totals}
          discountPercent={discountPercent}
          discountAmount={discountAmount}
        />
      </div>

      <div
        className={cn(
          surfaceCardClassName,
          "flex flex-col gap-2.5 p-4 sm:p-5",
          "[&_a]:w-full [&_button]:w-full [&_a]:justify-center [&_button]:justify-center",
        )}
      >
        {actions}
      </div>
    </aside>
  );
}
