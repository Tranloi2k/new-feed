"use client";

import Link from "next/link";
import { Bell, RefreshCw } from "lucide-react";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { getProfileHref } from "@/features/profile/lib/profile-routes";
import { Avatar } from "../primitives/Avatar";
import type { FeedUser } from "./FeedTopBar";

function formatTime(iso: string) {
  const date = new Date(iso);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
  return date.toLocaleDateString("vi-VN");
}

export function RightPanel({ user }: { user?: FeedUser }) {
  const { notifications, unreadCount, loading, error, reload } = useNotifications();
  const profileHref = user ? getProfileHref(user) : "/login";

  return (
    <aside className="hidden xl:block">
      <div className="fixed bottom-0 right-0 top-[var(--header-height)] w-[calc((100vw-720px)/2)] min-w-[280px] overflow-hidden px-5 py-6">
        <div className="ml-auto max-w-[340px] space-y-7">
        {user && (
          <Link href={profileHref} className="flex items-center gap-3 rounded-xl px-1 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
            <Avatar src={user.avatarUrl} name={user.fullName || user.username} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{user.fullName || user.username}</p>
              <p className="truncate text-xs text-[var(--text-muted)]">@{user.username}</p>
            </div>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Hồ sơ</span>
          </Link>
        )}

        <section aria-labelledby="activity-heading">
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 id="activity-heading" className="text-[15px] font-bold text-[var(--text-primary)]">Hoạt động gần đây</h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[var(--text-primary)] px-2 py-0.5 text-[10px] font-bold text-[var(--surface)]">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </div>
            <button type="button" onClick={reload} disabled={loading} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50" aria-label="Làm mới thông báo">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl bg-[var(--surface)]">
            {loading && notifications.length === 0 && (
              <div className="space-y-4 p-4" aria-label="Đang tải thông báo">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="shimmer h-9 w-9 shrink-0 rounded-full" />
                    <span className="shimmer mt-1 h-8 flex-1 rounded-lg" />
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="px-5 py-8 text-center">
                <Bell className="mx-auto h-5 w-5 text-[var(--text-muted)]" />
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Không tải được hoạt động.</p>
              </div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="px-5 py-8 text-center">
                <Bell className="mx-auto h-5 w-5 text-[var(--text-muted)]" />
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Chưa có hoạt động mới.</p>
              </div>
            )}

            {notifications.length > 0 && (
              <ul>
                {notifications.slice(0, 5).map((notification) => (
                  <li key={notification.id} className="flex gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--surface-muted)]">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.read ? "bg-[var(--border-strong)]" : "bg-[var(--text-primary)]"}`} />
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-[13px] leading-5 text-[var(--text-secondary)]">{notification.message}</p>
                      <p className="mt-1 text-[11px] text-[var(--text-muted)]">{formatTime(notification.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

          <p className="px-1 text-[11px] leading-5 text-[var(--text-muted)]">© 2026 NewFeed · Quyền riêng tư · Điều khoản</p>
        </div>
      </div>
    </aside>
  );
}
