"use client";

import { useState } from "react";
import type { UserProfile } from "../lib/profile-api";
import { updateMyProfile } from "../lib/profile-api";
import { FollowButton } from "./FollowButton";
import { ProfileAvatarUpload } from "./ProfileAvatarUpload";

type ProfileHeaderProps = {
  profile: UserProfile;
  onProfileUpdate?: (profile: UserProfile) => void;
};

export function ProfileHeader({ profile, onProfileUpdate }: ProfileHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [isPrivate, setIsPrivate] = useState(profile.isPrivate);
  const [saving, setSaving] = useState(false);
  const [followersCount, setFollowersCount] = useState(profile.followersCount);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const updated = await updateMyProfile({
        fullName: fullName.trim(),
        bio: bio.trim(),
        isPrivate,
      });
      onProfileUpdate?.(updated);
      setEditing(false);
    } catch (error) {
      console.error("Save profile failed:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="border-b border-[color:var(--border)] bg-[var(--surface)] p-5 sm:p-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <ProfileAvatarUpload
          profile={profile}
          onProfileUpdate={onProfileUpdate}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.035em] text-[var(--text-primary)]">
                {profile.fullName || profile.username}
              </h1>
              <p className="text-[var(--text-secondary)]">@{profile.username}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.isOwnProfile ? (
                <button
                  type="button"
                  onClick={() => setEditing((v) => !v)}
                  className="rounded-lg border border-[color:var(--border-strong)] px-4 py-2 text-sm font-semibold hover:bg-[var(--surface-muted)]"
                >
                  {editing ? "Hủy" : "Chỉnh sửa trang cá nhân"}
                </button>
              ) : (
                <FollowButton
                  userId={profile.id}
                  initialFollowing={profile.isFollowing}
                  initialRequested={profile.followRequested}
                  isOwnProfile={profile.isOwnProfile}
                  onChange={(f) =>
                    setFollowersCount((c) => (f ? c + 1 : Math.max(0, c - 1)))
                  }
                />
              )}
            </div>
          </div>

          {editing ? (
            <div className="mt-4 space-y-3">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Họ tên"
                className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Giới thiệu bản thân"
                rows={3}
                className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-sm resize-none"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(event) => setIsPrivate(event.target.checked)}
                />
                Tài khoản riêng tư
              </label>
              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                className="rounded-lg bg-[var(--text-primary)] px-5 py-2 text-sm font-semibold text-[var(--surface)] disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          ) : (
            profile.bio && (
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap">
                {profile.bio}
              </p>
            )
          )}

          <div className="mt-4 flex gap-6 text-sm">
            <span>
              <strong className="text-[var(--text-primary)]">
                {followersCount}
              </strong>{" "}
              <span className="text-[var(--text-secondary)]">người theo dõi</span>
            </span>
            <span>
              <strong className="text-[var(--text-primary)]">
                {profile.followingCount}
              </strong>{" "}
              <span className="text-[var(--text-secondary)]">đang theo dõi</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
