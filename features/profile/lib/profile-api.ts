import { getApiUrl } from "@/features/shared/lib/env";

export type UserProfile = {
  id: number;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isPrivate: boolean;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
};

function authHeaders(serverToken?: string): HeadersInit {
  if (serverToken) {
    return { Authorization: `Bearer ${serverToken}` };
  }
  return {};
}

async function parseJson<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || "Request failed");
  }
  return json.data as T;
}

export async function fetchProfileByUsername(
  username: string,
  serverToken?: string
): Promise<UserProfile | null> {
  const response = await fetch(
    `${getApiUrl()}/api/users/username/${encodeURIComponent(username)}`,
    {
      credentials: "include",
      headers: authHeaders(serverToken),
      cache: "no-store",
    }
  );

  if (response.status === 404) return null;
  return parseJson<UserProfile>(response);
}

export async function fetchProfileById(
  userId: number,
  serverToken?: string
): Promise<UserProfile | null> {
  const response = await fetch(`${getApiUrl()}/api/users/${userId}/profile`, {
    credentials: "include",
    headers: authHeaders(serverToken),
    cache: "no-store",
  });

  if (response.status === 404) return null;
  return parseJson<UserProfile>(response);
}

export async function followUser(userId: number): Promise<void> {
  const response = await fetch(`${getApiUrl()}/api/users/${userId}/follow`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  await parseJson(response);
}

export async function unfollowUser(userId: number): Promise<void> {
  const response = await fetch(`${getApiUrl()}/api/users/${userId}/follow`, {
    method: "DELETE",
    credentials: "include",
  });
  await parseJson(response);
}

export async function updateMyProfile(data: {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
}): Promise<UserProfile> {
  const response = await fetch(`${getApiUrl()}/api/users/me/profile`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseJson<UserProfile>(response);
}
