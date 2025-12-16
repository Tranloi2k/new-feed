"use client";
import {
  NotificationMessage,
  useNotificationsWS,
} from "../hooks/useNotificationsWS";
import React from "react";

interface NotificationsProviderProps {
  children: (ctx: { notifications: NotificationMessage[] }) => React.ReactNode;
}

export function NotificationsProvider({
  children,
}: NotificationsProviderProps) {
  const notifications = useNotificationsWS();
  return <>{children({ notifications })}</>;
}
