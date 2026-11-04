/* Reels lane inside Publish (Phase 8a, 4 November 2026; reels-design.md and Taylor's decisions 4 and 6).
   Publish has two plain text lanes under its heading: Video (#/publish, unchanged) and Reels (#/publish/reels).
   A reel job starts from a Video job's main recording, or from one pasted Drive file or folder link, plus the title word
   for word. Generate saves reels/<id> and starts a Claude Code session with "Run Reels job <id>", which makes the Reel
   highlight pack (With Katana 5.0, master rule 9): six reels on the title, each a hook, three highlights with the value
   given to the end user and their source lines with times, and a close, 60 s or less. Taylor picks exactly two winners
   here and ticks Add music on any reel he wants music under (off means no music). Save winners stores the picks and
   starts nothing: the recording sheet, the build, the music and Ready to post come next (Phase 8b) and are shown as such.
   The lane never writes a Video job (jobs/<id>): a reel job points at its video with jobId, and the Video lane finds it
   from there. Nothing here is ever cut from the main recording: it is read only for its transcript and its times. */
(() => {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ENV = 'env_017PLHsTGZVgThRnUnu1eoGG', REPO = 'https://github.com/taylor585/Whiteboard-Wednesdays';
  const STEPS = ['Drive link','Highlight pack','Your recordings','Music','Ready to post'];
  const BUSY = ['queued','starting','running'];
  const STATUS_WORD = {queued:'not started', starting:'starting', running:'Claude Code is making the highlight pack', found:'found earlier reel work', pack:'highlight pack ready: pick 2 winners', recording:'winners saved', failed:'stopped'};
  let root = null, db = null, connecting = true, reels = [], jobs = [], packs = [];
  // Intake: from is a Video job id or 'link'; link the pasted text; title and trim as typed.
  let from = null, linkText = '', title = '', titleTouched = false, trim = '', reuseSeen = '', reuseOk = '';
  // A reel job on screen: openId from the route; sel the selected idea; draft the picks and music ticks before Save.
  let openId = null, sel = null, draft = null, draftFor = null, refused = '', note = '', retry = false, starting = false, copied = false, changing = false;
  const phone = matchMedia('(max-width: 999px)');
  const parse = u => window.WWPublish?.parseLink ? window.WWPublish.parseLink(u) : {kind:'bad', id:null};
  const artifactUrl = u => typeof u === 'string' && /^https:\/\/claude\.ai\/(code\/)?artifact\/[\w-]+$/.test(u) ? u : null;
  const httpsUrl = u => { try { const x = new URL(String(u || '')); return x.protocol === 'https:' ? x.href : null; } catch { return null; } };
  const when = iso => { try { return iso ? new Intl.DateTimeFormat('en-GB', {weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}).format(new Date(iso)) : ''; } catch { return ''; } };
  const clock = s => { s = Math.max(0, Math.round(+s || 0)); return s >= 3600 ? Math.floor(s/3600)+':'+String(Math.floor(s%3600/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0') : Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
  const elapsed = (a, b) => { if (!a) return ''; const s = Math.max(0, Math.round(((b ? Date.parse(b) : Date.now()) - Date.parse(a)) / 1000)); return s < 60 ? s+'s' : s < 3600 ? Math.floor(s/60)+':'+String(s%60).padStart(2,'0') : Math.floor(s/3600)+'h '+Math.floor(s%3600/60)+'m'; };
  const allTopics = () => window.WWIdeas?.data?.topics || [];
  const topics = () => allTopics().filter(t => t.status !== 'posted');
  const norm = x => String(x ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const S = () => window.WWSettings?.skills || {};
  const skillName = id => window.WWSettings?.name ? window.WWSettings.name(id) : id;
  const reelSkills = () => { const s = S(); return {reelsEdit:s.reelsEdit || 'suby-shots-with-katana', reelsCopy:s.reelsCopy || 'finishing-touches-copy-and-scripts', reelsPosts:s.reelsPosts || 'performance-poster'}; };
  const skillLine = () => Object.values(reelSkills()).map(skillName).join(', ');
  const current = () => reels.find(r => r.id === openId) || null;

  // ---- Where a reel job's recording comes from ---------------------------------------------------------------------
  // A Video job offers its main recording only (role main, a real Drive file). A phone reel recording never can.
  const mainOf = j => (j.sources || []).find(s => s.role === 'main' && s.driveId) || null;
  const videoJobs = () => jobs.filter(j => mainOf(j) && !(j.status === 'failed' && !j.packUrl && !j.pack)).slice(0, 6);
  const reelTake = id => id && jobs.some(j => (j.reelTakes || []).includes(id) || (j.sources || []).some(s => s.driveId === id && s.role === 'reel'));
  // Until Taylor chooses, the newest Video job with a main recording is offered first (or the link box when there is none).
  const fromNow = () => from ?? (videoJobs()[0]?.id || 'link');
  function source() {
    const from = fromNow();
    if (from !== 'link') { const j = jobs.find(x => x.id === from), m = j && mainOf(j); return m ? {kind:'job', jobId:j.id, driveId:m.driveId, url:m.url || null, fromJob:true} : null; }
    const parts = linkText.split(/[\s,]+/).filter(Boolean); if (parts.length !== 1) return parts.length ? {kind:'many', n:parts.length} : null;
    const p = parse(parts[0]);
    return p.kind === 'file' ? {kind:'file', driveId:p.id, url:parts[0], fromJob:false} : p.kind === 'folder' && p.folderId ? {kind:'folder', folderId:p.folderId, url:parts[0], fromJob:false} : {kind:'bad', why:p.kind, url:parts[0]};
  }
  const srcLabel = s => !s ? '' : s.kind === 'job' ? 'The main recording of “'+(jobs.find(j => j.id === s.jobId)?.title || 'your video')+'” · Drive file …'+String(s.driveId).slice(-6) : s.kind === 'file' ? 'Drive file …'+String(s.driveId).slice(-6) : s.kind === 'folder' ? 'Drive folder …'+String(s.folderId).slice(-6)+' · Claude takes the one main recording in it' : '';
  const trimVal = () => { const t = String(trim).trim(); if (!t) return null; const n = Number(t); return Number.isFinite(n) && n >= 0 && n <= 600 ? Math.round(n * 10) / 10 : NaN; };
  const sameSource = (r, s) => s && r.source && ((s.driveId && r.source.driveId === s.driveId) || (s.folderId && r.source.folderId === s.folderId) || (s.jobId && r.jobId === s.jobId));
  const running = s => reels.find(r => BUSY.includes(r.status) && sameSource(r, s));
  function problems() {
    const s = source(), out = [];
    if (!s) return fromNow() === 'link' ? [] : ['Choose a video, or paste a Drive link.'];
    if (s.kind === 'many') out.push('Paste one link: the main recording, or the folder it is in.');
    else if (s.kind === 'bad') out.push(s.why === 'doc' ? 'That is a Google Docs, Sheets or Slides link, not a video.' : s.why === 'folder' ? 'That is not a shared Drive folder link. Open the folder in Drive, choose Share, Copy link, and paste that.' : 'That isn’t a Google Drive link.');
    else if (s.kind === 'file' && reelTake(s.driveId)) out.push('That is a phone reel recording. The highlight pack is made from the main recording.');
    if (!title.trim()) out.push('Say the video’s title, word for word.');
    if (Number.isNaN(trimVal())) out.push('The YouTube trim is a number of seconds, from 0 to 600.');
    return out;
  }
  // ---- Earlier work (Phase 3 for reels): a reel job or a reel highlights page for the same recording or topic --------
  const intakeTopic = () => { const f = fromNow(), j = f !== 'link' ? jobs.find(x => x.id === f) : null; return j?.topicId ? allTopics().find(t => t.id === j.topicId) || {id:j.topicId} : topics().find(t => norm(t.title) === norm(title)) || null; };
  function earlier() {
    const s = source(); if (!s || ['many','bad'].includes(s.kind) || problems().length) return [];
    const tid = intakeTopic()?.id || null, out = [];
    const why = (driveIds, folderId, topicId, jobId) => s.driveId && (driveIds || []).includes(s.driveId) ? 'Same Drive file' : s.folderId && folderId === s.folderId ? 'Same Drive folder' : s.jobId && jobId === s.jobId ? 'Same video' : tid && topicId === tid ? 'Same topic' : '';
    reels.forEach(r => { if (r.status === 'failed' && !r.pack) return;
      const w = why([r.source?.driveId], r.source?.folderId, r.topicId, r.jobId); if (w) out.push({kind:'reel', id:r.id, why:w, title:r.title || 'Reel job '+r.id, detail:STATUS_WORD[r.status] || r.status, at:r.createdAt}); });
    packs.forEach(p => { if ((p.kind || 'variety') !== 'reels') return; const url = artifactUrl(p.url); if (!url) return;
      const w = why(p.driveIds, p.folderId, p.topicId, p.jobId); if (w) out.push({kind:'page', id:p.id, why:w, title:p.title || 'Reel highlights', url, detail:'Reel highlights page'+(p.decisions ? ', winners saved on it' : ''), at:p.createdAt}); });
    return out;
  }
  const reuseSig = () => earlier().map(x => x.kind+':'+x.id).join('|');
  function reuseHtml(list) {
    return '<div class="pb-reuse" id="rl-reuse" tabindex="-1" role="group" aria-labelledby="rl-reuse-h"><h3 id="rl-reuse-h">'+(list.some(x => x.why !== 'Same topic') ? 'This recording already has reel highlights' : 'This topic already has reel highlights')+'</h3>'+
      '<p class="pb-muted">Opening it starts nothing. Starting fresh runs Claude Code from the beginning again, which uses your Claude plan’s usage.</p><ul>'+
      list.map(x => '<li><div><b>'+esc(x.title)+'</b><small>'+esc([x.why, x.detail, x.at ? when(x.at) : ''].filter(Boolean).join(' · '))+'</small></div><span class="pb-acts">'+
        (x.kind === 'reel' ? '<a class="pb-go rl-open" href="#/publish/reels/'+encodeURIComponent(x.id)+'">Open this reel job</a>' : '<a class="pb-link" href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">Open it ↗</a>')+'</span></li>').join('')+
      '</ul><button type="button" class="pb-link" id="rl-fresh">Start fresh anyway</button></div>';
  }
  const canGenerate = () => { const s = source(); return s && !['many','bad'].includes(s.kind) && !problems().length && db && !running(s) && !starting; };
  function checkHtml() {
    const s = source(), ps = problems(), run = s && running(s), found = earlier(), shown = found.length && reuseSeen === reuseSig() && reuseOk !== reuseSeen;
    const label = s && !['many','bad'].includes(s.kind) ? '<p class="rl-src"><span class="pb-shape '+(s.kind === 'folder' ? 'is-folder' : 'is-ultra')+'" aria-hidden="true"></span><span>'+esc(srcLabel(s))+'</span></p>' : '<p class="pb-empty">Your link appears here so you can check it before anything runs.</p>';
    return label+(ps.length ? '<div class="pb-warn" role="alert">'+(ps.length === 1 ? esc(ps[0]) : '<ul>'+ps.map(x => '<li>'+esc(x)+'</li>').join('')+'</ul>')+'</div>' : '')+
      (run ? '<div class="pb-warn" role="alert">A reel job for this video is already running. <a href="#/publish/reels/'+encodeURIComponent(run.id)+'">Open it</a></div>' : '')+
      (shown ? reuseHtml(found) : '<button type="button" class="pb-go" id="rl-generate"'+(canGenerate() ? '' : ' disabled')+'>Generate Reel highlight pack</button>')+
      '<p class="pb-muted">'+(db ? 'Claude Code reads the recording for its words and times only: nothing is cut from it. It writes six reel ideas here, then stops for you to pick two. Uses '+esc(skillLine())+' from Settings.' : connecting ? 'Connecting…' : 'Reel jobs are saved in the app’s database, which this preview doesn’t have.')+'</p>';
  }
  function intake() {
    const vj = videoJobs();
    const from = fromNow();
    if (!titleTouched && from !== 'link') { const j = jobs.find(x => x.id === from), t = j && allTopics().find(x => x.id === j.topicId); title = t?.title || j?.title || ''; }
    const opts = vj.map(j => '<label class="rl-choice"><input type="radio" name="rl-from" value="'+esc(j.id)+'"'+(from === j.id ? ' checked' : '')+'><span><b>'+esc(j.title || j.folderName || 'Video job '+j.id)+'</b><small>Use this video’s main recording · '+esc(when(j.createdAt))+'</small></span></label>').join('');
    const list = reels.slice(0, 5);
    return '<section class="pb-intake rl-intake" aria-labelledby="rl-in-h"><div><h2 id="rl-in-h">Where the reels come from</h2>'+
      '<p class="pb-muted">The main recording of the video (landscape). Claude reads its words and times to find the highlights; your reels are recorded fresh on your phone after you pick.</p>'+
      '<fieldset class="rl-start"><legend>Start from</legend>'+(vj.length ? opts : '<p class="pb-muted">No Video job with a main recording yet.</p>')+
      '<label class="rl-choice"><input type="radio" name="rl-from" value="link"'+(from === 'link' ? ' checked' : '')+'><span><b>Paste a Drive link</b><small>The main recording’s file link, or the folder it is in</small></span></label></fieldset>'+
      (from === 'link' ? '<label class="pb-field" for="rl-link"><span>Drive link</span><input id="rl-link" type="url" inputmode="url" spellcheck="false" autocomplete="off" maxlength="500" placeholder="https://drive.google.com/file/d/…" value="'+esc(linkText)+'"></label>' : '')+
      '<label class="pb-field" for="rl-title"><span>The video’s title, word for word <i class="pb-opt-note">The title decides what the highlights teach</i></span><input id="rl-title" list="rl-topic-list" maxlength="200" autocomplete="off" value="'+esc(title)+'"><datalist id="rl-topic-list">'+topics().map(t => '<option value="'+esc(t.title)+'">').join('')+'</datalist></label>'+
      '<label class="pb-field rl-trim" for="rl-trim"><span>YouTube trim in seconds (optional) <i class="pb-opt-note">If the YouTube video starts later than the recording, times are shown as the YouTube video’s own</i></span><input id="rl-trim" inputmode="decimal" maxlength="6" autocomplete="off" placeholder="0" value="'+esc(trim)+'"></label></div>'+
      '<div><h2>Check before it runs</h2><div id="rl-check">'+checkHtml()+'</div>'+
      (list.length ? '<div class="rl-jobs" role="group" aria-label="Your reel jobs"><span class="micro">Your reel jobs</span>'+list.map(r => '<a class="pb-link" href="#/publish/reels/'+encodeURIComponent(r.id)+'">'+esc(r.title || 'Reel job '+r.id)+' · '+esc(STATUS_WORD[r.status] || r.status)+'</a>').join('')+'</div>' : '')+'</div></section>';
  }

  // ---- Steps, head and the session ---------------------------------------------------------------------------------
  function steps(r) {
    const s = r?.status || 'new', failed = s === 'failed', at = s === 'new' ? 0 : s === 'recording' ? 2 : 1;
    return '<ol class="pb-steps rl-steps" aria-label="Reel steps">'+STEPS.map((n, i) => '<li class="'+(i < at ? 'is-done' : i === at ? (failed ? 'is-failed' : 'is-on') : i >= 2 ? 'is-soon' : '')+'"'+(i === at ? ' aria-current="step"' : '')+'><b>'+(i+1)+'</b>'+n+(i === at && failed ? ' <small>stopped</small>' : i >= 2 ? ' <small>coming next</small>' : '')+'</li>').join('')+'</ol>';
  }
  const lineFor = id => 'Run Reels job '+id;
  const prompt = r => lineFor(r.id)+'. Follow PUBLISH.md "Reels jobs" in this repository exactly: use the skills named on the reels document, read the recording only for its words and times (never cut anything from it), write every stage back to reels/'+r.id+' in the Whiteboard Wednesdays app artifact, stop on "pack" for Taylor to pick two winners, and never post anything.';
  async function save(r, patch) {
    if (!db || !r) return false;
    const at = new Date().toISOString();
    try { await db.doc('reels/'+r.id).update({...patch, updatedAt:at}); Object.assign(r, patch, {updatedAt:at}); note = ''; return true; }
    catch (e) { note = 'Could not save ('+(e?.code || 'error')+'). Try again.'; render(); return false; }
  }
  // The status moves on only after the session has opened; a refusal leaves the job where it was, with Try again.
  async function startSession(r) {
    const requestedAt = new Date().toISOString(); starting = true; retry = false; note = ''; render();
    try {
      const mcp = await window.claude?.use?.('mcp'); if (!mcp) throw {code:'unavailable'};
      const res = await mcp.callTool('Claude Code Remote', 'create_session', {environment_id:ENV, source_url:REPO, title:'Reels: '+(r.title || r.id), prompt:prompt(r)});
      const p = res?.payload || {}, sid = p.ccr?.id || p.session_id || p.id || p.session?.id || null;
      starting = false;
      await save(r, {status:'starting', session:{id:sid, url:sid ? 'https://claude.ai/code/'+sid : null, step:'pack', requestedAt, startedAt:new Date().toISOString()}, ...(r.status === 'failed' ? {error:null, failedStage:null} : {})});
      render(); return true;
    } catch (e) {
      const why = e?.code === 'not_granted' ? 'You did not allow the Claude Code connection, so it could not start by itself.' : e?.code === 'unavailable' ? 'The Claude Code connection is not available in this view.' : 'Claude Code could not be started ('+(e?.code || e?.message || 'error')+').';
      starting = false; retry = true; note = why+' Nothing has started. Press Try again, or send “'+lineFor(r.id)+'” in a Claude chat.'; render(); return false;
    }
  }
  const STUCK_MIN = {starting:10, running:90};
  function stuckMinutes(r) {
    const lim = STUCK_MIN[r.status]; if (!lim || starting) return 0;
    const t = r.status === 'starting' ? [r.session?.startedAt || r.updatedAt || r.createdAt] : [r.session?.startedAt, r.updatedAt, ...(r.stages || []).flatMap(x => [x.startedAt, x.endedAt])];
    const last = Math.max(...t.map(x => Date.parse(x)).filter(n => !isNaN(n))); const min = isFinite(last) ? Math.floor((Date.now() - last) / 60000) : 0;
    return min >= lim ? min : 0;
  }
  const failedStage = r => r.failedStage || (r.stages || []).find(x => /^fail/.test(x.state || ''))?.name || '';
  function stages(r) {
    const list = r.stages || [], ses = r.session?.url ? ' <a class="pb-link" href="'+esc(r.session.url)+'" target="_blank" rel="noopener noreferrer">Watch the session ↗</a>' : '';
    const stuck = stuckMinutes(r), off = starting ? ' disabled' : '';
    const head = r.status === 'failed' ? '<div class="pb-warn pb-failed" role="alert"><p><b>This reel job stopped'+(failedStage(r) ? ' at “'+esc(failedStage(r))+'”' : '')+'.</b> '+esc(r.error || 'Claude Code did not say why.')+'</p><p>Nothing was recorded, built or posted.'+ses+'</p><p class="pb-acts"><button type="button" class="pb-link" id="rl-retry"'+off+'>Try again</button></p></div>'
      : stuck ? '<div class="pb-warn pb-stuck" role="alert"><p><b>Claude Code has not reported back</b> for '+(stuck >= 120 ? Math.floor(stuck/60)+' h '+(stuck%60)+' min' : stuck+' minutes')+'. It may have stopped.</p><p class="pb-acts">'+ses+' <button type="button" class="pb-link" id="rl-retry"'+off+'>Try again</button> <button type="button" class="pb-link" id="rl-stop">Stop this job</button></p></div>'
      : r.status === 'queued' ? '<p class="pb-queue"><b>Not started yet.</b> <button type="button" class="pb-link" id="rl-start"'+off+'>Start now</button> or say this in a Claude chat: <code>'+esc(lineFor(r.id))+'</code> <button type="button" class="pb-link" id="rl-copy">'+(copied ? 'Copied' : 'Copy')+'</button></p>'
      : r.status === 'starting' ? '<p class="pb-queue"><b>Starting Claude Code.</b> A session is opening in the cloud with your skills; the steps appear here as it works, usually within two minutes.'+ses+'</p>'
      : r.status === 'running' ? '<p class="pb-meta">Claude Code is making the highlight pack. You can close this tab.'+ses+'</p>' : '';
    return '<section class="pb-stages" aria-label="Progress">'+head+(list.length ? '<ol>'+list.map(s => '<li class="is-'+esc(/^fail/.test(s.state || '') ? 'failed' : s.state || 'wait')+'"><b>'+esc(s.name)+'</b><small>'+esc(s.detail || '')+'</small><time>'+(s.state === 'done' ? elapsed(s.startedAt, s.endedAt) : s.state === 'run' ? 'running '+elapsed(s.startedAt) : '')+'</time></li>').join('')+'</ol>' : '')+'</section>';
  }
  function foundHtml(r) {
    const ex = (r.existing || []).filter(x => artifactUrl(x.url) || x.reelsId);
    return '<section class="pb-found" aria-labelledby="rl-found-h"><h2 id="rl-found-h">Claude Code found earlier reel highlights for this recording</h2><p class="pb-muted">'+esc(r.foundNote || 'It stopped before downloading anything.')+' Opening it starts nothing. Starting fresh runs Claude Code from the beginning again, which uses your Claude plan’s usage.</p><ul>'+
      ex.map(x => '<li><div><b>'+esc(x.title || 'Reel highlights')+'</b><small>'+esc([x.why, x.createdAt ? when(x.createdAt) : ''].filter(Boolean).join(' · '))+'</small></div><span class="pb-acts">'+(x.reelsId ? '<a class="pb-link" href="#/publish/reels/'+encodeURIComponent(x.reelsId)+'">Open this reel job</a>' : '<a class="pb-link" href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">Open it ↗</a>')+'</span></li>').join('')+
      '</ul><button type="button" class="pb-link" id="rl-start-fresh"'+(starting ? ' disabled' : '')+'>Start fresh anyway</button></section>';
  }

  // ---- The highlight pack: pick two winners, music per reel (decision 6) -------------------------------------------
  const ideasOf = r => Array.isArray(r.pack?.ideas) ? r.pack.ideas : [];
  const toPick = r => Math.max(1, +r.pack?.winnersToPick || 2);
  // The app never repairs a pack: the counts, a value under every highlight and real times, or no picking at all.
  function packOk(r) {
    const p = r.pack || {}, ideas = ideasOf(r), n = +p.ideaCount || 6, per = +p.highlightsPer || 3;
    return ideas.length === n && ideas.every(i => i && i.id && i.hook && i.close && Array.isArray(i.highlights) && i.highlights.length === per &&
      i.highlights.every(h => String(h.value || '').trim() && String(h.say || '').trim() && Number.isFinite(+h.t0) && Number.isFinite(+h.t1) && +h.t1 > +h.t0)) && new Set(ideas.map(i => i.id)).size === ideas.length;
  }
  function ensureDraft(r) {
    if (draftFor === r.id + '|' + (r.winnersSavedAt || '') + '|' + (r.pack?.checkedAt || '')) return;
    draftFor = r.id + '|' + (r.winnersSavedAt || '') + '|' + (r.pack?.checkedAt || '');
    const w = r.winners || {}, ids = new Set(ideasOf(r).map(i => i.id));
    draft = {picked:Object.keys(w).filter(k => ids.has(k) && w[k]), music:Object.fromEntries(Object.entries(w).filter(([k]) => ids.has(k)).map(([k, v]) => [k, !!v?.music]))};
    if (!sel || !ids.has(sel)) sel = phone.matches ? null : ideasOf(r)[0]?.id || null;
    refused = '';
  }
  const locked = r => r.status !== 'pack' || starting;
  const dur = r => { const d = +r.pack?.durationS; if (d > 0) return d; return Math.max(60, ...ideasOf(r).flatMap(i => i.highlights.map(h => +h.t1 || 0))) * 1.02; };
  const pct = (r, t) => (Math.min(Math.max(+t || 0, 0), dur(r)) / dur(r) * 100).toFixed(3)+'%';
  const span = (r, h) => (h.yt0 && h.yt1 ? h.yt0+'–'+h.yt1 : clock(h.t0)+'–'+clock(h.t1));
  const timesWord = r => r.pack?.timesIn === 'youtube' || Number.isFinite(+r.offsetS) && +r.offsetS > 0 ? 'video' : 'recording';
  function mapHtml(r) {
    const ideas = ideasOf(r), d = dur(r), picked = new Set(draft.picked);
    const lanes = ideas.map((i, n) => '<span class="rl-lab'+(i.id === sel ? ' is-on' : '')+'">R'+(n+1)+'</span><div class="rl-track">'+i.highlights.map(h =>
      '<button type="button" class="rl-seg'+(i.id === sel ? ' is-sel' : picked.has(i.id) ? ' is-win' : '')+'" data-rl-sel="'+esc(i.id)+'" style="left:'+pct(r, h.t0)+';width:'+(Math.max(0, Math.min(+h.t1, d) - Math.max(+h.t0, 0)) / d * 100).toFixed(3)+'%" aria-label="Reel '+(n+1)+' · '+esc(i.name || '')+' · '+esc(h.head || '')+' · '+esc(span(r, h))+'" title="Reel '+(n+1)+' · '+esc(h.head || '')+' · '+esc(span(r, h))+'"></button>').join('')+'</div>').join('');
    const ticks = [], step = d > 2400 ? 10 : 5; for (let m = 0; m * 60 <= d; m += step) ticks.push('<span style="left:'+pct(r, m*60)+'">'+m+':00</span>');
    const used = {}; ideas.forEach(i => new Set(i.highlights.map(h => span(r, h).split('–')[0])).forEach(k => { used[k] = (used[k] || 0) + 1; }));
    const shared = Object.entries(used).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
    return '<section class="rl-map" aria-labelledby="rl-map-h"><div class="rl-map-h"><h2 id="rl-map-h">Where each reel comes from</h2><p>The whole '+timesWord(r)+', 0:00 to '+esc(clock(d))+'. Each block is one highlight’s section.</p></div>'+
      '<div class="rl-lanes">'+lanes+'</div><div class="rl-lanes" aria-hidden="true"><span></span><div class="rl-axis">'+ticks.join('')+'</div></div>'+
      '<ul class="rl-key"><li class="k-sel"><i></i>Selected reel</li><li class="k-win"><i></i>Your winners</li><li><i></i>Other reels</li></ul>'+
      '<p class="rl-overlap">'+(shared.length ? 'Sections used by more than one reel: '+shared.map(([k, n]) => '<b>'+esc(k)+'</b> ('+n+' reels)').join(', ')+'.' : 'No section is used by two reels.')+'</p></section>';
  }
  const lineList = h => (Array.isArray(h.lines) ? h.lines : []).map(l => Array.isArray(l) ? {t:l[0], text:l[1]} : l || {}).filter(l => l.text);
  function musicHtml(r, i) {
    const on = !!draft.music[i.id], off = locked(r);
    return '<label class="rl-music'+(on ? ' is-on' : '')+'" for="rl-music-'+esc(i.id)+'"><input type="checkbox" class="rl-music-in" id="rl-music-'+esc(i.id)+'" data-rl-music="'+esc(i.id)+'"'+(on ? ' checked' : '')+(off ? ' disabled' : '')+' aria-describedby="rl-music-d-'+esc(i.id)+'">'+
      '<span class="rl-music-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></svg></span>'+
      '<span class="rl-music-t"><b>Add music</b><small id="rl-music-d-'+esc(i.id)+'">'+(on ? 'Music goes under this reel, from your Drive music folder. You choose the track once the reel is built.' : 'Off: this reel has your voice and sound effects only, no music.')+'</small></span><span class="rl-music-sw" aria-hidden="true"></span></label>';
  }
  function detail(r, i, n) {
    const on = draft.picked.includes(i.id), full = draft.picked.length >= toPick(r) && !on, off = locked(r);
    return '<span class="micro">Reel '+(n+1)+' of '+ideasOf(r).length+(i.seconds ? ' · about '+esc(Math.round(i.seconds))+' s spoken' : '')+(on ? ' · winner' : '')+'</span>'+
      '<h3 class="rl-name">'+esc(i.name || 'Reel '+(n+1))+'</h3>'+(i.angle ? '<p class="rl-angle">'+esc(i.angle)+'</p>' : '')+
      '<div class="rl-sec"><h4>Hook <span>the title, said as a contrast, on screen from frame 1</span></h4><p class="rl-hook">'+esc(i.hook)+'</p></div>'+
      '<div class="rl-sec"><h4>Three highlights <span>the proof, each one leading into the next</span></h4><ol class="rl-hls">'+i.highlights.map(h => { const ls = lineList(h), still = httpsUrl(h.still);
        return '<li class="rl-hl">'+(h.head ? '<h5>'+esc(h.head)+'</h5>' : '')+'<p class="rl-say">'+esc(h.say)+'</p><p class="rl-value"><b>Value given to the end user:</b> '+esc(h.value)+'</p>'+
          '<div class="rl-from'+(still ? '' : ' no-still')+'"><details'+(phone.matches ? '' : ' open')+'><summary>From the '+timesWord(r)+' <span>'+esc(span(r, h))+'</span></summary>'+(ls.length ? '<ol class="rl-tr">'+ls.map(l => '<li><span class="rl-tc">'+esc(l.t || '')+'</span><span>'+esc(l.text)+'</span></li>').join('')+'</ol>' : '<p class="pb-muted">Claude Code did not write the lines for this section.</p>')+'</details>'+
          (still ? '<figure class="rl-still"><img src="'+esc(still)+'" alt="The screen at '+esc(span(r, h).split('–')[0])+', face-free" loading="lazy"><figcaption>Screen at '+esc(span(r, h).split('–')[0])+'</figcaption></figure>' : '')+'</div></li>'; }).join('')+'</ol></div>'+
      '<div class="rl-sec"><h4>Close <span>back to the title</span></h4><p class="rl-close">'+esc(i.close)+'</p></div>'+
      musicHtml(r, i)+
      '<button type="button" class="rl-pick" data-rl-pick="'+esc(i.id)+'" aria-pressed="'+on+'"'+(off ? ' disabled' : full ? ' aria-disabled="true"' : '')+'>'+(on ? 'Winner ✓' : 'Pick as a winner')+'</button>'+
      (refused === i.id ? '<p class="rl-note" role="alert">You’ve picked '+toPick(r)+'. Unpick one first.</p>' : full && !off ? '<p class="rl-note">You’ve picked '+toPick(r)+'. Unpick one first.</p>' : '');
  }
  function packHtml(r) {
    ensureDraft(r);
    if (!packOk(r)) return '<div class="pb-warn rl-badpack" role="alert"><p><b>This pack didn’t pass the checker.</b> It needs '+esc(r.pack?.ideaCount || 6)+' reels with '+esc(r.pack?.highlightsPer || 3)+' highlights each, every one with its value and its times. Ask Claude to run it again: nothing is picked from a pack the app cannot show whole.</p><p class="pb-acts"><button type="button" class="pb-link" id="rl-again"'+(starting ? ' disabled' : '')+'>Run the pack again</button></p></div>';
    const ideas = ideasOf(r), picked = new Set(draft.picked), need = toPick(r), n = draft.picked.length;
    const rows = ideas.map((i, k) => { const on = picked.has(i.id), cur = i.id === sel;
      return '<li class="rl-item'+(cur ? ' is-cur' : '')+'"><button type="button" class="rl-row'+(on ? ' is-win' : '')+'" data-rl-sel="'+esc(i.id)+'" aria-'+(phone.matches ? 'expanded' : 'current')+'="'+cur+'"'+(phone.matches ? ' aria-controls="rl-card-'+esc(i.id)+'"' : ' aria-controls="rl-detail"')+'>'+
        (on ? '<span class="rl-chip">Winner ✓'+(draft.music[i.id] ? ' · ♪' : '')+'</span>' : draft.music[i.id] ? '<span class="rl-chip is-music">♪ music</span>' : '')+'<span class="micro">Reel '+(k+1)+' of '+ideas.length+(i.seconds ? ' · about '+esc(Math.round(i.seconds))+' s' : '')+'</span><b>'+esc(i.name || 'Reel '+(k+1))+'</b>'+(i.angle ? '<small>'+esc(i.angle)+'</small>' : '')+
        '<span class="rl-mini" aria-hidden="true">'+i.highlights.map(h => '<i style="left:'+pct(r, h.t0)+';width:'+((+h.t1 - +h.t0) / dur(r) * 100).toFixed(3)+'%"></i>').join('')+'</span></button>'+
        (phone.matches && cur ? '<div class="rl-card" id="rl-card-'+esc(i.id)+'">'+detail(r, i, k)+'</div>' : '')+'</li>'; }).join('');
    const k = ideas.findIndex(i => i.id === sel), names = ideas.filter(i => picked.has(i.id)).map(i => 'Reel '+(ideas.indexOf(i)+1)+' '+(i.name || '')+(draft.music[i.id] ? ' (music)' : ''));
    const bar = r.status === 'pack'
      ? '<div class="pb-bar rl-bar" role="region" aria-label="Your winners"><span class="rl-count" aria-live="polite">Picked <b>'+n+'</b> of '+need+(names.length ? '<span class="rl-names"> · '+esc(names.join(', '))+'</span>' : '')+'</span><span class="pb-muted rl-hint">'+(n < need ? 'Pick '+(need - n === 1 ? 'one more' : need - n)+'. Nothing is recorded or built until you save.' : 'Ready. Saving starts nothing: your recording sheet comes in the next update.')+'</span><button type="button" class="pb-go" id="rl-save"'+(n === need && !starting ? '' : ' disabled')+'>Save my '+need+' winners</button></div>' : '';
    return mapHtml(r)+'<div class="rl-pack"><ul class="rl-list" id="rl-list" aria-label="Six reels">'+rows+'</ul>'+(phone.matches ? '' : '<section class="rl-detail" id="rl-detail" aria-live="polite" aria-label="The selected reel">'+(k >= 0 ? detail(r, ideas[k], k) : '')+'</section>')+'</div>'+bar;
  }
  // After Save winners: the picks are locked, the next steps are honest about not being built yet.
  function savedHtml(r) {
    const ideas = ideasOf(r), w = r.winners || {}, wins = ideas.filter(i => w[i.id]);
    return '<section class="rl-saved" aria-labelledby="rl-saved-h"><h2 id="rl-saved-h" tabindex="-1">Your '+wins.length+' winners are saved</h2><p class="pb-muted">Saved '+esc(when(r.winnersSavedAt))+'. Nothing has been recorded or built, and no session is running.</p>'+
      '<ul class="rl-wins">'+wins.map(i => '<li><span class="micro">Reel '+(ideas.indexOf(i)+1)+(i.seconds ? ' · about '+esc(Math.round(i.seconds))+' s' : '')+'</span><b>'+esc(i.name || '')+'</b><p>'+esc(i.hook)+'</p><span class="rl-mtag'+(w[i.id]?.music ? ' is-on' : '')+'">'+(w[i.id]?.music ? '♪ With music' : 'No music')+'</span></li>').join('')+'</ul>'+
      '<div class="rl-soon"><b>Next: your recordings</b><p>The recording sheet for each winner and the place to paste your phone recordings come in the next update. Until then, record from the hooks and highlights above, or ask in a Claude chat. Music and Ready to post follow after that.</p></div>'+
      '<p class="pb-acts"><button type="button" class="pb-link" id="rl-change"'+(starting ? ' disabled' : '')+'>Change winners</button></p></section>';
  }

  // ---- Render ------------------------------------------------------------------------------------------------------
  const tabs = () => window.WWPublish?.laneTabs ? window.WWPublish.laneTabs('reels') : '';
  function render() {
    if (!root || root.hidden) return;
    const a = document.activeElement, fid = a && root.contains(a) ? a.id || (a.dataset?.rlSel ? 'sel:'+a.dataset.rlSel+':'+(a.classList.contains('rl-row') ? 'row' : 'seg') : a.dataset?.rlPick ? 'pick:'+a.dataset.rlPick : '') : '';
    const caret = a && /^(INPUT|TEXTAREA)$/.test(a.tagName) && a.type !== 'checkbox' && a.type !== 'radio' ? [a.selectionStart, a.selectionEnd] : null;
    const r = openId ? current() : null;
    const head = r ? (allTopics().find(t => t.id === r.topicId)?.title || r.title || 'Reels') : 'Reels from this week’s video';
    const lede = r ? (['pack','recording'].includes(r.status) && packOk(r) ? 'Six reels on the title, three highlights each. Pick the two you’ll record on your phone. Nothing is recorded or built until you save your winners.' : 'Claude Code makes six reel ideas from the recording’s words, three highlights each, and stops for you to pick two.') : 'Start from a video’s main recording. Claude Code makes six reel ideas on its title, three highlights each, and you pick the two you’ll record on your phone.';
    root.innerHTML = '<div class="pb-head"><div><div class="micro">PUBLISH · REELS · REEL HIGHLIGHT PACK</div><h1 id="pb-heading">'+esc(head)+'</h1><p>'+esc(lede)+'</p></div>'+(r ? '<a class="pb-link rl-new" href="#/publish/reels">Start new reels</a>' : '')+'</div>'+tabs()+
      (openId && !r ? '<div class="pb-warn" role="status">'+(db ? 'This reel job isn’t in the app’s database. <a href="#/publish/reels">Start new reels</a>' : connecting ? 'Loading…' : 'Reel jobs are saved in the app’s database, which this preview doesn’t have.')+'</div>' : steps(r))+
      (note ? '<div class="pb-warn" role="status"><p>'+esc(note)+'</p>'+(retry && r ? '<p class="pb-acts"><button type="button" class="pb-link" id="rl-retry"'+(starting ? ' disabled' : '')+'>Try again</button> <button type="button" class="pb-link" id="rl-copy">'+(copied ? 'Copied' : 'Copy the line')+'</button></p>' : '')+'</div>' : '')+
      (!openId ? intake() : !r ? '' : '<p class="pb-meta">Reel job '+esc(r.id)+' · from '+esc(r.source?.kind === 'job' ? 'the main recording of a Video job · Drive file …'+String(r.source.driveId || '').slice(-6) : r.source?.kind === 'folder' ? 'Drive folder …'+String(r.source.folderId || '').slice(-6) : 'Drive file …'+String(r.source?.driveId || '').slice(-6))+
        (r.pack?.skill ? ' · written by '+esc(skillName(r.pack.skill)) : '')+(r.pack?.builtWith ? ' · checked by '+esc(r.pack.builtWith) : '')+(Number.isFinite(+r.offsetS) && +r.offsetS > 0 ? ' · YouTube trim '+esc(r.offsetS)+' s' : '')+' · started '+esc(when(r.createdAt))+'</p>'+
        (r.status === 'found' ? foundHtml(r) : '')+(['pack','recording'].includes(r.status) || (r.status === 'failed' && r.pack) ? '' : stages(r))+
        (r.status === 'pack' || (r.status === 'failed' && r.pack) ? (r.status === 'failed' ? stages(r) : '')+packHtml(r) : r.status === 'recording' ? savedHtml(r)+packHtml(r) : ''));
    if (fid) {
      const m = fid.match(/^(sel|pick):([^:]+)(?::(row|seg))?$/), el = m ? root.querySelector(m[1] === 'pick' ? '[data-rl-pick="'+CSS.escape(m[2])+'"]' : (m[3] === 'seg' ? '.rl-seg' : '.rl-row')+'[data-rl-sel="'+CSS.escape(m[2])+'"]') : document.getElementById(fid);
      if (el) { el.focus({preventScroll:true}); if (caret && el.setSelectionRange) try { el.setSelectionRange(caret[0], caret[1]); } catch {} }
    }
  }
  // Typing refreshes only the check panel, so a field keeps its caret.
  const refreshCheck = () => { const c = root?.querySelector('#rl-check'); if (c) c.innerHTML = checkHtml(); };
  const typing = () => { const a = document.activeElement; return a && root?.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName) && !['checkbox','radio'].includes(a.type); };
  function selectIdea(id, r, row) {
    sel = phone.matches && row && sel === id ? null : id; refused = '';
    if (r) history.replaceState(null, '', '#/publish/reels/'+encodeURIComponent(r.id)+(sel ? '/reel/'+encodeURIComponent(sel) : ''));
    render();
  }
  async function generate(extra = {}) {
    const s = source(); if (!canGenerate()) { render(); return; }
    const id = new Date().toISOString().slice(0, 10)+'-'+Math.random().toString(36).slice(2, 7), at = new Date().toISOString(), t = intakeTopic();
    const src = s.kind === 'job' ? {kind:'job', jobId:s.jobId, driveId:s.driveId, url:s.url, fromJob:true} : s.kind === 'file' ? {kind:'file', driveId:s.driveId, url:s.url, fromJob:false} : {kind:'folder', folderId:s.folderId, url:s.url, fromJob:false};
    const doc = {id, jobId:s.jobId || null, topicId:t?.id || null, title:title.trim(), titleBy:'taylor', source:src, offsetS:trimVal(), skills:reelSkills(), status:'queued', stages:[], winners:{}, createdAt:at, startedAt:at, updatedAt:at, ...extra};
    try { starting = true; await db.doc('reels/'+id).set(doc); reels = [doc, ...reels.filter(x => x.id !== id)]; starting = false;
      from = null; linkText = ''; title = ''; titleTouched = false; trim = ''; reuseSeen = ''; reuseOk = '';
      location.hash = '#/publish/reels/'+id; openId = id; await startSession(doc); }
    catch (e) { starting = false; note = 'Could not start the reel job ('+(e?.code || 'error')+').'; render(); }
  }
  function bind(el) {
    el.addEventListener('input', e => {
      if (!isReels()) return;
      const id = e.target.id;
      if (id === 'rl-link') { linkText = e.target.value; refreshCheck(); return; }
      if (id === 'rl-title') { title = e.target.value; titleTouched = true; refreshCheck(); return; }
      if (id === 'rl-trim') { trim = e.target.value; refreshCheck(); return; }
    });
    el.addEventListener('change', e => {
      if (!isReels()) return;
      if (e.target.name === 'rl-from') { from = e.target.value; if (from !== 'link') titleTouched = false; else if (!titleTouched) title = ''; render(); root.querySelector('input[name="rl-from"]:checked')?.focus(); return; }
      const m = e.target.dataset?.rlMusic; if (m !== undefined) { const r = current(); if (!r || locked(r)) { render(); return; } draft.music[m] = e.target.checked; render(); root.querySelector('[data-rl-music="'+CSS.escape(m)+'"]')?.focus(); }
    });
    el.addEventListener('keydown', e => {
      if (!isReels() || !['ArrowDown','ArrowUp'].includes(e.key) || !e.target.closest?.('.rl-row')) return;
      const r = current(); if (!r) return; e.preventDefault();
      const ideas = ideasOf(r), i = Math.max(0, ideas.findIndex(x => x.id === e.target.dataset.rlSel)), j = Math.min(ideas.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)));
      sel = ideas[j].id; history.replaceState(null, '', '#/publish/reels/'+encodeURIComponent(r.id)+'/reel/'+encodeURIComponent(sel)); render();
      root.querySelector('.rl-row[data-rl-sel="'+CSS.escape(sel)+'"]')?.focus();
    });
    el.addEventListener('click', async e => {
      if (!isReels()) return;
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      const r = current();
      if (b.dataset.rlSel !== undefined) { selectIdea(b.dataset.rlSel, r, b.classList.contains('rl-row')); return; }
      if (b.dataset.rlPick !== undefined) {
        if (!r || locked(r)) return; const id = b.dataset.rlPick, at = draft.picked.indexOf(id);
        if (at >= 0) { draft.picked.splice(at, 1); refused = ''; }
        else if (draft.picked.length >= toPick(r)) { refused = id; }
        else { draft.picked.push(id); refused = ''; }
        render(); root.querySelector('[data-rl-pick="'+CSS.escape(id)+'"]')?.focus(); return;
      }
      if (b.id === 'rl-generate') { const sig = reuseSig(); if (sig && reuseOk !== sig) { reuseSeen = sig; render(); root.querySelector('#rl-reuse')?.focus(); return; } b.disabled = true; await generate(); return; }
      if (b.id === 'rl-fresh') { const seen = earlier().map(x => x.url || 'reels/'+x.id); reuseOk = reuseSig(); b.disabled = true; await generate({existingSeen:seen}); return; }
      if (!r) return;
      if (b.id === 'rl-start' || b.id === 'rl-retry' || b.id === 'rl-again') { if (starting) return; await startSession(r); return; }
      if (b.id === 'rl-start-fresh' && r.status === 'found') { if (await save(r, {skipExisting:true})) await startSession(r); return; }
      if (b.id === 'rl-stop') { const st = [...(r.stages || [])].reverse().find(x => x.state === 'run')?.name || null; await save(r, {status:'failed', error:'Stopped by Taylor', failedStage:st, stoppedAt:new Date().toISOString()}); render(); return; }
      if (b.id === 'rl-copy') { try { await navigator.clipboard.writeText(lineFor(r.id)); copied = true; } catch { note = 'Copy was blocked by the browser. Select the line and copy it instead.'; } render(); setTimeout(() => { copied = false; render(); }, 2000); return; }
      // Save winners: exactly the pack's count, each with its music tick. It starts no session (Phase 8b continues from here).
      if (b.id === 'rl-save' && r.status === 'pack') {
        if (draft.picked.length !== toPick(r) || !packOk(r)) { render(); return; }
        const at = new Date().toISOString(), winners = Object.fromEntries(draft.picked.map(id => [id, {music:!!draft.music[id], at}]));
        if (await save(r, {winners, winnersSavedAt:at, status:'recording'})) { draftFor = null; render(); root.querySelector('#rl-saved-h')?.focus(); }
        return;
      }
      if (b.id === 'rl-change' && r.status === 'recording' && !(r.recordings || []).some(x => x?.url)) { if (await save(r, {status:'pack', winnersSavedAt:null})) { draftFor = null; render(); root.querySelector('#rl-save')?.focus(); } return; }
    });
  }
  const isReels = () => /^#\/publish\/reels(\/|$)/.test(location.hash);
  function routeTo(bits) {
    // #/publish/reels, #/publish/reels/<id>, #/publish/reels/<id>/reel/<ideaId>
    const id = bits[2] || null;
    if (id !== openId) { openId = id; note = ''; retry = false; draftFor = null; sel = null; }
    if (bits[3] === 'reel' && bits[4]) sel = bits[4];
  }
  async function load() {
    try { await window.WWStore?.connect(); db = window.WWStore?.db?.() || null; } catch { db = null; }
    connecting = false;
    const live = () => { if (!root?.hidden && isReels() && !typing()) render(); else if (isReels() && !openId) refreshCheck(); };
    if (db) {
      db.collection('reels').onSnapshot(snap => { reels = snap.docs.filter(d => d.exists).map(d => ({...d.data(), id:d.id})).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))); live(); }, () => {});
      db.collection('jobs').onSnapshot(snap => { jobs = snap.docs.filter(d => d.exists).map(d => ({...d.data(), id:d.id})).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))); live(); }, () => {});
      db.collection('packs').onSnapshot(snap => { packs = snap.docs.filter(d => d.exists).map(d => ({...d.data(), id:d.id})); live(); }, () => {});
    }
    if (isReels()) render();
  }
  window.WWReels = {
    // Publish calls this for #/publish/reels…; the lane draws itself inside the same #publish section.
    render(el) { if (!root) { root = el; bind(el); } const before = openId; routeTo(location.hash.slice(1).split('/').filter(Boolean).map(s => { try { return decodeURIComponent(s); } catch { return s; } })); if (before === openId && typing()) { refreshCheck(); return; } render(); },
    // The Video lane's link to a job's reels: found from reels.jobId, never stored on the job.
    forJob: jobId => reels.find(r => r.jobId === jobId) || null,
    label: r => STATUS_WORD[r?.status] || r?.status || ''
  };
  phone.addEventListener('change', () => { if (isReels()) render(); });
  setInterval(() => { const r = current(); if (root && !root.hidden && isReels() && r && ['starting','running'].includes(r.status) && !typing()) render(); }, 15000);
  window.addEventListener('ww:data', () => { if (isReels() && !typing()) render(); });
  window.addEventListener('ww:settings', () => { if (isReels() && !typing()) render(); });
  load();
})();
