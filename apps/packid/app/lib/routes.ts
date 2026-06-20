export const PUBLIC_PAGE_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/privacy-policy",
  "/terms-of-service",
  "/user-data-deletion",
]);

export const PUBLIC_API_PATH_PREFIXES = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/social",
  "/api/whatsapp/webhook",
  "/api/interviews",
];

export const PUBLIC_PAGE_PATH_PREFIXES = ["/interview/"];
export const ORGANIZATION_SETUP_PATH = "/organization/new";

export function isPublicPagePath(pathname: string) {
  return (
    PUBLIC_PAGE_PATHS.has(pathname) ||
    PUBLIC_PAGE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

export function isPublicApiPath(pathname: string) {
  return PUBLIC_API_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isAuthPagePath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  );
}

export function isApplicationPagePath(pathname: string) {
  return !isPublicPagePath(pathname) && pathname !== ORGANIZATION_SETUP_PATH;
}
