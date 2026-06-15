import {
  DocumentTypeCode,
  UnitCode,
  VatCategoryCode,
  type AllowanceChargeInput,
  type FacturXInvoiceInput,
  type InvoiceLineInput,
  type TradePartyInput,
  type VatBreakdownInput,
} from "@stackforge-eu/factur-x";

import type { VatRegime } from "@/lib/constants/vat";
import { roundMoney } from "@/lib/invoices/calculate";
import { isDisbursementLine } from "@/lib/invoices/item-nature";
import { addressLinesToFacturXAddress } from "@/lib/factur-x/address";
import type { InvoicePdfData, PdfInvoiceLine, PdfParty } from "@/lib/pdf/types";

function partyToTradeParty(party: PdfParty): TradePartyInput {
  const taxRegistrations = party.vatNumber
    ? [{ id: party.vatNumber, schemeId: "VA" as const }]
    : undefined;

  const legalOrganization =
    party.siret != null
      ? { id: party.siret, schemeID: "0009" }
      : party.siren != null
        ? { id: party.siren, schemeID: "0002" }
        : undefined;

  return {
    name: party.name,
    address: addressLinesToFacturXAddress(party.addressLines),
    contact:
      party.email || party.phone
        ? {
            email: party.email ?? undefined,
            phone: party.phone ?? undefined,
          }
        : undefined,
    taxRegistrations,
    legalOrganization,
  };
}

function lineVatCategory(
  line: PdfInvoiceLine,
  vatRegime: VatRegime,
): VatCategoryCode {
  if (isDisbursementLine(line.itemNature)) {
    return VatCategoryCode.OUTSIDE_SCOPE;
  }
  if (vatRegime === "franchise") {
    return VatCategoryCode.EXEMPT;
  }
  if (line.vatRate === 0) {
    return VatCategoryCode.ZERO_RATED;
  }
  return VatCategoryCode.STANDARD_RATE;
}

function mapLines(
  lines: PdfInvoiceLine[],
  vatRegime: VatRegime,
): InvoiceLineInput[] {
  return lines.map((line, index) => ({
    id: String(index + 1),
    name: line.description,
    description: line.itemNatureLabel,
    quantity: line.quantity,
    unitCode: UnitCode.UNIT,
    unitPrice: line.unitPriceHt,
    lineTotal: line.lineTotalHt,
    vatCategoryCode: lineVatCategory(line, vatRegime),
    vatRatePercent: lineVatRatePercent(line, vatRegime),
  }));
}

function lineVatRatePercent(line: PdfInvoiceLine, vatRegime: VatRegime): number {
  if (isDisbursementLine(line.itemNature) || vatRegime === "franchise") {
    return 0;
  }
  return line.vatRate;
}

function sumLineTotalHt(lines: PdfInvoiceLine[]): number {
  return roundMoney(lines.reduce((sum, line) => sum + line.lineTotalHt, 0));
}

function buildAllowances(data: InvoicePdfData): AllowanceChargeInput[] {
  const hasDiscount =
    (data.discountPercent != null && data.discountPercent > 0) ||
    (data.discountAmount != null && data.discountAmount > 0);

  if (!hasDiscount) return [];

  const amount = roundMoney(Math.max(0, data.linesSubtotalHt - data.totalHt));
  if (amount <= 0) return [];

  return [
    {
      isCharge: false,
      amount,
      reason: data.discountPercent
        ? `Remise ${data.discountPercent} %`
        : "Remise",
      vatCategoryCode: VatCategoryCode.STANDARD_RATE,
      vatRatePercent:
        data.vatRegime === "franchise"
          ? 0
          : (data.vatBreakdown[0]?.rate ?? 20),
    },
  ];
}

function sumVatBreakdownTaxAmount(rows: VatBreakdownInput[]): number {
  return roundMoney(rows.reduce((sum, row) => sum + row.taxAmount, 0));
}

function adjustRevenueVatBreakdownForDiscount(
  rows: VatBreakdownInput[],
  targetTaxTotal: number,
): VatBreakdownInput[] {
  const currentTaxTotal = sumVatBreakdownTaxAmount(rows);
  if (currentTaxTotal <= 0 || currentTaxTotal === targetTaxTotal) {
    return rows;
  }

  const factor = targetTaxTotal / currentTaxTotal;
  return rows.map((row) => ({
    ...row,
    taxableAmount: roundMoney(row.taxableAmount * factor),
    taxAmount: roundMoney(row.taxAmount * factor),
  }));
}

function buildVatBreakdown(
  data: InvoicePdfData,
  vatRegime: VatRegime,
): VatBreakdownInput[] {
  const breakdown: VatBreakdownInput[] = [];

  if (vatRegime === "franchise") {
    breakdown.push({
      categoryCode: VatCategoryCode.EXEMPT,
      ratePercent: 0,
      taxableAmount: data.totalHt,
      taxAmount: 0,
    });
  } else if (data.vatBreakdown.length > 0) {
    const revenueRows = data.vatBreakdown.map((row) => ({
      categoryCode:
        row.rate === 0 ? VatCategoryCode.ZERO_RATED : VatCategoryCode.STANDARD_RATE,
      ratePercent: row.rate,
      taxableAmount: row.baseHt,
      taxAmount: row.vatAmount,
    }));
    breakdown.push(
      ...adjustRevenueVatBreakdownForDiscount(revenueRows, roundMoney(data.totalVat)),
    );
  } else {
    breakdown.push({
      categoryCode: VatCategoryCode.STANDARD_RATE,
      ratePercent: data.totalHt > 0 ? (data.totalVat / data.totalHt) * 100 : 0,
      taxableAmount: data.totalHt,
      taxAmount: data.totalVat,
    });
  }

  const disbursementHt = sumLineTotalHt(
    data.lines.filter((line) => isDisbursementLine(line.itemNature)),
  );
  if (disbursementHt > 0) {
    breakdown.push({
      categoryCode: VatCategoryCode.OUTSIDE_SCOPE,
      ratePercent: 0,
      taxableAmount: disbursementHt,
      taxAmount: 0,
    });
  }

  return breakdown;
}

function buildTotals(data: InvoicePdfData): FacturXInvoiceInput["totals"] {
  const lineTotal = sumLineTotalHt(data.lines);
  const allowanceTotal = roundMoney(
    Math.max(0, data.linesSubtotalHt - data.totalHt),
  );
  const taxBasisTotal = roundMoney(lineTotal - allowanceTotal);
  const taxTotal = roundMoney(data.totalVat);
  const grandTotal = roundMoney(taxBasisTotal + taxTotal);

  return {
    lineTotal,
    allowanceTotal: allowanceTotal > 0 ? allowanceTotal : undefined,
    taxBasisTotal,
    taxTotal,
    grandTotal,
    duePayableAmount: roundMoney(data.totalTtc),
    currency: "EUR",
  };
}

function resolveDocumentId(data: InvoicePdfData): string {
  if (data.invoiceNumber?.trim()) {
    return data.invoiceNumber.trim();
  }
  return data.isDraft ? "BROUILLON" : "FACTURE";
}

function resolveDocumentTypeCode(
  data: InvoicePdfData,
): DocumentTypeCode {
  if (data.documentKind === "quote") {
    return DocumentTypeCode.PROFORMA_INVOICE;
  }
  return DocumentTypeCode.COMMERCIAL_INVOICE;
}

export function mapInvoicePdfDataToFacturXInput(
  data: InvoicePdfData,
): FacturXInvoiceInput {
  const lines = mapLines(data.lines, data.vatRegime);
  const allowancesCharges = buildAllowances(data);
  const totals = buildTotals(data);

  const notes = [
    data.notes?.trim(),
    data.paymentTerms?.trim(),
    data.legalMentions?.trim(),
  ]
    .filter(Boolean)
    .map((content) => ({ content: content! }));

  return {
    document: {
      id: resolveDocumentId(data),
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      typeCode: resolveDocumentTypeCode(data),
      notes: notes.length > 0 ? notes : undefined,
    },
    seller: partyToTradeParty(data.emitter),
    buyer: partyToTradeParty(data.client),
    lines,
    allowancesCharges:
      allowancesCharges.length > 0 ? allowancesCharges : undefined,
    delivery: {
      date: data.issueDate,
    },
    payment: {
      dueDate: data.dueDate,
      termsDescription: data.paymentTerms ?? undefined,
    },
    totals,
    vatBreakdown: buildVatBreakdown(data, data.vatRegime),
  };
}
