
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        id: '/',
        name: 'Pogoda',
        short_name: 'Pogoda',
        description: 'Aktualna pogoda dla wybranego miasta',
        lang: 'pl',
        display: 'standalone',
        background_color: '#1e3c72',
        theme_color: '#1e3c72',

        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],

        screenshots: [
          {
            src: '/screenshots/pogoda-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Pogoda - widok szeroki'
          },
          {
            src: '/screenshots/pogoda-narrow.png',
            sizes: '540x960',
            type: 'image/png',
            label: 'Pogoda - widok mobilny'
          }
        ]
      },

      workbox: {
        runtimeCaching: [
          {
            // Pogoda: najpierw sieć, potem cache
            urlPattern: ({ url }) =>
              url.origin === 'https://api.openweathermap.org',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-api',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 24 * 60 * 60
              }
            }
          },
          {
            // Ikony pogody: najpierw cache
            urlPattern: ({ url }) =>
              url.origin === 'https://openweathermap.org' &&
              url.pathname.startsWith('/img/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'weather-icons',
              expiration: {
                maxEntries: 50
              }
            }
          }
        ]
      }
    })
  ]
});
