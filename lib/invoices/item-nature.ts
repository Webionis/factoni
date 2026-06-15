export const INVOICE_LINE_ITEM_NATURES = [
  "service",
  "merchandise",
  "finished_product",
  "artist_author",
  "disbursement",
] as const;

export type InvoiceLineItemNature = (typeof INVOICE_LINE_ITEM_NATURES)[number];

export const DEFAULT_INVOICE_LINE_ITEM_NATURE: InvoiceLineItemNature = "service";

export interface InvoiceLineItemNatureOption {
  value: InvoiceLineItemNature;
  label: string;
  description: string;
}

export const INVOICE_LINE_ITEM_NATURE_OPTIONS: InvoiceLineItemNatureOption[] = [
  {
    value: "service",
    label: "Prestation de service",
    description:
      "Tâche technique ou intellectuelle réalisée sur demande.",
  },
  {
    value: "merchandise",
    label: "Marchandise",
    description:
      "Bien acheté par l'entreprise puis revendu sans transformation.",
  },
  {
    value: "finished_product",
    label: "Produit fini",
    description: "Bien fabriqué ou transformé par l'entreprise.",
  },
  {
    value: "artist_author",
    label: "Prestation d'artiste-auteur",
    description:
      "Création ou cession d'une œuvre artistique ou intellectuelle.",
  },
  {
    value: "disbursement",
    label: "Frais de débours",
    description:
      "Frais avancés par le fournisseur, remboursés par le client (hors CA imposable).",
  },
];

const LABELS = Object.fromEntries(
  INVOICE_LINE_ITEM_NATURE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<InvoiceLineItemNature, string>;

export function invoiceLineItemNatureLabel(
  nature: InvoiceLineItemNature | null | undefined,
): string {
  if (!nature) return LABELS.service;
  return LABELS[nature] ?? LABELS.service;
}

export function isInvoiceLineItemNature(
  value: string,
): value is InvoiceLineItemNature {
  return INVOICE_LINE_ITEM_NATURES.includes(value as InvoiceLineItemNature);
}

export function isDisbursementLine(
  nature: InvoiceLineItemNature | null | undefined,
): boolean {
  return nature === "disbursement";
}

export function getInvoiceLineItemNatureOption(
  nature: InvoiceLineItemNature,
): InvoiceLineItemNatureOption {
  return (
    INVOICE_LINE_ITEM_NATURE_OPTIONS.find((option) => option.value === nature) ??
    INVOICE_LINE_ITEM_NATURE_OPTIONS[0]
  );
}
