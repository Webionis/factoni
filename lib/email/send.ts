import {
  getEmailFromAddress,
  getResendClient,
  EMAIL_NOT_CONFIGURED_MESSAGE,
} from "@/lib/email/resend";
import { logEmailEvent, mapResendError } from "@/lib/email/helpers";
import type { EmailSendResult, SendEmailParams } from "@/lib/email/types";
import { logServerError } from "@/lib/logger";

function isValidRecipient(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function sendTransactionalEmail(
  params: SendEmailParams,
): Promise<EmailSendResult> {
  const resend = getResendClient();
  const from = getEmailFromAddress();

  if (!resend || !from) {
    return {
      ok: false,
      error: EMAIL_NOT_CONFIGURED_MESSAGE,
      code: "not_configured",
    };
  }

  const to = params.to.trim();
  if (!isValidRecipient(to)) {
    return {
      ok: false,
      error: "Adresse email du destinataire invalide.",
      code: "invalid_recipient",
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject: params.subject.trim(),
      text: params.text,
      html: params.html,
      attachments: params.attachments?.map((file) => ({
        filename: file.filename,
        content: file.content,
      })),
    });

    if (error) {
      const mapped = mapResendError(error);
      logServerError("sendTransactionalEmail", error, {
        templateKind: params.templateKind,
        documentId: params.documentId,
      });
      logEmailEvent("failed", {
        templateKind: params.templateKind,
        recipient: to,
        documentId: params.documentId,
        error: mapped.message,
        code: mapped.code,
      });
      return { ok: false, error: mapped.message, code: mapped.code };
    }

    const providerMessageId = data?.id ?? null;
    logEmailEvent("sent", {
      templateKind: params.templateKind,
      recipient: to,
      documentId: params.documentId,
      providerMessageId,
    });

    return { ok: true, providerMessageId };
  } catch (err) {
    logServerError("sendTransactionalEmail", err, {
      templateKind: params.templateKind,
      documentId: params.documentId,
    });
    const mapped = mapResendError(
      err instanceof Error ? { message: err.message } : {},
    );
    logEmailEvent("failed", {
      templateKind: params.templateKind,
      recipient: to,
      documentId: params.documentId,
      error: mapped.message,
      code: mapped.code,
    });
    return { ok: false, error: mapped.message, code: mapped.code };
  }
}
