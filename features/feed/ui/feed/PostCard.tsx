"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import CommentSection from "@/app/components/CommentSection";
import { MAX_CONTENT_LENGTH } from "@/features/feed/constants";
import { Avatar } from "../primitives/Avatar";
import { VerifiedBadge } from "../primitives/VerifiedBadge";
import { IconButton } from "../primitives/IconButton";
import { PostMedia } from "./PostMedia";
import { PostActions } from "./PostActions";
import { cn } from "../utils/cn";
import { getProfileHref } from "@/features/profile/lib/profile-routes";

export type PostCardProps = {
  postId: string;
  userId?: number;
  author: string;
  username?: string;
  avatarUrl?: string;
  time: string;
  content: string;
  shareCount: number;
  commentCount: number;
  likeCount: number;
  mediaUrls?: string[] | null;
  verified?: boolean;
};

function formatContent(text: string) {
  if (!text) return null;
  return text.split(/(\s+)/).map((part, index) => {
    if (part.match(/^#\w+/)) {
      return (
        <span
          key={index}
          className="font-medium text-[var(--accent)] hover:underline cursor-pointer"
        >
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function PostCard({
  postId,
  userId,
  author,
  username,
  avatarUrl,
  time,
  content,
  commentCount,
  shareCount,
  likeCount,
  mediaUrls,
  verified,
}: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const isLongContent = content.length > MAX_CONTENT_LENGTH;
  const profileHref =
    userId != null || username
      ? getProfileHref({ id: userId, username })
      : null;

  const displayContent = () => {
    if (!content) return null;
    const text =
      isLongContent && !isExpanded
        ? content.substring(0, MAX_CONTENT_LENGTH) + "..."
        : content;
    return formatContent(text);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden border-b border-[color:var(--border)] bg-[var(--surface)]"
      role="article"
    >
      <div className="px-4 py-5 sm:px-5">
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {profileHref ? (
              <Link href={profileHref} className="shrink-0">
                <Avatar src={avatarUrl} name={author} size="md" />
              </Link>
            ) : (
              <Avatar src={avatarUrl} name={author} size="md" />
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 leading-none">
                {profileHref ? (
                  <Link href={profileHref}
                    className="truncate font-semibold text-[15px] text-[var(--text-primary)] hover:underline"
                  >
                    {author}
                  </Link>
                ) : (
                  <h3 className="truncate font-semibold text-[15px] text-[var(--text-primary)]">
                    {author}
                  </h3>
                )}
                {verified && <VerifiedBadge />}
              </div>
              <p className="mt-1 truncate text-sm text-[var(--text-muted)]">
                {username ? `@${username}` : ""}
                <span>{username ? " · " : ""}{time}</span>
              </p>
            </div>
          </div>
          <IconButton label="Tùy chọn bài viết">
            <MoreHorizontal className="h-5 w-5" />
          </IconButton>
        </header>

        {content && (
          <div
            className={cn(
              "mt-3 pl-[52px] text-[15px] leading-[1.55] text-[var(--text-primary)]",
              "whitespace-pre-wrap break-words"
            )}
          >
            {displayContent()}
            {isLongContent && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-1 font-semibold text-[var(--accent)] hover:underline"
              >
                {isExpanded ? "Thu gọn" : "Xem thêm"}
              </button>
            )}
          </div>
        )}

        <div className="pl-[52px]">
          <PostMedia mediaUrls={mediaUrls ?? []} />
          <PostActions
            likeCount={likeCount}
            commentCount={commentCount}
            shareCount={shareCount}
            commentsOpen={commentsOpen}
            onComment={() => setCommentsOpen((v) => !v)}
          />
        </div>
      </div>

      <AnimatePresence>
        {commentsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[color:var(--border)] bg-[var(--surface-muted)]/50"
          >
            <CommentSection postId={postId} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
