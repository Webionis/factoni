import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildReceiptsFromDocuments,
  getClientPortalSummary,
  mapDocumentToPortalView,
  type PortalDocumentRow,
  type PortalDocumentView,
  type PortalReceiptView,
  type PortalSummary,
} from "@/lib/client-portal/status";
import { invoiceDisplayNumber } from "@/lib/invoices/status";
import { quoteDisplayNumber } from "@/lib/quotes/status";
import { logServerError } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

const COMPANY_LOGOS_BUCKET = "company-logos";

export type ClientPortalPayload = {
  clientName: string;
  companyName: string;
  companyLogoUrl: string | null;
  portalAccessEnabled: boolean;
  documents: PortalDocumentView[];
  receipts: PortalReceiptView[];
  summary: PortalSummary;
};

async function resolveCompanyLogoUrl(
  logoPath: string | null,
): Promise<string | null> {
  if (!logoPath) return null;
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(COMPANY_LOGOS_BUCKET)
    .createSignedUrl(logoPath, 300);
  if (error) {
    logServerError("resolveCompanyLogoUrl", error, { logoPath });
    return null;
  }
  return data?.signedUrl ?? null;
}

export async function getClientPortalByToken(
  token: string,
): Promise<ClientPortalPayload | null> {
  const trimmed = token?.trim();
  if (!trimmed || trimmed.length < 16) return null;

  const admin = createAdminClient();

  const { data: client, error: clientError } = await admin
    .from("clients")
    .select(
      "id, user_id, name, company_name, client_type, portal_access_enabled",
    )
    .eq("portal_token", trimmed)
    .maybeSingle();

  if (clientError) {
    logServerError("getClientPortalByToken.client", clientError);
    return null;
  }

  if (!client || !client.portal_access_enabled) return null;

  const { data: company, error: companyError } = await admin
    .from("companies")
    .select("trade_name, legal_name, logo_path")
    .eq("user_id", client.user_id)
    .maybeSingle();

  if (companyError) {
    logServerError("getClientPortalByToken.company", companyError);
    return null;
  }

  const documents = await getClientPortalDocuments(client.id, client.user_id);
  const receipts = buildReceiptsFromDocuments(documents);
  const summary = getClientPortalSummary(documents, receipts);
  const companyLogoUrl = await resolveCompanyLogoUrl(company?.logo_path ?? null);

  return {
    clientName:
      client.client_type === "company" && client.company_name
        ? client.company_name
        : client.name,
    companyName: company?.trade_name ?? company?.legal_name ?? "Votre professionnel",
    companyLogoUrl,
    portalAccessEnabled: client.portal_access_enabled,
    documents,
    receipts,
    summary,
  };
}

export async function getClientPortalDocuments(
  clientId: string,
  ownerUserId: string,
): Promise<PortalDocumentView[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("invoices")
    .select(
      "id, document_type, status, invoice_number, issue_date, due_date, total_ttc, public_document_token, quote_deposit_status, quote_deposit_amount, quote_deposit_paid_at, paid_at, converted_to_invoice_id, client_location_snapshot",
    )
    .eq("client_id", clientId)
    .eq("user_id", ownerUserId)
    .is("archived_at", null)
    .eq("public_access_enabled", true)
    .not("public_document_token", "is", null)
    .not("status", "in", '("draft","ready","cancelled")')
    .order("issue_date", { ascending: false });

  if (error) {
    logServerError("getClientPortalDocuments", error, { clientId });
    return [];
  }

  const views: PortalDocumentView[] = [];

  for (const row of data ?? []) {
    const doc = row as PortalDocumentRow & { quote_deposit_amount: number | null };
    const displayNumber =
      doc.document_type === "quote"
        ? quoteDisplayNumber(doc.invoice_number, doc.id)
        : invoiceDisplayNumber(doc.invoice_number, doc.id);

    const view = mapDocumentToPortalView(doc, displayNumber);
    if (view) views.push(view);
  }

  return views.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.issueDate.localeCompare(a.issueDate);
  });
}

export async function getClientPortalUrlByClientId(
  supabase: SupabaseClient<Database>,
  clientId: string,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("clients")
    .select("portal_token, portal_access_enabled")
    .eq("id", clientId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!data?.portal_access_enabled || !data.portal_token) return null;

  const { buildClientPortalUrl } = await import("@/lib/client-portal/tokens");
  return buildClientPortalUrl(data.portal_token);
}

export async function getClientPortalUrlForDocument(
  clientId: string | null,
  ownerUserId: string,
): Promise<string | null> {
  if (!clientId) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("clients")
    .select("portal_token, portal_access_enabled")
    .eq("id", clientId)
    .eq("user_id", ownerUserId)
    .maybeSingle();

  if (!data?.portal_access_enabled || !data.portal_token) return null;

  const { buildClientPortalUrl } = await import("@/lib/client-portal/tokens");
  return buildClientPortalUrl(data.portal_token);
}

export { getClientPortalSummary };
