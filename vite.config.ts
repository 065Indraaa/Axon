import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mkcert()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'public',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'clsx', 'tailwind-merge', 'react-hot-toast'],
          'vendor-web3': ['wagmi', 'viem', '@tanstack/react-query', '@coinbase/onchainkit', '@rainbow-me/rainbowkit'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    https: true
  },
  preview: {
    port: 4173,
    host: true
  }
})
