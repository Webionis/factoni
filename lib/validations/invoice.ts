import { z } from "zod";

import type { InvoiceDetail } from "@/lib/data/invoices";
import { FRENCH_VAT_RATES } from "@/lib/constants/vat";

export const invoiceLineSchema = z.object({
  description: z.string().min(1, "Description requise"),
  quantity: z.number().positive("Quantité > 0"),
  unit_price_ht: z.number().min(0, "Prix HT invalide"),
  vat_rate: z
    .number()
    .refine(
      (v) => FRENCH_VAT_RATES.includes(v as (typeof FRENCH_VAT_RATES)[number]),
      "Taux TVA invalide",
    ),
});

export type InvoiceLineFormValues = z.infer<typeof invoiceLineSchema>;

export const invoiceFormSchema = z
  .object({
    client_id: z.string().min(1, "Client requis").uuid("Client invalide"),
    issue_date: z.string().min(1, "Date d'émission requise"),
    due_date: z.string().min(1, "Date d'échéance requise"),
    notes: z.string().optional(),
    payment_terms: z.string().optional(),
    discount_percent: z.number().min(0).max(100).optional(),
    discount_amount: z.number().min(0).optional(),
    lines: z.array(invoiceLineSchema).min(1, "Ajoutez au moins une ligne"),
  })
  .superRefine((data, ctx) => {
    if (data.issue_date && data.due_date && data.due_date < data.issue_date) {
      ctx.addIssue({
        code: "custom",
        message: "L'échéance doit être après la date d'émission",
        path: ["due_date"],
      });
    }
    const hasPercent =
      data.discount_percent != null && data.discount_percent > 0;
    const hasAmount =
      data.discount_amount != null && data.discount_amount > 0;
    if (hasPercent && hasAmount) {
      ctx.addIssue({
        code: "custom",
        message: "Une seule remise globale (% ou montant)",
        path: ["discount_amount"],
      });
    }
  });

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export function invoiceToFormValues(invoice: InvoiceDetail): InvoiceFormValues {
  return {
    client_id: invoice.client_id,
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    notes: invoice.notes ?? "",
    payment_terms: invoice.payment_terms ?? "",
    discount_percent: invoice.discount_percent ?? undefined,
    discount_amount: invoice.discount_amount ?? undefined,
    lines: invoice.invoice_lines.map((line) => ({
      description: line.description,
      quantity: Number(line.quantity),
      unit_price_ht: Number(line.unit_price_ht),
      vat_rate: Number(line.vat_rate),
    })),
  };
}

export function parseInvoiceDiscounts(data: InvoiceFormValues): {
  discount_percent: number | null;
  discount_amount: number | null;
} {
  const percent =
    data.discount_percent == null ? null : Number(data.discount_percent);
  const amount =
    data.discount_amount == null ? null : Number(data.discount_amount);
  return {
    discount_percent: percent && percent > 0 ? percent : null,
    discount_amount: amount && amount > 0 ? amount : null,
  };
}
