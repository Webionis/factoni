"use client";

import { Package, Pencil, Trash2 } from "lucide-react";

import { CatalogItemNatureBadge } from "@/components/catalog/catalog-item-nature-badge";
import { Button } from "@/components/ui/button";
import type { CatalogItemRow } from "@/lib/data/catalog-items";
import { formatCurrency } from "@/lib/invoices/calculate";
import type { InvoiceLineItemNature } from "@/lib/invoices/item-nature";
import { mobileListCardClassName } from "@/lib/constants/ui";

interface CatalogItemCardProps {
  item: CatalogItemRow;
  onEdit: (item: CatalogItemRow) => void;
  onArchive: (itemId: string) => void;
  isPending?: boolean;
}

export function CatalogItemCard({
  item,
  onEdit,
  onArchive,
  isPending = false,
}: CatalogItemCardProps) {
  return (
    <article className={mobileListCardClassName}>
      <div className="flex items-start gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#2563eb]/10 text-[#2563eb] ring-1 ring-inset ring-[#2563eb]/10 sm:size-12 sm:rounded-2xl"
          aria-hidden
        >
          <Package className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <p className="truncate text-[15px] font-semibold tracking-tight sm:text-base">
              {item.label}
            </p>
            <CatalogItemNatureBadge
              nature={item.item_nature as InvoiceLineItemNature}
              short
            />
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground sm:text-sm">
            <span className="font-semibold tabular-nums text-[#0f172a] dark:text-[#f8fafc]">
              {formatCurrency(Number(item.unit_price_ht))}
            </span>
            {" HT · TVA "}
            {Number(item.vat_rate)} %
          </p>
        </div>
        <div className="flex shrink-0 gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-[#64748b] hover:text-[#2563eb]"
            aria-label={`Modifier ${item.label}`}
            onClick={() => onEdit(item)}
            disabled={isPending}
          >
            <Pencil className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-[#64748b] hover:text-destructive"
            aria-label={`Supprimer ${item.label}`}
            onClick={() => onArchive(item.id)}
            disabled={isPending}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  );
}
