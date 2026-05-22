"use client";

import { useState } from "react";
import type { UserProfile } from "../lib/profile-api";
import { ProfileHeader } from "./ProfileHeader";
import { ProfilePosts } from "./ProfilePosts";

type ProfilePageProps = {
  initialProfile: UserProfile;
};

export function ProfilePage({ initialProfile }: ProfilePageProps) {
  const [profile, setProfile] = useState(initialProfile);

  return (
    <>
      <ProfileHeader profile={profile} onProfileUpdate={setProfile} />
      <ProfilePosts userId={profile.id} />
    </>
  );
}
