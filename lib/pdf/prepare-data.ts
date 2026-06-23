import type { SupabaseClient } from "@supabase/supabase-js";

import { getCompanyForUser } from "@/lib/auth/profile";
import { getClientById } from "@/lib/data/clients";
import { getActiveClientLocationById } from "@/lib/data/client-locations";
import {
  buildClientLocationSnapshot,
  clientLocationToPdfParty,
  parseClientLocationSnapshot,
} from "@/lib/invoices/location-snapshot";
import type { InvoiceDetail } from "@/lib/data/invoices";
import { invoiceLineItemNatureLabel, isDisbursementLine } from "@/lib/invoices/item-nature";
import {
  parseClientSnapshot,
  parseCompanySnapshot,
} from "@/lib/pdf/parse-snapshots";
import type { InvoicePdfData, PdfInvoiceLine, PdfVatBreakdownRow } from "@/lib/pdf/types";
import { buildInvoicePdfFilename } from "@/lib/pdf/filenames";
import { resolvePdfBankDetails } from "@/lib/pdf/bank-details";
import {
  formatDepositTypeLabel,
  normalizeQuoteDepositStatus,
} from "@/lib/quotes/deposit";
import { formatPdfDateTime } from "@/lib/pdf/format";
import { resolvePdfDocumentStatus } from "@/lib/pdf/resolve-pdf-status";
import { FRANCHISE_MENTION } from "@/lib/constants/vat";
import { logServerError } from "@/lib/logger";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { COMPANY_LOGOS_BUCKET } from "@/lib/storage/company-logo";
import { SIGNATURES_BUCKET } from "@/lib/storage/signatures";
import type { Database } from "@/types/database";
import type { PdfParty } from "@/lib/pdf/types";

function partyFromLiveClient(
  client: Database["public"]["Tables"]["clients"]["Row"],
): PdfParty {
  const displayName =
    client.client_type === "company" && client.company_name
      ? client.company_name
      : client.name;
  const lines: string[] = [];
  if (client.address_line1) lines.push(client.address_line1);
  if (client.address_line2) lines.push(client.address_line2);
  const cityLine = [client.postal_code, client.city].filter(Boolean).join(" ");
  if (cityLine) lines.push(cityLine);

  return {
    name: displayName,
    subtitle:
      client.client_type === "company" && client.company_name
        ? client.name
        : null,
    addressLines: lines,
    email: client.email,
    phone: client.phone,
    siren: client.siren,
    siret: client.siret,
  };
}

function partyFromLiveCompany(
  company: Database["public"]["Tables"]["companies"]["Row"],
): PdfParty {
  const lines: string[] = [];
  if (company.address_line1) lines.push(company.address_line1);
  if (company.address_line2) lines.push(company.address_line2);
  const cityLine = [company.postal_code, company.city].filter(Boolean).join(" ");
  if (cityLine) lines.push(cityLine);

  return {
    name: company.trade_name,
    subtitle:
      company.legal_name !== company.trade_name ? company.legal_name : null,
    addressLines: lines,
    email: company.email,
    phone: company.phone,
    siren: company.siren,
    siret: company.siret,
    vatNumber: company.vat_number,
  };
}

function buildVatBreakdown(lines: PdfInvoiceLine[]): PdfVatBreakdownRow[] {
  const map = new Map<number, { baseHt: number; vatAmount: number }>();
  for (const line of lines) {
    if (isDisbursementLine(line.itemNature)) continue;
    const existing = map.get(line.vatRate) ?? { baseHt: 0, vatAmount: 0 };
    existing.baseHt += line.lineTotalHt;
    existing.vatAmount += line.lineVat;
    map.set(line.vatRate, existing);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([rate, amounts]) => ({
      rate,
      baseHt: roundStored(amounts.baseHt),
      vatAmount: roundStored(amounts.vatAmount),
    }));
}

function roundStored(n: number): number {
  return Math.round(n * 100) / 100;
}

async function resolveSignatureUrl(
  signaturePath: string | null,
): Promise<string | null> {
  if (!signaturePath || !isAdminClientConfigured()) return null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from(SIGNATURES_BUCKET)
      .createSignedUrl(signaturePath, 300);

    if (error) {
      logServerError("resolveSignatureUrl", error, { signaturePath });
      return null;
    }

    return data?.signedUrl ?? null;
  } catch (error) {
    logServerError("resolveSignatureUrl", error, { signaturePath });
    return null;
  }
}

async function resolveLogoUrl(
  supabase: SupabaseClient<Database>,
  logoPath: string | null,
): Promise<string | null> {
  if (!logoPath) return null;
  const { data, error } = await supabase.storage
    .from(COMPANY_LOGOS_BUCKET)
    .createSignedUrl(logoPath, 300);
  if (error) {
    logServerError("resolveLogoUrl", error, { logoPath });
    return null;
  }
  return data?.signedUrl ?? null;
}

/**
 * Prépare les données PDF à partir des champs stockés.
 * Snapshots prioritaires ; pour les brouillons sans snapshots, en-têtes
 * reconstruits à la volée (non persistés) — lignes et totaux toujours stockés.
 */
export async function prepareInvoicePdfData(
  invoice: InvoiceDetail,
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<InvoicePdfData> {
  const lines: PdfInvoiceLine[] = invoice.invoice_lines.map((line) => ({
    description: line.description,
    itemNature: line.item_nature ?? "service",
    itemNatureLabel: invoiceLineItemNatureLabel(line.item_nature),
    quantity: Number(line.quantity),
    unitPriceHt: Number(line.unit_price_ht),
    vatRate: Number(line.vat_rate),
    lineTotalHt: Number(line.line_total_ht),
    lineVat: Number(line.line_vat),
    lineTotalTtc: Number(line.line_total_ttc),
  }));

  const revenueLines = lines.filter((line) => !isDisbursementLine(line.itemNature));

  const linesSubtotalHt = roundStored(
    revenueLines.reduce((s, l) => s + l.lineTotalHt, 0),
  );
  const linesSubtotalVat = roundStored(
    revenueLines.reduce((s, l) => s + l.lineVat, 0),
  );
  const disbursementTtc =
    invoice.disbursement_total_ttc != null
      ? Number(invoice.disbursement_total_ttc)
      : roundStored(
          lines
            .filter((line) => isDisbursementLine(line.itemNature))
            .reduce((s, l) => s + l.lineTotalTtc, 0),
        );

  let dataSource: InvoicePdfData["dataSource"] = "snapshots";
  let emitter: PdfParty;
  let client: PdfParty;
  let vatRegime: InvoicePdfData["vatRegime"] = "standard";
  let legalMentions: string | null = null;
  let logoPath: string | null = null;
  let bankSource: Parameters<typeof resolvePdfBankDetails>[0] = null;

  const parsedCompany = parseCompanySnapshot(invoice.company_snapshot);
  const parsedClient = parseClientSnapshot(invoice.client_snapshot);

  if (parsedCompany && parsedClient) {
    emitter = parsedCompany.party;
    client = parsedClient;
    vatRegime = parsedCompany.vatRegime;
    legalMentions = parsedCompany.legalMentions;
    logoPath = parsedCompany.logoPath;
    bankSource = parsedCompany;
  } else {
    dataSource = "draft_fallback";
    const company = await getCompanyForUser(supabase, userId);
    const clientRow = await getClientById(supabase, invoice.client_id);

    if (!company || !clientRow) {
      throw new Error("Données émetteur ou client manquantes pour le PDF");
    }

    emitter = partyFromLiveCompany(company);
    client = partyFromLiveClient(clientRow);
    vatRegime = company.vat_regime;
    legalMentions =
      company.legal_mentions ??
      (vatRegime === "franchise" ? FRANCHISE_MENTION : null);
    logoPath = company.logo_path;
    bankSource = company;
  }

  let interventionLocation: PdfParty | null = null;
  const parsedLocation = parseClientLocationSnapshot(
    invoice.client_location_snapshot,
  );
  if (parsedLocation) {
    interventionLocation = clientLocationToPdfParty(parsedLocation);
  } else if (invoice.client_location_id) {
    const liveLocation = await getActiveClientLocationById(
      supabase,
      invoice.client_location_id,
      userId,
    );
    if (liveLocation) {
      const snapshot = parseClientLocationSnapshot(
        buildClientLocationSnapshot(liveLocation),
      );
      if (snapshot) {
        interventionLocation = clientLocationToPdfParty(snapshot);
      }
    }
  }

  const logoUrl = await resolveLogoUrl(supabase, logoPath);
  const signatureUrl = await resolveSignatureUrl(invoice.accepted_signature_url);

  const isQuote = invoice.document_type === "quote";
  const pdfStatus = resolvePdfDocumentStatus(invoice);
  const bankDetails = resolvePdfBankDetails(bankSource, invoice.document_type);
  const acceptance =
    isQuote && invoice.accepted_at && invoice.accepted_by_name
      ? {
          acceptedByName: invoice.accepted_by_name,
          acceptedAt: invoice.accepted_at,
          signatureUrl,
        }
      : undefined;

  const depositStatus = normalizeQuoteDepositStatus(invoice.quote_deposit_status);
  const deposit =
    isQuote &&
    depositStatus !== "none" &&
    invoice.quote_deposit_type &&
    invoice.quote_deposit_value != null &&
    invoice.quote_deposit_amount != null
      ? {
          typeLabel: formatDepositTypeLabel(
            invoice.quote_deposit_type,
            Number(invoice.quote_deposit_value),
          ),
          depositAmount: Number(invoice.quote_deposit_amount),
          remainingBalance:
            invoice.remaining_balance_amount != null
              ? Number(invoice.remaining_balance_amount)
              : Number(invoice.total_ttc) - Number(invoice.quote_deposit_amount),
          status: depositStatus === "paid" ? ("paid" as const) : ("requested" as const),
          paidAt: invoice.quote_deposit_paid_at
            ? formatPdfDateTime(invoice.quote_deposit_paid_at)
            : null,
        }
      : undefined;

  const filename = buildInvoicePdfFilename(
    invoice.invoice_number,
    invoice.id,
    isQuote ? "quote" : "invoice",
  );

  return {
    filename,
    documentKind: invoice.document_type,
    documentTitle: isQuote
      ? invoice.invoice_number
        ? "DEVIS"
        : "BROUILLON DE DEVIS"
      : invoice.invoice_number
        ? "FACTURE"
        : "BROUILLON DE FACTURE",
    invoiceNumber: invoice.invoice_number,
    status: pdfStatus,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    paymentTerms: invoice.payment_terms,
    notes: invoice.notes,
    bankDetails,
    emitter,
    client,
    interventionLocation,
    lines,
    totalHt: Number(invoice.total_ht),
    totalVat: Number(invoice.total_vat),
    totalTtc: Number(invoice.total_ttc),
    disbursementTtc,
    linesSubtotalHt,
    linesSubtotalVat,
    discountPercent: invoice.discount_percent,
    discountAmount: invoice.discount_amount,
    vatRegime,
    legalMentions,
    vatBreakdown: buildVatBreakdown(lines),
    logoUrl,
    isDraft: invoice.status === "draft",
    isCancelled: invoice.status === "cancelled",
    dataSource,
    acceptance,
    deposit,
  };
}
