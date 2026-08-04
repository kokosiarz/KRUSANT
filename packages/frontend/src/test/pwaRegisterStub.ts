/**
 * Stand-in for `virtual:pwa-register` under Vitest.
 *
 * That module is synthesised by vite-plugin-pwa during a real build, so it
 * doesn't exist when the test runner resolves imports — App.test.tsx failed on
 * it as soon as PwaPrompts was mounted in App. Aliased in vite.config.ts under
 * `test.alias`.
 */
export function registerSW(): (reload?: boolean) => Promise<void> {
  return () => Promise.resolve();
}
