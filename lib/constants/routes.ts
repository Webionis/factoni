/** Routes accessibles sans session */
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/mentions-legales",
  "/confidentialite",
] as const;

/** Routes auth : rediriger si déjà connecté */
export const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"] as const;

/** Préfixes des routes applicatives protégées */
export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/clients",
  "/invoices",
  "/settings",
  "/onboarding",
] as const;

export const ONBOARDING_ROUTE = "/onboarding";
export const DEFAULT_AUTHENTICATED_REDIRECT = "/dashboard";
export const DEFAULT_UNAUTHENTICATED_REDIRECT = "/login";

export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number])) {
    return true;
  }
  if (pathname.startsWith("/auth/")) {
    return true;
  }
  if (pathname.startsWith("/d/")) {
    return true;
  }
  if (pathname.startsWith("/client/")) {
    return true;
  }
  if (pathname.startsWith("/api/public/")) {
    return true;
  }
  if (pathname.startsWith("/api/stripe/")) {
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

export function isOnboardingRoute(pathname: string): boolean {
  return pathname === ONBOARDING_ROUTE || pathname.startsWith(`${ONBOARDING_ROUTE}/`);
}
