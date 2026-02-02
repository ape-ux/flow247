import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 4000,
    host: true,
    proxy: {
      '/xano': {
        target: 'https://xjlt-4ifj-k7qu.n7e.xano.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/xano/, ''),
      },
    },
  },
})
