import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://nextstep-wp-2210991163-2210991120.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

