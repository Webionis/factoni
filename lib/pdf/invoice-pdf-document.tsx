import {
  Document,
  Image,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";

import { PdfClosingSection } from "@/lib/pdf/components/pdf-closing-section";
import { PdfLinesTable } from "@/lib/pdf/components/pdf-lines-table";
import { PdfPartyBlock } from "@/lib/pdf/components/pdf-party-block";
import { formatPdfDate } from "@/lib/pdf/format";
import { pdfStyles } from "@/lib/pdf/styles";
import { isQuote } from "@/lib/documents/types";
import { getPdfStatusLabel } from "@/lib/pdf/resolve-pdf-status";
import type { InvoicePdfData } from "@/lib/pdf/types";

interface InvoicePdfDocumentProps {
  data: InvoicePdfData;
}

export function InvoicePdfDocument({ data }: InvoicePdfDocumentProps) {
  const numberDisplay = data.invoiceNumber
    ? data.invoiceNumber
    : "Sans numéro légal (brouillon)";

  const headerEyebrow = data.isDraft
    ? "Brouillon"
    : isQuote(data.documentKind)
      ? "Devis"
      : "Facture";

  const statusLabel = getPdfStatusLabel(data.status, data.documentKind);

  const dueDateLabel = isQuote(data.documentKind) ? "Validité" : "Échéance";

  return (
    <Document
      title={data.documentTitle}
      author="Factoni"
      subject={numberDisplay}
    >
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.pageBody}>
          <View style={pdfStyles.accentBar} />

          {data.isCancelled ? (
            <View style={pdfStyles.cancelledBanner}>
              <Text style={pdfStyles.cancelledText}>
                Facture annulée — {getPdfStatusLabel("cancelled", data.documentKind)}
              </Text>
            </View>
          ) : null}

          {data.isDraft ? (
            <View style={pdfStyles.draftBanner}>
              <Text style={pdfStyles.draftBannerTitle}>Brouillon</Text>
              <Text style={pdfStyles.draftBannerText}>
                Aperçu interne — document non définitif. Le numéro légal sera
                attribué à la validation.
                {data.dataSource === "draft_fallback"
                  ? " Coordonnées émetteur/client non figées."
                  : ""}
              </Text>
            </View>
          ) : null}

          {data.isDraft ? (
            <View style={pdfStyles.draftWatermark} fixed>
              <Text style={pdfStyles.draftWatermarkText}>BROUILLON</Text>
            </View>
          ) : null}

          <View style={pdfStyles.headerRow}>
            <View style={pdfStyles.headerLeft}>
              {data.logoUrl ? (
                <View style={pdfStyles.logoWrap}>
                  <Image src={data.logoUrl} style={pdfStyles.logo} />
                </View>
              ) : (
                <Text style={pdfStyles.headerCompanyName}>{data.emitter.name}</Text>
              )}
            </View>

            <View style={pdfStyles.headerRight}>
              <Text style={pdfStyles.invoiceEyebrow}>{headerEyebrow}</Text>
              <Text style={pdfStyles.invoiceNumber}>{numberDisplay}</Text>

              <View style={pdfStyles.metaBlock}>
                <View style={pdfStyles.metaRow}>
                  <Text style={pdfStyles.metaLabel}>Émission</Text>
                  <Text style={pdfStyles.metaValue}>
                    {formatPdfDate(data.issueDate)}
                  </Text>
                </View>
                <View style={pdfStyles.metaRow}>
                  <Text style={pdfStyles.metaLabel}>{dueDateLabel}</Text>
                  <Text style={pdfStyles.metaValue}>
                    {formatPdfDate(data.dueDate)}
                  </Text>
                </View>
                <View style={pdfStyles.metaRow}>
                  <Text style={pdfStyles.metaLabel}>Statut</Text>
                  <Text style={pdfStyles.metaValue}>{statusLabel}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={pdfStyles.partiesRow}>
            <PdfPartyBlock label="Émetteur" party={data.emitter} />
            <PdfPartyBlock
              label={data.interventionLocation ? "Client / Facturation" : "Client"}
              party={data.client}
              interventionLocation={data.interventionLocation}
            />
          </View>

          <PdfLinesTable lines={data.lines} />
          <PdfClosingSection data={data} />
        </View>

        <View style={pdfStyles.pageFooterFixed} fixed>
          <Text style={pdfStyles.pageNumberText}>Factoni</Text>
          <Text
            style={pdfStyles.pageNumberText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
