import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

// The Android app bundles the same React screens without a Node/RSC server.
export default defineConfig({
  root: fileURLToPath(new URL('./mobile', import.meta.url)),
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss()] } },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
      'next/image': fileURLToPath(
        new URL('./mobile/local-image.tsx', import.meta.url),
      ),
    },
  },
  build: { outDir: '../dist-mobile', emptyOutDir: true },
});
