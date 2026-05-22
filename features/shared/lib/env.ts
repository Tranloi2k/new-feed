/** Browser: same-origin (Next rewrites → gateway). Server: direct gateway URL. */
export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    const publicUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    return publicUrl || window.location.origin;
  }

  const internal =
    process.env.INTERNAL_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!internal) {
    throw new Error("INTERNAL_API_URL or NEXT_PUBLIC_API_URL is not configured");
  }
  return internal;
}

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return secret;
}
