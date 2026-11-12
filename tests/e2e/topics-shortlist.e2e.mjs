// Topics shortlist (Taylor, 12 November 2026): each card offers its own next free Monday, Wednesday or Friday, never a
// booked day, and booking one moves the next card up the queue. Clock fixed to Wednesday 11 November 2026; the 11th
// and 13th are booked, so the two cards must offer Mon 16 and Wed 18.
//
//   NODE_PATH=/opt/node-tools/node_modules node tests/e2e/topics-shortlist.e2e.mjs
//   (starts python3 -m http.server on PORT, default 8876, when nothing answers there)
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const PORT = Number(process.env.PORT || 8876), BASE = 'http://localhost:'+PORT+'/';
const SHOTS = process.argv[2] || null;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
if (SHOTS) fs.mkdirSync(SHOTS, {recursive:true});

const topic = (title, extra = {}) => ({title, status:'new', notes:'', recordDate:null, postDate:null, deckId:null, createdAt:'2026-11-01T10:00:00Z', updatedAt:'2026-11-01T10:00:00Z', sources:[], points:[], ...extra});
const SEED = {
  'topics/lead': topic('Lead Gen Engine walkthrough', {status:'planned', recordDate:'2026-11-11'}),
  'topics/skills': topic('Claude Code skills, explained', {status:'planned', recordDate:'2026-11-13'}),
  'topics/a': topic('Burst prompting', {status:'shortlisted', sources:[{id:'x1', title:'One', creator:'Someone'}], points:[{id:'p1', title:'Why', note:'', done:false}]}),
  'topics/b': topic('I Built an AI That Finds Companies Already Paying for AI', {status:'shortlisted', createdAt:'2026-11-02T10:00:00Z'}),
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


for (const width of [375, 1280]) {
  const context = await browser.newContext({viewport:{width, height:900}});
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date(2026, 10, 11, 10, 0, 0));
  await page.route(/\/uploads\.json(\?.*)?$/, route => route.fulfill({contentType:'application/json', body:JSON.stringify({fetchedAt:new Date(2026, 10, 11).toISOString(), docs:[]})}));
  await page.addInitScript(mock, SEED);
  page.on('pageerror', e => problems.push(width+'px page error: '+e.message));
  await page.goto(BASE+'#/topics');
  await page.waitForSelector('#bs-angles [data-book]');
  const offers = async () => page.$$eval('#bs-angles [data-topic]', els => els.map(e => [e.dataset.topic, [...e.querySelectorAll('[data-book]')].map(b => b.dataset.book)]));
  const before = Object.fromEntries(await offers());
  assert.deepEqual(Object.values(before).flat().sort(), ['2026-11-16', '2026-11-18'], width+'px offers '+JSON.stringify(before));
  for (const days of Object.values(before)) assert.equal(days.length, 1, width+'px one day per card');
  const first = Object.keys(before).find(k => before[k][0] === '2026-11-16');
  await page.click('#bs-angles [data-topic="'+first+'"] [data-book]');
  await page.waitForFunction(id => window.__mock.get('topics/'+id)?.recordDate === '2026-11-16', first);
  await page.waitForFunction(() => document.querySelectorAll('#bs-angles [data-topic]').length === 1);
  const after = await offers();
  assert.deepEqual(after.map(x => x[1]).flat(), ['2026-11-18'], width+'px after booking '+JSON.stringify(after));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0, width+'px overflow');
  await context.close();
}
await browser.close();
if (server) server.kill();
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('topics shortlist e2e: all checks passed at 375 and 1280px');
