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
  let db = null, jobs = [], job = null, links = [], connecting = true, note = '', copied = '', title = '', brief = '';
  // Phase 1 safety (4 November 2026): retry is the step to start again after a refused or failed start, starting is the
  // step whose session is being opened right now, confirm shows the "Have you made your picks?" question, topicPick is
  // Taylor's answer to "Which topic is this?" ('' not chosen, 'none', or a topic id).
  let retry = null, starting = null, confirm = false, topicPick = '';
  // A link is only accepted when it names one Drive file. Folders, Docs, Sheets and Slides are refused with a reason.
  function parseLink(url) {
    let u; try { u = new URL(url); } catch { return {kind:'bad', id:null}; }
    const host = u.hostname.toLowerCase(), path = u.pathname;
    if (host === 'docs.google.com') return {kind:'doc', id:null};
    if (host !== 'drive.google.com' && host !== 'drive.usercontent.google.com') return {kind:'other', id:null};
    if (/\/folders?\//.test(path) || /^\/drive\/(u\/\d+\/)?(my-drive|shared-drives|recent|starred)/.test(path)) return {kind:'folder', id:null};
    const m = path.match(/^\/file\/(?:u\/\d+\/)?d\/([\w-]{20,})(?:\/|$)/);
    if (m) return {kind:'file', id:m[1]};
    const q = u.searchParams.get('id');
    if (/^\/(open|uc|download)\/?$/.test(path) && q && /^[\w-]{20,}$/.test(q)) return {kind:'file', id:q};
    return {kind:'bad', id:null};
  }
  const when = iso => iso ? new Intl.DateTimeFormat('en-GB', {weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}).format(new Date(iso)) : '';
  const elapsed = (a, b) => { if (!a) return ''; const s = Math.max(0, Math.round(((b ? Date.parse(b) : Date.now()) - Date.parse(a)) / 1000)); return s < 60 ? s+'s' : s < 3600 ? Math.floor(s/60)+':'+String(s%60).padStart(2,'0') : Math.floor(s/3600)+'h '+Math.floor(s%3600/60)+'m'; };
  const topics = () => (window.WWIdeas?.data?.topics || []).filter(t => t.status !== 'posted');
  // Steps: links, Variety Pack, finals, post. The current one follows the job's own status.
  function steps() {
    // A failed job stays on the step it was working on, marked as stopped, never on Post.
    const s = job?.status || 'new', failed = s === 'failed';
    const at = s === 'new' ? 0 : ['queued','starting','running','pack'].includes(s) ? 1 : ['finishing','final'].includes(s) ? 2 : failed ? (job.session?.step === 'finals' || job.pickedAt ? 2 : 1) : 3;
    return '<ol class="pb-steps">'+['Drive links','Variety Pack','Finished edits','Post'].map((n, i) => '<li class="'+(i < at ? 'is-done' : i === at ? (failed ? 'is-failed' : 'is-on') : '')+'"'+(i === at ? ' aria-current="step"' : '')+'><b>'+(i+1)+'</b>'+n+(i === at && failed ? ' <small>stopped</small>' : '')+'</li>').join('')+'</ol>';
  }
  // Every problem at once, re-checked on each change (links, roles and title) and again when Generate is pressed.
  function problems() {
    if (!links.length) return [];
    const out = [], main = links.filter(l => l.role === 'main').length, reels = links.filter(l => l.role === 'reel').length;
    if (!title.trim()) out.push('Say what the video is about.');
    links.forEach((l, i) => {
      if (l.kind === 'folder') out.push('Link '+(i+1)+' is a Drive folder. Paste each file’s own link; folders cannot be read yet.');
      else if (l.kind === 'doc') out.push('Link '+(i+1)+' is a Google Docs, Sheets or Slides link, not a video file.');
      else if (!l.id) out.push('Link '+(i+1)+' is not a Google Drive file link.');
    });
    const seen = new Map();
    links.forEach((l, i) => { if (!l.id) return; if (seen.has(l.id)) out.push('Link '+(i+1)+' is the same file as link '+(seen.get(l.id)+1)+'. Remove one of them.'); else seen.set(l.id, i); });
    if (main !== 1) out.push(main ? 'Choose exactly one main recording; '+main+' are marked as main.' : 'Choose which link is the main recording.');
    if (links.length > MAX_REELS + 1) out.push('There are '+links.length+' links. One job takes one main recording and up to '+MAX_REELS+' phone reel recordings, so remove '+(links.length - MAX_REELS - 1)+'.');
    else if (reels > MAX_REELS) out.push('Up to '+MAX_REELS+' phone reel recordings.');
    return out;
  }
  // Topic link: an exact title match links the topic; otherwise Taylor is asked which topic it is (closest first).
  const norm = x => String(x ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const STOP = new Set('a an the and or of to in on for with how what why your you my is are it its this that do does can'.split(' '));
  const words = x => norm(x).split(' ').filter(w => w && !STOP.has(w));
  const exactTopic = () => title.trim() ? topics().find(t => norm(t.title) === norm(title)) : null;
  function rankedTopics() {
    const tw = words(title), near = (a, b) => a === b || (a.length > 3 && b.length > 3 && a.slice(0, 5) === b.slice(0, 5));
    return topics().map(t => ({t, score:words(t.title).filter(w => tw.some(x => near(w, x))).length})).sort((a, b) => b.score - a.score);
  }
  function topicHtml() {
    const ex = exactTopic();
    if (ex) return '<p class="pb-muted">Linked to your saved topic “'+esc(ex.title)+'”.</p>';
    if (!title.trim() || !topics().length) return '';
    const r = rankedTopics(), opt = ({t}) => '<option value="'+esc(t.id)+'"'+(topicPick === t.id ? ' selected' : '')+'>'+esc(t.title)+'</option>';
    const close = r.filter(x => x.score > 0), rest = r.filter(x => !x.score);
    return '<label class="pb-field" for="pb-topic"><span>Which topic is this?</span><select id="pb-topic"><option value=""'+(topicPick ? '' : ' selected')+'>Choose a topic…</option>'+
      (close.length ? '<optgroup label="Closest to your title">'+close.map(opt).join('')+'</optgroup><optgroup label="Other topics">'+rest.map(opt).join('')+'</optgroup>' : rest.map(opt).join(''))+
      '<option value="none"'+(topicPick === 'none' ? ' selected' : '')+'>None of these</option></select></label>';
  }
  const canGenerate = () => links.length && !problems().length && db && !busy() && !starting;
  function checkHtml() {
    const ps = problems();
    return (ps.length ? '<div class="pb-warn" role="alert">'+(ps.length === 1 ? esc(ps[0]) : '<ul>'+ps.map(x => '<li>'+esc(x)+'</li>').join('')+'</ul>')+'</div>' : '')+
      '<button type="button" class="pb-go" id="pb-generate"'+(canGenerate() ? '' : ' disabled')+'>Generate Variety Pack</button>'+
      '<p class="pb-muted">'+(db ? busy() ? 'A job is already running. Wait for it, or start a new one when it finishes.' : 'The job uses the skills in Settings: '+esc(skillLine())+'.' : connecting ? 'Connecting…' : 'Publish jobs are saved in the app’s database, which this preview does not have.')+'</p>';
  }
  const linkLabel = l => l.id ? 'Drive file …'+l.id.slice(-6) : l.kind === 'folder' ? 'Drive folder, not a file' : l.kind === 'doc' ? 'Google Docs link, not a video' : 'Not a Drive file link';
  function intake() {
    const ts = topics();
    return '<section class="pb-intake" aria-labelledby="pb-links-h"><div><h2 id="pb-links-h">Paste the Drive links</h2><p class="pb-muted">One main recording (landscape, 32:9 or 16:9) and up to five phone reel recordings (upright). One link per line, or separate them with commas. Each must be shared “Anyone with the link”.</p>'+
      '<textarea id="pb-links" rows="6" spellcheck="false" placeholder="https://drive.google.com/file/d/…/view">'+esc(links.map(l => l.url).join('\n'))+'</textarea>'+
      '<label class="pb-field" for="pb-title"><span>What is this video about?</span><input id="pb-title" list="pb-topic-list" maxlength="200" autocomplete="off" placeholder="Type it, or pick one of your saved topics" value="'+esc(title)+'"><datalist id="pb-topic-list">'+ts.map(t => '<option value="'+esc(t.title)+'">').join('')+'</datalist></label>'+
      '<div id="pb-topic-q">'+topicHtml()+'</div>'+
      '<label class="pb-field" for="pb-brief"><span>What you say in it, in your words (optional)</span><textarea id="pb-brief" rows="3" maxlength="2000" placeholder="The main points, any numbers you mention, who it is for. The title, description and posts are written from this and the transcript.">'+esc(brief)+'</textarea></label></div>'+
      '<div><h2>Check before it renders</h2>'+(links.length ? '<ol class="pb-srcs">'+links.map((l, i) => '<li class="pb-src'+(l.id ? '' : ' is-bad')+'"><span class="pb-shape '+(l.role === 'main' ? 'is-wide' : 'is-tall')+'" aria-hidden="true"></span><div><b>'+esc(linkLabel(l))+'</b><small>'+esc(l.url)+'</small></div><select data-role="'+i+'" aria-label="Role of link '+(i+1)+'"><option value="main"'+(l.role === 'main' ? ' selected' : '')+'>Main recording (landscape)</option><option value="reel"'+(l.role === 'reel' ? ' selected' : '')+'>Phone reel recording (upright)</option></select></li>').join('')+'</ol>' : '<p class="pb-empty">Your links appear here so you can mark the main recording before anything renders.</p>')+
      '<div id="pb-check">'+checkHtml()+'</div></div></section>';
  }
  const skillLine = () => { const s = window.WWSettings?.skills || {}, n = window.WWSettings?.name || (x => x); return [n(s.publishEdit), n(s.publishThumbs), n(s.publishPosts)].filter(Boolean).join(', '); };
  const busy = () => job && ['queued','starting','running','finishing'].includes(job.status);
  // Automatic start (Taylor, 3 November 2026): Generate and Continue start a Claude Code session in the cloud
  // through the viewer's Claude Code Remote connector. The session follows PUBLISH.md with the skills saved on the
  // job. If the connector is refused or unavailable, the job stays queued with the line to send instead.
  const ENV = 'env_017PLHsTGZVgThRnUnu1eoGG', REPO = 'https://github.com/taylor585/Whiteboard-Wednesdays';
  // The job's status moves on only after the session has actually started; a refusal leaves it where it was, with Try again.
  async function startSession(j, step) {
    const line = (step === 'finals' ? 'Continue Publish job ' : 'Run Publish job ')+j.id, requestedAt = new Date().toISOString();
    starting = step; retry = null; note = ''; render();
    try {
      const mcp = await window.claude?.use?.('mcp');
      if (!mcp) throw {code:'unavailable'};
      const r = await mcp.callTool('Claude Code Remote', 'create_session', {environment_id:ENV, source_url:REPO, title:(step === 'finals' ? 'Publish finals: ' : 'Publish: ')+(j.title || j.id),
        prompt:line+'. Follow PUBLISH.md in this repository exactly: run the job with the skills named on the job document, write every stage back to jobs/'+j.id+' in the Whiteboard Wednesdays app artifact, and never post anything.'});
      const p = r?.payload || {}, sid = p.ccr?.id || p.session_id || p.id || p.session?.id || null;
      starting = null;
      await save({session:{id:sid, url:sid ? 'https://claude.ai/code/'+sid : null, step, requestedAt, startedAt:new Date().toISOString()},
        ...(step === 'finals' ? {status:'finishing', pickedAt:requestedAt} : {status:'starting'}), ...(j.status === 'failed' ? {error:null, failedStage:null} : {})});
      render(); return true;
    } catch (e) {
      const why = e?.code === 'not_granted' ? 'You did not allow the Claude Code connection, so it could not start by itself.' : e?.code === 'unavailable' ? 'The Claude Code connection is not available in this view.' : 'Claude Code could not be started ('+(e?.code || e?.message || 'error')+').';
      starting = null; retry = step;
      note = why+' Nothing has started. Press Try again, or send “'+line+'” in a Claude chat.'; render(); return false;
    }
  }
  // A job that has not reported back: starting for 10 minutes, or running or finishing with no new stage for 90.
  const STUCK_MIN = {starting:10, running:90, finishing:90};
  function stuckMinutes() {
    const lim = STUCK_MIN[job?.status]; if (!lim || starting) return 0;
    const t = job.status === 'starting' ? [job.session?.startedAt || job.updatedAt || job.createdAt]
      : [job.session?.startedAt, job.updatedAt, ...(job.stages || []).flatMap(x => [x.startedAt, x.endedAt])];
    const last = Math.max(...t.map(x => Date.parse(x)).filter(n => !isNaN(n)));
    const min = isFinite(last) ? Math.floor((Date.now() - last) / 60000) : 0;
    return min >= lim ? min : 0;
  }
  // Continue is offered on a ready pack, and again on a failed job that has a pack (for example "No picks found yet").
  const canContinue = () => job?.packUrl && (job.status === 'pack' || job.status === 'failed');
  const failedStage = () => job.failedStage || (job.stages || []).find(x => /^fail/.test(x.state || ''))?.name || [...(job.stages || [])].reverse().find(x => x.state === 'run')?.name || '';
  function confirmBar() {
    return '<div class="pb-bar pb-confirm" role="group" aria-labelledby="pb-confirm-q"><span id="pb-confirm-q"><b>Have you made your picks on the Variety Pack?</b></span><span class="pb-muted">Claude builds only what you approved there. With no picks, it stops and tells you.</span><button type="button" class="pb-link" id="pb-continue-no">Not yet</button><button type="button" class="pb-go" id="pb-continue-yes"'+(starting ? ' disabled' : '')+'>Yes, build the finals →</button></div>';
  }
  // The stage list is written by the session as it works; nothing here is simulated.
  function stages() {
    const list = job.stages || [];
    const ses = job.session?.url ? ' <a class="pb-link" href="'+esc(job.session.url)+'" target="_blank" rel="noopener noreferrer">Watch the session ↗</a>' : '';
    const stuck = stuckMinutes(), fs = job.status === 'failed' ? failedStage() : '';
    const head = job.status === 'failed' ? '<div class="pb-warn pb-failed" role="alert"><p><b>This job stopped'+(fs ? ' at “'+esc(fs)+'”' : '')+'.</b> '+esc(job.error || 'Claude Code did not say why.')+'</p><p>Nothing was posted. '+(job.packUrl ? 'Your Variety Pack is still there: fix the problem, then press Continue, or start a new video.' : 'Press Start a new video when you are ready.')+ses+'</p></div>'
      : stuck ? '<div class="pb-warn pb-stuck" role="alert"><p><b>Claude Code has not reported back</b> for '+(stuck >= 120 ? Math.floor(stuck / 60)+' h '+(stuck % 60)+' min' : stuck+' minutes')+'. It may have stopped.</p><p class="pb-acts">'+ses+' <button type="button" class="pb-link" id="pb-retry-stuck">Try again</button> <button type="button" class="pb-link" id="pb-stop">Stop this job</button></p></div>'
      : job.status === 'queued' ? '<p class="pb-queue"><b>Not started yet.</b> <button type="button" class="pb-link" id="pb-start"'+(starting ? ' disabled' : '')+'>Start now</button> or say this in a Claude chat: <code>Run Publish job '+esc(job.id)+'</code> <button type="button" class="pb-link" data-copy-run="pack">'+(copied === 'run' ? 'Copied' : 'Copy')+'</button></p>'
      : job.status === 'starting' ? '<p class="pb-queue"><b>Starting Claude Code.</b> A session is opening in the cloud with your skills; the steps appear here as it works, usually within two minutes.'+ses+'</p>'
      : ['running','finishing'].includes(job.status) && ses ? '<p class="pb-meta">Claude Code is working on this.'+ses+'</p>' : '';
    const bar = starting === 'finals' ? '<div class="pb-bar"><span>Starting Claude Code for the finals…</span></div>' : confirm ? confirmBar() : '<div class="pb-bar"><span>Picks made in the Variety Pack?</span><span class="pb-muted">Claude reads them from that page and builds the finished edits.</span><button type="button" class="pb-go" id="pb-continue">Continue · build the finals →</button></div>';
    const packLink = job.packUrl ? '<p class="pb-queue"><b>Your Variety Pack is ready.</b> It opens as the same Suby Shots - Variety Pack page Claude Code publishes: make your picks there, then come back and press Continue. <a class="pb-go pb-packgo" href="'+esc(job.packUrl)+'" target="_blank" rel="noopener noreferrer">Open the Variety Pack ↗</a></p>'+(canContinue() && !job.pack?.platforms?.length ? bar : '') : '';
    return '<section class="pb-stages" aria-label="Progress">'+head+packLink+(list.length ? '<ol>'+list.map(s => '<li class="is-'+esc(/^fail/.test(s.state || '') ? 'failed' : s.state || 'wait')+'"><span class="pb-st-dot" aria-hidden="true"></span><b>'+esc(s.name)+'</b><small>'+esc(s.detail || '')+'</small><time>'+(s.state === 'done' ? elapsed(s.startedAt, s.endedAt) : s.state === 'run' ? 'running '+elapsed(s.startedAt) : '')+'</time></li>').join('')+'</ol>' : '')+'</section>';
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
    }).join('')+'<div class="pb-bar"><span>'+have+' of '+need+' picked</span><span class="pb-muted">'+(locked ? 'Picks are locked while the finals render.' : 'Finals take a while; you can close this tab.')+'</span><button type="button" class="pb-go" id="pb-continue"'+(!locked && have >= need && !starting ? '' : ' disabled')+'>Continue · build the finals →</button></div>'+(confirm && !locked ? confirmBar() : '')+'</section>';
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
    root.innerHTML = '<div class="pb-head"><div><div class="micro">PUBLISH · DRIVE LINKS IN, POSTS OUT</div><h1 id="pb-heading">'+esc(job ? (t?.title || job.title || 'This video') : 'Publish a video')+'</h1><p>Paste the Drive links, check which file is which, then Generate. Your Variety Pack opens as its own page.</p></div>'+
      (job ? '<button type="button" class="pb-link" id="pb-new"'+(busy() ? ' disabled' : '')+'>Start a new video</button>' : '')+'</div>'+steps()+
      (note ? '<div class="pb-warn" role="status"><p>'+esc(note)+'</p>'+(retry && job ? '<p class="pb-acts"><button type="button" class="pb-link" id="pb-retry"'+(starting ? ' disabled' : '')+'>Try again</button> <button type="button" class="pb-link" data-copy-run="'+esc(retry)+'">'+(copied === 'run' ? 'Copied' : 'Copy the line')+'</button></p>' : '')+'</div>' : '')+
      (!job || job.status === 'new' ? intake() : '<p class="pb-meta">Job '+esc(job.id)+' · '+esc((job.sources || []).length)+' files · started '+esc(when(job.createdAt))+'</p>'+stages()+pack()+finals());
    if (focus && document.getElementById(focus)) document.getElementById(focus).focus();
    else if (confirm) root.querySelector('#pb-continue-yes')?.focus();
  }
  function readLinks(text) {
    // Split on spaces, new lines and commas; keep every link (too many are warned about, never dropped). A role belongs to
    // the file, so editing or reordering the list keeps Taylor's choices. A new link is the main only if none is yet.
    const kept = new Map();  // file → its roles in order, so a file pasted twice keeps each copy's own role
    links.forEach(l => { const k = l.id || l.url; kept.set(k, (kept.get(k) || []).concat(l.role)); });
    links = text.split(/[\s,]+/).filter(Boolean).map(url => { const p = parseLink(url); return {url, id:p.id, kind:p.kind, role:kept.get(p.id || url)?.shift() || null}; });
    if (!links.some(l => l.role === 'main')) { const first = links.find(l => !l.role); if (first) first.role = 'main'; }
    links.forEach(l => { if (!l.role) l.role = 'reel'; });
  }
  async function save(patch) {
    if (!db || !job) return;
    const at = new Date().toISOString();
    try { await db.doc('jobs/'+job.id).update({...patch, updatedAt:at}); Object.assign(job, patch, {updatedAt:at}); note = ''; }
    catch (e) { note = 'Could not save ('+(e?.code || 'error')+'). Try again.'; render(); }
  }
  // Typing the title or brief refreshes only the checks and the topic question, so the field keeps its caret and list.
  function refreshIntake() { const c = root.querySelector('#pb-check'), q = root.querySelector('#pb-topic-q'); if (c) c.innerHTML = checkHtml(); if (q) q.innerHTML = topicHtml(); }
  root.addEventListener('input', e => { if (e.target.id === 'pb-brief') { brief = e.target.value; return; } if (e.target.id === 'pb-title') { title = e.target.value; refreshIntake(); return; } if (e.target.id === 'pb-links') { readLinks(e.target.value); const box = e.target, pos = box.selectionStart; render(); const again = root.querySelector('#pb-links'); again.focus(); again.setSelectionRange(pos, pos); } });
  root.addEventListener('change', e => { if (e.target.id === 'pb-topic') { topicPick = e.target.value; return; } const r = e.target.closest('[data-role]'); if (r) { links[+r.dataset.role].role = r.value; render(); } });
  root.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.id === 'pb-generate') {
      if (!canGenerate()) { render(); return; }  // checked again here: a bad link can never start a paid session
      const id = new Date().toISOString().slice(0, 10)+'-'+Math.random().toString(36).slice(2, 7), at = new Date().toISOString();
      const topic = exactTopic() || (topicPick && topicPick !== 'none' ? topics().find(t => t.id === topicPick) : null);
      const doc = {id, topicId:topic?.id || null, title:title.trim(), brief:brief.trim(), sources:links.map(l => ({url:l.url, driveId:l.id, role:l.role})), skills:window.WWSettings?.skills || {}, status:'queued', stages:[], picks:{}, finals:[], createdAt:at, startedAt:at, updatedAt:at};
      b.disabled = true;
      try { await db.doc('jobs/'+id).set(doc); job = doc; links = []; title = ''; brief = ''; topicPick = ''; note = ''; render(); await startSession(doc, 'pack'); }
      catch (err) { note = 'Could not start the job ('+(err?.code || 'error')+').'; render(); }
      return;
    }
    if (b.id === 'pb-new') { job = null; links = []; title = ''; brief = ''; topicPick = ''; note = ''; retry = null; confirm = false; render(); root.querySelector('#pb-links')?.focus(); return; }
    if (b.dataset.pick) { job.picks = {...(job.picks || {}), [b.dataset.pick]:b.dataset.val}; render(); await save({picks:job.picks}); return; }
    if (starting && /^pb-(continue|start|retry|stop)/.test(b.id)) return;
    if (b.id === 'pb-continue') { confirm = true; render(); return; }
    if (b.id === 'pb-continue-no') { confirm = false; render(); root.querySelector('.pb-packgo')?.focus(); return; }
    if (b.id === 'pb-continue-yes') { confirm = false; if (canContinue()) await startSession(job, 'finals'); else render(); return; }
    if (b.id === 'pb-start') { await startSession(job, 'pack'); return; }
    if (b.id === 'pb-retry') { await startSession(job, retry || 'pack'); return; }
    if (b.id === 'pb-retry-stuck') { await startSession(job, job.status === 'finishing' ? 'finals' : 'pack'); return; }
    if (b.id === 'pb-stop') { const st = [...(job.stages || [])].reverse().find(x => x.state === 'run')?.name || null; await save({status:'failed', error:'Stopped by Taylor', failedStage:st, stoppedAt:new Date().toISOString()}); render(); return; }
    if (b.hasAttribute('data-copy-run')) { await copy((b.dataset.copyRun === 'finals' ? 'Continue' : 'Run')+' Publish job '+job.id, 'run'); return; }
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
      if (!canContinue()) confirm = false;
      if (document.activeElement?.closest?.('#publish textarea,#publish input')) return;
      render();
    }, () => {});
    render();
  }
  setInterval(() => { if (!root.hidden && job && ['starting','running','finishing'].includes(job.status) && !document.activeElement?.closest?.('#publish select')) render(); }, 15000);
  window.addEventListener('ww:route', e => { if (e.detail[0] === 'publish') render(); });
  window.addEventListener('ww:data', render);
  load();
})();
