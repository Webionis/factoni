"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  type Control,
  type FieldArrayWithId,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  useWatch,
} from "react-hook-form";

import { InvoiceTotalsSummary } from "@/components/invoices/invoice-totals-summary";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { NumericFormInput } from "@/components/ui/numeric-form-input";
import { Input } from "@/components/ui/input";
import { FRENCH_VAT_RATES } from "@/lib/constants/vat";
import type { VatRegime } from "@/lib/constants/vat";
import { calculateLinesAndTotals } from "@/lib/invoices/calculate";
import { parseInvoiceDiscounts, type InvoiceFormValues } from "@/lib/validations/invoice";
import { selectClassName, surfaceCardClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const emptyLine = {
  description: "",
  quantity: 1,
  unit_price_ht: 0,
  vat_rate: 20,
};

interface InvoiceLinesEditorProps {
  control: Control<InvoiceFormValues>;
  fields: FieldArrayWithId<InvoiceFormValues, "lines", "id">[];
  append: UseFieldArrayAppend<InvoiceFormValues, "lines">;
  remove: UseFieldArrayRemove;
  register: ReturnType<
    typeof import("react-hook-form").useForm<InvoiceFormValues>
  >["register"];
  errors: import("react-hook-form").FieldErrors<InvoiceFormValues>;
  vatRegime: VatRegime;
}

export function InvoiceLinesEditor({
  control,
  fields,
  append,
  remove,
  register,
  errors,
  vatRegime,
}: InvoiceLinesEditorProps) {
  const watchedLines = useWatch({ control, name: "lines" });
  const watchedDiscountPercent = useWatch({ control, name: "discount_percent" });
  const watchedDiscountAmount = useWatch({ control, name: "discount_amount" });

  const linesForCalc = (watchedLines ?? []).map((l) => ({
    quantity: Number(l?.quantity) || 0,
    unit_price_ht: Number(l?.unit_price_ht) || 0,
    vat_rate: Number(l?.vat_rate) || 0,
  }));

  const fakeForm: InvoiceFormValues = {
    client_id: "",
    issue_date: "",
    due_date: "",
    lines: linesForCalc.map((l) => ({
      description: "",
      quantity: l.quantity,
      unit_price_ht: l.unit_price_ht,
      vat_rate: l.vat_rate,
    })),
    discount_percent:
      watchedDiscountPercent != null && !Number.isNaN(Number(watchedDiscountPercent))
        ? Number(watchedDiscountPercent)
        : undefined,
    discount_amount:
      watchedDiscountAmount != null && !Number.isNaN(Number(watchedDiscountAmount))
        ? Number(watchedDiscountAmount)
        : undefined,
  };

  const discounts = parseInvoiceDiscounts(fakeForm);
  const { totals } = calculateLinesAndTotals(
    linesForCalc.filter((l) => l.quantity > 0),
    vatRegime,
    discounts,
  );

  const lineErrors = errors.lines;

  function addLine() {
    append({
      ...emptyLine,
      vat_rate: vatRegime === "franchise" ? 0 : 20,
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Prestations</h2>

      {typeof lineErrors === "object" && !Array.isArray(lineErrors) && lineErrors?.message ? (
        <p className="text-sm text-destructive">{lineErrors.message}</p>
      ) : null}

      <ul className="space-y-4">
        {fields.map((field, index) => {
          const lineErr = Array.isArray(lineErrors) ? lineErrors[index] : undefined;
          return (
            <li
              key={field.id}
              className={cn(surfaceCardClassName, "space-y-3 p-4 sm:p-5")}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Ligne {index + 1}
                </span>
                {fields.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Supprimer la ligne"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                ) : null}
              </div>
              <FormField
                label="Description"
                htmlFor={`lines.${index}.description`}
                error={lineErr?.description?.message}
              >
                <Input
                  id={`lines.${index}.description`}
                  placeholder="Ex. Pose carrelage"
                  {...register(`lines.${index}.description`)}
                />
              </FormField>
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  label="Qté"
                  htmlFor={`lines.${index}.quantity`}
                  error={lineErr?.quantity?.message}
                >
                  <NumericFormInput
                    control={control}
                    name={`lines.${index}.quantity`}
                    id={`lines.${index}.quantity`}
                    className="h-11"
                    clearOnFocusValue={1}
                    emptyValue={1}
                    placeholder="1"
                  />
                </FormField>
                <FormField
                  label="PU HT"
                  htmlFor={`lines.${index}.unit_price_ht`}
                  error={lineErr?.unit_price_ht?.message}
                >
                  <NumericFormInput
                    control={control}
                    name={`lines.${index}.unit_price_ht`}
                    id={`lines.${index}.unit_price_ht`}
                    className="h-11"
                    placeholder="0"
                  />
                </FormField>
                <FormField
                  label="TVA %"
                  htmlFor={`lines.${index}.vat_rate`}
                  error={lineErr?.vat_rate?.message}
                >
                  <select
                    id={`lines.${index}.vat_rate`}
                    className={cn(selectClassName, "px-1")}
                    disabled={vatRegime === "franchise"}
                    {...register(`lines.${index}.vat_rate`, {
                      valueAsNumber: true,
                    })}
                  >
                    {FRENCH_VAT_RATES.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </li>
          );
        })}
      </ul>

      <div
        className="my-6 flex items-center gap-3"
        role="separator"
        aria-label="Fin des prestations"
      >
        <div className="h-px flex-1 bg-border/70" aria-hidden />
        <Button
          type="button"
          variant="outline"
          size="default"
          className="h-11 shrink-0 gap-2 px-4 sm:min-w-[220px]"
          onClick={addLine}
        >
          <Plus className="size-4" aria-hidden />
          Ajouter une prestation
        </Button>
        <div className="h-px flex-1 bg-border/70" aria-hidden />
      </div>

      <InvoiceTotalsSummary
        totals={totals}
        discountPercent={discounts.discount_percent}
        discountAmount={discounts.discount_amount}
      />
    </div>
  );
}
