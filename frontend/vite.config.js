import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
       "/api": "https://ramzee-galaxy-7px4.vercel.app",
      //"/api": "http://localhost:5000",
    },
  },
})