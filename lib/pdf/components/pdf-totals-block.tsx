import { Text, View } from "@react-pdf/renderer";

import { formatPdfMoney } from "@/lib/pdf/format";
import { estimateTotalsBoxMinPresence } from "@/lib/pdf/layout";
import { pdfStyles } from "@/lib/pdf/styles";
import type { InvoicePdfData } from "@/lib/pdf/types";
import { buildPdfVatTotalLabel } from "@/lib/pdf/vat-total-label";

interface PdfTotalsBlockProps {
  data: InvoicePdfData;
}

export function PdfTotalsBlock({ data }: PdfTotalsBlockProps) {
  const hasDiscount =
    (data.discountPercent != null && data.discountPercent > 0) ||
    (data.discountAmount != null && data.discountAmount > 0);

  const discountHtAmount = hasDiscount
    ? data.linesSubtotalHt - data.totalHt
    : 0;

  const hasDisbursements = data.disbursementTtc > 0;
  const vatLabel = buildPdfVatTotalLabel(data.vatRegime, data.vatBreakdown);
  const totalsMinPresence = estimateTotalsBoxMinPresence(data);

  return (
    <View style={pdfStyles.totalsBlockRoot}>
      <View style={pdfStyles.totalsSection}>
        <View
          wrap={false}
          minPresenceAhead={totalsMinPresence}
          style={pdfStyles.totalsBox}
        >
          <View style={pdfStyles.totalsHeader}>
            <Text style={pdfStyles.totalsHeaderText}>Récapitulatif</Text>
          </View>

          <View style={pdfStyles.totalsBody}>
            {hasDiscount ? (
              <>
                <View style={pdfStyles.totalRow}>
                  <Text style={pdfStyles.totalLabelMuted}>
                    Sous-total prestations HT
                  </Text>
                  <Text style={pdfStyles.totalValue}>
                    {formatPdfMoney(data.linesSubtotalHt)}
                  </Text>
                </View>
                <View style={pdfStyles.totalRow}>
                  <Text style={pdfStyles.totalLabelMuted}>
                    Remise
                    {data.discountPercent ? ` (${data.discountPercent} %)` : ""}
                  </Text>
                  <Text style={pdfStyles.totalValue}>
                    −{formatPdfMoney(discountHtAmount)}
                  </Text>
                </View>
                <View style={pdfStyles.totalDivider} />
              </>
            ) : null}

            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Total prestations HT</Text>
              <Text style={pdfStyles.totalValue}>
                {formatPdfMoney(data.totalHt)}
              </Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={[pdfStyles.totalLabel, pdfStyles.totalLabelFlex]}>
                {vatLabel}
              </Text>
              <Text style={pdfStyles.totalValue}>
                {formatPdfMoney(data.totalVat)}
              </Text>
            </View>
            {hasDisbursements ? (
              <View style={pdfStyles.totalRow}>
                <Text style={pdfStyles.totalLabelMuted}>
                  Frais de débours refacturés
                </Text>
                <Text style={pdfStyles.totalValue}>
                  {formatPdfMoney(data.disbursementTtc)}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={[pdfStyles.totalsTtcBar, pdfStyles.totalsTtcBarRoundedBottom]}>
            <Text style={pdfStyles.totalTtcLabel}>
              {hasDisbursements ? "Total TTC à payer" : "Total TTC"}
            </Text>
            <Text style={pdfStyles.totalTtcValue}>
              {formatPdfMoney(data.totalTtc)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
