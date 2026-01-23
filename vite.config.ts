import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
        target: 'es2018',
        cssCodeSplit: true,
        minify: 'esbuild',
        chunkSizeWarningLimit: 500,
        rollupOptions: {
          output: {
            manualChunks: {
              react: ['react', 'react-dom'],
              charts: ['recharts'],
              icons: ['lucide-react'],
              realtime: ['socket.io-client'],
              state: ['zustand'],
            },
          },
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
