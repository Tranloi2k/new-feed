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
    <div className="mt-3 border-t border-[color:var(--border)] pt-2">
      {(displayLikes > 0 || commentCount > 0 || shareCount > 0) && (
        <div className="mb-2 flex items-center justify-between px-1 text-xs text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5">
            {displayLikes > 0 && (
              <>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] text-white">
                  ♥
                </span>
                <span>{displayLikes.toLocaleString("vi-VN")}</span>
              </>
            )}
          </span>
          <span className="flex gap-3">
            {commentCount > 0 && (
              <span>{commentCount} bình luận</span>
            )}
            {shareCount > 0 && <span>{shareCount} chia sẻ</span>}
          </span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-1">
        {actions.map((action) => (
          <motion.button
            key={action.key}
            type="button"
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.12 }}
            onClick={action.onClick}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] py-2.5 text-sm font-medium transition-colors duration-200",
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
            <span className="hidden sm:inline">{action.label}</span>
            {action.count != null && action.count > 0 && (
              <span className="tabular-nums text-xs opacity-80">
                {action.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
