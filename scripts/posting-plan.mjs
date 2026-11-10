#!/usr/bin/env node
// What a posting session posts, worked out from the same rules the page shows (public/posting-core.js, public/x-count.js
// and the posting-day rule in public/ww-store.js). POSTING.md tells the session when to run each command. Read only:
// it reads JSON files and prints JSON; it never calls a platform, a database or the network.
//
//   node scripts/posting-plan.mjs due      --settings s.json --jobs jobs.json --reels reels.json [--connected c.json] [--now ISO]
//   node scripts/posting-plan.mjs plan     --job job.json [--reel reel.json] --settings s.json [--connected c.json] [--youtube-url URL] [--now ISO]
//   node scripts/posting-plan.mjs schedule --job job.json --topics topics.json --settings s.json [--now ISO]
//   node scripts/posting-plan.mjs step     --entry entry.json|null --event start|ok|fail|unclear|skip|clear [--data '{…}'] [--now ISO]
//
// A file may hold one document, an array of documents, or an ArtifactData listing ({docs: [{id, data}]} or [{id, data}]).
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const PUBLIC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

// The page's own files, loaded as the browser loads them (each sets a global on window).
export function load() {
  const ctx = {Intl, Date, console, CustomEvent:class { constructor(t, o) { this.type = t; this.detail = o?.detail; } }};
  ctx.window = ctx; ctx.self = ctx; ctx.addEventListener = () => {}; ctx.dispatchEvent = () => {};
  vm.createContext(ctx);
  for (const f of ['posting-core.js', 'x-count.js', 'ww-store.js']) vm.runInContext(fs.readFileSync(path.join(PUBLIC, f), 'utf8'), ctx, {filename:f});
  return {core:ctx.WWPostingCore, x:ctx.WWX, posting:ctx.WWStore.posting};
}

const docs = v => { const a = Array.isArray(v) ? v : Array.isArray(v?.docs) ? v.docs : Array.isArray(v?.documents) ? v.documents : v ? [v] : [];
  return a.map(d => d && typeof d === 'object' && d.data && typeof d.data === 'object' && !d.status ? {...d.data, id:d.id ?? d.data.id} : d).filter(Boolean); };

export function run(argv) {
  const [cmd, ...rest] = argv, o = {};
  for (let i = 0; i < rest.length; i += 2) o[rest[i].replace(/^--/, '')] = rest[i + 1];
  const read = k => o[k] && o[k] !== 'null' ? JSON.parse(fs.readFileSync(o[k], 'utf8')) : null;
  const {core, x, posting} = load(), now = o.now || new Date().toISOString();
  const settings = posting.normalise(read('settings')), connected = read('connected') || {};
  if (cmd === 'due') return core.due({jobs:docs(read('jobs')), reels:docs(read('reels')), settings, connected, now});
  if (cmd === 'plan') { const job = docs(read('job'))[0], reel = docs(read('reel'))[0] || null;
    return {jobId:job?.id, reelsId:reel?.id || null, held:Boolean(job?.hold?.on), steps:core.plan(job, reel, {settings, connected, youtubeUrl:o['youtube-url'] || null, len:x.len, now})}; }
  if (cmd === 'schedule') { const job = docs(read('job'))[0], topics = docs(read('topics')), day = job?.topicId ? posting.plan(topics, settings).get(job.topicId) || null : null;
    return {...core.scheduleFor(day, settings, now), by:'session', setAt:now}; }
  if (cmd === 'step') return core.transition(o.entry && o.entry !== 'null' ? read('entry') : null, o.event, now, o.data ? JSON.parse(o.data) : {});
  throw new Error('Use one of: due, plan, schedule, step');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try { process.stdout.write(JSON.stringify(run(process.argv.slice(2)), null, 2) + '\n'); }
  catch (e) { process.stderr.write((e.code === 'illegal' ? 'Refused: ' : 'Error: ') + e.message + '\n'); process.exit(e.code === 'illegal' ? 3 : 2); }
}
