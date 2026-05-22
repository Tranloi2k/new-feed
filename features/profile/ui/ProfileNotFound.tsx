"use client";

import Link from "next/link";
import { UserX } from "lucide-react";

type ProfileNotFoundProps = {
  username: string;
};

export function ProfileNotFound({ username }: ProfileNotFoundProps) {
  return (
    <div className="card-surface flex flex-col items-center gap-4 p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--accent-soft)] text-[var(--accent)]">
        <UserX className="h-8 w-8" />
      </div>
      <div>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          Không tìm thấy người dùng
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Tài khoản <span className="font-medium">@{username}</span> không tồn
          tại hoặc đã bị xóa.
        </p>
      </div>
      <Link
        href="/home"
        className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
