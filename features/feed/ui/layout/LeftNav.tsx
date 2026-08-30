"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, SquarePen, User } from "lucide-react";
import { getProfileHref } from "@/features/profile/lib/profile-routes";
import { cn } from "../utils/cn";
import { requestComposerOpen } from "../utils/composer-event";
import type { FeedUser } from "./FeedTopBar";

const navItems = [
  { icon: Home, label: "Trang chủ", href: "/home" },
  { icon: MessageCircle, label: "Tin nhắn", href: "/messages" },
];

export function LeftNav({
  user,
  expanded = false,
}: {
  user?: FeedUser;
  expanded?: boolean;
}) {
  const pathname = usePathname();
  const profileHref = user ? getProfileHref(user) : "/login";

  return (
    <aside
      className={cn(
        "fixed bottom-0 left-0 top-[var(--header-height)] z-20 hidden w-20 overflow-hidden bg-[var(--background)] lg:block xl:w-[220px]",
        expanded && "lg:w-[var(--nav-width)]"
      )}
    >
      <nav className="flex h-full flex-col gap-1 px-2 py-5">
        <button
          type="button"
          onClick={requestComposerOpen}
          className={cn(
            "flex h-12 w-full items-center justify-center gap-3 rounded-full px-3 text-[15px] font-medium text-[var(--text-secondary)] transition-all duration-150 hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] xl:justify-start",
            expanded && "lg:justify-start lg:px-4"
          )}
          aria-label="Tạo bài viết"
          title="Tạo bài viết"
        >
          <SquarePen className="h-[22px] w-[22px] shrink-0" strokeWidth={1.8} />
          <span className={cn("hidden xl:inline", expanded && "lg:inline")}>Tạo bài viết</span>
        </button>

        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className={cn(
                "flex h-12 w-full items-center justify-center gap-3 rounded-full px-3 text-[15px] font-medium transition-all duration-150 active:scale-[0.98] xl:justify-start xl:px-3",
                expanded && "lg:justify-start lg:px-4",
                active
                  ? "font-bold text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
              )}
            >
              <item.icon className="h-[22px] w-[22px] shrink-0" strokeWidth={active ? 2.4 : 1.8} />
              <span className={cn("hidden xl:inline", expanded && "lg:inline")}>{item.label}</span>
            </Link>
          );
        })}

        <Link
          href={profileHref}
          aria-label="Hồ sơ"
          title="Hồ sơ"
          className={cn(
            "flex h-12 w-full items-center justify-center gap-3 rounded-full px-3 text-[15px] font-medium transition-all duration-150 active:scale-[0.98] xl:justify-start",
            expanded && "lg:justify-start lg:px-4",
            pathname.startsWith("/profile")
              ? "font-bold text-[var(--text-primary)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
          )}
        >
          <User className="h-[22px] w-[22px] shrink-0" />
          <span className={cn("hidden xl:inline", expanded && "lg:inline")}>Hồ sơ</span>
        </Link>

      </nav>
    </aside>
  );
}
