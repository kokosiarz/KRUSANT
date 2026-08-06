import { vi } from 'vitest';

/**
 * The install offer is captured at module load and has to survive being
 * ignored: someone who dismisses the banner and changes their mind later uses
 * the entry in the profile panel, which only works if the event was kept.
 */
async function loadPwaModule() {
  vi.resetModules();
  return import('./pwa');
}

function fireBeforeInstallPrompt(outcome: 'accepted' | 'dismissed' = 'accepted') {
  const event = new Event('beforeinstallprompt') as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  };
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome });
  window.dispatchEvent(event);
  return event;
}

describe('install prompt store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has nothing to offer until the browser says the app is installable', async () => {
    const pwa = await loadPwaModule();
    expect(pwa.canPromptInstall()).toBe(false);
    await expect(pwa.promptInstall()).resolves.toBe('unavailable');
  });

  it('keeps the browser offer so it can be used later', async () => {
    const pwa = await loadPwaModule();
    fireBeforeInstallPrompt();
    expect(pwa.canPromptInstall()).toBe(true);
  });

  it('still has the offer after the banner has been dismissed — this is the whole point', async () => {
    const pwa = await loadPwaModule();
    fireBeforeInstallPrompt();

    // What pressing "Nie teraz" records. The store must not care.
    localStorage.setItem('krusant.installPromptDismissedAt', String(Date.now()));

    expect(pwa.canPromptInstall()).toBe(true);
  });

  it('opens the dialog and reports what the user chose', async () => {
    const pwa = await loadPwaModule();
    const event = fireBeforeInstallPrompt('accepted');

    await expect(pwa.promptInstall()).resolves.toBe('accepted');
    expect(event.prompt).toHaveBeenCalledTimes(1);
  });

  it('discards the offer once used, since the event is single-use', async () => {
    const pwa = await loadPwaModule();
    fireBeforeInstallPrompt('dismissed');

    await expect(pwa.promptInstall()).resolves.toBe('dismissed');
    expect(pwa.canPromptInstall()).toBe(false);
    // The browser fires a fresh event on a later load if still installable.
    fireBeforeInstallPrompt();
    expect(pwa.canPromptInstall()).toBe(true);
  });

  it('drops the offer once the app is installed', async () => {
    const pwa = await loadPwaModule();
    fireBeforeInstallPrompt();
    expect(pwa.wasInstalledThisSession()).toBe(false);

    window.dispatchEvent(new Event('appinstalled'));

    expect(pwa.wasInstalledThisSession()).toBe(true);
    expect(pwa.canPromptInstall()).toBe(false);
  });

  it('notifies subscribers, so the profile entry appears without a reload', async () => {
    const pwa = await loadPwaModule();
    const listener = vi.fn();
    const unsubscribe = pwa.subscribeToInstallState(listener);

    fireBeforeInstallPrompt();
    expect(listener).toHaveBeenCalled();

    unsubscribe();
    listener.mockClear();
    window.dispatchEvent(new Event('appinstalled'));
    expect(listener).not.toHaveBeenCalled();
  });
});
