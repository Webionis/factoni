export interface BuildMailtoUrlParams {
  to: string;
  subject: string;
  body: string;
}

/** Limite conservative — certains clients mail tronquent les URLs longues. */
export const MAILTO_MAX_URL_LENGTH = 2083;

/**
 * Construit une URL mailto: avec encodage sûr (accents, retours à la ligne, etc.).
 * L’adresse destinataire n’est pas encodée en entier — seuls subject/body le sont.
 */
export function buildMailtoUrl({
  to,
  subject,
  body,
}: BuildMailtoUrlParams): string {
  const trimmedTo = to.trim();
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return `mailto:${trimmedTo}?${query}`;
}

export function isMailtoUrlTooLong(url: string): boolean {
  return url.length > MAILTO_MAX_URL_LENGTH;
}

/** Ajoute le lien public sécurisé au corps du message mailto. */
export function appendDocumentLinkToMessage(
  message: string,
  documentPublicUrl: string,
): string {
  const trimmed = message.trimEnd();
  const url = documentPublicUrl.trim();

  if (trimmed.includes(url)) {
    return trimmed;
  }

  return `${trimmed}\n\nVous pouvez consulter le document ici :\n${url}`;
}
