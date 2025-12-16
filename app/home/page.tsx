"use client";

import { useQuery } from "@apollo/client/react";
import { GET_NEWS_FEED } from "../lib/graphql/feedQueries";
import CreatePost from "../components/CreatePost";
import Post from "../components/Post";
import HomeSkeletons from "./skeletons";
import { useState, useEffect, useRef } from "react";
import { POST_REFRESH_THRESHOLD } from "../constant";
import { User } from "../types/user";

interface PostData {
  id: string;
  content: string;
  postType: string;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  user: User;
}

interface NewsFeedData {
  getNewsFeed: {
    posts: PostData[];
    hasMore: boolean;
    nextCursor: number;
  };
}
export default function HomePage() {
  const [cursor, setCursor] = useState<number | null>(null);
  const { loading, error, data, fetchMore, refetch } = useQuery<NewsFeedData>(
    GET_NEWS_FEED,
    {
      variables: { limit: 10, cursor: cursor },
      notifyOnNetworkStatusChange: true,
    }
  );

  const observerTarget = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line react-hooks/purity
  const lastVisibleTimeRef = useRef<number>(Date.now());

  const loadMore = () => {
    if (data?.getNewsFeed.hasMore && !loading) {
      fetchMore({
        variables: {
          cursor: data.getNewsFeed.nextCursor,
        },
      });
      setCursor(data.getNewsFeed.nextCursor);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Scroll mượt mà
    });
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Lưu thời điểm user rời khỏi tab
        lastVisibleTimeRef.current = Date.now();
      } else if (document.visibilityState === "visible") {
        // Tính thời gian user đã rời khỏi
        const timeAway = Date.now() - lastVisibleTimeRef.current;

        // Chỉ refresh nếu user rời khỏi lâu hơn ngưỡng
        if (timeAway >= POST_REFRESH_THRESHOLD) {
          console.log(
            `User quay lại sau ${Math.round(
              timeAway / 1000
            )}s - Refreshing feed...`
          );
          setCursor(null);
          refetch();
          scrollToTop();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [data, loading]);

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInSeconds = Math.floor(
      (now.getTime() - postDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return postDate.toLocaleDateString("vi-VN");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <CreatePost />

      {loading && !data && <HomeSkeletons />}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg">
          Có lỗi xảy ra khi tải bài viết. Vui lòng thử lại.
        </div>
      )}

      {data?.getNewsFeed.posts.map((post) => (
        <Post
          key={post.id}
          postId={post.id}
          mediaUrls={post.mediaUrls}
          author={post.user.fullName || post.user.username}
          avatarUrl={post.user.avatarUrl}
          time={formatTime(post.createdAt)}
          content={post.content}
          likeCount={post.likeCount}
          shareCount={post.shareCount}
          commentCount={post.commentCount}
        />
      ))}

      {/* Intersection Observer target */}
      {data?.getNewsFeed.hasMore && (
        <div ref={observerTarget} className="w-full py-4">
          {loading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      )}

      {!data?.getNewsFeed.hasMore &&
        data?.getNewsFeed.posts &&
        data.getNewsFeed.posts.length > 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            Bạn đã xem hết bài viết
          </div>
        )}
    </div>
  );
}
