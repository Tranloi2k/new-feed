"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Home, MessageCircle, Search, SquarePen, User } from "lucide-react";
import { getProfileHref } from "@/features/profile/lib/profile-routes";
import { Avatar } from "../primitives/Avatar";
import { cn } from "../utils/cn";
import { requestComposerOpen } from "../utils/composer-event";
import type { FeedUser } from "./FeedTopBar";

const navItems = [
  { icon: Home, label: "Trang chủ", href: "/home" },
  { icon: Search, label: "Tìm kiếm", href: "/home" },
  { icon: MessageCircle, label: "Tin nhắn", href: "/home" },
  { icon: Bookmark, label: "Đã lưu", href: "/home" },
];

export function LeftNav({ user }: { user?: FeedUser }) {
  const pathname = usePathname();
  const profileHref = user ? getProfileHref(user) : "/login";

  return (
    <aside className="hidden lg:block">
      <nav className="sticky top-[calc(var(--header-height)+1.5rem)] flex flex-col items-center gap-2">
        {navItems.map((item, index) => {
          const active = index === 0 && pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-150 active:scale-95",
                active
                  ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
              )}
            >
              <item.icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.8} />
            </Link>
          );
        })}

        <Link
          href={profileHref}
          aria-label="Hồ sơ"
          title="Hồ sơ"
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-150 active:scale-95",
            pathname.startsWith("/profile")
              ? "bg-[var(--surface)] shadow-sm"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
          )}
        >
          {user ? (
            <Avatar src={user.avatarUrl} name={user.fullName || user.username} size="sm" />
          ) : (
            <User className="h-[22px] w-[22px]" />
          )}
        </Link>

        <button
          type="button"
          onClick={requestComposerOpen}
          className="mt-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--text-primary)] text-[var(--surface)] transition-transform active:scale-95"
          aria-label="Tạo bài viết"
          title="Tạo bài viết"
        >
          <SquarePen className="h-5 w-5" />
        </button>
      </nav>
    </aside>
  );
}
