import { Document, Page, Text, View } from "@react-pdf/renderer";

import { PdfPartyBlock } from "@/lib/pdf/components/pdf-party-block";
import { formatPdfMoney } from "@/lib/pdf/format";
import type { DepositReceiptPdfData } from "@/lib/pdf/deposit-receipt-types";
import { pdfStyles } from "@/lib/pdf/styles";

interface DepositReceiptPdfDocumentProps {
  data: DepositReceiptPdfData;
}

export function DepositReceiptPdfDocument({
  data,
}: DepositReceiptPdfDocumentProps) {
  return (
    <Document title="Reçu d'acompte" author="Factoni" subject={data.quoteNumber}>
      <Page size="A4" style={pdfStyles.receiptPage}>
        <View style={pdfStyles.receiptPageBody}>
          <View style={pdfStyles.accentBar} wrap={false} />

          <View style={pdfStyles.receiptHero} wrap={false}>
            <Text style={pdfStyles.receiptTitle}>Reçu d&apos;acompte</Text>
            <Text style={pdfStyles.receiptSubtitle}>
              Acompte reçu dans le cadre du devis {data.quoteNumber}
            </Text>
            <View style={pdfStyles.receiptPaidBadge}>
              <Text style={pdfStyles.receiptPaidBadgeText}>Réglé</Text>
            </View>
          </View>

          <View style={pdfStyles.receiptPartiesSection} wrap={false}>
            <View style={pdfStyles.partiesRow}>
              <PdfPartyBlock label="Émetteur" party={data.emitter} />
              <PdfPartyBlock label="Client" party={data.client} />
            </View>
          </View>

          <View style={pdfStyles.receiptSection} wrap={false}>
            <Text style={pdfStyles.receiptSectionTitle}>Détail acompte</Text>
          </View>

          <View style={pdfStyles.receiptMetaBlock}>
            <View style={pdfStyles.receiptMetaRow} wrap={false}>
              <Text style={pdfStyles.receiptMetaLabel}>Date de paiement</Text>
              <Text style={pdfStyles.receiptMetaValue}>{data.paidAt}</Text>
            </View>
            <View style={pdfStyles.receiptMetaRow} wrap={false}>
              <Text style={pdfStyles.receiptMetaLabel}>Montant acompte</Text>
              <Text
                style={[
                  pdfStyles.receiptMetaValue,
                  pdfStyles.receiptAmountValue,
                ]}
              >
                {formatPdfMoney(data.depositAmount)} {data.currency}
              </Text>
            </View>
            <View style={pdfStyles.receiptMetaRow} wrap={false}>
              <Text style={pdfStyles.receiptMetaLabel}>Référence devis</Text>
              <Text style={pdfStyles.receiptMetaValue}>{data.quoteNumber}</Text>
            </View>
          </View>

          {data.stripePaymentIntentId || data.stripeCheckoutSessionId ? (
            <View style={pdfStyles.receiptStripeRef} wrap={false}>
              <Text style={pdfStyles.receiptStripeRefLabel}>
                Référence Stripe
              </Text>
              <Text style={pdfStyles.receiptStripeRefValue}>
                {data.stripePaymentIntentId?.trim() ||
                  data.stripeCheckoutSessionId?.trim() ||
                  "—"}
              </Text>
            </View>
          ) : null}

          <Text style={pdfStyles.receiptLegalText}>
            Ce document atteste la réception d&apos;un acompte. Le solde restant
            fera l&apos;objet d&apos;une facture distincte.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
