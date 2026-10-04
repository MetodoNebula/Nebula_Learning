import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';

const port = process.env.SMOKE_PORT ?? '5181';
const origin = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['scripts/start.mjs'], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    NEBULA_DEMO_ENABLED: 'true',
    PORT: port,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
child.stdout.on('data', (chunk) => {
  output += chunk;
});
child.stderr.on('data', (chunk) => {
  output += chunk;
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    if (child.exitCode !== null) throw new Error(output);
    try {
      ready = (
        await fetch(origin + '/api/health', {
          signal: AbortSignal.timeout(1000),
        })
      ).ok;
    } catch {
      /* Starting. */
    }
    if (ready) break;
    await delay(250);
  }
  assert.ok(ready, 'Production server starts');
  assert.equal((await fetch(origin)).status, 200);
  assert.equal((await fetch(origin + '/data/questions.json')).status, 404);
  const response = await fetch(
    origin + '/api/v1/questions?lessonId=first-steps',
  );
  assert.equal(response.status, 200);
  const { questions } = await response.json();
  assert.equal(questions.length, 8);
  assert.ok(questions.every((q) => !('answer' in q) && !('explanation' in q)));
  const graded = await fetch(origin + '/api/v1/grade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId: questions[0].id, value: 'Apple' }),
  });
  assert.equal(graded.status, 200);
  assert.equal((await graded.json()).correct, true);

  // Imported content: one route of every answering mode plus a picture.
  const profile = await fetch(
    origin +
      '/api/v1/questions?nativeLanguage=other&targetLanguage=3&level=1&answerMode=auto',
  );
  assert.equal(profile.status, 200);
  const imported = (await profile.json()).questions;
  assert.ok(imported.length > 10, 'imported route has exercises');
  const kinds = new Set(imported.map((q) => q.type));
  assert.ok(kinds.has('naming') && kinds.has('choice'), [...kinds].join(','));
  assert.ok(
    imported.every((q) => !('answer' in q) && !('acceptedAnswers' in q)),
  );
  const picture = imported.find((q) => q.image);
  assert.ok(picture, 'at least one exercise carries a picture');
  const media = await fetch(origin + picture.image);
  assert.equal(media.status, 200, 'media route serves the source picture');
  assert.ok(media.headers.get('content-type')?.startsWith('image/'));
  assert.equal(
    (await fetch(origin + '/api/v1/media?file=../package.json')).status,
    404,
  );
  console.log(
    'Production smoke passed: page, health, API, grading, imported content, media, private seed.',
  );
} catch (error) {
  console.error(output);
  throw error;
} finally {
  child.kill('SIGTERM');
  await new Promise((resolve) => {
    if (child.exitCode !== null) resolve();
    else child.once('exit', resolve);
  });
}
