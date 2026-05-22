import { permanentRedirect } from "next/navigation";
import { ProfileNotFound } from "@/features/profile/ui/ProfileNotFound";
import { fetchProfileById } from "@/features/profile/lib/profile-api";
import { getProfilePath } from "@/features/profile/lib/profile-routes";
import { getAccessToken } from "@/features/auth/lib/cookies";

type PageProps = {
  params: Promise<{ id: string }>;
};

/** Legacy URL → canonical /profile/{username}-{id} */
export default async function ProfileIdRedirectPage({ params }: PageProps) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  if (Number.isNaN(userId)) {
    return <ProfileNotFound username={id} />;
  }

  const token = await getAccessToken();
  const profile = await fetchProfileById(userId, token);

  if (!profile) {
    return <ProfileNotFound username={`#${userId}`} />;
  }

  permanentRedirect(getProfilePath(profile));
}
