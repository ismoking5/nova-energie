import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['localhost', '127.0.0.1', 'nova-energie-4.onrender.com'],
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: ['localhost', '127.0.0.1', 'nova-energie-4.onrender.com'],
  },
});
