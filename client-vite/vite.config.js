import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Copy PHP API into dist/api so deployed /laina/api/* is handled by PHP
function copyApiPlugin() {
  return {
    name: 'copy-api',
    closeBundle() {
      const root = path.resolve(__dirname)
      const apiSrc = path.join(root, '..', 'server-php')
      const apiDest = path.join(root, 'dist', 'api')
      if (!fs.existsSync(apiSrc)) return
      fs.mkdirSync(apiDest, { recursive: true })
      for (const name of ['index.php', 'app', '.htaccess', 'vendor']) {
        const src = path.join(apiSrc, name)
        const dest = path.join(apiDest, name)
        if (!fs.existsSync(src)) continue
        if (fs.statSync(src).isDirectory()) {
          fs.cpSync(src, dest, { recursive: true })
        } else {
          fs.copyFileSync(src, dest)
        }
      }
      if (fs.existsSync(path.join(apiSrc, '.env'))) {
        fs.copyFileSync(path.join(apiSrc, '.env'), path.join(apiDest, '.env'))
      }
      // Copy client .env to dist root so fetch('./.env') gets BASE_URL when deployed under /laina/
      const clientEnv = path.join(root, '.env')
      if (fs.existsSync(clientEnv)) {
        fs.copyFileSync(clientEnv, path.join(root, 'dist', '.env'))
      }
      console.log('Copied server-php to dist/api')
    },
  }
}

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
    copyApiPlugin(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  server: {
    proxy: {

      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api/, '/laina/server-php/api'),
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