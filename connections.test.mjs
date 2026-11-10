// Connection state (public/ww-store.js, WWStore.connections) and what Posting reads from it.
// Run with `node --test`. The store is a browser script, so it is loaded into a bare window here.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function load(docs) {
  const events = [];
  const db = docs && {doc: path => ({get: async () => ({data: () => docs[path]}), set: async () => {}}), collection: () => ({onSnapshot: fn => { fn({docs:[]}); }})};
  const window = {dispatchEvent: e => events.push(e.type), claude: db ? {use: async () => db} : undefined};
  const ctx = vm.createContext({window, CustomEvent: class { constructor(type) { this.type = type; } }, fetch: async () => ({ok:false}), crypto: globalThis.crypto, URL, URLSearchParams, setTimeout, clearTimeout, console});
  vm.runInContext(fs.readFileSync(new URL('./public/ww-store.js', import.meta.url), 'utf8'), ctx);
  return {store: window.WWStore, C: window.WWStore.connections, P: window.WWStore.posting, events};
}
const plain = v => JSON.parse(JSON.stringify(v));

test('nothing is connected until a real check says so', () => {
  const {C, P} = load();
  assert.deepEqual(plain(C.KEYS), ['googledrive','youtube','linkedin','instagram','facebook','x']);
  assert.equal(C.TOOLKITS.x, 'twitter');
  for (const k of C.KEYS) { assert.equal(C.get(k).state, 'unknown'); assert.equal(C.isConnected(k), false); }
  assert.deepEqual(plain({...P.CONNECTED}), {youtube:false, linkedin:false, instagram:false, facebook:false, x:false});
});

test('a direct check makes one account connected and leaves the others alone', () => {
  const {C, P} = load();
  C.set('instagram', {state:'on', account:'fake_gram', checkedAt:'2026-11-10T09:00:00.000Z'});
  assert.equal(P.CONNECTED.instagram, true);
  assert.equal(P.CONNECTED.facebook, false);          // Facebook and Instagram are separate connections
  assert.equal(P.CONNECTED.linkedin, false);
  assert.equal(C.get('instagram').account, 'fake_gram');
  C.set('linkedin', {state:'attention', account:'should not show', error:'Composio says this sign-in has expired.'});
  assert.equal(C.get('linkedin').account, null);      // a name is kept only with Connected
  assert.equal(P.CONNECTED.linkedin, false);
  C.set('nonsense', {state:'on'}); assert.equal(C.get('nonsense').state, 'unknown');
  C.set('youtube', {state:'made-up'}); assert.equal(C.get('youtube').state, 'blind');
  C.clearDirect(); assert.equal(P.CONNECTED.instagram, false);
});

test('Auto stays an intent until an account is connected and the poster exists', () => {
  const {C, P} = load();
  assert.equal(P.autoLive({mode:'auto'}), false);
  assert.match(P.modeLine({mode:'auto'}), /no account is connected yet/);
  C.set('youtube', {state:'on', account:'Fake Channel'});
  assert.equal(P.autoLive({mode:'auto'}), false);     // connected, but the automatic poster is not built
  assert.match(P.modeLine({mode:'auto'}), /automatic poster is not running yet/);
  assert.equal(P.posterLive, false);
  P.posterLive = true;
  assert.equal(P.autoLive({mode:'auto'}), true);
  assert.equal(P.autoLive({mode:'manual'}), false);
  assert.equal(P.autoLive({mode:'auto', platforms:{youtube:false}}), false);   // connected but switched off
  C.set('youtube', {state:'off'});
  assert.equal(P.autoLive({mode:'auto'}), false);
});

test('the session document is read, cleaned and overridden by a direct check', async () => {
  const at = '2026-11-10T09:41:00.000Z';
  const {store, C, P, events} = load({'connections/status': {updatedAt:at, by:'session',
    youtube:{state:'connected', account:'Fake Channel', checkedAt:at, error:null, link:null},
    facebook:{state:'connecting', account:'ignored', checkedAt:at, error:null, link:{url:'https://connect.example/fb', createdAt:at}},
    instagram:{state:'connecting', link:{url:'javascript:alert(1)'}},
    linkedin:{state:'attention', error:'Composio says this sign-in has expired.'},
    x:{state:'whatever'}, github:{state:'connected'}}});
  await store.connect();
  assert.ok(events.includes('ww:connections'));
  assert.equal(C.get('youtube').state, 'on'); assert.equal(C.get('youtube').account, 'Fake Channel'); assert.equal(C.get('youtube').via, 'session');
  assert.equal(P.CONNECTED.youtube, true);
  assert.equal(C.get('facebook').state, 'connecting'); assert.equal(C.get('facebook').account, null); assert.equal(C.get('facebook').link.url, 'https://connect.example/fb');
  assert.equal(C.get('instagram').link, null);        // only an https link is ever kept
  assert.equal(C.get('linkedin').state, 'attention'); assert.equal(C.get('linkedin').checkedAt, at);
  assert.equal(C.get('x').state, 'unknown');          // an unknown state word is not a state
  assert.equal(C.get('googledrive').state, 'unknown');
  C.set('youtube', {state:'off'});                     // the page's own check is newer than the session's
  assert.equal(C.get('youtube').state, 'off'); assert.equal(P.CONNECTED.youtube, false);
  C.clearDirect(['youtube']); assert.equal(C.get('youtube').state, 'on');
});
