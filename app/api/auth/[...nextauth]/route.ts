import { handlers } from "@/auth";
import { NextRequest } from "next/server";

function requestWithForwardedOrigin(request: NextRequest): NextRequest {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (!forwardedHost) return request;

  const forwardedProtocol =
    request.headers.get("x-forwarded-proto") || request.nextUrl.protocol;
  const protocol = forwardedProtocol.endsWith(":")
    ? forwardedProtocol
    : `${forwardedProtocol}:`;
  const forwardedOrigin = new URL(`${protocol}//${forwardedHost}`);
  const url = new URL(request.url);
  url.protocol = forwardedOrigin.protocol;
  url.hostname = forwardedOrigin.hostname;
  url.port = forwardedOrigin.port;

  return new NextRequest(url, request);
}

export function GET(request: NextRequest) {
  return handlers.GET(requestWithForwardedOrigin(request));
}

export function POST(request: NextRequest) {
  return handlers.POST(requestWithForwardedOrigin(request));
}
