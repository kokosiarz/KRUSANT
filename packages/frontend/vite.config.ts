/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // The manifest is hand-written in public/ so it stays readable and the
      // plugin doesn't own branding; it just needs to know not to inject one.
      manifest: false,
      injectRegister: null, // registered explicitly in src/pwa.ts
      registerType: 'prompt',
      workbox: {
        // The chunked bundle is large (FullCalendar, DataGrid); the default
        // 2 MB cap would silently skip precaching them.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
        // SPA: any navigation that isn't a real file falls back to the shell.
        navigateFallback: '/index.html',
        // The API must never be served from cache — stale students, balances
        // or attendance would be worse than an honest offline error.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
        ],
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    alias: {
      // vite-plugin-pwa synthesises this at build time, so it doesn't exist
      // for the test runner to resolve.
      'virtual:pwa-register': path.resolve(__dirname, './src/test/pwaRegisterStub.ts'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@components': path.resolve(__dirname, './src/Components'),
      '@common': path.resolve(__dirname, './src/Components/Common'),
      '@pages': path.resolve(__dirname, './src/Pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 3001,
    strictPort: false,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    minify: 'terser',
  },
});
