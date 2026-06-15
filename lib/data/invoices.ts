import type { SupabaseClient } from "@supabase/supabase-js";

import { filterInvoiceListRows } from "@/lib/documents/list-integrity";
import { isInvoiceDocument } from "@/lib/documents/types";
import type { InvoiceStatus } from "@/lib/invoices/status";
import { logServerError } from "@/lib/logger";
import type { Database } from "@/types/database";

const INVOICE_LIST_SELECT = `
  *,
  clients (
    id,
    name,
    company_name,
    client_type
  )
`;

/** Colonnes minimales pour dashboard (stats, graphique, activité). */
const INVOICE_DASHBOARD_SELECT = `
  id,
  user_id,
  document_type,
  status,
  due_date,
  total_ht,
  total_vat,
  total_ttc,
  disbursement_total_ttc,
  issue_date,
  invoice_number,
  client_snapshot,
  updated_at,
  clients (
    id,
    name,
    company_name,
    client_type
  )
`;

export type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
export type InvoiceLineRow = Database["public"]["Tables"]["invoice_lines"]["Row"];

export type InvoiceWithClient = InvoiceRow & {
  clients: {
    id: string;
    name: string;
    company_name: string | null;
    client_type: Database["public"]["Enums"]["client_type"];
    email: string | null;
  } | null;
};

export type InvoiceWithClientExport = InvoiceRow & {
  clients: {
    id: string;
    name: string;
    company_name: string | null;
    client_type: Database["public"]["Enums"]["client_type"];
    email: string | null;
  } | null;
};

export type InvoiceWithLines = InvoiceRow & {
  invoice_lines: InvoiceLineRow[];
};

export type InvoiceDetail = InvoiceWithClient & {
  invoice_lines: InvoiceLineRow[];
};

const INVOICE_EXPORT_SELECT = `
  *,
  clients (
    id,
    name,
    company_name,
    client_type,
    email
  )
`;

export async function listInvoicesForExport(
  supabase: SupabaseClient<Database>,
  userId: string,
  options: {
    dateFrom?: string;
    dateTo?: string;
    includeArchived: boolean;
  },
): Promise<InvoiceWithClientExport[]> {
  let query = supabase
    .from("invoices")
    .select(INVOICE_EXPORT_SELECT)
    .eq("user_id", userId)
    .eq("document_type", "invoice")
    .neq("status", "draft");

  if (!options.includeArchived) {
    query = query.is("archived_at", null);
  }
  if (options.dateFrom) {
    query = query.gte("issue_date", options.dateFrom);
  }
  if (options.dateTo) {
    query = query.lte("issue_date", options.dateTo);
  }

  const { data, error } = await query.order("issue_date", { ascending: false });

  if (error) {
    logServerError("listInvoicesForExport", error, { userId });
    return [];
  }

  return (data ?? []) as InvoiceWithClientExport[];
}

export async function listInvoicesForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<InvoiceWithClient[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select(INVOICE_LIST_SELECT)
    .eq("user_id", userId)
    .eq("document_type", "invoice")
    .order("issue_date", { ascending: false });

  if (error) {
    logServerError("listInvoicesForUser", error);
    return [];
  }

  return filterInvoiceListRows((data ?? []) as InvoiceWithClient[]);
}

export async function listInvoicesForDashboard(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<InvoiceWithClient[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select(INVOICE_DASHBOARD_SELECT)
    .eq("user_id", userId)
    .eq("document_type", "invoice")
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    logServerError("listInvoicesForDashboard", error);
    return [];
  }

  return filterInvoiceListRows((data ?? []) as InvoiceWithClient[]);
}

export async function getInvoiceById(
  supabase: SupabaseClient<Database>,
  invoiceId: string,
): Promise<InvoiceDetail | null> {
  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      clients (
        id,
        name,
        company_name,
        client_type,
        email
      ),
      invoice_lines (
        *
      )
    `,
    )
    .eq("id", invoiceId)
    .maybeSingle();

  if (error) {
    logServerError("getInvoiceById", error, { invoiceId });
    return null;
  }

  if (!data) return null;

  const lines = [...(data.invoice_lines ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return {
    ...data,
    invoice_lines: lines,
  } as InvoiceDetail;
}

export async function getInvoiceOnlyById(
  supabase: SupabaseClient<Database>,
  invoiceId: string,
): Promise<InvoiceDetail | null> {
  const doc = await getInvoiceById(supabase, invoiceId);
  if (!doc || !isInvoiceDocument(doc.document_type)) {
    return null;
  }
  return doc;
}

export function clientNameFromInvoice(invoice: InvoiceWithClient): string {
  const client = invoice.clients;
  if (!client) return "Client inconnu";
  if (client.client_type === "company" && client.company_name) {
    return client.company_name;
  }
  return client.name;
}

export function clientNameFromSnapshot(
  snapshot: Database["public"]["Tables"]["invoices"]["Row"]["client_snapshot"],
): string | null {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return null;
  }
  const s = snapshot as Record<string, unknown>;
  if (s.client_type === "company" && s.company_name) {
    return String(s.company_name);
  }
  if (s.name) return String(s.name);
  return null;
}

export type InvoiceStatusFilter = InvoiceStatus | "all";
