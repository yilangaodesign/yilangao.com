import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionValue, COOKIE_NAME } from "@/lib/company-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login routes through — visitors need to reach the login page
  if (pathname.startsWith("/for/") || pathname === "/for") {
    return NextResponse.next();
  }

  // Allow Payload CMS admin and API routes through (Payload has its own auth)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/media/") ||
    pathname.startsWith("/videos/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!sessionCookie) {
    const loginUrl = new URL("/for/welcome", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    }
    return NextResponse.redirect(loginUrl);
  }

  const company = verifySessionValue(sessionCookie);
  if (!company) {
    const loginUrl = new URL("/for/welcome", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Valid session — pass company identity downstream via header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-company", company);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
