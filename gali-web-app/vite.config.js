import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/imb-api': {
        target: 'https://secure-stage.imb.org.in',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/imb-api/, ''),
      },
    },
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',

    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    }
  }
})