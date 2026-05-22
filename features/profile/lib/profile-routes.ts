/** URL slug: `{username}-{id}` — username chỉ [a-zA-Z0-9_], id ở cuối sau dấu `-`. */

export function buildProfileSlug(
  username: string,
  id: number | string
): string {
  const safeUsername = username.trim().toLowerCase();
  return `${safeUsername}-${id}`;
}

export function getProfilePath(profile: {
  username: string;
  id: number;
}): string {
  return `/profile/${buildProfileSlug(profile.username, profile.id)}`;
}

export function parseProfileSlug(slug: string): {
  username?: string;
  id?: number;
} {
  const decoded = decodeURIComponent(slug).trim();
  const match = decoded.match(/^(.+)-(\d+)$/);
  if (match) {
    const id = parseInt(match[2], 10);
    if (!Number.isNaN(id) && id > 0) {
      return { username: match[1], id };
    }
  }
  if (decoded) {
    return { username: decoded };
  }
  return {};
}

/** Link profile SEO-friendly: /profile/{username}-{id} */
export function getProfileHref(user: {
  id?: string | number | null;
  userId?: string | number | null;
  username?: string | null;
}): string {
  const rawId = user.id ?? user.userId;
  const id =
    typeof rawId === "number"
      ? rawId
      : typeof rawId === "string"
        ? parseInt(rawId, 10)
        : NaN;

  const username = user.username?.trim();

  if (username && !Number.isNaN(id) && id > 0) {
    return getProfilePath({ username, id });
  }

  if (username) {
    return `/profile/${encodeURIComponent(username)}`;
  }

  return "/login";
}
