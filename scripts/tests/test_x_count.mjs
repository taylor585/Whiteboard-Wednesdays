// public/x-count.js counts an X post exactly as scripts/check-x-post.py does: both run the same vectors.
//   node --test scripts/tests/test_x_count.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const here = new URL('.', import.meta.url);
const window = {};
vm.runInNewContext(fs.readFileSync(new URL('../../public/x-count.js', here), 'utf8'), {window});
const {len, intent, LIMIT, YT} = window.WWX;
const vectors = JSON.parse(fs.readFileSync(new URL('fixtures/x/count-vectors.json', here), 'utf8'));

test('every vector counts as X counts it', () => { for (const v of vectors) assert.equal(len(v.text), v.n, v.why); });
test('the limit is 280 and the placeholder is the link', () => { assert.equal(LIMIT, 280); assert.equal(len(YT), 23); assert.equal(len('a'.repeat(280)), 280); });
test('the compose link carries the text and nothing else', () => {
  const u = new URL(intent('Ask → answer 👉\n"why?" & more #AIStrategy'));
  assert.equal(u.origin + u.pathname, 'https://x.com/intent/post');
  assert.deepEqual([...u.searchParams.keys()], ['text']);
  assert.equal(u.searchParams.get('text'), 'Ask → answer 👉\n"why?" & more #AIStrategy');
});
