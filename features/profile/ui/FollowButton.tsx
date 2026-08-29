"use client";

import { useState } from "react";
import { followUser, unfollowUser } from "../lib/profile-api";
import { cn } from "@/features/feed/ui/utils/cn";

type FollowButtonProps = {
  userId: number;
  initialFollowing: boolean;
  initialRequested: boolean;
  isOwnProfile: boolean;
  onChange?: (following: boolean) => void;
};

export function FollowButton({
  userId,
  initialFollowing,
  initialRequested,
  isOwnProfile,
  onChange,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [requested, setRequested] = useState(initialRequested);
  const [loading, setLoading] = useState(false);

  if (isOwnProfile) {
    return null;
  }

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (following || requested) {
        await unfollowUser(userId);
        setFollowing(false);
        setRequested(false);
        onChange?.(false);
      } else {
        const state = await followUser(userId);
        setFollowing(state.isFollowing);
        setRequested(state.followRequested);
        if (state.isFollowing) onChange?.(true);
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
        following || requested
          ? "border border-[color:var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
          : "bg-[var(--accent)] text-white hover:opacity-90",
        loading && "opacity-60 cursor-not-allowed"
      )}
    >
      {loading
        ? "..."
        : following
          ? "Đang theo dõi"
          : requested
            ? "Đã gửi yêu cầu"
            : "Theo dõi"}
    </button>
  );
}
