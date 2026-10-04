import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import db from '../../data/content-db.json' with { type: 'json' };
import fixes from '../../data/content-fixes.json' with { type: 'json' };
import mediaManifest from '../../data/media-manifest.json' with { type: 'json' };
import {
  classifyVariant,
  decodeCode,
  matchAnswer,
  mediaFilePattern,
  parseFileName,
  parseMediaFileName,
  parseRecord,
  splitAnswers,
  splitCloze,
  type ExerciseKind,
  type HintKind,
  type LanguageId,
} from '../content/format.ts';
import {
  languagePair,
  type AnswerMode,
  type LearningProfile,
  type Question,
} from '../lesson.ts';
import type { LevelAvailability } from '../contracts.ts';

const DEFAULT_CONTENT_DIR = 'E:\\Nebula_Tech\\Ki-Roberto';

export type ContentVariant = {
  id: string;
  code: string;
  fileName: string;
  route: string;
  sourceLanguage: LanguageId;
  targetLanguage: LanguageId;
  level: number;
  kind: ExerciseKind;
  flag: 'T' | 'U' | 'Z';
  declaredFlag: string;
  /** Word shown to the learner; empty when the picture is the prompt. */
  prompt: string;
  options: string[];
  hint: string;
  hintKind: HintKind;
  cloze?: { before: string; after: string };
  answers: string[];
  primaryAnswer: string;
  repeat: number;
  sequence: string;
  issues: string[];
  usable: boolean;
};

export type ContentMedia = {
  fileName: string;
  slot: string;
  extension: string;
  bytes: number;
  /** Whether the picture matched the full code or only mode+family+level. */
  link: 'exact' | 'group';
};

type OptimisedPicture = { file: string; width: number; height: number };
const optimised = mediaManifest.files as Record<string, OptimisedPicture>;

/**
 * Web-sized derivative built by scripts/optimize-media.mjs, served straight
 * from public/. Falls back to the media route over the original drop.
 */
export function pictureFor(media: ContentMedia | undefined) {
  if (!media) return undefined;
  const web = optimised[media.fileName];
  if (web)
    return {
      src: '/media/' + web.file,
      width: web.width,
      height: web.height,
    };
  return {
    src: '/api/v1/media?file=' + encodeURIComponent(media.fileName),
    width: 0,
    height: 0,
  };
}

export type ContentConcept = {
  code: string;
  mode: string;
  family: string;
  level: number;
  serial: string;
  group: string;
  label: string;
  media?: ContentMedia;
  variants: ContentVariant[];
};

export type ContentDatabase = {
  version: number;
  sourceDirectory: string;
  generatedAt: string;
  concepts: ContentConcept[];
  skipped: { fileName: string; reason: string }[];
};

export function contentDirectory() {
  return process.env.NEBULA_CONTENT_DIR || DEFAULT_CONTENT_DIR;
}

export function parseContentFileName(fileName: string) {
  const parsed = parseFileName(fileName);
  if (!parsed) return null;
  return {
    code: parsed.code,
    pair: parsed.route as `${LanguageId}${LanguageId}`,
    sourceLanguage: parsed.sourceLanguage,
    targetLanguage: parsed.targetLanguage,
    level: parsed.level,
  };
}

export function resolveMediaPath(
  fileName: string,
  database: ContentDatabase = contentDatabase(),
) {
  if (!mediaFilePattern.test(fileName)) return null;
  const known = database.concepts.some(
    (concept) => concept.media?.fileName === fileName,
  );
  if (!known) return null;
  const root = database.sourceDirectory || contentDirectory();
  const resolved = path.resolve(root, fileName);
  const base = path.resolve(root);
  return resolved.startsWith(base + path.sep) ? resolved : null;
}

export function contentDatabase(): ContentDatabase {
  return db as ContentDatabase;
}

const answerFixes = new Map(
  fixes.answers.map((fix) => [fix.id + '\u0000' + fix.from, fix.to]),
);

function applyAnswerFixes(id: string, answers: string[]) {
  return answers.map((answer) => answerFixes.get(id + '\u0000' + answer) ?? answer);
}

function readMedia(root: string) {
  const byCode = new Map<string, ContentMedia & { code: string; group: string }>();
  for (const fileName of readdirSync(root)) {
    const parsed = parseMediaFileName(fileName);
    if (!parsed) continue;
    byCode.set(parsed.code, {
      code: parsed.code,
      group: parsed.group,
      fileName,
      slot: parsed.slot,
      extension: parsed.extension,
      bytes: statSync(path.join(root, fileName)).size,
      link: 'exact',
    });
  }
  return byCode;
}

export function buildContentDatabase(
  root = contentDirectory(),
): ContentDatabase {
  const skipped: ContentDatabase['skipped'] = [];
  if (!existsSync(root))
    return {
      version: 2,
      sourceDirectory: root,
      generatedAt: new Date().toISOString(),
      concepts: [],
      skipped,
    };
  const media = readMedia(root);
  const concepts = new Map<string, ContentConcept>();
  const fileNames = readdirSync(root).sort((a, b) => a.localeCompare(b));
  const textFiles = fileNames
    .map((fileName) => ({ fileName, parsed: parseFileName(fileName) }))
    .filter((entry) => entry.parsed);
  const usedMedia = new Set<string>();

  for (const { fileName, parsed } of textFiles) {
    const file = parsed!;
    const picture = media.get(file.code);
    if (picture) usedMedia.add(file.code);
    const record = parseRecord(readFileSync(path.join(root, fileName), 'utf8'));
    const id = file.code + '-' + file.route;
    const answers = applyAnswerFixes(id, splitAnswers(record.A));
    const classified = classifyVariant({
      record,
      file,
      answers,
      hasMedia: Boolean(picture),
    });
    const usable =
      answers.length > 0 &&
      (classified.kind !== 'naming' || Boolean(picture)) &&
      (classified.kind !== 'choice' || classified.options.length >= 2);
    if (!usable && !answers.length) skipped.push({ fileName, reason: 'no_answers' });
    else if (!usable) skipped.push({ fileName, reason: 'no_prompt' });
    const concept =
      concepts.get(file.code) ??
      ({
        ...decodeCode(file.code),
        label: '',
        media: picture
          ? {
              fileName: picture.fileName,
              slot: picture.slot,
              extension: picture.extension,
              bytes: picture.bytes,
              link: picture.link,
            }
          : undefined,
        variants: [],
      } satisfies ContentConcept);
    concept.variants.push({
      id,
      code: file.code,
      fileName,
      route: file.route,
      sourceLanguage: file.sourceLanguage,
      targetLanguage: file.targetLanguage,
      level: file.level,
      kind: classified.kind,
      flag: classified.resolvedFlag,
      declaredFlag: classified.declaredFlag,
      prompt: classified.kind === 'choice' ? '' : record.Q.trim(),
      options: classified.options,
      hint: record.H,
      hintKind: classified.hintKind,
      cloze: splitCloze(record.H) ?? undefined,
      answers,
      primaryAnswer: answers[0] ?? '',
      repeat: Number(record.R || 0),
      sequence: record.S,
      issues: classified.issues,
      usable,
    });
    concepts.set(file.code, concept);
  }

  // A picture whose serial digits drifted still belongs to the only record
  // group with the same mode, family and level.
  for (const [code, picture] of media) {
    if (usedMedia.has(code)) continue;
    const candidates = [...concepts.values()].filter(
      (concept) => concept.group === picture.group && !concept.media,
    );
    if (candidates.length !== 1) {
      skipped.push({ fileName: picture.fileName, reason: 'media_without_records' });
      continue;
    }
    const concept = candidates[0];
    concept.media = { ...picture, link: 'group' };
    for (const variant of concept.variants)
      if (!variant.usable && variant.answers.length) variant.usable = true;
  }

  for (const concept of concepts.values()) {
    const english = concept.variants.find((variant) => variant.route === '11');
    concept.label =
      english?.primaryAnswer ||
      concept.variants.find((variant) => variant.targetLanguage === '1')
        ?.primaryAnswer ||
      concept.variants[0]?.primaryAnswer ||
      concept.code;
  }

  return {
    version: 2,
    sourceDirectory: root,
    generatedAt: new Date().toISOString(),
    concepts: [...concepts.values()].sort((a, b) => a.code.localeCompare(b.code)),
    skipped,
  };
}

// --- question assembly ---------------------------------------------------

function pairs(database: ContentDatabase) {
  return database.concepts.flatMap((concept) =>
    concept.variants.map((variant) => ({ concept, variant })),
  );
}

function hash(value: string) {
  let result = 0;
  for (let index = 0; index < value.length; index += 1)
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  return result;
}

function distractors(answer: string, pool: string[], seed: string) {
  const taken = new Set([answer.toLocaleLowerCase('en')]);
  const picked: string[] = [];
  for (const item of pool.sort((a, b) => hash(seed + a) - hash(seed + b))) {
    const key = item.toLocaleLowerCase('en');
    if (taken.has(key)) continue;
    taken.add(key);
    picked.push(item);
    if (picked.length === 3) break;
  }
  return [answer, ...picked].sort((a, b) => hash(seed + b) - hash(seed + a));
}

function resolveAnswerMode(
  variant: ContentVariant,
  requested: AnswerMode,
): 'write' | 'select' {
  // "write" is the only mode that overrides an authored multiple choice: the
  // options are still in the file, the learner just types the word instead.
  if (requested === 'write') return 'write';
  if (variant.kind === 'choice') return 'select';
  if (requested === 'select') return 'select';
  if (requested === 'mixed') return hash(variant.id) % 2 === 0 ? 'select' : 'write';
  return 'write';
}

export function toQuestion(
  concept: ContentConcept,
  variant: ContentVariant,
  optionPool: string[] = [],
  requested: AnswerMode = 'auto',
): Question {
  const answerMode = resolveAnswerMode(variant, requested);
  const picture = pictureFor(concept.media);
  const generated = answerMode === 'select' && variant.kind !== 'choice';
  // Options only travel when the learner picks one: on a written card they
  // would hand over the answer before it is graded.
  const options =
    answerMode !== 'select'
      ? []
      : generated
        ? distractors(variant.primaryAnswer, optionPool, variant.id)
        : variant.options;
  return {
    id: variant.id,
    lessonId: 'level-' + variant.level,
    type: variant.kind,
    answerMode,
    optionsGenerated: generated,
    category: variant.kind,
    shortLabel: variant.kind,
    prompt: '',
    instruction: '',
    sentence: variant.prompt || undefined,
    sentenceBefore: variant.cloze?.before,
    sentenceAfter: variant.cloze?.after,
    image: picture?.src,
    mediaWidth: picture?.width || undefined,
    mediaHeight: picture?.height || undefined,
    mediaFile: concept.media?.fileName,
    // No alt text or review line here: both travel to the client before the
    // answer is graded, and the concept label is the answer in one language.
    options: options.length ? options : undefined,
    answer: variant.primaryAnswer,
    acceptedAnswers: variant.answers,
    hint: variant.hint || undefined,
    hintKind: variant.hintKind,
    explanation: '',
    review: '',
    level: variant.level,
    sourceLanguage: variant.sourceLanguage,
    targetLanguage: variant.targetLanguage,
    sourceCode: variant.code,
    family: concept.family,
    route: variant.route,
  };
}

function optionPoolFor(
  database: ContentDatabase,
  targetLanguage: LanguageId,
  level: number,
) {
  const pool = new Set<string>();
  for (const { variant } of pairs(database))
    if (
      variant.usable &&
      variant.targetLanguage === targetLanguage &&
      variant.level === level
    )
      pool.add(variant.primaryAnswer);
  return [...pool];
}

export function getProfileQuestions(
  profile: LearningProfile,
  database = contentDatabase(),
) {
  const pair = languagePair(profile);
  const pool = optionPoolFor(database, profile.targetLanguage, profile.level);
  return pairs(database)
    .filter(
      ({ variant }) =>
        variant.usable &&
        variant.route === pair &&
        variant.level === profile.level,
    )
    .sort((a, b) => a.variant.code.localeCompare(b.variant.code))
    .map(({ concept, variant }) =>
      toQuestion(concept, variant, pool, profile.answerMode ?? 'auto'),
    );
}

export function getLevelAvailability(
  profile: LearningProfile,
  database = contentDatabase(),
): LevelAvailability[] {
  const pair = languagePair(profile);
  const counts = new Map<number, Map<ExerciseKind, number>>();
  for (const { variant } of pairs(database)) {
    if (!variant.usable || variant.route !== pair) continue;
    const kinds = counts.get(variant.level) ?? new Map<ExerciseKind, number>();
    kinds.set(variant.kind, (kinds.get(variant.kind) ?? 0) + 1);
    counts.set(variant.level, kinds);
  }
  return Array.from({ length: 9 }, (_, index) => {
    const level = index + 1;
    const kinds = counts.get(level) ?? new Map<ExerciseKind, number>();
    const count = [...kinds.values()].reduce((total, value) => total + value, 0);
    return {
      level,
      count,
      available: count > 0,
      kinds: Object.fromEntries(kinds) as Partial<Record<ExerciseKind, number>>,
    };
  });
}

export function findContentQuestion(id: string, database = contentDatabase()) {
  for (const { concept, variant } of pairs(database)) {
    if (variant.id !== id) continue;
    return toQuestion(
      concept,
      variant,
      optionPoolFor(database, variant.targetLanguage, variant.level),
      'auto',
    );
  }
  return undefined;
}

export function gradeContentAnswer(question: Question, value: string) {
  return matchAnswer(value, [
    question.answer,
    ...(question.acceptedAnswers ?? []),
  ]);
}
