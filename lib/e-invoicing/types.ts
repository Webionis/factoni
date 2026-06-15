export type EinvoicingReadinessLevel = "ok" | "warning" | "error";

export interface EinvoicingReadinessItem {
  id: string;
  level: EinvoicingReadinessLevel;
  message: string;
  href?: string;
}

export interface EinvoicingReadinessReport {
  ready: boolean;
  items: EinvoicingReadinessItem[];
}

export type EinvoicingTransmissionStatus =
  | "pending"
  | "submitted"
  | "accepted"
  | "rejected"
  | "failed";

export interface EinvoicingPayload {
  xml: string;
  pdf: Buffer;
  invoiceNumber: string;
  profile: "EN16931";
  format: "factur-x";
}

export interface EinvoicingProviderSubmitInput {
  payload: EinvoicingPayload;
  sellerSiren: string;
  buyerSiren: string | null;
  buyerSiret: string | null;
}

export interface EinvoicingProviderSubmitResult {
  externalId: string;
  status: Extract<EinvoicingTransmissionStatus, "submitted" | "accepted">;
}

export interface EinvoicingProvider {
  slug: string;
  label: string;
  submit(input: EinvoicingProviderSubmitInput): Promise<EinvoicingProviderSubmitResult>;
}

export const EINVOICING_EMISSION_DEADLINE_LABEL = "1er septembre 2027";
