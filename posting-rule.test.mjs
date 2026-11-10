// The posting rule (public/ww-store.js, WWStore.posting): which day each recorded video posts.
// Run with `node --test`. The store is a browser script, so it is loaded into a bare window here.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function load(db) {
  const events = [];
  const window = {dispatchEvent: e => events.push(e.type), claude: db ? {use: async () => db} : undefined};
  const ctx = vm.createContext({window, CustomEvent: class { constructor(type) { this.type = type; } }, fetch: async () => ({ok:false}), crypto: globalThis.crypto, URLSearchParams, setTimeout, clearTimeout, console});
  vm.runInContext(fs.readFileSync(new URL('./public/ww-store.js', import.meta.url), 'utf8'), ctx);
  return {store: window.WWStore, P: window.WWStore.posting, events};
}
const {P} = load();
const plain = map => Object.fromEntries(map);
const eq = (a, b) => assert.deepEqual(JSON.parse(JSON.stringify(a)), b); // values come from another realm
const weekday = iso => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(iso+'T12:00:00Z').getUTCDay()];
const add = (iso, n) => { const d = new Date(iso+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0, 10); };

// The topics in the app on 10 November 2026 (id, recording day, saved post date, status).
const CURRENT = [
  ['grok-voice-3', '2026-10-21', null, 'recorded'], ['grok-bot-really', '2026-10-23', null, 'recorded'],
  ['thinking-framework', '2026-10-28', '2026-11-03', 'posted'], ['suby-shots-editing', '2026-10-30', '2026-11-05', 'posted'],
  ['fifty-niches', '2026-11-04', null, 'planned'], ['perfect-meta-ad-script', '2026-11-06', null, 'recorded'],
  ['ai-call-centre', '2026-11-11', null, 'planned'], ['automations-claude-codex', '2026-11-13', null, 'planned'],
  ['manus-skill-creator-sandwich', '2026-11-18', null, 'planned'], ['offers-cant-say-no', '2026-11-20', null, 'planned'],
  ['burt-promoting', '2026-11-25', null, 'planned'], ['orchestrator-mindset', '2026-11-27', null, 'planned'],
].map(([id, recordDate, postDate, status]) => ({id, recordDate, postDate, status, createdAt:'2026-10-24T12:00:00.000Z'}));

test('no settings document means Tuesday and Thursday, five days, manual', () => {
  for (const missing of [null, undefined, {}, 'nonsense', {days:[], gap:0, time:'25:00', mode:'robot'}]) {
    const s = P.normalise(missing);
    eq(s.days, ['tue','thu']); assert.equal(s.gap, 5); assert.equal(s.time, '15:00'); assert.equal(s.mode, 'manual');
    eq({...s.platforms}, {youtube:true, linkedin:true, instagram:true, facebook:true, x:false});
  }
});

test('the defaults reproduce the dates the app showed before: recording day plus six, unless a post date is saved', () => {
  const plan = P.plan(CURRENT, null);
  for (const t of CURRENT) assert.equal(plan.get(t.id), t.postDate || add(t.recordDate, 6), t.id);
  assert.equal(plan.get('grok-voice-3'), '2026-10-27');           // PROCESS.md: recorded Wed 21 Oct, posts Tue 27 Oct
  assert.equal(plan.get('grok-bot-really'), '2026-10-29');        // recorded Fri 23 Oct, posts Thu 29 Oct
  assert.equal(plan.get('ai-call-centre'), '2026-11-17');
  assert.equal(plan.get('automations-claude-codex'), '2026-11-19');
  assert.equal(P.sentence(null), 'Wednesday’s video posts the next Tuesday, Friday’s the next Thursday.');
});

test('a year of Wednesday and Friday recordings under the defaults: Wednesday → next Tuesday, Friday → next Thursday', () => {
  const list = []; for (let d = '2026-01-07'; d < '2027-01-07'; d = add(d, 7)) list.push({id:'w'+d, recordDate:d}, {id:'f'+d, recordDate:add(d, 2)});
  const plan = P.plan(list, null);
  for (const t of list) { assert.equal(plan.get(t.id), add(t.recordDate, 6)); assert.equal(weekday(plan.get(t.id)), t.id[0] === 'w' ? 'Tue' : 'Thu'); }
});

test('Monday, Wednesday and Friday: every post lands on one of those days, at least the gap after recording', () => {
  const s = {days:['mon','wed','fri'], gap:5}, plan = P.plan(CURRENT.map(t => ({...t, postDate:null})), s);
  for (const t of CURRENT) { const p = plan.get(t.id); assert.ok(['Mon','Wed','Fri'].includes(weekday(p)), t.id+' '+p); assert.ok(p >= add(t.recordDate, 5)); }
  assert.equal(plan.get('ai-call-centre'), '2026-11-16');          // Wed 11 Nov → Mon 16 Nov
  assert.equal(plan.get('automations-claude-codex'), '2026-11-18'); // Fri 13 Nov → Wed 18 Nov
  assert.equal(P.sentence(s), 'Wednesday’s video posts the next Monday, Friday’s the next Wednesday.');
  assert.equal(P.sentence({days:['mon','wed','fri'], gap:2}), 'Wednesday’s video posts that Friday, Friday’s the next Monday.');
  assert.equal(P.dayList(s.days), 'Monday, Wednesday and Friday');
});

test('never two videos on one posting day, and the earlier recording goes first', () => {
  for (const s of [null, {days:['mon','wed','fri'], gap:5}, {days:['mon'], gap:3}, {days:['sat','sun'], gap:1}, {days:['thu'], gap:14}]) {
    const plan = P.plan(CURRENT, s), seen = new Set();
    for (const [, d] of plan) { assert.ok(!seen.has(d), 'double booked '+d); seen.add(d); }
  }
  // One posting day a week and two recordings: Wednesday's takes the first Monday, Friday's waits for the next.
  const one = P.plan([{id:'fri', recordDate:'2026-11-13'}, {id:'wed', recordDate:'2026-11-11'}], {days:['mon'], gap:3});
  eq(plain(one), {wed:'2026-11-16', fri:'2026-11-23'});
});

test('a week with a missing recording leaves its posting day empty and moves nothing else', () => {
  const list = CURRENT.filter(t => t.id !== 'automations-claude-codex'), plan = P.plan(list, null);
  assert.ok(![...plan.values()].includes('2026-11-19'));          // Thu 19 Nov has nothing to post
  for (const t of list) assert.equal(plan.get(t.id), t.postDate || add(t.recordDate, 6));
  assert.equal(P.slot(list, null, '2026-11-13'), '2026-11-19');   // booking that Friday again would post that Thursday
});

test('a post date saved on a topic always wins, and holds its day against the rule', () => {
  const list = [{id:'a', recordDate:'2026-11-11', postDate:'2026-11-14'},          // a Saturday, by hand
    {id:'b', recordDate:'2026-11-13', postDate:'2026-11-17'},                      // takes Tuesday 17th by hand
    {id:'c', recordDate:'2026-11-12', postDate:null}];                             // the rule would give it Tuesday 17th
  const plan = P.plan(list, null);
  assert.equal(plan.get('a'), '2026-11-14'); assert.equal(plan.get('b'), '2026-11-17');
  assert.equal(plan.get('c'), '2026-11-19');                       // so it moves to Thursday instead of doubling up
  assert.equal(P.plan([{id:'x', recordDate:null, postDate:'2026-12-25'}], null).get('x'), '2026-12-25');
  assert.equal(P.plan([{id:'y', recordDate:null, postDate:null}], null).has('y'), false);
});

test('changing the rule leaves posted videos and past weeks where they were', () => {
  const s = {days:['mon','wed','fri'], gap:5, from:'2026-11-10', history:[{days:['tue','thu'], gap:5, from:null}]};
  const plan = P.plan(CURRENT, s);
  assert.equal(plan.get('grok-voice-3'), '2026-10-27');           // went out before the change
  assert.equal(plan.get('grok-bot-really'), '2026-10-29');
  assert.equal(plan.get('thinking-framework'), '2026-11-03');     // saved by hand
  assert.equal(plan.get('fifty-niches'), '2026-11-11');           // due on the day of the change: next new posting day
  assert.equal(plan.get('perfect-meta-ad-script'), '2026-11-13');
  assert.equal(plan.get('ai-call-centre'), '2026-11-16');
  assert.equal(plan.get('orchestrator-mindset'), '2026-12-02');
  const posted = P.plan([{id:'p', recordDate:'2026-11-06', status:'posted'}], s);
  assert.equal(posted.get('p'), '2026-11-12');                    // posted under the old rule: stays on that Thursday
});

test('auto posting is only an intent until an account is connected', () => {
  assert.equal(P.autoLive({mode:'auto'}), false);
  assert.ok(Object.values({...P.CONNECTED}).every(v => v === false));
  assert.equal(P.modeLine(null), 'Manual posting: you press Post on the day.');
  assert.match(P.modeLine({mode:'auto'}), /no account is connected yet, so you still press Post on the day/);
});

test('saving: reads the document, writes the documented shape and starts a new rule from the day of the change', async () => {
  const docs = new Map([['settings/posting', {days:['tue','thu'], gap:5, time:'09:30', mode:'manual'}]]);
  const snap = path => ({exists:docs.has(path), id:path.split('/').pop(), data:() => docs.get(path)});
  const db = {doc: path => ({get: async () => snap(path), set: async d => { docs.set(path, JSON.parse(JSON.stringify(d))); }}),
    collection: () => ({onSnapshot: fn => { fn({docs:[]}); return () => {}; }, doc: () => ({})})};
  const {store, P, events} = load(db);
  await store.connect();
  assert.equal(P.settings.time, '09:30'); assert.ok(P.canSave); assert.ok(events.includes('ww:settings'));
  await P.save({days:['fri','mon','wed'], mode:'auto', platforms:{x:true}}, '2026-11-10');
  const saved = docs.get('settings/posting');
  eq(saved.days, ['mon','wed','fri']); assert.equal(saved.from, '2026-11-10'); assert.equal(saved.mode, 'auto'); assert.equal(saved.time, '09:30');
  eq(saved.history, [{days:['tue','thu'], gap:5, from:null}]);
  eq(saved.platforms, {youtube:true, linkedin:true, instagram:true, facebook:true, x:true});
  assert.equal(P.effectiveMode, 'manual'); assert.equal(P.mode, 'auto');
  assert.equal(P.isPostingDay('2026-11-16'), true); assert.equal(P.isPostingDay('2026-11-17'), false);
  assert.equal(P.isPostingDay('2026-11-03'), true); assert.equal(P.isPostingDay('2026-11-09'), false); // before the change: still Tuesday and Thursday
  await P.save({time:'16:00'}, '2026-11-12');                      // not a rule change: history and from stay
  assert.equal(docs.get('settings/posting').from, '2026-11-10'); assert.equal(docs.get('settings/posting').history.length, 1);
  await P.save({gap:2}, '2026-11-10');                             // a second change on the same day replaces, no extra history
  assert.equal(docs.get('settings/posting').history.length, 1);
});

test('without the database, saving says so and the defaults stand', async () => {
  const {store, P} = load();
  await store.connect();
  assert.equal(P.canSave, false);
  await assert.rejects(() => P.save({days:['mon']}), /database/);
  eq(P.settings.days, ['tue','thu']);
});
