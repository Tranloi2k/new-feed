"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import { ImageIcon, MapPin, Video, X } from "lucide-react";
import { CreatePostDocument } from "@/features/feed/lib/documents";
import { uploadFiles } from "@/app/lib/actions/uploadMedia";
import { Avatar } from "../primitives/Avatar";
import { cn } from "../utils/cn";

export function Composer() {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [postType, setPostType] = useState<"TEXT" | "IMAGE" | "VIDEO" | "LINK">("TEXT");
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<{ url: string; type: string }[]>([]);

  const userName = session?.user?.name || session?.user?.email || "Bạn";

  const [createPost, { loading, error }] = useMutation(CreatePostDocument, {
    context: { credentials: "include" },
    refetchQueries: ["GetNewsFeed"],
    onCompleted: (data) => {
      if (data.createPost.success) {
        setContent("");
        setLocation("");
        setSelectedFiles([]);
        setPreviews([]);
        setPostType("TEXT");
        setShowModal(false);
      }
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setPreviews(
      files.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
      }))
    );
    if (files[0]?.type.startsWith("video/")) setPostType("VIDEO");
    else if (files[0]?.type.startsWith("image/")) setPostType("IMAGE");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let mediaUrls: string[] = [];
      if (selectedFiles.length > 0) {
        mediaUrls = await uploadFiles(selectedFiles);
      }
      if (postType !== "TEXT" && mediaUrls.length === 0) {
        alert("Vui lòng chọn file phương tiện");
        return;
      }
      await createPost({
        variables: {
          input: {
            content: content || null,
            postType,
            mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
            location: location || null,
          },
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi không xác định";
      alert("Lỗi: " + message);
    } finally {
      setUploading(false);
    }
  };

  const quickActions = [
    { icon: ImageIcon, label: "Ảnh", type: "IMAGE" as const, color: "text-emerald-500" },
    { icon: Video, label: "Video", type: "VIDEO" as const, color: "text-rose-500" },
    { icon: MapPin, label: "Vị trí", type: "TEXT" as const, color: "text-amber-500" },
  ];

  return (
    <>
      <motion.section
        layout
        className="card-surface sticky top-[calc(var(--header-height)+0.75rem)] z-30 mb-4 p-4 sm:p-5"
        aria-label="Tạo bài viết"
      >
        <div className="flex gap-3">
          <Avatar name={userName} size="lg" />
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className={cn(
              "flex-1 rounded-full border border-[color:var(--border)] bg-[var(--surface-muted)] px-5 py-3 text-left text-[15px]",
              "text-[var(--text-muted)] transition-all duration-200",
              "hover:border-[var(--accent)] hover:bg-[var(--surface)] hover:text-[var(--text-secondary)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            )}
          >
            Bạn đang nghĩ gì, {userName.split(" ")[0]}?
          </button>
        </div>

        <div className="mt-3 flex items-center justify-around border-t border-[color:var(--border)] pt-3">
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setPostType(action.type);
                setShowModal(true);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
            >
              <action.icon className={cn("h-5 w-5", action.color)} />
              <span className="hidden sm:inline">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[92vh] w-full max-w-lg overflow-hidden rounded-t-[var(--radius-xl)] border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] sm:rounded-[var(--radius-xl)]"
            >
              <div className="flex items-center justify-between border-b border-[color:var(--border)] px-5 py-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  Tạo bài viết
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
                  aria-label="Đóng"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="overflow-y-auto p-5">
                <div className="flex gap-3">
                  <Avatar name={userName} size="md" />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Chia sẻ điều gì đó thú vị..."
                    rows={5}
                    autoFocus
                    className={cn(
                      "flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-[var(--text-primary)]",
                      "placeholder:text-[var(--text-muted)] focus:outline-none"
                    )}
                  />
                </div>

                <div className="mt-4">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Thêm vị trí..."
                    className="w-full rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                  />
                </div>

                {(postType === "IMAGE" || postType === "VIDEO") && (
                  <div className="mt-4">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed border-[color:var(--border)] bg-[var(--surface-muted)] px-4 py-8 transition-colors hover:border-[var(--accent)]">
                      <input
                        type="file"
                        multiple
                        accept={postType === "IMAGE" ? "image/*" : "video/*"}
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <span className="text-sm font-medium text-[var(--text-secondary)]">
                        Chọn {postType === "IMAGE" ? "ảnh" : "video"} để tải lên
                      </span>
                    </label>
                  </div>
                )}

                {previews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {previews.map((preview, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-[var(--radius-md)]"
                      >
                        {preview.type === "video" ? (
                          <video src={preview.url} controls className="w-full" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={preview.url}
                            alt="preview"
                            className="w-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <p className="mt-4 rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                    {error.message}
                  </p>
                )}

                <motion.button
                  type="submit"
                  disabled={loading || uploading || (!content.trim() && !selectedFiles.length)}
                  whileTap={{ scale: 0.98 }}
                  className="mt-5 w-full rounded-full bg-gradient-to-r from-[var(--accent)] to-violet-500 py-3 font-semibold text-white shadow-lg shadow-[var(--accent-glow)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading
                    ? "Đang tải lên..."
                    : loading
                      ? "Đang đăng..."
                      : "Đăng bài"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
