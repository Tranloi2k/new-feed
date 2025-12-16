"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useSubscription } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import {
  GET_POST_COMMENTS,
  CREATE_COMMENT,
  COMMENT_ADDED,
  COMMENT_DELETED,
} from "../lib/graphql/commentQueries";
import { Comment } from "../types/comment";
interface CommentsData {
  getComments: {
    comments: Comment[];
    hasMore: boolean;
    nextCursor: number;
  };
}

interface CreateCommentData {
  createComment: {
    success: boolean;
    message: string;
    comment: Comment;
  };
}

interface CommentAddedData {
  commentAdded: Comment;
}

interface CommentDeletedData {
  commentDeleted: number;
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [commentText, setCommentText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const { data: session } = useSession();
  const commentSectionRef = useRef<HTMLDivElement>(null);

  const { data, loading, error, fetchMore } = useQuery<CommentsData>(
    GET_POST_COMMENTS,
    {
      variables: { postId, limit: 5, cursor: null },
    }
  );

  // GraphQL Subscription cho real-time comments
  useSubscription<CommentAddedData>(COMMENT_ADDED, {
    variables: { postId: parseInt(postId) },
    skip: !isVisible, // Chỉ subscribe khi visible
    onData: ({ client, data: subData }) => {
      const newComment = subData.data?.commentAdded;
      if (!newComment) return;

      console.log("New comment via subscription:", newComment);

      // Update cache manually
      try {
        const existingComments = client.readQuery<CommentsData>({
          query: GET_POST_COMMENTS,
          variables: { postId, limit: 5, cursor: null },
        });

        if (existingComments) {
          // Check duplicate
          const exists = existingComments.getComments.comments.some(
            (c) => c.id === newComment.id
          );

          if (!exists) {
            client.writeQuery({
              query: GET_POST_COMMENTS,
              variables: { postId, limit: 5, cursor: null },
              data: {
                getComments: {
                  ...existingComments.getComments,
                  comments: [
                    newComment,
                    ...existingComments.getComments.comments,
                  ],
                },
              },
            });
          }
        }
      } catch (err) {
        console.error("Subscription cache update error:", err);
      }
    },
  });

  const { error: subscriptionError } = useSubscription<CommentDeletedData>(
    COMMENT_DELETED,
    {
      variables: { postId: parseInt(postId) },
      skip: !isVisible,
      onData: ({ client, data: subData }) => {
        // commentDeleted trả về Int! (commentId), không phải object
        const deletedCommentId = subData.data?.commentDeleted;
        if (!deletedCommentId) return;

        console.log("Comment deleted via subscription:", deletedCommentId);

        // Remove from cache
        try {
          const existingComments = client.readQuery<CommentsData>({
            query: GET_POST_COMMENTS,
            variables: { postId, limit: 5, cursor: null },
          });

          if (existingComments) {
            client.writeQuery({
              query: GET_POST_COMMENTS,
              variables: { postId, limit: 5, cursor: null },
              data: {
                getComments: {
                  ...existingComments.getComments,
                  comments: existingComments.getComments.comments.filter(
                    (c) => c.id !== deletedCommentId.toString()
                  ),
                },
              },
            });
          }
        } catch (err) {
          console.error("Delete subscription cache update error:", err);
        }
      },
    }
  );

  // Intersection Observer để detect khi comment section visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Trigger khi 10% component visible
      }
    );

    const currentRef = commentSectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const [createComment, { loading: submitting }] =
    useMutation<CreateCommentData>(CREATE_COMMENT, {
      optimisticResponse: session
        ? () => ({
            createComment: {
              __typename: "CommentResponse",
              success: true,
              message: "Comment created",
              comment: {
                __typename: "Comment",
                id: `temp-${Date.now()}`,
                content: commentText.trim(),
                createdAt: new Date().toISOString(),
                user: {
                  __typename: "User",
                  id: session.user.id || "temp-user",
                  username: session.user.name || "User",
                  fullName: session.user.name || "User",
                  avatarUrl: session.user.image || "",
                },
              },
            },
          })
        : undefined,
      update: (cache, { data: mutationData }) => {
        if (!mutationData?.createComment?.success) return;

        try {
          const existingComments = cache.readQuery<CommentsData>({
            query: GET_POST_COMMENTS,
            variables: { postId, limit: 5, cursor: null },
          });

          if (existingComments && mutationData.createComment.comment) {
            const newComment = mutationData.createComment.comment;

            // Check duplicate - avoid adding if already exists (from subscription)
            const exists = existingComments.getComments.comments.some(
              (c) => c.id === newComment.id
            );

            if (!exists) {
              // Filter out temp optimistic comment and add real one
              const commentsWithoutTemp =
                existingComments.getComments.comments.filter(
                  (c) => !c.id.toString().startsWith("temp-")
                );

              cache.writeQuery({
                query: GET_POST_COMMENTS,
                variables: { postId, limit: 5, cursor: null },
                data: {
                  getComments: {
                    __typename: "CommentsConnection",
                    comments: [newComment, ...commentsWithoutTemp],
                    hasMore: existingComments.getComments.hasMore,
                    nextCursor: existingComments.getComments.nextCursor,
                  },
                },
              });
            }
          }
        } catch (err) {
          console.error("Cache update error:", err);
        }
      },
      onCompleted: (data) => {
        if (data.createComment.success) {
          setCommentText("");
        }
      },
      onError: (err) => {
        console.error("Create comment error:", err);
        alert("Không thể gửi bình luận. Vui lòng thử lại.");
      },
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    try {
      await createComment({
        variables: {
          input: {
            postId: postId,
            content: commentText.trim(),
          },
        },
      });
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const loadMoreComments = () => {
    if (data?.getComments.hasMore && !loading) {
      fetchMore({
        variables: {
          cursor: data.getComments.nextCursor,
        },
      });
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const commentDate = new Date(timestamp);
    const diffInSeconds = Math.floor(
      (now.getTime() - commentDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return commentDate.toLocaleDateString("vi-VN");
  };

  return (
    <div
      ref={commentSectionRef}
      className="border-t border-gray-200 dark:border-gray-700"
    >
      <div className="p-4 space-y-3">
        {/* Live indicator */}
        {isVisible && !subscriptionError && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>Live updates (GraphQL Subscription)</span>
          </div>
        )}

        {/* Subscription Error indicator */}
        {subscriptionError && (
          <div className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Subscription error: {subscriptionError.message}</span>
          </div>
        )}

        {/* Comment input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {session?.user?.name?.[0] || "U"}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full text-sm font-medium transition-colors"
            >
              {submitting ? "..." : "Gửi"}
            </button>
          </div>
        </form>

        {/* Comments list */}
        {loading && !data && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 text-sm py-2">
            Không thể tải bình luận
          </div>
        )}

        {data?.getComments.comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {comment.user.fullName?.[0] || comment.user.username[0]}
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2">
                <div className="font-semibold text-sm">
                  {comment.user.fullName || comment.user.username}
                </div>
                <div className="text-sm mt-1 whitespace-pre-wrap break-words">
                  {comment.content}
                </div>
              </div>
              <div className="px-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formatTime(comment.createdAt)}
              </div>
            </div>
          </div>
        ))}

        {/* Load more button */}
        {data?.getComments.hasMore && (
          <button
            onClick={loadMoreComments}
            disabled={loading}
            className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline py-2 disabled:opacity-50"
          >
            {loading ? "Đang tải..." : "Xem thêm bình luận"}
          </button>
        )}

        {data?.getComments.comments.length === 0 && !loading && (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
            Chưa có bình luận nào
          </div>
        )}
      </div>
    </div>
  );
}
