import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/


export default defineConfig({
  resolve: {
    alias: {
      "pdfjs-dist/build/pdf.worker.min.js": "pdfjs-dist/legacy/build/pdf.worker.min.js",
    },
  },
  plugins: [react()],
});

