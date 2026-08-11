import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Firebase is the bulk of the bundle and changes only on dependency bumps.
        // Keeping it separate means an app-code deploy re-downloads a small chunk
        // instead of invalidating everything in the service worker precache.
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icons/apple-touch-icon.png', 'startup/*.png'],
      manifest: {
        name: 'ReadCoach',
        short_name: 'ReadCoach',
        description: 'Aus gelesenen Seiten gelebte Veränderung.',
        lang: 'de',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#16130F',
        background_color: '#16130F',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // No `woff`: every target browser reads woff2, and precaching both would
        // double the offline payload for nothing.
        globPatterns: ['**/*.{js,css,html,png,woff2}'],
        // Every route is client-side; unknown paths must resolve to the shell.
        navigateFallback: '/index.html',
        // Except /__/ — Firebase Hosting serves the auth handler and iframe from
        // there. Because authDomain is this very domain (required so Safari's
        // tracking prevention does not break signInWithRedirect), those URLs sit
        // inside the service worker's scope, and the fallback would answer them
        // with the app shell. Sign-in then returns to a page that cannot complete
        // it. This denylist is what keeps the redirect reaching the real handler.
        navigateFallbackDenylist: [/^\/__\//],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
