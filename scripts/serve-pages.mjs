// Serves gh-pages-dist locally so the static build can be checked before it is
// published: node scripts/serve-pages.mjs [port]

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const root = path.resolve('gh-pages-dist');
const port = Number(process.argv[2] ?? process.env.PORT ?? 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

if (!existsSync(root)) {
  console.error('Run "npm run pages:build" first.');
  process.exit(1);
}

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
  const file = path.resolve(root, relative);
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('Not found');
    return;
  }
  response.writeHead(200, {
    'Content-Type': types[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(file).pipe(response);
}).listen(port, () => console.log(`Static demo on http://localhost:${port}`));
