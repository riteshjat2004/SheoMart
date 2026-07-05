import type { UserRole } from "@/types/auth";

export const PUBLIC_ROUTES = ["/", "/login", "/register", "/about", "/explore", "/privacy", "/terms", "/support"];
export const GUEST_ONLY_ROUTES = ["/login", "/register"];
export const PROTECTED_ROUTES = ["/account", "/cart", "/orders", "/checkout", "/wishlist", "/addresses"];

export function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.includes(pathname);
}

export function isGuestRoute(pathname: string) {
  return GUEST_ONLY_ROUTES.includes(pathname);
}

export function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

export function hasRequiredRole(role: UserRole | null, allowedRoles?: UserRole[]) {
  if (!allowedRoles?.length || !role) {
    return false;
  }

  return allowedRoles.includes(role);
}
