import { buildClientPortalUrl } from "@/lib/client-portal/tokens";

export function appendClientPortalLink(
  message: string,
  portalUrl: string | null | undefined,
): string {
  const url = portalUrl?.trim();
  if (!url || message.includes(url)) {
    return message.trimEnd();
  }

  return `${message.trimEnd()}

Retrouvez tous vos documents dans votre espace client :
${url}`;
}

export function clientPortalEmailButton(portalUrl: string): {
  label: string;
  href: string;
} {
  return {
    label: "Accéder à mon espace client",
    href: portalUrl,
  };
}

export function formatClientPortalLine(portalUrl: string): string {
  return `Vous pouvez retrouver tous vos documents dans votre espace client : ${portalUrl}`;
}

export { buildClientPortalUrl };
