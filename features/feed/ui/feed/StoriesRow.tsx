"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Avatar } from "../primitives/Avatar";
import { cn } from "../utils/cn";

const stories = [
  { id: "create", label: "Tạo tin", isCreate: true },
  { id: "1", label: "Bạn", name: "Mai Linh", gradient: "from-pink-500 to-orange-400" },
  { id: "2", label: "Dev", name: "Hoàng", gradient: "from-violet-500 to-indigo-500" },
  { id: "3", label: "Design", name: "Sarah", gradient: "from-cyan-500 to-blue-500" },
  { id: "4", label: "PM", name: "Khoa", gradient: "from-emerald-500 to-teal-500" },
  { id: "5", label: "AI", name: "Alex", gradient: "from-fuchsia-500 to-purple-500" },
];

export function StoriesRow() {
  return (
    <section
      className="card-surface mb-4 overflow-hidden p-3"
      aria-label="Stories"
    >
      <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
        {stories.map((story, index) => (
          <motion.button
            key={story.id}
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.04, duration: 0.2 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex shrink-0 flex-col items-center gap-2"
          >
            <div
              className={cn(
                "relative flex h-[72px] w-[72px] items-center justify-center rounded-[var(--radius-xl)] p-[3px]",
                story.isCreate
                  ? "bg-[var(--surface-muted)]"
                  : `bg-gradient-to-tr ${story.gradient}`
              )}
            >
              <div className="flex h-full w-full items-center justify-center rounded-[18px] bg-[var(--surface)]">
                {story.isCreate ? (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-muted)]">
                    <Plus className="h-6 w-6 text-[var(--accent)]" />
                  </div>
                ) : (
                  <Avatar name={story.name ?? story.label} size="lg" />
                )}
              </div>
            </div>
            <span className="max-w-[72px] truncate text-xs font-medium text-[var(--text-secondary)]">
              {story.isCreate ? "Tạo tin" : story.label}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
