"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
function getUserIdFromCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )user_id=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export interface NotificationMessage {
  id: string;
  message: string;
  [key: string]: any;
}

// Singleton socket instance
let socket: Socket | null = null;

export function useNotificationsWS() {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  useEffect(() => {
    if (!socket) {
      const GATEWAY_URL = "ws://localhost:8080";
      socket = io(GATEWAY_URL, {
        transports: ["websocket"],
        path: "/notifications/socket.io",
        reconnectionAttempts: 2,
        timeout: 5000,
        withCredentials: true,
      });
      socket.on("connect", () => {
        const userId = getUserIdFromCookie();
        if (userId) {
          socket!.emit("subscribe", userId);
          console.log("Đã subscribe user:", userId);
        } else {
          console.warn("Không tìm thấy user_id trong cookie");
        }
      });
    }

    const onNotification = (data: NotificationMessage) => {
      setNotifications((prev) => [data, ...prev]);
    };
    socket.on("notification", onNotification);

    return () => {
      socket?.off("notification", onNotification);
      // Không disconnect socket ở đây để giữ kết nối toàn app
    };
  }, []);

  return notifications;
}
