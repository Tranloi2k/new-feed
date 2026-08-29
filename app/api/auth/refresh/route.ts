import { getApiUrl } from "@/features/shared/lib/env";
import { syncAuthCookiesFromResponse } from "@/features/auth/lib/cookies";

export async function POST(request: Request) {
  const upstream = await fetch(`${getApiUrl()}/api/auth/refresh`, {
    method: "POST",
    headers: {
      Cookie: request.headers.get("cookie") || "",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  await syncAuthCookiesFromResponse(upstream);

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
    },
  });
}
