"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, CheckCheck, LoaderCircle, MessageCircle, Search, Send, Smile, Users, X } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { Avatar } from "@/features/feed/ui/primitives/Avatar";
import {
  createDirectConversation,
  fetchConversations,
  fetchMessages,
  getChatSocketOrigin,
  markConversationRead,
  searchUsers,
  syncChat,
} from "../lib/chat-api";
import { CHAT_EMOJIS } from "../lib/emojis";
import type { ChatMessage, ChatUser, Conversation, PendingOutgoing } from "../lib/types";

type CurrentUser = { id: number; username: string; fullName: string; avatarUrl?: string | null };
type Ack = { clientMessageId: string; id: string; createdAt: string };

function peerFor(conversation: Conversation, currentUserId: number) {
  return conversation.members.find((member) => member.userId !== currentUserId) || conversation.members[0];
}

function conversationName(conversation: Conversation, currentUserId: number) {
  if (conversation.type === "group") return conversation.title || "Nhóm chat";
  const peer = peerFor(conversation, currentUserId);
  return peer?.fullName || peer?.username || "Người dùng";
}

function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]) {
  const byIdentity = new Map<string, ChatMessage>();
  for (const message of [...current, ...incoming]) {
    const key = message.clientMessageId || message.id;
    const previous = byIdentity.get(key);
    byIdentity.set(key, previous?.pending && !message.pending ? message : { ...previous, ...message });
  }
  return [...byIdentity.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function messageTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function MessagesClient({ currentUser }: { currentUser: CurrentUser }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [query, setQuery] = useState("");
  const [inboxFilter, setInboxFilter] = useState<"all" | "unread">("all");
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const socketRef = useRef<Socket | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const queueRef = useRef<PendingOutgoing[]>([]);
  const flushingRef = useRef(false);
  const ackResolvers = useRef(new Map<string, { resolve: () => void; reject: () => void }>());
  const lastSyncedAt = useRef(new Date().toISOString());
  const typingTimer = useRef<number | null>(null);
  const scrollAnchor = useRef<HTMLDivElement | null>(null);
  const queueKey = `newfeed:chat-queue:${currentUser.id}`;

  const activeConversation = useMemo(
    () => conversations.find(({ id }) => id === activeId) || null,
    [activeId, conversations]
  );
  const visibleConversations = useMemo(
    () => inboxFilter === "unread" ? conversations.filter(({ unreadCount }) => unreadCount > 0) : conversations,
    [conversations, inboxFilter]
  );

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const persistQueue = useCallback((next: PendingOutgoing[]) => {
    queueRef.current = next;
    localStorage.setItem(queueKey, JSON.stringify(next));
  }, [queueKey]);

  const loadConversations = useCallback(async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
      setActiveId((current) => current || data[0]?.id || null);
      lastSyncedAt.current = new Date().toISOString();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải hội thoại");
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => { void loadConversations(); }, [loadConversations]);

  useEffect(() => {
    activeIdRef.current = activeId;
    if (!activeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setLoadingMessages(true);
    fetchMessages(activeId)
      .then((data) => {
        if (cancelled) return;
        const queued = queueRef.current
          .filter((item) => item.conversationId === activeId)
          .map<ChatMessage>((item) => ({
            id: `pending:${item.clientMessageId}`,
            conversationId: item.conversationId,
            senderId: currentUser.id,
            clientMessageId: item.clientMessageId,
            type: "text",
            content: item.content,
            createdAt: new Date().toISOString(),
            pending: true,
          }));
        const chronological = [...data].reverse();
        setMessages(mergeMessages(chronological, queued));
        const newest = chronological.at(-1);
        if (newest && newest.senderId !== currentUser.id) void markConversationRead(activeId, newest.id);
        setConversations((items) => items.map((item) => item.id === activeId ? { ...item, unreadCount: 0 } : item));
      })
      .catch((cause) => !cancelled && setError(cause instanceof Error ? cause.message : "Không thể tải tin nhắn"))
      .finally(() => !cancelled && setLoadingMessages(false));
    return () => { cancelled = true; };
  }, [activeId, currentUser.id]);

  const flushQueue = useCallback(async () => {
    const socket = socketRef.current;
    if (!socket?.connected || flushingRef.current) return;
    flushingRef.current = true;
    try {
      while (queueRef.current.length && socket.connected) {
        const item = queueRef.current[0];
        await new Promise<void>((resolve, reject) => {
          const timeout = window.setTimeout(() => {
            ackResolvers.current.delete(item.clientMessageId);
            reject(new Error("ack timeout"));
          }, 10_000);
          ackResolvers.current.set(item.clientMessageId, {
            resolve: () => { window.clearTimeout(timeout); resolve(); },
            reject: () => { window.clearTimeout(timeout); reject(new Error("send failed")); },
          });
          socket.emit("message:send", item);
        });
      }
    } catch {
      // Keep the head item in localStorage; reconnect retries it idempotently.
    } finally {
      flushingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(queueKey);
    if (stored) {
      try { queueRef.current = JSON.parse(stored) as PendingOutgoing[]; } catch { localStorage.removeItem(queueKey); }
    }
    const origin = getChatSocketOrigin();
    if (!origin) return;
    const socket = io(origin, { path: "/chat/socket.io", transports: ["websocket"], withCredentials: true, reconnection: true });
    socketRef.current = socket;

    socket.on("connect", async () => {
      setConnected(true);
      try {
        const delta = await syncChat(lastSyncedAt.current);
        lastSyncedAt.current = delta.syncedAt;
        if (delta.conversations.length) await loadConversations();
        const active = activeIdRef.current;
        const lastId = active ? messagesRef.current.at(-1)?.id : undefined;
        if (active && lastId && !lastId.startsWith("pending:")) {
          const missed = await fetchMessages(active, lastId);
          setMessages((current) => mergeMessages(current, missed));
        }
      } catch {
        // Initial list/history loads remain the fallback when delta sync fails.
      }
      void flushQueue();
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => {
      setConnected(false);
      setError("Không thể kết nối realtime. Tin nhắn sẽ được gửi lại khi kết nối phục hồi.");
    });
    socket.on("message:ack", (ack: Ack) => {
      setMessages((items) => items.map((item) => item.clientMessageId === ack.clientMessageId ? { ...item, id: ack.id, createdAt: ack.createdAt, pending: false, failed: false } : item));
      persistQueue(queueRef.current.filter((item) => item.clientMessageId !== ack.clientMessageId));
      ackResolvers.current.get(ack.clientMessageId)?.resolve();
      ackResolvers.current.delete(ack.clientMessageId);
    });
    socket.on("message:error", ({ clientMessageId, code, retryAfter }: { clientMessageId: string; code?: string; retryAfter?: number }) => {
      const rateLimited = code === "RATE_LIMIT_EXCEEDED";
      setMessages((items) => items.map((item) => item.clientMessageId === clientMessageId ? {
        ...item,
        pending: rateLimited,
        failed: !rateLimited,
      } : item));
      ackResolvers.current.get(clientMessageId)?.reject();
      ackResolvers.current.delete(clientMessageId);
      if (rateLimited) {
        const delay = Math.max(1, retryAfter || 1);
        setError(`Bạn đang gửi quá nhanh. Tin nhắn sẽ được thử lại sau ${delay} giây.`);
        window.setTimeout(() => void flushQueue(), delay * 1000);
      }
    });
    socket.on("message:new", ({ message }: { message: ChatMessage }) => {
      const active = activeIdRef.current;
      if (message.conversationId === active) {
        setMessages((items) => mergeMessages(items, [message]));
        if (message.senderId !== currentUser.id) void markConversationRead(message.conversationId, message.id);
      }
      setConversations((items) => {
        const updated = items.map((item) => item.id === message.conversationId ? {
          ...item,
          lastMessage: message,
          lastMessageAt: message.createdAt,
          unreadCount: message.senderId !== currentUser.id && active !== item.id ? item.unreadCount + 1 : 0,
        } : item);
        return updated.sort((a, b) => String(b.lastMessageAt || "").localeCompare(String(a.lastMessageAt || "")));
      });
    });
    socket.on("typing:update", ({ conversationId, userId, isTyping }: { conversationId: string; userId: number; isTyping: boolean }) => {
      if (conversationId !== activeIdRef.current) return;
      setTypingUsers((current) => {
        const next = new Set(current);
        if (isTyping) next.add(userId); else next.delete(userId);
        return next;
      });
    });
    socket.on("presence:snapshot", ({ userIds }: { userIds: number[] }) => {
      setOnlineUsers(new Set(userIds));
    });
    socket.on("presence:update", ({ userId, status }: { userId: number; status: "online" | "offline" }) => {
      setOnlineUsers((current) => {
        const next = new Set(current);
        if (status === "online") next.add(userId); else next.delete(userId);
        return next;
      });
    });
    socket.on("read:updated", ({ conversationId, userId }: { conversationId: string; userId: number }) => {
      if (userId === currentUser.id) {
        setConversations((items) => items.map((item) => item.id === conversationId ? { ...item, unreadCount: 0 } : item));
      }
    });
    const heartbeat = window.setInterval(() => socket.connected && socket.emit("presence:ping"), 30_000);
    return () => {
      window.clearInterval(heartbeat);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser.id, flushQueue, loadConversations, persistQueue, queueKey]);

  useEffect(() => { scrollAnchor.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typingUsers]);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) { setSearchResults([]); setSearching(false); return; }
    const controller = new AbortController();
    setSearching(true);
    const timer = window.setTimeout(() => {
      searchUsers(normalized, controller.signal)
        .then(setSearchResults)
        .catch((cause: unknown) => !(cause instanceof DOMException && cause.name === "AbortError") && setError("Không thể tìm người dùng"))
        .finally(() => setSearching(false));
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  const startConversation = async (user: ChatUser) => {
    setError(null);
    try {
      const created = await createDirectConversation(user.userId);
      const normalized: Conversation = {
        ...created,
        members: created.members.map((member) => member.userId === user.userId ? { ...member, ...user } : member),
        lastMessage: created.lastMessage || null,
        unreadCount: created.unreadCount || 0,
      };
      setConversations((items) => [normalized, ...items.filter(({ id }) => id !== normalized.id)]);
      setActiveId(normalized.id);
      setQuery("");
      setSearchResults([]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể bắt đầu cuộc trò chuyện");
    }
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    const socket = socketRef.current;
    if (!activeId || !socket?.connected) return;
    socket.emit("typing:start", { conversationId: activeId });
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => socket.emit("typing:stop", { conversationId: activeId }), 1500);
  };

  const appendEmoji = (emoji: string) => {
    if (draft.length + emoji.length > 10_000) return;
    handleDraftChange(`${draft}${emoji}`);
  };

  const sendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!activeId || !content) return;
    const outgoing: PendingOutgoing = { conversationId: activeId, clientMessageId: crypto.randomUUID(), content, type: "text" };
    persistQueue([...queueRef.current, outgoing]);
    setMessages((items) => mergeMessages(items, [{
      id: `pending:${outgoing.clientMessageId}`,
      ...outgoing,
      senderId: currentUser.id,
      createdAt: new Date().toISOString(),
      pending: true,
    }]));
    setDraft("");
    setEmojiOpen(false);
    socketRef.current?.emit("typing:stop", { conversationId: activeId });
    void flushQueue();
  };

  const activePeer = activeConversation ? peerFor(activeConversation, currentUser.id) : null;

  return (
    <div className="flex h-[calc(100dvh-var(--header-height)-var(--bottom-nav-height))] bg-[var(--background)] lg:h-[calc(100dvh-var(--header-height))]">
      <section className={`${activeId ? "hidden lg:flex" : "flex"} w-full shrink-0 flex-col border-x border-[color:var(--border)] bg-[var(--background)] lg:w-[340px] xl:w-[400px]`} aria-label="Danh sách hội thoại">
        <div className="shrink-0 px-5 pb-5 pt-6 sm:px-8">
          <div className="mb-7">
            <div>
              <h1 className="text-2xl font-bold tracking-[-0.04em] text-[var(--text-primary)]">Tin nhắn</h1>
              <p className="sr-only">{connected ? "Đang kết nối realtime" : "Đang ngoại tuyến"}</p>
            </div>
          </div>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kiếm" className="h-14 w-full rounded-full bg-[var(--surface-muted)] pl-14 pr-12 text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]" />
            {query && <button type="button" onClick={() => setQuery("")} className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--border)]" aria-label="Xóa tìm kiếm"><X className="h-4 w-4" /></button>}
          </label>
          <div className="mt-5 flex items-center gap-2" role="group" aria-label="Lọc hội thoại">
            <button type="button" onClick={() => setInboxFilter("all")} aria-pressed={inboxFilter === "all"} className={`h-11 rounded-full border px-5 text-sm font-semibold transition-colors ${inboxFilter === "all" ? "border-[var(--border-strong)] bg-[var(--surface-muted)] text-[var(--text-primary)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"}`}>Hộp thư</button>
            <button type="button" onClick={() => setInboxFilter("unread")} aria-pressed={inboxFilter === "unread"} className={`h-11 rounded-full border px-5 text-sm font-semibold transition-colors ${inboxFilter === "unread" ? "border-[var(--border-strong)] bg-[var(--surface-muted)] text-[var(--text-primary)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"}`}>Chưa đọc</button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-4">
          {query.trim().length >= 2 ? (
            <div>
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Mọi người</p>
              {searching && <div className="flex justify-center py-8"><LoaderCircle className="h-5 w-5 animate-spin text-[var(--text-muted)]" /></div>}
              {!searching && !searchResults.length && <p className="px-2 py-8 text-center text-sm text-[var(--text-muted)]">Không tìm thấy người phù hợp</p>}
              {searchResults.map((user) => (
                <button key={user.userId} type="button" onClick={() => void startConversation(user)} className="flex min-h-[82px] w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)] sm:px-8">
                  <Avatar src={user.avatarUrl} name={user.fullName || user.username} size="md" />
                  <div className="min-w-0"><p className="truncate text-sm font-semibold">{user.fullName || user.username}</p><p className="truncate text-xs text-[var(--text-muted)]">@{user.username}</p></div>
                </button>
              ))}
            </div>
          ) : loadingConversations ? (
            <div className="flex justify-center py-12"><LoaderCircle className="h-5 w-5 animate-spin text-[var(--text-muted)]" /></div>
          ) : visibleConversations.length ? visibleConversations.map((conversation) => {
            const peer = peerFor(conversation, currentUser.id);
            return (
              <button key={conversation.id} type="button" onClick={() => setActiveId(conversation.id)} className={`flex min-h-[92px] w-full items-center gap-4 px-5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)] sm:px-8 ${activeId === conversation.id ? "bg-[var(--surface-muted)]" : "hover:bg-[var(--surface-muted)]/60"}`}>
                {conversation.type === "group" ? <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)]"><Users className="h-5 w-5" /></span> : <Avatar src={peer?.avatarUrl} name={conversationName(conversation, currentUser.id)} size="xl" showOnline={peer ? onlineUsers.has(peer.userId) : false} />}
                <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className={`truncate text-[15px] ${conversation.unreadCount > 0 ? "font-bold" : "font-semibold"}`}>{conversationName(conversation, currentUser.id)}</p>{conversation.unreadCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--text-primary)] px-1 text-[10px] font-bold text-[var(--surface)]">{conversation.unreadCount}</span>}</div><p className={`mt-1 truncate text-sm ${conversation.unreadCount > 0 ? "font-medium text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>{conversation.lastMessage?.content || "Bắt đầu cuộc trò chuyện"}{conversation.lastMessageAt ? ` · ${messageTime(conversation.lastMessageAt)}` : ""}</p></div>
              </button>
            );
          }) : (
            <div className="px-6 py-16 text-center"><MessageCircle className="mx-auto mb-3 h-8 w-8 text-[var(--text-muted)]" /><p className="text-sm font-medium">{inboxFilter === "unread" ? "Không có tin nhắn chưa đọc" : "Chưa có cuộc trò chuyện"}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{inboxFilter === "unread" ? "Bạn đã xem hết các tin nhắn mới." : "Tìm một người bạn ở phía trên để bắt đầu."}</p></div>
          )}
        </div>
      </section>

      <section className={`${activeId ? "flex" : "hidden lg:flex"} min-w-0 flex-1 flex-col bg-[var(--background)]`} aria-label="Nội dung hội thoại">
        {activeConversation ? (
          <>
            <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[color:var(--border)] bg-[var(--background)] px-4 sm:px-5">
              <button type="button" onClick={() => setActiveId(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] lg:hidden" aria-label="Quay lại danh sách"><ArrowLeft className="h-5 w-5" /></button>
              <Avatar src={activePeer?.avatarUrl} name={conversationName(activeConversation, currentUser.id)} size="lg" showOnline={activePeer ? onlineUsers.has(activePeer.userId) : false} />
              <div className="min-w-0"><p className="truncate text-[15px] font-semibold text-[var(--text-primary)]">{conversationName(activeConversation, currentUser.id)}</p><p className="mt-0.5 text-xs text-[var(--text-muted)]">{typingUsers.size ? "Đang nhập..." : activePeer && onlineUsers.has(activePeer.userId) ? "Đang hoạt động" : "Tin nhắn riêng tư"}</p></div>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-5">
              {loadingMessages ? <div className="flex justify-center py-12"><LoaderCircle className="h-5 w-5 animate-spin text-[var(--text-muted)]" /></div> : messages.length ? (
                <div className="mx-auto max-w-[880px] space-y-2.5">
                  {messages.map((message) => {
                    const mine = message.senderId === currentUser.id;
                    return <div key={`${message.id}:${message.clientMessageId}`} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>{!mine && <Avatar src={activePeer?.avatarUrl} name={conversationName(activeConversation, currentUser.id)} size="sm" />}<div className={`max-w-[78%] rounded-[20px] px-4 py-2.5 ${mine ? "rounded-br-md bg-[var(--text-primary)] text-[var(--surface)]" : "rounded-bl-md border border-[color:var(--border)] bg-[var(--background)] text-[var(--text-primary)]"}`}><p className="whitespace-pre-wrap break-words text-sm leading-[1.45]">{message.content}</p><div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? "opacity-60" : "text-[var(--text-muted)]"}`}><span>{messageTime(message.createdAt)}</span>{mine && (message.failed ? <span className="text-[var(--danger)]">Lỗi</span> : message.pending ? <Check className="h-3 w-3" /> : <CheckCheck className="h-3 w-3" />)}</div></div></div>;
                  })}
                  {typingUsers.size > 0 && <div className="flex items-end gap-2"><Avatar src={activePeer?.avatarUrl} name={conversationName(activeConversation, currentUser.id)} size="sm" /><div className="rounded-[20px] rounded-bl-md border border-[color:var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm tracking-[0.2em] text-[var(--text-muted)]">•••</div></div>}
                  <div ref={scrollAnchor} />
                </div>
              ) : <div className="flex h-full flex-col items-center justify-center text-center"><Avatar src={activePeer?.avatarUrl} name={conversationName(activeConversation, currentUser.id)} size="xl" /><p className="mt-3 font-semibold">{conversationName(activeConversation, currentUser.id)}</p><p className="mt-1 max-w-xs text-xs text-[var(--text-muted)]">Gửi lời chào để bắt đầu cuộc trò chuyện.</p></div>}
            </div>
            <div className="shrink-0 bg-[var(--background)] px-3 pb-3 pt-2 sm:px-5 sm:pb-5">
              <div className="relative mx-auto max-w-[880px]">
                {emojiOpen && (
                  <div className="absolute bottom-[calc(100%+8px)] left-0 z-20 w-[min(320px,calc(100vw-24px))] rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-card)]" role="dialog" aria-label="Chọn emoji">
                    <div className="grid grid-cols-8 gap-1">
                      {CHAT_EMOJIS.map((emoji) => (
                        <button key={emoji} type="button" onClick={() => appendEmoji(emoji)} className="flex h-9 w-9 items-center justify-center rounded-lg text-xl transition-colors hover:bg-[var(--surface-muted)] active:scale-90" aria-label={`Thêm ${emoji}`}>{emoji}</button>
                      ))}
                    </div>
                  </div>
                )}
                <form onSubmit={sendMessage} className="flex items-end gap-1 rounded-[24px] border border-[color:var(--border)] bg-[var(--background)] p-2">
                  <button type="button" onClick={() => setEmojiOpen((open) => !open)} className={`flex h-11 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${emojiOpen ? "bg-[var(--surface-muted)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"}`} aria-label={emojiOpen ? "Đóng bảng emoji" : "Mở bảng emoji"} aria-expanded={emojiOpen}><Smile className="h-5 w-5" /></button>
                  <textarea value={draft} onFocus={() => setEmojiOpen(false)} onChange={(event) => handleDraftChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={1} maxLength={10000} placeholder={connected ? "Viết tin nhắn..." : "Ngoại tuyến — tin sẽ gửi khi kết nối lại"} aria-label="Nội dung tin nhắn" className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
                  <button type="submit" disabled={!draft.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--surface)] transition-all hover:opacity-85 active:scale-95 disabled:cursor-not-allowed disabled:opacity-25" aria-label="Gửi tin nhắn"><Send className="h-[18px] w-[18px]" /></button>
                </form>
              </div>
            </div>
          </>
        ) : <div className="flex h-full flex-col items-center justify-center px-8 text-center"><MessageCircle className="mb-4 h-10 w-10 text-[var(--text-muted)]" /><h2 className="font-semibold">Chọn một cuộc trò chuyện</h2><p className="mt-1 text-sm text-[var(--text-muted)]">Hoặc tìm bạn bè để gửi tin nhắn đầu tiên.</p></div>}
      </section>
      {error && <button type="button" onClick={() => setError(null)} className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[var(--danger)] px-4 py-3 text-sm text-white shadow-lg">{error}</button>}
    </div>
  );
}
