import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Focus Timer',
        short_name: 'Focus',
        description: 'Minimalist Pomodoro Timer for Students',
        theme_color: '#18181b', // Matches zinc-900
        background_color: '#18181b',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png', // We will generate these later, standard placeholders
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})