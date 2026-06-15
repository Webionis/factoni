"use client";

import { useMemo, useState } from "react";
import { Package, Search } from "lucide-react";

import { CatalogItemsTable } from "@/components/catalog/catalog-items-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import type { CatalogItemRow } from "@/lib/data/catalog-items";
import {
  INVOICE_LINE_ITEM_NATURE_OPTIONS,
  type InvoiceLineItemNature,
} from "@/lib/invoices/item-nature";
import {
  listFilterGroupClassName,
  mobileSearchInputClassName,
} from "@/lib/constants/mobile";
import { selectClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

type NatureFilter = InvoiceLineItemNature | "all";

const NATURE_FILTERS: { value: NatureFilter; label: string }[] = [
  { value: "all", label: "Toutes" },
  ...INVOICE_LINE_ITEM_NATURE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  })),
];

function matchesQuery(item: CatalogItemRow, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  return item.label.toLowerCase().includes(q);
}

interface CatalogItemsListProps {
  items: CatalogItemRow[];
  onEdit: (item: CatalogItemRow) => void;
  onArchive: (itemId: string) => void;
  isPending?: boolean;
}

export function CatalogItemsList({
  items,
  onEdit,
  onArchive,
  isPending = false,
}: CatalogItemsListProps) {
  const [query, setQuery] = useState("");
  const [natureFilter, setNatureFilter] = useState<NatureFilter>("all");

  const natureCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    for (const item of items) {
      counts[item.item_nature] = (counts[item.item_nature] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (natureFilter !== "all" && item.item_nature !== natureFilter) {
        return false;
      }
      return matchesQuery(item, query);
    });
  }, [items, query, natureFilter]);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Aucune prestation"
        description="Ajoutez vos tarifs habituels pour gagner du temps sur vos prochains devis et factures."
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
            placeholder="Nom de prestation…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={mobileSearchInputClassName}
            aria-label="Rechercher une prestation"
          />
        </div>

        <div className={listFilterGroupClassName}>
          <select
            value={natureFilter}
            onChange={(e) => setNatureFilter(e.target.value as NatureFilter)}
            className={cn(selectClassName, "h-11 w-full min-w-[12rem] sm:w-auto")}
            aria-label="Filtrer par nature"
          >
            {NATURE_FILTERS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
                {natureCounts[value] ? ` (${natureCounts[value]})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucun résultat"
          description="Modifiez la recherche ou le filtre de nature."
          className="py-10"
        />
      ) : (
        <CatalogItemsTable
          items={filtered}
          onEdit={onEdit}
          onArchive={onArchive}
          isPending={isPending}
        />
      )}
    </div>
  );
}
