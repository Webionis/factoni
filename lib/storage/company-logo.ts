export const COMPANY_LOGOS_BUCKET = "company-logos";

export const LOGO_MAX_BYTES = 2 * 1024 * 1024;

export const LOGO_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type LogoMimeType = (typeof LOGO_ALLOWED_MIME_TYPES)[number];

const MIME_TO_EXT: Record<LogoMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function buildCompanyLogoPath(userId: string, mimeType: string): string {
  const normalized = mimeType.toLowerCase() as LogoMimeType;
  if (!LOGO_ALLOWED_MIME_TYPES.includes(normalized)) {
    throw new Error("Type de fichier non autorisé");
  }
  const ext = MIME_TO_EXT[normalized];
  return `${userId}/logo.${ext}`;
}

export function validateLogoFile(file: File): string | null {
  if (!LOGO_ALLOWED_MIME_TYPES.includes(file.type as LogoMimeType)) {
    return "Format accepté : PNG, JPG ou WebP.";
  }
  if (file.size > LOGO_MAX_BYTES) {
    return "Le fichier ne doit pas dépasser 2 Mo.";
  }
  if (file.size === 0) {
    return "Le fichier est vide.";
  }
  return null;
}
