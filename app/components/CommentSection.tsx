"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useSubscription } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import { commentServiceContext } from "@/features/shared/lib/apollo/apollo-client";
import {
  GetCommentsDocument,
  CreateCommentDocument,
  CommentAddedDocument,
  CommentDeletedDocument,
  type GetCommentsQuery,
  type CreateCommentMutation,
  type CommentAddedSubscription,
  type CommentDeletedSubscription,
  type Comment,
} from "@/features/comments/lib/documents";

const commentCtx = commentServiceContext;

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [commentText, setCommentText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const { data: session } = useSession();
  const commentSectionRef = useRef<HTMLDivElement>(null);
  const postIdInt = parseInt(postId, 10);
  const queryVars = { postId: postIdInt, limit: 5, cursor: null as number | null };

  const { data, loading, error, fetchMore } = useQuery<GetCommentsQuery>(
    GetCommentsDocument,
    {
      variables: queryVars,
      context: commentCtx,
    }
  );

  useSubscription<CommentAddedSubscription>(CommentAddedDocument, {
    variables: { postId: postIdInt },
    context: commentCtx,
    skip: !isVisible,
    onData: ({ client, data: subData }) => {
      const newComment = subData.data?.commentAdded;
      if (!newComment) return;

      console.log("New comment via subscription:", newComment);

      // Update cache manually
      try {
        const existingComments = client.readQuery<GetCommentsQuery>({
          query: GetCommentsDocument,
          variables: queryVars,
        });

        if (existingComments) {
          // Check duplicate
          const exists = existingComments.getComments.comments.some(
            (c) => c.id === newComment.id
          );

          if (!exists) {
            client.writeQuery({
              query: GetCommentsDocument,
              variables: queryVars,
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

  const { error: subscriptionError } = useSubscription<CommentDeletedSubscription>(
    CommentDeletedDocument,
    {
      variables: { postId: postIdInt },
      context: commentCtx,
      skip: !isVisible,
      onData: ({ client, data: subData }) => {
        // commentDeleted trả về Int! (commentId), không phải object
        const deletedCommentId = subData.data?.commentDeleted;
        if (!deletedCommentId) return;

        console.log("Comment deleted via subscription:", deletedCommentId);

        // Remove from cache
        try {
          const existingComments = client.readQuery<GetCommentsQuery>({
            query: GetCommentsDocument,
            variables: queryVars,
          });

          if (existingComments) {
            client.writeQuery({
              query: GetCommentsDocument,
              variables: queryVars,
              data: {
                getComments: {
                  ...existingComments.getComments,
                  comments: existingComments.getComments.comments.filter(
                    (c) => c.id !== deletedCommentId
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
    useMutation<CreateCommentMutation>(CreateCommentDocument, {
      context: commentCtx,
      optimisticResponse: session
        ? () => ({
            createComment: {
              __typename: "CreateCommentResponse",
              success: true,
              message: "Comment created",
              comment: {
                __typename: "Comment",
                id: -Date.now(),
                content: commentText.trim(),
                createdAt: new Date().toISOString(),
                user: {
                  __typename: "User",
                  id: Number(session.user.id) || 0,
                  username: session.user.name || "User",
                  fullName: session.user.name || "User",
                  email: session.user.email || "",
                  avatarUrl: session.user.image || "",
                },
                // The cache entry this is written into selects replies, so the
                // optimistic comment has to carry the field too.
                replies: [],
              },
            },
          })
        : undefined,
      update: (cache, { data: mutationData }) => {
        if (!mutationData?.createComment?.success) return;

        try {
          const existingComments = cache.readQuery<GetCommentsQuery>({
            query: GetCommentsDocument,
            variables: queryVars,
          });

          if (existingComments && mutationData.createComment.comment) {
            const newComment = mutationData.createComment.comment;

            // Check duplicate - avoid adding if already exists (from subscription)
            const exists = existingComments.getComments.comments.some(
              (c) => c.id === newComment.id
            );

            if (!exists) {
              // Drop the optimistic placeholder: it carries a negative id, so
              // the old "temp-" prefix check never matched anything.
              const commentsWithoutTemp =
                existingComments.getComments.comments.filter((c) => c.id > 0);

              cache.writeQuery({
                query: GetCommentsDocument,
                variables: queryVars,
                data: {
                  getComments: {
                    __typename: "CommentsResponse",
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
            postId: postIdInt,
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
    <div ref={commentSectionRef} className="px-4 py-4 sm:px-5">
      <div className="space-y-3">
        {isVisible && !subscriptionError && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
            </span>
            <span>Đang cập nhật realtime</span>
          </div>
        )}

        {subscriptionError && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Kết nối realtime tạm gián đoạn
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-violet-500 text-sm font-semibold text-white">
            {session?.user?.name?.[0] || "U"}
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-3 py-1 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-soft)]">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận..."
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || submitting}
              className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-[var(--accent)] transition-opacity hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? "…" : "Gửi"}
            </button>
          </div>
        </form>

        {loading && !data && (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
          </div>
        )}

        {error && (
          <p className="py-2 text-center text-sm text-red-500">
            Không thể tải bình luận
          </p>
        )}

        <div className="space-y-3">
          {data?.getComments.comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-violet-500 text-xs font-semibold text-white">
                {comment.user?.fullName?.[0] ||
                  comment.user?.username?.[0] ||
                  "?"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="rounded-[var(--radius-lg)] rounded-tl-md bg-[var(--surface)] px-3.5 py-2.5 shadow-sm ring-1 ring-[color:var(--border)]">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {comment.user?.fullName ||
                      comment.user?.username ||
                      "User"}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
                <p className="mt-1 px-1 text-xs text-[var(--text-muted)]">
                  {formatTime(comment.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {data?.getComments.hasMore && (
          <button
            type="button"
            onClick={loadMoreComments}
            disabled={loading}
            className="w-full py-2 text-sm font-medium text-[var(--accent)] hover:underline disabled:opacity-50"
          >
            {loading ? "Đang tải..." : "Xem thêm bình luận"}
          </button>
        )}

        {data?.getComments.comments.length === 0 && !loading && (
          <p className="py-6 text-center text-sm text-[var(--text-muted)]">
            Hãy là người bình luận đầu tiên 💬
          </p>
        )}
      </div>
    </div>
  );
}
