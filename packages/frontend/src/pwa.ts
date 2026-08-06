import { registerSW } from 'virtual:pwa-register';

/**
 * Service worker registration.
 *
 * `registerType: 'prompt'` on purpose: this app shows live financial and
 * attendance data, so a new version must never swap itself in under someone
 * mid-edit. The worker waits, and PwaPrompts offers a reload instead.
 */
let applyUpdate: ((reload?: boolean) => Promise<void>) | null = null;
let registered = false;
let onUpdateAvailableCallback: (() => void) | null = null;

export function initPwa(onUpdateAvailable: () => void): void {
  // Registering from an insecure origin throws; local dev over plain http is
  // the normal case for that, and it isn't worth an error in the console.
  if (!('serviceWorker' in navigator)) return;

  // Always take the latest callback, but register exactly once. A second
  // registerSW() builds a second Workbox instance with its own listeners, and
  // the update handle we keep would point at that one — whose `waiting` is
  // empty, because the waiting event fired on the first. The refresh button
  // then silently does nothing.
  onUpdateAvailableCallback = onUpdateAvailable;
  if (registered) return;
  registered = true;

  applyUpdate = registerSW({
    immediate: true,
    onNeedRefresh: () => onUpdateAvailableCallback?.(),
  });
}

/**
 * Activates the waiting worker and reloads.
 *
 * The plugin's update function only posts SKIP_WAITING; the reload comes from
 * the service worker's `controlling` event firing afterwards. That event never
 * arrives if there is no worker waiting to take over — which happens once the
 * update has already been applied in another tab, leaving this tab showing a
 * notice whose button appears to do nothing. So the reload is guaranteed here
 * instead: if the worker took over, the page is gone long before the timer.
 */
export async function applyPendingUpdate(): Promise<void> {
  try {
    await applyUpdate?.(true);
  } catch {
    // Fall through — reloading is still the right move.
  }
  window.setTimeout(() => window.location.reload(), 1500);
}

/** True when running as an installed app rather than a browser tab. */
export function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari predates display-mode and uses this instead.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * iOS has never fired `beforeinstallprompt`, so there is no way to trigger the
 * install from script — the user has to go through the Share sheet. Detecting
 * it lets us show instructions rather than a button that can't work.
 */
export function isIos(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS reports itself as a Mac; the touch point count gives it away.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * The browser's install offer, held so it can be used later.
 *
 * `beforeinstallprompt` fires once, early, and the event is the *only* handle
 * on the install dialog — miss it and there is no way to install from script
 * for the rest of the page's life. So this listens at module load and keeps the
 * event regardless of whether anything is currently offering to install: the
 * banner can be dismissed, or never shown at all, and "Zainstaluj aplikację" in
 * the profile panel still works. This used to be owned by the banner component,
 * which stopped listening entirely once the offer had been dismissed — so
 * changing your mind afterwards was impossible until the dismissal expired.
 */
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installedThisSession = false;
const installListeners = new Set<() => void>();

const notifyInstallListeners = () => installListeners.forEach((listener) => listener());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Suppress the browser's own mini-infobar so the offer appears in the app's
    // language and styling instead.
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notifyInstallListeners();
  });
  window.addEventListener('appinstalled', () => {
    installedThisSession = true;
    deferredPrompt = null;
    notifyInstallListeners();
  });
}

export function subscribeToInstallState(listener: () => void): () => void {
  installListeners.add(listener);
  return () => installListeners.delete(listener);
}

/** True when the browser has offered an install we can still trigger. */
export const canPromptInstall = (): boolean => deferredPrompt !== null;

export const wasInstalledThisSession = (): boolean => installedThisSession;

/**
 * Opens the browser's install dialog. The event is single-use — the browser
 * fires a fresh one on a later load if the app is still installable — so it is
 * discarded either way and callers must re-check `canPromptInstall`.
 */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const event = deferredPrompt;
  if (!event) return 'unavailable';
  await event.prompt();
  const { outcome } = await event.userChoice;
  deferredPrompt = null;
  notifyInstallListeners();
  return outcome;
}
