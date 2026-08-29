"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const REFRESH_INTERVAL_MS = 25 * 60 * 1000;

async function refreshSession() {
  await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });
}

async function refreshWithBrowserLock() {
  if ("locks" in navigator) {
    await navigator.locks.request("newfeed-session-refresh", refreshSession);
    return;
  }
  await refreshSession();
}

export function SessionRefresh() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    void refreshWithBrowserLock();
    const interval = window.setInterval(() => {
      void refreshWithBrowserLock();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [status]);

  return null;
}
