import { getApiUrl } from "@/features/shared/lib/env";

export interface NotificationItem {
  id: string;
  userId: number;
  type: string;
  message: string;
  data?: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationsPage {
  notifications: NotificationItem[];
  hasMore: boolean;
  nextCursor: string | null;
}

export async function fetchNotifications(
  limit = 20,
  cursor?: string
): Promise<NotificationsPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);

  const response = await fetch(
    `${getApiUrl()}/api/notifications?${params}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load notifications");
  }

  const json = await response.json();
  return json.data;
}

export async function fetchUnreadCount(): Promise<number> {
  const response = await fetch(
    `${getApiUrl()}/api/notifications/unread-count`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    return 0;
  }

  const json = await response.json();
  return json.data?.count ?? 0;
}

export async function markAllNotificationsRead(): Promise<void> {
  await fetch(
    `${getApiUrl()}/api/notifications/read-all`,
    {
      method: "POST",
      credentials: "include",
    }
  );
}
