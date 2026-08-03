import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import livekitTokenPlugin from './vite-livekit-plugin.js';

export default defineConfig({
  plugins: [react(), livekitTokenPlugin()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
    open: true,
  },
});
