import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentUser } from "@/features/auth/lib/auth";
import { MessagesClient } from "@/features/chat/ui/MessagesClient";
import { FeedShell } from "@/features/feed/ui/layout/FeedShell";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session = await auth();
  const id = Number(session?.user?.id);

  if (!session?.user || !Number.isSafeInteger(id) || id <= 0) {
    redirect("/login");
  }

  // NextAuth is the route's source of truth. The backend profile enriches the
  // UI, but a temporary /api/auth/me failure must not create a
  // /messages -> /login -> /home redirect loop.
  const profile = await getCurrentUser();
  const fallbackName = session.user.name || session.user.email || `user-${id}`;
  const username = profile?.username || fallbackName;
  const fullName = profile?.fullName || session.user.name || username;
  const avatarUrl = profile?.avatarUrl ?? session.user.image;
  const feedUser = {
    id: String(id),
    username,
    fullName,
    email: profile?.email || session.user.email || "",
    avatarUrl: avatarUrl ?? undefined,
  };

  return (
    <FeedShell user={feedUser} layout="chat">
      <MessagesClient
        currentUser={{ id, username, fullName, avatarUrl }}
      />
    </FeedShell>
  );
}
