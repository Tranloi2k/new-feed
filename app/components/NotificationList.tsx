interface NotificationListProps {
  notifications: Array<{ id: string; message: string }>;
  error?: string | null;
}

export function NotificationList({ notifications }: NotificationListProps) {
  return (
    <div className="w-80 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden animate-fade-in">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 font-semibold text-base bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        Thông báo
      </div>
      {notifications.length === 0 ? (
        <div className="px-5 py-4 text-gray-500 text-sm text-center">
          Không có thông báo mới.
        </div>
      ) : (
        <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {notifications.map((n) => (
            <li
              key={n.id}
              className="px-5 py-4 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              {n.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
