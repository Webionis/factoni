import { Image, Text, View } from "@react-pdf/renderer";

import { formatPdfDateTime } from "@/lib/pdf/format";
import { pdfStyles } from "@/lib/pdf/styles";
import type { InvoicePdfData } from "@/lib/pdf/types";

interface PdfAcceptanceSectionProps {
  data: InvoicePdfData;
}

export function PdfAcceptanceSection({ data }: PdfAcceptanceSectionProps) {
  if (!data.acceptance) return null;

  const acceptedDate = formatPdfDateTime(data.acceptance.acceptedAt);

  return (
    <View style={pdfStyles.acceptanceSection} wrap={false}>
      <Text style={pdfStyles.acceptanceTitle}>Bon pour accord</Text>
      <View style={pdfStyles.acceptanceDivider} />
      <View style={pdfStyles.acceptanceRow}>
        <Text style={pdfStyles.acceptanceLabel}>Nom</Text>
        <Text style={pdfStyles.acceptanceValue}>{data.acceptance.acceptedByName}</Text>
      </View>
      <View style={pdfStyles.acceptanceRow}>
        <Text style={pdfStyles.acceptanceLabel}>Date</Text>
        <Text style={pdfStyles.acceptanceValue}>{acceptedDate}</Text>
      </View>
      {data.acceptance.signatureUrl ? (
        <View style={pdfStyles.acceptanceSignatureWrap}>
          <Text style={pdfStyles.acceptanceLabel}>Signature</Text>
          <Image
            src={data.acceptance.signatureUrl}
            style={pdfStyles.acceptanceSignatureImage}
          />
        </View>
      ) : null}
    </View>
  );
}
