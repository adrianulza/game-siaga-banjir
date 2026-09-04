import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The repo deploys to a GitHub Pages *project* site, so every asset URL must be
// prefixed with the repo name. Without this the built page 404s on its own JS.
const BASE = '/game-siaga-banjir/'

export default defineConfig({
  base: BASE,
  root: fileURLToPath(new URL('..', import.meta.url)),
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL('../dist', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    open: true,
  },
})
