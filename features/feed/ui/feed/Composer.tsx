"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import { ImageIcon, MapPin, Trash2, Video, X } from "lucide-react";
import { CreatePostDocument } from "@/features/feed/lib/documents";
import { uploadFiles } from "@/app/lib/actions/uploadMedia";
import { Avatar } from "../primitives/Avatar";
import { cn } from "../utils/cn";
import { OPEN_COMPOSER_EVENT } from "../utils/composer-event";

export function Composer() {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [postType, setPostType] = useState<"TEXT" | "IMAGE" | "VIDEO" | "LINK">("TEXT");
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<{ url: string; type: string }[]>([]);
  const previewsRef = useRef<{ url: string; type: string }[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showLocation, setShowLocation] = useState(false);

  const userName = session?.user?.name || session?.user?.email || "Bạn";
  const userAvatar = session?.user?.image;

  const releasePreviews = useCallback(() => {
    previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url));
    previewsRef.current = [];
    setPreviews([]);
  }, []);

  const [createPost, { loading, error: mutationError }] = useMutation(CreatePostDocument, {
    context: { credentials: "include" },
    refetchQueries: ["GetNewsFeed"],
    onCompleted: (data) => {
      if (data.createPost.success) {
        setContent("");
        setLocation("");
        setSelectedFiles([]);
        releasePreviews();
        setPostType("TEXT");
        setShowLocation(false);
        setShowModal(false);
      }
    },
  });

  const openTextComposer = () => {
    setPostType("TEXT");
    setSubmitError(null);
    setShowModal(true);
  };

  const closeComposer = useCallback(() => {
    if (loading || uploading) return;
    setPostType("TEXT");
    setSelectedFiles([]);
    releasePreviews();
    setLocation("");
    setSubmitError(null);
    setShowLocation(false);
    setShowModal(false);
  }, [loading, releasePreviews, uploading]);

  useEffect(() => {
    const openComposer = (event?: Event) => {
      event?.preventDefault();
      setPostType("TEXT");
      setSubmitError(null);
      setShowModal(true);
    };

    window.addEventListener(OPEN_COMPOSER_EVENT, openComposer);

    const params = new URLSearchParams(window.location.search);
    if (params.get("compose") === "1") {
      openComposer();
      params.delete("compose");
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}`
      );
    }

    return () => window.removeEventListener(OPEN_COMPOSER_EVENT, openComposer);
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeComposer();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal, closeComposer]);

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => () => {
    previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    releasePreviews();
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

  const removePreview = (index: number) => {
    URL.revokeObjectURL(previews[index].url);
    setPreviews((items) => items.filter((_, itemIndex) => itemIndex !== index));
    setSelectedFiles((items) => items.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setUploading(true);
    try {
      let mediaUrls: string[] = [];
      if (selectedFiles.length > 0) {
        mediaUrls = await uploadFiles(selectedFiles);
      }
      if (postType !== "TEXT" && mediaUrls.length === 0) {
        setSubmitError(
          `Vui lòng chọn ${postType === "VIDEO" ? "video" : "ảnh"} để đăng`
        );
        return;
      }
      const result = await createPost({
        variables: {
          input: {
            content: content || null,
            postType,
            mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
            location: location || null,
          },
        },
      });

      if (!result.data?.createPost.success) {
        throw new Error(
          result.data?.createPost.message || "Không thể đăng bài lúc này"
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi không xác định";
      setSubmitError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <motion.section
        layout
        className="mt-3 bg-[var(--surface)] px-4 py-4 sm:rounded-2xl sm:px-5"
        aria-label="Tạo bài viết"
      >
        <div className="flex items-center gap-3">
          <Avatar src={userAvatar} name={userName} size="md" />
          <button
            type="button"
            onClick={openTextComposer}
            data-composer-trigger
            className={cn(
              "min-h-11 min-w-0 flex-1 rounded-lg px-1 py-2 text-left text-[15px] text-[var(--text-muted)]",
              "transition-colors hover:text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            )}
          >
            Bắt đầu một cuộc trò chuyện...
          </button>
          <button
            type="button"
            onClick={() => {
              setPostType("IMAGE");
              setSubmitError(null);
              setShowModal(true);
            }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            aria-label="Thêm ảnh"
          >
            <ImageIcon className="h-[19px] w-[19px]" />
          </button>
          <button
            type="button"
            onClick={openTextComposer}
            className="hidden min-h-10 rounded-lg border border-[color:var(--border-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:inline-flex sm:items-center"
          >
            Đăng
          </button>
        </div>
      </motion.section>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={closeComposer}
            role="presentation"
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[92dvh] w-full max-w-[620px] overflow-hidden rounded-t-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] sm:rounded-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="composer-title"
            >
              <div className="flex items-center justify-between border-b border-[color:var(--border)] px-5 py-4">
                <h2 id="composer-title" className="text-base font-semibold text-[var(--text-primary)]">
                  Bài viết mới
                </h2>
                <button
                  type="button"
                  onClick={closeComposer}
                  className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
                  aria-label="Đóng"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="overflow-y-auto p-5">
                <div className="flex gap-3">
                  <Avatar src={userAvatar} name={userName} size="md" />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Chia sẻ điều gì đó thú vị..."
                    rows={5}
                    autoFocus
                    className={cn(
                      "flex-1 resize-none bg-transparent text-base leading-relaxed text-[var(--text-primary)]",
                      "placeholder:text-[var(--text-muted)] focus:outline-none"
                    )}
                  />
                </div>

                <div className="ml-[52px] mt-3 flex flex-wrap items-center gap-1 border-t border-[color:var(--border)] pt-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]">
                    <ImageIcon className="h-[18px] w-[18px]" />
                    <span>Ảnh</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]">
                    <Video className="h-[18px] w-[18px]" />
                    <span>Video</span>
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLocation((value) => !value)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      showLocation
                        ? "bg-[var(--surface-muted)] text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <MapPin className="h-[18px] w-[18px]" />
                    <span>Vị trí</span>
                  </button>
                  {selectedFiles.length > 0 && (
                    <span className="ml-auto text-xs text-[var(--text-muted)]">
                      {selectedFiles.length} tệp đã chọn
                    </span>
                  )}
                </div>

                {showLocation && (
                  <div className="ml-[52px] mt-3">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Thêm vị trí..."
                      autoFocus
                      className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
                    />
                  </div>
                )}

                {previews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:ml-[52px]">
                    {previews.map((preview, index) => (
                      <div
                        key={preview.url}
                        className="group relative overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[var(--surface-muted)]"
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
                        <button
                          type="button"
                          onClick={() => removePreview(index)}
                          className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          aria-label={`Xóa tệp ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {(submitError || mutationError) && (
                  <p className="mt-4 rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                    {submitError || mutationError?.message}
                  </p>
                )}

                <motion.button
                  type="submit"
                  disabled={loading || uploading || (!content.trim() && !selectedFiles.length)}
                  whileTap={{ scale: 0.98 }}
                  className="mt-5 w-full rounded-xl bg-[var(--text-primary)] py-3 font-semibold text-[var(--surface)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
