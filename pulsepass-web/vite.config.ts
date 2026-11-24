import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  server: {
    // El backend autoriza CORS desde localhost:5173 por defecto. Si ese
    // puerto está ocupado, falla al iniciar en vez de arrancar en otro.
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  ...(mode === 'test' ? {
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://localhost'),
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      clearMocks: true,
      restoreMocks: true,
      testTimeout: 15000,
      hookTimeout: 15000,
    },
  } : {}),
}))
