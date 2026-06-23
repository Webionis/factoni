import { Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { ReactNode } from "react";

import { pdfStyles } from "@/lib/pdf/styles";
import { formatPdfBankDetailsBody } from "@/lib/pdf/bank-details";
import type { InvoicePdfData } from "@/lib/pdf/types";

interface PdfDocumentFooterProps {
  data: Pick<
    InvoicePdfData,
    "paymentTerms" | "notes" | "legalMentions" | "bankDetails"
  >;
}

function FooterBlock({
  style,
  title,
  body,
}: {
  style?: Style;
  title: string;
  body: string;
}) {
  return (
    <View style={style}>
      <Text style={pdfStyles.footerTitle}>{title}</Text>
      <Text style={pdfStyles.footerText}>{body}</Text>
    </View>
  );
}

/** Footer métier sous le récap — pagination naturelle (notes longues peuvent continuer). */
export function PdfDocumentFooter({ data }: PdfDocumentFooterProps) {
  const blocks: { key: string; node: ReactNode }[] = [];

  if (data.bankDetails) {
    blocks.push({
      key: "bank",
      node: (
        <FooterBlock
          title="Coordonnées bancaires"
          body={formatPdfBankDetailsBody(data.bankDetails)}
        />
      ),
    });
  }

  if (data.paymentTerms) {
    blocks.push({
      key: "payment",
      node: (
        <FooterBlock title="Conditions de paiement" body={data.paymentTerms} />
      ),
    });
  }

  if (data.notes) {
    blocks.push({
      key: "notes",
      node: <FooterBlock title="Notes" body={data.notes} />,
    });
  }

  if (data.legalMentions) {
    blocks.push({
      key: "legal-custom",
      node: <Text style={pdfStyles.legalMentions}>{data.legalMentions}</Text>,
    });
  }

  blocks.push({
    key: "legal-default",
    node: (
      <Text style={pdfStyles.legalMentionsDefault}>
        En cas de retard de paiement, des pénalités sont exigibles (taux légal)
        ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement
        (clients professionnels).
      </Text>
    ),
  });

  return (
    <>
      {blocks.map((block, index) => (
        <View
          key={block.key}
          style={
            index === 0 ? pdfStyles.footerBlockFirst : pdfStyles.footerBlockNext
          }
        >
          {block.node}
        </View>
      ))}
    </>
  );
}
