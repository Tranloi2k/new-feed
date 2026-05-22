import { FeedShell } from "@/features/feed/ui/layout/FeedShell";
import { getCurrentUser } from "@/features/auth/lib/auth";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <FeedShell
      user={
        user
          ? {
              id: String(user.id ?? user.userId ?? ""),
              username: user.username,
              fullName: user.fullName || user.username,
              email: user.email,
              avatarUrl: user.avatarUrl ?? undefined,
            }
          : undefined
      }
    >
      {children}
    </FeedShell>
  );
}
