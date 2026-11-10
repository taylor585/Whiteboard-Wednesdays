// The posting engine's rules (public/posting-core.js) and the session's script (scripts/posting-plan.mjs).
// Run with `node --test`. No network, no database: every case is dates and documents in, answers out.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {load, run} from './scripts/posting-plan.mjs';

const {core: C, x: X, posting: P} = load();
const eq = (a, b) => assert.deepEqual(JSON.parse(JSON.stringify(a)), b);  // values come from another realm
const S = (over = {}) => P.normalise({mode:'auto', days:['tue', 'thu'], gap:5, time:'15:00', ...over});
const ALL = {youtube:true, linkedin:true, x:true, instagram:true, facebook:true};

// ---- UK time --------------------------------------------------------------------------------------------------------
test('London wall time to UTC across both clock changes', () => {
  assert.equal(C.londonToUtc('2026-11-17', '15:00'), '2026-11-17T15:00:00.000Z');          // GMT
  assert.equal(C.londonToUtc('2026-06-16', '15:00'), '2026-06-16T14:00:00.000Z');          // BST
  assert.equal(C.londonToUtc('2027-03-28', '15:00'), '2027-03-28T14:00:00.000Z');          // the day BST starts
  assert.equal(C.londonToUtc('2026-10-25', '15:00'), '2026-10-25T15:00:00.000Z');          // the day BST ends
  assert.equal(C.londonToUtc('2027-03-28', '01:30'), '2027-03-28T01:30:00.000Z');          // does not exist: an hour on (02:30 BST)
  assert.equal(C.londonToUtc('2026-10-25', '01:30'), '2026-10-25T00:30:00.000Z');          // happens twice: the first
  assert.equal(C.londonToUtc('2026-12-31', '23:59'), '2026-12-31T23:59:00.000Z');
});
test('the London day of an instant near midnight', () => {
  assert.equal(C.londonDay('2026-06-16T23:30:00Z'), '2026-06-17');   // 00:30 BST next day
  assert.equal(C.londonDay('2026-12-16T23:30:00Z'), '2026-12-16');   // 23:30 GMT same day
  assert.equal(C.londonDay('2026-11-17T00:00:00Z'), '2026-11-17');
  assert.equal(C.londonTime('2026-06-16T14:00:00Z'), '15:00');
});

// ---- The schedule ----------------------------------------------------------------------------------------------------
test('schedule: the topic posting day when still ahead', () => {
  const day = P.plan([{id:'a', recordDate:'2026-11-11'}], S()).get('a');
  assert.equal(day, '2026-11-17');
  eq(C.scheduleFor(day, S(), '2026-11-10T12:00:00Z'), {day:'2026-11-17', time:'15:00', tz:'Europe/London', at:'2026-11-17T15:00:00.000Z', late:false, planned:'2026-11-17'});
});
test('schedule: ready after its slot passed moves to the next posting day, today if the time is still ahead', () => {
  eq(C.scheduleFor('2026-11-10', S(), '2026-11-10T14:59:00Z'), {day:'2026-11-10', time:'15:00', tz:'Europe/London', at:'2026-11-10T15:00:00.000Z', late:false, planned:'2026-11-10'});
  const s = C.scheduleFor('2026-11-10', S(), '2026-11-10T15:00:00Z');
  assert.equal(s.day, '2026-11-12'); assert.equal(s.late, true); assert.equal(s.planned, '2026-11-10');
  assert.equal(C.scheduleFor(null, S(), '2026-11-11T09:00:00Z').day, '2026-11-12');                  // no topic: next posting day
  assert.equal(C.scheduleFor(null, S({days:['sat'], time:'09:30'}), '2026-11-11T09:00:00Z').at, '2026-11-14T09:30:00.000Z');
});
test('schedule: a summer posting time is UK time, not UTC', () => {
  assert.equal(C.scheduleFor('2027-06-15', S(), '2027-06-01T00:00:00Z').at, '2027-06-15T14:00:00.000Z');
});

// ---- Connections and switches ----------------------------------------------------------------------------------------
test('connected only when exactly true or an object that says so', () => {
  const frozen = Object.freeze({youtube:false, linkedin:false, instagram:false, facebook:false, x:false});
  for (const k of C.ORDER) assert.equal(C.isConnected(frozen, k), false);
  assert.equal(C.isConnected({youtube:true}, 'youtube'), true);
  assert.equal(C.isConnected({youtube:'yes'}, 'youtube'), false);
  assert.equal(C.isConnected({youtube:{connected:true}}, 'youtube'), true);
  assert.equal(C.isConnected({youtube:{state:'connected', account:'x'}}, 'youtube'), true);
  assert.equal(C.isConnected({youtube:{state:'needs-attention'}}, 'youtube'), false);
  assert.equal(C.isConnected(null, 'youtube'), false);
});
test('the job switch wins over Posting settings', () => {
  assert.equal(C.isOn({}, S(), 'x'), false);
  assert.equal(C.isOn({postTo:{x:true}}, S(), 'x'), true);
  assert.equal(C.isOn({postTo:{youtube:false}}, S(), 'youtube'), false);
});

// ---- Receipts: never double-post --------------------------------------------------------------------------------------
test('state machine: start, ok; never twice', () => {
  const a = C.transition(null, 'start', '2026-11-17T15:00:00Z', {attemptId:'r1'});
  assert.equal(a.state, 'posting'); assert.equal(a.attemptId, 'r1');
  assert.throws(() => C.transition(a, 'start', '2026-11-17T15:01:00Z', {attemptId:'r2'}), /already posting/);
  const b = C.transition(a, 'ok', '2026-11-17T15:02:00Z', {url:'https://www.youtube.com/watch?v=abc', id:'abc'});
  assert.equal(b.state, 'posted'); assert.equal(b.url, 'https://www.youtube.com/watch?v=abc');
  assert.throws(() => C.transition(b, 'start', '2026-11-18T15:00:00Z', {attemptId:'r3'}), /never post twice/);
  assert.throws(() => C.transition(b, 'skip', '2026-11-18T15:00:00Z'), /cannot skip/);
  assert.throws(() => C.transition(null, 'start', '2026-11-18T15:00:00Z', {}), /attemptId/);
});
test('state machine: one retry an hour later, then a look', () => {
  let e = C.transition(null, 'start', '2026-11-17T15:00:00Z', {attemptId:'r1'});
  e = C.transition(e, 'fail', '2026-11-17T15:01:00Z', {error:'400 bad media'});
  assert.equal(e.state, 'failed'); assert.equal(e.retries, 1); assert.equal(e.retryAt, '2026-11-17T16:01:00.000Z');
  assert.throws(() => C.transition(e, 'start', '2026-11-17T15:30:00Z', {attemptId:'r2'}), /not retryable yet/);
  eq(C.decide(e, {on:true, connected:true, held:false, at:'2026-11-17T15:30:00Z'}), {act:'wait', why:'retry at 2026-11-17T16:01:00.000Z'});
  eq(C.decide(e, {on:true, connected:true, held:false, at:'2026-11-17T16:01:00Z'}), {act:'post', retry:true});
  e = C.transition(e, 'start', '2026-11-17T16:01:00Z', {attemptId:'r2'});
  e = C.transition(e, 'fail', '2026-11-17T16:02:00Z', {error:'400 again'});
  assert.equal(e.retries, 2); assert.equal(e.retryAt, null);
  eq(C.decide(e, {on:true, connected:true, held:false, at:'2026-11-18T00:00:00Z'}), {act:'look', why:'failed twice'});
});
test('state machine: unclear becomes check; read back decides; only Taylor clears LinkedIn', () => {
  let e = C.transition(null, 'start', '2026-11-17T15:00:00Z', {attemptId:'r1'});
  e = C.transition(e, 'unclear', '2026-11-17T15:05:00Z', {error:'timeout'});
  assert.equal(e.state, 'check');
  assert.throws(() => C.transition(e, 'start', '2026-11-17T16:00:00Z', {attemptId:'r2'}), /only Taylor/);
  eq(C.decide(e, {on:true, connected:true, held:false, at:'2026-11-17T16:00:00Z'}), {act:'look', why:'needs a look'});
  assert.equal(C.transition(e, 'ok', '2026-11-17T15:06:00Z', {url:'u'}).state, 'posted');                  // found on read back
  assert.equal(C.transition(e, 'clear', '2026-11-17T18:00:00Z', {posted:true}).state, 'posted');          // Taylor: it is posted
  const no = C.transition(e, 'clear', '2026-11-17T18:00:00Z', {posted:false});                           // Taylor: it isn't
  assert.equal(no.state, 'failed'); assert.equal(C.decide(no, {on:true, connected:true, held:false, at:'2026-11-17T18:00:00Z'}).act, 'post');
});
test('decide: hold, off and not connected skip; posting waits', () => {
  assert.equal(C.decide(null, {on:true, connected:true, held:true}).why, 'on hold');
  assert.equal(C.decide(null, {on:false, connected:true}).why, 'switched off');
  assert.equal(C.decide(null, {on:true, connected:false}).why, 'not connected');
  assert.equal(C.decide({state:'posting'}, {on:true, connected:true}).act, 'wait');
  assert.equal(C.decide({state:'skipped', reason:'not connected'}, {on:true, connected:true}).act, 'post');  // connected since
});

// ---- Texts ----------------------------------------------------------------------------------------------------------
test('placeholder filling: only [YOUTUBE LINK]; anything else stays and is reported', () => {
  eq(C.fill('Watch: [YOUTUBE LINK]', 'https://youtu.be/abcdefg'), {text:'Watch: https://youtu.be/abcdefg', left:[]});
  eq(C.fill('Watch: [YOUTUBE LINK]', null), {text:'Watch: [YOUTUBE LINK]', left:['[YOUTUBE LINK]']});
  eq(C.fill('Book: [BOOKING LINK] at X:XX', 'https://youtu.be/a'), {text:'Book: [BOOKING LINK] at X:XX', left:['[BOOKING LINK]', 'X:XX']});
});
test('X: single post and thread assembled, filled, counted the way X counts', () => {
  const yt = 'https://www.youtube.com/watch?v=abcdefghijk';
  const single = C.xThread({kind:'single', body:'The hook 🚀', replies:['Full video: [YOUTUBE LINK]']}, yt, X.len);
  eq(single.errors, []);
  eq(single.posts.map(p => [p.n, p.text, p.count, p.replyTo, p.media]), [[1, 'The hook 🚀', 11, null, 'thumbnail'], [2, 'Full video: ' + yt, 35, 1, null]]);
  const thread = C.xThread({kind:'thread', body:'One', replies:['Two', 'Three', 'Watch → [YOUTUBE LINK]']}, yt, X.len);
  eq(thread.errors, []); assert.equal(thread.posts.length, 4); assert.equal(thread.posts[3].replyTo, 3); assert.equal(thread.posts[3].count, 32);  // "Watch" 5, two spaces, the arrow 2, the link 23
  assert.match(C.xThread({kind:'single', body:'x'.repeat(281), replies:['[YOUTUBE LINK]']}, yt, X.len).errors.join(), /post 1 is 281 of 280/);
  assert.match(C.xThread({kind:'single', body:'See https://a.co', replies:['[YOUTUBE LINK]']}, yt, X.len).errors.join(), /no link in the first post/);
  assert.match(C.xThread({kind:'single', body:'hook', replies:['[YOUTUBE LINK]']}, null, X.len).errors.join(), /YouTube link is not there yet/);
  assert.match(C.xThread({kind:'single', body:'hook', replies:['no link']}, yt, X.len).errors.join(), /must be in the last post, once/);
  assert.match(C.xThread({kind:'thread', body:'a', replies:['[YOUTUBE LINK]']}, yt, X.len).errors.join(), /4 to 6 posts/);
  assert.match(C.xThread({kind:'single', body:'hook [YOUR NAME]', replies:['[YOUTUBE LINK]']}, yt, X.len).errors.join(), /still has \[YOUR NAME\]/);
});

// ---- The plan and what is due ----------------------------------------------------------------------------------------
const pack = {platforms:[
  {key:'youtube', posts:[{title:'T', body:'D'}], thumbnails:[{id:'t3', url:'https://x/a.jpg'}]},
  {key:'linkedin', posts:[{body:'L', firstComment:'Full video: [YOUTUBE LINK]'}], thumbnails:[{id:'t3', url:'https://x/b.jpg'}]},
  {key:'x', posts:[{kind:'single', body:'Hook', replies:['[YOUTUBE LINK]']}], thumbnails:[]}]};
const job = (id, extra = {}) => ({id, status:'final', topicId:'t', pack, picks:{'youtube.post':'v1', 'youtube.thumb':'t3', 'linkedin.post':'v1', 'linkedin.thumb':'t3', 'x.post':'v1'}, postTo:{x:true},
  stored:{files:[{kind:'master', id:'d1'}, {kind:'linkedin', id:'d2'}]}, youtubePrivate:{videoId:'abcdefghijk'},
  schedule:{day:'2026-11-17', time:'15:00', tz:'Europe/London', at:'2026-11-17T15:00:00.000Z'}, ...extra});
const reel = (id, jobId, extra = {}) => ({id, jobId, status:'final', finals:[{reelId:'A', kind:'reel', url:'https://r/a.mp4'}, {reelId:'A', kind:'post', url:'https://r/p.mp4'}],
  captions:[{reelId:'A', kind:'reel', text:'R. The full video is on my YouTube channel now.'}, {reelId:'A', kind:'post', text:'P'}], ...extra});

test('plan: order, YouTube first, the others wait for its link', () => {
  const steps = C.plan(job('j'), reel('r', 'j'), {settings:S(), connected:ALL, len:X.len, now:'2026-11-17T15:00:00Z'});
  eq(steps.map(s => s.key + ':' + s.act), ['youtube:post', 'linkedin:wait', 'x:wait', 'instagram/A/reel:wait', 'instagram/A/post:wait', 'facebook/A/reel:wait', 'facebook/A/post:wait']);
  const after = C.plan(job('j', {posting:{youtube:{state:'posted', url:'https://www.youtube.com/watch?v=abcdefghijk'}}}), reel('r', 'j'), {settings:S(), connected:ALL, len:X.len, now:'2026-11-17T15:03:00Z'});
  eq(after.map(s => s.key + ':' + s.act), ['youtube:done', 'linkedin:post', 'x:post', 'instagram/A/reel:post', 'instagram/A/post:post', 'facebook/A/reel:post', 'facebook/A/post:post']);
  assert.equal(after[1].firstComment, 'Full video: https://www.youtube.com/watch?v=abcdefghijk');
  assert.equal(after[2].posts[1].text, 'https://www.youtube.com/watch?v=abcdefghijk');
  assert.equal(after[3].caption, after[5].caption);   // Instagram and Facebook: the same caption
});
test('plan: never a review copy; a missing stored file is a look, a disconnected platform a skip', () => {
  const s = C.plan(job('j', {stored:{files:[]}, youtubePrivate:null}), null, {settings:S(), connected:{...ALL, linkedin:false}, len:X.len, now:'2026-11-17T15:00:00Z'});
  assert.equal(s[0].act, 'look'); assert.match(s[0].why, /no full-quality master stored/);
  assert.equal(s[1].act, 'skip'); assert.equal(s[1].why, 'not connected');
  assert.equal(s.find(x => x.platform === 'instagram').act, 'none');
});
test('plan: hold stops everything', () => {
  const s = C.plan(job('j', {hold:{on:true}}), reel('r', 'j'), {settings:S(), connected:ALL, len:X.len});
  assert.ok(s.every(x => x.act === 'skip' && x.why === 'on hold'));
});
test('due: manual does nothing; auto posts what is due today in London', () => {
  const jobs = [job('today'), job('tomorrow', {schedule:{day:'2026-11-18', time:'15:00', at:'2026-11-18T15:00:00.000Z'}}), job('held', {hold:{on:true}}), job('notready', {status:'posts'})];
  eq(C.due({jobs, settings:S({mode:'manual'}), connected:ALL, now:'2026-11-17T15:00:00Z'}).due, []);
  const d = C.due({jobs, reels:[reel('r', 'today')], settings:S(), connected:ALL, now:'2026-11-17T15:00:30Z'});
  eq(d.due.map(x => [x.jobId, x.reelsId, x.late]), [['today', 'r', false]]);
  eq(d.waiting.map(x => x.jobId), ['tomorrow']); eq(d.held.map(x => x.jobId), ['held']);
  eq(C.due({jobs, settings:S(), connected:ALL, now:'2026-11-17T14:59:00Z'}).due, []);           // not yet its time
});
test('due: the UK day, not the UTC day, across midnight in summer', () => {
  const j = job('s', {schedule:{day:'2027-06-16', time:'00:30', at:C.londonToUtc('2027-06-16', '00:30')}});
  assert.equal(j.schedule.at, '2027-06-15T23:30:00.000Z');
  eq(C.due({jobs:[j], settings:S(), connected:ALL, now:'2027-06-15T23:31:00Z'}).due.map(x => x.jobId), ['s']);   // 00:31 on the 16th in London
  eq(C.due({jobs:[j], settings:S(), connected:ALL, now:'2027-06-15T23:29:00Z'}).due, []);
});
test('due: a missed day posts up to two days late, then only an alert; late reels up to 14 days', () => {
  eq(C.due({jobs:[job('j')], settings:S(), connected:ALL, now:'2026-11-19T15:00:00Z'}).due.map(x => [x.jobId, x.late]), [['j', true]]);
  const m = C.due({jobs:[job('j')], settings:S(), connected:ALL, now:'2026-11-20T15:00:00Z'});
  eq(m.due, []); eq(m.missed.map(x => x.jobId), ['j']);
  const out = {youtube:{state:'posted', url:'https://www.youtube.com/watch?v=abcdefghijk'}, linkedin:{state:'posted'}, x:{state:'posted'}};
  const late = C.due({jobs:[job('j', {posting:out})], reels:[reel('r', 'j')], settings:S(), connected:ALL, now:'2026-11-27T15:00:00Z'});
  eq(late.due.map(x => [x.jobId, x.platforms]), [['j', ['instagram', 'facebook']]]);
  eq(C.due({jobs:[job('j', {posting:out})], reels:[reel('r', 'j', {posting:{'instagram/A/reel':{state:'posted'}, 'instagram/A/post':{state:'posted'}, 'facebook/A/reel':{state:'posted'}, 'facebook/A/post':{state:'posted'}}})], settings:S(), connected:ALL, now:'2026-11-27T15:00:00Z'}).due, []);
});
test('due: nothing connected means nothing due', () => {
  eq(C.due({jobs:[job('j')], settings:S(), connected:{}, now:'2026-11-17T15:00:00Z'}).due, []);
});

// ---- Rows (what the screen shows) -------------------------------------------------------------------------------------
test('rows: every state the Publish screen shows', () => {
  const r = C.rows(job('j', {posting:{youtube:{state:'posted', url:'https://www.youtube.com/watch?v=abcdefghijk'}, linkedin:{state:'check', error:'timeout'}, x:{state:'failed', retries:1, retryAt:'2026-11-17T16:00:00Z'}}}),
    reel('r', 'j', {posting:{'instagram/A/reel':{state:'posting'}}}), {settings:S(), connected:{...ALL, facebook:false}, now:'2026-11-17T15:10:00Z'});
  eq(r.map(x => [x.key, x.state, x.text]), [['youtube', 'posted', 'Posted'], ['linkedin', 'look', 'Needs a look'], ['x', 'retry', 'Failed: tries again once, an hour later'], ['instagram', 'posting', 'Posting…'], ['facebook', 'skipped', 'Skipped: not connected']]);
  assert.equal(r[1].why, 'timeout');
  eq(C.rows(job('j', {postTo:{}}), null, {settings:S(), connected:ALL, now:'2026-11-10T00:00:00Z'}).map(x => x.state), ['scheduled', 'scheduled', 'off', 'none', 'none']);
});

// ---- The session's script --------------------------------------------------------------------------------------------
test('posting-plan.mjs: due, plan, schedule and step from files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pp-'));
  const w = (n, v) => { const f = path.join(dir, n); fs.writeFileSync(f, JSON.stringify(v)); return f; };
  const sf = w('s.json', {mode:'auto', time:'15:00', days:['tue', 'thu']}), cf = w('c.json', ALL);
  const jf = w('jobs.json', {docs:[{id:'j', data:{...job('j'), id:undefined}}]}), rf = w('reels.json', [reel('r', 'j')]);
  eq(run(['due', '--settings', sf, '--jobs', jf, '--reels', rf, '--connected', cf, '--now', '2026-11-17T15:00:00Z']).due.map(x => x.jobId), ['j']);
  const p = run(['plan', '--job', w('j.json', job('j')), '--reel', w('r.json', reel('r', 'j')), '--settings', sf, '--connected', cf, '--now', '2026-11-17T15:00:00Z']);
  assert.equal(p.steps[0].act, 'post'); assert.equal(p.reelsId, 'r');
  const sc = run(['schedule', '--job', w('j2.json', {id:'j2', topicId:'t1'}), '--topics', w('t.json', [{id:'t1', recordDate:'2026-11-13'}]), '--settings', sf, '--now', '2026-11-10T12:00:00Z']);
  assert.equal(sc.day, '2026-11-19'); assert.equal(sc.by, 'session');
  assert.equal(run(['step', '--entry', 'null', '--event', 'start', '--data', '{"attemptId":"a"}', '--now', '2026-11-17T15:00:00Z']).state, 'posting');
  // As a command: an illegal move exits 3 and says why.
  const posted = w('e.json', {state:'posted'});
  let code = 0, err = '';
  try { execFileSync(process.execPath, ['scripts/posting-plan.mjs', 'step', '--entry', posted, '--event', 'start', '--data', '{"attemptId":"b"}'], {stdio:'pipe'}); } catch (e) { code = e.status; err = String(e.stderr); }
  assert.equal(code, 3); assert.match(err, /never post twice/);
});
