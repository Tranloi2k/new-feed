"use client";

import { useState } from "react";
import type { UserProfile } from "../lib/profile-api";
import { ProfileHeader } from "./ProfileHeader";
import { ProfilePosts } from "./ProfilePosts";
import { FollowRequests } from "./FollowRequests";

type ProfilePageProps = {
  initialProfile: UserProfile;
};

export function ProfilePage({ initialProfile }: ProfilePageProps) {
  const [profile, setProfile] = useState(initialProfile);

  return (
    <div>
      <header className="sticky top-[var(--header-height)] z-30 flex h-14 items-center bg-[var(--background)]/92 px-4 backdrop-blur-xl sm:px-6">
        <p className="text-[15px] font-semibold text-[var(--text-primary)]">Hồ sơ</p>
      </header>
      <ProfileHeader profile={profile} onProfileUpdate={setProfile} />
      {profile.isOwnProfile && <FollowRequests />}
      <ProfilePosts userId={profile.id} />
    </div>
  );
}
