import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.headers.append(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=lax`,
  );

  return response;
}

export async function POST() {
  const response = NextResponse.json({ data: { success: true } });
  response.headers.append(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=lax`,
  );

  return response;
}
