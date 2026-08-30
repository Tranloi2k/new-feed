export const OPEN_COMPOSER_EVENT = "newfeed:open-composer";

export function requestComposerOpen() {
  if (typeof window === "undefined") return;

  if (!window.location.pathname.startsWith("/home")) {
    window.location.assign("/home?compose=1");
    return;
  }

  const event = new Event(OPEN_COMPOSER_EVENT, { cancelable: true });
  const handled = !window.dispatchEvent(event);

  if (!handled) {
    document.querySelector<HTMLButtonElement>("[data-composer-trigger]")?.click();
  }
}
