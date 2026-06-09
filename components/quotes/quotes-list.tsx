"use client";

import { useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";

import { QuoteCard } from "@/components/quotes/quote-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  filterPillActiveClassName,
  filterPillClassName,
  filterPillInactiveClassName,
} from "@/lib/constants/ui";
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

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tous statuts" },
  ...QUOTE_STATUSES.map((s) => ({
    value: s,
    label: QUOTE_STATUS_LABELS[s],
  })),
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

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Rechercher un devis, client…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 pl-10"
          aria-label="Rechercher"
        />
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {ARCHIVE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setArchiveFilter(value)}
            className={cn(
              filterPillClassName,
              archiveFilter === value
                ? filterPillActiveClassName
                : filterPillInactiveClassName,
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={cn(
              filterPillClassName,
              statusFilter === value
                ? filterPillActiveClassName
                : filterPillInactiveClassName,
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun devis"
          description={
            query || statusFilter !== "all" || archiveFilter !== "active"
              ? "Aucun résultat pour ces filtres."
              : "Créez votre premier devis pour vos clients."
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((quote) => (
            <li key={quote.id}>
              <QuoteCard quote={quote} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
