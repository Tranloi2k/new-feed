"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { Avatar } from "@/features/feed/ui/primitives/Avatar";
import { uploadAvatar } from "../actions/uploadAvatar";
import { updateMyProfile } from "../lib/profile-api";
import type { UserProfile } from "../lib/profile-api";

type ProfileAvatarUploadProps = {
  profile: UserProfile;
  onProfileUpdate?: (profile: UserProfile) => void;
};

export function ProfileAvatarUpload({
  profile,
  onProfileUpdate,
}: ProfileAvatarUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displaySrc = previewUrl || profile.avatarUrl || undefined;
  const displayName = profile.fullName || profile.username;

  const handleFile = async (file: File) => {
    setError(null);
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    try {
      const url = await uploadAvatar(file);
      const updated = await updateMyProfile({ avatarUrl: url });
      onProfileUpdate?.(updated);
      setPreviewUrl(null);
      router.refresh();
    } catch (err) {
      setPreviewUrl(null);
      setError(err instanceof Error ? err.message : "Upload thất bại");
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  if (!profile.isOwnProfile) {
    return (
      <Avatar src={profile.avatarUrl || undefined} name={displayName} size="profile" />
    );
  }

  return (
    <div className="relative shrink-0">
      <Avatar src={displaySrc} name={displayName} size="profile" />
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--background)] bg-[var(--text-primary)] text-[var(--surface)] transition hover:opacity-85 disabled:opacity-60"
        aria-label="Đổi ảnh đại diện"
      >
        <Camera className="h-4 w-4" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="sr-only"
        onChange={onInputChange}
      />
      {error && (
        <p className="absolute left-0 top-full z-10 mt-2 max-w-[220px] rounded-lg bg-red-500/10 px-2 py-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
