"use server";

import { cookies } from "next/headers";
import { getApiUrl } from "@/features/shared/lib/env";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export async function uploadAvatar(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("Vui lòng chọn ảnh đại diện");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Chỉ chấp nhận ảnh JPEG, PNG, GIF hoặc WebP");
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("Ảnh đại diện tối đa 2MB");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) {
    throw new Error("Bạn cần đăng nhập để đổi ảnh đại diện");
  }

  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${getApiUrl()}/api/media/upload/avatar`, {
    method: "POST",
    credentials: "include",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json.success) {
    throw new Error(json.message || `Upload failed (${response.status})`);
  }

  const url = json.data?.url as string | undefined;
  if (!url) {
    throw new Error("Không nhận được URL ảnh từ server");
  }
  return url;
}
