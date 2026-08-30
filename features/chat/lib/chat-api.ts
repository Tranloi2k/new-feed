import { getApiUrl } from "@/features/shared/lib/env";
import type { ChatMessage, ChatUser, Conversation } from "./types";

type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

async function parseEnvelope<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !body.success || body.data === undefined) {
    throw new Error(body.message || "Yêu cầu không thành công");
  }
  return body.data;
}

export async function searchUsers(query: string, signal?: AbortSignal): Promise<ChatUser[]> {
  const params = new URLSearchParams({ q: query, limit: "12" });
  const response = await fetch(`${getApiUrl()}/api/users/search?${params}`, {
    credentials: "include",
    cache: "no-store",
    signal,
  });
  const data = await parseEnvelope<{ users: Array<Omit<ChatUser, "userId"> & { id: number }> }>(response);
  return data.users.map((user) => ({ ...user, userId: user.id }));
}

export async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch(`${getApiUrl()}/api/chat/conversations?limit=50`, {
    credentials: "include",
    cache: "no-store",
  });
  return parseEnvelope<Conversation[]>(response);
}

export async function createDirectConversation(userId: number): Promise<Conversation> {
  const response = await fetch(`${getApiUrl()}/api/chat/conversations`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "direct", memberIds: [userId] }),
  });
  return parseEnvelope<Conversation>(response);
}

export async function fetchMessages(conversationId: string, after?: string): Promise<ChatMessage[]> {
  const params = new URLSearchParams({ limit: "100" });
  if (after) params.set("after", after);
  const response = await fetch(
    `${getApiUrl()}/api/chat/conversations/${encodeURIComponent(conversationId)}/messages?${params}`,
    { credentials: "include", cache: "no-store" }
  );
  return parseEnvelope<ChatMessage[]>(response);
}

export async function markConversationRead(conversationId: string, lastReadMessageId: string): Promise<void> {
  const response = await fetch(
    `${getApiUrl()}/api/chat/conversations/${encodeURIComponent(conversationId)}/read`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastReadMessageId }),
    }
  );
  if (!response.ok) throw new Error("Không thể đánh dấu đã đọc");
}

export async function syncChat(since: string): Promise<{ conversations: Array<{ id: string; unreadCount: number; lastMessageId: string | null; lastMessageAt: string | null }>; syncedAt: string }> {
  const response = await fetch(`${getApiUrl()}/api/chat/sync?since=${encodeURIComponent(since)}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Không thể đồng bộ tin nhắn");
  return response.json();
}

export function getChatSocketOrigin(): string | null {
  const configured = process.env.NEXT_PUBLIC_WS_CHAT_URL || process.env.NEXT_PUBLIC_API_URL;
  try {
    const url = new URL(configured || window.location.origin, window.location.origin);
    const localHosts = ["localhost", "127.0.0.1"];
    const localPage = localHosts.includes(window.location.hostname);
    const localSocket = localHosts.includes(url.hostname);
    const remotePage = !["localhost", "127.0.0.1"].includes(window.location.hostname);

    // Cookies are scoped by hostname, not by port. During local development an
    // HttpOnly localhost access token cannot authenticate a socket opened
    // directly against a remote API host, so use the same-origin Next rewrite.
    if (localPage && !localSocket) return window.location.origin;
    if (remotePage && localSocket) return null;
    return url.origin;
  } catch {
    return null;
  }
}
