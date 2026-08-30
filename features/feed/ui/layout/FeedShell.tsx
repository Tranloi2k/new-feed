import { FeedTopBar, type FeedUser } from "./FeedTopBar";
import { LeftNav } from "./LeftNav";
import { RightPanel } from "./RightPanel";
import { MobileBottomNav } from "./MobileBottomNav";

export function FeedShell({
  user,
  children,
  layout = "feed",
}: {
  user?: FeedUser;
  children: React.ReactNode;
  layout?: "feed" | "chat";
}) {
  const isChatLayout = layout === "chat";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <FeedTopBar user={user} />

      <div
        className={
          isChatLayout
            ? "grid w-full grid-cols-1 pt-[var(--header-height)] lg:grid-cols-[var(--nav-width)_minmax(0,1fr)]"
            : "grid w-full grid-cols-1 pt-[var(--header-height)] lg:grid-cols-[minmax(0,1fr)_minmax(0,680px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,720px)_minmax(0,1fr)]"
        }
      >
        <div className="hidden lg:block">
          <LeftNav user={user} expanded={isChatLayout} />
        </div>

        <main
          className={
            isChatLayout
              ? "min-h-[calc(100vh-var(--header-height))] w-full pb-[var(--bottom-nav-height)] lg:pb-0"
              : "min-h-[calc(100vh-var(--header-height))] w-full pb-[var(--bottom-nav-height)] lg:pb-8"
          }
          role={isChatLayout ? undefined : "feed"}
        >
          <div
            className={
              isChatLayout
                ? "w-full"
                : "w-full"
            }
          >
            <div
              className={
                isChatLayout
                  ? "min-h-[calc(100vh-var(--header-height))] overflow-hidden bg-[var(--surface)]"
                  : "min-h-[calc(100vh-var(--header-height))]"
              }
            >
              {children}
            </div>
          </div>
        </main>

        {!isChatLayout && <RightPanel user={user} />}
      </div>

      <MobileBottomNav user={user} />
    </div>
  );
}
