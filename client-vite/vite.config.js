import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'treat-js-as-jsx',
      async transform(code, id) {
        if (!id.includes('node_modules') && /\.js$/.test(id)) {
          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic',
          })
        }
      },
    },
    react(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/lainaaminen-projekti/server-php/public/',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    chunkSizeWarningLimit: 2000,
  },
})
