import type { SupabaseClient } from "@supabase/supabase-js";

import type { InvoiceDetail } from "@/lib/data/invoices";
import {
  createEinvoicingTransmission,
  getCompanyEinvoicingSettings,
  updateEinvoicingTransmission,
} from "@/lib/data/einvoicing";
import { buildEinvoicingPayload } from "@/lib/e-invoicing/build-payload";
import { ensureEinvoicingProvidersRegistered } from "@/lib/e-invoicing/providers/register";
import { getEinvoicingProvider } from "@/lib/e-invoicing/providers/registry";
import { resolveEinvoicingProviderSlug } from "@/lib/e-invoicing/resolve-provider";
import type { InvoicePdfData } from "@/lib/pdf/types";
import type { Database } from "@/types/database";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export type TransmitInvoiceResult =
  | { ok: true; transmissionId: string; externalId: string }
  | { ok: false; error: string };

export async function transmitInvoiceToEinvoicingProvider(params: {
  supabase: SupabaseClient<Database>;
  userId: string;
  companyId: string;
  invoice: InvoiceDetail;
  client: ClientRow;
  pdfData: InvoicePdfData;
}): Promise<TransmitInvoiceResult> {
  ensureEinvoicingProvidersRegistered();

  const settings = await getCompanyEinvoicingSettings(
    params.supabase,
    params.companyId,
  );
  const providerSlug = resolveEinvoicingProviderSlug(settings);

  if (!providerSlug) {
    return {
      ok: false,
      error:
        "Aucune Plateforme Agréée connectée. Configurez-la dans les paramètres.",
    };
  }

  const provider = getEinvoicingProvider(providerSlug);
  if (!provider) {
    return {
      ok: false,
      error: `Prestataire « ${providerSlug} » non disponible.`,
    };
  }

  const transmission = await createEinvoicingTransmission(params.supabase, {
    invoiceId: params.invoice.id,
    userId: params.userId,
    providerSlug,
  });

  if (!transmission) {
    return { ok: false, error: "Impossible d'enregistrer la transmission." };
  }

  try {
    const payload = await buildEinvoicingPayload(params.pdfData);
    const result = await provider.submit({
      payload,
      sellerSiren:
        params.pdfData.emitter.siren?.trim() ??
        params.pdfData.emitter.siret?.slice(0, 9) ??
        "",
      buyerSiren: params.client.siren,
      buyerSiret: params.client.siret,
    });

    await updateEinvoicingTransmission(params.supabase, transmission.id, {
      status: result.status,
      external_id: result.externalId,
      error_message: null,
    });

    return {
      ok: true,
      transmissionId: transmission.id,
      externalId: result.externalId,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur de transmission.";
    await updateEinvoicingTransmission(params.supabase, transmission.id, {
      status: "failed",
      error_message: message,
    });
    return { ok: false, error: message };
  }
}
