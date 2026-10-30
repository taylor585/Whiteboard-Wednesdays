/* Publish (Taylor, 30 October 2026): one screen from Drive links to posted videos, replacing the separate Studio
   and Post screens. Paste the links, say which file is the main video and which are reels, press Generate.
   A Claude Code session runs the job with the skills chosen in Settings and writes the Variety Pack back here,
   laid out one platform at a time (pick PB-A): edit options, five thumbnails and two post variations each.
   Pick, press Continue, and the finished files land on Drive. Everything lives in the artifact database as
   jobs/<id>; the page never edits video or posts on its own, and it never shows a stage the session has not written. */
(() => {
  'use strict';
  const root = document.querySelector('#publish');
  if (!root) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const MAX_REELS = 5;
  const PLATFORMS = {youtube:'YouTube', linkedin:'LinkedIn', reels:'Instagram Reels'};
  let db = null, jobs = [], job = null, links = [], connecting = true, note = '', copied = '';
  const driveId = url => (String(url).match(/\/d\/([\w-]{20,})/) || String(url).match(/[?&]id=([\w-]{20,})/) || [])[1] || null;
  const when = iso => iso ? new Intl.DateTimeFormat('en-GB', {weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}).format(new Date(iso)) : '';
  const elapsed = (a, b) => { if (!a) return ''; const s = Math.max(0, Math.round(((b ? Date.parse(b) : Date.now()) - Date.parse(a)) / 1000)); return s < 60 ? s+'s' : s < 3600 ? Math.floor(s/60)+':'+String(s%60).padStart(2,'0') : Math.floor(s/3600)+'h '+Math.floor(s%3600/60)+'m'; };
  const topics = () => (window.WWIdeas?.data?.topics || []).filter(t => t.status !== 'posted');
  // Steps: links, Variety Pack, finals, post. The current one follows the job's own status.
  function steps() {
    const s = job?.status || 'new', at = s === 'new' ? 0 : ['queued','running','pack'].includes(s) ? 1 : ['finishing','final'].includes(s) ? 2 : 3;
    return '<ol class="pb-steps">'+['Drive links','Variety Pack','Finished edits','Post'].map((n, i) => '<li class="'+(i < at ? 'is-done' : i === at ? 'is-on' : '')+'"'+(i === at ? ' aria-current="step"' : '')+'><b>'+(i+1)+'</b>'+n+'</li>').join('')+'</ol>';
  }
  function intake() {
    const main = links.filter(l => l.role === 'main').length, reels = links.filter(l => l.role === 'reel').length;
    const problem = !links.length ? '' : main !== 1 ? 'Choose exactly one main video.' : reels > MAX_REELS ? 'Up to '+MAX_REELS+' reels.' : links.some(l => !l.id) ? 'One of the links is not a Google Drive file link.' : '';
    const ts = topics();
    return '<section class="pb-intake" aria-labelledby="pb-links-h"><div><h2 id="pb-links-h">Paste the Drive links</h2><p class="pb-muted">One 16:9 main video and up to five phone reels, one link per line. Each must be shared “Anyone with the link”.</p>'+
      '<textarea id="pb-links" rows="6" spellcheck="false" placeholder="https://drive.google.com/file/d/…/view">'+esc(links.map(l => l.url).join('\n'))+'</textarea>'+
      '<label class="pb-field" for="pb-topic"><span>Which video is this?</span><select id="pb-topic"><option value="">Choose a topic</option>'+ts.map(t => '<option value="'+esc(t.id)+'"'+(job?.topicId === t.id ? ' selected' : '')+'>'+esc(t.title)+(t.recordDate ? ' · recorded '+esc(t.recordDate) : '')+'</option>').join('')+'</select></label></div>'+
      '<div><h2>Check before it renders</h2>'+(links.length ? '<ol class="pb-srcs">'+links.map((l, i) => '<li class="pb-src"><span class="pb-shape '+(l.role === 'main' ? 'is-wide' : 'is-tall')+'" aria-hidden="true"></span><div><b>'+esc(l.id ? 'Drive file …'+l.id.slice(-6) : 'Not a Drive file link')+'</b><small>'+esc(l.url)+'</small></div><select data-role="'+i+'" aria-label="Role of link '+(i+1)+'"><option value="main"'+(l.role === 'main' ? ' selected' : '')+'>Main video 16:9</option><option value="reel"'+(l.role === 'reel' ? ' selected' : '')+'>Phone reel 9:16</option></select></li>').join('')+'</ol>' : '<p class="pb-empty">Your links appear here so you can mark the main video before anything renders.</p>')+
      (problem ? '<p class="pb-warn" role="alert">'+esc(problem)+'</p>' : '')+
      '<button type="button" class="pb-go" id="pb-generate"'+(links.length && !problem && db && !busy() ? '' : ' disabled')+'>Generate Variety Pack</button>'+
      '<p class="pb-muted">'+(db ? busy() ? 'A job is already running. Wait for it, or start a new one when it finishes.' : 'The job uses the skills in Settings: '+esc(skillLine())+'.' : connecting ? 'Connecting…' : 'Publish jobs are saved in the app’s database, which this preview does not have.')+'</p></div></section>';
  }
  const skillLine = () => { const s = window.WWSettings?.skills || {}, n = window.WWSettings?.name || (x => x); return [n(s.publishEdit), n(s.publishThumbs), n(s.publishPosts)].filter(Boolean).join(', '); };
  const busy = () => job && ['queued','running','finishing'].includes(job.status);
  // The stage list is written by the session as it works; nothing here is simulated.
  function stages() {
    const list = job.stages || [];
    const head = job.status === 'queued' ? '<p class="pb-queue"><b>Queued.</b> A Claude Code session picks this job up and writes each step here as it goes. To start it now, say this in your Claude chat: <code>Run Publish job '+esc(job.id)+'</code> <button type="button" class="pb-link" data-copy-run>'+(copied === 'run' ? 'Copied' : 'Copy')+'</button></p>' : '';
    return '<section class="pb-stages" aria-label="Progress">'+head+(list.length ? '<ol>'+list.map(s => '<li class="is-'+esc(s.state || 'wait')+'"><span class="pb-st-dot" aria-hidden="true"></span><b>'+esc(s.name)+'</b><small>'+esc(s.detail || '')+'</small><time>'+(s.state === 'done' ? elapsed(s.startedAt, s.endedAt) : s.state === 'run' ? 'running '+elapsed(s.startedAt) : '')+'</time></li>').join('')+'</ol>' : '')+'</section>';
  }
  // The pack, one block per platform (PB-A): the video, the edit choices and thumbnails, then the copy with two variations.
  function pack() {
    const p = job.pack; if (!p?.platforms?.length) return '';
    const picks = job.picks || {}, locked = job.status !== 'pack';
    const opt = (key, o) => '<button type="button" class="pb-opt" data-pick="'+esc(key)+'" data-val="'+esc(o.id)+'" aria-pressed="'+(picks[key] === o.id)+'"'+(locked ? ' disabled' : '')+'>'+(o.preview ? '<img src="'+esc(o.preview)+'" alt="" loading="lazy">' : '')+'<span class="pb-tag'+(/fresh|motion/i.test(o.tag || '') ? ' is-fresh' : '')+'">'+esc(o.tag || '')+'</span><b>'+esc(o.title)+'</b>'+(o.detail ? '<small>'+esc(o.detail)+'</small>' : '')+'</button>';
    const need = p.platforms.reduce((n, pl) => n + (pl.questions || []).length + (pl.thumbnails?.length ? 1 : 0) + (pl.posts?.length ? 1 : 0), 0);
    const have = Object.keys(picks).length;
    return '<section class="pb-pack" aria-labelledby="pb-pack-h"><div class="pb-pack-head"><h2 id="pb-pack-h">Variety Pack</h2><span class="micro">'+esc(p.note || 'Half proven, half fresh')+'</span></div>'+p.platforms.map(pl => {
      const k = pl.key, post = pl.posts || [], chosen = post.findIndex((_, i) => picks[k+'.post'] === 'v'+(i+1));
      return '<article class="pb-blk"><div class="pb-blk-side"><span class="pb-pf pb-pf-'+esc(k)+'">'+esc(PLATFORMS[k] || pl.label || k)+'</span>'+(pl.video?.url ? '<a class="pb-vid'+(k === 'reels' ? ' is-tall' : '')+'" href="'+esc(pl.video.url)+'" target="_blank" rel="noopener noreferrer"><span>'+esc(pl.video.label || 'Preview on Drive')+' ↗</span></a>' : '')+'</div><div class="pb-blk-main">'+
        (pl.questions || []).map(q => '<div class="pb-q"><span class="micro">'+esc(q.label)+'</span><div class="pb-opts">'+q.options.map(o => opt(k+'.'+q.id, o)).join('')+'</div></div>').join('')+
        (pl.thumbnails?.length ? '<div class="pb-q"><span class="micro">Thumbnail · '+pl.thumbnails.length+' options</span><div class="pb-thumbs">'+pl.thumbnails.map(t => opt(k+'.thumb', {id:t.id, title:t.label || '', preview:t.url, tag:t.tag || ''})).join('')+'</div></div>' : '')+
        (post.length ? '<div class="pb-q"><span class="micro">'+esc(pl.postLabel || 'Post')+' · pick a variation</span><div class="pb-opts pb-two">'+post.map((v, i) => opt(k+'.post', {id:'v'+(i+1), tag:'Variation '+(i+1), title:v.title || '', detail:v.check || ''})).join('')+'</div><pre class="pb-copy">'+esc(((post[chosen < 0 ? 0 : chosen].title || '')+'\n\n'+(post[chosen < 0 ? 0 : chosen].body || '')).trim())+'</pre></div>' : '')+
        '</div></article>';
    }).join('')+'<div class="pb-bar"><span>'+have+' of '+need+' picked</span><span class="pb-muted">'+(locked ? 'Picks are locked while the finals render.' : 'Finals take a while; you can close this tab.')+'</span><button type="button" class="pb-go" id="pb-continue"'+(!locked && have >= need ? '' : ' disabled')+'>Continue · build the finals →</button></div></section>';
  }
  function finals() {
    const f = job.finals || []; if (!f.length) return '';
    const copyable = (job.pack?.platforms || []).filter(pl => pl.posts?.length);
    return '<section class="pb-finals" aria-labelledby="pb-fin-h"><h2 id="pb-fin-h">Finished</h2><ul>'+f.map(x => '<li><span class="pb-pf pb-pf-'+esc(x.platform || '')+'">'+esc(PLATFORMS[x.platform] || x.platform || '')+'</span><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.label)+' ↗</a>'+(x.detail ? '<small>'+esc(x.detail)+'</small>' : '')+'</li>').join('')+'</ul>'+
      '<div class="pb-post"><div><b>Post all</b><p class="pb-muted">Posting needs the YouTube, LinkedIn and Instagram connections, which are not set up yet. Until then, copy each post and upload the files from Drive. Nothing has been posted.</p></div><div class="pb-copies">'+copyable.map(pl => '<button type="button" class="pb-link" data-copy="'+esc(pl.key)+'">'+(copied === pl.key ? 'Copied' : 'Copy '+esc(PLATFORMS[pl.key] || pl.key)+' post')+'</button>').join('')+'<button type="button" class="pb-go" disabled>Post all</button></div></div></section>';
  }
  function render() {
    if (root.hidden) return;
    const focus = document.activeElement && root.contains(document.activeElement) ? document.activeElement.id : null;
    const t = job && topics().concat(window.WWIdeas?.data?.topics || []).find(x => x.id === job.topicId);
    root.innerHTML = '<div class="pb-head"><div><div class="micro">PUBLISH · DRIVE LINKS IN, POSTS OUT</div><h1 id="pb-heading">'+esc(job ? (t?.title || job.title || 'This video') : 'Publish a video')+'</h1><p>Paste the Drive links, check which file is which, then Generate. The Variety Pack appears below, one platform at a time.</p></div>'+
      (job ? '<button type="button" class="pb-link" id="pb-new"'+(busy() ? ' disabled' : '')+'>Start a new video</button>' : '')+'</div>'+steps()+
      (note ? '<p class="pb-warn" role="status">'+esc(note)+'</p>' : '')+
      (!job || job.status === 'new' ? intake() : '<p class="pb-meta">Job '+esc(job.id)+' · '+esc((job.sources || []).length)+' files · started '+esc(when(job.createdAt))+'</p>'+stages()+pack()+finals());
    if (focus) document.getElementById(focus)?.focus();
  }
  function readLinks(text) {
    const lines = text.split(/\s+/).filter(Boolean).slice(0, MAX_REELS + 1);
    links = lines.map((url, i) => ({url, id:driveId(url), role:links[i]?.url === url ? links[i].role : i === 0 ? 'main' : 'reel'}));
  }
  async function save(patch) {
    if (!db || !job) return;
    try { await db.doc('jobs/'+job.id).update({...patch, updatedAt:new Date().toISOString()}); note = ''; }
    catch (e) { note = 'Could not save ('+(e?.code || 'error')+'). Try again.'; render(); }
  }
  root.addEventListener('input', e => { if (e.target.id === 'pb-links') { readLinks(e.target.value); const box = e.target, pos = box.selectionStart; render(); const again = root.querySelector('#pb-links'); again.focus(); again.setSelectionRange(pos, pos); } });
  root.addEventListener('change', e => { const r = e.target.closest('[data-role]'); if (r) { links[+r.dataset.role].role = r.value; render(); } });
  root.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.id === 'pb-generate') {
      const id = new Date().toISOString().slice(0, 10)+'-'+Math.random().toString(36).slice(2, 7), at = new Date().toISOString();
      const topicId = root.querySelector('#pb-topic')?.value || null, topic = topics().find(t => t.id === topicId);
      const doc = {id, topicId, title:topic?.title || '', sources:links.map(l => ({url:l.url, driveId:l.id, role:l.role})), skills:window.WWSettings?.skills || {}, status:'queued', stages:[], picks:{}, finals:[], createdAt:at, updatedAt:at};
      b.disabled = true;
      try { await db.doc('jobs/'+id).set(doc); job = doc; links = []; note = ''; render(); }
      catch (err) { note = 'Could not start the job ('+(err?.code || 'error')+').'; render(); }
      return;
    }
    if (b.id === 'pb-new') { job = null; links = []; render(); root.querySelector('#pb-links')?.focus(); return; }
    if (b.dataset.pick) { job.picks = {...(job.picks || {}), [b.dataset.pick]:b.dataset.val}; render(); await save({picks:job.picks}); return; }
    if (b.id === 'pb-continue') { job.status = 'finishing'; render(); await save({status:'finishing', pickedAt:new Date().toISOString()}); return; }
    if (b.hasAttribute('data-copy-run')) { await copy('Run Publish job '+job.id, 'run'); return; }
    if (b.dataset.copy) { const pl = job.pack.platforms.find(p => p.key === b.dataset.copy), i = Math.max(0, (pl.posts || []).findIndex((_, n) => job.picks?.[pl.key+'.post'] === 'v'+(n+1))); const v = pl.posts[i]; await copy(((v.title || '')+'\n\n'+(v.body || '')).trim(), pl.key); }
  });
  async function copy(text, key) { try { await navigator.clipboard.writeText(text); copied = key; } catch { note = 'Copy was blocked by the browser. Select the text and copy it instead.'; } render(); setTimeout(() => { copied = ''; render(); }, 2000); }
  async function load() {
    try { await window.WWStore?.connect(); db = window.WWStore?.db?.() || null; } catch { db = null; }
    connecting = false;
    if (db) db.collection('jobs').onSnapshot(snap => {
      jobs = snap.docs.filter(d => d.exists).map(d => ({id:d.id, ...d.data()})).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      // Follow the job on screen; with none open, show the latest one still in progress.
      job = job ? jobs.find(j => j.id === job.id) || job : jobs.find(j => j.status !== 'posted' && j.status !== 'final') || null;
      if (document.activeElement?.closest?.('#publish textarea,#publish select')) return;
      render();
    }, () => {});
    render();
  }
  setInterval(() => { if (!root.hidden && job && ['running','finishing'].includes(job.status)) render(); }, 15000);
  window.addEventListener('ww:route', e => { if (e.detail[0] === 'publish') render(); });
  window.addEventListener('ww:data', render);
  load();
})();
