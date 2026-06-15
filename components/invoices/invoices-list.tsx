"use client";

import { useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";

import { InvoicesTable } from "@/components/invoices/invoices-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  listFilterGroupClassName,
  mobileSearchInputClassName,
} from "@/lib/constants/mobile";
import { selectClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";
import { isInvoiceDocument } from "@/lib/documents/types";
import type { InvoiceWithClient } from "@/lib/data/invoices";
import { isInvoiceArchived } from "@/lib/invoices/archive";
import { getEffectiveInvoiceStatus } from "@/lib/invoices/overdue";
import {
  INVOICE_STATUSES,
  INVOICE_STATUS_LABELS,
  invoiceDisplayNumber,
  toInvoiceStatus,
  type InvoiceStatus,
} from "@/lib/invoices/status";
import { clientNameFromInvoice, clientNameFromSnapshot } from "@/lib/data/invoices";

type StatusFilter = InvoiceStatus | "all";
type ArchiveFilter = "active" | "archived" | "all";

const ARCHIVE_FILTERS: { value: ArchiveFilter; label: string }[] = [
  { value: "active", label: "Actives" },
  { value: "archived", label: "Archivées" },
  { value: "all", label: "Toutes" },
];

function matchesSearch(invoice: InvoiceWithClient, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const haystack = [
    invoice.invoice_number,
    invoiceDisplayNumber(invoice.invoice_number, invoice.id),
    clientNameFromSnapshot(invoice.client_snapshot),
    clientNameFromInvoice(invoice),
    invoice.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

interface InvoicesListProps {
  invoices: InvoiceWithClient[];
}

export function InvoicesList({ invoices }: InvoicesListProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>("active");

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    for (const inv of invoices) {
      if (!isInvoiceDocument(inv.document_type)) continue;
      const archived = isInvoiceArchived(inv.archived_at);
      if (archiveFilter === "active" && archived) continue;
      if (archiveFilter === "archived" && !archived) continue;
      counts.all = (counts.all ?? 0) + 1;
      const displayStatus = getEffectiveInvoiceStatus(
        toInvoiceStatus(inv.status),
        inv.due_date,
      );
      counts[displayStatus] = (counts[displayStatus] ?? 0) + 1;
    }
    return counts;
  }, [invoices, archiveFilter]);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (!isInvoiceDocument(inv.document_type)) return false;

      const archived = isInvoiceArchived(inv.archived_at);
      if (archiveFilter === "active" && archived) return false;
      if (archiveFilter === "archived" && !archived) return false;

      if (statusFilter !== "all") {
        const displayStatus = getEffectiveInvoiceStatus(
          toInvoiceStatus(inv.status),
          inv.due_date,
        );
        if (displayStatus !== statusFilter) return false;
      }
      return matchesSearch(inv, query);
    });
  }, [invoices, query, statusFilter, archiveFilter]);

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Aucune facture pour le moment"
        description="Créez votre première facture en moins d'une minute."
        actionLabel="Nouvelle facture"
        actionHref="/invoices/new"
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
            aria-label="Rechercher une facture"
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
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {INVOICE_STATUS_LABELS[s]}
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
        <InvoicesTable invoices={filtered} />
      )}
    </div>
  );
}
