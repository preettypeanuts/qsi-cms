import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const session = await verifySessionToken(
    cookieStore.get(AUTH_COOKIE_NAME)?.value,
  );

  if (!session) {
    return Response.json({ error: "Unauthenticated." }, { status: 401 });
  }

  return Response.json({ data: { username: session.sub } });
}
