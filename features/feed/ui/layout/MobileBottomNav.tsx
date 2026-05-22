"use client";

import { motion } from "framer-motion";
import { Bell, Home, Plus, Search, User } from "lucide-react";
import { cn } from "../utils/cn";

const items = [
  { icon: Home, label: "Home", active: true },
  { icon: Search, label: "Tìm", active: false },
  { icon: Plus, label: "Đăng", active: false, primary: true },
  { icon: Bell, label: "TB", active: false },
  { icon: User, label: "Bạn", active: false },
];

export function MobileBottomNav() {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
        "glass-panel border-t border-[color:var(--border)]",
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
            aria-label={item.label}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors",
              item.primary
                ? "relative -mt-5"
                : item.active
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-muted)]"
            )}
          >
            {item.primary ? (
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-violet-500 text-white shadow-lg shadow-[var(--accent-glow)]">
                <item.icon className="h-6 w-6" />
              </span>
            ) : (
              <item.icon className="h-5 w-5" />
            )}
            {!item.primary && <span>{item.label}</span>}
          </motion.button>
        ))}
      </div>
    </nav>
  );
}
