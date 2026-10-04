import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  buildContentDatabase,
  contentDirectory,
} from '../lib/server/content.ts';

const root = process.argv[2] ? resolve(process.argv[2]) : contentDirectory();
const output = resolve('data/content-db.json');
const database = buildContentDatabase(root);

await writeFile(output, JSON.stringify(database, null, 2) + '\n', 'utf8');

const variants = database.concepts.flatMap((concept) => concept.variants);
const usable = variants.filter((variant) => variant.usable);
const kinds = {};
for (const variant of usable) kinds[variant.kind] = (kinds[variant.kind] ?? 0) + 1;
const media = database.concepts.filter((concept) => concept.media);

console.log(
  `Imported ${usable.length}/${variants.length} usable variants across ${database.concepts.length} concepts into ${output}`,
);
console.log('By exercise kind:', kinds);
console.log(
  `Media: ${media.length} concepts (${media.filter((c) => c.media.link === 'group').length} matched by mode+family+level)`,
);
if (database.skipped.length)
  console.log('Skipped:', database.skipped.length, database.skipped.slice(0, 10));
