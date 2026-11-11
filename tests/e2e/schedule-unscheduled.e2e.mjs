// Schedule, "Not scheduled yet" (Taylor's pick B "Next free slot", 11 November 2026), in a real browser against the
// static preview. The clock is fixed to Wednesday 11 November 2026 and the artifact database is a small in-memory
// stand-in (the same shape as watchlist.e2e.mjs), seeded with two booked topics and three waiting ones.
//
//   NODE_PATH=/opt/node-tools/node_modules node tests/e2e/schedule-unscheduled.e2e.mjs [screenshot-dir]
//   (starts python3 -m http.server on PORT, default 8874, when nothing answers there)
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const PORT = Number(process.env.PORT || 8874), BASE = 'http://localhost:'+PORT+'/';
const SHOTS = process.argv[2] || null;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
if (SHOTS) fs.mkdirSync(SHOTS, {recursive:true});

const topic = (title, extra = {}) => ({title, status:'new', notes:'', recordDate:null, postDate:null, deckId:null, createdAt:'2026-11-01T10:00:00Z', updatedAt:'2026-11-01T10:00:00Z', sources:[], points:[], ...extra});
const SEED = {
  'topics/lead': topic('Lead Gen Engine walkthrough', {status:'planned', recordDate:'2026-11-11'}),
  'topics/skills': topic('Claude Code skills, explained', {status:'planned', recordDate:'2026-11-13'}),
  'topics/a': topic('Burst prompting', {status:'shortlisted', sources:[{id:'x1', title:'One', creator:'Someone'}], points:[{id:'p1', title:'Why', note:'', done:false}]}),
  'topics/b': topic('The 15-minute prompt'),
  'topics/c': topic('Adjusting your mindset to being an orchestrator in AI'),
};

function mock(seed) {
  const docs = new Map(Object.entries(seed)), colSubs = new Map(), docSubs = new Map();
  const snapOf = k => ({id:k.split('/').pop(), exists:docs.has(k), data:() => docs.get(k)});
  const fire = (col, k) => {
    for (const fn of colSubs.get(col) || []) fn({docs:[...docs.keys()].filter(x => x.startsWith(col+'/')).map(snapOf)});
    for (const fn of docSubs.get(k) || []) fn(snapOf(k));
  };
  const ref = (col, id) => { const k = col+'/'+id; return {
    id, get: async () => snapOf(k),
    set: async v => { docs.set(k, JSON.parse(JSON.stringify(v))); setTimeout(() => fire(col, k)); },
    update: async v => { docs.set(k, {...(docs.get(k) || {}), ...JSON.parse(JSON.stringify(v))}); setTimeout(() => fire(col, k)); },
    delete: async () => { docs.delete(k); setTimeout(() => fire(col, k)); },
    onSnapshot: next => { docSubs.set(k, [...(docSubs.get(k) || []), next]); setTimeout(() => next(snapOf(k))); return () => {}; }}; };
  const db = {collection: col => ({doc: id => ref(col, id), onSnapshot: next => { colSubs.set(col, [...(colSubs.get(col) || []), next]); setTimeout(() => next({docs:[...docs.keys()].filter(x => x.startsWith(col+'/')).map(snapOf)})); return () => {}; }}),
    doc: p => { const parts = p.split('/'); return ref(parts[0], parts[1]); }};
  const mcp = {callTool: async () => { throw {code:'not_granted'}; }, listTools: async () => [], watchTool: () => () => {}};
  window.claude = {use: async name => name === 'db' ? db : name === 'mcp' ? mcp : null};
  window.__mock = {get: k => docs.get(k), set: (col, id, v) => ref(col, id).update(v)};
}

const OURS = fs.readFileSync(path.join(ROOT, 'public/topics.js'), 'utf8');
async function serverUp() { try { const r = await fetch(BASE+'topics.js'); if (!r.ok) return false; if (await r.text() !== OURS) throw new Error('Port '+PORT+' serves another checkout; set PORT to a free port.'); return true; } catch (e) { if (/another checkout/.test(e.message)) throw e; return false; } }
let server = null;
if (!await serverUp()) {
  server = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', path.join(ROOT, 'public')], {stdio:'ignore'});
  for (let i = 0; i < 50 && !await serverUp(); i++) await new Promise(r => setTimeout(r, 100));
}

const browser = await chromium.launch();
const problems = [];

async function open(width, opts = {}) {
  const context = await browser.newContext({viewport:{width, height:900}, ...opts});
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date(2026, 10, 11, 10, 0, 0));
  await page.route(/\/uploads\.json(\?.*)?$/, route => route.fulfill({contentType:'application/json', body:JSON.stringify({fetchedAt:new Date(2026, 10, 11).toISOString(), docs:[]})}));
  await page.addInitScript(mock, SEED);
  page.on('pageerror', e => problems.push(width+'px page error: '+e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) problems.push(width+'px console: '+m.text()); });
  await page.goto(BASE+'#/schedule');
  await page.waitForSelector('#tp-unscheduled .tp-book:not([disabled])');
  return {page, context};
}
const block = page => page.locator('.tp-main');
const books = page => page.locator('#tp-unscheduled .tp-book').allInnerTexts();
const posts = page => page.locator('#tp-unscheduled .tp-card-post').allInnerTexts();
const db = (page, id) => page.evaluate(k => window.__mock.get(k), 'topics/'+id);
async function noSideScroll(page, where) {
  const m = await page.evaluate(() => ({sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth}));
  if (m.sw > m.cw) problems.push(where+': scrollWidth '+m.sw+' > clientWidth '+m.cw);
}
async function targets(page, where) {
  const small = await page.evaluate(() => [...document.querySelectorAll('.tp-main button, .tp-main a, .tp-main select')]
    .filter(e => e.offsetParent).map(e => ({t:(e.innerText || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 30), h:e.getBoundingClientRect().height})).filter(x => x.h < 43.5));
  if (small.length) problems.push(where+': press targets under 44px: '+JSON.stringify(small));
}
async function distinct(page, where) {
  const list = await books(page);
  assert.equal(new Set(list).size, list.length, where+': two buttons name the same day: '+list.join(', '));
}
const shot = async (page, name, width) => { if (SHOTS && (width === 390 || width === 1280)) { await sleep(450); await block(page).screenshot({path:path.join(SHOTS, 'schedule-b-'+name+'-'+width+'.png')}); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));

for (const width of [375, 390, 768, 1280]) {
  const {page, context} = await open(width);
  const at = width+'px';
  await page.evaluate(() => document.querySelector('.tp-main').scrollIntoView());

  // Resting: three waiting topics, three different days handed out in order, each with its posting day.
  assert.deepEqual(await books(page), ['Book Mon 16 Nov', 'Book Wed 18 Nov', 'Book Fri 20 Nov'], at);
  assert.deepEqual(await posts(page), ['posts Sat 21 Nov', 'posts Tue 24 Nov', 'posts Thu 26 Nov'], at);
  const ticket = (await page.locator('.tp-next').innerText()).replace(/\s+/g, ' ');
  assert.match(ticket, /Next free( slot)? Mon 16 Nov .*posts Sat 21 Nov/i, at+' ticket: '+ticket);
  const ticketH = (await page.locator('.tp-next').boundingBox()).height;
  if (width < 600 && ticketH > 64) problems.push(at+': the ticket is '+ticketH+'px tall on a phone (one ruled line expected)');
  assert.equal(await page.locator('.tp-ruler').isVisible(), width >= 600, at+' ruler on desktop only');
  await distinct(page, at); await targets(page, at+' resting'); await noSideScroll(page, at+' resting');
  await shot(page, 'resting', width);

  // Pick another day, by mouse: opens in place under the row, aria-expanded follows, the row's own day is left out.
  const toggle = page.locator('#tp-other-b');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false', at);
  await toggle.click();
  await page.waitForSelector('#tp-picker-b');
  assert.equal(await page.locator('#tp-other-b').getAttribute('aria-expanded'), 'true', at);
  const opts = (await page.locator('#tp-picker-b .tp-opt').allInnerTexts()).map(s => s.replace(/\s+/g, ' '));
  assert.ok(opts.some(s => /^Wed 11 Nov posts Tue 17 Nov Swap with “Lead Gen Engine walkthrough”/.test(s)), at+' taken day offers a swap: '+opts.join(' | '));
  assert.ok(opts.some(s => /^Mon 16 Nov posts Sat 21 Nov Free/i.test(s)), at+' free day with its posting day');
  assert.ok(!opts.some(s => /^Wed 18 Nov/.test(s)), at+' the row’s own day is not repeated');
  assert.equal(opts.filter(s => /Free$/i.test(s)).length, 6, at+' six free days');
  assert.equal(await page.evaluate(() => document.activeElement.classList.contains('tp-opt')), true, at+' focus moves into the list');
  await targets(page, at+' picker open'); await noSideScroll(page, at+' picker open');
  await shot(page, 'picker', width);
  await page.locator('#tp-other-b').click();
  assert.equal(await page.locator('#tp-picker-b').count(), 0, at+' second press closes');

  // By keyboard: Enter opens, the arrows move, Escape closes and returns focus to the control.
  await page.locator('#tp-other-b').focus();
  await page.keyboard.press('Enter');
  await page.waitForSelector('#tp-picker-b');
  const first = await page.evaluate(() => document.activeElement.dataset.pickDay);
  await page.keyboard.press('ArrowDown');
  const second = await page.evaluate(() => document.activeElement.dataset.pickDay);
  assert.ok(first && second && second > first, at+' ArrowDown moves to the next day');
  await page.keyboard.press('ArrowUp');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.pickDay), first, at+' ArrowUp moves back');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#tp-picker-b').count(), 0, at+' Escape closes');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'tp-other-b', at+' focus returns to Pick another day');
  assert.equal(await page.locator('#tp-other-b').getAttribute('aria-expanded'), 'false', at);
  // Cancel closes too.
  await page.locator('#tp-other-c').click(); await page.locator('#tp-picker-c [data-pick-close]').click();
  assert.equal(await page.locator('#tp-picker-c').count(), 0, at+' Cancel closes');

  // Book from the picker: the third topic takes Mon 23 Nov (one press), the row turns into its confirmation.
  await page.locator('#tp-other-c').click();
  await page.locator('#tp-picker-c [data-pick-day="2026-11-23"]').click();
  await page.waitForSelector('#tp-undo-c');
  assert.equal((await db(page, 'c')).recordDate, '2026-11-23', at);
  assert.match((await page.locator('#tp-undo-c').locator('xpath=..').innerText()).replace(/\s+/g, ' '), /Booked for Mon 23 Nov · posts Sat 28 Nov\s*Undo/, at);
  assert.deepEqual(await books(page), ['Book Mon 16 Nov', 'Book Wed 18 Nov'], at+' after the picker booking');

  // Book with the ink button: the first topic takes Mon 16 Nov; the next topic's button moves on, never the same day.
  await page.locator('#tp-book-a').click();
  await page.waitForSelector('#tp-undo-a');
  assert.equal((await db(page, 'a')).recordDate, '2026-11-16', at);
  assert.match((await page.locator('#tp-undo-a').locator('xpath=..').innerText()).replace(/\s+/g, ' '), /Booked for Mon 16 Nov · posts Sat 21 Nov\s*Undo/, at);
  assert.deepEqual(await books(page), ['Book Wed 18 Nov'], at+' the remaining topic offers the next free day');
  assert.deepEqual(await page.locator('#tp-unscheduled .tp-card-title').allInnerTexts(), ['Burst prompting', 'The 15-minute prompt', 'Adjusting your mindset to being an orchestrator in AI'], at+' booked rows keep their places');
  assert.match((await page.locator('.tp-next').innerText()).replace(/\s+/g, ' '), /Wed 18 Nov .*posts Tue 24 Nov/i, at+' ticket moves on');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'tp-undo-a', at+' focus lands on Undo');
  assert.equal(await page.locator('#tp-undo-a').locator('xpath=..').getAttribute('data-m'), 'in', at+' the confirmation settles in once');
  await targets(page, at+' booked'); await noSideScroll(page, at+' booked');
  await shot(page, 'booked', width);

  // A database snapshot after the moment never replays it, and the confirmation stays.
  await sleep(450);
  await page.evaluate(() => window.__mock.set('topics', 'lead', {notes:'touched'}));
  await page.waitForFunction(() => window.WWIdeas.data.topics.find(t => t.id === 'lead').notes === 'touched');
  assert.equal(await page.locator('#tp-undo-a').count(), 1, at+' confirmation survives a snapshot');
  assert.equal(await page.locator('.tp-main [data-m]').count(), 0, at+' nothing replays on a snapshot');

  // Undo: the date goes and the status comes back; the rows offer the same days again.
  await page.locator('#tp-undo-a').click();
  await page.waitForSelector('#tp-book-a');
  const a = await db(page, 'a');
  assert.equal(a.recordDate, null, at); assert.equal(a.status, 'shortlisted', at);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'tp-book-a', at+' focus returns to the Book button');
  assert.deepEqual(await books(page), ['Book Mon 16 Nov', 'Book Wed 18 Nov'], at+' after Undo');
  await distinct(page, at+' after Undo');

  // A week change ends the confirmation that is still showing.
  await page.locator('#tp-next').click();
  assert.equal(await page.locator('#tp-undo-c').count(), 0, at+' week change clears the confirmation');

  // The topic panel's recording-day select keeps its own chevron with room for it.
  await page.locator('#tp-unscheduled [data-select="b"]').click();
  const sel = await page.evaluate(() => { const s = getComputedStyle(document.querySelector('#tp-f-record')); return {app:s.appearance, pr:parseFloat(s.paddingRight), bg:s.backgroundImage}; });
  assert.equal(sel.app, 'none', at); assert.ok(sel.pr >= 36, at+' padding-right '+sel.pr); assert.match(sel.bg, /svg/, at);
  if (SHOTS && width === 1280) await page.locator('.tp-field-row').screenshot({path:path.join(SHOTS, 'schedule-b-select-1280.png')});
  await noSideScroll(page, at+' panel');
  await context.close();
}

// A swap goes through the Swap prompt, and Undo puts both topics back.
{
  const {page, context} = await open(1280);
  await page.locator('#tp-other-b').click();
  await page.locator('#tp-picker-b [data-pick-day="2026-11-13"]').click();
  await page.waitForSelector('#ww-confirm[open]');
  assert.match(await page.locator('#ww-confirm-text').innerText(), /Claude Code skills, explained.*already booked.*Swap/, 'swap prompt');
  await page.locator('#ww-confirm-yes').click();
  await page.waitForSelector('#tp-undo-b');
  assert.equal((await db(page, 'b')).recordDate, '2026-11-13'); assert.equal((await db(page, 'skills')).recordDate, null);
  assert.match(await page.locator('#tp-undo-b').locator('xpath=..').innerText(), /swapped with “Claude Code skills, explained”/);
  await page.locator('#tp-undo-b').click();
  await page.waitForSelector('#tp-book-b');
  assert.equal((await db(page, 'b')).recordDate, null); assert.equal((await db(page, 'skills')).recordDate, '2026-11-13');
  await context.close();
}

// Reduced motion: the confirmation lands finished.
{
  const {page, context} = await open(390, {reducedMotion:'reduce'});
  await page.locator('#tp-book-a').click();
  await page.waitForSelector('#tp-undo-a', {timeout:5000}).catch(async e => { console.log(await page.locator('#tp-unscheduled').innerText(), await page.locator('#tp-status').innerText(), await page.evaluate(() => JSON.stringify(window.__mock.get('topics/a')))); throw e; });
  const anim = await page.evaluate(() => getComputedStyle(document.querySelector('#tp-undo-a').parentElement).animationName);
  assert.equal(anim, 'none', 'reduced motion');
  await page.locator('#tp-other-b').click();
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('#tp-picker-b')).animationName), 'none', 'reduced motion picker');
  // Leaving the screen and coming back ends the confirmation.
  await page.evaluate(() => { location.hash = '#/topics'; });
  await page.waitForFunction(() => document.querySelector('#topics').hidden);
  await page.evaluate(() => { location.hash = '#/schedule'; });
  await page.waitForFunction(() => !document.querySelector('#topics').hidden);
  assert.equal(await page.locator('#tp-undo-a').count(), 0, 'route change clears the confirmation');
  await context.close();
}

// Honest empty state.
{
  const context = await browser.newContext({viewport:{width:390, height:900}});
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date(2026, 10, 11, 10, 0, 0));
  await page.route(/\/uploads\.json(\?.*)?$/, route => route.fulfill({contentType:'application/json', body:'{"docs":[]}'}));
  await page.addInitScript(mock, {'topics/lead': SEED['topics/lead']});
  await page.goto(BASE+'#/schedule');
  await page.waitForFunction(() => /Nothing waiting/.test(document.querySelector('#tp-unscheduled').innerText));
  assert.equal(await page.locator('.tp-next').count(), 0, 'no ticket when nothing waits');
  await context.close();
}

await browser.close();
if (server) server.kill();
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('schedule e2e: all checks passed at 375, 390, 768 and 1280px'+(SHOTS ? '; screenshots in '+SHOTS : ''));
