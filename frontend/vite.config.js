import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // En local, on relaie /api et /auth vers le backend Express (npm run dev
    // dans backend/) pour que le frontend et le backend soient vus comme la
    // même origine par le navigateur — mêmes chemins relatifs qu'en prod,
    // où c'est Netlify qui fait ce relais (voir gen-redirects.mjs).
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/auth': { target: 'http://localhost:4000', changeOrigin: true }
    }
  }
});
