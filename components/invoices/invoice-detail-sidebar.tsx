import { Calendar } from "lucide-react";

import { InvoiceArchivedBadge } from "@/components/invoices/invoice-archived-badge";
import { InvoicePaymentReceived } from "@/components/invoices/invoice-payment-received";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { InvoiceTotalsSummary } from "@/components/invoices/invoice-totals-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { surfaceCardClassName } from "@/lib/constants/ui";
import type { InvoiceTotals } from "@/lib/invoices/calculate";
import type { InvoiceStatus } from "@/lib/invoices/status";
import { cn } from "@/lib/utils";

interface InvoiceDetailSidebarProps {
  displayStatus: InvoiceStatus;
  archived: boolean;
  showOverdueHint: boolean;
  snapshotFrozen: boolean;
  isPaid: boolean;
  invoiceStatus: InvoiceStatus;
  showPaymentReceived: boolean;
  paidAt: string | null;
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

interface InvoiceDetailDatesProps {
  issueDate: string;
  dueDate: string;
  className?: string;
}

export function InvoiceDetailDates({
  issueDate,
  dueDate,
  className,
}: InvoiceDetailDatesProps) {
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
            <p className="text-xs text-muted-foreground">Échéance</p>
            <p>{formatDate(dueDate)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InvoiceDetailSidebar({
  displayStatus,
  archived,
  showOverdueHint,
  snapshotFrozen,
  isPaid,
  invoiceStatus,
  showPaymentReceived,
  paidAt,
  totals,
  discountPercent,
  discountAmount,
  actions,
  className,
}: InvoiceDetailSidebarProps) {
  return (
    <aside className={cn("space-y-4 md:sticky md:top-24 md:self-start", className)}>
      <div className={cn(surfaceCardClassName, "space-y-4 p-5 sm:p-6")}>
        <div className="flex flex-wrap items-center gap-2">
          <InvoiceStatusBadge status={displayStatus} />
          {archived ? <InvoiceArchivedBadge /> : null}
        </div>
        {showOverdueHint ? (
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
            Échéance dépassée
          </p>
        ) : null}
        {snapshotFrozen && !isPaid ? (
          <p className="text-xs text-muted-foreground">
            {invoiceStatus === "ready"
              ? "Contenu figé — prête à envoyer"
              : "Données figées à la validation"}
          </p>
        ) : null}
        {showPaymentReceived ? (
          <InvoicePaymentReceived paidAt={paidAt} className="w-full" />
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
