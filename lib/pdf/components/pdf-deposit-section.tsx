import { Text, View } from "@react-pdf/renderer";

import { formatPdfMoney } from "@/lib/pdf/format";
import { pdfStyles } from "@/lib/pdf/styles";
import type { InvoicePdfData } from "@/lib/pdf/types";

interface PdfDepositSectionProps {
  data: InvoicePdfData;
}

export function PdfDepositSection({ data }: PdfDepositSectionProps) {
  const deposit = data.deposit;
  if (!deposit) return null;

  return (
    <View style={pdfStyles.depositSection} wrap={false}>
      <Text style={pdfStyles.depositSectionTitle}>Acompte</Text>
      <View style={pdfStyles.depositRow}>
        <Text style={pdfStyles.depositLabel}>Acompte demandé</Text>
        <Text style={pdfStyles.depositValue}>{deposit.typeLabel}</Text>
      </View>
      <View style={pdfStyles.depositRow}>
        <Text style={pdfStyles.depositLabel}>Montant acompte</Text>
        <Text style={pdfStyles.depositValue}>
          {formatPdfMoney(deposit.depositAmount)}
        </Text>
      </View>
      <View style={pdfStyles.depositRow}>
        <Text style={pdfStyles.depositLabel}>Reste à payer après acompte</Text>
        <Text style={pdfStyles.depositValue}>
          {formatPdfMoney(deposit.remainingBalance)}
        </Text>
      </View>
      {deposit.status === "paid" ? (
        <View style={pdfStyles.depositPaidBadge}>
          <Text style={pdfStyles.depositPaidBadgeText}>
            Acompte payé
            {deposit.paidAt ? ` — ${deposit.paidAt}` : ""}
          </Text>
        </View>
      ) : (
        <View style={pdfStyles.depositRow}>
          <Text style={pdfStyles.depositLabel}>Statut</Text>
          <Text style={pdfStyles.depositValue}>Acompte demandé</Text>
        </View>
      )}
    </View>
  );
}
