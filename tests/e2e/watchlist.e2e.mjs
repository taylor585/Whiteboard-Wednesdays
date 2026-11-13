// Inspiration (#/watchlist), A3 "Depth by paper" (13 November 2026), in a real browser against the static preview.
// The preview has no artifact database, so window.claude is a small in-memory stand-in: `db` (collections, documents,
// live onSnapshot) and `mcp` (create_session answers with a session id, refuses when told to, or hangs until released).
// uploads.json is served by the test with dates relative to now; public/uploads.json is never read or changed.
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
function uploads({extra = []} = {}) {
  const [a, b, c] = creators;
  const vids = [[a, 'Claude agents in production', 1], [b, 'Paid ads that scale', 2], [c, 'The orchestrator mindset', 3], [a, 'Meta Andromeda explained', 9], [b, 'Budget rules for small accounts', 11], [c, 'A month-old look back', 20], ...extra];
  return {fetchedAt:ago(0.5), docs:[a, b, c].map(cr => ({id:cr.handle, data:{handle:cr.handle, name:cr.name, channelId:cr.channelId, fetchedAt:ago(0.5), error:null,
    videos:vids.filter(v => v[0] === cr).map(([, title, d], i) => ({id:'test'+cr.handle.slice(1, 6).replace(/[^A-Za-z0-9]/g, 'x')+Math.round(d*10)+i, title, publishedAt:ago(d), thumb:''}))}}))};
}
const POINTS = n => ['First point of '+n, 'Second point of '+n, 'Third point of '+n, 'Fourth point of '+n];
const IDEAS = Array.from({length:10}, (_, i) => ({id:'i'+(i+1), rank:i+1, title:'Idea '+(i+1)+' from the skill', why:'Because of [[evidence '+(i+1)+']].', source:['x','work','creator'][i % 3], tag:'tag '+(i+1), points:POINTS(i+1)}));

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
  const state = {refuse:false, hang:false, waiting:[], calls:[]};
  const mcp = {callTool: async (server, tool, input) => {
    state.calls.push({server, tool, input});
    if (state.hang) await new Promise(resolve => state.waiting.push(resolve));
    if (state.refuse) throw {code:'not_granted'};
    if (server === 'Claude Code Remote' && tool === 'create_session') return {payload:{session_id:'session_test'+state.calls.length}};
    throw {code:'tool_error'};
  }, listTools: async () => [], watchTool: () => () => {}};
  window.claude = {use: async name => name === 'db' ? db : name === 'mcp' ? mcp : null};
  window.__mock = {docs, state, release: () => { state.hang = false; for (const r of state.waiting.splice(0)) r(); },
    set: (col, id, v) => ref(col, id).update(v), all: col => [...docs].filter(([k]) => k.startsWith(col+'/')).map(([k, v]) => ({id:k.split('/')[1], ...v}))};
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
  const context = await browser.newContext({viewport:{width, height:900}, reducedMotion:opts.reducedMotion || 'no-preference'});
  const page = await context.newPage();
  let feed = uploads(opts);
  if (opts.clock) await page.clock.install();
  await page.route(/\/uploads\.json(\?.*)?$/, route => route.fulfill({contentType:'application/json', body:JSON.stringify(feed)}));
  await page.addInitScript(mock);
  page.on('pageerror', e => problems.push(width+'px page error: '+e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) problems.push(width+'px console: '+m.text()); });
  await page.goto(BASE+(opts.hash || '#/watchlist'));
  if (!opts.hash) await page.waitForSelector('#ideas-stream .vi-group[data-group=refresh] .vi-card');
  return {page, context, setFeed: f => { feed = f; }};
}
async function noSideScroll(page, where) {
  const m = await page.evaluate(() => ({sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth}));
  if (m.sw > m.cw) problems.push(where+': scrollWidth '+m.sw+' > clientWidth '+m.cw);
}
// Every visible text on the screen is 11px or larger.
async function textSizes(page, where) {
  const small = await page.evaluate(() => {
    const out = [], w = document.createTreeWalker(document.querySelector('#video-ideas'), NodeFilter.SHOW_TEXT); let t;
    while ((t = w.nextNode())) { const s = t.textContent.trim(); if (!s) continue; const el = t.parentElement, r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      if (!r.width || cs.visibility === 'hidden' || el.closest('[hidden],.vi-sr')) continue; if (parseFloat(cs.fontSize) < 11) out.push(s.slice(0, 30)+' '+cs.fontSize); }
    return out;
  });
  if (small.length) problems.push(where+': text under 11px: '+small.slice(0, 5).join(' | '));
}
const lanes = page => page.$$eval('#ideas-lanes button', els => els.map(e => e.innerText.replace(/\s+/g, ' ')));
const uploadCards = page => page.locator('#ideas-stream [data-group=refresh] .vi-cards:not(.is-gone) .vi-card').count();
const groupText = (page, sel) => page.locator('#ideas-stream '+sel).first().innerText();
const askDoc = page => page.evaluate(() => window.__mock.all('ideaRuns').sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0]);

for (const width of [375, 390, 768, 1280]) {
  const {page, context, setFeed} = await open(width, {clock:true});
  const at = width+'px';

  // Hero: eyebrow, title, the paper field with Refresh creators and Ask, five chips, the cost line, the creators link.
  assert.equal(await page.locator('#ideas-heading').innerText(), 'What should we make next?', at);
  assert.equal(await page.locator('#video-ideas .vi-title .micro').innerText(), 'INSPIRATION', at);
  assert.deepEqual((await page.$$eval('#ideas-chips button', els => els.map(e => e.innerText.replace(/\s+/g, ' ').trim()))), ['This week’s 7', 'What the giants said on X', 'From my work', 'Creator breakouts', 'Plan the month (30)LONGER RUN'], at);
  assert.match(await page.locator('#ideas-cost').innerText(), /Ask: about 15 minutes, about \$20 · Refresh: about 2 minutes/, at);
  assert.match(await page.locator('#ideas-who-n').innerText(), new RegExp('^'+creators.length+' creators$'), at);
  assert.equal(await page.locator('#ideas-q').getAttribute('placeholder'), 'Ask for ideas, or press Refresh creators', at);
  await page.click('#ideas-who-btn');
  assert.equal(await page.locator('#ideas-grid a[href^="#/creator/"]').count(), creators.length, at+' creators drawer');
  await page.click('#ideas-drawer-close');
  await noSideScroll(page, at+' resting'); await textSizes(page, at+' resting');

  // Filters and the week selector: This week by default with its 3 uploads, then Last week, then All.
  assert.deepEqual(await lanes(page), ['All 3', 'Creators 3', 'Skill 0', 'My work 0', 'X giants 0'], at);
  assert.equal(await uploadCards(page), 3, at);
  await page.selectOption('#ideas-week', 'last');
  assert.equal(await uploadCards(page), 2, at+' last week');
  await page.selectOption('#ideas-week', 'all');
  assert.equal(await uploadCards(page), 3, at+' all, first three');
  await page.click('#ideas-stream [data-more=refresh]');
  assert.equal(await uploadCards(page), 6, at+' all, shown in full');
  await page.selectOption('#ideas-week', 'week');

  // Dismiss on an upload (the old Seen), with Undo and with Unseen from the dismissed list.
  await page.locator('#ideas-stream [data-group=refresh] [data-seen]').first().click();
  assert.equal(await uploadCards(page), 2, at+' dismissed');
  assert.match(await groupText(page, '.vi-gone-line'), /1 dismissed/, at);
  await page.click('#ideas-status [data-undo]');
  assert.equal(await uploadCards(page), 3, at+' undo');
  await page.locator('#ideas-stream [data-group=refresh] [data-seen]').first().click();
  await page.click('#ideas-stream [data-gone=refresh]');
  await page.click('#ideas-stream [data-unseen]');
  assert.equal(await uploadCards(page), 3, at+' unseen');
  const small = await page.locator('#ideas-stream .vi-acts :is(button,a)').evaluateAll(els => els.filter(e => e.getBoundingClientRect().height < 44).length);
  assert.equal(small, 0, at+' every card action is at least 44px tall');

  // Spark on an upload: a shortlisted topic with the video as its source; the card says In Topics.
  const firstVideo = await page.locator('#ideas-stream [data-group=refresh] .vi-card').first().getAttribute('data-video');
  await page.click('#ideas-stream [data-spark="'+firstVideo+'"]');
  await page.waitForFunction(id => window.__mock.all('topics').some(t => t.sources?.[0]?.id === id), firstVideo);
  let topics = await page.evaluate(() => window.__mock.all('topics'));
  assert.equal(topics.length, 1, at); assert.equal(topics[0].status, 'shortlisted', at+' spark lands on the shortlist');
  await page.waitForSelector('#ideas-stream [data-video="'+firstVideo+'"].is-in .vi-in');

  // Add to schedule on an upload: the next free recording day, planned, with Undo.
  const want = await page.evaluate(() => window.WWStore.posting.nextFreeSlot(window.WWIdeas.data.topics, window.WWStore.posting.today()));
  const second = await page.locator('#ideas-stream [data-group=refresh] .vi-card:not(.is-in)').first().getAttribute('data-video');
  await page.click('#ideas-stream [data-book="'+second+'"]');
  await page.waitForFunction(() => /Booked for/.test(document.querySelector('#ideas-status').textContent));
  topics = await page.evaluate(() => window.__mock.all('topics'));
  const booked = topics.find(t => t.sources?.[0]?.id === second);
  assert.equal(booked.status, 'planned', at); assert.equal(booked.recordDate, want, at);
  assert.match(await page.locator('#ideas-status').innerText(), /^Booked for \w{3} \d{1,2} \w{3} · posts \w{3} \d{1,2} \w{3}\./, at);
  await page.click('#ideas-status [data-undo]');
  await page.waitForFunction(() => /Undone/.test(document.querySelector('#ideas-status').textContent));
  assert.equal((await page.evaluate(() => window.__mock.all('topics'))).length, 1, at+' undo deletes the topic it made');

  // A chip fills the field and sets the mode; Ask saves the prompt and the mode and starts the session.
  await page.click('#ideas-chips [data-chip=giants]');
  assert.equal(await page.inputValue('#ideas-q'), 'What the giants said on X', at);
  assert.equal(await page.locator('#ideas-chips [data-chip=giants]').getAttribute('aria-pressed'), 'true', at);
  await page.fill('#ideas-q', 'Agent memory, from the giants');
  await page.click('#ideas-ask');
  await page.waitForFunction(() => window.__mock.all('ideaRuns').length === 1);
  let run = await askDoc(page);
  assert.equal(run.prompt, 'Agent memory, from the giants', at); assert.equal(run.mode, 'giants', at); assert.equal(run.count, 10, at);
  const call = await page.evaluate(() => window.__mock.state.calls.at(-1));
  assert.equal(call.tool, 'create_session', at);
  assert.equal(call.input.prompt, 'Run topic ideas '+run.id+'. Follow SKILL-IDEAS.md in this repository exactly.', at);
  const askSel = '[data-group="ask:'+run.id+'"]';
  await page.waitForFunction(sel => /Starting/.test(document.querySelector('#ideas-stream '+sel)?.textContent || ''), askSel);
  assert.equal(await page.locator('#ideas-stream '+askSel+' a[href^="https://claude.ai/code/session_test"]').count(), 1, at+' session link');
  assert.match(await groupText(page, askSel+' .vi-gp'), /^ASK\s+Agent memory, from the giants$/, at);
  await page.evaluate(id => window.__mock.set('ideaRuns', id, {status:'running'}), run.id);
  await page.waitForFunction(sel => /Running · \d\d:\d\d of about 15 minutes/.test(document.querySelector('#ideas-stream '+sel).textContent), askSel);
  assert.match(await page.locator('#ideas-ask').innerText(), /Asking/, at);
  assert.match(await page.locator('#ideas-cost').innerText(), /^Asking now/, at);
  assert.match(await groupText(page, askSel), /You can leave this page/, at);
  await noSideScroll(page, at+' running'); await textSizes(page, at+' running');
  if (SHOTS && (width === 390 || width === 1280)) await page.screenshot({path:path.join(SHOTS, 'e2e-running-'+width+'.png'), fullPage:false});

  // Done: idea cards ranked, three shown, each with 4 talking points that open in place.
  await page.evaluate(([id, ideas]) => window.__mock.set('ideaRuns', id, {status:'done', finishedAt:new Date().toISOString(), ideas}), [run.id, IDEAS]);
  await page.waitForFunction(sel => document.querySelectorAll('#ideas-stream '+sel+' .vi-card.is-idea').length === 3, askSel);
  assert.match(await groupText(page, askSel), /Done · 10 ideas/, at);
  assert.match(await groupText(page, askSel+' [data-more]'), /Show 7 more ideas/, at);
  assert.deepEqual(await lanes(page), ['All 13', 'Creators 3', 'Skill 10', 'My work 3', 'X giants 4'], at);
  const firstIdea = page.locator('#ideas-stream '+askSel+' .vi-card[data-idea=i1]');
  assert.equal(await firstIdea.locator('mark').innerText(), 'evidence 1', at+' evidence words marked');
  assert.match(await firstIdea.locator('summary').innerText(), /4 talking points/, at);
  assert.equal(await firstIdea.locator('.vi-tp li').first().isVisible(), false, at+' closed');
  await firstIdea.locator('summary').click();
  assert.deepEqual(await firstIdea.locator('.vi-tp li').allInnerTexts(), POINTS(1), at+' open in place');
  await page.evaluate(id => window.__mock.set('ideaRuns', id, {note:'A snapshot'}), run.id);   // a redraw keeps them open
  await page.waitForFunction(sel => /A snapshot/.test(document.querySelector('#ideas-stream '+sel).textContent), askSel);
  assert.equal(await firstIdea.locator('.vi-tp').getAttribute('open'), '', at+' still open after a snapshot');
  assert.match(await page.locator('#ideas-cost').innerText(), /^Last Ask just now, 10 ideas below/, at);

  // Spark on an idea: shortlisted, title word for word, its 4 points copied; the card shows In Topics.
  await firstIdea.locator('[data-spark-idea]').click();
  await page.waitForFunction(() => window.__mock.all('topics').some(t => t.origin?.ideaId === 'i1'));
  const sparked = (await page.evaluate(() => window.__mock.all('topics'))).find(t => t.origin?.ideaId === 'i1');
  assert.equal(sparked.title, IDEAS[0].title, at); assert.equal(sparked.status, 'shortlisted', at);
  assert.deepEqual(sparked.points.map(p => p.title), POINTS(1), at+' points copied');
  await page.waitForSelector('#ideas-stream '+askSel+' .vi-card[data-idea=i1].is-in .vi-in');

  // Add to schedule on an idea: booked on the next free day.
  const want2 = await page.evaluate(() => window.WWStore.posting.nextFreeSlot(window.WWIdeas.data.topics, window.WWStore.posting.today()));
  await page.click('#ideas-stream '+askSel+' [data-book-idea=i2]');
  await page.waitForFunction(() => window.__mock.all('topics').some(t => t.origin?.ideaId === 'i2'));
  const bookedIdea = (await page.evaluate(() => window.__mock.all('topics'))).find(t => t.origin?.ideaId === 'i2');
  assert.equal(bookedIdea.recordDate, want2, at); assert.equal(bookedIdea.status, 'planned', at); assert.equal(bookedIdea.points.length, 4, at);

  // Dismiss on an idea: saved on the run as dismissed, the card leaves, Undo brings it back.
  await page.click('#ideas-stream '+askSel+' [data-dismiss-idea=i3]');
  await page.waitForFunction(id => window.__mock.all('ideaRuns').find(r => r.id === id)?.dismissed?.i3 === true, run.id);
  await page.waitForFunction(sel => !document.querySelector('#ideas-stream '+sel+' .vi-cards:not(.is-gone) [data-idea=i3]'), askSel);
  await page.click('#ideas-status [data-undo]');
  await page.waitForFunction(id => !window.__mock.all('ideaRuns').find(r => r.id === id)?.dismissed?.i3, run.id);
  await page.waitForSelector('#ideas-stream '+askSel+' [data-idea=i3]');

  // Lanes: My work and X giants show only their ideas; Creators only the uploads.
  await page.click('#ideas-lanes [data-lane=mywork]');
  assert.deepEqual(await page.$$eval('#ideas-stream .vi-card.is-idea', els => [...new Set(els.map(e => e.querySelector('.vi-src b').textContent))]), ['My work'], at);
  assert.equal(await page.locator('#ideas-stream [data-group=refresh]').count(), 0, at);
  await page.click('#ideas-lanes [data-lane=x]');
  assert.deepEqual(await page.$$eval('#ideas-stream .vi-card.is-idea', els => [...new Set(els.map(e => e.querySelector('.vi-src b').textContent))]), ['X giants'], at);
  await page.click('#ideas-lanes [data-lane=creators]');
  assert.equal(await page.locator('#ideas-stream .vi-card.is-idea').count(), 0, at);
  assert.equal(await page.locator('#ideas-stream [data-group=refresh]').count(), 1, at);
  await page.click('#ideas-lanes [data-lane=all]');
  await noSideScroll(page, at+' results'); await textSizes(page, at+' results');
  if (SHOTS && (width === 390 || width === 1280)) await page.screenshot({path:path.join(SHOTS, 'e2e-results-'+width+'.png'), fullPage:true});

  // Phones: once the hero's field has scrolled away, it docks at the foot like a composer. Wider screens never dock.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(150);
  if (width <= 720) {
    await page.waitForSelector('#ideas-dock:not([hidden])');
    const box = await page.locator('#ideas-dock').boundingBox();
    assert.ok(Math.abs(box.y + box.height - 900) < 2, at+' dock sits at the foot');
    await page.fill('#ideas-dq', 'typed in the dock');
    assert.equal(await page.inputValue('#ideas-q'), 'typed in the dock', at+' one field');
    await page.fill('#ideas-dq', '');
    const chipScroll = await page.$eval('#ideas-chips', el => ({sw:el.scrollWidth, cw:el.clientWidth, ox:getComputedStyle(el).overflowX}));
    assert.ok(chipScroll.ox === 'auto' && chipScroll.sw > chipScroll.cw, at+' chips scroll inside themselves');
  } else assert.equal(await page.locator('#ideas-dock').isHidden(), true, at+' no dock');
  await page.evaluate(() => window.scrollTo(0, 0));

  // Refresh creators: scans/<id>, Running with the estimate, then Done with the new upload.
  await page.click('#ideas-refresh');
  await page.waitForFunction(() => window.__mock.all('scans').length === 1);
  const scanId = (await page.evaluate(() => window.__mock.all('scans')))[0].id;
  assert.match((await page.evaluate(() => window.__mock.state.calls.at(-1))).input.prompt, new RegExp('^Run watchlist scan '+scanId+'\\. Follow SCAN\\.md'), at);
  await page.evaluate(id => window.__mock.set('scans', id, {status:'running'}), scanId);
  await page.waitForFunction(() => /Running · \d\d:\d\d of about 2 minutes/.test(document.querySelector('#ideas-stream [data-group=refresh]').textContent));
  assert.match(await groupText(page, '[data-group=refresh]'), /Earlier result · stays until the new one lands/i, at);
  setFeed(uploads({extra:[[creators[1], 'Brand new upload', 0.1]]}));
  await page.evaluate(id => window.__mock.set('scans', id, {status:'done', finishedAt:new Date().toISOString(), fetched:7}), scanId);
  await page.waitForFunction(() => /Done · 1 new upload\b/.test(document.querySelector('#ideas-stream [data-group=refresh]').textContent));
  assert.match((await lanes(page))[1], /^Creators 4$/, at+' the new upload is counted');

  // The connector does not answer: Starting, then after 5 s "Waiting for Claude", then after 60 s the fallback with the
  // line to send, Copy and Try again. When the call answers later, the group moves on.
  await page.evaluate(() => { window.__mock.state.hang = true; });
  await page.fill('#ideas-q', '');
  await page.click('#ideas-ask');
  await page.waitForFunction(() => window.__mock.all('ideaRuns').length === 2);
  run = await askDoc(page);
  assert.equal(run.mode, 'week7', at+' an empty Ask is This week’s 7'); assert.equal(run.count, 7, at); assert.equal(run.prompt, '', at);
  const hangSel = '[data-group="ask:'+run.id+'"]';
  await page.waitForFunction(sel => /Starting/.test(document.querySelector('#ideas-stream '+sel)?.textContent || ''), hangSel);
  await page.clock.fastForward(6000);
  await page.waitForFunction(sel => /Waiting for Claude to allow the Claude Code connection/.test(document.querySelector('#ideas-stream '+sel).textContent), hangSel);
  assert.doesNotMatch(await groupText(page, hangSel), /Running/, at+' nothing says running before a session starts');
  await page.clock.fastForward(60000);
  await page.waitForFunction(sel => /Not started/.test(document.querySelector('#ideas-stream '+sel).textContent), hangSel);
  assert.equal(await page.locator('#ideas-stream '+hangSel+' code').innerText(), 'Run topic ideas '+run.id, at);
  assert.equal(await page.locator('#ideas-stream '+hangSel+' [data-copy]').count(), 1, at);
  assert.equal(await page.locator('#ideas-stream '+hangSel+' [data-again]').count(), 1, at);
  assert.match(await groupText(page, hangSel), /If it later starts by itself/, at);
  await page.waitForFunction(id => window.__mock.all('ideaRuns').find(r => r.id === id)?.status === 'waiting', run.id);
  await noSideScroll(page, at+' fallback');
  if (SHOTS && (width === 390 || width === 1280)) await page.locator('#ideas-stream '+hangSel).screenshot({path:path.join(SHOTS, 'e2e-fallback-'+width+'.png')});
  await page.evaluate(() => window.__mock.release());
  await page.waitForFunction(id => window.__mock.all('ideaRuns').find(r => r.id === id)?.status === 'starting', run.id);
  await page.waitForFunction(sel => /Starting · a Claude Code session is starting/.test(document.querySelector('#ideas-stream '+sel).textContent), hangSel);

  // Refused: Not started, the reason, the line to send and how to allow it.
  await page.evaluate(id => window.__mock.set('ideaRuns', id, {status:'done', ideas:[]}), run.id);
  await page.evaluate(() => { window.__mock.state.refuse = true; });
  await page.click('#ideas-ask');
  await page.waitForFunction(() => window.__mock.all('ideaRuns').length === 3);
  run = await askDoc(page);
  const refusedSel = '[data-group="ask:'+run.id+'"]';
  await page.waitForFunction(sel => /You did not allow the Claude Code connection/.test(document.querySelector('#ideas-stream '+sel)?.textContent || ''), refusedSel);
  assert.equal(await page.locator('#ideas-stream '+refusedSel+' a[href="#/settings/connections/claudecode"]').count(), 1, at);
  await page.evaluate(() => { window.__mock.state.refuse = false; });
  await page.click('#ideas-stream '+refusedSel+' [data-again]');
  await page.waitForFunction(id => window.__mock.all('ideaRuns').find(r => r.id === id)?.status === 'starting', run.id);
  await noSideScroll(page, at+' end');
  await context.close();
}

// Leaving and returning mid-run restores the running group from the database.
{
  const {page, context} = await open(1280);
  await page.evaluate(() => window.__mock.set('scans', '2026-11-13-zzzzz', {status:'running', createdAt:new Date().toISOString(), session:{startedAt:new Date().toISOString(), url:'https://claude.ai/code/session_back'}}));
  await page.evaluate(() => { location.hash = '#/topics'; });
  await page.waitForSelector('#brainstorm:not([hidden])');
  await page.evaluate(() => { location.hash = '#/watchlist'; });
  await page.waitForFunction(() => /Running/.test(document.querySelector('#ideas-stream [data-group=refresh]')?.textContent || ''));
  assert.equal(await page.locator('#ideas-stream [data-group=refresh] a[href="https://claude.ai/code/session_back"]').count(), 1);
  await context.close();
}

// Arrival: the ordered entrance plays on a real screen arrival only; a database snapshot never replays it.
{
  const {page, context} = await open(1280, {hash:'#/library'});
  await page.waitForSelector('#library:not([hidden])');
  await page.evaluate(() => { location.hash = '#/watchlist'; });
  await page.waitForSelector('#video-ideas[data-enter=screen]');
  const playing = await page.evaluate(() => ({chip:getComputedStyle(document.querySelector('#ideas-chips button')).animationName, sheet:getComputedStyle(document.querySelector('.vi-cfw .vi-sheet')).animationName}));
  assert.equal(playing.chip, 'm-in'); assert.equal(playing.sheet, 'm-sheet');
  await page.waitForFunction(() => !document.querySelector('#video-ideas').hasAttribute('data-enter'));
  await page.evaluate(() => window.__mock.set('scans', '2026-11-13-yyyyy', {status:'done', createdAt:new Date().toISOString()}));
  await page.waitForTimeout(100);
  const after = await page.evaluate(() => ({enter:document.querySelector('#video-ideas').hasAttribute('data-enter'), chip:getComputedStyle(document.querySelector('#ideas-chips button')).animationName, groups:[...document.querySelectorAll('#ideas-stream .vi-group')].map(g => getComputedStyle(g).animationName)}));
  assert.equal(after.enter, false); assert.equal(after.chip, 'none'); assert.ok(after.groups.every(n => n === 'none'), 'no replay on a snapshot');
  await context.close();
}

// Reduced motion: everything lands finished, and the lane underline does not draw.
{
  const {page, context} = await open(390, {hash:'#/library', reducedMotion:'reduce'});
  await page.waitForSelector('#library:not([hidden])');
  await page.evaluate(() => { location.hash = '#/watchlist'; });
  await page.waitForSelector('#ideas-stream .vi-group');
  const anim = await page.evaluate(() => [...document.querySelectorAll('#ideas-chips button,.vi-cfw .vi-sheet,.vi-cf,.vi-title h1,#ideas-stream .vi-group')].map(e => getComputedStyle(e).animationName).filter(n => n !== 'none'));
  assert.deepEqual(anim, []);
  await page.click('#ideas-lanes [data-lane=creators]');
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('#ideas-lanes [aria-pressed=true]'), '::after').animationName), 'none');
  await context.close();
}

await browser.close();
if (server) server.kill();
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('inspiration e2e: all checks passed at 375, 390, 768 and 1280px'+(SHOTS ? '; screenshots in '+SHOTS : ''));
