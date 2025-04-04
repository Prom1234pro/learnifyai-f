import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/


export default defineConfig({
  theme: {
    extend: {
      height: {
        'app-screen': 'var(--app-height)',
      },
    },
  },
  resolve: {
    alias: {
      "pdfjs-dist/build/pdf.worker.min.js": "pdfjs-dist/legacy/build/pdf.worker.min.js",
    },
  },
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://learnifya1-d7a809b39e9d.herokuapp.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});

