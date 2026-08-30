export type ChatUser = {
  id?: number;
  userId: number;
  username: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: number;
  clientMessageId: string;
  type: "text" | "image" | "system";
  content: string;
  mediaUrl?: string | null;
  createdAt: string;
  pending?: boolean;
  failed?: boolean;
};

export type ConversationMember = ChatUser & {
  role: "owner" | "admin" | "member";
  joinedAt: string;
  mutedUntil?: string | null;
};

export type Conversation = {
  id: string;
  type: "direct" | "group";
  title?: string | null;
  members: ConversationMember[];
  lastMessage: ChatMessage | null;
  unreadCount: number;
  lastMessageAt?: string | null;
};

export type PendingOutgoing = {
  conversationId: string;
  clientMessageId: string;
  content: string;
  type: "text";
};
