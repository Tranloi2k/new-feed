import { NextResponse } from "next/server";
import { getAccessToken } from "@/features/auth/lib/cookies";

/** Expose JWT for WebSocket (HttpOnly cookie is not readable in the browser). */
export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ token: null }, { status: 401 });
  }
  return NextResponse.json({ token });
}
