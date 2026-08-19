import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PackWise',
        short_name: 'PackWise',
        description: 'Seu planejador de viagens inteligente',
        theme_color: '#f7f4ef',
        background_color: '#f7f4ef',
        display: 'standalone',
        icons: []
      }
    })
  ],
  server: { port: 5173 }
});
