import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'ChessGeek',
        short_name: 'ChessGeek',
        start_url: '/',
        display: 'standalone',
        background_color: '#172430',
        theme_color: '#172430',
        icons: [
          { src: 'logo-rounded.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo-rounded.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist'
  },
  
  server: {
    historyApiFallback: true,
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    },
    host: '0.0.0.0'
  },
  
})
