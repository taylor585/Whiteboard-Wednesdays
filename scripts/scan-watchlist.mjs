#!/usr/bin/env node
// Fetch each creator's latest uploads from YouTube's public channel feed (no key, no quota) and write them as
// documents for the app's artifact database, one per creator: uploads/<handle>.
// Usage: node scripts/scan-watchlist.mjs [--handles @a,@b] [--out scan.json]
// The feed carries the latest 15 videos with title, date, description and thumbnail. Nothing is invented: a
// creator whose feed fails is written with an error and its previous videos are left alone by the writer.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2), opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i+1] : null; };
const only = (opt('--handles') || '').split(',').map(s => s.trim()).filter(Boolean);
const out = opt('--out') || path.join(root, 'scan.json');
const creators = JSON.parse(fs.readFileSync(path.join(root, 'public/creators.json'), 'utf8')).creators.filter(c => !only.length || only.includes(c.handle));
const KEEP = 15, DESC = 400;
const text = (xml, tag) => { const m = xml.match(new RegExp('<'+tag+'[^>]*>([\\s\\S]*?)</'+tag+'>')); return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim() : ''; };
async function feed(c) {
  const url = 'https://www.youtube.com/feeds/videos.xml?channel_id='+c.channelId;
  const r = await fetch(url, {headers:{'User-Agent':'Mozilla/5.0 (Whiteboard Wednesdays watchlist)'}});
  if (!r.ok) throw new Error('feed '+r.status);
  const xml = await r.text();
  const entries = xml.split('<entry>').slice(1);
  return entries.slice(0, KEEP).map(e => ({
    id: text(e, 'yt:videoId'), title: text(e, 'title'), publishedAt: text(e, 'published'),
    description: text(e, 'media:description').slice(0, DESC),
    thumb: (e.match(/<media:thumbnail url="([^"]+)"/) || [])[1] || 'https://i.ytimg.com/vi/'+text(e, 'yt:videoId')+'/hqdefault.jpg',
    views: Number((e.match(/<media:statistics views="(\d+)"/) || [])[1] || 0)
  })).filter(v => v.id && v.title);
}
const docs = [], now = new Date().toISOString();
for (const c of creators) {
  try { const videos = await feed(c); docs.push({id:c.handle, data:{handle:c.handle, name:c.name, channelId:c.channelId, fetchedAt:now, error:null, videos}}); console.error('ok  ', c.handle, videos.length); }
  catch (e) { docs.push({id:c.handle, data:{handle:c.handle, name:c.name, channelId:c.channelId, fetchedAt:now, error:String(e.message || e)}}); console.error('FAIL', c.handle, e.message); }
}
fs.writeFileSync(out, JSON.stringify({fetchedAt:now, docs}, null, 1));
console.error(docs.filter(d => !d.data.error).length+' of '+docs.length+' creators fetched → '+out);
