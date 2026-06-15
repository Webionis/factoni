"use client";

import { useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";

import { QuotesTable } from "@/components/quotes/quotes-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  listFilterGroupClassName,
  mobileSearchInputClassName,
} from "@/lib/constants/mobile";
import { selectClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";
import { isQuoteDocument } from "@/lib/documents/types";
import type { QuoteWithClient } from "@/lib/data/quotes";
import {
  clientNameFromInvoice,
  clientNameFromSnapshot,
} from "@/lib/data/invoices";
import { isInvoiceArchived } from "@/lib/invoices/archive";
import { getEffectiveQuoteStatus } from "@/lib/quotes/expiry";
import {
  QUOTE_STATUSES,
  QUOTE_STATUS_LABELS,
  quoteDisplayNumber,
  type QuoteStatus,
} from "@/lib/quotes/status";

type StatusFilter = QuoteStatus | "all";
type ArchiveFilter = "active" | "archived" | "all";

const ARCHIVE_FILTERS: { value: ArchiveFilter; label: string }[] = [
  { value: "active", label: "Actifs" },
  { value: "archived", label: "Archivés" },
  { value: "all", label: "Tous" },
];

function matchesSearch(quote: QuoteWithClient, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const haystack = [
    quote.invoice_number,
    quoteDisplayNumber(quote.invoice_number, quote.id),
    clientNameFromSnapshot(quote.client_snapshot),
    clientNameFromInvoice(quote),
    quote.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

interface QuotesListProps {
  quotes: QuoteWithClient[];
}

export function QuotesList({ quotes }: QuotesListProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>("active");

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    for (const quote of quotes) {
      if (!isQuoteDocument(quote.document_type)) continue;
      const archived = isInvoiceArchived(quote.archived_at);
      if (archiveFilter === "active" && archived) continue;
      if (archiveFilter === "archived" && !archived) continue;
      counts.all = (counts.all ?? 0) + 1;
      const displayStatus = getEffectiveQuoteStatus(
        quote.status as QuoteStatus,
        quote.due_date,
      );
      counts[displayStatus] = (counts[displayStatus] ?? 0) + 1;
    }
    return counts;
  }, [quotes, archiveFilter]);

  const filtered = useMemo(() => {
    return quotes.filter((q) => {
      if (!isQuoteDocument(q.document_type)) return false;

      const archived = isInvoiceArchived(q.archived_at);
      if (archiveFilter === "active" && archived) return false;
      if (archiveFilter === "archived" && !archived) return false;

      if (statusFilter !== "all") {
        const displayStatus = getEffectiveQuoteStatus(
          q.status as QuoteStatus,
          q.due_date,
        );
        if (displayStatus !== statusFilter) return false;
      }

      return matchesSearch(q, query);
    });
  }, [quotes, query, statusFilter, archiveFilter]);

  if (quotes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Aucun devis"
        description="Créez votre premier devis pour vos clients."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="N°, client, notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={mobileSearchInputClassName}
            aria-label="Rechercher un devis"
          />
        </div>

        <div className={listFilterGroupClassName}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className={cn(selectClassName, "h-11 w-full min-w-[10rem] sm:w-auto")}
            aria-label="Filtrer par statut"
          >
            <option value="all">
              Tous statuts{statusCounts.all ? ` (${statusCounts.all})` : ""}
            </option>
            {QUOTE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {QUOTE_STATUS_LABELS[s]}
                {statusCounts[s] ? ` (${statusCounts[s]})` : ""}
              </option>
            ))}
          </select>

          <select
            value={archiveFilter}
            onChange={(e) => setArchiveFilter(e.target.value as ArchiveFilter)}
            className={cn(selectClassName, "h-11 w-full min-w-[8rem] sm:w-auto")}
            aria-label="Filtrer par archivage"
          >
            {ARCHIVE_FILTERS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun résultat"
          description="Modifiez la recherche ou les filtres."
          className="py-10"
        />
      ) : (
        <QuotesTable quotes={filtered} />
      )}
    </div>
  );
}
