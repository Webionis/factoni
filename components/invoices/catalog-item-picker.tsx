"use client";

import { useEffect, useMemo, useState } from "react";
import { BookMarked, Search } from "lucide-react";
import Link from "next/link";

import { MobileBottomSheet } from "@/components/layout/mobile-bottom-sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CatalogItemRow } from "@/lib/data/catalog-items";
import { formatCurrency } from "@/lib/invoices/calculate";
import { getInvoiceLineItemNatureOption } from "@/lib/invoices/item-nature";
import type { InvoiceLineFormValues } from "@/lib/validations/invoice";
import { useIsMdDesktop } from "@/lib/hooks/use-is-md-desktop";
import { cn } from "@/lib/utils";

function catalogItemToLine(item: CatalogItemRow): InvoiceLineFormValues {
  return {
    description: item.label,
    quantity: 1,
    unit_price_ht: Number(item.unit_price_ht),
    vat_rate: Number(item.vat_rate),
    item_nature: item.item_nature,
  };
}

function CatalogItemList({
  items,
  query,
  onSelect,
}: {
  items: CatalogItemRow[];
  query: string;
  onSelect: (item: CatalogItemRow) => void;
}) {
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(normalized),
    );
  }, [items, query]);

  if (items.length === 0) {
    return (
      <div className="space-y-4 px-1 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Aucune prestation enregistrée pour le moment.
        </p>
        <Link
          href="/settings/catalog"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Gérer le catalogue
        </Link>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-muted-foreground">
        Aucun résultat pour cette recherche.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {filtered.map((item) => {
        const nature = getInvoiceLineItemNatureOption(item.item_nature);
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "flex w-full items-start justify-between gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                "hover:bg-muted/70",
              )}
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {formatCurrency(Number(item.unit_price_ht))} HT · TVA{" "}
                  {Number(item.vat_rate)} % · {nature.label}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

interface CatalogItemPickerProps {
  items: CatalogItemRow[];
  onSelect: (line: InvoiceLineFormValues) => void;
}

export function CatalogItemPicker({ items, onSelect }: CatalogItemPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const isDesktop = useIsMdDesktop();

  function handleSelect(item: CatalogItemRow) {
    onSelect(catalogItemToLine(item));
    setOpen(false);
    setQuery("");
  }

  const pickerBody = (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher une prestation…"
          className="pl-9"
          autoFocus={isDesktop}
        />
      </div>
      <CatalogItemList items={items} query={query} onSelect={handleSelect} />
      {items.length > 0 ? (
        <p className="text-center text-xs text-muted-foreground">
          <Link
            href="/settings/catalog"
            className="underline underline-offset-2 hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            Gérer le catalogue
          </Link>
        </p>
      ) : null}
    </div>
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="default"
        className="h-11 shrink-0 gap-2 px-4"
        onClick={() => setOpen(true)}
      >
        <BookMarked className="size-4" aria-hidden />
        Depuis le catalogue
      </Button>

      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg gap-0 p-0">
            <DialogHeader className="border-b border-border/50 px-5 py-4">
              <DialogTitle>Choisir une prestation</DialogTitle>
            </DialogHeader>
            <div className="max-h-[min(60vh,28rem)] overflow-y-auto px-5 py-4">
              {pickerBody}
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <MobileBottomSheet
          open={open}
          onClose={() => setOpen(false)}
          title="Choisir une prestation"
        >
          {pickerBody}
        </MobileBottomSheet>
      )}
    </>
  );
}
