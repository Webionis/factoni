import type { DocumentType } from "@/lib/documents/types";
import { formatIbanDisplay } from "@/lib/validations/bank";

export interface PdfBankDetails {
  accountHolder: string;
  bankName: string | null;
  iban: string;
  bic: string | null;
}

export interface CompanyBankSource {
  bank_account_holder?: string | null;
  bank_name?: string | null;
  bank_iban?: string | null;
  bank_bic?: string | null;
  bank_show_on_invoices?: boolean | null;
  bank_show_on_quotes?: boolean | null;
}

export function resolvePdfBankDetails(
  company: CompanyBankSource | null | undefined,
  documentKind: DocumentType,
): PdfBankDetails | null {
  if (!company?.bank_iban?.trim()) return null;

  const showOnInvoices = company.bank_show_on_invoices ?? true;
  const showOnQuotes = company.bank_show_on_quotes ?? false;

  if (documentKind === "invoice" && !showOnInvoices) return null;
  if (documentKind === "quote" && !showOnQuotes) return null;

  const accountHolder = company.bank_account_holder?.trim();
  if (!accountHolder) return null;

  return {
    accountHolder,
    bankName: company.bank_name?.trim() || null,
    iban: formatIbanDisplay(company.bank_iban.trim()),
    bic: company.bank_bic?.trim() || null,
  };
}

export function formatPdfBankDetailsBody(details: PdfBankDetails): string {
  const lines = [
    `Titulaire : ${details.accountHolder}`,
    details.bankName ? `Banque : ${details.bankName}` : null,
    `IBAN : ${details.iban}`,
    details.bic ? `BIC : ${details.bic}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}
