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
  followRequested: boolean;
  isOwnProfile: boolean;
};

export type FollowState = {
  isFollowing: boolean;
  followRequested: boolean;
  followersCount: number;
  followingCount: number;
};

export type FollowRequestUser = Pick<
  UserProfile,
  "id" | "username" | "fullName" | "avatarUrl" | "bio"
>;

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

export async function followUser(userId: number): Promise<FollowState> {
  const response = await fetch(`${getApiUrl()}/api/users/${userId}/follow`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  return parseJson<FollowState>(response);
}

export async function unfollowUser(userId: number): Promise<FollowState> {
  const response = await fetch(`${getApiUrl()}/api/users/${userId}/follow`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await parseJson<FollowState>(response);
  return { ...data, isFollowing: false, followRequested: false };
}

export async function fetchFollowRequests(): Promise<FollowRequestUser[]> {
  const response = await fetch(`${getApiUrl()}/api/users/me/follow-requests`, {
    credentials: "include",
    cache: "no-store",
  });
  const data = await parseJson<{ users: FollowRequestUser[] }>(response);
  return data.users;
}

export async function acceptFollowRequest(userId: number): Promise<void> {
  const response = await fetch(
    `${getApiUrl()}/api/users/me/follow-requests/${userId}/accept`,
    { method: "POST", credentials: "include" }
  );
  await parseJson(response);
}

export async function rejectFollowRequest(userId: number): Promise<void> {
  const response = await fetch(
    `${getApiUrl()}/api/users/me/follow-requests/${userId}`,
    { method: "DELETE", credentials: "include" }
  );
  await parseJson(response);
}

export async function updateMyProfile(data: {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  isPrivate?: boolean;
}): Promise<UserProfile> {
  const response = await fetch(`${getApiUrl()}/api/users/me/profile`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseJson<UserProfile>(response);
}
