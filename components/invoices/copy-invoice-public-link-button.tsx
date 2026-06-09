import { CopyPublicDocumentLinkButton } from "@/components/documents/copy-public-document-link-button";

interface CopyInvoicePublicLinkButtonProps {
  invoiceId: string;
}

/** @deprecated Utiliser CopyPublicDocumentLinkButton */
export function CopyInvoicePublicLinkButton({
  invoiceId,
}: CopyInvoicePublicLinkButtonProps) {
  return (
    <CopyPublicDocumentLinkButton
      documentId={invoiceId}
      documentKind="invoice"
    />
  );
}
