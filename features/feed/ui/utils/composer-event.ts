export const OPEN_COMPOSER_EVENT = "newfeed:open-composer";

export function requestComposerOpen() {
  if (typeof window === "undefined") return;

  if (window.location.pathname !== "/home") {
    window.location.assign("/home?compose=1");
    return;
  }

  window.dispatchEvent(new Event(OPEN_COMPOSER_EVENT));
}
