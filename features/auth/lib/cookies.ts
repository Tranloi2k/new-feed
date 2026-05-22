import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "access_token";

/** Sync `access_token` from an auth API response into the Next.js cookie store. */
export async function syncAccessTokenFromResponse(response: Response) {
  const setCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];

  const cookieStore = await cookies();

  for (const cookieString of setCookies) {
    const name = cookieString.split("=")[0]?.trim();
    if (name !== ACCESS_TOKEN_COOKIE) continue;

    const parts = cookieString.split(";").map((p) => p.trim());
    const [, value] = parts[0].split("=");
    if (!value) continue;

    const opts: {
      httpOnly?: boolean;
      secure?: boolean;
      maxAge?: number;
      sameSite?: "lax" | "strict" | "none";
      path?: string;
    } = { path: "/" };

    for (const part of parts.slice(1)) {
      const lower = part.toLowerCase();
      if (lower === "httponly") opts.httpOnly = true;
      if (lower === "secure") opts.secure = true;
      if (lower.startsWith("max-age=")) {
        opts.maxAge = parseInt(lower.split("=")[1], 10);
      }
      if (lower.startsWith("samesite=")) {
        const site = lower.split("=")[1] as "lax" | "strict" | "none";
        opts.sameSite = site;
      }
      if (lower.startsWith("path=")) {
        opts.path = part.split("=")[1];
      }
    }

    cookieStore.set(ACCESS_TOKEN_COOKIE, value, opts);
    return;
  }
}

export async function clearAccessTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}
