import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { gradeAnswer, authenticate, lessons, getLessonQuestions } from '../lib/lesson.ts';
const questions = JSON.parse(
  readFileSync(
    new URL('../data/questions.json', import.meta.url),
    'utf8',
  ),
);

test('login accepts the demo account and rejects wrong credentials', () => {
  assert.equal(authenticate('demo', 'Nebula123!'), true);
  assert.equal(authenticate(' DEMO ', 'Nebula123!'), true);
  assert.equal(authenticate('demo', 'wrong'), false);
  assert.equal(authenticate('someone', 'Nebula123!'), false);
  assert.equal(authenticate('', ''), false);
});
test('24 questions cover nine formats with unambiguous choices', () => {
  assert.equal(questions.length, 24);
  assert.equal(new Set(questions.map((q) => q.type)).size, 9);
  assert.equal(new Set(questions.map((q) => q.id)).size, 24);
  for (const q of questions) {
    assert.ok(q.prompt && q.answer && q.explanation);
    if (!['fill','order'].includes(q.type)) {
      assert.equal(q.options.length, q.type === 'truefalse' ? 2 : 4);
      assert.equal(new Set(q.options).size, q.options.length);
      assert.equal(
        q.options.filter((option) => gradeAnswer(q, option)).length,
        1,
      );
    }
  }
});
test('writing accepts case and surrounding whitespace but rejects incorrect verbs', () => {
  const q = questions.find((q) => q.type === 'fill');
  for (const answer of ['reads', ' READS ', 'Reads'])
    assert.equal(gradeAnswer(q, answer), true);
  for (const answer of ['', 'read', 'reading', 'writes'])
    assert.equal(gradeAnswer(q, answer), false);
});
test('correct and incorrect complete lessons produce the expected score', () => {
  assert.equal(
    questions.filter((q) => gradeAnswer(q, q.answer)).length * 10,
    240,
  );
  assert.equal(
    questions.filter((q) => gradeAnswer(q, 'incorrect')).length * 10,
    0,
  );
});
test('all referenced media are local, present and audio is valid PCM WAV', () => {
  for (const q of questions)
    for (const path of [q.image, q.audio].filter(Boolean)) {
      assert.ok(path.startsWith('/assets/'));
      assert.ok(existsSync(new URL('../public' + path, import.meta.url)));
    }
  const wav = readFileSync(
    new URL('../public/assets/listening.wav', import.meta.url),
  );
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  assert.equal(wav.readUInt16LE(20), 1);
  assert.ok(wav.length > 10000);
});


test('lesson loading isolates all three eight-question lessons and rejects invalid data', () => {
  for (const lesson of lessons) {
    const items = getLessonQuestions(questions, lesson.id);
    assert.equal(items.length, 8);
    assert.ok(items.every(q => q.lessonId === lesson.id));
    assert.equal(items.filter(q => gradeAnswer(q, q.answer)).length * 10, 80);
  }
  assert.throws(() => getLessonQuestions(questions, 'unknown'));
  assert.throws(() => getLessonQuestions(questions.slice(1), 'first-steps'));
});

test('word-order answers use each available token once and reject the wrong order', () => {
  for (const q of questions.filter(item => item.type === 'order')) {
    assert.deepEqual([...q.tokens].sort(), q.answer.split(' ').sort());
    assert.equal(new Set(q.tokens).size, q.tokens.length);
    assert.equal(gradeAnswer(q, q.answer), true);
    assert.equal(gradeAnswer(q, q.answer.split(' ').reverse().join(' ')), false);
  }
});

test('German translations and true/false questions retain their intended answers', () => {
  assert.equal(questions.find(q => q.id === 'listening').answer, 'Die Katze ist unter dem Tisch.');
  assert.equal(questions.find(q => q.id === 'translation').answer, 'Ich trinke jeden Tag Wasser.');
  assert.equal(questions.find(q => q.id === 'can-rule').answer, 'Falsch');
  assert.equal(questions.find(q => q.id === 'cold-fact').answer, 'Richtig');
});

