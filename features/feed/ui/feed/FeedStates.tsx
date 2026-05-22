"use client";

import { motion } from "framer-motion";
import { Newspaper, RefreshCw, Wifi } from "lucide-react";

export function FeedError({ onRetry }: { onRetry?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface flex flex-col items-center gap-4 p-8 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
        <Wifi className="h-7 w-7" />
      </div>
      <div>
        <h3 className="font-semibold text-[var(--text-primary)]">
          Không tải được bài viết
        </h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Kiểm tra kết nối và thử lại nhé.
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </button>
      )}
    </motion.div>
  );
}

export function FeedEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-surface flex flex-col items-center gap-4 p-12 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--accent-soft)] text-[var(--accent)]">
        <Newspaper className="h-8 w-8" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Chưa có bài viết nào
        </h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">
          Hãy là người đầu tiên chia sẻ điều gì đó thú vị với cộng đồng.
        </p>
      </div>
    </motion.div>
  );
}

export function FeedEndMessage() {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-8 text-center text-sm text-[var(--text-muted)]"
    >
      Bạn đã xem hết bài viết ✨
    </motion.p>
  );
}

export function FeedLoadMoreSpinner() {
  return (
    <div className="flex justify-center py-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        className="h-8 w-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]"
      />
    </div>
  );
}
