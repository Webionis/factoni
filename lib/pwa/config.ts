/**
 * Configuration PWA Factoni — source unique pour manifest & metadata.
 * Fichier statique synchronisé : public/manifest.webmanifest
 */
export const PWA_THEME_COLOR = "#2563eb" as const;
export const PWA_BACKGROUND_COLOR = "#ffffff" as const;

export const pwaManifest = {
  name: "Factoni",
  short_name: "Factoni",
  description:
    "Logiciel de devis et facturation pour artisans et indépendants",
  start_url: "/",
  scope: "/",
  id: "/",
  display: "standalone" as const,
  background_color: PWA_BACKGROUND_COLOR,
  theme_color: PWA_THEME_COLOR,
  orientation: "portrait" as const,
  lang: "fr",
  dir: "ltr" as const,
  categories: ["business", "finance", "productivity"] as const,
  prefer_related_applications: false,
  icons: [
    {
      src: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-512-maskable.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
} as const;

export const pwaAppleWebApp = {
  capable: true,
  title: "Factoni",
  statusBarStyle: "default" as const,
};
