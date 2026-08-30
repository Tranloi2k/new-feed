"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Plus, User } from "lucide-react";
import { getProfileHref } from "@/features/profile/lib/profile-routes";
import { cn } from "../utils/cn";
import { requestComposerOpen } from "../utils/composer-event";
import type { FeedUser } from "./FeedTopBar";

export function MobileBottomNav({ user }: { user?: FeedUser }) {
  const pathname = usePathname();
  const items = [
    { icon: Home, label: "Trang chủ", href: "/home" },
    { icon: MessageCircle, label: "Tin nhắn", href: "/messages" },
    { icon: Plus, label: "Đăng", primary: true },
    { icon: User, label: "Bạn", href: user ? getProfileHref(user) : "/login" },
  ];
  return (
    <nav className={cn("fixed bottom-0 left-0 right-0 z-50 lg:hidden", "border-t border-[color:var(--border)] bg-[var(--surface-elevated)] backdrop-blur-xl", "pb-[env(safe-area-inset-bottom)]")} aria-label="Điều hướng chính">
      <div className="mx-auto flex h-[var(--bottom-nav-height)] max-w-sm items-center justify-around px-3">
        {items.map((item) => {
          const active = Boolean(item.href && (pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href))));
          const classes = cn("flex h-11 w-11 items-center justify-center rounded-xl transition-colors", active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)]", item.primary && "border border-[color:var(--border-strong)] text-[var(--text-primary)]");
          if (item.primary) return <motion.button key={item.label} type="button" whileTap={{ scale: 0.9 }} onClick={requestComposerOpen} aria-label={item.label} className={classes}><item.icon className="h-[22px] w-[22px]" /></motion.button>;
          return <motion.div key={item.label} whileTap={{ scale: 0.9 }}><Link href={item.href!} aria-label={item.label} aria-current={active ? "page" : undefined} className={classes}><item.icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.8} /></Link></motion.div>;
        })}
      </div>
    </nav>
  );
}
