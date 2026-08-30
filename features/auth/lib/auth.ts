import { getApiUrl } from "@/features/shared/lib/env";
import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  syncAuthCookiesFromResponse,
} from "./cookies";

export type AuthUser = {
  id?: number;
  userId?: number;
  username: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
};

type AuthApiResponse = {
  success: boolean;
  message?: string;
  data?: AuthUser;
};

async function parseAuthResponse(response: Response): Promise<AuthApiResponse> {
  const body = (await response.json()) as AuthApiResponse;
  if (!response.ok) {
    throw new Error(body.message || "Request failed");
  }
  return body;
}

async function login(params: { email: string; password: string }) {
  const { email, password } = params;
  const response = await fetch(`${getApiUrl()}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const body = await parseAuthResponse(response);
  await syncAuthCookiesFromResponse(response);
  return body;
}

async function signup(params: {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}) {
  const response = await fetch(`${getApiUrl()}/api/auth/signup`, {
    method: "POST",
    body: JSON.stringify(params),
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const body = await parseAuthResponse(response);
  await syncAuthCookiesFromResponse(response);
  return body;
}

async function resetPassword(params: { identifier: string; password: string }) {
  const response = await fetch(`${getApiUrl()}/api/auth/reset-password`, {
    method: "POST",
    body: JSON.stringify(params),
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  return parseAuthResponse(response);
}

async function logout() {
  try {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    if (accessToken || refreshToken) {
      await fetch(`${getApiUrl()}/api/auth/logout`, {
        method: "POST",
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          Cookie: [
            accessToken && `access_token=${accessToken}`,
            refreshToken && `refresh_token=${refreshToken}`,
          ].filter(Boolean).join("; "),
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
    }
  } catch (error) {
    console.error("Backend logout failed:", error);
  } finally {
    await clearAuthCookies();
  }
}

async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return null;
    }

    const response = await fetch(`${getApiUrl()}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Cookie: `access_token=${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as AuthApiResponse;
    return data.data ?? null;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
}

export { login, signup, logout, resetPassword, getCurrentUser };
