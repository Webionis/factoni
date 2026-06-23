import { z } from "zod";

import {
  FRENCH_VAT_RATES,
  FRANCHISE_MENTION,
  VAT_REGIMES,
} from "@/lib/constants/vat";
import { sanitizeOptionalText, sanitizeText } from "@/lib/sanitize";
import {
  isValidBic,
  isValidIban,
  normalizeBic,
  normalizeIban,
} from "@/lib/validations/bank";
import type { Database } from "@/types/database";

const optionalSiren = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{9}$/.test(v), "SIREN : 9 chiffres");

const optionalSiret = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{14}$/.test(v), "SIRET : 14 chiffres");

export const companyFormSchema = z
  .object({
    trade_name: z.string().min(1, "Nom commercial requis"),
    legal_name: z.string().min(1, "Raison sociale requise"),
    address_line1: z.string().min(1, "Adresse requise"),
    address_line2: z.string().optional(),
    postal_code: z.string().min(1, "Code postal requis"),
    city: z.string().min(1, "Ville requise"),
    country: z.string().min(2, "Pays requis"),
    email: z.email("Email professionnel invalide"),
    phone: z.string().optional(),
    siren: optionalSiren,
    siret: optionalSiret,
    vat_number: z.string().optional(),
    vat_regime: z.enum(VAT_REGIMES),
    default_vat_rate: z
      .number()
      .refine(
        (v) => FRENCH_VAT_RATES.includes(v as (typeof FRENCH_VAT_RATES)[number]),
        "Taux TVA invalide",
      ),
    payment_terms: z.string().optional(),
    legal_mentions: z.string().optional(),
    bank_account_holder: z.string().optional(),
    bank_name: z.string().optional(),
    bank_iban: z.string().optional(),
    bank_bic: z.string().optional(),
    bank_show_on_invoices: z.boolean(),
    bank_show_on_quotes: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.vat_regime === "franchise" && data.default_vat_rate !== 0) {
      ctx.addIssue({
        code: "custom",
        message: "Franchise en base : le taux TVA doit être 0 %",
        path: ["default_vat_rate"],
      });
    }
    if (
      data.vat_regime === "standard" &&
      data.vat_number &&
      data.vat_number.trim() !== "" &&
      !/^FR[A-Z0-9]{2}\d{9}$/i.test(data.vat_number.replace(/\s/g, ""))
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Format attendu : FR + 11 caractères (ex. FR12345678901)",
        path: ["vat_number"],
      });
    }

    const iban = data.bank_iban?.trim() ?? "";
    const bic = data.bank_bic?.trim() ?? "";

    if (iban && !isValidIban(iban)) {
      ctx.addIssue({
        code: "custom",
        message: "IBAN invalide (ex. FR76 1234 5678 9012 3456 7890 123)",
        path: ["bank_iban"],
      });
    }

    if (bic && !isValidBic(bic)) {
      ctx.addIssue({
        code: "custom",
        message: "BIC invalide (8 ou 11 caractères)",
        path: ["bank_bic"],
      });
    }

    if (iban && !data.bank_account_holder?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Indiquez le titulaire du compte",
        path: ["bank_account_holder"],
      });
    }
  });

export type CompanyFormValues = z.infer<typeof companyFormSchema>;

type DatabaseCompanyRow = Database["public"]["Tables"]["companies"]["Row"];

export function companyRowToFormValues(
  company: DatabaseCompanyRow,
): CompanyFormValues {
  return {
    trade_name: company.trade_name,
    legal_name: company.legal_name,
    address_line1: company.address_line1,
    address_line2: company.address_line2 ?? "",
    postal_code: company.postal_code,
    city: company.city,
    country: company.country,
    email: company.email,
    phone: company.phone ?? "",
    siren: company.siren ?? "",
    siret: company.siret ?? "",
    vat_number: company.vat_number ?? "",
    vat_regime: company.vat_regime,
    default_vat_rate: Number(company.default_vat_rate),
    payment_terms: company.payment_terms ?? "",
    legal_mentions: company.legal_mentions ?? "",
    bank_account_holder: company.bank_account_holder ?? "",
    bank_name: company.bank_name ?? "",
    bank_iban: company.bank_iban ?? "",
    bank_bic: company.bank_bic ?? "",
    bank_show_on_invoices: company.bank_show_on_invoices ?? true,
    bank_show_on_quotes: company.bank_show_on_quotes ?? false,
  };
}

export function formValuesToCompanyPayload(
  values: CompanyFormValues,
  userId: string,
): Database["public"]["Tables"]["companies"]["Insert"] {
  const vatRegime = values.vat_regime;
  const defaultVatRate = vatRegime === "franchise" ? 0 : values.default_vat_rate;

  return {
    user_id: userId,
    trade_name: sanitizeText(values.trade_name, 200),
    legal_name: sanitizeText(values.legal_name, 200),
    address_line1: sanitizeText(values.address_line1, 300),
    address_line2: sanitizeOptionalText(values.address_line2, 300),
    postal_code: sanitizeText(values.postal_code, 20),
    city: sanitizeText(values.city, 120),
    country: sanitizeText(values.country || "FR", 2),
    email: sanitizeText(values.email, 254),
    phone: sanitizeOptionalText(values.phone, 40),
    siren: sanitizeOptionalText(values.siren, 9),
    siret: sanitizeOptionalText(values.siret, 14),
    vat_number: sanitizeOptionalText(values.vat_number, 20),
    vat_regime: vatRegime,
    default_vat_rate: defaultVatRate,
    payment_terms: sanitizeOptionalText(values.payment_terms, 500),
    legal_mentions:
      vatRegime === "franchise"
        ? sanitizeOptionalText(values.legal_mentions, 2000) || FRANCHISE_MENTION
        : sanitizeOptionalText(values.legal_mentions, 2000),
    bank_account_holder: sanitizeOptionalText(values.bank_account_holder, 200),
    bank_name: sanitizeOptionalText(values.bank_name, 120),
    bank_iban: values.bank_iban?.trim()
      ? normalizeIban(values.bank_iban)
      : null,
    bank_bic: values.bank_bic?.trim() ? normalizeBic(values.bank_bic) : null,
    bank_show_on_invoices: values.bank_show_on_invoices,
    bank_show_on_quotes: values.bank_show_on_quotes,
  };
}
