// Creator watchlist and Topics' Get ideas, in a real browser against the static preview (11 November 2026).
// The preview has no artifact database, so window.claude is a small in-memory stand-in: `db` (collections, documents,
// live onSnapshot) and `mcp` (create_session answers with a session id, or refuses when told to). uploads.json is
// served by the test with dates relative to now; public/uploads.json is never read or changed.
//
//   python3 -m http.server 8871 --directory public     (or let this script start it: it does when nothing answers)
//   NODE_PATH=/opt/node-tools/node_modules node tests/e2e/watchlist.e2e.mjs [screenshot-dir]
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const PORT = Number(process.env.PORT || 8871), BASE = 'http://localhost:'+PORT+'/';
const SHOTS = process.argv[2] || null;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
if (SHOTS) fs.mkdirSync(SHOTS, {recursive:true});

const creators = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/creators.json'), 'utf8')).creators;
const ago = days => new Date(Date.now() - days*86400000).toISOString();
function uploads({empty = false, extra = []} = {}) {
  const [a, b, c] = creators;
  const vids = empty ? [[a, 'Old one from last week', 9], [b, 'Older still', 20]]
    : [[a, 'Claude agents in production', 1], [b, 'Paid ads that scale', 2], [c, 'The orchestrator mindset', 3], [a, 'Meta Andromeda explained', 9], [b, 'Budget rules for small accounts', 11], [c, 'A month-old look back', 20], ...extra];
  return {fetchedAt:ago(0.5), docs:[a, b, c].map(cr => ({id:cr.handle, data:{handle:cr.handle, name:cr.name, channelId:cr.channelId, fetchedAt:ago(0.5), error:null,
    videos:vids.filter(v => v[0] === cr).map(([, title, d], i) => ({id:'test'+cr.handle.slice(1, 6).replace(/[^A-Za-z0-9]/g, 'x')+Math.round(d*10)+i, title, publishedAt:ago(d), thumb:''}))}}))};
}

// The stand-in for the artifact runtime, installed before any app script runs.
function mock() {
  const docs = new Map(), colSubs = new Map(), docSubs = new Map();
  const snapOf = (k) => ({id:k.split('/').pop(), exists:docs.has(k), data:() => docs.get(k)});
  const fire = (col, k) => {
    for (const fn of colSubs.get(col) || []) fn({docs:[...docs.keys()].filter(x => x.startsWith(col+'/') && x.split('/').length === 2).map(snapOf)});
    for (const fn of docSubs.get(k) || []) fn(snapOf(k));
  };
  const ref = (col, id) => { const k = col+'/'+id; return {
    id, get: async () => snapOf(k),
    set: async v => { docs.set(k, JSON.parse(JSON.stringify(v))); setTimeout(() => fire(col, k)); },
    update: async v => { docs.set(k, {...(docs.get(k) || {}), ...JSON.parse(JSON.stringify(v))}); setTimeout(() => fire(col, k)); },
    delete: async () => { docs.delete(k); setTimeout(() => fire(col, k)); },
    onSnapshot: (next) => { docSubs.set(k, [...(docSubs.get(k) || []), next]); setTimeout(() => next(snapOf(k))); return () => docSubs.set(k, (docSubs.get(k) || []).filter(f => f !== next)); }}; };
  const db = {collection: col => ({doc: id => ref(col, id), onSnapshot: next => { colSubs.set(col, [...(colSubs.get(col) || []), next]); setTimeout(() => next({docs:[...docs.keys()].filter(x => x.startsWith(col+'/')).map(snapOf)})); return () => {}; }}),
    doc: p => { const parts = p.split('/'); return ref(parts[0], parts[1]); }};
  const state = {refuse:false, calls:[]};
  const mcp = {callTool: async (server, tool, input) => {
    state.calls.push({server, tool, input});
    if (state.refuse) throw {code:'not_granted'};
    if (server === 'Claude Code Remote' && tool === 'create_session') return {payload:{session_id:'session_test'+state.calls.length}};
    throw {code:'tool_error'};
  }, listTools: async () => [], watchTool: () => () => {}};
  window.claude = {use: async name => name === 'db' ? db : name === 'mcp' ? mcp : null};
  window.__mock = {docs, state, set: (col, id, v) => ref(col, id).update(v), all: col => [...docs].filter(([k]) => k.startsWith(col+'/')).map(([k, v]) => ({id:k.split('/')[1], ...v}))};
}

// Only a server for this checkout counts: another one on the same port would test someone else's files.
const OURS = fs.readFileSync(path.join(ROOT, 'public/video-ideas.js'), 'utf8');
async function serverUp() { try { const r = await fetch(BASE+'video-ideas.js'); if (!r.ok) return false; if (await r.text() !== OURS) throw new Error('Port '+PORT+' serves another checkout; set PORT to a free port.'); return true; } catch (e) { if (/another checkout/.test(e.message)) throw e; return false; } }
let server = null;
if (!await serverUp()) {
  server = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', path.join(ROOT, 'public')], {stdio:'ignore'});
  for (let i = 0; i < 50 && !await serverUp(); i++) await new Promise(r => setTimeout(r, 100));
}

const browser = await chromium.launch();
const problems = [];

async function open(width, opts = {}) {
  const context = await browser.newContext({viewport:{width, height:900}});
  const page = await context.newPage();
  let feed = uploads(opts);
  await page.route(/\/uploads\.json(\?.*)?$/, route => route.fulfill({contentType:'application/json', body:JSON.stringify(feed)}));
  await page.addInitScript(mock);
  page.on('pageerror', e => problems.push(width+'px page error: '+e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) problems.push(width+'px console: '+m.text()); });
  await page.goto(BASE+'#/watchlist');
  await page.waitForSelector('#video-ideas .vi-tabs');
  return {page, context, setFeed: f => { feed = f; }};
}
async function noSideScroll(page, where) {
  const m = await page.evaluate(() => ({sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth}));
  if (m.sw > m.cw) problems.push(where+': scrollWidth '+m.sw+' > clientWidth '+m.cw);
}
const pressed = page => page.locator('#video-ideas .vi-tabs button[aria-pressed=true]').innerText();
const rows = page => page.locator('#ideas-feed .vi-mail').count();

for (const width of [375, 390, 768, 1280]) {
  const {page, context, setFeed} = await open(width);
  const at = width+'px';
  // Tabs: This week is the default, with counts; each tab shows only its own uploads.
  assert.match(await pressed(page), /^This week\s+3$/, at);
  assert.equal(await rows(page), 3, at);
  const labels = await page.locator('#video-ideas .vi-tabs button').allInnerTexts();
  assert.deepEqual(labels.map(s => s.replace(/\s+/g, ' ')), ['This week 3', 'Last week 2', 'Earlier this month 1', 'All 6'], at);
  await noSideScroll(page, at+' this week');
  if (SHOTS && (width === 390 || width === 1280)) await page.screenshot({path:path.join(SHOTS, 'watchlist-this-week-'+width+'.png'), fullPage:true});
  await page.click('#video-ideas .vi-tabs [data-tab=last]');
  assert.equal(await rows(page), 2, at+' last week');
  await page.click('#video-ideas .vi-tabs [data-tab=all]');
  assert.equal(await rows(page), 6, at+' all');
  assert.equal(await page.locator('#ideas-feed .vi-group h3').count(), 3, at+' all keeps the week headings');
  await page.click('#video-ideas .vi-tabs [data-tab=week]');

  // Search inside the tab, with a way to the tab that has the match.
  await page.fill('#ideas-search', 'andromeda');
  await page.waitForSelector('#ideas-feed .vi-empty');
  assert.match(await page.locator('#ideas-feed .vi-empty').innerText(), /No matches this week\.[\s\S]*1 in Last week/, at);
  await page.click('#ideas-feed .vi-empty [data-tab=last]');
  assert.match(await pressed(page), /^Last week/, at); assert.equal(await rows(page), 1, at);
  await page.fill('#ideas-search', '');
  await page.click('#video-ideas .vi-tabs [data-tab=week]');

  // Seen, Unseen, and Mark all seen with Undo.
  const first = page.locator('#ideas-feed .vi-mail').first();
  await first.locator('[data-seen]').click();
  assert.equal(await page.locator('#ideas-feed .vi-mail').first().locator('[data-unseen]').count(), 1, at+' Unseen shows');
  await page.locator('#ideas-feed .vi-mail').first().locator('[data-unseen]').click();
  assert.equal(await page.locator('#ideas-feed .vi-mail').first().locator('[data-seen]').count(), 1, at+' Seen is back');
  await page.click('#ideas-seen');
  assert.equal(await page.locator('#ideas-feed .vi-mail.is-read').count(), 3, at+' all seen');
  await page.click('#ideas-status [data-undo-seen]');
  assert.equal(await page.locator('#ideas-feed .vi-mail.is-read').count(), 0, at+' undo restores');
  const small = await page.locator('#ideas-feed .vi-mail-actions :is(button,a)').evaluateAll(els => els.filter(e => e.getBoundingClientRect().height < 44).length);
  assert.equal(small, 0, at+' every row action is at least 44px tall');

  // Add to schedule: the next free recording day, planned, with Undo.
  const want = await page.evaluate(() => window.WWStore.posting.nextFreeSlot(window.WWIdeas.data.topics, window.WWStore.posting.today()));
  await page.locator('#ideas-feed .vi-mail').first().locator('[data-book]').click();
  await page.waitForFunction(() => /Booked for/.test(document.querySelector('#ideas-status').textContent));
  const booked = await page.evaluate(() => window.__mock.all('topics'));
  assert.equal(booked.length, 1, at); assert.equal(booked[0].status, 'planned'); assert.equal(booked[0].recordDate, want, at);
  assert.equal(await page.locator('#ideas-status a[href="#/schedule"]').count(), 1, at);
  const say = await page.locator('#ideas-status').innerText();
  assert.match(say, /^Booked for \w{3} \d{1,2} \w{3} · posts \w{3} \d{1,2} \w{3}\./, at+' '+say);
  await noSideScroll(page, at+' after booking');
  await page.click('#ideas-status [data-undo-book]');
  await page.waitForFunction(() => /Undone/.test(document.querySelector('#ideas-status').textContent));
  assert.equal((await page.evaluate(() => window.__mock.all('topics'))).length, 0, at+' undo deletes the topic it made');

  // Refresh: Starting → Fetching uploads → Updated just now · 1 new.
  assert.equal(await page.locator('#ideas-refresh').isDisabled(), false, at+' Refresh is pressable');
  await page.click('#ideas-refresh');
  await page.waitForFunction(() => /Starting a Claude Code session/.test(document.querySelector('#ideas-scan').textContent));
  assert.equal(await page.locator('#ideas-scan a[href^="https://claude.ai/code/session_test"]').count(), 1, at+' session link');
  assert.match(await page.locator('#ideas-refresh').innerText(), /Refreshing/, at);
  const call = await page.evaluate(() => window.__mock.state.calls.at(-1));
  const scanId = call.input.prompt.match(/^Run watchlist scan (\S+)\. Follow SCAN\.md in this repository exactly\.$/)[1];
  assert.equal(call.tool, 'create_session');
  await page.evaluate(id => window.__mock.set('scans', id, {status:'running'}), scanId);
  await page.waitForFunction(() => /Fetching uploads/.test(document.querySelector('#ideas-scan').textContent));
  setFeed(uploads({extra:[[creators[1], 'Brand new upload', 0.1]]}));
  await page.evaluate(id => window.__mock.set('scans', id, {status:'done', finishedAt:new Date().toISOString(), fetched:7}), scanId);
  await page.waitForFunction(() => /Updated just now · 1 new/.test(document.querySelector('#ideas-scan').textContent));
  assert.match(await pressed(page), /^This week\s+4$/, at+' the new upload is drawn');
  await noSideScroll(page, at+' after refresh');
  if (SHOTS && width === 390) await page.screenshot({path:path.join(SHOTS, 'watchlist-refreshed-390.png'), fullPage:false});

  // Refused: the plain line to send instead.
  await page.evaluate(() => { window.__mock.state.refuse = true; });
  await page.click('#ideas-refresh');
  await page.waitForFunction(() => /Send this in a Claude chat/.test(document.querySelector('#ideas-scan').textContent));
  assert.match(await page.locator('#ideas-scan code').innerText(), /^Run watchlist scan \S+$/, at);
  await noSideScroll(page, at+' refused');
  if (SHOTS && width === 1280) await page.screenshot({path:path.join(SHOTS, 'watchlist-refused-1280.png'), clip:{x:0, y:0, width:1280, height:700}});
  await page.evaluate(() => { window.__mock.state.refuse = false; });

  // Topics > Skill ideas > Get ideas starts a session; the copy line only when refused.
  await page.goto(BASE+'#/topics');
  await page.waitForSelector('#brainstorm:not([hidden])');
  await page.click('#brainstorm [data-view=skill]');
  await page.click('#bs-ask');
  await page.waitForFunction(() => /Claude is finding ideas/.test(document.querySelector('#bs-sparks').textContent));
  assert.equal(await page.locator('#bs-sparks a.bs-session').count(), 1, at+' session link on Get ideas');
  assert.equal(await page.locator('#bs-sparks [data-copy]').count(), 0, at+' no copy line when it started');
  const ideaCall = await page.evaluate(() => window.__mock.state.calls.at(-1));
  const runId = ideaCall.input.prompt.match(/^Run topic ideas (\S+)\. Follow SKILL-IDEAS\.md in this repository exactly\.$/)[1];
  await page.evaluate(id => window.__mock.set('ideaRuns', id, {status:'running'}), runId);
  await page.waitForFunction(() => /The skill is running/.test(document.querySelector('#bs-sparks').textContent));
  await page.evaluate(id => window.__mock.set('ideaRuns', id, {status:'done', finishedAt:new Date().toISOString(), ideas:Array.from({length:10}, (_, i) => ({id:'i'+(i+1), rank:i+1, title:'Idea '+(i+1), why:'Because', source:i % 2 ? 'creator' : 'own'}))}), runId);
  await page.waitForFunction(() => document.querySelectorAll('#bs-sparks .bs-idea').length === 10);
  await page.evaluate(() => { window.__mock.state.refuse = true; });
  await page.click('#bs-ask');
  await page.waitForFunction(() => /could not start by itself/.test(document.querySelector('#bs-sparks').textContent));
  assert.equal(await page.locator('#bs-sparks [data-copy^="Run topic ideas "]').count(), 1, at+' copy line when refused');
  await page.evaluate(() => { window.__mock.state.refuse = false; });
  await page.click('#bs-sparks [data-restart]');
  await page.waitForFunction(() => /Claude is finding ideas/.test(document.querySelector('#bs-sparks').textContent));
  await noSideScroll(page, at+' topics');
  await context.close();
}

// The empty This week tab: the last-checked date and a Refresh action.
for (const width of [390, 1280]) {
  const {page, context} = await open(width, {empty:true});
  const text = await page.locator('#ideas-feed .vi-empty').innerText();
  assert.match(text, /No uploads this week yet\.[\s\S]*Last checked \w{3} \d{1,2} \w{3}\./, width+'px');
  assert.equal(await page.locator('#ideas-feed .vi-empty [data-refresh]').count(), 1);
  await noSideScroll(page, width+'px empty');
  if (SHOTS) await page.screenshot({path:path.join(SHOTS, 'watchlist-empty-'+width+'.png'), fullPage:false});
  await context.close();
}

// Reduced motion: the tab underline lands finished.
{
  const context = await browser.newContext({viewport:{width:390, height:900}, reducedMotion:'reduce'});
  const page = await context.newPage();
  await page.route(/\/uploads\.json(\?.*)?$/, route => route.fulfill({contentType:'application/json', body:JSON.stringify(uploads())}));
  await page.addInitScript(mock);
  page.on('pageerror', e => problems.push('reduced motion page error: '+e.message));
  await page.goto(BASE+'#/watchlist'); await page.waitForSelector('#video-ideas .vi-tabs');
  await page.click('#video-ideas .vi-tabs [data-tab=last]');
  const anim = await page.evaluate(() => getComputedStyle(document.querySelector('.vi-tabs [aria-pressed=true]'), '::after').animationName);
  assert.equal(anim, 'none');
  await context.close();
}

await browser.close();
if (server) server.kill();
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('watchlist e2e: all checks passed at 375, 390, 768 and 1280px'+(SHOTS ? '; screenshots in '+SHOTS : ''));
