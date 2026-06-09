import type { EmailErrorCode } from "@/lib/email/types";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function messageToHtmlParagraphs(message: string): string {
  return escapeHtml(message)
    .split(/\n/)
    .map((line) =>
      line.trim() === ""
        ? "<br />"
        : `<p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#334155;">${line}</p>`,
    )
    .join("");
}

export function maskEmailForLog(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

export function mapResendError(error: {
  name?: string;
  message?: string;
}): { message: string; code: EmailErrorCode } {
  const raw = error.message?.trim() ?? "";
  const lower = raw.toLowerCase();

  if (
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    error.name === "rate_limit_exceeded"
  ) {
    return {
      code: "rate_limited",
      message: "Limite d'envoi atteinte. Réessayez dans quelques minutes.",
    };
  }

  if (
    lower.includes("invalid") &&
    (lower.includes("email") || lower.includes("recipient"))
  ) {
    return {
      code: "invalid_recipient",
      message: "Adresse email du destinataire invalide.",
    };
  }

  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("network")
  ) {
    return {
      code: "timeout",
      message: "Le service email est temporairement indisponible. Réessayez.",
    };
  }

  if (lower.includes("unavailable") || lower.includes("internal")) {
    return {
      code: "provider_down",
      message: "Le service email est temporairement indisponible. Réessayez.",
    };
  }

  if (raw.length > 0 && raw.length < 120) {
    return { code: "unknown", message: raw };
  }

  return {
    code: "unknown",
    message: "L'envoi de l'email a échoué. Réessayez plus tard.",
  };
}

export function logEmailEvent(
  status: "sent" | "failed",
  context: {
    templateKind: string;
    recipient: string;
    documentId?: string;
    providerMessageId?: string | null;
    error?: string;
    code?: string;
  },
): void {
  const payload = {
    status,
    template: context.templateKind,
    recipient: maskEmailForLog(context.recipient),
    documentId: context.documentId,
    providerMessageId: context.providerMessageId ?? null,
    error: context.error,
    code: context.code,
    timestamp: new Date().toISOString(),
  };

  if (status === "sent") {
    console.info("[email]", payload);
  } else if (process.env.NODE_ENV === "development") {
    console.error("[email]", payload);
  } else {
    console.warn("[email]", payload);
  }
}
