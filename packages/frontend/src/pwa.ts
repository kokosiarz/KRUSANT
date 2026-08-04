import { registerSW } from 'virtual:pwa-register';

/**
 * Service worker registration.
 *
 * `registerType: 'prompt'` on purpose: this app shows live financial and
 * attendance data, so a new version must never swap itself in under someone
 * mid-edit. The worker waits, and PwaPrompts offers a reload instead.
 */
let applyUpdate: ((reload?: boolean) => Promise<void>) | null = null;

export function initPwa(onUpdateAvailable: () => void): void {
  // Registering from an insecure origin throws; local dev over plain http is
  // the normal case for that, and it isn't worth an error in the console.
  if (!('serviceWorker' in navigator)) return;

  applyUpdate = registerSW({
    immediate: true,
    onNeedRefresh: onUpdateAvailable,
  });
}

/** Activates the waiting worker and reloads. */
export async function applyPendingUpdate(): Promise<void> {
  await applyUpdate?.(true);
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
