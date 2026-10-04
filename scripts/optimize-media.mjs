// Turns the source pictures into web-sized WebP derivatives under public/media
// and records their real dimensions in data/media-manifest.json.
//
//   node scripts/optimize-media.mjs [sourceDirectory] [--no-trim] [--width 900]
//
// The app prefers these derivatives, so a deployment no longer needs the
// original drop mounted at runtime.

import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { parseMediaFileName } from '../lib/content/format.ts';
import { contentDirectory } from '../lib/server/content.ts';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name, fallback) => {
  const at = args.indexOf(name);
  return at === -1 ? fallback : Number(args[at + 1]);
};

const root = args.find((item) => !item.startsWith('-') && Number.isNaN(Number(item)))
  ? path.resolve(args.find((item) => !item.startsWith('-') && Number.isNaN(Number(item))))
  : contentDirectory();
const output = path.resolve('public/media');
const maxSize = value('--width', 900);
const quality = value('--quality', 82);
const trimming = !flag('--no-trim');

// Most cards are a photo on a flat studio background. Cropping that margin is
// what actually makes the subject fill the card, so it is on by default and
// skipped whenever it would eat most of the picture.
const trimThreshold = 12;
const minimumKeptArea = 0.25;

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const manifest = {};
let sourceBytes = 0;
let outputBytes = 0;
const trimmed = [];
const failed = [];

for (const fileName of (await readdir(root)).sort((a, b) => a.localeCompare(b))) {
  const parsed = parseMediaFileName(fileName);
  if (!parsed) continue;
  const source = path.join(root, fileName);
  sourceBytes += (await stat(source)).size;
  try {
    const { width, height } = await sharp(source, { failOn: 'none' }).metadata();
    let pipeline = sharp(source, { failOn: 'none' }).rotate();
    if (trimming) {
      const cropped = await sharp(source, { failOn: 'none' })
        .trim({ threshold: trimThreshold })
        .toBuffer({ resolveWithObject: true })
        .catch(() => null);
      const kept = cropped
        ? (cropped.info.width * cropped.info.height) / (width * height)
        : 0;
      if (cropped && kept >= minimumKeptArea && kept < 0.995) {
        pipeline = sharp(cropped.data, { failOn: 'none' });
        trimmed.push({
          fileName,
          from: `${width}x${height}`,
          to: `${cropped.info.width}x${cropped.info.height}`,
        });
      }
    }
    const target = parsed.code + '-' + parsed.slot + '.webp';
    const info = await pipeline
      .resize({
        width: maxSize,
        height: maxSize,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 5 })
      .toFile(path.join(output, target));
    outputBytes += info.size;
    manifest[fileName] = {
      file: target,
      width: info.width,
      height: info.height,
      bytes: info.size,
    };
  } catch (error) {
    failed.push({ fileName, message: error.message });
  }
}

await writeFile(
  path.resolve('data/media-manifest.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      sourceDirectory: root,
      maxSize,
      quality,
      trimmed: trimming,
      files: manifest,
    },
    null,
    2,
  ) + '\n',
  'utf8',
);

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1) + ' MB';
console.log(
  `Optimised ${Object.keys(manifest).length} pictures into ${output}: ${mb(sourceBytes)} → ${mb(outputBytes)} (max ${maxSize}px, WebP q${quality}).`,
);
if (trimmed.length)
  console.log(
    `Trimmed the flat margin off ${trimmed.length}: ` +
      trimmed
        .slice(0, 6)
        .map((item) => `${item.fileName} ${item.from}→${item.to}`)
        .join(', ') +
      (trimmed.length > 6 ? ', …' : ''),
  );
if (failed.length) {
  console.error('Failed:', failed);
  process.exitCode = 1;
}
