// Parser and classifier for the Ki-Roberto content drop.
//
// File name: DFFFLSSS-XY-T.txt  /  DFFFLSSS-K.<img>
//   D    exercise mode      0 = authored multiple choice, 1 = vocabulary card
//   FFF  concept family     groups related concepts (082 = body, 272 = countries...)
//   L    level              1..9
//   SSS  editorial serial   not used for routing
//   XY   language route     X = language the learner reads, Y = language practised
//   K    media slot letter  (I in the drop, one V typo that is still an image)
//
// Record body: single letter, space, value. Q may span several lines.
//   Q question prompt (empty when the media is the prompt)
//   A accepted answers, comma separated, first one is canonical
//   H hint, always written in the answer language
//   R repeat counter (always 0 in the drop)
//   S editorial sequence (route + serial, unreliable)
//   F record flag: T translation, U unilingual naming, Z multiple choice

export type LanguageId = '1' | '2' | '3' | '4' | '5';
export const languageIds: LanguageId[] = ['1', '2', '3', '4', '5'];
export const languageTags: Record<LanguageId, string> = {
  '1': 'en',
  '2': 'fr',
  '3': 'es',
  '4': 'it',
  '5': 'de',
};

export const textFilePattern =
  /^(\d{8})\s*-\s*([1-5])([1-5])\s*-?\s*T?\s*-?\s*\.txt$/i;
export const mediaFilePattern =
  /^(\d{8})\s*-\s*([A-Z])\s*\.(png|jpe?g|webp|gif|avif)$/i;

export type CodeParts = {
  code: string;
  mode: string;
  family: string;
  level: number;
  serial: string;
  /** mode + family + level: the granularity media falls back to. */
  group: string;
};

export function decodeCode(code: string): CodeParts {
  return {
    code,
    mode: code[0],
    family: code.slice(1, 4),
    level: Number(code[4]),
    serial: code.slice(5),
    group: code.slice(0, 5),
  };
}

export type FileNameParts = CodeParts & {
  fileName: string;
  route: string;
  sourceLanguage: LanguageId;
  targetLanguage: LanguageId;
  unilingual: boolean;
};

export function parseFileName(fileName: string): FileNameParts | null {
  const match = textFilePattern.exec(fileName.trim());
  if (!match) return null;
  const [, code, source, target] = match;
  return {
    ...decodeCode(code),
    fileName,
    route: source + target,
    sourceLanguage: source as LanguageId,
    targetLanguage: target as LanguageId,
    unilingual: source === target,
  };
}

export function parseMediaFileName(fileName: string) {
  const match = mediaFilePattern.exec(fileName.trim());
  if (!match) return null;
  const [, code, slot, extension] = match;
  return {
    ...decodeCode(code),
    fileName,
    slot: slot.toLocaleUpperCase('en'),
    extension: extension.toLocaleLowerCase('en'),
  };
}

export type ContentRecord = {
  Q: string;
  A: string;
  H: string;
  R: string;
  S: string;
  F: string;
  /** Letters in the order they first appear, e.g. QAHRSF. */
  shape: string;
  /** Repeated keys, which is how the drop encodes a Q line typed as F. */
  repeated: string[];
};

const fieldLine = /^([QAHRSF])(?:\s(.*))?$/;
const flagValue = /^[TUZ]$/;

export function parseRecord(text: string): ContentRecord {
  const collected: Record<string, string[]> = {};
  const shape: string[] = [];
  const repeated: string[] = [];
  let current = '';
  for (const line of text.split(/\r?\n/)) {
    const match = fieldLine.exec(line);
    if (match) {
      current = match[1];
      if (shape.includes(current)) repeated.push(current);
      else shape.push(current);
      (collected[current] ??= []).push(match[2] ?? '');
    } else if (current && line.trim() !== '') {
      collected[current].push(line);
    }
  }
  const read = (key: string) => (collected[key]?.[0] ?? '').trim();
  // A prompt typed as "F": the flag is the last F, the prompt is any other F.
  const flags = (collected.F ?? []).map((value) => value.trim());
  const flag = flags.at(-1) ?? '';
  const strayPrompt = flags.find((value) => value && !flagValue.test(value)) ?? '';
  const question = (collected.Q ?? [])
    .join('\n')
    .replace(/[ \t]+$/gm, '')
    .trim();
  return {
    Q: question || strayPrompt,
    A: (collected.A ?? []).join(' ').trim(),
    H: read('H'),
    R: read('R'),
    S: read('S'),
    F: flagValue.test(flag) ? flag : '',
    shape: shape.join(''),
    repeated,
  };
}

// --- answers -------------------------------------------------------------

/**
 * Strips "1 ", "1) " and "a) " option markers. A bare letter only counts as a
 * marker when a delimiter follows it: "a third" is an article, not option (a).
 */
const answerMarker = /^\s*(?:[1-9]\s*[).:-]?|[a-e]\s*[).:-])\s+/i;
export function stripOptionMarker(value: string) {
  return value.replace(answerMarker, '').trim();
}

export function splitAnswers(value: string) {
  const seen = new Set<string>();
  const answers: string[] = [];
  for (const part of value.split(',')) {
    const answer = stripOptionMarker(part).replace(/\s+/g, ' ').trim();
    if (!answer || seen.has(answer)) continue;
    seen.add(answer);
    answers.push(answer);
  }
  return answers;
}

/**
 * Multiple choice prompts normally use semicolons. The Demo drop also has
 * authored Z records with four comma-separated options. Older files pack four
 * options into one or two lines, separated by runs of spaces and optionally
 * numbered ("1 oeil") or lettered ("a) ojo").
 */
const optionMarker = /(?:^|\s)(?:[1-9](?:[).:-]\s*|\s+)|[a-e][).:-]\s*)/g;
const markedOption = /^\s*(?:[1-9]\s*[).:-]?|[a-e]\s*[).:-])\s+/;
/** "A 1 eye": the answer line itself numbers the option it points at. */
const indexedAnswer = /^\s*[1-9]\s*[).:-]?\s+\S/;

export function splitChoiceOptions(question: string, allowCommas = false) {
  const flat = question.replace(/\r?\n/g, '  ').trim();
  if (!flat) return [];
  const semicolonOptions = flat
    .split(';')
    .map((option) => stripOptionMarker(option).trim())
    .filter(Boolean);
  if (semicolonOptions.length >= 3) return semicolonOptions;
  // A comma is ambiguous in normal text, so it is accepted only for records
  // already declared as multiple choice (F Z).
  if (allowCommas) {
    const commaOptions = flat
      .split(',')
      .map((option) => stripOptionMarker(option).trim())
      .filter(Boolean);
    if (commaOptions.length >= 3) return commaOptions;
  }
  // "1 oeil  2 bouche" and "a) ojo  b) boca" are split on their own markers,
  // because the drop is not consistent about how much space follows them.
  if (markedOption.test(flat)) {
    const marked = flat
      .split(optionMarker)
      .map((option) => option.trim())
      .filter(Boolean);
    if (marked.length >= 3) return marked;
  }
  // Without markers, only runs of spaces separate options. Never fall back to
  // single spaces: "ballon de football" is one answer, not three options.
  return flat
    .split(/\s{2,}|\t+/)
    .map((cell) => stripOptionMarker(cell).trim())
    .filter(Boolean);
}

// --- hints ---------------------------------------------------------------

export type HintKind =
  | 'none'
  | 'cloze'
  | 'definition'
  | 'alternative'
  | 'warning'
  | 'symbol';

const gapMarker = /\.{3}|…|_{2,}/;
const warningPrefix = /^(not|nicht|no|non|pas)\b\s*[:!]?/i;
const alternativePrefix =
  /^(auch|also|aussi|anche|tambien|también|ae|be|männchen|femelle|weibchen|macho|hembra|grass|pl|sing)\b\s*[:.]/i;

export function classifyHint(hint: string): HintKind {
  const value = hint.trim();
  if (!value) return 'none';
  if (gapMarker.test(value)) return 'cloze';
  if (warningPrefix.test(value)) return 'warning';
  if (alternativePrefix.test(value)) return 'alternative';
  if (/^[\d\s/+\-*%.,:()]+$/.test(value)) return 'symbol';
  if (value.split(/\s+/).length >= 3) return 'definition';
  return 'alternative';
}

/** Splits a cloze hint into the text before and after the gap. */
export function splitCloze(hint: string) {
  const match = gapMarker.exec(hint);
  if (!match) return null;
  return {
    before: hint.slice(0, match.index).replace(/\s+$/, ''),
    after: hint.slice(match.index + match[0].length).replace(/^\s+/, ''),
  };
}

// --- exercise classification --------------------------------------------

export type ExerciseKind = 'choice' | 'cloze' | 'naming' | 'translation';

export type ClassifiedVariant = {
  kind: ExerciseKind;
  /** The flag the file declares, kept for reporting. */
  declaredFlag: string;
  /** The flag the content actually supports. */
  resolvedFlag: 'T' | 'U' | 'Z';
  hintKind: HintKind;
  options: string[];
  /** Stable issue codes, safe to group in a report. */
  issues: string[];
  /** Human readable detail for each issue, in the same order. */
  notes: string[];
};

export type ClassifyInput = {
  record: ContentRecord;
  file: FileNameParts;
  answers: string[];
  hasMedia: boolean;
};

/**
 * Derives the exercise from the record itself and uses F only to corroborate,
 * because the drop contains flag typos (U on a translation, Q typed as F).
 */
export function classifyVariant({
  record,
  file,
  answers,
  hasMedia,
}: ClassifyInput): ClassifiedVariant {
  const issues: string[] = [];
  const notes: string[] = [];
  const flag = (code: string, note = code) => {
    issues.push(code);
    notes.push(note);
  };
  const hintKind = classifyHint(record.H);
  const question = record.Q.trim();
  const cells = splitChoiceOptions(question, record.F === 'Z');
  const looksLikeChoice =
    record.F === 'Z' ||
    ((markedOption.test(question) || question.includes('\n')) &&
      cells.length >= 3) ||
    // Last resort for a record with no F line: the answer carries the option
    // number and that option is one of the words listed in the question.
    (indexedAnswer.test(record.A) &&
      cells.length >= 3 &&
      answers.some((answer) => cells.includes(answer)));
  let resolvedFlag: 'T' | 'U' | 'Z';
  let kind: ExerciseKind;
  let options: string[] = [];
  if (looksLikeChoice) {
    resolvedFlag = 'Z';
    kind = 'choice';
    options = cells;
    if (options.length !== 4)
      flag('choice_option_count', 'read ' + options.length + ' options, expected 4');
    if (!answers.some((answer) => options.includes(answer)))
      flag('choice_answer_not_in_options', 'answer missing from the options');
  } else if (!question) {
    resolvedFlag = 'U';
    kind = hintKind === 'cloze' ? 'cloze' : 'naming';
    if (!hasMedia && hintKind !== 'cloze')
      flag('naming_without_prompt', 'no question, no picture and no hint');
    if (!file.unilingual)
      flag(
        'unilingual_record_on_language_route',
        'empty question on route ' + file.route,
      );
  } else {
    resolvedFlag = 'T';
    kind = hintKind === 'cloze' ? 'cloze' : 'translation';
    if (file.unilingual)
      flag(
        'translation_on_unilingual_route',
        'question present on route ' + file.route,
      );
  }
  if (record.F && record.F !== resolvedFlag)
    flag('flag_mismatch', 'F says ' + record.F + ', content is ' + resolvedFlag);
  if (!record.F) flag('missing_flag', 'no T, U or Z line');
  if (record.repeated.length)
    flag('repeated_field', 'field ' + record.repeated.join('') + ' appears twice');
  if (!answers.length) flag('no_answers', 'empty A line');
  const expectedSequence = file.route + file.serial;
  if (record.S && record.S !== expectedSequence)
    flag('sequence_mismatch', 'S is ' + record.S + ', name implies ' + expectedSequence);
  return {
    kind,
    declaredFlag: record.F,
    resolvedFlag,
    hintKind,
    options,
    issues,
    notes,
  };
}

// --- comparison ----------------------------------------------------------

const apostrophes = /[‘’´`ʼ]/g;

export function normalizeAnswerText(value: string) {
  return value
    .replace(apostrophes, "'")
    .trim()
    .toLocaleLowerCase('en')
    .replace(/\s+/g, ' ')
    .replace(/[.!?;]+$/, '');
}

/** Same as above but also folds accents, so "cafe" matches "café". */
export function foldAnswerText(value: string) {
  return normalizeAnswerText(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .normalize('NFC');
}

export type MatchQuality = 'exact' | 'accent' | 'none';

export function matchAnswer(value: string, accepted: string[]): MatchQuality {
  const typed = normalizeAnswerText(value);
  if (!typed) return 'none';
  if (accepted.some((answer) => normalizeAnswerText(answer) === typed))
    return 'exact';
  const folded = foldAnswerText(value);
  if (accepted.some((answer) => foldAnswerText(answer) === folded))
    return 'accent';
  return 'none';
}
