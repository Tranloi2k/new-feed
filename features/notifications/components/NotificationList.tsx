import type { NotificationItem } from "../lib/notifications";

interface NotificationListProps {
  notifications: NotificationItem[];
  loading?: boolean;
  error?: string | null;
}

function formatTime(iso: string) {
  const date = new Date(iso);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return date.toLocaleDateString("vi-VN");
}

export function NotificationList({
  notifications,
  loading,
  error,
}: NotificationListProps) {
  return (
    <div className="w-80 overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      <div className="border-b border-[color:var(--border)] bg-[var(--surface-muted)] px-5 py-3 text-base font-semibold text-[var(--text-primary)]">
        Thông báo
      </div>

      {loading && (
        <div className="px-5 py-4 text-gray-500 text-sm text-center">
          Đang tải...
        </div>
      )}

      {error && (
        <div className="px-5 py-4 text-red-500 text-sm text-center">{error}</div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="px-5 py-4 text-gray-500 text-sm text-center">
          Không có thông báo mới.
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`px-5 py-4 text-sm transition-colors cursor-pointer ${
                n.read
                  ? "text-gray-600 dark:text-gray-400"
                  : "text-gray-900 dark:text-gray-100 bg-blue-50/50 dark:bg-blue-900/20 font-medium"
              }`}
            >
              <p>{n.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatTime(n.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
