export type EmailTemplateKind =
  | "invoice_reminder"
  | "quote_sent"
  | "invoice_sent"
  | "quote_signed"
  | "invoice_paid"
  | "quote_deposit_requested"
  | "quote_deposit_paid";

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: EmailAttachment[];
  /** Identifiant métier pour les logs (ex. invoice_reminder). */
  templateKind: EmailTemplateKind;
  documentId?: string;
}

export type EmailSendResult =
  | { ok: true; providerMessageId: string | null }
  | { ok: false; error: string; code?: EmailErrorCode };

export type EmailErrorCode =
  | "not_configured"
  | "invalid_recipient"
  | "rate_limited"
  | "provider_down"
  | "timeout"
  | "unknown";

export interface EmailLogContext {
  templateKind: EmailTemplateKind;
  recipient: string;
  documentId?: string;
  providerMessageId?: string | null;
  error?: string;
  code?: EmailErrorCode;
}
