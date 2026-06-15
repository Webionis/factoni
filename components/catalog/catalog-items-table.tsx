"use client";

import { Pencil, Trash2 } from "lucide-react";

import { CatalogItemNatureBadge } from "@/components/catalog/catalog-item-nature-badge";
import { Button } from "@/components/ui/button";
import type { CatalogItemRow } from "@/lib/data/catalog-items";
import { formatCurrency } from "@/lib/invoices/calculate";
import type { InvoiceLineItemNature } from "@/lib/invoices/item-nature";
import {
  dataTableElementClassName,
  dataTableHeadClassName,
  dataTableRowClassName,
  dataTableScrollWrapperClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface CatalogItemsTableProps {
  items: CatalogItemRow[];
  onEdit: (item: CatalogItemRow) => void;
  onArchive: (itemId: string) => void;
  isPending?: boolean;
}

export function CatalogItemsTable({
  items,
  onEdit,
  onArchive,
  isPending = false,
}: CatalogItemsTableProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={dataTableScrollWrapperClassName}>
      <table className={cn(dataTableElementClassName, "md:min-w-[32rem]")}>
        <thead>
          <tr>
            <th className={cn(dataTableHeadClassName, "px-5 py-3")}>
              Prestation
            </th>
            <th className={cn(dataTableHeadClassName, "px-4 py-3 text-right")}>
              Prix HT
            </th>
            <th className={cn(dataTableHeadClassName, "hidden px-4 py-3 md:table-cell")}>
              TVA
            </th>
            <th className={cn(dataTableHeadClassName, "px-4 py-3")}>Nature</th>
            <th className={cn(dataTableHeadClassName, "w-24 px-3 py-3")}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className={dataTableRowClassName}>
              <td className="max-w-[280px] px-5 py-3.5">
                <span className="font-semibold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
                  {item.label}
                </span>
              </td>
              <td className="px-4 py-3.5 text-right font-semibold tabular-nums tracking-tight">
                {formatCurrency(Number(item.unit_price_ht))}
              </td>
              <td className="hidden px-4 py-3.5 tabular-nums text-[#64748b] dark:text-[#94a3b8] md:table-cell">
                {Number(item.vat_rate)} %
              </td>
              <td className="px-4 py-3.5">
                <CatalogItemNatureBadge
                  nature={item.item_nature as InvoiceLineItemNature}
                  short
                />
              </td>
              <td className="px-3 py-3.5">
                <div className="flex items-center justify-end gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-[#64748b] hover:text-[#2563eb] dark:hover:text-[#93c5fd]"
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
