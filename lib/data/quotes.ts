import type { SupabaseClient } from "@supabase/supabase-js";

import { filterQuoteListRows } from "@/lib/documents/list-integrity";
import { isQuoteDocument } from "@/lib/documents/types";
import type { InvoiceDetail, InvoiceWithClient } from "@/lib/data/invoices";
import { getInvoiceById } from "@/lib/data/invoices";
import { logServerError } from "@/lib/logger";
import type { QuoteStatus } from "@/lib/quotes/status";
import type { Database } from "@/types/database";

const QUOTE_LIST_SELECT = `
  *,
  clients (
    id,
    name,
    company_name,
    client_type,
    email
  )
`;

export type QuoteWithClient = InvoiceWithClient;
export type QuoteDetail = InvoiceDetail;
export type QuoteStatusFilter = QuoteStatus | "all";

export async function listQuotesForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<QuoteWithClient[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select(QUOTE_LIST_SELECT)
    .eq("user_id", userId)
    .eq("document_type", "quote")
    .order("issue_date", { ascending: false });

  if (error) {
    logServerError("listQuotesForUser", error);
    return [];
  }

  return filterQuoteListRows((data ?? []) as QuoteWithClient[]);
}

export async function listQuotesForDashboard(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<QuoteWithClient[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select(QUOTE_LIST_SELECT)
    .eq("user_id", userId)
    .eq("document_type", "quote")
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    logServerError("listQuotesForDashboard", error);
    return [];
  }

  return ((data ?? []) as QuoteWithClient[]).filter((row) =>
    isQuoteDocument(row.document_type),
  );
}

export async function getQuoteById(
  supabase: SupabaseClient<Database>,
  quoteId: string,
): Promise<QuoteDetail | null> {
  const doc = await getInvoiceById(supabase, quoteId);
  if (!doc || !isQuoteDocument(doc.document_type)) {
    return null;
  }
  return doc;
}
