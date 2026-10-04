import { NextRequest, NextResponse } from "next/server";

// Cookie name duplicated from lib/auth.ts on purpose: middleware runs on the
// Edge Runtime and must not import server-only modules (Prisma, node:crypto).
const SESSION_COOKIE = "cb_session";

const PROTECTED_PREFIXES = ["/wallet", "/orders", "/profile"];
const ADMIN_PREFIXES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));

  if ((isProtected || isAdmin) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/wallet/:path*", "/orders/:path*", "/profile/:path*", "/admin/:path*"],
};
