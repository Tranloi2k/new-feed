"use client";

import { motion } from "framer-motion";
import { Bell, Home, Plus, Search, User } from "lucide-react";
import { cn } from "../utils/cn";
import { requestComposerOpen } from "../utils/composer-event";

const items = [
  { icon: Home, label: "Trang chủ", active: true },
  { icon: Search, label: "Tìm", active: false },
  { icon: Plus, label: "Đăng", active: false, primary: true },
  { icon: Bell, label: "Thông báo", active: false },
  { icon: User, label: "Bạn", active: false },
];

export function MobileBottomNav() {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
        "border-t border-[color:var(--border)] bg-[var(--surface-elevated)] backdrop-blur-xl",
        "pb-[env(safe-area-inset-bottom)]"
      )}
      aria-label="Điều hướng chính"
    >
      <div className="mx-auto flex h-[var(--bottom-nav-height)] max-w-lg items-center justify-around px-2">
        {items.map((item) => (
          <motion.button
            key={item.label}
            type="button"
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.12 }}
            onClick={item.primary ? requestComposerOpen : undefined}
            aria-label={item.label}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
              item.active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)]",
              item.primary && "border border-[color:var(--border-strong)] text-[var(--text-primary)]"
            )}
          >
            <item.icon className="h-[22px] w-[22px]" strokeWidth={item.active ? 2.4 : 1.8} />
          </motion.button>
        ))}
      </div>
    </nav>
  );
}
