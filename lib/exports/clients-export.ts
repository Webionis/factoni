import type { SupabaseClient } from "@supabase/supabase-js";

import { listClientsForUser } from "@/lib/data/clients";
import type { InvoiceWithClientExport } from "@/lib/data/invoices";
import { buildCsvRow, csvFileContent } from "@/lib/exports/csv";
import {
  formatFrenchAmount,
  formatFrenchDate,
} from "@/lib/exports/formatting";
import type { ClientRow } from "@/lib/validations/client";
import type { Database } from "@/types/database";

export interface ClientExportRow {
  name: string;
  email: string;
  phone: string;
  address: string;
  invoiceCount: number;
  revenueTtc: number;
  lastActivity: string;
  createdAt: string;
}

const HEADERS = [
  "Nom",
  "Email",
  "Téléphone",
  "Adresse",
  "Nombre de factures",
  "CA généré TTC",
  "Dernière activité",
  "Date création",
] as const;

function clientName(client: ClientRow): string {
  if (client.client_type === "company" && client.company_name) {
    return client.company_name;
  }
  return client.name;
}

function clientAddress(client: ClientRow): string {
  const parts = [
    client.address_line1,
    client.address_line2,
    [client.postal_code, client.city].filter(Boolean).join(" "),
    client.country,
  ].filter(Boolean);
  return parts.join(", ");
}

export function aggregateClientExportRows(
  clients: ClientRow[],
  invoices: InvoiceWithClientExport[],
): ClientExportRow[] {
  const stats = new Map<
    string,
    { count: number; revenue: number; lastActivity: string }
  >();

  for (const invoice of invoices) {
    const clientId = invoice.client_id;
    const current = stats.get(clientId) ?? {
      count: 0,
      revenue: 0,
      lastActivity: "",
    };
    current.count += 1;
    current.revenue += Number(invoice.total_ttc) || 0;
    const activityDate = invoice.paid_at ?? invoice.issue_date;
    if (!current.lastActivity || activityDate > current.lastActivity) {
      current.lastActivity = activityDate;
    }
    stats.set(clientId, current);
  }

  return clients
    .map((client) => {
      const stat = stats.get(client.id);
      return {
        name: clientName(client),
        email: client.email ?? "",
        phone: client.phone ?? "",
        address: clientAddress(client),
        invoiceCount: stat?.count ?? 0,
        revenueTtc: stat?.revenue ?? 0,
        lastActivity: stat?.lastActivity ?? "",
        createdAt: client.created_at,
      };
    })
    .sort((a, b) => b.revenueTtc - a.revenueTtc || a.name.localeCompare(b.name));
}

export async function listClientsExportData(
  supabase: SupabaseClient<Database>,
  userId: string,
  invoices: InvoiceWithClientExport[],
): Promise<ClientExportRow[]> {
  const clients = await listClientsForUser(supabase, userId);
  return aggregateClientExportRows(clients, invoices);
}

function rowToCsv(row: ClientExportRow): string {
  return buildCsvRow([
    row.name,
    row.email,
    row.phone,
    row.address,
    String(row.invoiceCount),
    formatFrenchAmount(row.revenueTtc),
    formatFrenchDate(row.lastActivity),
    formatFrenchDate(row.createdAt),
  ]);
}

export function buildClientsCsv(rows: ClientExportRow[]): string {
  return csvFileContent([
    buildCsvRow([...HEADERS]),
    ...rows.map(rowToCsv),
  ]);
}

export function buildClientsTableData(
  rows: ClientExportRow[],
): { headers: string[]; rows: string[][] } {
  return {
    headers: [...HEADERS],
    rows: rows.map((row) => [
      row.name,
      row.email,
      row.phone,
      row.address,
      String(row.invoiceCount),
      formatFrenchAmount(row.revenueTtc),
      formatFrenchDate(row.lastActivity),
      formatFrenchDate(row.createdAt),
    ]),
  };
}

export function clientsExportFilename(format: "csv" | "xlsx"): string {
  const iso = new Date().toISOString().slice(0, 10);
  return `export-clients-${iso}.${format}`;
}
