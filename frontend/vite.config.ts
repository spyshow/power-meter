/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    deps: {
      optimizer: {
        web: {
          include: ['@refinedev/core', '@refinedev/antd', '@refinedev/react-router-v6', '@refinedev/simple-rest'],
        },
      },
    },
    ssr: {
      noExternal: [/@refinedev\/.*/, /antd/],
    },
  },
})
