import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const built = spawnSync(
  process.execPath,
  [
    'node_modules/vite/bin/vite.js',
    'build',
    '--config',
    'vite.mobile.config.ts',
  ],
  {
    stdio: 'inherit',
  },
);
if (built.status !== 0) process.exit(built.status ?? 1);
if (!existsSync('dist-mobile/index.html'))
  throw new Error(
    'No se ha generado dist-mobile/index.html. No se sincronizará una aplicación incompleta.',
  );
const synced = spawnSync(
  process.execPath,
  ['node_modules/@capacitor/cli/bin/capacitor', 'sync', 'android'],
  { stdio: 'inherit' },
);
process.exit(synced.status ?? 1);
