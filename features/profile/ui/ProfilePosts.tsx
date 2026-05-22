"use client";

import { useQuery } from "@apollo/client/react";
import { useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import {
  GetUserPostsDocument,
  type GetUserPostsQuery,
} from "@/features/profile/lib/documents";
import { PostCard } from "@/features/feed/ui/feed/PostCard";
import {
  FeedEmpty,
  FeedEndMessage,
  FeedError,
  FeedLoadMoreSpinner,
} from "@/features/feed/ui/feed/FeedStates";

type ProfilePostsProps = {
  userId: number;
};

export function ProfilePosts({ userId }: ProfilePostsProps) {
  const { loading, error, data, fetchMore, refetch } = useQuery<GetUserPostsQuery>(
    GetUserPostsDocument,
    {
      variables: { userId, limit: 10, cursor: null },
      notifyOnNetworkStatusChange: true,
    }
  );

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          data?.getUserPosts.hasMore &&
          !loading
        ) {
          fetchMore({
            variables: { cursor: data.getUserPosts.nextCursor },
          });
        }
      },
      { threshold: 0.1, rootMargin: "120px" }
    );
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [data, loading, fetchMore]);

  const formatTime = (timestamp: string) => {
    const diff = Math.floor(
      (Date.now() - new Date(timestamp).getTime()) / 1000
    );
    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
    return new Date(timestamp).toLocaleDateString("vi-VN");
  };

  const posts = data?.getUserPosts.posts ?? [];

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
        Bài viết
      </h2>

      {loading && !data && <FeedLoadMoreSpinner />}

      {error && <FeedError onRetry={() => refetch()} />}

      <AnimatePresence mode="popLayout">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            postId={String(post.id)}
            userId={post.user?.id}
            author={post.user?.fullName || post.user?.username || "Unknown"}
            username={post.user?.username}
            avatarUrl={post.user?.avatarUrl || undefined}
            time={formatTime(post.createdAt)}
            content={post.content || ""}
            mediaUrls={(post.mediaUrls?.filter(Boolean) as string[]) || []}
            likeCount={post.likeCount}
            shareCount={post.shareCount}
            commentCount={post.commentCount}
          />
        ))}
      </AnimatePresence>

      {!loading && !error && posts.length === 0 && <FeedEmpty />}

      {data?.getUserPosts.hasMore && (
        <div ref={observerTarget}>
          {loading && <FeedLoadMoreSpinner />}
        </div>
      )}

      {!data?.getUserPosts.hasMore && posts.length > 0 && <FeedEndMessage />}
    </div>
  );
}
