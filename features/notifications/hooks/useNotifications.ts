"use client";

import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  fetchNotifications,
  fetchUnreadCount,
  type NotificationItem,
} from "../lib/notifications";

let socket: Socket | null = null;

function upsertNotification(
  list: NotificationItem[],
  item: NotificationItem
): NotificationItem[] {
  const without = list.filter((n) => n.id !== item.id);
  return [item, ...without];
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInbox = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [page, count] = await Promise.all([
        fetchNotifications(30),
        fetchUnreadCount(),
      ]);
      setNotifications(page.notifications);
      setUnreadCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_NOTIFICATION_URL ||
      process.env.NEXT_PUBLIC_API_URL;
    if (!wsUrl) return;

    if (!socket) {
      socket = io(wsUrl, {
        path: "/notifications/socket.io",
        transports: ["websocket"],
        reconnectionAttempts: 5,
        withCredentials: true,
      });
    }

    const onNotification = (data: NotificationItem) => {
      setNotifications((prev) => upsertNotification(prev, data));
      if (!data.read) {
        setUnreadCount((c) => c + 1);
      }
    };

    socket.on("notification", onNotification);

    return () => {
      socket?.off("notification", onNotification);
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    reload: loadInbox,
  };
}
