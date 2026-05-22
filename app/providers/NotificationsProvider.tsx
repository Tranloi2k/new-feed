"use client";
import {
  useNotifications,
} from "@/features/notifications/hooks/useNotifications";
import type { NotificationItem } from "@/features/notifications/lib/notifications";
import React from "react";

interface NotificationsProviderProps {
  children: (ctx: { notifications: NotificationItem[] }) => React.ReactNode;
}

export function NotificationsProvider({
  children,
}: NotificationsProviderProps) {
  const { notifications } = useNotifications();
  return <>{children({ notifications })}</>;
}
