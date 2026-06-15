import type { SupabaseClient } from "@supabase/supabase-js";

import type { EinvoicingTransmissionStatus } from "@/lib/e-invoicing/types";
import type { Database } from "@/types/database";

type DbClient = SupabaseClient<Database>;

export type CompanyEinvoicingSettings =
  Database["public"]["Tables"]["company_einvoicing_settings"]["Row"];

export type InvoiceEinvoicingTransmission =
  Database["public"]["Tables"]["invoice_einvoicing_transmissions"]["Row"];

export async function getCompanyEinvoicingSettings(
  client: DbClient,
  companyId: string,
): Promise<CompanyEinvoicingSettings | null> {
  const { data, error } = await client
    .from("company_einvoicing_settings")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export function isEinvoicingProviderConfigured(
  settings: CompanyEinvoicingSettings | null,
): boolean {
  return Boolean(settings?.enabled && settings.provider_slug?.trim());
}

export async function getLatestInvoiceTransmission(
  client: DbClient,
  invoiceId: string,
): Promise<InvoiceEinvoicingTransmission | null> {
  const { data, error } = await client
    .from("invoice_einvoicing_transmissions")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function createEinvoicingTransmission(
  client: DbClient,
  params: {
    invoiceId: string;
    userId: string;
    providerSlug: string;
  },
): Promise<InvoiceEinvoicingTransmission | null> {
  const { data, error } = await client
    .from("invoice_einvoicing_transmissions")
    .insert({
      invoice_id: params.invoiceId,
      user_id: params.userId,
      provider_slug: params.providerSlug,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function updateEinvoicingTransmission(
  client: DbClient,
  transmissionId: string,
  patch: {
    status: EinvoicingTransmissionStatus;
    external_id?: string | null;
    error_message?: string | null;
  },
): Promise<void> {
  const { error } = await client
    .from("invoice_einvoicing_transmissions")
    .update(patch)
    .eq("id", transmissionId);

  if (error) {
    throw error;
  }
}
