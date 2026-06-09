import { Document, Page, Text, View } from "@react-pdf/renderer";

import { PdfPartyBlock } from "@/lib/pdf/components/pdf-party-block";
import { formatPdfMoney } from "@/lib/pdf/format";
import {
  RECEIPT_CLOSING_MIN_PRESENCE,
  RECEIPT_PARTIES_MIN_PRESENCE,
} from "@/lib/pdf/receipt-layout";
import type { PaymentReceiptPdfData } from "@/lib/pdf/receipt-types";
import { pdfStyles } from "@/lib/pdf/styles";

interface PaymentReceiptPdfDocumentProps {
  data: PaymentReceiptPdfData;
}

function ReceiptMetaRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={pdfStyles.receiptMetaRow} wrap={false}>
      <Text style={pdfStyles.receiptMetaLabel}>{label}</Text>
      <Text
        style={
          highlight
            ? [pdfStyles.receiptMetaValue, pdfStyles.receiptAmountValue]
            : pdfStyles.receiptMetaValue
        }
      >
        {value}
      </Text>
    </View>
  );
}

function StripeReference({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  const display = value?.trim() ? value.trim() : "Référence non disponible";

  return (
    <View style={pdfStyles.receiptStripeRef} wrap={false}>
      <Text style={pdfStyles.receiptStripeRefLabel}>{label}</Text>
      <Text style={pdfStyles.receiptStripeRefValue}>{display}</Text>
    </View>
  );
}

export function PaymentReceiptPdfDocument({
  data,
}: PaymentReceiptPdfDocumentProps) {
  return (
    <Document
      title="Reçu de paiement"
      author="Factoni"
      subject={data.invoiceNumber}
    >
      <Page size="A4" style={pdfStyles.receiptPage}>
        <View style={pdfStyles.receiptPageBody}>
          <View style={pdfStyles.accentBar} wrap={false} />

          <View style={pdfStyles.receiptHero} wrap={false}>
            <Text style={pdfStyles.receiptTitle}>Reçu de paiement</Text>
            <Text style={pdfStyles.receiptSubtitle}>
              Facture réglée avec succès
            </Text>
            <View style={pdfStyles.receiptPaidBadge}>
              <Text style={pdfStyles.receiptPaidBadgeText}>Payée</Text>
            </View>
          </View>

          <View style={pdfStyles.receiptSection} wrap={false}>
            <Text style={pdfStyles.receiptSectionTitle}>
              Synthèse du paiement
            </Text>
            <View style={pdfStyles.receiptHighlightBlock}>
              <ReceiptMetaRow
                label="Montant payé"
                value={formatPdfMoney(data.totalTtc)}
                highlight
              />
              <View style={pdfStyles.receiptMetaDivider} />
              <ReceiptMetaRow label="Date de paiement" value={data.paidAt} />
              <ReceiptMetaRow
                label="Moyen de paiement"
                value={data.paymentMethod}
              />
              <ReceiptMetaRow label="Devise" value={data.currency} />
            </View>
          </View>

          <View style={pdfStyles.receiptSection} wrap={false}>
            <Text style={pdfStyles.receiptSectionTitle}>Facture associée</Text>
            <View style={pdfStyles.receiptMetaBlock}>
              <ReceiptMetaRow label="Numéro" value={data.invoiceNumber} />
              <ReceiptMetaRow label="Date d'émission" value={data.issueDate} />
              <ReceiptMetaRow label="Date d'échéance" value={data.dueDate} />
              <ReceiptMetaRow label="Statut" value="Payée" />
            </View>
          </View>

          <View
            style={pdfStyles.receiptPartiesSection}
            wrap={false}
            minPresenceAhead={RECEIPT_PARTIES_MIN_PRESENCE}
          >
            <View style={pdfStyles.partiesRow}>
              <PdfPartyBlock label="Client" party={data.client} keepTogether />
              <PdfPartyBlock
                label="Professionnel"
                party={data.emitter}
                keepTogether
              />
            </View>
          </View>

          <View
            style={pdfStyles.receiptClosingBlock}
            wrap={false}
            minPresenceAhead={RECEIPT_CLOSING_MIN_PRESENCE}
          >
            <View style={pdfStyles.receiptTechSection}>
              <Text style={pdfStyles.receiptTechTitle}>
                Références techniques
              </Text>
              <View style={pdfStyles.receiptTechBlock}>
                <StripeReference
                  label="Référence paiement Stripe"
                  value={data.stripePaymentIntentId}
                />
                <View style={pdfStyles.receiptTechDivider} />
                <StripeReference
                  label="Référence session Stripe"
                  value={data.stripeCheckoutSessionId}
                />
              </View>
            </View>

            <View style={pdfStyles.receiptLegalBox}>
              <Text style={pdfStyles.receiptLegalText}>
                Ce reçu confirme l'enregistrement du paiement de la facture
                indiquée ci-dessus. Il ne remplace pas la facture originale.
              </Text>
            </View>

            <View style={pdfStyles.receiptFooterInline}>
              <Text style={pdfStyles.receiptFooterText}>
                Document généré par Factoni
              </Text>
              <Text style={pdfStyles.receiptFooterText}>
                Généré le {data.generatedAt}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
