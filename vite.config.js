import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/skills-introduction-to-github/',
  server: {
    port: 3000,
    open: true
  }
})
