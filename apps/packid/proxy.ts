import { NextResponse, type NextRequest } from "next/server";
import { isPublicApiPath, isPublicPagePath } from "./app/lib/routes";

const SESSION_COOKIE = "packid_session";

function isInternalAsset(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml")
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isInternalAsset(pathname)) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-packid-pathname", pathname);

  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isApiRoute = pathname.startsWith("/api/");
  const isPublicRoute = isApiRoute
    ? isPublicApiPath(pathname)
    : isPublicPagePath(pathname);

  if (!isPublicRoute && !hasSessionCookie) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: "Authentification requise." },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
