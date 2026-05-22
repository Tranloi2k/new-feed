"use client";

import { useState } from "react";
import { followUser, unfollowUser } from "../lib/profile-api";
import { cn } from "@/features/feed/ui/utils/cn";

type FollowButtonProps = {
  userId: number;
  initialFollowing: boolean;
  isOwnProfile: boolean;
  onChange?: (following: boolean) => void;
};

export function FollowButton({
  userId,
  initialFollowing,
  isOwnProfile,
  onChange,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  if (isOwnProfile) {
    return null;
  }

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (following) {
        await unfollowUser(userId);
        setFollowing(false);
        onChange?.(false);
      } else {
        await followUser(userId);
        setFollowing(true);
        onChange?.(true);
      }
    } catch (error) {
      console.error("Follow toggle failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={cn(
        "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
        following
          ? "border border-[color:var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
          : "bg-[var(--accent)] text-white hover:opacity-90",
        loading && "opacity-60 cursor-not-allowed"
      )}
    >
      {loading ? "..." : following ? "Đang theo dõi" : "Theo dõi"}
    </button>
  );
}
