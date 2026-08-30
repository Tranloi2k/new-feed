"use client";

import { useState } from "react";
import { CalendarDays, Lock } from "lucide-react";
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [followersCount, setFollowersCount] = useState(profile.followersCount);

  const cancelEditing = () => {
    setFullName(profile.fullName || "");
    setBio(profile.bio || "");
    setIsPrivate(profile.isPrivate);
    setSaveError(null);
    setEditing(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateMyProfile({
        fullName: fullName.trim(),
        bio: bio.trim(),
        isPrivate,
      });
      onProfileUpdate?.(updated);
      setEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Không thể lưu thay đổi");
    } finally {
      setSaving(false);
    }
  };

  const joinedAt = new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(new Date(profile.createdAt));

  return (
    <section className="bg-[var(--background)] px-4 pb-6 pt-7 sm:px-6 sm:pt-9">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 pt-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-[26px] font-bold tracking-[-0.045em] text-[var(--text-primary)] sm:text-[30px]">
              {profile.fullName || profile.username}
            </h1>
            {profile.isPrivate && <Lock className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-label="Tài khoản riêng tư" />}
          </div>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">@{profile.username}</p>
        </div>
        <ProfileAvatarUpload profile={profile} onProfileUpdate={onProfileUpdate} />
      </div>

      {!editing && profile.bio && (
        <p className="mt-5 max-w-[58ch] whitespace-pre-wrap text-[15px] leading-6 text-[var(--text-primary)]">
          {profile.bio}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <CalendarDays className="h-4 w-4" />
        <span>Tham gia {joinedAt}</span>
      </div>

      <div className="mt-5 flex items-center gap-6 text-sm">
        <span><strong className="font-semibold text-[var(--text-primary)]">{followersCount.toLocaleString("vi-VN")}</strong> <span className="text-[var(--text-secondary)]">người theo dõi</span></span>
        <span><strong className="font-semibold text-[var(--text-primary)]">{profile.followingCount.toLocaleString("vi-VN")}</strong> <span className="text-[var(--text-secondary)]">đang theo dõi</span></span>
      </div>

      <div className="mt-6">
        {profile.isOwnProfile ? (
          <button
            type="button"
            onClick={() => editing ? cancelEditing() : setEditing(true)}
            className="h-11 w-full rounded-xl border border-[color:var(--border-strong)] text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            {editing ? "Hủy chỉnh sửa" : "Chỉnh sửa trang cá nhân"}
          </button>
        ) : (
          <FollowButton
            userId={profile.id}
            initialFollowing={profile.isFollowing}
            initialRequested={profile.followRequested}
            isOwnProfile={profile.isOwnProfile}
            onChange={(following) => setFollowersCount((count) => following ? count + 1 : Math.max(0, count - 1))}
          />
        )}
      </div>

      {editing && (
        <div className="mt-5 space-y-4 rounded-2xl border border-[color:var(--border)] p-4 sm:p-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">Tên hiển thị</span>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Họ tên" maxLength={100} className="h-11 w-full rounded-xl border border-[color:var(--border)] bg-transparent px-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-strong)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">Tiểu sử</span>
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Giới thiệu bản thân" rows={4} maxLength={300} className="w-full resize-none rounded-xl border border-[color:var(--border)] bg-transparent px-3.5 py-3 text-sm leading-5 text-[var(--text-primary)] outline-none focus:border-[var(--border-strong)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]" />
            <span className="mt-1 block text-right text-[11px] text-[var(--text-muted)]">{bio.length}/300</span>
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl py-1">
            <span><span className="block text-sm font-semibold text-[var(--text-primary)]">Tài khoản riêng tư</span><span className="mt-0.5 block text-xs text-[var(--text-muted)]">Bạn phê duyệt người có thể theo dõi mình.</span></span>
            <input type="checkbox" checked={isPrivate} onChange={(event) => setIsPrivate(event.target.checked)} className="h-5 w-5 accent-[var(--text-primary)]" />
          </label>
          {saveError && <p role="alert" className="text-sm text-[var(--danger)]">{saveError}</p>}
          <button type="button" onClick={saveProfile} disabled={saving || !fullName.trim()} className="h-11 w-full rounded-xl bg-[var(--text-primary)] text-sm font-semibold text-[var(--surface)] transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40">
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      )}
    </section>
  );
}
