import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve('android/app/src/main/assets');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('Android loads bundled assets without a remote server', () => {
  const config = JSON.parse(read('capacitor.config.json'));
  assert.equal(config.appId, 'com.nebulatech.languages');
  assert.equal(config.server?.url, undefined);
  const html = read('public/index.html');
  assert.match(html, /viewport-fit=cover/);
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^" ]+)"/g)].map(
    (match) => match[1],
  );
  assert.ok(assets.some((path) => path.endsWith('.js')));
  assert.ok(assets.some((path) => path.endsWith('.css')));
  for (const asset of assets)
    assert.ok(existsSync(resolve(root, 'public' + asset)), asset);
});
test('all four questions, illustrations and listening audio are packaged', () => {
  const questions = JSON.parse(read('public/data/questions.json'));
  assert.equal(questions.length, 4);
  for (const q of questions)
    for (const asset of [q.image, q.audio].filter(Boolean)) {
      assert.ok(existsSync(resolve(root, 'public' + asset)));
    }
  assert.ok(existsSync(resolve(root, 'public/assets/rocket.svg')));
  assert.ok(existsSync(resolve(root, 'public/assets/trophy.svg')));
});
