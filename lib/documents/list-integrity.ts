import {
  isInvoiceDocument,
  isQuoteDocument,
  type DocumentType,
} from "@/lib/documents/types";

type DocumentListRow = {
  id: string;
  document_type: DocumentType | null;
  invoice_number: string | null;
};

/** Garde-fou liste devis : uniquement document_type = quote. */
export function filterQuoteListRows<T extends DocumentListRow>(rows: T[]): T[] {
  return rows.filter((row) => isQuoteDocument(row.document_type));
}

/** Garde-fou liste factures : uniquement document_type = invoice. */
export function filterInvoiceListRows<T extends DocumentListRow>(
  rows: T[],
): T[] {
  return rows.filter((row) => isInvoiceDocument(row.document_type));
}

/** Vérifie l'intégrité des listes (dev / tests). */
export function assertQuoteListIntegrity(rows: DocumentListRow[]): void {
  for (const row of rows) {
    if (!isQuoteDocument(row.document_type)) {
      throw new Error(
        `Liste devis : document ${row.id} a document_type=${row.document_type}`,
      );
    }
    if (row.invoice_number?.startsWith("FF-")) {
      throw new Error(
        `Liste devis : document ${row.id} a un numéro facture ${row.invoice_number}`,
      );
    }
  }
}

export function assertInvoiceListIntegrity(rows: DocumentListRow[]): void {
  for (const row of rows) {
    if (!isInvoiceDocument(row.document_type)) {
      throw new Error(
        `Liste factures : document ${row.id} a document_type=${row.document_type}`,
      );
    }
    if (row.invoice_number?.startsWith("DV-")) {
      throw new Error(
        `Liste factures : document ${row.id} a un numéro devis ${row.invoice_number}`,
      );
    }
  }
}
