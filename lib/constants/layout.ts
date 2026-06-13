/** Sidebar desktop — largeur fixe (flex shrink-0, pas de margin sur le contenu). */
export const SIDEBAR_WIDTH_REM = "17rem" as const;
export const sidebarWidthClassName = "w-[17rem] shrink-0";

/** Zone contenu principale — flex-1 + min-w-0 évite l’overflow horizontal. */
export const appContentAreaClassName =
  "ff-app-surface flex min-h-0 min-w-0 flex-1 flex-col md:h-dvh md:min-h-0";

/** Wrapper centré des pages app. */
export const appContentInnerClassName = "mx-auto min-w-0 w-full";

/** Largeur du contenu principal selon la route (desktop). */

export type AppContentWidth = "wide" | "list" | "narrow";

export function getAppContentWidth(pathname: string): AppContentWidth {
  if (pathname === "/dashboard") return "wide";
  if (pathname === "/agenda") return "wide";
  if (
    pathname === "/invoices" ||
    pathname === "/clients" ||
    pathname === "/quotes"
  ) {
    return "list";
  }

  if (
    pathname === "/invoices/new" ||
    pathname === "/quotes/new" ||
    pathname === "/clients/new" ||
    pathname.startsWith("/settings/")
  ) {
    return "narrow";
  }

  if (/^\/invoices\/[^/]+(\/edit)?$/.test(pathname)) return "narrow";
  if (/^\/quotes\/[^/]+(\/edit)?$/.test(pathname)) return "narrow";
  if (/^\/clients\/[^/]+(\/edit)?$/.test(pathname)) return "narrow";

  return "list";
}

export function appContentMaxWidthClass(pathname: string): string {
  switch (getAppContentWidth(pathname)) {
    case "wide":
      return "max-w-6xl";
    case "list":
      return "max-w-5xl";
    case "narrow":
      return "max-w-3xl";
  }
}
