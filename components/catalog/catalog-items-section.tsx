"use client";

import { useEffect, useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  archiveCatalogItemAction,
  createCatalogItemAction,
  updateCatalogItemAction,
} from "@/lib/actions/catalog-items";
import type { CatalogItemRow } from "@/lib/data/catalog-items";
import { formatCurrency } from "@/lib/invoices/calculate";
import {
  getInvoiceLineItemNatureOption,
  INVOICE_LINE_ITEM_NATURE_OPTIONS,
  isDisbursementLine,
  type InvoiceLineItemNature,
} from "@/lib/invoices/item-nature";
import type { VatRegime } from "@/lib/constants/vat";
import { FRENCH_VAT_RATES } from "@/lib/constants/vat";
import {
  catalogItemFormSchema,
  defaultCatalogItemFormValues,
  type CatalogItemFormValues,
} from "@/lib/validations/catalog-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NumericFormInput } from "@/components/ui/numeric-form-input";
import { selectClassName, surfaceCardClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface CatalogItemsSectionProps {
  initialItems: CatalogItemRow[];
  vatRegime: VatRegime;
  defaultVatRate: number;
}

function itemToForm(item: CatalogItemRow): CatalogItemFormValues {
  return {
    label: item.label,
    unit_price_ht: Number(item.unit_price_ht),
    vat_rate: Number(item.vat_rate),
    item_nature: item.item_nature,
  };
}

export function CatalogItemsSection({
  initialItems,
  vatRegime,
  defaultVatRate,
}: CatalogItemsSectionProps) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CatalogItemFormValues>({
    resolver: zodResolver(catalogItemFormSchema),
    defaultValues: defaultCatalogItemFormValues(
      vatRegime === "franchise" ? 0 : defaultVatRate,
    ),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = form;

  const watchedNature = watch("item_nature");
  const isDisbursement = isDisbursementLine(watchedNature);
  const vatDisabled = vatRegime === "franchise" || isDisbursement;

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    if (isDisbursement && vatRegime !== "franchise") {
      setValue("vat_rate", 0);
    }
  }, [isDisbursement, setValue, vatRegime]);

  function resetEditor() {
    reset(
      defaultCatalogItemFormValues(vatRegime === "franchise" ? 0 : defaultVatRate),
    );
    setEditingId(null);
    setShowCreate(false);
    setServerError(null);
  }

  function startCreate() {
    reset(
      defaultCatalogItemFormValues(vatRegime === "franchise" ? 0 : defaultVatRate),
    );
    setEditingId(null);
    setShowCreate(true);
    setServerError(null);
  }

  function startEdit(item: CatalogItemRow) {
    reset(itemToForm(item));
    setEditingId(item.id);
    setShowCreate(false);
    setServerError(null);
  }

  function onSubmit(values: CatalogItemFormValues) {
    setServerError(null);
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

      resetEditor();
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
      if (editingId === itemId) {
        resetEditor();
      }
    });
  }

  const showForm = showCreate || editingId !== null;

  return (
    <div className="space-y-6">
      <Card className={surfaceCardClassName}>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-lg">Vos prestations</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Réutilisez-les en un clic lors de la création d&apos;un devis ou
              d&apos;une facture.
            </p>
          </div>
          {!showForm ? (
            <Button type="button" size="sm" className="shrink-0 gap-1.5" onClick={startCreate}>
              <Plus className="size-4" aria-hidden />
              Ajouter
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4 pb-5 sm:pb-6">
          {serverError ? (
            <p className="text-sm text-destructive">{serverError}</p>
          ) : null}

          {showForm ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={cn(surfaceCardClassName, "space-y-4 border p-4 sm:p-5")}
            >
              <h3 className="text-sm font-semibold">
                {editingId ? "Modifier la prestation" : "Nouvelle prestation"}
              </h3>
              <FormField
                label="Nom"
                htmlFor="catalog-label"
                error={errors.label?.message}
              >
                <Input
                  id="catalog-label"
                  placeholder="Ex. Pose carrelage"
                  {...register("label")}
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  label="Prix unitaire HT"
                  htmlFor="catalog-unit-price"
                  error={errors.unit_price_ht?.message}
                >
                  <NumericFormInput
                    control={control}
                    name="unit_price_ht"
                    id="catalog-unit-price"
                    placeholder="0"
                  />
                </FormField>
                <FormField
                  label="TVA %"
                  htmlFor="catalog-vat-rate"
                  error={errors.vat_rate?.message}
                  hint={
                    isDisbursement
                      ? "TVA non applicable sur les débours"
                      : undefined
                  }
                >
                  <select
                    id="catalog-vat-rate"
                    className={cn(
                      selectClassName,
                      vatDisabled && "cursor-not-allowed opacity-60",
                    )}
                    disabled={vatDisabled}
                    {...register("vat_rate", { valueAsNumber: true })}
                  >
                    {FRENCH_VAT_RATES.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField
                  label="Nature"
                  htmlFor="catalog-item-nature"
                  error={errors.item_nature?.message}
                >
                  <select
                    id="catalog-item-nature"
                    className={selectClassName}
                    {...register("item_nature")}
                    onChange={(event) => {
                      const nature = event.target.value as InvoiceLineItemNature;
                      setValue("item_nature", nature, { shouldDirty: true });
                      if (isDisbursementLine(nature) && vatRegime !== "franchise") {
                        setValue("vat_rate", 0);
                      }
                    }}
                  >
                    {INVOICE_LINE_ITEM_NATURE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? "Enregistrement…"
                    : editingId
                      ? "Mettre à jour"
                      : "Enregistrer"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetEditor}
                  disabled={isPending}
                >
                  Annuler
                </Button>
              </div>
            </form>
          ) : null}

          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Aucune prestation enregistrée. Ajoutez vos tarifs habituels pour
              gagner du temps sur vos prochains documents.
            </p>
          ) : (
            <ul className="divide-y rounded-xl border">
              {items.map((item) => {
                const nature = getInvoiceLineItemNatureOption(item.item_nature);
                return (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{item.label}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {formatCurrency(Number(item.unit_price_ht))} HT · TVA{" "}
                        {Number(item.vat_rate)} % · {nature.label}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Modifier ${item.label}`}
                        onClick={() => startEdit(item)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Supprimer ${item.label}`}
                        onClick={() => handleArchive(item.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
