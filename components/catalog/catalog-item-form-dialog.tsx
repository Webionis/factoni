"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NumericFormInput } from "@/components/ui/numeric-form-input";
import type { CatalogItemRow } from "@/lib/data/catalog-items";
import { FRENCH_VAT_RATES, type VatRegime } from "@/lib/constants/vat";
import {
  INVOICE_LINE_ITEM_NATURE_OPTIONS,
  isDisbursementLine,
  type InvoiceLineItemNature,
} from "@/lib/invoices/item-nature";
import {
  catalogItemFormSchema,
  defaultCatalogItemFormValues,
  type CatalogItemFormValues,
} from "@/lib/validations/catalog-item";
import { inputClassName, selectClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

function itemToForm(item: CatalogItemRow): CatalogItemFormValues {
  return {
    label: item.label,
    unit_price_ht: Number(item.unit_price_ht),
    vat_rate: Number(item.vat_rate),
    item_nature: item.item_nature,
  };
}

interface CatalogItemFormDialogProps {
  open: boolean;
  editingItem: CatalogItemRow | null;
  vatRegime: VatRegime;
  defaultVatRate: number;
  isPending: boolean;
  serverError: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CatalogItemFormValues) => void;
}

export function CatalogItemFormDialog({
  open,
  editingItem,
  vatRegime,
  defaultVatRate,
  isPending,
  serverError,
  onOpenChange,
  onSubmit,
}: CatalogItemFormDialogProps) {
  const defaultRate = vatRegime === "franchise" ? 0 : defaultVatRate;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CatalogItemFormValues>({
    resolver: zodResolver(catalogItemFormSchema),
    defaultValues: defaultCatalogItemFormValues(defaultRate),
  });

  const watchedNature = watch("item_nature");
  const isDisbursement = isDisbursementLine(watchedNature);
  const vatDisabled = vatRegime === "franchise" || isDisbursement;

  useEffect(() => {
    if (!open) return;
    reset(
      editingItem
        ? itemToForm(editingItem)
        : defaultCatalogItemFormValues(defaultRate),
    );
  }, [open, editingItem, reset, defaultRate]);

  useEffect(() => {
    if (isDisbursement && vatRegime !== "franchise") {
      setValue("vat_rate", 0);
    }
  }, [isDisbursement, setValue, vatRegime]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Modifier la prestation" : "Nouvelle prestation"}
          </DialogTitle>
          <DialogDescription>
            Cette prestation sera réutilisable sur vos devis et factures.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          id="catalog-item-form"
        >
          {serverError ? (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {serverError}
            </p>
          ) : null}

          <FormField
            label="Nom"
            htmlFor="catalog-label"
            error={errors.label?.message}
          >
            <Input
              id="catalog-label"
              className={inputClassName}
              placeholder="Ex. Pose carrelage"
              aria-invalid={!!errors.label}
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
                    {rate} %
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
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form="catalog-item-form"
            className="h-11"
            disabled={isPending}
          >
            {isPending
              ? "Enregistrement…"
              : editingItem
                ? "Mettre à jour"
                : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
