import type { SupabaseClient } from "@supabase/supabase-js";

import { getClientById } from "@/lib/data/clients";
import { getCompanyForUser } from "@/lib/auth/profile";
import { autoTransmitInvoiceOnSend } from "@/lib/e-invoicing/auto-transmit-on-send";
import { buildClientSnapshot, buildCompanySnapshot } from "@/lib/invoices/snapshots";
import { canSendInvoiceByEmail, toInvoiceStatus } from "@/lib/invoices/status";
import type { Database } from "@/types/database";

export type TransitionInvoiceSentResult = {
  error?: string;
  einvoicingWarning?: string;
  einvoicingSuccess?: string;
};

export async function transitionInvoiceReadyToSent(
  supabase: SupabaseClient<Database>,
  userId: string,
  invoiceId: string,
): Promise<TransitionInvoiceSentResult> {
  const { data: invoice, error: readError } = await supabase
    .from("invoices")
    .select("id, status, document_type, client_id, archived_at")
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (readError || !invoice) {
    return { error: "Facture introuvable." };
  }

  if (invoice.document_type !== "invoice") {
    return { error: "Document introuvable." };
  }

  if (invoice.archived_at) {
    return { error: "Cette facture est archivée." };
  }

  const status = toInvoiceStatus(invoice.status);
  if (status === "sent") {
    return {};
  }

  if (!canSendInvoiceByEmail(status)) {
    return {
      error:
        status === "draft"
          ? "Validez d'abord le brouillon avant d'envoyer la facture."
          : "Cette facture ne peut plus être envoyée.",
    };
  }

  const client = await getClientById(supabase, invoice.client_id);
  const company = await getCompanyForUser(supabase, userId);
  if (!client || !company) {
    return { error: "Client ou entreprise introuvable." };
  }

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      status: "sent",
      client_snapshot: buildClientSnapshot(client),
      company_snapshot: buildCompanySnapshot(company),
    })
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .eq("document_type", "invoice")
    .eq("status", "ready");

  if (updateError) {
    return { error: "Impossible de marquer la facture comme envoyée." };
  }

  const transmitResult = await autoTransmitInvoiceOnSend({
    supabase,
    userId,
    invoiceId,
  });

  if (transmitResult.status === "success") {
    return {
      einvoicingSuccess: "Facture transmise à la Plateforme Agréée.",
    };
  }

  if (transmitResult.status === "failed") {
    return {
      einvoicingWarning: `Facture envoyée, mais transmission PA échouée : ${transmitResult.error}`,
    };
  }

  return {};
}
