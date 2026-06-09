import type { Database } from "@/types/database";

export type DocumentType = Database["public"]["Enums"]["document_type"];

export const DOCUMENT_TYPES = ["invoice", "quote"] as const satisfies DocumentType[];

export function isQuote(documentType: DocumentType): boolean {
  return documentType === "quote";
}

export function isInvoice(documentType: DocumentType): boolean {
  return documentType === "invoice";
}

/** Normalise le type stocké (défaut facture si absent). */
export function resolveDocumentType(
  value: DocumentType | null | undefined,
): DocumentType {
  return value === "quote" ? "quote" : "invoice";
}

export function isQuoteDocument(
  value: DocumentType | null | undefined,
): boolean {
  return resolveDocumentType(value) === "quote";
}

export function isInvoiceDocument(
  value: DocumentType | null | undefined,
): boolean {
  return resolveDocumentType(value) === "invoice";
}
