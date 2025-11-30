import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
      globals: true,
      environment: 'jsdom',
      // Usa path.join y __dirname para asegurar compatibilidad Windows/Linux
      setupFiles: [path.resolve(__dirname, 'src/setupTests.ts')],
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})