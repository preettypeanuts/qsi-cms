import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth";
import { verifyUserCredentials } from "@/lib/users";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    password?: string;
    username?: string;
  };

  if (!payload.username || !payload.password) {
    return Response.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }

  const user = await verifyUserCredentials(payload.username, payload.password);

  if (!user) {
    return Response.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = await createSessionToken(user.username);
  const response = Response.json({ data: { username: user.username } });

  response.headers.append(
    "Set-Cookie",
    serializeCookie(AUTH_COOKIE_NAME, token, getSessionCookieOptions()),
  );

  return response;
}

function serializeCookie(
  name: string,
  value: string,
  options: ReturnType<typeof getSessionCookieOptions>,
) {
  const parts = [
    `${name}=${value}`,
    `Max-Age=${options.maxAge}`,
    `Path=${options.path}`,
    "HttpOnly",
    `SameSite=${options.sameSite}`,
  ];

  if (options.secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}
