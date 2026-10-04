// Reads the raw drop and reports what kinds of exercise it actually contains,
// plus every record that does not match its own declared format.
//
//   node scripts/analyze-content.mjs [sourceDirectory]
//
// Writes data/content-report.json and docs/CONTENT-FORMAT.md.

import { mkdir, writeFile } from 'node:fs/promises';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import {
  classifyVariant,
  parseFileName,
  parseMediaFileName,
  parseRecord,
  splitAnswers,
} from '../lib/content/format.ts';
import { contentDirectory } from '../lib/server/content.ts';

const root = process.argv[2] ? path.resolve(process.argv[2]) : contentDirectory();
const fileNames = readdirSync(root).sort((a, b) => a.localeCompare(b));

const media = new Map();
const unreadable = [];
for (const fileName of fileNames) {
  const parsed = parseMediaFileName(fileName);
  if (parsed) media.set(parsed.code, { ...parsed, bytes: statSync(path.join(root, fileName)).size });
}

const variants = [];
for (const fileName of fileNames) {
  const file = parseFileName(fileName);
  if (!file) {
    if (!parseMediaFileName(fileName)) unreadable.push(fileName);
    continue;
  }
  const record = parseRecord(readFileSync(path.join(root, fileName), 'utf8'));
  const answers = splitAnswers(record.A);
  const classified = classifyVariant({
    record,
    file,
    answers,
    hasMedia: media.has(file.code),
  });
  variants.push({ file, record, answers, ...classified });
}

const codes = new Set([...variants.map((v) => v.file.code), ...media.keys()]);
const groups = new Map();
for (const code of codes) groups.set(code, variants.filter((v) => v.file.code === code));

const count = (list, pick) => {
  const table = {};
  for (const item of list) {
    const key = pick(item);
    table[key] = (table[key] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(table).sort((a, b) => b[1] - a[1]));
};

const issues = [];
for (const variant of variants)
  variant.issues.forEach((issue, position) =>
    issues.push({
      file: variant.file.fileName,
      issue,
      note: variant.notes[position],
    }),
  );

const orphanMedia = [...media.values()].filter((item) => !groups.get(item.code)?.length);
const withoutMedia = [...codes].filter(
  (code) => groups.get(code)?.length && !media.has(code),
);
// Same fallback the importer uses: a picture whose serial digits drifted still
// belongs to the only record group with the same mode, family and level.
const linkedByGroup = [];
for (const picture of orphanMedia) {
  const candidates = withoutMedia.filter(
    (code) => code.slice(0, 5) === picture.group,
  );
  if (candidates.length === 1)
    linkedByGroup.push({ mediaCode: picture.code, conceptCode: candidates[0], fileName: picture.fileName });
}
const groupLinked = new Set(linkedByGroup.map((item) => item.conceptCode));
const stillWithoutMedia = withoutMedia.filter((code) => !groupLinked.has(code));
const routes = new Set(variants.map((v) => v.file.route));
const missingRoutes = [];
for (const [code, list] of groups) {
  if (!list.length) continue;
  const present = new Set(list.map((v) => v.file.route));
  const absent = [...routes].filter((route) => !present.has(route)).sort();
  if (absent.length) missingRoutes.push({ code, missing: absent });
}

const report = {
  generatedAt: new Date().toISOString(),
  sourceDirectory: root,
  totals: {
    files: fileNames.length,
    records: variants.length,
    media: media.size,
    concepts: codes.size,
    unreadable: unreadable.length,
  },
  byExerciseKind: count(variants, (v) => v.kind),
  byResolvedFlag: count(variants, (v) => v.resolvedFlag),
  byDeclaredFlag: count(variants, (v) => v.declaredFlag || '(missing)'),
  byHintKind: count(variants, (v) => v.hintKind),
  byMode: count(variants, (v) => v.file.mode),
  byLevel: count(variants, (v) => v.file.level),
  byRecordShape: count(variants, (v) => v.record.shape),
  byMediaExtension: count([...media.values()], (m) => m.extension),
  byMediaSlot: count([...media.values()], (m) => m.slot),
  issues: count(issues, (item) => item.issue),
  issueDetail: issues,
  unreadable,
  orphanMedia: orphanMedia.map((item) => ({ code: item.code, fileName: item.fileName })),
  mediaLinkedByGroup: linkedByGroup,
  conceptsWithoutMedia: stillWithoutMedia,
  missingRoutes,
  concepts: [...groups]
    .filter(([, list]) => list.length)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, list]) => {
      const first = list[0].file;
      const english = list.find((v) => v.file.route === '11') ?? list[0];
      return {
        code,
        mode: first.mode,
        family: first.family,
        level: first.level,
        serial: first.serial,
        label: english.answers[0] ?? '',
        records: list.length,
        media:
          media.get(code)?.fileName ??
          linkedByGroup.find((item) => item.conceptCode === code)?.fileName ??
          null,
        kinds: count(list, (v) => v.kind),
        hint: english.record.H || null,
        hintKind: english.hintKind,
        issues: list.flatMap((v) => v.issues),
      };
    }),
};

await mkdir(path.resolve('data'), { recursive: true });
await writeFile(
  path.resolve('data/content-report.json'),
  JSON.stringify(report, null, 2) + '\n',
  'utf8',
);

const table = (title, table_) =>
  '### ' +
  title +
  '\n\n| Valor | Registros |\n| --- | --- |\n' +
  Object.entries(table_)
    .map(([key, value]) => `| \`${key}\` | ${value} |`)
    .join('\n') +
  '\n';

const sample = (kind) => {
  const found = variants.find((v) => v.kind === kind);
  if (!found) return '';
  return (
    '```\n' +
    readFileSync(path.join(root, found.file.fileName), 'utf8').trim() +
    '\n```\n\n_' +
    found.file.fileName +
    '_\n'
  );
};

const markdown = `# Formato del contenido Ki-Roberto

Generado por \`npm run content:analyze\` el ${report.generatedAt.slice(0, 10)} sobre \`${root}\`.
No edites este archivo a mano.

## Nomenclatura

\`\`\`
DFFFLSSS-XY-T.txt        DFFFLSSS-K.<imagen>
│└┬┘│└┬┘  ││
│ │ │ │   │└─ Y  idioma que se practica (el de la respuesta)
│ │ │ │   └── X  idioma que lee el alumno (el del enunciado)
│ │ │ └────── SSS  serie editorial, no interviene en el enrutado
│ │ └──────── L    nivel, 1..9
│ └────────── FFF  familia de conceptos (082 cuerpo, 272 países, 294 frutas...)
└──────────── D    modo de ejercicio
\`\`\`

Idiomas: \`1\` inglés · \`2\` francés · \`3\` español · \`4\` italiano · \`5\` alemán.
Cuando X = Y el alumno no comparte ninguno de los cinco idiomas: el enunciado
desaparece y la imagen es la pregunta (modo unilingüe).

## Estructura del registro

Una letra, un espacio y el valor. \`Q\` puede ocupar varias líneas.

| Campo | Contenido |
| --- | --- |
| \`Q\` | Enunciado. Vacío cuando la imagen es el enunciado. En los de opción múltiple lleva las cuatro opciones separadas por \`;\`. |
| \`A\` | Respuestas aceptadas separadas por comas. La primera es la canónica. |
| \`H\` | Pista, **siempre escrita en el idioma de la respuesta**. |
| \`R\` | Contador de repetición. \`0\` en todo el lote. |
| \`S\` | Secuencia editorial (ruta + serie). Poco fiable, ver incidencias. |
| \`F\` | Marca de formato: \`T\` traducción, \`U\` unilingüe, \`Z\` opción múltiple. |

## Tipos de ejercicio detectados

El tipo se deduce del propio registro y \`F\` solo se usa para contrastar,
porque el lote trae marcas equivocadas.

| Tipo | Se reconoce por | Cómo se juega |
| --- | --- | --- |
| \`choice\` | \`Q\` trae varias opciones separadas por \`;\` (\`F Z\`, modo \`0\`) | Cuatro opciones reales del archivo, se elige una |
| \`naming\` | \`Q\` vacío y hay imagen (\`F U\`) | Se ve la imagen y se **escribe** el nombre |
| \`translation\` | \`Q\` trae una palabra (\`F T\`) | Se lee la palabra y se **escribe** la traducción |
| \`cloze\` | \`H\` contiene un hueco (\`...\`, \`…\`) | Se completa la frase del idioma objetivo |

${table('Ejercicios por tipo', report.byExerciseKind)}
${table('Marca F declarada en el archivo', report.byDeclaredFlag)}
${table('Marca que el contenido admite realmente', report.byResolvedFlag)}
${table('Tipo de pista', report.byHintKind)}
${table('Nivel (quinto dígito)', report.byLevel)}
${table('Modo (primer dígito)', report.byMode)}
${table('Orden de campos en el archivo', report.byRecordShape)}

## Ejemplos

**Traducción**

${sample('translation')}
**Unilingüe con imagen**

${sample('naming')}
**Opción múltiple**

${sample('choice')}
**Hueco en la frase**

${sample('cloze')}
## Incidencias del lote

${table('Incidencias por tipo', report.issues)}
- Imágenes cuyo código no coincide con ningún registro: ${report.orphanMedia.length ? report.orphanMedia.map((m) => `\`${m.fileName}\``).join(', ') : 'ninguna'}
- De esas, enlazadas por modo+familia+nivel al importar: ${report.mediaLinkedByGroup.length ? report.mediaLinkedByGroup.map((m) => `\`${m.fileName}\` → \`${m.conceptCode}\``).join(', ') : 'ninguna'}
- Conceptos que se quedan sin imagen: ${report.conceptsWithoutMedia.length ? report.conceptsWithoutMedia.map((c) => `\`${c}\``).join(', ') : 'ninguno'}
- Letra de la ranura de imagen: ${Object.entries(report.byMediaSlot).map(([k, v]) => `\`${k}\` ${v}`).join(', ')}
- Rutas que faltan: ${report.missingRoutes.length ? report.missingRoutes.map((m) => `\`${m.code}\` (${m.missing.join(', ')})`).join(', ') : 'ninguna'}
- Nombres de archivo ilegibles: ${report.unreadable.length ? report.unreadable.map((f) => `\`${f}\``).join(', ') : 'ninguno'}

El detalle archivo a archivo está en \`data/content-report.json\`.
Las correcciones que sí se aplican al importar están en \`data/content-fixes.json\`.

## Inventario de conceptos

| Código | Modo | Familia | Nivel | Concepto | Registros | Imagen | Tipos |
| --- | --- | --- | --- | --- | --- | --- | --- |
${report.concepts
  .map(
    (concept) =>
      `| \`${concept.code}\` | ${concept.mode} | ${concept.family} | ${concept.level} | ${concept.label} | ${concept.records} | ${concept.media ? '✓' : '—'} | ${Object.entries(concept.kinds).map(([k, v]) => `${k} ${v}`).join(', ')} |`,
  )
  .join('\n')}
`;

await mkdir(path.resolve('docs'), { recursive: true });
await writeFile(path.resolve('docs/CONTENT-FORMAT.md'), markdown, 'utf8');

console.log(
  `Analysed ${report.totals.records} records across ${report.totals.concepts} concepts.`,
);
console.log('Exercise kinds:', report.byExerciseKind);
console.log('Issues:', report.issues);
console.log('Wrote data/content-report.json and docs/CONTENT-FORMAT.md');
