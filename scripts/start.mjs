import { resolve } from 'node:path';
import { startProdServer } from 'vinext/server/prod-server';

process.env.NODE_ENV = 'production';
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('PORT must be between 1 and 65535');
if (process.env.NEBULA_DEMO_ENABLED !== 'true') {
  throw new Error(
    'This release uses demo identity. Set NEBULA_DEMO_ENABLED=true explicitly to serve the demo. See docs/CLOUD.md.',
  );
}
const { server } = await startProdServer({
  port,
  host: '0.0.0.0',
  outDir: resolve('dist'),
});
console.log(JSON.stringify({ event: 'server_started', port, mode: 'demo' }));
let closing = false;
function shutdown() {
  if (closing) return;
  closing = true;
  console.log(JSON.stringify({ event: 'server_stopping' }));
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
