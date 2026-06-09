export const BRAND_LOGO_BLACK_SRC = "/brand/factoni-logo-black.png" as const;
export const BRAND_LOGO_WHITE_SRC = "/brand/factoni-logo-white.png" as const;

/** Dimensions source (PNG HD transparent). */
export const BRAND_LOGO_BLACK_WIDTH = 1200;
export const BRAND_LOGO_BLACK_HEIGHT = 320;
export const BRAND_LOGO_WHITE_WIDTH = 1200;
export const BRAND_LOGO_WHITE_HEIGHT = 320;

export const BRAND_LOGO_ASPECT_RATIO =
  BRAND_LOGO_BLACK_WIDTH / BRAND_LOGO_BLACK_HEIGHT;

/** Hauteurs d'affichage cible (px) — largeur calculée via le ratio source. */
export const brandLogoDisplayHeightPx = {
  sm: 32,
  md: 36,
  lg: 40,
  xl: 48,
} as const;

/**
 * Hauteurs CSS — largeur via w-auto + ratio naturel.
 * sm 32px · md 36px · lg 40px · xl 48px
 */
export const brandLogoHeightClassName = {
  sm: "h-8",
  md: "h-9",
  lg: "h-10",
  xl: "h-12",
} as const;

export function brandLogoDisplayWidth(
  size: keyof typeof brandLogoDisplayHeightPx,
): number {
  return Math.round(brandLogoDisplayHeightPx[size] * BRAND_LOGO_ASPECT_RATIO);
}
