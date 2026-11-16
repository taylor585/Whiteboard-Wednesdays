// The publishing line (public/publish-line.js, WWLine): the status → station mapping and the two-link rule of New video.
// Run with `node --test`. The module is a browser script, so it is loaded into a bare window here.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const window = {};
vm.runInContext(fs.readFileSync(new URL('./public/publish-line.js', import.meta.url), 'utf8'), vm.createContext({window, URL}));
const L = window.WWLine;
const MAIN = 'https://drive.google.com/file/d/1V9L7Iojg27yDidtlCyUNmCjZTHW412AS/view?usp=sharing';
const REEL = 'https://drive.google.com/file/d/1QzReelTakeIMG3094abcdefghij/view';

test('five stations, in order', () => {
  assert.deepEqual([...L.STATIONS], ['Drive links', 'Variety Pack', 'Finished edits', 'Ready to post', 'Posted']);
});

test('every status lands on exactly one station', () => {
  const at = (status, extra = {}) => L.station({status, ...extra});
  for (const s of ['saved', 'new', 'queued', 'check']) assert.equal(at(s), 0, s);
  for (const s of ['starting', 'running', 'found', 'pack']) assert.equal(at(s), 1, s);
  for (const s of ['finishing', 'pilot', 'review', 'ask', 'thumbs', 'posts']) assert.equal(at(s), 2, s);
  assert.equal(at('final'), 3);
  assert.equal(L.station({status:'final'}, {posted:true}), 4);
  assert.equal(at('posted'), 4);
  // A failed job stays at the station where it stopped.
  assert.equal(at('failed'), 0);
  assert.equal(at('failed', {checkedAt:'2026-11-16T10:00:00Z'}), 1);
  assert.equal(at('failed', {packUrl:'https://claude.ai/artifact/abc'}), 1);
  assert.equal(at('failed', {packUrl:'https://claude.ai/artifact/abc', session:{step:'pilot'}}), 2);
  assert.equal(at('failed', {pickedAt:'2026-11-16T10:00:00Z'}), 2);
  assert.equal(at('mystery'), 0);
});

test('who the card waits on', () => {
  assert.deepEqual([L.card({status:'check'}).needs, L.card({status:'check'}).btn], [true, 'Check the files']);
  assert.equal(L.card({status:'running'}).needs, false);
  assert.equal(L.card({status:'pack'}).btn, 'Make your picks');
  // On autopilot the pack is Claude's pick, unless it stopped for Taylor.
  assert.equal(L.card({status:'pack', autopilot:{on:true}}).needs, false);
  assert.equal(L.card({status:'check', autopilot:{on:true, needsYou:{reason:'files'}}}).needs, true);
  assert.equal(L.card({status:'final', hold:{on:true}}).word, 'On hold');
  assert.equal(L.card({status:'final'}, {posted:true}).kind, 'done');
});

test('the two links: both required, Drive file links, different files', () => {
  assert.equal(L.linkBlock('', ''), 'Add both links to run');
  assert.equal(L.linkBlock(MAIN, ''), 'Add the reel link to run');
  assert.equal(L.linkBlock('', REEL), 'Add the 16:9 link to run');
  assert.equal(L.linkBlock(MAIN, REEL), '');
  assert.deepEqual([...L.checkLinks(MAIN, REEL)], []);
  assert.equal(L.linkBlock(MAIN, MAIN), 'Fix the links to run');
  assert.match(L.checkLinks(MAIN, MAIN)[0], /same file/);
  assert.match(L.checkLinks('https://drive.google.com/drive/folders/1qXf9kLmA2wR7Hb2abcdefgh', REEL)[0], /folder/);
  assert.match(L.checkLinks('https://www.dropbox.com/s/abc/video.mp4', REEL)[0], /not a drive\.google\.com file link/);
  assert.match(L.checkLinks('https://docs.google.com/document/d/abc', REEL)[0], /Docs/);
  assert.equal(L.linkBlock('https://drive.google.com/open?id=1V9L7Iojg27yDidtlCyUNmCjZTHW412AS', REEL), '');
});

test('a job with declared links never runs with one; old jobs keep their own rules', () => {
  const one = {status:'saved', links:{main:{url:MAIN}}};
  assert.equal(L.runBlock(one), 'Add the reel link to run');
  assert.equal(L.card(one).kind, 'miss');
  assert.equal(L.card(one).word, 'Reel link missing · cannot run yet');
  const both = {status:'saved', links:{main:{url:MAIN}, reel:{url:REEL}}};
  assert.equal(L.runBlock(both), '');
  assert.equal(L.card(both).btn, 'Run');
  // Saved with sources only (data written oddly): the roles are read from the sources.
  assert.equal(L.runBlock({status:'saved', sources:[{url:REEL, role:'reel'}]}), 'Add the 16:9 link to run');
  // A folder job or a links list from before 16 November 2026 has no declared links: nothing new blocks it.
  assert.equal(L.runBlock({status:'queued', source:{kind:'folder', folderId:'x'}, sources:[]}), '');
  assert.equal(L.runBlock({status:'queued', source:{kind:'files'}, sources:[{url:MAIN, role:'main'}]}), '');
  assert.equal(L.station({status:'queued', source:{kind:'folder'}}), 0);
});
