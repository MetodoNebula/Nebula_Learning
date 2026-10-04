import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// Local-only demo: no Cloudflare bindings or remote services are required.
export default defineConfig({
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [
    vinext(),
    {
      name: 'nebula-local-apk-download',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          if (request.url?.split('?')[0] !== '/downloads/nebula-tech-debug.apk')
            return next();
          const apk = fileURLToPath(
            new URL('./releases/nebula-tech-debug.apk', import.meta.url),
          );
          if (!existsSync(apk)) {
            response.statusCode = 404;
            response.end(
              'El APK aún no se ha generado. Ejecuta crear-apk.cmd.',
            );
            return;
          }
          response.setHeader(
            'Content-Type',
            'application/vnd.android.package-archive',
          );
          response.setHeader(
            'Content-Disposition',
            'attachment; filename="nebula-tech-debug.apk"',
          );
          response.setHeader('Content-Length', statSync(apk).size);
          response.setHeader('Cache-Control', 'no-store');
          if (request.method === 'HEAD') {
            response.end();
            return;
          }
          createReadStream(apk)
            .on('error', () => response.destroy())
            .pipe(response);
        });
      },
    },
  ],
  optimizeDeps: { entries: ['app/**/*.{ts,tsx}'] },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Build outputs are rewritten wholesale (and OneDrive locks files while it
    // syncs them), which makes the watcher die with EBUSY mid-session.
    watch: {
      ignored: [
        '**/.tools/**',
        '**/android/**',
        '**/ios/**',
        '**/dist/**',
        '**/dist-mobile/**',
        '**/gh-pages-dist/**',
        '**/gh-pages-single/**',
        '**/releases/**',
        '**/deliverables/**',
        '**/tmp/**',
      ],
    },
  },
});
