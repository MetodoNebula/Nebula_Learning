import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLearningClient } from '../lib/client/learning.ts';

test('demo adapter works without browser storage and preserves best scores', async () => {
  const client = createLearningClient();
  assert.equal(await client.session(), null);
  assert.equal(await client.login('demo', 'wrong'), null);
  assert.equal(await client.login('demo', 'Nebula123!'), 'Alex');
  assert.equal(await client.session(), 'Alex');
  assert.equal(await client.signup('nora', '1234'), 'nora');
  assert.equal(await client.login('nora', '1234'), 'nora');
  assert.equal(await client.saveRecord('first-steps', 7), 7);
  assert.equal(await client.saveRecord('first-steps', 2), 7);
  assert.equal(await client.saveRecord('verbs-a2', 3), 3);
  assert.deepEqual(await client.records(), { 'first-steps': 7, 'verbs-a2': 3 });
  await assert.rejects(client.saveRecord('first-steps', 9));
  await client.logout();
  assert.equal(await client.session(), null);
});

test('network adapter sends answer values, reports failures, and never sends a score', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, init) => {
      assert.equal(url, '/api/v1/grade');
      assert.deepEqual(JSON.parse(init.body), {
        questionId: 'q',
        value: 'went',
      });
      return Response.json({
        correct: true,
        answer: 'went',
        explanation: 'Past',
      });
    };
    assert.equal(
      (await createLearningClient().grade('q', 'went')).correct,
      true,
    );
    globalThis.fetch = async () => new Response('', { status: 503 });
    await assert.rejects(createLearningClient().questions('first-steps'));
  } finally {
    globalThis.fetch = original;
  }
});
