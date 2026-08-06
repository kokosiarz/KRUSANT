import { useSyncExternalStore } from 'react';
import {
  canPromptInstall,
  isIos,
  isStandalone,
  promptInstall,
  subscribeToInstallState,
  wasInstalledThisSession,
} from '@/pwa';

export interface PwaInstallState {
  /** The browser has an install dialog we can open right now. */
  canInstall: boolean;
  /** Installed while this page was open — the offer should disappear. */
  justInstalled: boolean;
  /** Already running as an installed app, so there is nothing to offer. */
  standalone: boolean;
  /** No install event will ever arrive; the Share sheet is the only route. */
  ios: boolean;
  /** True when there is any point offering an install at all. */
  installable: boolean;
  promptInstall: typeof promptInstall;
}

/**
 * Whether and how this browser can install the app.
 *
 * Two subscriptions rather than one object, because `useSyncExternalStore`
 * compares snapshots by identity — returning a fresh object each call would
 * re-render forever.
 */
export function usePwaInstall(): PwaInstallState {
  const canInstall = useSyncExternalStore(subscribeToInstallState, canPromptInstall, () => false);
  const justInstalled = useSyncExternalStore(
    subscribeToInstallState,
    wasInstalledThisSession,
    () => false
  );

  // Not reactive, and doesn't need to be: a tab doesn't become standalone
  // mid-session. Installing while open is covered by `justInstalled`.
  const standalone = isStandalone();
  const ios = isIos();

  return {
    canInstall,
    justInstalled,
    standalone,
    ios,
    installable: !standalone && !justInstalled && (canInstall || ios),
    promptInstall,
  };
}

export default usePwaInstall;
