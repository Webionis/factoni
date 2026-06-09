import { randomBytes } from "crypto";

import { siteConfig } from "@/lib/site";

/** Token URL-safe (32+ caractères) pour liens publics /d/{token}. */
export function generatePublicDocumentToken(): string {
  return randomBytes(24).toString("base64url");
}

/** URL publique du document — production utilise factoni.fr. */
export function buildPublicDocumentUrl(token: string): string {
  const base =
    process.env.NODE_ENV === "production"
      ? siteConfig.productionUrl
      : siteConfig.url;
  return `${base.replace(/\/$/, "")}/d/${token}`;
}
