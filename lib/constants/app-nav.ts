/** Sections principales — préchargées au démarrage de l’app. */
export const APP_MAIN_NAV_ROUTES = [
  "/dashboard",
  "/agenda",
  "/quotes",
  "/invoices",
  "/clients",
] as const;

/** Paramètres — préchargés après les sections principales. */
export const APP_SETTINGS_NAV_ROUTES = [
  "/settings/company",
  "/settings/catalog",
  "/settings/einvoicing",
  "/settings/payments",
  "/settings/billing",
  "/settings/exports",
] as const;

export const APP_NAV_PREFETCH_ROUTES = [
  ...APP_MAIN_NAV_ROUTES,
  ...APP_SETTINGS_NAV_ROUTES,
] as const;

export type AppNavRoute = (typeof APP_NAV_PREFETCH_ROUTES)[number];
