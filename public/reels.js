/* Reels lane inside Publish (Phases 8a and 8b, 4 November 2026; reels-design.md and Taylor's decisions 4, 6 and 8).
   Publish has two plain text lanes under its heading: Video (#/publish, unchanged) and Reels (#/publish/reels).
   A reel job starts from a Video job's main recording, or from one pasted Drive file or folder link, plus the title word
   for word. Generate saves reels/<id> and starts a Claude Code session with "Run Reels job <id>", which makes the Reel
   highlight pack (With Katana 5.0, master rule 9): six reels on the title, each a hook, three highlights with the value
   given to the end user and their source lines with times, and a close, 60 s or less. Taylor picks exactly two winners
   here and ticks Add music on any reel he wants music under (off means no music).
   Phase 8b: Your recordings (a recording sheet per winner; his phone takes from the Video job's folder or pasted Drive
   links, each matched to a winner with one tap; the YouTube recording, landscape and silent files are refused), Build my
   reels ("Continue Reels job <id> from recordings"), Building (only the stages the session writes), Music (only for the
   winners with music: a track from his Drive music folder, or music off; "Continue Reels job <id> from music") and Ready
   to post (the 9:16 reel, the 4:5 post, the cover and the caption with Copy). Nothing is ever posted (decision 8).
   The lane never writes a Video job (jobs/<id>): a reel job points at its video with jobId, and the Video lane finds it
   from there. Nothing here is ever cut from the main recording: it is read only for its transcript and its times. */
(() => {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ENV = 'env_017PLHsTGZVgThRnUnu1eoGG', REPO = 'https://github.com/taylor585/Whiteboard-Wednesdays';
  const STEPS = ['Drive link','Highlight pack','Your recordings','Music','Ready to post'];
  const BUSY = ['queued','starting','running'];
  const STATUS_WORD = {queued:'not started', starting:'starting', running:'Claude Code is making the highlight pack', found:'found earlier reel work', pack:'highlight pack ready: pick 2 winners', recording:'winners saved: record and match your takes', building:'Claude Code is building your reels', music:'reels built: choose the music', finishing:'Claude Code is finishing your reels', final:'ready to post', failed:'stopped'};
  // The three session lines, one per stop (PUBLISH.md "Reels jobs"), and the status the app sets once each session opened.
  const LINE = {pack:'Run Reels job <id>', recordings:'Continue Reels job <id> from recordings', music:'Continue Reels job <id> from music'};
  const NEXT = {pack:'starting', recordings:'building', music:'finishing'};
  let root = null, db = null, connecting = true, reels = [], jobs = [], packs = [];
  // Intake: from is a Video job id or 'link'; link the pasted text; title and trim as typed.
  let from = null, linkText = '', title = '', titleTouched = false, trim = '', reuseSeen = '', reuseOk = '';
  // A reel job on screen: openId from the route; sel the selected idea; draft the picks and music ticks before Save.
  let openId = null, sel = null, draft = null, draftFor = null, refused = '', note = '', retry = false, starting = false, copied = false, changing = false;
  // Phase 8b: retryStep the line Try again restarts after a refusal; takeText the Drive links being typed; takeWarn the
  // refusals of the last Add; matchNote a refused match {winner, text}; copiedKey which Copy button just copied.
  let retryStep = null, takeText = '', takeWarn = [], matchNote = null, copiedKey = '';
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
  // The step follows the job's own status; a failed job stays on the step its last session was working on.
  const STEP_OF = {new:0, queued:1, starting:1, running:1, found:1, pack:1, recording:2, building:2, music:3, finishing:4, final:4};
  const stepOfSession = r => ({pack:1, recordings:2, music:3})[r?.session?.step] ?? 1;
  function steps(r) {
    const s = r?.status || 'new', failed = s === 'failed', at = failed ? stepOfSession(r) : STEP_OF[s] ?? 1, done = s === 'final';
    const noMusic = r && r.winnersSavedAt && at >= 2 && !winnersOf(r).some(w => w.music);
    const small = i => i === at && failed ? 'stopped' : i === at && s === 'building' ? 'building' : i === at && s === 'finishing' ? 'finishing' : i === 3 && noMusic ? 'none chosen' : '';
    return '<ol class="pb-steps rl-steps" aria-label="Reel steps">'+STEPS.map((n, i) => '<li class="'+(i < at || (done && i === at) ? 'is-done' : i === at ? (failed ? 'is-failed' : 'is-on') : '')+'"'+(i === at ? ' aria-current="step"' : '')+'><b>'+(i+1)+'</b>'+n+(small(i) ? ' <small>'+small(i)+'</small>' : '')+'</li>').join('')+'</ol>';
  }
  const lineFor = (id, step = 'pack') => LINE[step].replace('<id>', id);
  // The step a Start, Try again or Copy belongs to: the one the job's last session was on, or the pack for a new job.
  const stepFor = r => retryStep || (['queued','starting','running','found'].includes(r.status) ? 'pack' : r.session?.step || 'pack');
  const RULES = 'use the skills named on the reels document, write every stage back to reels/<id> in the Whiteboard Wednesdays app artifact';
  function prompt(r, step) {
    const rules = RULES.replace('<id>', r.id);
    if (step === 'recordings') return lineFor(r.id, step)+'. Follow PUBLISH.md "Reels jobs" in this repository exactly: '+rules+', check every phone take (upright, with sound, youtube_guard check-media and check-words) before anything is cut, never cut anything from the YouTube recording except the skill\'s own silent, face-free screen share, never use an AI voice, stop on "music" when a winner has music, and never post anything.';
    if (step === 'music') return lineFor(r.id, step)+'. Follow PUBLISH.md "Reels jobs" in this repository exactly: '+rules+', use only the tracks Taylor picked from his Drive music folder (no music where he chose none), never use an AI voice, and never post anything.';
    return lineFor(r.id)+'. Follow PUBLISH.md "Reels jobs" in this repository exactly: use the skills named on the reels document, read the recording only for its words and times (never cut anything from it), write every stage back to reels/'+r.id+' in the Whiteboard Wednesdays app artifact, stop on "pack" for Taylor to pick two winners, and never post anything.';
  }
  async function save(r, patch) {
    if (!db || !r) return false;
    const at = new Date().toISOString();
    try { await db.doc('reels/'+r.id).update({...patch, updatedAt:at}); Object.assign(r, patch, {updatedAt:at}); note = ''; return true; }
    catch (e) { note = 'Could not save ('+(e?.code || 'error')+'). Try again.'; render(); return false; }
  }
  // The status moves on only after the session has opened; a refusal leaves the job where it was, with Try again.
  // Taylor's answers (takes, music) are already saved on the document, so the line also works when sent in a chat.
  async function startSession(r, step = 'pack') {
    const requestedAt = new Date().toISOString(); starting = true; retry = false; note = ''; render();
    try {
      const mcp = await window.claude?.use?.('mcp'); if (!mcp) throw {code:'unavailable'};
      const res = await mcp.callTool('Claude Code Remote', 'create_session', {environment_id:ENV, source_url:REPO, title:'Reels: '+(r.title || r.id), prompt:prompt(r, step)});
      const p = res?.payload || {}, sid = p.ccr?.id || p.session_id || p.id || p.session?.id || null;
      starting = false; retryStep = null;
      await save(r, {status:NEXT[step], session:{id:sid, url:sid ? 'https://claude.ai/code/'+sid : null, step, requestedAt, startedAt:new Date().toISOString()}, ...(r.status === 'failed' ? {error:null, failedStage:null} : {})});
      render(); return true;
    } catch (e) {
      const why = e?.code === 'not_granted' ? 'You did not allow the Claude Code connection, so it could not start by itself.' : e?.code === 'unavailable' ? 'The Claude Code connection is not available in this view.' : 'Claude Code could not be started ('+(e?.code || e?.message || 'error')+').';
      starting = false; retry = true; retryStep = step; note = why+' Nothing has started. Press Try again, or send “'+lineFor(r.id, step)+'” in a Claude chat.'; render(); return false;
    }
  }
  const STUCK_MIN = {starting:10, running:90, building:90, finishing:90};
  function stuckMinutes(r) {
    const lim = STUCK_MIN[r.status]; if (!lim || starting) return 0;
    const t = r.status === 'starting' ? [r.session?.startedAt || r.updatedAt || r.createdAt] : [r.session?.startedAt, r.updatedAt, ...(r.stages || []).flatMap(x => [x.startedAt, x.endedAt])];
    const last = Math.max(...t.map(x => Date.parse(x)).filter(n => !isNaN(n))); const min = isFinite(last) ? Math.floor((Date.now() - last) / 60000) : 0;
    return min >= lim ? min : 0;
  }
  const failedStage = r => r.failedStage || (r.stages || []).find(x => /^fail/.test(x.state || ''))?.name || '';
  // A later stop shows only the stages of its own session (the pack's stages stay under "How it was made").
  const ownStages = r => { const all = r.stages || [], st = r.session?.step, from = Date.parse(r.session?.requestedAt || r.session?.startedAt || '');
    return st && st !== 'pack' && isFinite(from) ? all.filter(x => !(Date.parse(x.startedAt) < from - 60000)) : all; };
  function stages(r, every = false) {
    const list = every ? r.stages || [] : ownStages(r), ses = r.session?.url ? ' <a class="pb-link" href="'+esc(r.session.url)+'" target="_blank" rel="noopener noreferrer">Watch the session ↗</a>' : '';
    const stuck = stuckMinutes(r), off = starting ? ' disabled' : '', later = r.session?.step && r.session.step !== 'pack';
    const head = r.status === 'failed' ? '<div class="pb-warn pb-failed" role="alert"><p><b>This reel job stopped'+(failedStage(r) ? ' at “'+esc(failedStage(r))+'”' : '')+'.</b> '+esc(r.error || 'Claude Code did not say why.')+'</p><p>'+(later ? 'Nothing was posted. Your winners'+(r.session.step === 'music' ? ', takes and music picks are' : ' and takes are')+' kept.' : 'Nothing was recorded, built or posted.')+ses+'</p><p class="pb-acts"><button type="button" class="pb-link" id="rl-retry"'+off+'>Try again</button></p></div>'
      : stuck ? '<div class="pb-warn pb-stuck" role="alert"><p><b>Claude Code has not reported back</b> for '+(stuck >= 120 ? Math.floor(stuck/60)+' h '+(stuck%60)+' min' : stuck+' minutes')+'. It may have stopped.</p><p class="pb-acts">'+ses+' <button type="button" class="pb-link" id="rl-retry"'+off+'>Try again</button> <button type="button" class="pb-link" id="rl-stop">Stop this job</button></p></div>'
      : r.status === 'queued' ? '<p class="pb-queue"><b>Not started yet.</b> <button type="button" class="pb-link" id="rl-start"'+off+'>Start now</button> or say this in a Claude chat: <code>'+esc(lineFor(r.id))+'</code> <button type="button" class="pb-link" id="rl-copy">'+(copied ? 'Copied' : 'Copy')+'</button></p>'
      : r.status === 'starting' ? '<p class="pb-queue"><b>Starting Claude Code.</b> A session is opening in the cloud with your skills; the steps appear here as it works, usually within two minutes.'+ses+'</p>'
      : r.status === 'running' ? '<p class="pb-meta">Claude Code is making the highlight pack. You can close this tab.'+ses+'</p>'
      : r.status === 'building' ? '<p class="pb-meta rl-working"><b>Claude Code is building your reels.</b> It checks each take first, then cuts, adds the B-roll and the sound. This takes a while; you can close this tab.'+ses+'</p>'
      : r.status === 'finishing' ? '<p class="pb-meta rl-working"><b>Claude Code is finishing your reels:</b> the music you chose, the cover, the 4:5 post and the caption. You can close this tab.'+ses+'</p>' : '';
    const empty = ['building','finishing'].includes(r.status) && !list.length ? '<p class="pb-empty">No stage reported yet. Each one appears here when Claude Code starts it.</p>' : '';
    return '<section class="pb-stages" aria-label="Progress">'+head+empty+(list.length ? '<ol>'+list.map(s => '<li class="is-'+esc(/^fail/.test(s.state || '') ? 'failed' : s.state || 'wait')+'"><b>'+esc(s.name)+'</b><small>'+esc(s.detail || '')+'</small><time>'+(s.state === 'done' ? elapsed(s.startedAt, s.endedAt) : s.state === 'run' ? 'running '+elapsed(s.startedAt) : '')+'</time></li>').join('')+'</ol>' : '')+'</section>';
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
      ? '<div class="pb-bar rl-bar" role="region" aria-label="Your winners"><span class="rl-count" aria-live="polite">Picked <b>'+n+'</b> of '+need+(names.length ? '<span class="rl-names"> · '+esc(names.join(', '))+'</span>' : '')+'</span><span class="pb-muted rl-hint">'+(n < need ? 'Pick '+(need - n === 1 ? 'one more' : need - n)+'. Nothing is recorded or built until you save.' : 'Ready. Saving starts nothing: your recording sheets come next.')+'</span><button type="button" class="pb-go" id="rl-save"'+(n === need && !starting ? '' : ' disabled')+'>Save my '+need+' winners</button></div>' : '';
    return mapHtml(r)+'<div class="rl-pack"><ul class="rl-list" id="rl-list" aria-label="Six reels">'+rows+'</ul>'+(phone.matches ? '' : '<section class="rl-detail" id="rl-detail" aria-live="polite" aria-label="The selected reel">'+(k >= 0 ? detail(r, ideas[k], k) : '')+'</section>')+'</div>'+bar;
  }
  // After Save winners: the picks are locked; Change winners only while no take is matched to a winner.
  const winnersOf = r => { const ideas = ideasOf(r), w = r.winners || {}; return ideas.filter(i => w[i.id]).map(i => ({i, n:ideas.indexOf(i), music:!!w[i.id]?.music})); };
  const matched = r => (r.recordings || []).filter(x => x && x.driveId && (r.winners || {})[x.winnerId]);
  function savedHtml(r) {
    const wins = winnersOf(r), linked = matched(r).length;
    return '<section class="rl-saved" aria-labelledby="rl-saved-h"><h2 id="rl-saved-h" tabindex="-1">Your '+wins.length+' winners are saved</h2><p class="pb-muted">Saved '+esc(when(r.winnersSavedAt))+'. Nothing has been built, and no session is running until you press Build my reels.</p>'+
      '<ul class="rl-wins">'+wins.map(({i, n, music}) => '<li><span class="micro">Reel '+(n+1)+(i.seconds ? ' · about '+esc(Math.round(i.seconds))+' s' : '')+'</span><b>'+esc(i.name || '')+'</b><p>'+esc(i.hook)+'</p><span class="rl-mtag'+(music ? ' is-on' : '')+'">'+(music ? '♪ With music' : 'No music')+'</span></li>').join('')+'</ul>'+
      '<p class="pb-acts">'+(linked ? '<span class="pb-muted">To change winners, unmatch your takes first.</span>' : '<button type="button" class="pb-link" id="rl-change"'+(starting ? ' disabled' : '')+'>Change winners</button>')+'</p></section>';
  }

  // ---- R4 Your recordings: the recording sheets, the phone takes and one-tap matching (Phase 8b) ------------------
  // A take is offered from three places: the Video job's own files (Phase 2 classified each one; only phone reel
  // recordings pass, and the others are listed with the reason they cannot be used; the main recording is never listed),
  // the files Claude Code listed in a folder Taylor pasted here (takesFound), and file links pasted here (takeLinks).
  const mainIds = r => new Set([r.source?.driveId, ...jobs.flatMap(j => (j.sources || []).filter(s => s.role === 'main' || s.kind === 'youtube-recording').map(s => s.driveId))].filter(Boolean));
  const known = (r, id) => (r.takesFound || []).find(x => x.driveId === id) || jobs.flatMap(j => j.sources || []).find(x => x.driveId === id && x.probe) || null;
  function takePool(r) {
    const out = [], seen = new Set(), add = t => { if (!t.driveId || seen.has(t.driveId)) return; seen.add(t.driveId); out.push(t); };
    (r.takesFound || []).forEach(x => add({...x, from:x.folderId ? 'folder' : 'link'}));
    const vj = jobs.find(j => j.id === r.jobId);
    (vj?.sources || []).filter(s => s.driveId && s.role !== 'main' && s.kind !== 'youtube-recording').forEach(s => add({driveId:s.driveId, url:s.url, name:s.name, probe:s.probe, kind:s.kind, decision:s.decision, reason:s.reason, from:'video'}));
    (r.takeLinks || []).forEach(x => { const k = known(r, x.driveId); add({driveId:x.driveId, url:x.url, name:k?.name, probe:k?.probe, kind:k?.kind, decision:k?.decision, reason:k?.reason, from:'link'}); });
    return out;
  }
  // The checks before any session, on what is known about each file: never the YouTube recording, never landscape,
  // never silent, never an output. A file nobody has read yet is "not checked": the session checks it before any cut.
  function verdict(r, t) {
    const p = t.probe;
    if (mainIds(r).has(t.driveId) || t.kind === 'youtube-recording') return {ok:false, why:'This is the YouTube recording. Reels are never cut from it: each one is recorded fresh on your phone.'};
    if (['finished-reel','linkedin-cut'].includes(t.kind)) return {ok:false, why:'This is a finished video, not a phone take.'};
    if (p && p.width && p.height && !(+p.height > +p.width)) return {ok:false, why:'This take is landscape ('+p.width+'×'+p.height+'). Reels need the front camera upright (9:16).'};
    if (p && p.audio === false) return {ok:false, why:'This take has no sound. A reel needs your own voice.'};
    if (p && p.band && p.band !== 'tall') return {ok:false, why:'This take is not 9:16 ('+(p.width && p.height ? p.width+'×'+p.height : p.band)+'). Record upright with the front camera.'};
    if (t.decision === 'reject') return {ok:false, why:t.reason || 'Claude Code could not use this file.'};
    if (!p) return {ok:'unchecked', why:'Not checked yet. Claude checks it is upright, with sound and not from the YouTube video before anything is cut.'};
    return {ok:true, why:'Upright, with sound'};
  }
  const takeMeta = t => { const p = t.probe; return [p?.width && p?.height ? p.width+'×'+p.height : '', p?.seconds ? clock(p.seconds) : '', p ? (p.audio === false ? 'no sound' : p.audio ? 'sound' : '') : '', {video:'in the video’s Drive folder', folder:'in your Drive folder', link:'added by link'}[t.from] || ''].filter(Boolean).join(' · '); };
  const takeName = t => t.name || 'Drive file …'+String(t.driveId || '').slice(-6);
  const pendingFolders = r => (r.takeFolders || []).filter(f => !(r.foldersListed || []).includes(f.folderId));
  const editTakes = r => !starting && (r.status === 'recording' || (r.status === 'failed' && r.session?.step === 'recordings'));
  const scriptText = (i, k) => ['Winner '+(k+1)+': '+(i.name || ''), '', 'Hook: '+i.hook, '', ...i.highlights.map((h, n) => (n+1)+'. '+h.say+'\n   Value given to the end user: '+h.value), '', 'Close: '+i.close].join('\n');
  function checkLine(r, w, rec) {
    const c = (r.checks || {})[w.i.id]; if (!c || !rec || c.driveId !== rec.driveId) return '';
    if (c.state === 'ok') return '<p class="rl-ck is-ok">✓ '+esc([c.shape || '9:16', c.seconds ? clock(c.seconds) : '', c.voice ? 'voice found' : '', c.guard === 'pass' ? 'not from the YouTube video' : ''].filter(Boolean).join(' · '))+'</p>';
    return '<div class="pb-warn rl-ck" role="alert">'+esc(c.note || 'Claude Code could not use this take.')+'</div>';
  }
  function sheetHtml(r, w, k, pool, recs, edit) {
    const {i} = w, rec = recs[i.id], other = id => Object.entries(recs).find(([wid, x]) => wid !== i.id && x.driveId === id);
    const usable = pool.filter(t => verdict(r, t).ok);
    const slot = rec ? '<div class="rl-take is-matched"><span class="pb-shape is-tall" aria-hidden="true"></span><div><b>'+esc(takeName(rec))+'</b><small>'+esc(takeMeta(rec) || 'Drive file …'+String(rec.driveId).slice(-6))+'</small></div>'+(edit ? '<button type="button" class="pb-link" id="rl-un-'+esc(i.id)+'" data-rl-unmatch="'+esc(i.id)+'">Change</button>' : '')+'</div>'+checkLine(r, w, rec)
      : !usable.length ? '<p class="pb-empty">No phone take yet. Add its Drive link under Your phone takes.</p>'
      : '<p class="rl-slot-q" id="rl-slot-q-'+esc(i.id)+'">Which take is this reel? Tap it.</p><div class="rl-slot-opts">'+usable.map(t => { const o = other(t.driveId);
          return '<button type="button" class="rl-takebtn" id="rl-m-'+esc(i.id)+'-'+esc(t.driveId)+'" data-rl-match="'+esc(i.id)+'" data-take="'+esc(t.driveId)+'"'+(edit ? '' : ' disabled')+(o ? ' aria-disabled="true"' : '')+' aria-describedby="rl-slot-q-'+esc(i.id)+'"><b>'+esc(takeName(t))+'</b><small>'+esc(o ? 'Matched to Winner '+(winnersOf(r).findIndex(x => x.i.id === o[0])+1) : takeMeta(t))+'</small></button>'; }).join('')+'</div>';
    return '<article class="rl-sheet" aria-labelledby="rl-sh-'+esc(i.id)+'"><span class="micro">Winner '+(k+1)+(i.seconds ? ' · about '+esc(Math.round(i.seconds))+' s' : '')+' · '+(w.music ? '♪ with music' : 'no music')+'</span>'+
      '<h3 id="rl-sh-'+esc(i.id)+'">'+esc(i.name || 'Reel '+(w.n+1))+'</h3>'+
      '<div class="rl-sh-sec"><h4>Hook <span>say it first: it is on screen from frame 1</span></h4><p class="rl-sh-hook">'+esc(i.hook)+'</p></div>'+
      '<ol class="rl-sh-hls">'+i.highlights.map((h, n) => '<li><span class="rl-sh-n" aria-hidden="true">'+(n+1)+'</span><div>'+(h.head ? '<h5>'+esc(h.head)+'</h5>' : '')+'<p class="rl-sh-say">'+esc(h.say)+'</p><p class="rl-sh-val"><b>Value given to the end user:</b> '+esc(h.value)+'</p></div></li>').join('')+'</ol>'+
      '<div class="rl-sh-sec"><h4>Close <span>back to the title</span></h4><p class="rl-sh-close">'+esc(i.close)+'</p></div>'+
      '<p class="rl-sh-rules">Front camera · upright 9:16 · your own words · the finished reel is 60 seconds or less, so a longer take is fine</p>'+
      '<p class="pb-acts"><button type="button" class="pb-link" id="rl-cs-'+esc(i.id)+'" data-rl-script="'+esc(i.id)+'">'+(copiedKey === 'script:'+i.id ? 'Copied' : 'Copy script')+'</button></p>'+
      '<div class="rl-slot" role="group" aria-label="Your take for Winner '+(k+1)+'"><span class="micro">Your take</span>'+slot+
      (matchNote?.winner === i.id ? '<p class="rl-note" role="alert">'+esc(matchNote.text)+'</p>' : '')+'</div></article>';
  }
  function takesHtml(r, pool, recs, edit) {
    const by = Object.fromEntries(Object.entries(recs).map(([wid, x]) => [x.driveId, wid])), wins = winnersOf(r);
    const rows = pool.map(t => { const v = verdict(r, t), wid = by[t.driveId], k = wins.findIndex(x => x.i.id === wid);
      return '<li class="rl-take '+(v.ok === true ? 'is-ok' : v.ok ? 'is-unchecked' : 'is-bad')+'"><span class="pb-shape '+(!t.probe ? 'is-other' : +t.probe.height > +t.probe.width ? 'is-tall' : t.probe.band === 'ultrawide' ? 'is-ultra' : 'is-wide')+'" aria-hidden="true"></span><div><b>'+esc(takeName(t))+'</b><small>'+esc(takeMeta(t))+'</small><small class="rl-why">'+(v.ok ? '' : '<em class="pb-badge is-reject">Cannot be used</em> ')+esc(v.why)+'</small></div>'+
        (k >= 0 ? '<span class="rl-chip is-static">Winner '+(k+1)+'</span>' : edit && t.from === 'link' ? '<button type="button" class="pb-link" id="rl-rm-'+esc(t.driveId)+'" data-rl-remove="'+esc(t.driveId)+'">Remove</button>' : '')+'</li>'; });
    const folders = pendingFolders(r).map(f => '<li class="rl-take is-unchecked"><span class="pb-shape is-folder" aria-hidden="true"></span><div><b>Drive folder …'+esc(String(f.folderId).slice(-6))+'</b><small class="rl-why">Claude Code lists it and checks each file (a few MB each), then you match each take here.</small></div>'+(edit ? '<button type="button" class="pb-link" id="rl-rmf-'+esc(f.folderId)+'" data-rl-remove-folder="'+esc(f.folderId)+'">Remove</button>' : '')+'</li>');
    const all = rows.concat(folders);
    return '<section class="rl-takes" aria-labelledby="rl-takes-h"><h3 id="rl-takes-h">Your phone takes</h3><p class="pb-muted">From the video’s Drive folder and any links you add. The YouTube recording, landscape files and files with no sound are refused.</p>'+
      (all.length ? '<ul class="rl-take-list">'+all.join('')+'</ul>' : '<p class="pb-empty">No phone takes yet. Record each winner, put the takes in Drive, and add the link here.</p>')+
      (edit ? '<div class="rl-add"><label class="pb-field" for="rl-take-link"><span>Add phone takes from Drive <i class="pb-opt-note">a file link for each take, or the folder they are in</i></span><input id="rl-take-link" type="url" inputmode="url" spellcheck="false" autocomplete="off" maxlength="1000" placeholder="https://drive.google.com/file/d/…" value="'+esc(takeText)+'"></label><button type="button" class="pb-go rl-add-go" id="rl-take-add">Add</button></div>'+
        (takeWarn.length ? '<div class="pb-warn" id="rl-take-warn" role="alert">'+(takeWarn.length === 1 ? esc(takeWarn[0]) : '<ul>'+takeWarn.map(x => '<li>'+esc(x)+'</li>').join('')+'</ul>')+'</div>' : '') : '')+'</section>';
  }
  function recordHtml(r) {
    const wins = winnersOf(r), pool = takePool(r), edit = editTakes(r);
    const recs = Object.fromEntries(matched(r).map(x => [x.winnerId, {...x, ...(pool.find(t => t.driveId === x.driveId) || {})}]));
    const good = wins.filter(w => recs[w.i.id] && verdict(r, recs[w.i.id]).ok).length, folders = pendingFolders(r).length;
    const listOnly = good < wins.length && folders > 0;
    const can = db && edit && (good === wins.length || listOnly);
    const hint = good === wins.length ? 'Claude Code checks each take, then builds '+(wins.length === 2 ? 'both reels' : 'your reels')+'. This runs by itself and uses your Claude plan’s usage.' : listOnly ? 'Claude Code lists your folder and checks each file, then stops for you to match them here.' : 'Match a take to each winner. Nothing is built until you press Build.';
    const bar = edit ? '<div class="pb-bar rl-bar" role="region" aria-label="Your takes"><span class="rl-count" aria-live="polite">Matched <b>'+good+'</b> of '+wins.length+'</span><span class="pb-muted rl-hint">'+esc(hint)+'</span><button type="button" class="pb-go" id="rl-build"'+(can ? '' : ' disabled')+'>'+(listOnly ? 'List my folder →' : 'Build my reels →')+'</button></div>' : '';
    return '<section class="rl-rec" aria-labelledby="rl-rec-h"><div class="rl-rec-head"><h2 id="rl-rec-h" tabindex="-1">Record your '+wins.length+' winners</h2><p class="pb-muted">On your phone: front camera, upright, in your own words. Put the takes in Drive, then tap the take that belongs to each reel.</p></div>'+
      (r.checkNote && ['recording','failed'].includes(r.status) ? '<div class="pb-warn" role="alert">'+esc(r.checkNote)+'</div>' : '')+
      '<div class="rl-sheets">'+wins.map((w, k) => sheetHtml(r, w, k, pool, recs, edit)).join('')+'</div>'+takesHtml(r, pool, recs, edit)+bar+'</section>';
  }
  // R5 Building: the matched takes, under the stages the session writes.
  function takesLine(r) {
    const wins = winnersOf(r), pool = takePool(r), recs = Object.fromEntries(matched(r).map(x => [x.winnerId, {...x, ...(pool.find(t => t.driveId === x.driveId) || {})}]));
    return '<ul class="rl-using">'+wins.map((w, k) => '<li><span class="micro">Winner '+(k+1)+(w.music ? ' · ♪ with music' : ' · no music')+'</span><b>'+esc(w.i.name || '')+'</b><small>'+(recs[w.i.id] ? 'Take: '+esc(takeName(recs[w.i.id])) : 'No take matched')+'</small>'+checkLine(r, w, recs[w.i.id])+'</li>').join('')+'</ul>';
  }

  // ---- R6 Music: only the reels whose winner has Add music on (decision 6); a track from the Drive folder, or off ----
  const builtOf = r => (Array.isArray(r.built) ? r.built : []).filter(b => b && b.id);
  const reelName = (r, b) => { const w = winnersOf(r).find(x => x.i.id === b.winnerId); return w?.i.name || 'Reel '+b.id; };
  const tracks = r => (Array.isArray(r.music?.tracks) ? r.music.tracks : []).filter(t => t && t.n != null);
  const trackLabel = t => String(t.n).padStart(2, '0')+' '+(t.title || 'Track')+(t.seconds ? ' · '+clock(t.seconds) : '');
  const pickOf = (r, id) => (r.musicPicks || {})[id] || null;
  const musicDone = (r, b) => { const p = pickOf(r, b.id); return !!p && (p.off === true || tracks(r).some(t => String(t.n) === String(p.track))); };
  const editMusic = r => !starting && (r.status === 'music' || (r.status === 'failed' && r.session?.step === 'music'));
  function previewHtml(b, name) {
    const url = httpsUrl(b.preview), still = httpsUrl(b.still);
    return url ? '<a class="rl-prev" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+(still ? '<img src="'+esc(still)+'" alt="" loading="lazy">' : '<span class="rl-prev-ph" aria-hidden="true">9:16</span>')+'<span class="rl-prev-t">Watch '+esc(name)+' ↗<small>no music yet</small></span></a>' : '<span class="rl-prev is-none"><span class="rl-prev-ph" aria-hidden="true">9:16</span><span class="rl-prev-t">No preview link</span></span>';
  }
  function musicCard(r, b, edit) {
    const lib = tracks(r), prop = ((r.music?.proposals || {})[b.id] || []).map(n => lib.find(t => String(t.n) === String(n))).filter(Boolean);
    const p = pickOf(r, b.id), cur = p?.off ? 'off' : p?.track != null ? String(p.track) : '', rest = lib.filter(t => !prop.includes(t)), name = reelName(r, b), dis = edit ? '' : ' disabled';
    const g = 'rl-tr-'+b.id, w = winnersOf(r).findIndex(x => x.i.id === b.winnerId);
    const radio = (val, body, extra = '') => '<div class="rl-trk'+(cur === val ? ' is-on' : '')+'"><label for="'+esc(g+'-'+val)+'"><input type="radio" name="'+esc(g)+'" id="'+esc(g+'-'+val)+'" value="'+esc(val)+'" data-rl-track="'+esc(b.id)+'"'+(cur === val ? ' checked' : '')+dis+'>'+body+'</label>'+extra+'</div>';
    const play = t => httpsUrl(t.url) ? '<a class="pb-link rl-play" href="'+esc(httpsUrl(t.url))+'" target="_blank" rel="noopener noreferrer" aria-label="Play '+esc(trackLabel(t))+' on Drive">Play ↗</a>' : '';
    const other = rest.find(t => String(t.n) === cur);
    return '<article class="rl-mcard" aria-labelledby="rl-mc-'+esc(b.id)+'">'+previewHtml(b, 'Reel '+b.id)+'<div class="rl-mc-main"><span class="micro">Reel '+esc(b.id)+(b.seconds ? ' · '+esc(clock(b.seconds)) : '')+(w >= 0 ? ' · from Winner '+(w+1) : '')+'</span><h3 id="rl-mc-'+esc(b.id)+'">'+esc(name)+'</h3>'+
      '<fieldset class="rl-tracks"><legend>Music for Reel '+esc(b.id)+'</legend>'+
      (prop.length ? '<p class="rl-tracks-h">Claude’s picks from your music folder</p>'+prop.map(t => radio(String(t.n), '<span class="rl-tn" aria-hidden="true">'+esc(String(t.n).padStart(2, '0'))+'</span><span class="rl-tt"><b>'+esc(t.title || 'Track')+'</b><small>'+esc([t.folder, t.seconds ? clock(t.seconds) : '', t.why].filter(Boolean).join(' · '))+'</small></span>', play(t))).join('') : '')+
      (rest.length ? '<label class="pb-field rl-other" for="rl-oth-'+esc(b.id)+'"><span>'+(prop.length ? 'Or another track from your folder' : 'A track from your folder')+'</span><select id="rl-oth-'+esc(b.id)+'" data-rl-other="'+esc(b.id)+'"'+dis+'><option value=""'+(other ? '' : ' selected')+'>Choose a track…</option>'+rest.map(t => '<option value="'+esc(String(t.n))+'"'+(other === t ? ' selected' : '')+'>'+esc(trackLabel(t))+'</option>').join('')+'</select></label>'+(other ? '<p class="rl-chosen">Chosen: '+esc(trackLabel(other))+' '+play(other)+'</p>' : '') : '')+
      radio('off', '<span class="rl-tn is-off" aria-hidden="true">—</span><span class="rl-tt"><b>No music for this reel</b><small>Your voice and the sound effects only</small></span>')+
      '</fieldset></div></article>';
  }
  function musicBoard(r) {
    const built = builtOf(r), withM = built.filter(b => b.music), without = built.filter(b => !b.music), edit = editMusic(r), lib = tracks(r);
    const done = withM.filter(b => musicDone(r, b)).length, can = db && edit && withM.length && done === withM.length;
    return '<section class="rl-music-board" aria-labelledby="rl-mb-h"><h2 id="rl-mb-h" tabindex="-1">Choose the music</h2><p class="pb-muted">'+(withM.length === 1 ? 'One reel has Add music on.' : withM.length+' reels have Add music on.')+' Pick a track from your Drive music folder for each, or switch its music off. '+(r.music?.note ? esc(r.music.note) : '')+'</p>'+
      (!lib.length ? '<div class="pb-warn" role="alert">Claude Code couldn’t list your music folder, so there are no tracks to choose. Check that it is shared as Anyone with the link, then press Try again below; or switch the music off.</div>' : '')+
      '<div class="rl-mgrid">'+withM.map(b => musicCard(r, b, edit)).join('')+'</div>'+
      (without.length ? '<ul class="rl-nomusic">'+without.map(b => '<li>'+previewHtml(b, 'Reel '+b.id)+'<div><span class="micro">Reel '+esc(b.id)+(b.seconds ? ' · '+esc(clock(b.seconds)) : '')+'</span><b>'+esc(reelName(r, b))+'</b><small>No music: you left Add music off. It is finished as it is.</small></div></li>').join('')+'</ul>' : '')+
      (edit ? '<div class="pb-bar rl-bar" role="region" aria-label="Your music"><span class="rl-count" aria-live="polite">Chosen <b>'+done+'</b> of '+withM.length+'</span><span class="pb-muted rl-hint">'+(done < withM.length ? 'Choose a track or No music for every reel with music.' : 'Claude Code adds the music, the cover, the 4:5 post and the caption.')+'</span>'+
        (!lib.length && r.status === 'music' ? '<button type="button" class="pb-link rl-bar-link" id="rl-music-retry">Try again</button>' : '')+'<button type="button" class="pb-go" id="rl-finish"'+(can ? '' : ' disabled')+'>Finish my reels →</button></div>' : '')+'</section>';
  }

  // ---- R7 Ready to post: per reel the 9:16 reel, the 4:5 post, the cover and the caption with Copy (decision 8) -----
  const PH = /\[[A-Z][A-Z0-9 _-]{2,}\]|\{\{|\}\}/;
  function readyHtml(r) {
    const built = builtOf(r), finals = Array.isArray(r.finals) ? r.finals : [], caps = Array.isArray(r.captions) ? r.captions : [];
    const ids = built.length ? built.map(b => b.id) : [...new Set(finals.map(f => f.reelId))];
    const KIND = {reel:'9:16 reel', post:'4:5 post', cover:'Cover'};
    const card = id => { const b = built.find(x => x.id === id) || {id}, fs = finals.filter(f => f.reelId === id && httpsUrl(f.url)), c = caps.find(x => x.reelId === id), p = pickOf(r, id);
      const tr = p?.track != null && !p.off ? tracks(r).find(t => String(t.n) === String(p.track)) : null;
      const music = b.music === false || p?.off ? 'no music' : tr ? 'music: '+trackLabel(tr).replace(/ · .*$/, '') : '';
      const cover = fs.find(f => f.kind === 'cover');
      const bad = c && PH.test(c.text || '');
      return '<article class="rl-rd" aria-labelledby="rl-rd-'+esc(id)+'"><div class="rl-rd-head"><span class="micro">Reel '+esc(id)+(b.seconds ? ' · '+esc(clock(b.seconds)) : '')+(music ? ' · '+esc(music) : '')+'</span><h3 id="rl-rd-'+esc(id)+'">'+esc(reelName(r, b))+'</h3></div>'+
        '<div class="rl-rd-body"><div class="rl-files">'+['reel','post','cover'].map(k => { const f = fs.find(x => x.kind === k);
          return f ? '<a class="rl-file is-'+k+'" href="'+esc(httpsUrl(f.url))+'" target="_blank" rel="noopener noreferrer">'+(k === 'cover' && httpsUrl(f.image || '') ? '<img src="'+esc(httpsUrl(f.image))+'" alt="" loading="lazy">' : '<span class="rl-fr" aria-hidden="true"></span>')+'<b>'+esc(f.label || KIND[k])+' ↗</b>'+(f.detail ? '<small>'+esc(f.detail)+'</small>' : '')+'</a>' : '<span class="rl-file is-'+k+' is-none"><span class="rl-fr" aria-hidden="true"></span><b>'+KIND[k]+'</b><small>Not written yet</small></span>'; }).join('')+'</div>'+
        '<div class="rl-cap"><span class="micro">Caption'+(c?.check ? ' · '+(c.check === 'pass' ? 'checked by Performance Poster' : esc(c.check)) : '')+'</span>'+(c?.text ? '<pre class="pb-copy" id="rl-cap-'+esc(id)+'">'+esc(c.text)+'</pre>'+
          (bad ? '<div class="pb-warn" role="alert">This caption still has a placeholder, so it cannot be copied. Ask Claude Code to write it again.</div>' : '<p class="pb-acts"><button type="button" class="pb-go rl-copy-cap" id="rl-cc-'+esc(id)+'" data-rl-cap="'+esc(id)+'">'+(copiedKey === 'cap:'+id ? 'Copied' : 'Copy caption')+'</button></p>') : '<p class="pb-muted">No caption written yet.</p>')+'</div></div></article>'; };
    return '<section class="rl-ready" aria-labelledby="rl-ready-h"><h2 id="rl-ready-h" tabindex="-1">Your reels are ready to post</h2><p class="pb-muted">'+esc(r.finalNote || 'Every file is on your private review page. Nothing has been posted.')+(httpsUrl(r.reviewUrl) ? ' <a class="pb-link" href="'+esc(httpsUrl(r.reviewUrl))+'" target="_blank" rel="noopener noreferrer">Open the review page ↗</a>' : '')+'</p>'+
      ids.map(card).join('')+
      '<div class="rl-howto"><b>Posting by hand on Instagram</b><ol><li>Post the 9:16 file as a Reel. At the crop step choose <b>Original</b>: Instagram starts on a square that cuts the top and bottom off.</li><li>Post the 4:5 file as a post, and open the crop out before Next. A post’s crop cannot be changed after it is shared.</li><li>Set the cover from the cover image.</li><li>Post on or after the YouTube video goes out: each caption says the full video is on YouTube.</li></ol></div>'+
      '<div class="pb-post"><div><b>Post all</b><p class="pb-muted">Posting needs the Instagram connection, which is not set up yet. Until then, post by hand: open each file, copy each caption and paste it in. Nothing has been posted.</p></div><div class="pb-copies"><button type="button" class="pb-go" disabled>Post all</button></div></div></section>';
  }
  function musicSummary(r) {
    const built = builtOf(r); if (!built.length) return '';
    return '<ul class="rl-using">'+built.map(b => { const p = pickOf(r, b.id), tr = p?.track != null && !p.off ? tracks(r).find(t => String(t.n) === String(p.track)) : null;
      return '<li><span class="micro">Reel '+esc(b.id)+'</span><b>'+esc(reelName(r, b))+'</b><small>'+(b.music === false || p?.off ? 'No music' : tr ? 'Music: '+esc(trackLabel(tr)) : 'Music not chosen')+'</small></li>'; }).join('')+'</ul>';
  }
  // The pack stays one tap away once the winners are saved, closed so the recording sheets come first.
  const packBelow = r => '<details class="rl-whole"><summary>The whole highlight pack</summary>'+packHtml(r)+'</details>';

  // ---- Render ------------------------------------------------------------------------------------------------------
  const tabs = () => window.WWPublish?.laneTabs ? window.WWPublish.laneTabs('reels') : '';
  function body(r) {
    const s = r.status, step = r.session?.step || 'pack';
    if (s === 'found') return foundHtml(r)+stages(r);
    if (s === 'pack') return packHtml(r);
    if (s === 'failed') return step === 'recordings' && r.winnersSavedAt ? stages(r)+recordHtml(r) : step === 'music' && builtOf(r).length ? stages(r)+musicBoard(r) : stages(r)+(r.pack ? packHtml(r) : '');
    if (s === 'recording') return savedHtml(r)+recordHtml(r)+packBelow(r);
    if (s === 'building') return stages(r)+takesLine(r);
    if (s === 'music') return (r.stages?.length ? '<details class="rl-whole"><summary>How the build went</summary>'+stages(r, true)+'</details>' : '')+musicBoard(r);
    if (s === 'finishing') return stages(r)+musicSummary(r);
    if (s === 'final') return readyHtml(r)+(r.stages?.length ? '<details class="rl-whole"><summary>How it was made</summary>'+stages(r, true)+'</details>' : '');
    return stages(r);
  }
  function render() {
    if (!root || root.hidden) return;
    const a = document.activeElement, fid = a && root.contains(a) ? a.id || (a.dataset?.rlSel ? 'sel:'+a.dataset.rlSel+':'+(a.classList.contains('rl-row') ? 'row' : 'seg') : a.dataset?.rlPick ? 'pick:'+a.dataset.rlPick : '') : '';
    const caret = a && /^(INPUT|TEXTAREA)$/.test(a.tagName) && a.type !== 'checkbox' && a.type !== 'radio' ? [a.selectionStart, a.selectionEnd] : null;
    const r = openId ? current() : null;
    const head = r ? (allTopics().find(t => t.id === r.topicId)?.title || r.title || 'Reels') : 'Reels from this week’s video';
    const LEDE = {recording:'Record your two winners on your phone, then match each take to its reel. Claude Code builds the reels from your takes, never from the YouTube video.', building:'Claude Code is building your reels from your phone takes. Each stage appears below as it happens.', music:'Your reels are built. Choose the music for each reel that has Add music on.', finishing:'Claude Code is finishing your reels. Each stage appears below as it happens.', final:'Your reels, their 4:5 posts, covers and captions, ready to post by hand.'};
    const lede = r ? (LEDE[r.status] || (r.status === 'failed' && LEDE[{recordings:'recording', music:'music'}[r.session?.step]]) || (['pack'].includes(r.status) && packOk(r) ? 'Six reels on the title, three highlights each. Pick the two you’ll record on your phone. Nothing is recorded or built until you save your winners.' : 'Claude Code makes six reel ideas from the recording’s words, three highlights each, and stops for you to pick two.')) : 'Start from a video’s main recording. Claude Code makes six reel ideas on its title, three highlights each, and you pick the two you’ll record on your phone.';
    const EYEBROW = {recording:'YOUR RECORDINGS', building:'BUILDING YOUR REELS', music:'MUSIC', finishing:'READY TO POST', final:'READY TO POST'};
    root.innerHTML = '<div class="pb-head"><div><div class="micro">PUBLISH · REELS · '+(EYEBROW[r?.status] || 'REEL HIGHLIGHT PACK')+'</div><h1 id="pb-heading">'+esc(head)+'</h1><p>'+esc(lede)+'</p></div>'+(r ? '<a class="pb-link rl-new" href="#/publish/reels">Start new reels</a>' : '')+'</div>'+tabs()+
      (openId && !r ? '<div class="pb-warn" role="status">'+(db ? 'This reel job isn’t in the app’s database. <a href="#/publish/reels">Start new reels</a>' : connecting ? 'Loading…' : 'Reel jobs are saved in the app’s database, which this preview doesn’t have.')+'</div>' : steps(r))+
      (note ? '<div class="pb-warn" role="status"><p>'+esc(note)+'</p>'+(retry && r ? '<p class="pb-acts"><button type="button" class="pb-link" id="rl-retry"'+(starting ? ' disabled' : '')+'>Try again</button> <button type="button" class="pb-link" id="rl-copy">'+(copied ? 'Copied' : 'Copy the line')+'</button></p>' : '')+'</div>' : '')+
      (!openId ? intake() : !r ? '' : '<p class="pb-meta">Reel job '+esc(r.id)+' · from '+esc(r.source?.kind === 'job' ? 'the main recording of a Video job · Drive file …'+String(r.source.driveId || '').slice(-6) : r.source?.kind === 'folder' ? 'Drive folder …'+String(r.source.folderId || '').slice(-6) : 'Drive file …'+String(r.source?.driveId || '').slice(-6))+
        (r.pack?.skill ? ' · written by '+esc(skillName(r.pack.skill)) : '')+(r.pack?.builtWith ? ' · checked by '+esc(r.pack.builtWith) : '')+(Number.isFinite(+r.offsetS) && +r.offsetS > 0 ? ' · YouTube trim '+esc(r.offsetS)+' s' : '')+' · started '+esc(when(r.createdAt))+'</p>'+
        body(r));
    if (fid) {
      const m = fid.match(/^(sel|pick):([^:]+)(?::(row|seg))?$/), el = m ? root.querySelector(m[1] === 'pick' ? '[data-rl-pick="'+CSS.escape(m[2])+'"]' : (m[3] === 'seg' ? '.rl-seg' : '.rl-row')+'[data-rl-sel="'+CSS.escape(m[2])+'"]') : document.getElementById(fid);
      if (el) { el.focus({preventScroll:true}); if (caret && el.setSelectionRange) try { el.setSelectionRange(caret[0], caret[1]); } catch {} }
    }
  }
  // Typing refreshes only the check panel, so a field keeps its caret.
  const refreshCheck = () => { const c = root?.querySelector('#rl-check'); if (c) c.innerHTML = checkHtml(); };
  const typing = () => { const a = document.activeElement; return a && root?.contains(a) && /^rl-/.test(a.id || '') && /^(INPUT|TEXTAREA)$/.test(a.tagName) && !['checkbox','radio'].includes(a.type); };
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
  // ---- Phase 8b actions: add takes, match one with a tap, Build, music picks, Finish, Copy --------------------------
  async function addTakes(r) {
    if (!editTakes(r)) return;
    const parts = takeText.split(/[\s,]+/).filter(Boolean), out = [], links = [...(r.takeLinks || [])], folders = [...(r.takeFolders || [])], at = new Date().toISOString(), pool = takePool(r);
    if (!parts.length) { takeWarn = ['Paste the Drive link of a phone take, or of the folder your takes are in.']; render(); document.getElementById('rl-take-link')?.focus(); return; }
    const left = [];
    for (const u of parts) {
      const p = parse(u);
      if (p.kind === 'file') {
        const t = {driveId:p.id, url:u, from:'link', ...(known(r, p.id) || {})}, v = verdict(r, t);
        if (mainIds(r).has(p.id)) { out.push('That is the YouTube recording, not a phone take. Reels are never cut from it.'); left.push(u); }
        else if (pool.some(x => x.driveId === p.id) || links.some(x => x.driveId === p.id)) out.push('That take is already here.');
        else if (!v.ok) { out.push(v.why); left.push(u); }
        else if (links.length >= 10) { out.push('Up to 10 take links. Remove one first.'); left.push(u); }
        else links.push({driveId:p.id, url:u, at});
      } else if (p.kind === 'folder' && p.folderId) {
        if (folders.some(f => f.folderId === p.folderId)) out.push('That folder is already here.');
        else folders.push({folderId:p.folderId, url:u, at});
      } else { out.push(p.kind === 'doc' ? 'That is a Google Docs, Sheets or Slides link, not a video.' : p.kind === 'folder' ? 'That is not a shared Drive folder link. Open the folder in Drive, choose Share, Copy link, and paste that.' : 'That isn’t a Google Drive link.'); left.push(u); }
    }
    takeWarn = [...new Set(out)];
    const changed = links.length !== (r.takeLinks || []).length || folders.length !== (r.takeFolders || []).length;
    if (changed && !(await save(r, {takeLinks:links, takeFolders:folders}))) return;
    takeText = left.join(' '); render(); document.getElementById(takeWarn.length ? 'rl-take-link' : 'rl-take-add')?.focus();
  }
  async function matchTake(r, wid, driveId) {
    if (!editTakes(r)) return;
    const recs = matched(r), other = recs.find(x => x.driveId === driveId && x.winnerId !== wid), wins = winnersOf(r);
    if (other) { matchNote = {winner:wid, text:'That take is already matched to Winner '+(wins.findIndex(x => x.i.id === other.winnerId)+1)+'. Change it there first.'}; render(); document.getElementById('rl-m-'+wid+'-'+driveId)?.focus(); return; }
    const t = takePool(r).find(x => x.driveId === driveId); if (!t || !verdict(r, t).ok) { matchNote = {winner:wid, text:t ? verdict(r, t).why : 'That take is not here any more.'}; render(); return; }
    matchNote = null;
    const rec = {winnerId:wid, driveId, url:t.url || null, name:t.name || null, from:t.from, probe:t.probe || null, by:'taylor', at:new Date().toISOString()};
    if (await save(r, {recordings:[...recs.filter(x => x.winnerId !== wid), rec]})) { render(); document.getElementById('rl-un-'+wid)?.focus(); }
  }
  async function pickMusic(r, reelId, v) {
    const picks = {...(r.musicPicks || {})}, at = new Date().toISOString();
    picks[reelId] = v === 'off' ? {off:true, track:null, by:'taylor', at} : {off:false, track:/^\d+$/.test(v) ? +v : v, by:'taylor', at};
    if (await save(r, {musicPicks:picks})) render();
  }
  async function copyText(key, text) {
    try { await navigator.clipboard.writeText(text); copiedKey = key; } catch { note = 'Copy was blocked by the browser. Select the text and copy it instead.'; }
    render(); const k = key; setTimeout(() => { if (copiedKey === k) { copiedKey = ''; render(); } }, 2000);
  }
  async function clickLater(b, r) {
    const d = b.dataset;
    if (b.id === 'rl-take-add') { await addTakes(r); return true; }
    if (d.rlMatch !== undefined) { await matchTake(r, d.rlMatch, d.take); return true; }
    if (d.rlUnmatch !== undefined) { if (!editTakes(r)) return true; matchNote = null; const wid = d.rlUnmatch; if (await save(r, {recordings:matched(r).filter(x => x.winnerId !== wid)})) { render(); root.querySelector('[data-rl-match="'+CSS.escape(wid)+'"]')?.focus(); } return true; }
    if (d.rlRemove !== undefined) { if (!editTakes(r) || matched(r).some(x => x.driveId === d.rlRemove)) return true; if (await save(r, {takeLinks:(r.takeLinks || []).filter(x => x.driveId !== d.rlRemove)})) { render(); document.getElementById('rl-take-link')?.focus(); } return true; }
    if (d.rlRemoveFolder !== undefined) { if (!editTakes(r)) return true; if (await save(r, {takeFolders:(r.takeFolders || []).filter(x => x.folderId !== d.rlRemoveFolder)})) { render(); document.getElementById('rl-take-link')?.focus(); } return true; }
    if (d.rlScript !== undefined) { const w = winnersOf(r), k = w.findIndex(x => x.i.id === d.rlScript); if (k >= 0) await copyText('script:'+d.rlScript, scriptText(w[k].i, k)); return true; }
    if (d.rlCap !== undefined) { const c = (r.captions || []).find(x => x.reelId === d.rlCap); if (c?.text && !PH.test(c.text)) await copyText('cap:'+d.rlCap, c.text); return true; }
    if (b.id === 'rl-build') {
      if (!editTakes(r)) return true;
      const wins = winnersOf(r), pool = takePool(r), good = wins.filter(w => { const x = matched(r).find(m => m.winnerId === w.i.id), t = x && (pool.find(p => p.driveId === x.driveId) || x); return t && verdict(r, t).ok; }).length;
      if (good !== wins.length && !pendingFolders(r).length) { render(); return true; }
      await startSession(r, 'recordings'); return true;
    }
    if (b.id === 'rl-finish') {
      if (!editMusic(r)) return true;
      const withM = builtOf(r).filter(x => x.music); if (!withM.length || !withM.every(x => musicDone(r, x))) { render(); return true; }
      await startSession(r, 'music'); return true;
    }
    return false;
  }
  function bind(el) {
    el.addEventListener('input', e => {
      if (!isReels()) return;
      const id = e.target.id;
      if (id === 'rl-link') { linkText = e.target.value; refreshCheck(); return; }
      if (id === 'rl-title') { title = e.target.value; titleTouched = true; refreshCheck(); return; }
      if (id === 'rl-trim') { trim = e.target.value; refreshCheck(); return; }
      if (id === 'rl-take-link') { takeText = e.target.value; return; }
    });
    el.addEventListener('change', e => {
      if (!isReels()) return;
      if (e.target.name === 'rl-from') { from = e.target.value; if (from !== 'link') titleTouched = false; else if (!titleTouched) title = ''; render(); root.querySelector('input[name="rl-from"]:checked')?.focus(); return; }
      const tk = e.target.dataset?.rlTrack ?? e.target.dataset?.rlOther;
      if (tk !== undefined) { const r = current(); if (!r || !editMusic(r)) { render(); return; } const v = e.target.value; if (!v) return;
        const fid = e.target.id; pickMusic(r, tk, v).then(() => document.getElementById(fid)?.focus()); return; }
      const m = e.target.dataset?.rlMusic; if (m !== undefined) { const r = current(); if (!r || locked(r)) { render(); return; } draft.music[m] = e.target.checked; render(); root.querySelector('[data-rl-music="'+CSS.escape(m)+'"]')?.focus(); }
    });
    el.addEventListener('keydown', e => {
      if (isReels() && e.key === 'Enter' && e.target.id === 'rl-take-link') { e.preventDefault(); const r = current(); if (r) addTakes(r); return; }
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
      if (b.id === 'rl-start' || b.id === 'rl-again') { if (starting) return; await startSession(r); return; }
      if (b.id === 'rl-retry') { if (starting) return; await startSession(r, stepFor(r)); return; }
      if (b.id === 'rl-music-retry') { if (starting || r.status !== 'music') return; await startSession(r, 'music'); return; }
      if (b.id === 'rl-start-fresh' && r.status === 'found') { if (await save(r, {skipExisting:true})) await startSession(r); return; }
      if (b.id === 'rl-stop') { const st = [...(r.stages || [])].reverse().find(x => x.state === 'run')?.name || null; await save(r, {status:'failed', error:'Stopped by Taylor', failedStage:st, stoppedAt:new Date().toISOString()}); render(); return; }
      if (b.id === 'rl-copy') { try { await navigator.clipboard.writeText(lineFor(r.id, stepFor(r))); copied = true; } catch { note = 'Copy was blocked by the browser. Select the line and copy it instead.'; } render(); setTimeout(() => { copied = false; render(); }, 2000); return; }
      // Save winners: exactly the pack's count, each with its music tick. It starts no session (Phase 8b continues from here).
      if (b.id === 'rl-save' && r.status === 'pack') {
        if (draft.picked.length !== toPick(r) || !packOk(r)) { render(); return; }
        const at = new Date().toISOString(), winners = Object.fromEntries(draft.picked.map(id => [id, {music:!!draft.music[id], at}]));
        if (await save(r, {winners, winnersSavedAt:at, status:'recording'})) { draftFor = null; render(); root.querySelector('#rl-saved-h')?.focus(); }
        return;
      }
      if (await clickLater(b, r)) return;
      if (b.id === 'rl-change' && r.status === 'recording' && !matched(r).length) { if (await save(r, {status:'pack', winnersSavedAt:null})) { draftFor = null; render(); root.querySelector('#rl-save')?.focus(); } return; }
    });
  }
  const isReels = () => /^#\/publish\/reels(\/|$)/.test(location.hash);
  function routeTo(bits) {
    // #/publish/reels, #/publish/reels/<id>, #/publish/reels/<id>/reel/<ideaId>
    const id = bits[2] || null;
    if (id !== openId) { openId = id; note = ''; retry = false; retryStep = null; draftFor = null; sel = null; takeText = ''; takeWarn = []; matchNote = null; copiedKey = ''; }
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
  setInterval(() => { const r = current(); if (root && !root.hidden && isReels() && r && ['starting','running','building','finishing'].includes(r.status) && !typing()) render(); }, 15000);
  window.addEventListener('ww:data', () => { if (isReels() && !typing()) render(); });
  window.addEventListener('ww:settings', () => { if (isReels() && !typing()) render(); });
  load();
})();
