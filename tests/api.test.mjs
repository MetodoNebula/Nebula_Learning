import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GET } from '../app/api/v1/questions/route.ts';
import { POST } from '../app/api/v1/grade/route.ts';
import { exercises, evaluate } from '../lib/server/questions.ts';

const answerRequest = (
  data,
  headers = { 'Content-Type': 'application/json' },
) =>
  new Request('http://localhost/api/v1/grade', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

test('API separates lessons and never returns solutions before grading', async () => {
  const response = await GET(
    new Request('http://localhost/api/v1/questions?lessonId=verbs-a2'),
  );
  assert.equal(response.status, 200);
  const { questions } = await response.json();
  assert.equal(questions.length, 8);
  assert.ok(
    questions.every(
      (q) =>
        q.lessonId === 'verbs-a2' && !('answer' in q) && !('explanation' in q),
    ),
  );
  assert.equal(
    (
      await GET(
        new Request('http://localhost/api/v1/questions?lessonId=unknown'),
      )
    ).status,
    404,
  );
});

test('grading ignores caller claims and validates malformed, missing and oversized payloads', async () => {
  const [question] = await exercises('first-steps');
  const response = await POST(
    answerRequest({ questionId: question.id, value: 'wrong', correct: true }),
  );
  assert.equal(response.status, 200);
  const feedback = await response.json();
  assert.equal(feedback.correct, false);
  assert.ok(feedback.answer && feedback.explanation);
  assert.equal(
    (
      await POST(
        answerRequest({ questionId: question.id, value: feedback.answer }),
      )
    ).status,
    200,
  );
  assert.equal(
    (await POST(answerRequest({ questionId: 'missing', value: 'x' }))).status,
    404,
  );
  for (const payload of [
    null,
    {},
    { questionId: question.id, value: 4 },
    { questionId: question.id, value: 'a'.repeat(5000) },
  ]) {
    assert.equal((await POST(answerRequest(payload))).status, 400);
  }
  assert.equal(
    (await POST(answerRequest({}, { 'Content-Type': 'text/plain' }))).status,
    400,
  );
});

test('the profile route validates the language pair, level and answering mode', async () => {
  const ok = await GET(
    new Request(
      'http://localhost/api/v1/questions?nativeLanguage=3&targetLanguage=1&level=1&answerMode=write',
    ),
  );
  assert.equal(ok.status, 200);
  const { questions } = await ok.json();
  assert.ok(questions.length > 0);
  assert.ok(
    questions.every(
      (q) => !('answer' in q) && !('acceptedAnswers' in q) && q.route === '31',
    ),
  );
  for (const query of [
    'nativeLanguage=9&targetLanguage=1&level=1',
    'nativeLanguage=3&targetLanguage=1&level=0',
    'nativeLanguage=3&targetLanguage=1&level=1&answerMode=cheat',
  ])
    assert.equal(
      (await GET(new Request('http://localhost/api/v1/questions?' + query)))
        .status,
      400,
      query,
    );
});

test('a written exercise never ships its own solution to the client', async () => {
  const response = await GET(
    new Request(
      'http://localhost/api/v1/questions?nativeLanguage=other&targetLanguage=3&level=1&answerMode=write',
    ),
  );
  const { questions } = await response.json();
  const written = questions.filter((q) => q.answerMode === 'write');
  assert.ok(written.length > 5);
  for (const exercise of written) {
    const graded = await (await POST(
      answerRequest({ questionId: exercise.id, value: 'zzz' }),
    )).json();
    const payload = JSON.stringify(exercise).toLowerCase();
    // Single letters can occur inside harmless JSON property names such as
    // "category"; they cannot prove that a solution was sent to the client.
    for (const answer of [graded.answer, ...graded.accepted].filter(
      (value) => value.trim().length > 1,
    ))
      assert.ok(
        !payload.includes(answer.toLowerCase()),
        `${exercise.id} leaks "${answer}" in ${payload}`,
      );
  }
});

test('grading reports a missing accent as correct but flags it', async () => {
  const response = await GET(
    new Request(
      'http://localhost/api/v1/questions?nativeLanguage=1&targetLanguage=3&level=1&answerMode=write',
    ),
  );
  const { questions } = await response.json();
  const accented = questions.find((q) => q.id === '10231081-13');
  assert.ok(accented, 'expected the circle card on the English to Spanish route');
  const exact = await (await POST(
    answerRequest({ questionId: accented.id, value: 'círculo' }),
  )).json();
  assert.deepEqual(
    { correct: exact.correct, quality: exact.quality },
    { correct: true, quality: 'exact' },
  );
  const folded = await (await POST(
    answerRequest({ questionId: accented.id, value: 'Circulo' }),
  )).json();
  assert.deepEqual(
    { correct: folded.correct, quality: folded.quality },
    { correct: true, quality: 'accent' },
  );
  const wrong = await (await POST(
    answerRequest({ questionId: accented.id, value: 'cuadrado' }),
  )).json();
  assert.equal(wrong.quality, 'none');
  assert.equal(wrong.answer, 'círculo');
});

test('repository can be replaced without changing grading or public exercises', async () => {
  const q = {
    id: 'stub',
    lessonId: 'stub',
    answer: 'went',
    explanation: 'Past simple',
    prompt: 'Go in the past',
  };
  const repository = {
    async find() {
      return q;
    },
    async forLesson() {
      return [q];
    },
    async levels() {
      return [];
    },
  };
  assert.equal((await evaluate('stub', ' WENT ', repository)).correct, true);
  assert.equal((await exercises('stub', repository))[0].answer, undefined);
});

test('production demo APIs require an explicit opt-in', async () => {
  const previousMode = process.env.NODE_ENV;
  const previousDemo = process.env.NEBULA_DEMO_ENABLED;
  try {
    process.env.NODE_ENV = 'production';
    delete process.env.NEBULA_DEMO_ENABLED;
    assert.equal(
      (
        await GET(
          new Request('http://localhost/api/v1/questions?lessonId=first-steps'),
        )
      ).status,
      503,
    );
    assert.equal((await POST(answerRequest({}))).status, 503);
    process.env.NEBULA_DEMO_ENABLED = 'true';
    assert.equal(
      (
        await GET(
          new Request('http://localhost/api/v1/questions?lessonId=first-steps'),
        )
      ).status,
      200,
    );
  } finally {
    if (previousMode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousMode;
    if (previousDemo === undefined) delete process.env.NEBULA_DEMO_ENABLED;
    else process.env.NEBULA_DEMO_ENABLED = previousDemo;
  }
});
