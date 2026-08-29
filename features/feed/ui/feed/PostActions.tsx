"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import { cn } from "../utils/cn";

type PostActionsProps = {
  likeCount: number;
  commentCount: number;
  shareCount: number;
  onComment: () => void;
  commentsOpen: boolean;
};

export function PostActions({
  likeCount,
  commentCount,
  shareCount,
  onComment,
  commentsOpen,
}: PostActionsProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const displayLikes = liked ? likeCount + 1 : likeCount;

  const actions = [
    {
      key: "like",
      icon: Heart,
      label: "Thích",
      count: displayLikes,
      active: liked,
      onClick: () => setLiked((v) => !v),
    },
    {
      key: "comment",
      icon: MessageCircle,
      label: "Bình luận",
      count: commentCount,
      active: commentsOpen,
      onClick: onComment,
    },
    {
      key: "share",
      icon: Share2,
      label: "Chia sẻ",
      count: shareCount,
      active: false,
      onClick: () => {},
    },
    {
      key: "bookmark",
      icon: Bookmark,
      label: "Lưu",
      count: null,
      active: bookmarked,
      onClick: () => setBookmarked((v) => !v),
    },
  ] as const;

  return (
    <div className="mt-3">
      {(displayLikes > 0 || commentCount > 0 || shareCount > 0) && (
        <p className="mb-2 text-xs text-[var(--text-muted)]">
          {[displayLikes > 0 && `${displayLikes.toLocaleString("vi-VN")} lượt thích`, commentCount > 0 && `${commentCount} phản hồi`, shareCount > 0 && `${shareCount} lượt chia sẻ`].filter(Boolean).join(" · ")}
        </p>
      )}

      <div className="flex items-center gap-1">
        {actions.map((action) => (
          <motion.button
            key={action.key}
            type="button"
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.12 }}
            onClick={action.onClick}
            aria-label={action.label}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-full p-2 text-sm font-medium transition-colors duration-150",
              "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
              action.active && "text-[var(--accent)]"
            )}
          >
            <action.icon
              className={cn(
                "h-[18px] w-[18px]",
                action.key === "like" && action.active && "fill-[var(--accent)]"
              )}
            />
            {action.count != null && action.count > 0 && (
              <span className="tabular-nums text-[13px] opacity-80">
                {action.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
