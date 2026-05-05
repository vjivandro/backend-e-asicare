import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Otomatis update service worker kalau ada versi baru
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'], // Sesuaikan kalau ada
      manifest: {
        name: 'e-ASI Care',
        short_name: 'e-ASI',
        description: 'Buku Harian Makan & Pemantauan Gizi Ibu Nifas',
        theme_color: '#FF85B3', // Warna header/status bar HP (sesuaikan warna pink app Mas Juris)
        background_color: '#ffffff',
        display: 'standalone', // Bikin tampilannya full screen tanpa address bar browser
        icons: [
          {
            src: 'icon-192x192.png', // Pastikan nama file sesuai di folder public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Bagus untuk icon HP Android modern
          }
        ]
      }
    })
  ]
})
