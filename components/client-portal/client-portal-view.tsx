"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, FileText, Receipt } from "lucide-react";

import { PortalDocumentCard } from "@/components/client-portal/portal-document-card";
import { PortalEmptyState } from "@/components/client-portal/portal-empty-state";
import { PortalHero } from "@/components/client-portal/portal-hero";
import { Button, buttonVariants } from "@/components/ui/button";
import type { ClientPortalPayload } from "@/lib/client-portal/data";
import {
  isActionRequired,
  type PortalReceiptView,
} from "@/lib/client-portal/status";
import { formatCurrency } from "@/lib/invoices/calculate";
import {
  premiumBorderClassName,
  premiumShadowClassName,
  premiumShadowHoverClassName,
  transitionPremiumClassName,
} from "@/lib/constants/ui";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

type PortalTab = "action" | "quotes" | "invoices" | "receipts" | "all";

const TABS: { id: PortalTab; label: string }[] = [
  { id: "action", label: "À traiter" },
  { id: "quotes", label: "Devis" },
  { id: "invoices", label: "Factures" },
  { id: "receipts", label: "Reçus" },
  { id: "all", label: "Tous" },
];

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

function ReceiptCard({ receipt }: { receipt: PortalReceiptView }) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
        premiumBorderClassName,
        premiumShadowClassName,
        premiumShadowHoverClassName,
        transitionPremiumClassName,
      )}
    >
      <div className="min-w-0 space-y-1">
        <p className="font-medium leading-snug">{receipt.label}</p>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {formatDate(receipt.date)} · {formatCurrency(receipt.amount)}
        </p>
      </div>
      <a
        href={receipt.downloadUrl}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "h-10 w-full justify-center gap-1.5 sm:h-9 sm:w-auto",
        )}
        aria-label={`Télécharger ${receipt.label}`}
      >
        <Download className="size-3.5" aria-hidden />
        Télécharger
      </a>
    </article>
  );
}

interface ClientPortalViewProps {
  payload: ClientPortalPayload;
}

export function ClientPortalView({ payload }: ClientPortalViewProps) {
  const [tab, setTab] = useState<PortalTab>("action");

  const actionDocs = useMemo(
    () => payload.documents.filter(isActionRequired),
    [payload.documents],
  );
  const quoteDocs = useMemo(
    () => payload.documents.filter((d) => d.kind === "quote"),
    [payload.documents],
  );
  const invoiceDocs = useMemo(
    () => payload.documents.filter((d) => d.kind === "invoice"),
    [payload.documents],
  );

  const list =
    tab === "action"
      ? actionDocs
      : tab === "quotes"
        ? quoteDocs
        : tab === "invoices"
          ? invoiceDocs
          : tab === "receipts"
            ? []
            : payload.documents;

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#f8fafc] px-4 py-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] dark:bg-background sm:py-8 sm:pt-8">
      <div className="mx-auto w-full max-w-3xl space-y-5 sm:space-y-6">
        <header className="space-y-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {siteConfig.name}
          </p>
          {payload.companyLogoUrl ? (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={payload.companyLogoUrl}
                alt=""
                className="h-12 max-w-[180px] object-contain"
              />
            </div>
          ) : null}
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Espace client
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
              {payload.clientName}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Vos documents avec{" "}
              <span className="font-medium text-foreground">
                {payload.companyName}
              </span>
            </p>
          </div>
        </header>

        <PortalHero
          breakdown={payload.summary.breakdown}
          actionRequired={payload.summary.actionRequired}
        />

        <nav
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 sm:flex-wrap sm:overflow-visible"
          aria-label="Catégories de documents"
        >
          {TABS.map((item) => {
            const count =
              item.id === "action"
                ? payload.summary.actionRequired
                : item.id === "quotes"
                  ? payload.summary.quotes
                  : item.id === "invoices"
                    ? payload.summary.invoices
                    : item.id === "receipts"
                      ? payload.summary.receipts
                      : payload.summary.total;
            const isActive = tab === item.id;
            return (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={isActive ? "default" : "outline"}
                onClick={() => setTab(item.id)}
                className={cn(
                  "shrink-0 transition-[background-color,box-shadow] duration-200",
                  !isActive && "bg-background/80",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
                {count > 0 ? (
                  <span
                    className={cn(
                      "ml-1.5 rounded-full px-1.5 text-xs tabular-nums",
                      isActive
                        ? "bg-background/20"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </Button>
            );
          })}
        </nav>

        {tab === "receipts" ? (
          payload.receipts.length > 0 ? (
            <div className="space-y-3">
              {payload.receipts.map((receipt) => (
                <ReceiptCard key={receipt.id} receipt={receipt} />
              ))}
            </div>
          ) : (
            <PortalEmptyState
              icon={Receipt}
              title="Aucun reçu"
              description="Les reçus de paiement et d'acompte apparaîtront ici."
            />
          )
        ) : list.length > 0 ? (
          <div className="space-y-3">
            {list.map((doc) => (
              <PortalDocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        ) : tab === "action" ? (
          <PortalEmptyState
            icon={FileText}
            title="Tout est à jour"
            description="Vous n'avez aucun document en attente."
            variant="success"
          />
        ) : (
          <PortalEmptyState
            icon={FileText}
            title="Aucun document"
            description="Aucun document dans cette catégorie."
          />
        )}

        <p className="pt-2 text-center text-xs text-muted-foreground">
          Espace sécurisé via{" "}
          <Link
            href={siteConfig.productionUrl}
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            {siteConfig.name}
          </Link>
        </p>
      </div>
    </div>
  );
}
