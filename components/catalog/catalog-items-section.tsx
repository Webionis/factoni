"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { CatalogItemFormDialog } from "@/components/catalog/catalog-item-form-dialog";
import { CatalogItemsList } from "@/components/catalog/catalog-items-list";
import { PageHeader } from "@/components/layout/page-header";
import {
  archiveCatalogItemAction,
  createCatalogItemAction,
  updateCatalogItemAction,
} from "@/lib/actions/catalog-items";
import type { CatalogItemRow } from "@/lib/data/catalog-items";
import type { VatRegime } from "@/lib/constants/vat";
import type { CatalogItemFormValues } from "@/lib/validations/catalog-item";
import { Button } from "@/components/ui/button";

interface CatalogItemsSectionProps {
  initialItems: CatalogItemRow[];
  vatRegime: VatRegime;
  defaultVatRate: number;
}

export function CatalogItemsSection({
  initialItems,
  vatRegime,
  defaultVatRate,
}: CatalogItemsSectionProps) {
  const [items, setItems] = useState(initialItems);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItemRow | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  function openCreate() {
    setEditingItem(null);
    setServerError(null);
    setDialogOpen(true);
  }

  function openEdit(item: CatalogItemRow) {
    setEditingItem(item);
    setServerError(null);
    setDialogOpen(true);
  }

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setEditingItem(null);
      setServerError(null);
    }
  }

  function onSubmit(values: CatalogItemFormValues) {
    setServerError(null);
    const editingId = editingItem?.id ?? null;

    startTransition(async () => {
      const result = editingId
        ? await updateCatalogItemAction(editingId, values, vatRegime)
        : await createCatalogItemAction(values, vatRegime);

      if (result.error) {
        setServerError(result.error);
        return;
      }

      if (result.item) {
        setItems((current) => {
          const exists = current.some((item) => item.id === result.item!.id);
          if (exists) {
            return current.map((item) =>
              item.id === result.item!.id ? result.item! : item,
            );
          }
          return [...current, result.item!].sort((a, b) =>
            a.label.localeCompare(b.label, "fr"),
          );
        });
      } else if (editingId) {
        setItems((current) => current.filter((item) => item.id !== editingId));
      }

      handleDialogOpenChange(false);
    });
  }

  function handleArchive(itemId: string) {
    setServerError(null);
    startTransition(async () => {
      const result = await archiveCatalogItemAction(itemId);
      if (result.error) {
        setServerError(result.error);
        return;
      }
      setItems((current) => current.filter((item) => item.id !== itemId));
      if (editingItem?.id === itemId) {
        handleDialogOpenChange(false);
      }
    });
  }

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Catalogue prestations"
        description="Enregistrez vos prestations habituelles pour les réutiliser sur vos devis et factures."
        action={
          <Button
            type="button"
            className="h-11 gap-1.5"
            onClick={openCreate}
          >
            <Plus className="size-4" aria-hidden />
            <span className="hidden sm:inline">Nouvelle prestation</span>
            <span className="sm:hidden">Nouvelle</span>
          </Button>
        }
      />

      {serverError && !dialogOpen ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {serverError}
        </p>
      ) : null}

      <CatalogItemsList
        items={items}
        onEdit={openEdit}
        onArchive={handleArchive}
        isPending={isPending}
      />

      <CatalogItemFormDialog
        open={dialogOpen}
        editingItem={editingItem}
        vatRegime={vatRegime}
        defaultVatRate={defaultVatRate}
        isPending={isPending}
        serverError={serverError}
        onOpenChange={handleDialogOpenChange}
        onSubmit={onSubmit}
      />
    </div>
  );
}
