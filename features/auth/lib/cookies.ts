import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const AUTH_COOKIES = new Set([ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE]);

function configuredCookieDomain(): string | undefined {
  return process.env.AUTH_COOKIE_DOMAIN?.trim() || undefined;
}

/** Sync HttpOnly auth cookies from an auth API response into Next.js. */
export async function syncAuthCookiesFromResponse(response: Response) {
  const setCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];

  const cookieStore = await cookies();

  for (const cookieString of setCookies) {
    const name = cookieString.split("=")[0]?.trim();
    if (!AUTH_COOKIES.has(name)) continue;

    const parts = cookieString.split(";").map((p) => p.trim());
    const [, value] = parts[0].split("=");

    const opts: {
      httpOnly?: boolean;
      secure?: boolean;
      maxAge?: number;
      sameSite?: "lax" | "strict" | "none";
      path?: string;
      domain?: string;
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
      if (lower.startsWith("domain=")) {
        opts.domain = part.split("=")[1];
      }
    }

    // The upstream API is often HTTPS even when the frontend is opened through
    // a remote development IP over plain HTTP. Browsers silently reject Secure
    // cookies on that origin, leaving NextAuth signed in but API mutations
    // unauthenticated. Production remains HTTPS-only.
    opts.secure = process.env.NODE_ENV === "production";

    // A shared parent domain lets the API Gateway receive HttpOnly cookies
    // during direct WebSocket handshakes in Kubernetes deployments.
    opts.domain = configuredCookieDomain() || opts.domain;
    cookieStore.set(name, value ?? "", opts);
  }
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  const domain = configuredCookieDomain();
  cookieStore.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain,
    maxAge: 0,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    domain,
    maxAge: 0,
  });
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}
