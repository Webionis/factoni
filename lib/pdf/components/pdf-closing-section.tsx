import { View } from "@react-pdf/renderer";

import { PdfAcceptanceSection } from "@/lib/pdf/components/pdf-acceptance-section";
import { PdfDepositSection } from "@/lib/pdf/components/pdf-deposit-section";
import { PdfDocumentFooter } from "@/lib/pdf/components/pdf-document-footer";
import { PdfTotalsBlock } from "@/lib/pdf/components/pdf-totals-block";
import { pdfStyles } from "@/lib/pdf/styles";
import type { InvoicePdfData } from "@/lib/pdf/types";

interface PdfClosingSectionProps {
  data: InvoicePdfData;
}

/**
 * Bloc de clôture adaptatif :
 * - récapitulatif indivisible (wrap={false} sur totalsBox uniquement)
 * - conditions / notes / mentions en flux naturel sous le récap si la place reste
 */
export function PdfClosingSection({ data }: PdfClosingSectionProps) {
  return (
    <View style={pdfStyles.closingSection}>
      <PdfTotalsBlock data={data} />
      <PdfDepositSection data={data} />
      <PdfAcceptanceSection data={data} />
      <PdfDocumentFooter data={data} />
    </View>
  );
}
