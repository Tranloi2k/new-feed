"use client";

import { useEffect, useState } from "react";
import {
  acceptFollowRequest,
  fetchFollowRequests,
  rejectFollowRequest,
  type FollowRequestUser,
} from "../lib/profile-api";

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
    <section className="border-b border-[color:var(--border)] p-5">
      <h2 className="mb-3 font-semibold">Yêu cầu theo dõi</h2>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between gap-3">
            <span>@{user.username}</span>
            <div className="flex gap-2">
              <button className="rounded-lg bg-[var(--text-primary)] px-3 py-1.5 text-sm text-[var(--surface)]" onClick={() => void resolve(user.id, true)}>
                Chấp nhận
              </button>
              <button className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => void resolve(user.id, false)}>
                Từ chối
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
