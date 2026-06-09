import type { SupabaseClient } from "@supabase/supabase-js";

import { getClientById } from "@/lib/data/clients";
import { getCompanyForUser } from "@/lib/auth/profile";
import { buildClientSnapshot, buildCompanySnapshot } from "@/lib/invoices/snapshots";
import { canSendQuoteByEmail, normalizeQuoteStatus } from "@/lib/quotes/status";
import type { Database } from "@/types/database";

export async function transitionQuoteReadyToSent(
  supabase: SupabaseClient<Database>,
  userId: string,
  quoteId: string,
): Promise<{ error?: string }> {
  const { data: quote, error: readError } = await supabase
    .from("invoices")
    .select("id, status, document_type, client_id, archived_at")
    .eq("id", quoteId)
    .eq("user_id", userId)
    .maybeSingle();

  if (readError || !quote) {
    return { error: "Devis introuvable." };
  }

  if (quote.document_type !== "quote") {
    return { error: "Document introuvable." };
  }

  if (quote.archived_at) {
    return { error: "Ce devis est archivé." };
  }

  const status = normalizeQuoteStatus(quote.status);
  if (status === "sent" || status === "viewed") {
    return {};
  }

  if (!canSendQuoteByEmail(status)) {
    return {
      error:
        status === "draft"
          ? "Validez d'abord le brouillon avant d'envoyer le devis."
          : "Ce devis ne peut plus être envoyé.",
    };
  }

  const client = await getClientById(supabase, quote.client_id);
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
    .eq("id", quoteId)
    .eq("user_id", userId)
    .eq("document_type", "quote")
    .eq("status", "ready");

  if (updateError) {
    return { error: "Impossible de marquer le devis comme envoyé." };
  }

  return {};
}
