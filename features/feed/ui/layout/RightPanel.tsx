"use client";

import { motion } from "framer-motion";
import { Hash, TrendingUp, UserPlus } from "lucide-react";
import { Avatar } from "../primitives/Avatar";
import { cn } from "../utils/cn";

const trendingTags = [
  { tag: "#NextJS", posts: "12.4K" },
  { tag: "#AI2026", posts: "8.2K" },
  { tag: "#StartupVN", posts: "5.1K" },
  { tag: "#DesignSystems", posts: "3.8K" },
];

const suggestedUsers = [
  { name: "Mai Linh", username: "mailinh", online: true },
  { name: "Hoàng Dev", username: "hoangdev", online: true },
  { name: "Sarah UI", username: "sarahui", online: false },
  { name: "Khoa Product", username: "khoapm", online: true },
];

export function RightPanel() {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-[calc(var(--header-height)+1rem)] space-y-4">
        <section className="card-surface overflow-hidden p-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
            <h3 className="font-semibold text-[var(--text-primary)]">
              Xu hướng
            </h3>
          </div>
          <ul className="space-y-3">
            {trendingTags.map((item, i) => (
              <motion.li
                key={item.tag}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
              >
                <button
                  type="button"
                  className="group w-full text-left transition-colors hover:text-[var(--accent)]"
                >
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
                    <span className="font-semibold text-[var(--text-primary)]">
                      {item.tag}
                    </span>
                  </div>
                  <p className="mt-0.5 pl-5 text-xs text-[var(--text-secondary)]">
                    {item.posts} bài viết
                  </p>
                </button>
              </motion.li>
            ))}
          </ul>
        </section>

        <section className="card-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)]">
              Gợi ý theo dõi
            </h3>
            <button
              type="button"
              className="text-xs font-medium text-[var(--accent)] hover:underline"
            >
              Xem tất cả
            </button>
          </div>
          <ul className="space-y-3">
            {suggestedUsers.map((person) => (
              <li
                key={person.username}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar
                    name={person.name}
                    size="md"
                    showOnline={person.online}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {person.name}
                    </p>
                    <p className="truncate text-xs text-[var(--text-secondary)]">
                      @{person.username}
                    </p>
                  </div>
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    "bg-[var(--text-primary)] text-[var(--surface)] hover:opacity-90"
                  )}
                >
                  <UserPlus className="mr-1 inline h-3 w-3" />
                  Theo
                </motion.button>
              </li>
            ))}
          </ul>
        </section>

        <p className="px-2 text-xs leading-relaxed text-[var(--text-muted)]">
          © 2026 NewFeed · Điều khoản · Quyền riêng tư · Trợ giúp
        </p>
      </div>
    </aside>
  );
}
