"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bookmark,
  Compass,
  Home,
  MessageCircle,
  User,
  Users,
} from "lucide-react";
import { cn } from "../utils/cn";
import type { FeedUser } from "./FeedTopBar";
import { Avatar } from "../primitives/Avatar";
import { getProfileHref } from "@/features/profile/lib/profile-routes";

const navItems = [
  { icon: Home, label: "Trang chủ", href: "/home" },
  { icon: Compass, label: "Khám phá", href: "/home" },
  { icon: Users, label: "Cộng đồng", href: "/home" },
  { icon: MessageCircle, label: "Tin nhắn", href: "/home" },
  { icon: Bookmark, label: "Đã lưu", href: "/home" },
];

export function LeftNav({ user }: { user?: FeedUser }) {
  const pathname = usePathname();
  const profileHref = user ? getProfileHref(user) : "/login";

  return (
    <aside className="hidden lg:block">
      <nav className="sticky top-[calc(var(--header-height)+1rem)] space-y-1 px-2">
        {user && (
          <Link
            href={profileHref}
            className="mb-4 flex w-full items-center gap-3 rounded-[var(--radius-lg)] p-3 text-left transition-colors hover:bg-[var(--surface-muted)]"
          >
            <Avatar
              src={user.avatarUrl}
              name={user.fullName || user.username}
              size="lg"
              showOnline
            />
            <div className="min-w-0">
              <p className="truncate font-semibold text-[var(--text-primary)]">
                {user.fullName}
              </p>
              <p className="truncate text-sm text-[var(--text-secondary)]">
                @{user.username}
              </p>
            </div>
          </Link>
        )}

        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex w-full items-center gap-3 rounded-[var(--radius-lg)] px-4 py-3 text-left text-[15px] font-medium transition-colors duration-200",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <Link
          href={profileHref}
          className={cn(
            "flex w-full items-center gap-3 rounded-[var(--radius-lg)] px-4 py-3 text-left text-[15px] font-medium transition-colors duration-200",
            pathname.startsWith("/profile")
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
          )}
        >
          <User className="h-5 w-5 shrink-0" />
          <span>Hồ sơ</span>
        </Link>
      </nav>
    </aside>
  );
}
