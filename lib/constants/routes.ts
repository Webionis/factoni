/** Routes accessibles sans session */
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
] as const;

/** Routes auth : rediriger vers le dashboard si déjà connecté */
export const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"] as const;

/** Préfixes des routes applicatives protégées */
export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/clients",
  "/invoices",
  "/settings",
  "/onboarding",
] as const;

export const DEFAULT_AUTHENTICATED_REDIRECT = "/dashboard";
export const DEFAULT_UNAUTHENTICATED_REDIRECT = "/login";

export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number])) {
    return true;
  }
  if (pathname.startsWith("/auth/")) {
    return true;
  }
  return false;
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname as (typeof AUTH_ROUTES)[number]);
}

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
}
