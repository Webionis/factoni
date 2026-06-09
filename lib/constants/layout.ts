/** Sidebar desktop — largeur fixe (aligner margin contenu). */
export const SIDEBAR_WIDTH_REM = "17rem" as const;
export const sidebarWidthClassName = "w-[17rem]";
export const sidebarOffsetClassName = "md:ml-[17rem]";

/** Largeur du contenu principal selon la route (desktop). */

export type AppContentWidth = "wide" | "list" | "narrow";

export function getAppContentWidth(pathname: string): AppContentWidth {
  if (pathname === "/dashboard") return "wide";
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
