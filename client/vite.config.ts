import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

const PORT = process.env.APP_PORT ? Number(process.env.APP_PORT) : 80

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: PORT,
    proxy: {
      '/api': {
        target: process.env.API_URL || `http://localhost:${process.env.SERVER_PORT || 81}/`,
      },
    },
    allowedHosts: process.env.ALLOWED_HOSTS?.split(',').map((host) => host.trim()) || [],
  },
  logLevel: 'warn',
  clearScreen: false
})
