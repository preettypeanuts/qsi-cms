import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function getCurrentUsername() {
  const cookieStore = await cookies();
  const session = await verifySessionToken(
    cookieStore.get(AUTH_COOKIE_NAME)?.value,
  );

  return session?.sub ?? "System";
}
