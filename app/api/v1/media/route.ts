import { readFile } from 'node:fs/promises';
import { resolveMediaPath } from '../../../../lib/server/content.ts';
import { demoEnabled, json } from '../../../../lib/server/http.ts';

const mimeTypes: Record<string, string> = {
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export async function GET(request: Request) {
  if (!demoEnabled()) return json({ error: 'DEMO_DISABLED' }, 503);
  const fileName = new URL(request.url).searchParams.get('file') ?? '';
  const mediaPath = resolveMediaPath(fileName);
  if (!mediaPath) return json({ error: 'MEDIA_NOT_FOUND' }, 404);
  try {
    const data = await readFile(mediaPath);
    const extension = fileName.split('.').pop()?.toLocaleLowerCase('en') ?? '';
    return new Response(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': mimeTypes[extension] ?? 'application/octet-stream',
      },
    });
  } catch {
    return json({ error: 'MEDIA_NOT_FOUND' }, 404);
  }
}
