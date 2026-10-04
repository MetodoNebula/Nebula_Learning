import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  buildContentDatabase,
  contentDatabase,
  getLevelAvailability,
  getProfileQuestions,
  toQuestion,
} from '../lib/server/content.ts';
import { languagePair } from '../lib/lesson.ts';
import {
  classifyHint,
  matchAnswer,
  parseRecord,
  splitAnswers,
  splitChoiceOptions,
  splitCloze,
} from '../lib/content/format.ts';

function drop(files) {
  const root = mkdtempSync(path.join(tmpdir(), 'nebula-content-'));
  for (const [name, body] of Object.entries(files))
    writeFileSync(path.join(root, name), body);
  return root;
}

const card = (question, answer, extra = '') =>
  `Q ${question}\nA ${answer}\nH ${extra}\nR 0\nS 43011\nF ${question ? 'T' : 'U'}\n`;

test('content loader filters by language pair and fifth digit level', () => {
  const root = drop({
    '10231011-43-T.txt': card('orologio', 'reloj,reloj de pared'),
    '10232011-43-T.txt': card('porta', 'puerta'),
    '10231011-41-T.txt': card('orologio', 'clock'),
    '10231011-33-T.txt': card('', 'reloj'),
    '10231011-I.png': 'x',
  });
  const database = buildContentDatabase(root);
  const questions = getProfileQuestions(
    { nativeLanguage: '4', targetLanguage: '3', level: 1 },
    database,
  );
  assert.equal(questions.length, 1);
  assert.equal(questions[0].id, '10231011-43');
  assert.equal(questions[0].level, 1);
  assert.equal(questions[0].sourceLanguage, '4');
  assert.equal(questions[0].targetLanguage, '3');
  assert.deepEqual(questions[0].acceptedAnswers, ['reloj', 'reloj de pared']);
});

test('content availability reports selectable levels for a language route', () => {
  const root = drop({
    '10231011-43-T.txt': card('orologio', 'reloj'),
    '10232011-43-T.txt': card('porta', 'puerta'),
  });
  const levels = getLevelAvailability(
    { nativeLanguage: '4', targetLanguage: '3', level: 1 },
    buildContentDatabase(root),
  );
  assert.equal(levels.find((item) => item.level === 1).count, 1);
  assert.equal(levels.find((item) => item.level === 2).count, 1);
  assert.equal(levels.find((item) => item.level === 3).available, false);
  assert.deepEqual(levels.find((item) => item.level === 1).kinds, {
    translation: 1,
  });
});

test('other native language uses the target-target unilingual pair', () => {
  assert.equal(
    languagePair({ nativeLanguage: 'other', targetLanguage: '1', level: 1 }),
    '11',
  );
});

test('each record format becomes its own exercise', () => {
  const root = drop({
    // Unilingual: the picture is the prompt, the learner types the word.
    '10231011-33-T.txt': card('', 'reloj,reloj de pared'),
    '10231011-I.png': 'x',
    // Translation: a source word and the answer in the other language.
    '10231011-43-T.txt': card('orologio', 'reloj'),
    // Hint with a gap turns the card into a sentence to complete.
    '10232011-33-T.txt': card('', 'cuello', 'La jirafa tiene un ... largo.'),
    '10232011-I.png': 'x',
    // Authored multiple choice: options live in the question itself.
    '00233011-33-T.txt':
      'Q a) ojo      b) boca\n  c) nariz    d) oreja\nA 1 ojo\nH \nR 0\nS 33011\nF Z\n',
    '00233011-I.png': 'x',
  });
  const database = buildContentDatabase(root);
  const byId = Object.fromEntries(
    database.concepts
      .flatMap((concept) => concept.variants)
      .map((variant) => [variant.id, variant]),
  );
  assert.equal(byId['10231011-33'].kind, 'naming');
  assert.equal(byId['10231011-43'].kind, 'translation');
  assert.equal(byId['10232011-33'].kind, 'cloze');
  assert.deepEqual(byId['10232011-33'].cloze, {
    before: 'La jirafa tiene un',
    after: 'largo.',
  });
  assert.equal(byId['00233011-33'].kind, 'choice');
  assert.deepEqual(byId['00233011-33'].options, [
    'ojo',
    'boca',
    'nariz',
    'oreja',
  ]);
  assert.deepEqual(byId['00233011-33'].answers, ['ojo']);
});

test('answering mode is resolved per question and only ships the options it uses', () => {
  const root = drop({
    '10231011-33-T.txt': card('', 'reloj'),
    '10231012-33-T.txt': card('', 'puerta'),
    '10231013-33-T.txt': card('', 'silla'),
    '10231014-33-T.txt': card('', 'mesa'),
    '00231015-33-T.txt':
      'Q ojo  boca  nariz  oreja\nA 1 ojo\nH \nR 0\nS 33011\nF Z\n',
    '10231011-I.png': 'x',
    '10231012-I.png': 'x',
    '10231013-I.png': 'x',
    '10231014-I.png': 'x',
    '00231015-I.png': 'x',
  });
  const database = buildContentDatabase(root);
  const base = { nativeLanguage: 'other', targetLanguage: '3', level: 1 };
  const authored = getProfileQuestions({ ...base, answerMode: 'auto' }, database);
  const isChoice = (question) => question.type === 'choice';
  assert.equal(authored.filter(isChoice).length, 1);
  assert.ok(
    authored.filter(isChoice).every((question) => question.answerMode === 'select'),
  );
  assert.ok(
    authored
      .filter((question) => !isChoice(question))
      .every((question) => question.answerMode === 'write' && !question.options),
  );

  // "Always type" wins even over a card that ships its own options.
  const written = getProfileQuestions({ ...base, answerMode: 'write' }, database);
  assert.ok(written.every((question) => question.answerMode === 'write'));
  assert.ok(written.every((question) => question.options === undefined));

  const chosen = getProfileQuestions({ ...base, answerMode: 'select' }, database);
  assert.ok(chosen.every((question) => question.answerMode === 'select'));
  assert.ok(chosen.every((question) => question.options.length === 4));
  assert.ok(
    chosen.every((question) => question.options.includes(question.answer)),
  );
  // The authored card keeps its own options; the rest borrow from the level.
  assert.ok(chosen.filter(isChoice).every((question) => !question.optionsGenerated));
  assert.ok(
    chosen.filter((question) => !isChoice(question)).every((q) => q.optionsGenerated),
  );
});

test('records that cannot be shown to a learner are skipped', () => {
  const root = drop({
    // No question, no picture and no hint: nothing to ask.
    '13051011-11-T.txt': 'F \nA cigarette\nH\nR 0\nS 11011\n',
    '13051011-13-T.txt': 'F cigarette\nA cigarrillo\nH\nR 0\nS 13011\n',
  });
  const database = buildContentDatabase(root);
  const variants = database.concepts.flatMap((concept) => concept.variants);
  assert.equal(variants.find((v) => v.id === '13051011-11').usable, false);
  // A question typed on the F line is still read as the prompt.
  const translation = variants.find((v) => v.id === '13051011-13');
  assert.equal(translation.usable, true);
  assert.equal(translation.prompt, 'cigarette');
  assert.equal(translation.kind, 'translation');
  assert.deepEqual(database.skipped, [
    { fileName: '13051011-11-T.txt', reason: 'no_prompt' },
  ]);
});

test('a picture whose serial drifted still reaches its record group', () => {
  const root = drop({
    '00821031-33-T.txt':
      'Q ojo  boca  nariz  oreja\nA 1 ojo\nH \nR 0\nS 33031\nF Z\n',
    '00821033-I.png': 'x',
  });
  const database = buildContentDatabase(root);
  assert.equal(database.concepts.length, 1);
  assert.equal(database.concepts[0].media.fileName, '00821033-I.png');
  assert.equal(database.concepts[0].media.link, 'group');
});

test('a wrong F flag does not change how the record is played', () => {
  const root = drop({
    // Declared unilingual, but it carries a question on a 2-5 route.
    '10232021-25-T.txt': 'Q carré\nA Quadrat,Viereck\nH \nR 0\nS 25011\nF U\n',
  });
  const [variant] = buildContentDatabase(root).concepts[0].variants;
  assert.equal(variant.declaredFlag, 'U');
  assert.equal(variant.flag, 'T');
  assert.equal(variant.kind, 'translation');
  assert.ok(variant.issues.includes('flag_mismatch'));
});

test('the authored format decides how every imported card is answered', () => {
  const database = contentDatabase();
  const pairs = database.concepts.flatMap((concept) =>
    concept.variants
      .filter((variant) => variant.usable)
      .map((variant) => ({ concept, variant })),
  );
  assert.ok(pairs.length > 1000, 'the imported database is loaded');
  let picked = 0;
  let written = 0;
  for (const { concept, variant } of pairs) {
    const question = toQuestion(concept, variant, [], 'auto');
    if (variant.kind === 'choice') {
      picked += 1;
      // Options come from the file's own Q line, and one of them is the answer.
      assert.equal(question.answerMode, 'select', variant.id);
      assert.deepEqual(question.options, variant.options, variant.id);
      assert.ok(question.options.length >= 3, variant.id);
      assert.ok(
        variant.answers.some((answer) => variant.options.includes(answer)),
        variant.id,
      );
    } else {
      written += 1;
      // No options anywhere in the file, so the learner types the word.
      assert.equal(question.answerMode, 'write', variant.id);
      assert.equal(question.options, undefined, variant.id);
      assert.deepEqual(variant.options, [], variant.id);
    }
  }
  assert.equal(picked, 5, 'only the authored multiple choice cards are picked');
  assert.equal(picked + written, pairs.length);
});

test('an option marker is not confused with an article or a plain phrase', () => {
  // "a third" is an accepted spelling, not option (a).
  assert.deepEqual(splitAnswers('third,one third,a third,third part'), [
    'third',
    'one third',
    'a third',
    'third part',
  ]);
  // "1 eye" and "a) ojo" are markers and lose the index.
  assert.deepEqual(splitAnswers('1 eye'), ['eye']);
  assert.deepEqual(splitAnswers('a) ojo'), ['ojo']);
  // Three words separated by single spaces are one answer, not three options.
  assert.deepEqual(splitChoiceOptions('ballon de football'), [
    'ballon de football',
  ]);
});

test('options in Q are recognised even when the record has no F line', () => {
  const root = drop({
    // No F flag, no markers, no line break: only the indexed A gives it away.
    '00821031-55-T.txt': 'Q Auge  Mund  Nase  Ohr\nA 1 Auge\nH \nR 0\nS 55141\n',
    '00821033-I.png': 'x',
    // Same shape of A, but Q is a single word: still a translation.
    '10821011-51-T.txt': 'Q Kopf\nA 1 head\nH \nR 0\nS 51011\n',
  });
  const variants = buildContentDatabase(root).concepts.flatMap(
    (concept) => concept.variants,
  );
  const german = variants.find((variant) => variant.id === '00821031-55');
  assert.equal(german.kind, 'choice');
  assert.deepEqual(german.options, ['Auge', 'Mund', 'Nase', 'Ohr']);
  assert.deepEqual(german.answers, ['Auge']);
  const single = variants.find((variant) => variant.id === '10821011-51');
  assert.equal(single.kind, 'translation');
  assert.deepEqual(single.options, []);
});

test('record parsing, hints and answer matching follow the drop conventions', () => {
  const record = parseRecord('Q head\nA cabeza, coco\nH Not: pie!\nR 0\nS 13013\nF T');
  assert.equal(record.Q, 'head');
  assert.deepEqual(splitAnswers(record.A), ['cabeza', 'coco']);
  assert.equal(record.F, 'T');
  assert.equal(classifyHint('Not: pie!'), 'warning');
  assert.equal(classifyHint('capital of England'), 'definition');
  assert.equal(classifyHint('1/3'), 'symbol');
  assert.equal(classifyHint('Auch: Karte'), 'alternative');
  assert.equal(classifyHint(''), 'none');
  assert.deepEqual(splitCloze('Die Giraffe hat einen langen ...'), {
    before: 'Die Giraffe hat einen langen',
    after: '',
  });
  // Numbered options may be separated by a single space.
  assert.deepEqual(splitChoiceOptions('1 occhio 2 bocca  3 naso 4 orecchio'), [
    'occhio',
    'bocca',
    'naso',
    'orecchio',
  ]);
  assert.equal(matchAnswer(' Círculo ', ['círculo']), 'exact');
  assert.equal(matchAnswer('circulo', ['círculo']), 'accent');
  assert.equal(matchAnswer('cuadrado', ['círculo']), 'none');
  assert.equal(matchAnswer('', ['círculo']), 'none');
});
