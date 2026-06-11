import { z } from "zod";

export const clientLocationFormSchema = z.object({
  label: z.string().min(1, "Libellé requis").max(120, "Libellé trop long"),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  is_default: z.boolean().optional(),
});

export type ClientLocationFormValues = z.infer<typeof clientLocationFormSchema>;
