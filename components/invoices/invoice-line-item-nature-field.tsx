"use client";

import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { MobileBottomSheet } from "@/components/layout/mobile-bottom-sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import {
  getInvoiceLineItemNatureOption,
  INVOICE_LINE_ITEM_NATURE_OPTIONS,
  type InvoiceLineItemNature,
} from "@/lib/invoices/item-nature";
import type { InvoiceFormValues } from "@/lib/validations/invoice";
import { useIsMdDesktop } from "@/lib/hooks/use-is-md-desktop";
import { cn } from "@/lib/utils";

interface InvoiceLineItemNatureFieldProps {
  index: number;
  vatRegime: "standard" | "franchise";
  error?: string;
}


function NatureOptionsList({
  currentNature,
  onSelect,
}: {
  currentNature: InvoiceLineItemNature;
  onSelect: (nature: InvoiceLineItemNature) => void;
}) {
  return (
    <ul className="space-y-1">
      {INVOICE_LINE_ITEM_NATURE_OPTIONS.map((option) => {
        const selected = option.value === currentNature;
        return (
          <li key={option.value}>
            <button
              type="button"
              onClick={() => onSelect(option.value)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                selected
                  ? "bg-[rgba(37,99,235,0.08)] dark:bg-[rgba(59,130,246,0.14)]"
                  : "hover:bg-muted/70",
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                  {option.label}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {option.description}
                </span>
              </span>
              {selected ? (
                <Check className="mt-0.5 size-4 shrink-0 text-[#2563eb]" aria-hidden />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function InvoiceLineItemNatureField({
  index,
  vatRegime,
  error,
}: InvoiceLineItemNatureFieldProps) {
  const { register, setValue, watch } = useFormContext<InvoiceFormValues>();
  const isDesktop = useIsMdDesktop();
  const [pickerOpen, setPickerOpen] = useState(false);
  const currentNature = watch(`lines.${index}.item_nature`) ?? "service";
  const currentOption = getInvoiceLineItemNatureOption(currentNature);

  function selectNature(nature: InvoiceLineItemNature) {
    setValue(`lines.${index}.item_nature`, nature, { shouldDirty: true });
    if (nature === "disbursement" && vatRegime !== "franchise") {
      setValue(`lines.${index}.vat_rate`, 0, { shouldDirty: true });
    }
    setPickerOpen(false);
  }

  return (
    <>
      <input type="hidden" {...register(`lines.${index}.item_nature`)} />

      <FormField
        label="Nature de l'item"
        htmlFor={`lines.${index}.item_nature`}
        error={error}
      >
        <button
          id={`lines.${index}.item_nature`}
          type="button"
          onClick={() => setPickerOpen(true)}
          className={cn(
            "flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white px-3.5 py-2.5 text-left text-[15px] text-[#0f172a] transition-[border-color,box-shadow] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:text-sm",
            "hover:border-[rgba(37,99,235,0.15)] focus-visible:border-[#60a5fa] focus-visible:ring-4 focus-visible:ring-[#2563eb]/18 focus-visible:outline-none",
            "dark:border-[rgba(148,163,184,0.18)] dark:bg-[rgba(15,23,42,0.75)] dark:text-[#f8fafc]",
          )}
        >
          <span className="min-w-0">
            <span className="block font-medium">{currentOption.label}</span>
            <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
              {currentOption.description}
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </FormField>

      {isDesktop ? (
        <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
          <DialogContent className="max-w-lg gap-0 p-0">
            <DialogHeader className="border-b border-border/50 px-5 py-4">
              <DialogTitle>Nature de l&apos;item</DialogTitle>
            </DialogHeader>
            <div className="px-3 py-2">
              <NatureOptionsList
                currentNature={currentNature}
                onSelect={selectNature}
              />
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <MobileBottomSheet
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          title="Nature de l'item"
        >
          <NatureOptionsList
            currentNature={currentNature}
            onSelect={selectNature}
          />
        </MobileBottomSheet>
      )}
    </>
  );
}
