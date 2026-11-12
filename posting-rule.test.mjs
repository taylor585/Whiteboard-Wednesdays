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

test('no settings document means Tuesday, Thursday and Saturday, five days, manual', () => {
  for (const missing of [null, undefined, {}, 'nonsense', {days:[], gap:0, time:'25:00', mode:'robot'}]) {
    const s = P.normalise(missing);
    eq(s.days, ['tue','thu','sat']); assert.equal(s.gap, 5); assert.equal(s.time, '15:00'); assert.equal(s.mode, 'manual');
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
  assert.equal(P.sentence(null), 'Monday’s video posts that Saturday, Wednesday’s the next Tuesday, Friday’s the next Thursday.');
});

// Taylor, 11 November 2026: "Recording days are going to be Monday, Wednesday, and Friday. Posting days are going to be
// Tuesday, Thursday, and Saturday."
test('recording days are Monday, Wednesday and Friday', () => {
  eq(P.RECORD_DAYS, ['mon','wed','fri']);
  assert.equal(P.dayList(P.RECORD_DAYS), 'Monday, Wednesday and Friday');
  assert.equal(P.dayList(P.DEFAULTS.days), 'Tuesday, Thursday and Saturday');
  for (const [d, want] of [['2026-11-16', true], ['2026-11-17', false], ['2026-11-18', true], ['2026-11-19', false], ['2026-11-20', true], ['2026-11-21', false], ['2026-11-22', false], ['nonsense', false], [null, false],
    ['2026-11-09', false], ['2026-11-04', true], ['2026-11-06', true]])   // before 11 November the days were Wednesday and Friday
    assert.equal(P.isRecordingDay(d), want, String(d));
});

test('a year of Monday, Wednesday and Friday recordings under the defaults: Monday → that Saturday, Wednesday → next Tuesday, Friday → next Thursday', () => {
  const list = []; for (let d = '2026-11-16'; d < '2027-11-16'; d = add(d, 7)) list.push({id:'m'+d, recordDate:d}, {id:'w'+d, recordDate:add(d, 2)}, {id:'f'+d, recordDate:add(d, 4)});
  const plan = P.plan(list, null), seen = new Set();
  for (const t of list) {
    const p = plan.get(t.id), want = {m:['Sat', 5], w:['Tue', 6], f:['Thu', 6]}[t.id[0]];
    assert.equal(weekday(p), want[0], t.id); assert.equal(p, add(t.recordDate, want[1]), t.id);
    assert.ok(!seen.has(p), 'double booked '+p); seen.add(p);
  }
  assert.equal(P.slot([], null, '2026-11-16'), '2026-11-21');      // Mon 16 Nov posts Sat 21 Nov
  assert.equal(P.slot([], null, '2026-11-18'), '2026-11-24');      // Wed 18 Nov posts Tue 24 Nov
  assert.equal(P.slot([], null, '2026-11-20'), '2026-11-26');      // Fri 20 Nov posts Thu 26 Nov
});

test('switching the saved Tuesday and Thursday rule to the new days moves nothing already planned', () => {
  const s = {days:['tue','thu','sat'], gap:5, from:'2026-11-11', history:[{days:['tue','thu'], gap:5, from:null}]};
  const before = P.plan(CURRENT, {days:['tue','thu'], gap:5}), after = P.plan(CURRENT, s);
  for (const t of CURRENT) assert.equal(after.get(t.id), before.get(t.id), t.id);
  assert.equal(P.plan([...CURRENT, {id:'mon', recordDate:'2026-11-16'}], s).get('mon'), '2026-11-21');
});

test('booking: Monday, Wednesday and Friday are accepted, every other day is refused', async () => {
  const writes = [], docs = [{id:'t1', title:'A topic', status:'planned', recordDate:null}];
  const snap = list => ({docs:list.map(d => ({exists:true, id:d.id, data:() => d}))});
  const db = {doc: () => ({get: async () => ({exists:false, data:() => undefined})}),
    collection: name => ({onSnapshot: fn => { fn(snap(name === 'topics' ? docs : [])); return () => {}; }, doc: id => ({update: async d => { writes.push([id, d]); }, set: async () => {}})})};
  const {store} = load(db);
  const api = await store.connect();
  for (const d of ['2026-11-16', '2026-11-18', '2026-11-20']) eq(await api.call('/topic-update', {id:'t1', recordDate:d}), {updated:true});
  for (const d of ['2026-11-17', '2026-11-19', '2026-11-21', '2026-11-22'])
    await assert.rejects(() => api.call('/topic-update', {id:'t1', recordDate:d}), /Recording days are Monday, Wednesday and Friday/, d);
  assert.equal(writes.length, 3);
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
  assert.equal(P.sentence(s), 'Monday’s video posts the next Monday, Wednesday’s the next Wednesday, Friday’s the next Friday.');
  assert.equal(P.sentence({days:['mon','wed','fri'], gap:2}), 'Monday’s video posts that Wednesday, Wednesday’s that Friday, Friday’s the next Monday.');
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
  eq(P.settings.days, ['tue','thu','sat']);
});

// Add to schedule (Taylor, 11 November 2026): the next available slot never skips a free recording day.
test('nextFreeSlot: the first Monday, Wednesday or Friday from the given day that no topic holds', () => {
  assert.equal(P.nextFreeSlot([], '2026-11-16'), '2026-11-16');                        // a free Monday is its own slot
  assert.equal(P.nextFreeSlot([], '2026-11-17'), '2026-11-18');                        // Tuesday → Wednesday
  assert.equal(P.nextFreeSlot([], '2026-11-21'), '2026-11-23');                        // Saturday → Monday
  const week = ['2026-11-16', '2026-11-18', '2026-11-20'].map((recordDate, i) => ({id:'t'+i, recordDate}));
  assert.equal(P.nextFreeSlot(week, '2026-11-16'), '2026-11-23');                      // a full week moves on
  assert.equal(P.nextFreeSlot([{id:'a', recordDate:'2026-11-18'}], '2026-11-16'), '2026-11-16');   // a gap is filled first
  assert.equal(P.nextFreeSlot([{id:'a', recordDate:'2026-11-16'}, {id:'b', recordDate:null}], '2026-11-16'), '2026-11-18');
  assert.equal(P.nextFreeSlot(CURRENT, '2026-11-11'), '2026-11-16');                   // 11 and 13 November are booked
  assert.equal(P.nextFreeSlot([], '2026-11-09'), '2026-11-11');                        // before 11 November Monday was not a recording day
  assert.equal(P.nextFreeSlot([], 'nonsense'), null);
  for (const d of ['2026-11-11', '2026-11-12', '2026-12-25', '2027-01-01']) assert.ok(P.isRecordingDay(P.nextFreeSlot(CURRENT, d)), d);
});

// A store with one fetched upload and a database that keeps what is written, for the Watchlist's actions.
async function storeWithUpload(mcp) {
  const docs = new Map(), listeners = new Map();
  const fire = col => { for (const fn of listeners.get(col) || []) fn({docs:[...docs].filter(([k]) => k.startsWith(col+'/')).map(([k, v]) => ({id:k.split('/')[1], exists:true, data:() => v}))}); };
  const ref = (col, id) => ({
    set: async v => { docs.set(col+'/'+id, {...v}); fire(col); },
    update: async v => { docs.set(col+'/'+id, {...(docs.get(col+'/'+id) || {}), ...v}); fire(col); },
    delete: async () => { docs.delete(col+'/'+id); fire(col); },
    get: async () => ({exists:docs.has(col+'/'+id), data:() => docs.get(col+'/'+id)}),
    onSnapshot: () => () => {}});
  const db = {collection: col => ({doc: id => ref(col, id), onSnapshot: next => { listeners.set(col, [...(listeners.get(col) || []), next]); fire(col); return () => {}; }}), doc: path => ref(...path.split('/'))};
  const uploads = {fetchedAt:'2026-11-11T09:00:00Z', docs:[{id:'@a', data:{handle:'@a', name:'A', videos:[{id:'vid12345', title:'A video', publishedAt:'2026-11-10T09:00:00Z'}]}}]};
  const window = {dispatchEvent: () => {}, claude: {use: async name => name === 'db' ? db : name === 'mcp' ? mcp : null}};
  const ctx = vm.createContext({window, CustomEvent: class { constructor(type) { this.type = type; } }, fetch: async url => String(url).startsWith('uploads.json') ? {ok:true, json: async () => uploads} : {ok:false}, crypto: globalThis.crypto, URLSearchParams, setTimeout, clearTimeout, console});
  vm.runInContext(fs.readFileSync(new URL('./public/ww-store.js', import.meta.url), 'utf8'), ctx);
  return {api: await window.WWStore.connect(), docs};
}

test('Add to schedule makes the topic planned and booked in one write, and refuses a held day', async () => {
  const {api, docs} = await storeWithUpload(null);
  const r = await api.call('/topic', {videoId:'vid12345', recordDate:'2026-11-16'});
  assert.equal(r.recordDate, '2026-11-16');
  const t = docs.get('topics/'+r.id);
  assert.equal(t.status, 'planned'); assert.equal(t.recordDate, '2026-11-16'); assert.equal(t.sources[0].id, 'vid12345');
  await assert.rejects(api.call('/topic', {videoId:'vid12345', recordDate:'2026-11-16'}), /already booked/);
  await assert.rejects(api.call('/topic', {videoId:'vid12345', recordDate:'2026-11-17'}), /Monday, Wednesday and Friday/);
  const plain = await api.call('/topic', {videoId:'vid12345'});
  assert.equal(docs.get('topics/'+plain.id).status, 'new'); assert.equal(docs.get('topics/'+plain.id).recordDate, null);
});

test('Refresh and Get ideas start a Claude Code session, or say plainly why not', async () => {
  const calls = [];
  const mcp = {callTool: async (server, tool, input) => { calls.push({server, tool, input}); return {payload:{session_id:'session_abc'}}; }};
  const {api, docs} = await storeWithUpload(mcp);
  const scan = await api.call('/refresh', {});
  assert.equal(scan.started, true); assert.equal(scan.session.url, 'https://claude.ai/code/session_abc');
  assert.equal(calls[0].server, 'Claude Code Remote'); assert.equal(calls[0].tool, 'create_session');
  assert.equal(calls[0].input.prompt, 'Run watchlist scan '+scan.id+'. Follow SCAN.md in this repository exactly.');
  assert.equal(docs.get('scans/'+scan.id).status, 'starting'); assert.equal(docs.get('scans/'+scan.id).session.id, 'session_abc');
  const run = await api.call('/idea-run', {});
  assert.equal(calls[1].input.prompt, 'Run topic ideas '+run.id+'. Follow SKILL-IDEAS.md in this repository exactly.');
  assert.equal(docs.get('ideaRuns/'+run.id).status, 'starting');

  const refused = await storeWithUpload({callTool: async () => { throw {code:'not_granted'}; }});
  const r2 = await refused.api.call('/refresh', {});
  assert.equal(r2.started, false); assert.match(r2.why, /did not allow/); assert.equal(r2.line, 'Run watchlist scan '+r2.id);
  assert.equal(refused.docs.get('scans/'+r2.id).status, 'waiting');
  const none = await storeWithUpload(null);
  const r3 = await none.api.call('/idea-run', {});
  assert.equal(r3.started, false); assert.match(r3.why, /not available/); assert.equal(none.docs.get('ideaRuns/'+r3.id).status, 'waiting');
});

test('a start record never overwrites a status the session already wrote', async () => {
  let docsRef;
  const mcp = {callTool: async (s, t, input) => { const id = input.prompt.match(/scan (\S+)\./)[1]; docsRef.set('scans/'+id, {...docsRef.get('scans/'+id), status:'running'}); return {payload:{id:'session_x'}}; }};
  const made = await storeWithUpload(mcp); docsRef = made.docs;
  const r = await made.api.call('/refresh', {});
  assert.equal(made.docs.get('scans/'+r.id).status, 'running'); assert.equal(made.docs.get('scans/'+r.id).session.id, 'session_x');
});

test('Sessions the app starts ask for Auto, and start without it if Auto is refused', async () => {
  const calls = [];
  const mcp = {callTool: async (server, tool, input) => {
    calls.push(input);
    if (input.permission_mode) throw new Error("permission_mode 'auto' requires the parent session to be in auto mode");
    return {payload:{session_id:'session_plain'}};
  }};
  const {api, docs} = await storeWithUpload(mcp);
  const scan = await api.call('/refresh', {});
  assert.equal(calls[0].permission_mode, 'auto');
  assert.equal(calls[1].permission_mode, undefined);
  assert.equal(scan.started, true); assert.equal(docs.get('scans/'+scan.id).session.id, 'session_plain');
  const other = await storeWithUpload({callTool: async () => { throw {code:'not_granted'}; }});
  const r = await other.api.call('/refresh', {});
  assert.equal(r.started, false); assert.match(r.why, /did not allow/);
});
