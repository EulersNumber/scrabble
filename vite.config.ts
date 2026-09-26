import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// GitHub Pages project site lives at /scrabble/ (D28). Local/dev keeps `/`.
const base = process.env.VITE_BASE_PATH?.trim() || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
  },
})
