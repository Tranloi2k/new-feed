"use client";

import { useEffect, useState } from "react";
import {
  acceptFollowRequest,
  fetchFollowRequests,
  rejectFollowRequest,
  type FollowRequestUser,
} from "../lib/profile-api";
import { Avatar } from "@/features/feed/ui/primitives/Avatar";

export function FollowRequests() {
  const [users, setUsers] = useState<FollowRequestUser[]>([]);

  useEffect(() => {
    void fetchFollowRequests().then(setUsers).catch((error) => {
      console.error("Failed to load follow requests:", error);
    });
  }, []);

  if (users.length === 0) return null;

  const resolve = async (userId: number, accept: boolean) => {
    if (accept) await acceptFollowRequest(userId);
    else await rejectFollowRequest(userId);
    setUsers((current) => current.filter((user) => user.id !== userId));
  };

  return (
    <section className="border-t border-[color:var(--border)] px-4 py-5 sm:px-6">
      <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Yêu cầu theo dõi</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar src={user.avatarUrl} name={user.fullName || user.username} size="md" />
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-[var(--text-primary)]">{user.fullName || user.username}</p><p className="truncate text-xs text-[var(--text-muted)]">@{user.username}</p></div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" className="h-9 rounded-lg bg-[var(--text-primary)] px-3 text-xs font-semibold text-[var(--surface)]" onClick={() => void resolve(user.id, true)}>
                Chấp nhận
              </button>
              <button type="button" className="h-9 rounded-lg border border-[color:var(--border)] px-3 text-xs font-semibold text-[var(--text-secondary)]" onClick={() => void resolve(user.id, false)}>
                Từ chối
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
