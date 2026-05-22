"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useRouter } from "next/navigation";
import { useApolloClient } from "@apollo/client/react";
import {
  Bell,
  Home,
  LogOut,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { logoutAction } from "@/features/auth/actions/auth";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { NotificationList } from "@/features/notifications/components/NotificationList";
import { APP_NAME } from "@/features/auth/constants";
import { getProfileHref } from "@/features/profile/lib/profile-routes";
import { IconButton } from "../primitives/IconButton";
import { Avatar } from "../primitives/Avatar";
import { cn } from "../utils/cn";

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
  const [hidden, setHidden] = useState(false);
  const router = useRouter();
  const apolloClient = useApolloClient();
  const { notifications, unreadCount } = useNotifications();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (latest > 80 && latest > prev) setHidden(true);
    else if (latest < prev || latest < 40) setHidden(false);
  });

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
    <motion.header
      initial={false}
      animate={{ y: hidden ? -72 : 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 glass-panel",
        "h-[var(--header-height)] border-b border-[color:var(--border)]"
      )}
    >
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-violet-500 text-white shadow-lg shadow-[var(--accent-glow)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="hidden font-bold tracking-tight text-[var(--text-primary)] sm:inline">
              {APP_NAME}
            </span>
          </div>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              placeholder="Tìm kiếm bài viết, người dùng, hashtag..."
              className={cn(
                "w-full rounded-full border border-[color:var(--border)] bg-[var(--surface-muted)] py-2.5 pl-10 pr-4 text-sm",
                "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
                "transition-all duration-200 focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
              )}
            />
          </div>
        </div>

        <div className="hidden items-center gap-1 lg:flex">
          <IconButton label="Trang chủ" active>
            <Home className="h-5 w-5" />
          </IconButton>
        </div>

        <div className="flex items-center gap-1">
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
    </motion.header>
  );
}
