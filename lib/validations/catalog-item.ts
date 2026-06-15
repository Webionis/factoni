import { z } from "zod";

import { FRENCH_VAT_RATES } from "@/lib/constants/vat";
import {
  DEFAULT_INVOICE_LINE_ITEM_NATURE,
  INVOICE_LINE_ITEM_NATURES,
  isDisbursementLine,
} from "@/lib/invoices/item-nature";

export const catalogItemFormSchema = z
  .object({
    label: z.string().min(1, "Nom requis").max(200, "Nom trop long"),
    unit_price_ht: z.number().min(0, "Prix HT invalide"),
    vat_rate: z
      .number()
      .refine(
        (v) => FRENCH_VAT_RATES.includes(v as (typeof FRENCH_VAT_RATES)[number]),
        "Taux TVA invalide",
      ),
    item_nature: z.enum(INVOICE_LINE_ITEM_NATURES),
  })
  .superRefine((data, ctx) => {
    if (isDisbursementLine(data.item_nature) && data.vat_rate !== 0) {
      ctx.addIssue({
        code: "custom",
        message: "La TVA doit être à 0 % pour un frais de débours",
        path: ["vat_rate"],
      });
    }
  });

export type CatalogItemFormValues = z.infer<typeof catalogItemFormSchema>;

export function defaultCatalogItemFormValues(
  defaultVatRate = 20,
): CatalogItemFormValues {
  return {
    label: "",
    unit_price_ht: 0,
    vat_rate: defaultVatRate,
    item_nature: DEFAULT_INVOICE_LINE_ITEM_NATURE,
  };
}
