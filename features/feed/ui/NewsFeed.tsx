"use client";

import { useQuery } from "@apollo/client/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import {
  GetNewsFeedDocument,
  type GetNewsFeedQuery,
} from "@/features/feed/lib/documents";
import { POST_REFRESH_THRESHOLD } from "@/features/feed/constants";
import { Composer } from "./feed/Composer";
import { PostCard } from "./feed/PostCard";
import { FeedSkeletons } from "./feed/FeedSkeletons";
import {
  FeedEmpty,
  FeedEndMessage,
  FeedError,
  FeedLoadMoreSpinner,
} from "./feed/FeedStates";

export function NewsFeed() {
  const [cursor, setCursor] = useState<number | null>(null);
  const { loading, error, data, fetchMore, refetch } =
    useQuery<GetNewsFeedQuery>(GetNewsFeedDocument, {
      variables: { limit: 10, cursor },
      notifyOnNetworkStatusChange: true,
    });

  const observerTarget = useRef<HTMLDivElement>(null);
  const lastVisibleTimeRef = useRef<number>(0);

  const loadMore = useCallback(() => {
    if (data?.getNewsFeed.hasMore && !loading) {
      fetchMore({
        variables: { cursor: data.getNewsFeed.nextCursor },
      });
      setCursor(data.getNewsFeed.nextCursor ?? null);
    }
  }, [data, fetchMore, loading]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        lastVisibleTimeRef.current = Date.now();
      } else if (document.visibilityState === "visible") {
        const timeAway = Date.now() - lastVisibleTimeRef.current;
        if (timeAway >= POST_REFRESH_THRESHOLD) {
          setCursor(null);
          refetch();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [refetch]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          data?.getNewsFeed.hasMore &&
          !loading
        ) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "120px" }
    );
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [data, loading, loadMore]);

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInSeconds = Math.floor(
      (now.getTime() - postDate.getTime()) / 1000
    );
    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} ngày`;
    return postDate.toLocaleDateString("vi-VN");
  };

  const posts = data?.getNewsFeed.posts ?? [];
  const isInitialLoading = loading && !data;

  return (
    <>
      <div className="sticky top-[var(--header-height)] z-30 grid grid-cols-2 border-b border-[color:var(--border)] bg-[var(--surface-elevated)] backdrop-blur-xl">
        <button className="relative h-14 text-sm font-semibold text-[var(--text-primary)]">
          Dành cho bạn
          <span className="absolute inset-x-7 bottom-0 h-0.5 rounded-full bg-[var(--text-primary)]" />
        </button>
        <button className="h-14 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
          Đang theo dõi
        </button>
      </div>
      <Composer />

      {isInitialLoading && <FeedSkeletons />}

      {error && <FeedError onRetry={() => refetch()} />}

      <AnimatePresence mode="popLayout">
        {!error &&
          posts.map((post) => (
            <PostCard
              key={post.id}
              postId={String(post.id)}
              userId={post.user?.id}
              mediaUrls={(post.mediaUrls?.filter(Boolean) as string[]) || []}
              author={post.user?.fullName || post.user?.username || "Unknown"}
              username={post.user?.username}
              avatarUrl={post.user?.avatarUrl || undefined}
              time={formatTime(post.createdAt)}
              content={post.content || ""}
              likeCount={post.likeCount}
              shareCount={post.shareCount}
              commentCount={post.commentCount}
              verified={false}
            />
          ))}
      </AnimatePresence>

      {!loading && !error && posts.length === 0 && <FeedEmpty />}

      {data?.getNewsFeed.hasMore && (
        <div ref={observerTarget}>
          {loading && <FeedLoadMoreSpinner />}
        </div>
      )}

      {!data?.getNewsFeed.hasMore && posts.length > 0 && <FeedEndMessage />}
    </>
  );
}
