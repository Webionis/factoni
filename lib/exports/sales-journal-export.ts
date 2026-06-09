import type { InvoiceWithClientExport } from "@/lib/data/invoices";
import { buildCsvRow, csvFileContent } from "@/lib/exports/csv";
import {
  formatFrenchAmount,
  formatFrenchDate,
} from "@/lib/exports/formatting";
import type { InvoiceExportFilters } from "@/lib/exports/types";
import {
  filterInvoicesForExport,
  type InvoiceExportFilters as Filters,
} from "@/lib/exports/invoice-export";
import { parseClientSnapshot } from "@/lib/pdf/parse-snapshots";
import {
  invoiceDisplayNumber,
  toInvoiceStatus,
} from "@/lib/invoices/status";

/**
 * Journal des ventes — format compatible expert-comptable.
 * Écritures simplifiées par facture : client (411), produit (706), TVA (44571).
 */
const HEADERS = [
  "Date",
  "Journal",
  "Compte",
  "Libellé",
  "Débit",
  "Crédit",
  "TVA",
  "Référence pièce",
] as const;

function clientName(invoice: InvoiceWithClientExport): string {
  const client = invoice.clients;
  if (client) {
    return client.company_name ?? client.name;
  }
  return parseClientSnapshot(invoice.client_snapshot)?.name ?? "Client";
}

interface JournalLine {
  date: string;
  journal: string;
  account: string;
  label: string;
  debit: number;
  credit: number;
  vat: string;
  reference: string;
}

function invoiceToJournalLines(invoice: InvoiceWithClientExport): JournalLine[] {
  const ref = invoiceDisplayNumber(invoice.invoice_number, invoice.id);
  const date = formatFrenchDate(invoice.issue_date);
  const client = clientName(invoice);
  const ht = Number(invoice.total_ht) || 0;
  const vat = Number(invoice.total_vat) || 0;
  const ttc = Number(invoice.total_ttc) || 0;
  const status = toInvoiceStatus(invoice.status);

  const lines: JournalLine[] = [];

  if (status === "paid") {
    lines.push({
      date,
      journal: "BQ",
      account: "512",
      label: `Encaissement ${ref} — ${client}`,
      debit: ttc,
      credit: 0,
      vat: "",
      reference: ref,
    });
  } else {
    lines.push({
      date,
      journal: "VT",
      account: "411",
      label: `Client ${client}`,
      debit: ttc,
      credit: 0,
      vat: "",
      reference: ref,
    });
  }

  lines.push({
    date,
    journal: "VT",
    account: "706",
    label: `Prestation ${ref}`,
    debit: 0,
    credit: ht,
    vat: "",
    reference: ref,
  });

  if (vat > 0) {
    lines.push({
      date,
      journal: "VT",
      account: "44571",
      label: `TVA collectée ${ref}`,
      debit: 0,
      credit: vat,
      vat: formatFrenchAmount(vat),
      reference: ref,
    });
  }

  return lines;
}

export function buildSalesJournalCsv(
  invoices: InvoiceWithClientExport[],
  filters: InvoiceExportFilters,
): string {
  const filtered = filterInvoicesForExport(invoices, filters);
  const lines = filtered.flatMap(invoiceToJournalLines);

  return csvFileContent([
    buildCsvRow([...HEADERS]),
    ...lines.map((line) =>
      buildCsvRow([
        line.date,
        line.journal,
        line.account,
        line.label,
        formatFrenchAmount(line.debit),
        formatFrenchAmount(line.credit),
        line.vat,
        line.reference,
      ]),
    ),
  ]);
}

export function buildSalesJournalTableData(
  invoices: InvoiceWithClientExport[],
  filters: Filters,
): { headers: string[]; rows: string[][] } {
  const filtered = filterInvoicesForExport(invoices, filters);
  const lines = filtered.flatMap(invoiceToJournalLines);

  return {
    headers: [...HEADERS],
    rows: lines.map((line) => [
      line.date,
      line.journal,
      line.account,
      line.label,
      formatFrenchAmount(line.debit),
      formatFrenchAmount(line.credit),
      line.vat,
      line.reference,
    ]),
  };
}

export function journalExportFilename(format: "csv" | "xlsx"): string {
  const iso = new Date().toISOString().slice(0, 10);
  return `journal-ventes-${iso}.${format}`;
}
