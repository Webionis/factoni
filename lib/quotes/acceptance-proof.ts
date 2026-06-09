import { createHash } from "crypto";

export interface AcceptanceSnapshot {
  quote_id: string;
  quote_number: string | null;
  total_ht: number;
  total_vat: number;
  total_ttc: number;
  issue_date: string;
  due_date: string;
  signed_at: string;
  signer_name: string;
}

export function buildAcceptanceSnapshot(params: {
  quoteId: string;
  quoteNumber: string | null;
  totalHt: number;
  totalVat: number;
  totalTtc: number;
  issueDate: string;
  dueDate: string;
  signerName: string;
  signedAt: string;
}): AcceptanceSnapshot {
  return {
    quote_id: params.quoteId,
    quote_number: params.quoteNumber,
    total_ht: params.totalHt,
    total_vat: params.totalVat,
    total_ttc: params.totalTtc,
    issue_date: params.issueDate,
    due_date: params.dueDate,
    signed_at: params.signedAt,
    signer_name: params.signerName.trim(),
  };
}

export function computeSignatureHash(
  snapshot: AcceptanceSnapshot,
  signaturePath: string,
): string {
  const payload = JSON.stringify({
    snapshot,
    signature_path: signaturePath,
  });
  return createHash("sha256").update(payload).digest("hex");
}
