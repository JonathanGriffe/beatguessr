import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    host: '0.0.0.0',
    proxy: { '/api': { target: 'http://backend:8000', changeOrigin: true, cookieDomainRewrite: "backend", rewrite: (path) => path.replace(/^\/api/, "") } }
  }
})