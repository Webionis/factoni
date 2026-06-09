import type { SupabaseClient } from "@supabase/supabase-js";

import { getCompanyForUser } from "@/lib/auth/profile";
import { createQuoteSignedNotification } from "@/lib/data/notifications";
import { sendQuoteSignedEmail } from "@/lib/email/send-quote-signed-email";
import { clientNameFromSnapshot } from "@/lib/data/invoices";
import { logServerError } from "@/lib/logger";
import {
  parseClientSnapshot,
  parseCompanySnapshot,
} from "@/lib/pdf/parse-snapshots";
import { quoteDisplayNumber } from "@/lib/quotes/status";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

interface NotifyOwnerQuoteSignedParams {
  quote: Database["public"]["Tables"]["invoices"]["Row"];
  acceptedByName: string;
  signedAt: string;
}

async function resolveOwnerEmail(
  userId: string,
): Promise<{ email: string | null; fullName: string | null }> {
  if (!isAdminClientConfigured()) {
    return { email: null, fullName: null };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    logServerError("notifyOwnerQuoteSigned.profile", error, { userId });
    return { email: null, fullName: null };
  }

  return {
    email: data?.email?.trim() ?? null,
    fullName: data?.full_name ?? null,
  };
}

/**
 * Envoie l'email artisan après signature réussie.
 * Appeler uniquement quand le RPC sign_quote_by_public_token a retourné true.
 */
export async function notifyOwnerQuoteSigned(
  _supabase: SupabaseClient<Database>,
  params: NotifyOwnerQuoteSignedParams,
): Promise<void> {
  const { quote, acceptedByName, signedAt } = params;

  const company = await getCompanyForUser(
    isAdminClientConfigured() ? createAdminClient() : _supabase,
    quote.user_id,
  );
  const companyFromSnapshot = parseCompanySnapshot(quote.company_snapshot);
  const clientFromSnapshot = parseClientSnapshot(quote.client_snapshot);
  const clientName =
    clientFromSnapshot?.name ??
    clientNameFromSnapshot(quote.client_snapshot) ??
    "Client";

  const quoteNumber = quoteDisplayNumber(quote.invoice_number, quote.id);
  const totalTtc = Number(quote.total_ttc);

  try {
    await createQuoteSignedNotification({
      ownerUserId: quote.user_id,
      quoteId: quote.id,
      quoteNumber,
      clientName,
      amountTtc: totalTtc,
      signedAt,
    });
  } catch (notificationError) {
    logServerError("notifyOwnerQuoteSigned.notification", notificationError, {
      quoteId: quote.id,
    });
  }

  const { email: ownerEmail, fullName } = await resolveOwnerEmail(quote.user_id);
  if (!ownerEmail) {
    logServerError("notifyOwnerQuoteSigned", "owner_email_missing", {
      quoteId: quote.id,
      userId: quote.user_id,
    });
    return;
  }

  await sendQuoteSignedEmail({
    quoteId: quote.id,
    quoteNumber,
    ownerEmail,
    ownerName: fullName ?? companyFromSnapshot?.party.name ?? company?.trade_name,
    clientName,
    acceptedByName,
    totalTtc,
    signedAt,
  });
}
