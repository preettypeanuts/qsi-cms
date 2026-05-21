import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

const protectedPrefixes = ["/", "/certificate", "/certificates"];
const protectedApiPrefixes = ["/api/certificates", "/api/users"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";
  const isProtected =
    protectedPrefixes.some((prefix) =>
      prefix === "/" ? pathname === "/" : pathname.startsWith(prefix),
    ) || protectedApiPrefixes.some((prefix) => pathname.startsWith(prefix));

  const session = await verifySessionToken(
    request.cookies.get(AUTH_COOKIE_NAME)?.value,
  );

  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isProtected || session) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return Response.json({ error: "Unauthenticated." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/certificate/:path*",
    "/certificates/:path*",
    "/api/certificates/:path*",
    "/api/users/:path*",
  ],
};
