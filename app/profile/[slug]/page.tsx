import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { ProfilePage } from "@/features/profile/ui/ProfilePage";
import { ProfileNotFound } from "@/features/profile/ui/ProfileNotFound";
import { ProfileLoadError } from "@/features/profile/ui/ProfileLoadError";
import {
  fetchProfileById,
  fetchProfileByUsername,
} from "@/features/profile/lib/profile-api";
import type { UserProfile } from "@/features/profile/lib/profile-api";
import {
  buildProfileSlug,
  getProfilePath,
  parseProfileSlug,
} from "@/features/profile/lib/profile-routes";
import { getAccessToken } from "@/features/auth/lib/cookies";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function resolveProfile(
  slug: string,
  token?: string
): Promise<UserProfile | null> {
  const { username, id } = parseProfileSlug(slug);

  if (id != null) {
    return fetchProfileById(id, token);
  }

  if (username) {
    return fetchProfileByUsername(username, token);
  }

  return null;
}

function ensureCanonicalSlug(slug: string, profile: UserProfile) {
  const canonicalSlug = buildProfileSlug(profile.username, profile.id);
  const current = decodeURIComponent(slug).trim().toLowerCase();
  if (current !== canonicalSlug.toLowerCase()) {
    permanentRedirect(getProfilePath(profile));
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const token = await getAccessToken();
    const profile = await resolveProfile(slug, token);
    if (!profile) {
      return { title: "Không tìm thấy người dùng" };
    }
    const name = profile.fullName || profile.username;
    return {
      title: `${name} (@${profile.username})`,
      description: profile.bio || `Trang cá nhân của ${name} trên NewFeed`,
    };
  } catch {
    return { title: "Hồ sơ" };
  }
}

export default async function ProfileSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const token = await getAccessToken();
  const { username } = parseProfileSlug(slug);
  let profile: UserProfile | null = null;
  let loadError: string | null = null;

  try {
    profile = await resolveProfile(slug, token);
    if (profile) ensureCanonicalSlug(slug, profile);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("Profile load failed:", error);
    loadError =
      error instanceof Error ? error.message : "Không kết nối được API";
  }

  if (loadError) return <ProfileLoadError message={loadError} />;
  if (!profile) {
    return <ProfileNotFound username={username || decodeURIComponent(slug)} />;
  }
  return <ProfilePage initialProfile={profile} />;
}
