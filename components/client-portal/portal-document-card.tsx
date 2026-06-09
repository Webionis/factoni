import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";

import { PortalStatusBadge } from "@/components/client-portal/portal-status-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  getPrimaryPortalAction,
  getSecondaryPortalActions,
  portalActionLabel,
  portalDocumentHref,
  type PortalDocumentView,
} from "@/lib/client-portal/status";
import { formatCurrency } from "@/lib/invoices/calculate";
import {
  premiumBorderClassName,
  premiumShadowClassName,
  premiumShadowHoverClassName,
  transitionPremiumClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

interface PortalDocumentCardProps {
  doc: PortalDocumentView;
}

export function PortalDocumentCard({ doc }: PortalDocumentCardProps) {
  const primary = getPrimaryPortalAction(doc);
  const secondaries = getSecondaryPortalActions(doc, primary);
  const primaryHref = portalDocumentHref(doc, primary);
  const isDownloadPrimary = primaryHref.startsWith("/api/");

  const metaParts: string[] = [
    doc.kind === "quote" ? "Devis" : "Facture",
    `Émis le ${formatShortDate(doc.issueDate)}`,
  ];

  if (doc.kind === "invoice") {
    metaParts.push(`Échéance ${formatShortDate(doc.dueDate)}`);
  } else {
    metaParts.push(`Validité ${formatShortDate(doc.dueDate)}`);
  }

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-card",
        premiumBorderClassName,
        premiumShadowClassName,
        premiumShadowHoverClassName,
        transitionPremiumClassName,
      )}
    >
      <div className="space-y-3 p-4 sm:space-y-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 font-mono text-sm font-semibold tracking-tight sm:text-[15px]">
            {doc.number}
          </p>
          <PortalStatusBadge
            status={doc.clientStatus}
            label={doc.clientStatusLabel}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {metaParts.join(" · ")}
          </p>
          <p className="text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">
            {formatCurrency(doc.totalTtc)}
            <span className="ml-1.5 text-sm font-medium text-muted-foreground">
              TTC
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {isDownloadPrimary ? (
            <a
              href={primaryHref}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "h-11 w-full justify-center gap-1.5 sm:h-9 sm:w-auto",
              )}
            >
              {portalActionLabel(primary)}
            </a>
          ) : (
            <Link
              href={primaryHref}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "h-11 w-full justify-center gap-1.5 sm:h-9 sm:w-auto",
              )}
            >
              {primary === "view" ? (
                <ExternalLink className="size-3.5" aria-hidden />
              ) : null}
              {portalActionLabel(primary)}
            </Link>
          )}

          {secondaries.length > 0 ? (
            <div className="flex gap-2">
              {secondaries.map((action) => {
                const href = portalDocumentHref(doc, action);
                const isDownload = href.startsWith("/api/");
                const label = portalActionLabel(action);
                const className = cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-11 flex-1 justify-center gap-1.5 sm:h-9 sm:flex-none",
                );

                if (isDownload) {
                  return (
                    <a
                      key={action}
                      href={href}
                      className={className}
                      aria-label={`Télécharger le PDF — ${doc.number}`}
                    >
                      <Download className="size-3.5" aria-hidden />
                      {label}
                    </a>
                  );
                }

                return (
                  <Link key={action} href={href} className={className}>
                    {action === "view" ? (
                      <ExternalLink className="size-3.5" aria-hidden />
                    ) : (
                      <Download className="size-3.5" aria-hidden />
                    )}
                    {label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
