import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// The engine is deliberately free of React and the DOM, so its tests need no
// browser environment — `node` keeps the suite fast.
export default defineConfig({
  root: fileURLToPath(new URL('..', import.meta.url)),
  resolve: {
    alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
