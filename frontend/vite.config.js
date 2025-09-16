import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, 'src/lib')
    }
  },
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    host: '0.0.0.0'  // Listen on all available network interfaces
  }
})
