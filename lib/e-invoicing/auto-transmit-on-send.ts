import type { SupabaseClient } from "@supabase/supabase-js";

import { hasFeatureForUser } from "@/lib/billing/feature-guard";
import { getClientById } from "@/lib/data/clients";
import { getInvoiceById } from "@/lib/data/invoices";
import {
  getCompanyEinvoicingSettings,
  getLatestInvoiceTransmission,
} from "@/lib/data/einvoicing";
import {
  getPlatformEinvoicingConfig,
  isPlatformEinvoicingActive,
} from "@/lib/e-invoicing/config";
import { assessInvoiceEinvoicingReadiness } from "@/lib/e-invoicing/readiness";
import { ensureEinvoicingProvidersRegistered } from "@/lib/e-invoicing/providers/register";
import { isEinvoicingTransmissionConfigured } from "@/lib/e-invoicing/resolve-provider";
import { transmitInvoiceToEinvoicingProvider } from "@/lib/e-invoicing/transmit-invoice";
import { logServerError } from "@/lib/logger";
import { prepareInvoicePdfData } from "@/lib/pdf/prepare-data";
import type { Database } from "@/types/database";

export type AutoTransmitOnSendResult =
  | { status: "skipped"; reason: string }
  | { status: "already_transmitted"; externalId: string | null }
  | { status: "success"; externalId: string }
  | { status: "failed"; error: string };

export async function autoTransmitInvoiceOnSend(params: {
  supabase: SupabaseClient<Database>;
  userId: string;
  invoiceId: string;
}): Promise<AutoTransmitOnSendResult> {
  ensureEinvoicingProvidersRegistered();

  const platformConfig = getPlatformEinvoicingConfig();
  if (!platformConfig.enabled || !platformConfig.autoTransmitOnSend) {
    return {
      status: "skipped",
      reason: "Transmission automatique désactivée.",
    };
  }

  if (!isPlatformEinvoicingActive()) {
    return {
      status: "skipped",
      reason: "Plateforme Agréée Factoni non activée.",
    };
  }

  const hasAutomation = await hasFeatureForUser(
    params.supabase,
    params.userId,
    "automation",
  );
  if (!hasAutomation) {
    return {
      status: "skipped",
      reason: "Transmission e-facturation non incluse dans votre offre.",
    };
  }

  const invoice = await getInvoiceById(params.supabase, params.invoiceId);
  if (!invoice || invoice.user_id !== params.userId) {
    return { status: "failed", error: "Facture introuvable après envoi." };
  }

  if (invoice.status !== "sent") {
    return {
      status: "skipped",
      reason: "La facture n'est pas au statut envoyée.",
    };
  }

  const latestTransmission = await getLatestInvoiceTransmission(
    params.supabase,
    invoice.id,
  );
  if (
    latestTransmission &&
    (latestTransmission.status === "accepted" ||
      latestTransmission.status === "submitted")
  ) {
    return {
      status: "already_transmitted",
      externalId: latestTransmission.external_id,
    };
  }

  const client = await getClientById(params.supabase, invoice.client_id);
  if (!client) {
    return { status: "failed", error: "Client introuvable." };
  }

  if (client.client_type !== "company") {
    return {
      status: "skipped",
      reason:
        "Client particulier : pas de transmission PA B2B (e-reporting B2C à venir).",
    };
  }

  const companySettings = await getCompanyEinvoicingSettings(
    params.supabase,
    invoice.company_id,
  );

  if (!isEinvoicingTransmissionConfigured(companySettings)) {
    return {
      status: "skipped",
      reason: "Aucune Plateforme Agréée configurée.",
    };
  }

  try {
    const pdfData = await prepareInvoicePdfData(
      invoice,
      params.supabase,
      params.userId,
    );
    const readiness = assessInvoiceEinvoicingReadiness({
      invoice,
      client,
      pdfData,
      providerConfigured: true,
    });

    if (!readiness.ready) {
      const blocking = readiness.items
        .filter((item) => item.level === "error")
        .map((item) => item.message)
        .join(" ");
      return {
        status: "failed",
        error:
          blocking ||
          "Facture non prête pour la transmission électronique.",
      };
    }

    const result = await transmitInvoiceToEinvoicingProvider({
      supabase: params.supabase,
      userId: params.userId,
      companyId: invoice.company_id,
      invoice,
      client,
      pdfData,
    });

    if (!result.ok) {
      return { status: "failed", error: result.error };
    }

    return { status: "success", externalId: result.externalId };
  } catch (error) {
    logServerError("autoTransmitInvoiceOnSend", error, {
      invoiceId: params.invoiceId,
    });
    return {
      status: "failed",
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la transmission automatique.",
    };
  }
}
