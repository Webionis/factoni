import { z } from "zod";

import { sanitizeOptionalText, sanitizeText } from "@/lib/sanitize";
import type { Database } from "@/types/database";

const CLIENT_TYPES = ["individual", "company"] as const;

const optionalSiren = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{9}$/.test(v), "SIREN : 9 chiffres");

const optionalSiret = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{14}$/.test(v), "SIRET : 14 chiffres");

const optionalEmail = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || z.email().safeParse(v).success,
    "Email invalide",
  );

export const clientFormSchema = z
  .object({
    client_type: z.enum(CLIENT_TYPES),
    name: z.string().min(1, "Nom requis"),
    company_name: z.string().optional(),
    email: optionalEmail,
    phone: z.string().optional(),
    address_line1: z.string().optional(),
    address_line2: z.string().optional(),
    postal_code: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    siren: optionalSiren,
    siret: optionalSiret,
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.client_type === "company") {
      const company = data.company_name?.trim();
      if (!company) {
        ctx.addIssue({
          code: "custom",
          message: "Raison sociale requise pour un client professionnel",
          path: ["company_name"],
        });
      }
    }
  });

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export function clientRowToFormValues(client: ClientRow): ClientFormValues {
  return {
    client_type: client.client_type,
    name: client.name,
    company_name: client.company_name ?? "",
    email: client.email ?? "",
    phone: client.phone ?? "",
    address_line1: client.address_line1 ?? "",
    address_line2: client.address_line2 ?? "",
    postal_code: client.postal_code ?? "",
    city: client.city ?? "",
    country: client.country ?? "FR",
    siren: client.siren ?? "",
    siret: client.siret ?? "",
    notes: client.notes ?? "",
  };
}

export function formValuesToClientPayload(
  values: ClientFormValues,
  userId: string,
): Database["public"]["Tables"]["clients"]["Insert"] {
  return {
    user_id: userId,
    client_type: values.client_type,
    name: sanitizeText(values.name, 200),
    company_name:
      values.client_type === "company"
        ? sanitizeOptionalText(values.company_name, 200)
        : null,
    email: sanitizeOptionalText(values.email, 254),
    phone: sanitizeOptionalText(values.phone, 40),
    address_line1: sanitizeOptionalText(values.address_line1, 300),
    address_line2: sanitizeOptionalText(values.address_line2, 300),
    postal_code: sanitizeOptionalText(values.postal_code, 20),
    city: sanitizeOptionalText(values.city, 120),
    country: sanitizeOptionalText(values.country, 2) ?? "FR",
    siren: sanitizeOptionalText(values.siren, 9),
    siret: sanitizeOptionalText(values.siret, 14),
    notes: sanitizeOptionalText(values.notes, 2000),
  };
}

export function formatClientAddress(client: ClientRow): string | null {
  const parts = [
    client.address_line1,
    client.address_line2,
    [client.postal_code, client.city].filter(Boolean).join(" "),
    client.country && client.country !== "FR" ? client.country : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

export function clientDisplayName(client: ClientRow): string {
  if (client.client_type === "company" && client.company_name) {
    return client.company_name;
  }
  return client.name;
}

export function clientSubtitle(client: ClientRow): string | null {
  if (client.client_type === "company" && client.company_name) {
    return client.name;
  }
  return null;
}
