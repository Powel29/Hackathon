import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],

  define: {
    // Build-time flag stripping (FR-SEC-004)
    // __DEV_BYPASS__ is always false in production builds.
    // import.meta.env.DEV is handled by Vite natively, but we guard here explicitly.
    ...(mode === 'production' ? {
      'import.meta.env.DEV': JSON.stringify(false),
    } : {}),
  },

  build: {
    // Performance budget enforcement (FR-DEP-003)
    chunkSizeWarningLimit: 500, // 500 KB warning threshold
    rollupOptions: {
      output: {
        // Code-split vendor libraries to optimize caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          i18n: ['i18next', 'react-i18next'],
          ui: ['lucide-react', 'sonner'],
          state: ['zustand'],
          forms: ['react-hook-form', 'zod'],
        },
      },
    },
  },

}))
