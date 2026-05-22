"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

type ProfileLoadErrorProps = {
  message?: string;
};

export function ProfileLoadError({ message }: ProfileLoadErrorProps) {
  return (
    <div className="card-surface flex flex-col items-center gap-4 p-12 text-center">
      <p className="text-lg font-semibold text-[var(--text-primary)]">
        Không tải được trang cá nhân
      </p>
      <p className="text-sm text-[var(--text-secondary)]">
        {message || "Backend tạm lỗi. Thử restart: ./dev.sh"}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </button>
        <Link
          href="/home"
          className="rounded-full border border-[color:var(--border)] px-5 py-2.5 text-sm font-semibold"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
