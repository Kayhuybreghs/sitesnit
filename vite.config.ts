import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        diensten: resolve(__dirname, 'diensten/index.html'),
        projecten: resolve(__dirname, 'projecten/index.html'),
        case: resolve(__dirname, 'projecten/cases/index.html'),
        prijzen: resolve(__dirname, 'prijzen/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
      },
    },
  },
});
