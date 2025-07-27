import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.1inch.dev',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, ''),
      }
    }
  }
})
