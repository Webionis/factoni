"use client";

import { useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";

import { InvoiceCard } from "@/components/invoices/invoice-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  filterPillActiveClassName,
  filterPillClassName,
  filterPillInactiveClassName,
} from "@/lib/constants/ui";
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

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tous statuts" },
  ...INVOICE_STATUSES.map((s) => ({
    value: s,
    label: INVOICE_STATUS_LABELS[s],
  })),
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
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="N°, client, notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 pl-10 shadow-sm"
          aria-label="Rechercher une facture"
        />
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {ARCHIVE_FILTERS.map(({ value, label }) => (
          <button
            key={`archive-${value}`}
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
            key={`status-${value}`}
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
          title="Aucun résultat"
          description="Modifiez la recherche ou les filtres."
          className="py-10"
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((invoice) => (
            <li key={invoice.id}>
              <InvoiceCard invoice={invoice} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
