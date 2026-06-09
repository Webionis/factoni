import { parseClientSnapshot } from "@/lib/pdf/parse-snapshots";
import type { InvoiceWithClient } from "@/lib/data/invoices";
import type { Json } from "@/types/database";

type ClientWithEmail = {
  email: string | null;
} | null;

/** Email client : fiche live puis snapshot figé à l'envoi. */
export function getInvoiceClientEmail(
  client: ClientWithEmail,
  clientSnapshot: Json | null,
): string {
  const fromClient = client?.email?.trim();
  if (fromClient) return fromClient;
  return parseClientSnapshot(clientSnapshot)?.email?.trim() ?? "";
}

export function getInvoiceClientDisplayName(
  invoice: InvoiceWithClient,
  clientSnapshot: Json | null,
): string {
  const client = invoice.clients;
  if (client) {
    if (client.client_type === "company" && client.company_name) {
      return client.company_name;
    }
    return client.name;
  }
  return parseClientSnapshot(clientSnapshot)?.name ?? "Client";
}
