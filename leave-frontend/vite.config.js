import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The browser only ever talks to localhost:5173. Vite forwards /api/* to Spring Boot,
// so requests are same-origin and CORS never comes into play.
// Do NOT set changeOrigin: true - it would make the backend see a cross-origin request.
const proxy = { '/api': { target: 'http://localhost:8080' } }

export default defineConfig({ plugins: [react()], server: { port: 5173, proxy }, preview: { proxy } })
