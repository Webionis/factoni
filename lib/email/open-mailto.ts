"use client";

import {
  appendDocumentLinkToMessage,
  buildMailtoUrl,
  isMailtoUrlTooLong,
} from "@/lib/email/mailto";

export function openMailtoUrl(url: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function buildAndOpenMailto(params: {
  to: string;
  subject: string;
  message: string;
  publicDocumentUrl?: string | null;
}): { ok: true; includesPublicLink: boolean } | { ok: false; error: string } {
  const trimmedSubject = params.subject.trim();
  const trimmedMessage = params.message.trim();
  const publicUrl = params.publicDocumentUrl?.trim() ?? "";

  if (!trimmedSubject || !trimmedMessage) {
    return { ok: false, error: "Veuillez renseigner l'objet et le message." };
  }

  const body = publicUrl
    ? appendDocumentLinkToMessage(trimmedMessage, publicUrl)
    : trimmedMessage;

  const mailtoUrl = buildMailtoUrl({
    to: params.to,
    subject: trimmedSubject,
    body,
  });

  if (isMailtoUrlTooLong(mailtoUrl)) {
    return {
      ok: false,
      error:
        "Le message est trop long pour votre application mail. Réduisez le texte.",
    };
  }

  try {
    openMailtoUrl(mailtoUrl);
    return { ok: true, includesPublicLink: Boolean(publicUrl) };
  } catch {
    return {
      ok: false,
      error:
        "Si rien ne s'ouvre, vérifiez qu'une application mail est configurée sur votre appareil.",
    };
  }
}
