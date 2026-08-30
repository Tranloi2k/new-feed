"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useApolloClient } from "@apollo/client/react";
import {
  Bell,
  LogOut,
  User,
} from "lucide-react";
import { logoutAction } from "@/features/auth/actions/auth";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { NotificationList } from "@/features/notifications/components/NotificationList";
import { APP_NAME } from "@/features/auth/constants";
import { getProfileHref } from "@/features/profile/lib/profile-routes";
import { IconButton } from "../primitives/IconButton";
import { Avatar } from "../primitives/Avatar";

export type FeedUser = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
};

export function FeedTopBar({ user }: { user?: FeedUser }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const apolloClient = useApolloClient();
  const { notifications, unreadCount } = useNotifications();

  const profileHref = user ? getProfileHref(user) : "/login";

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const result = await logoutAction();
      if (result.success) {
        await apolloClient.clearStore();
        router.push("/login");
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 h-[var(--header-height)] border-b border-[color:var(--border)] bg-[var(--background)]/92 backdrop-blur-xl"
    >
      <div className="grid h-full w-full grid-cols-3 items-center px-4 lg:px-5">
        <div className="flex items-center">
          <Link href="/home" className="inline-flex items-center gap-2" aria-label={APP_NAME}>
            <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[var(--text-primary)] text-[13px] font-black tracking-[-0.08em] text-[var(--surface)]">
              NF
            </span>
            <span className="hidden text-[15px] font-bold tracking-[-0.03em] text-[var(--text-primary)] xl:inline">
              {APP_NAME}
            </span>
          </Link>
        </div>

        <p className="text-center text-[15px] font-semibold text-[var(--text-primary)]">
          {pathname.startsWith("/messages") ? "Tin nhắn" : ""}
        </p>

        <div className="flex items-center justify-end gap-1">
          <div className="relative">
            <IconButton
              label="Thông báo"
              active={showNotifications}
              onClick={() => setShowNotifications((v) => !v)}
            >
              <Bell className="h-5 w-5" />
            </IconButton>
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-[min(100vw-2rem,380px)]">
                  <NotificationList notifications={notifications} />
                </div>
              </>
            )}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu((v) => !v)}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              aria-label="Menu người dùng"
            >
              <Avatar
                src={user?.avatarUrl}
                name={user?.fullName || user?.username || "User"}
                size="md"
              />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]"
                >
                  <div className="border-b border-[color:var(--border)] p-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={user?.avatarUrl}
                        name={user?.fullName || user?.username || "U"}
                        size="lg"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--text-primary)]">
                          {user?.fullName || user?.username}
                        </p>
                        <p className="truncate text-xs text-[var(--text-secondary)]">
                          @{user?.username}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={profileHref}
                    onClick={() => setShowUserMenu(false)}
                    className="flex w-full items-center gap-3 border-b border-[color:var(--border)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
                  >
                    <User className="h-4 w-4" />
                    Trang cá nhân
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)] disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
