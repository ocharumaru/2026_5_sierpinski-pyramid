import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.split('\\').join('/')

          if (!normalized.includes('/node_modules/')) return

          if (
            normalized.includes('/three/') ||
            normalized.includes('/@react-three/fiber/') ||
            normalized.includes('/@react-three/drei/')
          ) {
            return 'three-vendor'
          }

          if (
            normalized.includes('/react-router-dom/') ||
            normalized.includes('/react-router/')
          ) {
            return 'router-vendor'
          }

          if (
            normalized.includes('/react-dom/') ||
            normalized.includes('/react/')
          ) {
            return 'react-vendor'
          }
        },
      },
    },
  },
})
