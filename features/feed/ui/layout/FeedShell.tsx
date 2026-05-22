import { FeedTopBar, type FeedUser } from "./FeedTopBar";
import { LeftNav } from "./LeftNav";
import { RightPanel } from "./RightPanel";
import { MobileBottomNav } from "./MobileBottomNav";

export function FeedShell({
  user,
  children,
}: {
  user?: FeedUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <FeedTopBar user={user} />

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-0 px-0 pt-[var(--header-height)] lg:grid-cols-[var(--nav-width)_1fr] lg:gap-6 lg:px-6 xl:grid-cols-[var(--nav-width)_minmax(0,1fr)_var(--aside-width)]">
        <div className="hidden lg:block">
          <LeftNav user={user} />
        </div>

        <main
          className="min-h-[calc(100vh-var(--header-height))] w-full pb-[calc(var(--bottom-nav-height)+1.5rem)] lg:pb-8"
          role="feed"
        >
          <div className="feed-column mx-auto w-full px-4 py-4 sm:px-5 lg:max-w-[var(--feed-max)]">
            {children}
          </div>
        </main>

        <RightPanel />
      </div>

      <MobileBottomNav />
    </div>
  );
}
