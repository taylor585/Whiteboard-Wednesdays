/* Publish (Taylor, 30 October 2026): one screen from Drive links to posted videos, replacing the separate Studio
   and Post screens. Paste the links, say which file is the main video and which are reels, press Generate.
   A Claude Code session runs the job with the skills chosen in Settings and writes the Variety Pack back here,
   laid out one platform at a time (pick PB-A): edit options, five thumbnails and two post variations each.
   Pick, press Continue, and the finished files land on Drive. Everything lives in the artifact database as
   jobs/<id>; the page never edits video or posts on its own, and it never shows a stage the session has not written.
   Phase 2 (4 November 2026): one Drive folder link is enough. The session lists it, reads each file's shape and length,
   and stops on "check" when anything is unclear or the title came from the folder name; Taylor confirms here.
   Phase 3 (4 November 2026): before any session starts, the page looks for earlier work on the same recording or topic
   (jobs, and the packs index of every Variety Pack so far) and offers Use this pack or Start fresh anyway. The session
   looks again before downloading and stops on "found" with the links instead of rebuilding.
   Phase 5 (4 November 2026): Continue keeps its context. Each session saves a small work set (transcript, plan, pack data,
   guard data) with the pack and the next one restores it. Two stops follow the Variety Pack, by Taylor's decision 2:
   the pilot (first 60 to 90 s), then the YouTube master and LinkedIn cut together. Approve or Change something here;
   either starts the next session with a line that names the stop it continues from. */
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
  // Phase 2 folder intake (4 November 2026): ck holds Taylor's answers on the Check the files screen for one job
  // (title, topic, a role per file) until he presses Confirm and continue.
  let ck = null;
  // Phase 5 stops: changing is the stop whose "Change something" box is open ('pilot' or 'review'), changeNote its text,
  // retryExtra the answer to save with the session when Try again starts it after a refusal.
  let changing = null, changeNote = '', retryExtra = null;
  // Phase 3 existing-work check: packs is the packs/<id> index (every Variety Pack published so far, chat packs included);
  // reuseSeen is the set of matches Taylor has been shown at intake, reuseOk the set he chose to start fresh over.
  let packs = [], reuseSeen = '', reuseOk = '';
  // A link names one Drive file, or one shared Drive folder (Phase 2): the cloud session lists the folder, because the
  // browser cannot. Docs, Sheets, Slides and Drive's own views (My Drive, Recent) are refused with a reason.
  function parseLink(url) {
    let u; try { u = new URL(url); } catch { return {kind:'bad', id:null}; }
    const host = u.hostname.toLowerCase(), path = u.pathname;
    if (host === 'docs.google.com') return {kind:'doc', id:null};
    if (host !== 'drive.google.com' && host !== 'drive.usercontent.google.com') return {kind:'other', id:null};
    const fm = path.match(/^\/drive\/(?:u\/\d+\/)?folders\/([\w-]{20,})(?:\/|$)/) || (/^\/(embedded)?folderview\/?$/.test(path) && [0, u.searchParams.get('id')]);
    if (fm && /^[\w-]{20,}$/.test(fm[1] || '')) return {kind:'folder', id:null, folderId:fm[1]};
    if (/\/folders?\//.test(path) || /^\/drive\/(u\/\d+\/)?(my-drive|shared-drives|recent|starred)/.test(path)) return {kind:'folder', id:null, folderId:null};
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
    // A failed job stays on the step it was working on, marked as stopped, never on Post. Check the files is step 1.
    const s = job?.status || 'new', failed = s === 'failed';
    const at = s === 'new' || s === 'check' ? 0 : ['queued','starting','running','found','pack'].includes(s) ? 1 : ['finishing','pilot','review','final'].includes(s) ? 2 : failed ? (LATER.includes(job.session?.step) || job.pickedAt ? 2 : 1) : 3;
    return '<ol class="pb-steps">'+['Drive links','Variety Pack','Finished edits','Post'].map((n, i) => '<li class="'+(i < at ? 'is-done' : i === at ? (failed ? 'is-failed' : 'is-on') : '')+'"'+(i === at ? ' aria-current="step"' : '')+'><b>'+(i+1)+'</b>'+n+(i === at && failed ? ' <small>stopped</small>' : '')+'</li>').join('')+'</ol>';
  }
  // Every problem at once, re-checked on each change (links, roles and title) and again when Generate is pressed.
  // Folder mode: exactly one folder link and nothing else. The title can wait: Claude suggests it from the folder name.
  const folderMode = () => links.length === 1 && links[0].kind === 'folder' && !!links[0].folderId;
  function problems() {
    if (!links.length) return [];
    if (folderMode()) return [];
    const out = [], main = links.filter(l => l.role === 'main').length, reels = links.filter(l => l.role === 'reel').length;
    const folders = links.filter(l => l.kind === 'folder');
    if (!title.trim()) out.push('Say what the video is about.');
    if (folders.length > 1) out.push('There are '+folders.length+' folder links. Paste one folder per video.');
    else if (folders.length && folders[0].folderId) out.push('Paste the folder link on its own: Claude reads the files inside it. Or remove it and paste file links.');
    links.forEach((l, i) => {
      if (l.kind === 'folder') { if (!l.folderId) out.push('Link '+(i+1)+' is not a shared Drive folder link. Open the folder in Drive, choose Share, Copy link, and paste that.'); }
      else if (l.kind === 'doc') out.push('Link '+(i+1)+' is a Google Docs, Sheets or Slides link, not a video file.');
      else if (!l.id) out.push('Link '+(i+1)+' is not a Google Drive file link.');
    });
    const seen = new Map();
    links.forEach((l, i) => { if (!l.id) return; if (seen.has(l.id)) out.push('Link '+(i+1)+' is the same file as link '+(seen.get(l.id)+1)+'. Remove one of them.'); else seen.set(l.id, i); });
    if (folders.length) return out;
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
  // ---- Existing-work check (Phase 3, 4 November 2026) --------------------------------------------------------------
  // Free, in the page: a job with the same Drive file or folder or on the same topic, or an indexed pack of the same
  // recording. Using it starts nothing; starting fresh runs Claude Code from the beginning and uses Taylor's plan again.
  const intakeTopic = () => exactTopic() || (topicPick && topicPick !== 'none' ? topics().find(t => t.id === topicPick) : null);
  const artifactUrl = u => typeof u === 'string' && /^https:\/\/claude\.ai\/(code\/)?artifact\/[\w-]+$/.test(u) ? u : null;
  const JOB_WORD = {queued:'not started', starting:'starting', running:'Claude Code is working on it', check:'waiting for you to check the files', found:'found earlier work', pack:'Variety Pack ready', finishing:'edit in progress', pilot:'pilot ready to watch', review:'master and LinkedIn cut ready to watch', final:'finished', failed:'stopped, Variety Pack kept'};
  const PACK_WORD = {variety:'Variety Pack', katana:'Katana moments', reels:'Reel pack'};
  function earlier() {
    if (!links.length || problems().length) return [];
    const ids = new Set(links.map(l => l.id).filter(Boolean)), folder = folderMode() ? links[0].folderId : null, tid = intakeTopic()?.id || null;
    const why = (driveIds, folderId, topicId) => (driveIds || []).some(d => ids.has(d)) ? 'Same Drive file' : folder && folderId === folder ? 'Same Drive folder' : tid && topicId === tid ? 'Same topic' : '';
    const out = [];
    jobs.forEach(j => { if (j.status === 'failed' && !j.packUrl) return;  // a stopped job with no pack has nothing to reuse
      const w = why((j.sources || []).map(x => x.driveId), j.source?.folderId, j.topicId);
      if (w) out.push({kind:'job', id:j.id, why:w, title:j.title || j.folderName || 'Job '+j.id, url:artifactUrl(j.packUrl), detail:JOB_WORD[j.status] || j.status, at:j.createdAt}); });
    const have = new Set(out.map(x => x.url).filter(Boolean));
    packs.forEach(p => { const url = artifactUrl(p.url); if (!url || have.has(url)) return;
      const w = why(p.driveIds, p.folderId, p.topicId);
      if (w) out.push({kind:'pack', id:p.id, why:w, title:p.title || 'Earlier pack', url, detail:[PACK_WORD[p.kind || 'variety'] || p.kind, p.round ? 'round '+p.round : ''].filter(Boolean).join(', '), at:p.createdAt, variety:(p.kind || 'variety') === 'variety'}); });
    return out;
  }
  const reuseSig = () => earlier().map(x => x.kind+':'+x.id).join('|');
  function reuseHtml(list) {
    const same = list.some(x => x.why !== 'Same topic');
    return '<div class="pb-reuse" id="pb-reuse" tabindex="-1" role="group" aria-labelledby="pb-reuse-h"><h3 id="pb-reuse-h">'+(same ? 'This recording already has work' : 'This topic already has work')+'</h3>'+
      '<p class="pb-muted">Using it starts nothing. Starting fresh runs Claude Code from the beginning again, which uses your Claude plan’s usage.</p><ul>'+
      list.map((x, i) => '<li><div><b>'+esc(x.title)+'</b><small>'+esc([x.why, x.detail, x.at ? when(x.at) : ''].filter(Boolean).join(' · '))+'</small></div><span class="pb-acts">'+
        (x.url ? '<a class="pb-link" href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">Open it ↗</a>' : '')+
        (x.kind === 'job' ? '<button type="button" class="pb-go" data-reuse="'+i+'">'+(x.url ? 'Use this pack' : 'Open this job')+'</button>' : x.variety ? '<button type="button" class="pb-go" data-reuse="'+i+'">Use this pack</button>' : '')+'</span></li>').join('')+
      '</ul><button type="button" class="pb-link" id="pb-fresh">Start fresh anyway</button></div>';
  }
  const canGenerate = () => links.length && !problems().length && db && !busy() && !starting;
  function checkHtml() {
    const ps = problems(), found = earlier(), shown = found.length && reuseSeen === reuseSig() && reuseOk !== reuseSeen;
    return (ps.length ? '<div class="pb-warn" role="alert">'+(ps.length === 1 ? esc(ps[0]) : '<ul>'+ps.map(x => '<li>'+esc(x)+'</li>').join('')+'</ul>')+'</div>' : '')+
      (shown ? reuseHtml(found) : '<button type="button" class="pb-go" id="pb-generate"'+(canGenerate() ? '' : ' disabled')+'>Generate Variety Pack</button>')+
      '<p class="pb-muted">'+(db ? busy() ? 'A job is already running. Wait for it, or start a new one when it finishes.' : (links.length ? 'Claude Code first checks each file’s shape and length (a few minutes) and stops to ask you if anything is unclear, before any editing. ' : '')+'The job uses the skills in Settings: '+esc(skillLine())+'.' : connecting ? 'Connecting…' : 'Publish jobs are saved in the app’s database, which this preview does not have.')+'</p>';
  }
  const linkLabel = l => l.id ? 'Drive file …'+l.id.slice(-6) : l.kind === 'folder' ? (l.folderId ? 'Drive folder …'+l.folderId.slice(-6) : 'Not a shared folder link') : l.kind === 'doc' ? 'Google Docs link, not a video' : 'Not a Drive file link';
  function intake() {
    const ts = topics();
    const fm = folderMode();
    return '<section class="pb-intake" aria-labelledby="pb-links-h"><div><h2 id="pb-links-h">Paste the Drive folder</h2><p class="pb-muted">One shared folder with the main recording (landscape, 32:9 or 16:9) and any phone reel recordings (upright). Or paste file links instead, one per line or separated with commas. Share it “Anyone with the link”.</p>'+
      '<textarea id="pb-links" rows="6" spellcheck="false" placeholder="https://drive.google.com/drive/folders/…">'+esc(links.map(l => l.url).join('\n'))+'</textarea>'+
      '<label class="pb-field" for="pb-title"><span>What is this video about?'+(fm ? ' <i class="pb-opt-note">Optional: Claude suggests it from the folder name</i>' : '')+'</span><input id="pb-title" list="pb-topic-list" maxlength="200" autocomplete="off" placeholder="'+(fm ? 'Leave it empty to use the folder name' : 'Type it, or pick one of your saved topics')+'" value="'+esc(title)+'"><datalist id="pb-topic-list">'+ts.map(t => '<option value="'+esc(t.title)+'">').join('')+'</datalist></label>'+
      '<div id="pb-topic-q">'+topicHtml()+'</div>'+
      '<label class="pb-field" for="pb-brief"><span>What you say in it, in your words (optional)</span><textarea id="pb-brief" rows="3" maxlength="2000" placeholder="The main points, any numbers you mention, who it is for. The title, description and posts are written from this and the transcript.">'+esc(brief)+'</textarea></label></div>'+
      '<div><h2>Check before it renders</h2>'+(links.length ? '<ol class="pb-srcs">'+links.map((l, i) => l.kind === 'folder' ? '<li class="pb-src'+(fm ? '' : ' is-bad')+'"><span class="pb-shape is-folder" aria-hidden="true"></span><div><b>'+esc(linkLabel(l))+'</b><small>'+esc(l.url)+'</small></div><span class="pb-src-note">'+(fm ? 'Claude lists it and reads each file' : 'Not used')+'</span></li>' : '<li class="pb-src'+(l.id ? '' : ' is-bad')+'"><span class="pb-shape '+(l.role === 'main' ? 'is-wide' : 'is-tall')+'" aria-hidden="true"></span><div><b>'+esc(linkLabel(l))+'</b><small>'+esc(l.url)+'</small></div><select data-role="'+i+'" aria-label="Role of link '+(i+1)+'"><option value="main"'+(l.role === 'main' ? ' selected' : '')+'>Main recording (landscape)</option><option value="reel"'+(l.role === 'reel' ? ' selected' : '')+'>Phone reel recording (upright)</option></select></li>').join('')+'</ol>' : '<p class="pb-empty">Your folder or links appear here. With a folder, Claude tells the main recording from the phone reel recordings by their shape and length, and you confirm before anything renders.</p>')+
      '<div id="pb-check">'+checkHtml()+'</div></div></section>';
  }
  const skillLine = () => { const s = window.WWSettings?.skills || {}, n = window.WWSettings?.name || (x => x); return [n(s.publishEdit), n(s.publishThumbs), n(s.publishPosts)].filter(Boolean).join(', '); };
  const busy = () => job && ['queued','starting','running','finishing'].includes(job.status);
  // Automatic start (Taylor, 3 November 2026): Generate and Continue start a Claude Code session in the cloud
  // through the viewer's Claude Code Remote connector. The session follows PUBLISH.md with the skills saved on the
  // job. If the connector is refused or unavailable, the job stays queued with the line to send instead.
  const ENV = 'env_017PLHsTGZVgThRnUnu1eoGG', REPO = 'https://github.com/taylor585/Whiteboard-Wednesdays';
  // Steps (Phase 5): 'pack' runs the job; 'finals' continues after the Variety Pack picks and builds the pilot; 'pilot' and
  // 'review' continue after Taylor's answer at those stops. The line names the stop, so PUBLISH.md says what each one does.
  const LATER = ['finals','pilot','review'];
  const lineFor = (step, id) => step === 'pack' ? 'Run Publish job '+id : 'Continue Publish job '+id+' from '+(step === 'finals' ? 'pack' : step);
  function sessionTitle(step, j, extra) {
    const d = (extra?.approvals || j.approvals || {})[step]?.decision;
    return (step === 'pack' ? 'Publish: ' : step === 'finals' ? 'Publish pilot: ' : step === 'pilot' ? (d === 'changes' ? 'Publish pilot changes: ' : 'Publish master: ') : (d === 'changes' ? 'Publish master changes: ' : 'Publish finals: '))+(j.title || j.id);
  }
  function sessionPrompt(step, j, line) {
    if (step === 'pack') return line+'. Follow PUBLISH.md in this repository exactly: start with its Check the files stage, run the job with the skills named on the job document, write every stage back to jobs/'+j.id+' in the Whiteboard Wednesdays app artifact, and never post anything.';
    const w = j.work?.savedAt ? 'Start by restoring the saved work set (saved '+j.work.savedAt+') as PUBLISH.md says, instead of transcribing, mapping or planning again' : 'Start with the work set as PUBLISH.md says: none is saved yet, so make it once and save it before rendering';
    return line+'. Follow PUBLISH.md in this repository exactly. '+w+'. Use the skills named on the job document, write every stage back to jobs/'+j.id+' in the Whiteboard Wednesdays app artifact, and never post anything.';
  }
  // The job's status moves on only after the session has actually started; a refusal leaves it where it was, with Try again.
  // extra is Taylor's answer at a stop (approvals), saved together with the session so a refusal saves nothing.
  async function startSession(j, step, extra = null) {
    const line = lineFor(step, j.id), requestedAt = new Date().toISOString();
    starting = step; retry = null; retryExtra = null; note = ''; render();
    try {
      const mcp = await window.claude?.use?.('mcp');
      if (!mcp) throw {code:'unavailable'};
      const r = await mcp.callTool('Claude Code Remote', 'create_session', {environment_id:ENV, source_url:REPO, title:sessionTitle(step, j, extra), prompt:sessionPrompt(step, j, line)});
      const p = r?.payload || {}, sid = p.ccr?.id || p.session_id || p.id || p.session?.id || null;
      starting = null;
      await save({session:{id:sid, url:sid ? 'https://claude.ai/code/'+sid : null, step, requestedAt, startedAt:new Date().toISOString()},
        ...(step === 'pack' ? {status:'starting'} : {status:'finishing', ...(step === 'finals' ? {pickedAt:requestedAt} : {})}), ...(extra || {}), ...(j.status === 'failed' ? {error:null, failedStage:null} : {})});
      if (!note) { changing = null; changeNote = ''; }
      render(); return true;
    } catch (e) {
      const why = e?.code === 'not_granted' ? 'You did not allow the Claude Code connection, so it could not start by itself.' : e?.code === 'unavailable' ? 'The Claude Code connection is not available in this view.' : 'Claude Code could not be started ('+(e?.code || e?.message || 'error')+').';
      starting = null; retry = step; retryExtra = extra;
      note = why+' Nothing has started'+(extra ? ' and your answer is not saved yet' : '')+'. Press Try again, or send “'+line+'” in a Claude chat.'; render(); return false;
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
  // A job that failed after the pilot or the master started is not sent back to the Variety Pack: it offers that step again.
  const failedLater = () => job?.status === 'failed' && ['pilot','review'].includes(job.session?.step);
  const canContinue = () => job?.packUrl && (job.status === 'pack' || (job.status === 'failed' && !failedLater()));
  const failedStage = () => job.failedStage || (job.stages || []).find(x => /^fail/.test(x.state || ''))?.name || [...(job.stages || [])].reverse().find(x => x.state === 'run')?.name || '';
  function confirmBar() {
    return '<div class="pb-bar pb-confirm" role="group" aria-labelledby="pb-confirm-q"><span id="pb-confirm-q"><b>Have you made your picks on the Variety Pack?</b></span><span class="pb-muted">Claude builds only what you approved there. With no picks, it stops and tells you.</span><button type="button" class="pb-link" id="pb-continue-no">Not yet</button><button type="button" class="pb-go" id="pb-continue-yes"'+(starting ? ' disabled' : '')+'>Yes, build the pilot →</button></div>';
  }
  // ---- Check the files (Phase 2, 4 November 2026) ----------------------------------------------------------------
  // The session's first stage reads each file's real shape and length (scripts/classify-video.py). When anything is
  // unclear, or the title came from the folder name, it stops on status "check" and Taylor confirms here with one tap.
  const KIND = {'youtube-recording':'Main recording (landscape)', 'phone-recording':'Phone reel recording (upright)', 'finished-reel':'A finished reel or post: an output, not a recording', 'linkedin-cut':'A LinkedIn cut: an output, not a recording', other:'Not a recording Claude can use'};
  const DECIDE = {accept:'Looks right', ask:'Needs you', reject:'Cannot be used'};
  const ROLE = {main:'Main recording', reel:'Reel recording (later)', skip:'Leave it out'};
  // Master rule 4 on screen: a phone recording can never be the main, the YouTube recording can never be a reel take,
  // and an output or anything else can only be left out.
  const allowedRoles = k => k === 'youtube-recording' ? ['main','skip'] : k === 'phone-recording' ? ['reel','skip'] : ['skip'];
  const clock = sec => { sec = Math.round(+sec || 0); return sec >= 3600 ? Math.floor(sec/3600)+':'+String(Math.floor(sec%3600/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0') : Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'); };
  const dayName = d => { try { return new Intl.DateTimeFormat('en-GB', {weekday:'short', day:'numeric', month:'short'}).format(new Date(d+'T12:00:00')); } catch { return d; } };
  // The folder name matched to a topic: an exact match first, then the booked topic (one with a recording date)
  // sharing the most words with it, then any saved topic sharing words. Nothing is linked on a guess with no shared word.
  function matchTopic(text) {
    if (!String(text || '').trim()) return null;
    const ex = topics().find(t => norm(t.title) === norm(text)); if (ex) return ex;
    const tw = words(text), near = (a, b) => a === b || (a.length > 3 && b.length > 3 && a.slice(0, 5) === b.slice(0, 5));
    const r = topics().map(t => ({t, score:words(t.title).filter(w => tw.some(x => near(w, x))).length + (t.recordDate ? 0.5 : 0)})).filter(x => x.score >= 1).sort((a, b) => b.score - a.score);
    return r[0]?.t || null;
  }
  function ckInit() {
    const key = job.id+'|'+(job.checkAt || '')+'|'+(job.sources || []).length;
    // Saved topics can arrive after the job: until Taylor changes anything here, the suggestion follows them.
    if (ck?.key === key && (ck.touched || ck.topicsN === topics().length)) return;
    const src = job.sources || [], name = job.titleBy === 'taylor' ? job.title : (job.title || job.folderName || '');
    const m = job.topicId ? topics().concat(window.WWIdeas?.data?.topics || []).find(t => t.id === job.topicId) : matchTopic(name);
    ck = {key, topicsN:topics().length, touched:false, from:name, title:job.titleBy === 'taylor' ? job.title : (m?.title || name), topicId:m?.id || '', matched:m?.id || '',
      roles:src.map(x => { const a = allowedRoles(x.kind); return a.includes(x.role) ? x.role : a.length === 1 ? 'skip' : ''; })};
  }
  function ckProblems() {
    const src = job.sources || [], out = [];
    if (!src.length) out.push('Claude Code has not listed any files yet.');
    if (!ck.title.trim()) out.push('Say what the video is about.');
    ck.roles.forEach((r, i) => { if (!r) out.push('Choose what file '+(i+1)+' ('+(src[i].name || 'Drive file')+') is.'); });
    const mains = ck.roles.filter(r => r === 'main').length, reels = ck.roles.filter(r => r === 'reel').length;
    if (src.length && mains !== 1) out.push(mains ? 'Choose exactly one main recording; '+mains+' are marked as main.' : 'No main recording: the job needs one landscape recording with sound. Add it to the folder and press Check again, or choose one here.');
    if (reels > MAX_REELS) out.push('Up to '+MAX_REELS+' phone reel recordings; leave '+(reels - MAX_REELS)+' out.');
    return out;
  }
  const ckCheckHtml = () => { const ps = ckProblems(); return (ps.length ? '<div class="pb-warn" role="alert">'+(ps.length === 1 ? esc(ps[0]) : '<ul>'+ps.map(x => '<li>'+esc(x)+'</li>').join('')+'</ul>')+'</div>' : '')+
    '<button type="button" class="pb-go" id="pb-ck-go"'+(ps.length || starting || !db ? ' disabled' : '')+'>Confirm and continue</button><p class="pb-muted">The main recording is edited for YouTube and LinkedIn: Claude Code makes the Variety Pack from it alone. Reel recordings wait until you pick reel winners, and nothing short is ever cut from the main recording.</p>'; };
  function ckTopicHtml() {
    const t = topics().concat(window.WWIdeas?.data?.topics || []).find(x => x.id === ck.topicId);
    const line = t && ck.topicId === ck.matched ? '<p class="pb-muted">'+(job.folderName ? 'From the folder “'+esc(job.folderName)+'”: ' : '')+'matches your '+(t.recordDate ? 'booked topic for '+esc(dayName(t.recordDate)) : 'saved topic')+'.</p>'
      : !t && job.folderName && ck.topicId !== 'none' ? '<p class="pb-muted">From the folder name “'+esc(job.folderName)+'”. No saved topic matches it; choose one if it belongs to one.</p>' : '';
    const opts = topics().map(x => '<option value="'+esc(x.id)+'"'+(ck.topicId === x.id ? ' selected' : '')+'>'+esc(x.title)+(x.recordDate ? ' · '+esc(dayName(x.recordDate)) : '')+'</option>').join('');
    return line+'<label class="pb-field" for="pb-ck-topic"><span>Topic</span><select id="pb-ck-topic"><option value=""'+(ck.topicId ? '' : ' selected')+'>Choose a topic…</option>'+opts+'<option value="none"'+(ck.topicId === 'none' ? ' selected' : '')+'>None of these</option></select></label>';
  }
  function checkFiles() {
    ckInit();
    const src = job.sources || [];
    const shape = p => !p ? 'is-other' : ['tall','feed'].includes(p.band) ? 'is-tall' : p.band === 'ultrawide' ? 'is-ultra' : ['wide','landscape'].includes(p.band) ? 'is-wide' : 'is-other';
    const meta = p => p ? [p.width && p.height ? p.width+'×'+p.height : '', p.seconds ? clock(p.seconds) : '', p.audio === false ? 'no sound' : p.audio ? 'sound' : ''].filter(Boolean).join(' · ') : 'Not read';
    const rows = src.map((x, i) => { const a = allowedRoles(x.kind), d = x.decision || 'ask';
      return '<li class="pb-src pb-ck-row is-'+esc(d)+'"><span class="pb-shape '+shape(x.probe)+'" aria-hidden="true"></span><div><b>'+esc(x.name || 'Drive file …'+String(x.driveId || '').slice(-6))+'</b>'+
        '<span class="pb-ck-meta">'+esc(meta(x.probe))+' · '+esc(KIND[x.kind] || 'Not checked')+'</span>'+
        '<span class="pb-ck-why"><em class="pb-badge is-'+esc(d)+'">'+esc(DECIDE[d] || d)+'</em> '+esc(x.reason || '')+'</span></div>'+
        '<select data-ck="'+i+'" aria-label="What file '+(i+1)+' is"'+(a.length === 1 ? ' disabled' : '')+'>'+(ck.roles[i] ? '' : '<option value="" selected>Choose…</option>')+a.map(r => '<option value="'+r+'"'+(ck.roles[i] === r ? ' selected' : '')+'>'+esc(ROLE[r])+'</option>').join('')+'</select></li>'; }).join('');
    return '<section class="pb-ck" aria-labelledby="pb-ck-h"><div class="pb-ck-head"><h2 id="pb-ck-h">Check the files</h2><p class="pb-muted">Claude Code read the shape and length of each file'+(job.folderName ? ' in the folder “'+esc(job.folderName)+'”' : '')+'. Nothing has been edited yet. '+esc(job.checkNote || 'Confirm, or change a role, and it carries on.')+'</p></div>'+
      '<div class="pb-ck-grid"><div><label class="pb-field" for="pb-ck-title"><span>Title</span><input id="pb-ck-title" maxlength="200" autocomplete="off" value="'+esc(ck.title)+'"></label><div id="pb-ck-topic-q">'+ckTopicHtml()+'</div></div>'+
      '<div><ol class="pb-srcs">'+rows+'</ol><div id="pb-ck-check">'+ckCheckHtml()+'</div></div></div></section>';
  }
  function ckChange(e) {
    if (!ck || job?.status !== 'check') return false;
    if (e.target.id === 'pb-ck-topic') { ck.touched = true; ck.topicId = e.target.value; const t = topics().find(x => x.id === ck.topicId); if (t) ck.title = t.title; render(); return true; }
    const r = e.target.closest('[data-ck]'); if (r) { ck.touched = true; ck.roles[+r.dataset.ck] = r.value; render(); return true; }
    return false;
  }
  async function ckConfirm() {
    if (!ck || ckProblems().length || starting) { render(); return; }
    const at = new Date().toISOString(), topicId = ck.topicId && ck.topicId !== 'none' ? ck.topicId : null;
    const sources = (job.sources || []).map((x, i) => ({...x, role:ck.roles[i], roleBy:'taylor', confirmedAt:at}));
    await save({sources, reelTakes:sources.filter(x => x.role === 'reel').map(x => x.driveId), title:ck.title.trim(), titleBy:'taylor', topicId, checkedAt:at});
    if (note) return;
    await startSession(job, 'pack');
  }
  // ---- Found earlier work (Phase 3) --------------------------------------------------------------------------------
  // The session's Look for earlier work stage found a pack for this recording and stopped before downloading anything.
  function foundHtml() {
    const ex = (job.existing || []).filter(x => artifactUrl(x.url));
    return '<section class="pb-found" aria-labelledby="pb-found-h"><h2 id="pb-found-h">Claude Code found earlier work for this recording</h2><p class="pb-muted">'+esc(job.foundNote || 'It stopped before downloading or editing anything.')+' Using it starts nothing. Starting fresh runs Claude Code from the beginning again, which uses your Claude plan’s usage.</p><ul>'+
      ex.map((x, i) => '<li><div><b>'+esc(x.title || 'Earlier pack')+'</b><small>'+esc([PACK_WORD[x.kind || 'variety'] || x.kind, x.round ? 'round '+x.round : '', Number.isFinite(x.decisions) ? x.decisions+' decisions' : '', x.why || ''].filter(Boolean).join(' · '))+'</small></div><span class="pb-acts">'+
        '<a class="pb-link" href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">Open it ↗</a>'+((x.kind || 'variety') === 'variety' ? '<button type="button" class="pb-go" data-use="'+i+'"'+(starting ? ' disabled' : '')+'>Use this pack for this job</button>' : '')+'</span></li>').join('')+
      '</ul><button type="button" class="pb-link" id="pb-start-fresh"'+(starting ? ' disabled' : '')+'>Start fresh anyway</button></section>';
  }
  // The stage list is written by the session as it works; nothing here is simulated.
  function stages() {
    const list = job.stages || [];
    const ses = job.session?.url ? ' <a class="pb-link" href="'+esc(job.session.url)+'" target="_blank" rel="noopener noreferrer">Watch the session ↗</a>' : '';
    const stuck = stuckMinutes(), fs = job.status === 'failed' ? failedStage() : '';
    const head = job.status === 'failed' ? '<div class="pb-warn pb-failed" role="alert"><p><b>This job stopped'+(fs ? ' at “'+esc(fs)+'”' : '')+'.</b> '+esc(job.error || 'Claude Code did not say why.')+'</p><p>Nothing was posted. '+(failedLater() ? 'Your picks, your answers and the saved work are kept: Try again runs that step again from them, or start a new video.' : job.packUrl ? 'Your Variety Pack is still there: fix the problem, then press Continue, or start a new video.' : 'Press Start a new video when you are ready.')+ses+'</p>'+
        (failedLater() ? '<p class="pb-acts"><button type="button" class="pb-link" id="pb-retry-step"'+(starting ? ' disabled' : '')+'>Try again</button></p>' : '')+'</div>'
      : stuck ? '<div class="pb-warn pb-stuck" role="alert"><p><b>Claude Code has not reported back</b> for '+(stuck >= 120 ? Math.floor(stuck / 60)+' h '+(stuck % 60)+' min' : stuck+' minutes')+'. It may have stopped.</p><p class="pb-acts">'+ses+' <button type="button" class="pb-link" id="pb-retry-stuck">Try again</button> <button type="button" class="pb-link" id="pb-stop">Stop this job</button></p></div>'
      : job.status === 'queued' ? '<p class="pb-queue"><b>Not started yet.</b> <button type="button" class="pb-link" id="pb-start"'+(starting ? ' disabled' : '')+'>Start now</button> or say this in a Claude chat: <code>Run Publish job '+esc(job.id)+'</code> <button type="button" class="pb-link" data-copy-run="pack">'+(copied === 'run' ? 'Copied' : 'Copy')+'</button></p>'
      : job.status === 'starting' ? '<p class="pb-queue"><b>Starting Claude Code.</b> A session is opening in the cloud with your skills; the steps appear here as it works, usually within two minutes.'+ses+'</p>'
      : ['running','finishing'].includes(job.status) && ses ? '<p class="pb-meta">Claude Code is working on this'+esc(doing())+'.'+ses+'</p>' : '';
    const bar = starting === 'finals' ? '<div class="pb-bar"><span>Starting Claude Code for the pilot…</span></div>' : confirm ? confirmBar() : '<div class="pb-bar"><span>Picks made in the Variety Pack?</span><span class="pb-muted">Claude reads them from that page and builds a pilot of the first 60 to 90 seconds for you to watch.</span><button type="button" class="pb-go" id="pb-continue">Continue · build the pilot →</button></div>';
    const pr = job.packRecord || {}, ticked = Number.isFinite(pr.preticked) && pr.preticked > 0 ? ' '+pr.preticked+' designs you approved on earlier videos are already ticked'+(Number.isFinite(pr.fresh) ? '; you decide the '+pr.fresh+' new ones' : '')+'. Untick any you do not want.' : '';
    const packLink = job.packUrl && !['finishing','pilot','review','final'].includes(job.status) && !failedLater() ? '<p class="pb-queue"><b>'+(job.reusedFrom ? 'Using your earlier Variety Pack.' : 'Your Variety Pack is ready.')+'</b> '+(job.reusedFrom ? 'Nothing was rebuilt: your picks on that page carry over. Check them there, then come back and press Continue.' : 'It opens as its own page: make your picks there, then come back and press Continue.')+esc(ticked)+' <a class="pb-go pb-packgo" href="'+esc(job.packUrl)+'" target="_blank" rel="noopener noreferrer">Open the Variety Pack ↗</a></p>'+(canContinue() && !job.pack?.platforms?.length ? bar : '') : job.packUrl ? '<p class="pb-meta">Variety Pack '+(job.packRecord?.round ? 'round '+esc(job.packRecord.round)+' ' : '')+'· <a class="pb-link" href="'+esc(job.packUrl)+'" target="_blank" rel="noopener noreferrer">Open it ↗</a></p>' : '';
    return '<section class="pb-stages" aria-label="Progress">'+head+packLink+workLine()+(list.length ? '<ol>'+list.map(s => '<li class="is-'+esc(/^fail/.test(s.state || '') ? 'failed' : s.state || 'wait')+'"><span class="pb-st-dot" aria-hidden="true"></span><b>'+esc(s.name)+'</b><small>'+esc(s.detail || '')+'</small><time>'+(s.state === 'done' ? elapsed(s.startedAt, s.endedAt) : s.state === 'run' ? 'running '+elapsed(s.startedAt) : '')+'</time></li>').join('')+'</ol>' : '')+'</section>';
  }
  // ---- Pilot and review stops (Phase 5, 4 November 2026) ----------------------------------------------------------
  // What the running session is doing, from the stop it continues and Taylor's answer there.
  function doing() {
    const st = job.session?.step, d = st && job.approvals?.[st]?.decision;
    return job.status !== 'finishing' ? '' : st === 'finals' ? ': building the pilot from your picks' : st === 'pilot' ? (d === 'changes' ? ': changing the pilot' : ': rendering the YouTube master and the LinkedIn cut') : st === 'review' ? (d === 'changes' ? ': making your changes to the master and the LinkedIn cut' : ': preparing the finished files') : '';
  }
  // The saved work set: the next session restores it instead of transcribing, mapping and planning again.
  function workLine() {
    const w = job.work; if (!w?.savedAt || job.status === 'final') return '';
    const n = Array.isArray(w.files) ? w.files.length : 0;
    return '<p class="pb-meta pb-work">Saved work: '+(n ? n+' files' : 'transcript and plan')+(w.stage ? ' after the '+esc(w.stage) : '')+', '+esc(when(w.savedAt))+'. The next session picks it up, so nothing is transcribed or planned again.</p>';
  }
  const STOP_TRACK = ['Pilot','Master and LinkedIn cut','Finished files'];
  function stopHtml(kind) {
    const pilot = kind === 'pilot', d = (pilot ? job.pilot : job.cuts) || {}, a = job.approvals?.[kind];
    const url = artifactUrl(d.url) || artifactUrl(job.reviewUrl), round = +d.round || 1;
    const after = a?.decision === 'changes' && a.note && (!d.renderedAt || String(a.at) <= String(d.renderedAt)) ? '<p class="pb-muted">Round '+round+', after your note: “'+esc(a.note)+'”</p>' : '';
    const track = '<ol class="pb-track" aria-label="Stops after the Variety Pack">'+STOP_TRACK.map((n, i) => { const at = pilot ? 0 : 1; return '<li class="'+(i < at ? 'is-done' : i === at ? 'is-on' : '')+'"'+(i === at ? ' aria-current="step"' : '')+'>'+n+'</li>'; }).join('')+'</ol>';
    const watch = (label, u) => u ? '<a class="pb-go pb-watch" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+label+' ↗</a>' : '';
    const cut = (k, label, c) => { c = c || {}; const u = artifactUrl(c.url) || url;
      return '<li><span class="pb-pf pb-pf-'+k+'">'+label+'</span><b>'+esc(c.label || (k === 'youtube' ? 'YouTube master' : 'LinkedIn cut'))+'</b><small>'+esc([c.seconds ? clock(c.seconds) : '', c.detail || ''].filter(Boolean).join(' · ') || 'Length not reported')+'</small>'+watch('Watch it', u)+'</li>'; };
    const body = pilot
      ? '<h2 id="pb-stop-h">Your pilot is ready</h2><p class="pb-muted">The first '+(d.seconds ? clock(d.seconds) : '60 to 90 seconds')+' of the YouTube master, edited with the designs you approved. Watch it with sound before Claude Code renders the whole video.'+(d.detail ? ' '+esc(d.detail) : '')+'</p>'+after+watch('Watch the pilot', url)
      : '<h2 id="pb-stop-h">Your YouTube master and LinkedIn cut are ready</h2><p class="pb-muted">Watch both, then approve them together or say what to change. Nothing has been posted.</p>'+after+'<ul class="pb-cuts">'+cut('youtube', 'YouTube', d.master)+cut('linkedin', 'LinkedIn', d.linkedin)+'</ul>';
    const missing = url ? '' : '<div class="pb-warn" role="alert"><p>Claude Code did not leave a link to watch '+(pilot ? 'the pilot' : 'them')+'. Open the session to see why, or ask for changes.</p></div>';
    const off = starting ? ' disabled' : '';
    const acts = changing === kind
      ? '<div class="pb-change"><label class="pb-field" for="pb-change-note"><span>What should change?</span><textarea id="pb-change-note" rows="4" maxlength="2000" placeholder="'+(pilot ? 'For example: at 0:42 the caption covers the screen; use the short list instead of the cards at 1:05.' : 'Say which video and where, for example: master 12:30, the Blender shot runs long. LinkedIn: start at the second story.')+'">'+esc(changeNote)+'</textarea></label>'+
        '<p class="pb-acts"><button type="button" class="pb-go" id="pb-change-send"'+(changeNote.trim() && !starting ? '' : ' disabled')+'>Send the changes</button><button type="button" class="pb-link" id="pb-change-cancel">Cancel</button></p>'+
        '<p class="pb-muted">Claude Code changes '+(pilot ? 'the pilot' : 'what you asked for')+' from the saved plan and stops here again for you to watch.</p></div>'
      : '<div class="pb-stop-acts"><button type="button" class="pb-go" id="pb-approve"'+(url ? off : ' disabled')+'>'+(pilot ? 'Approve the pilot' : 'Approve both')+'</button><button type="button" class="pb-link" id="pb-change"'+off+'>Change something</button></div>'+
        '<p class="pb-muted">'+(pilot ? 'Approving starts Claude Code: it renders the whole YouTube master and the LinkedIn cut from the saved plan, then stops here for you to watch both.' : 'Approving starts Claude Code for the finished files. Nothing is posted.')+'</p>';
    return '<section class="pb-stop" aria-labelledby="pb-stop-h">'+track+body+missing+acts+'</section>';
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
    return '<section class="pb-finals" aria-labelledby="pb-fin-h"><h2 id="pb-fin-h">Finished</h2>'+(job.finalNote ? '<p class="pb-muted">'+esc(job.finalNote)+'</p>' : '')+'<ul>'+f.map(x => '<li><span class="pb-pf pb-pf-'+esc(x.platform || '')+'">'+esc(PLATFORMS[x.platform] || x.platform || '')+'</span><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.label)+' ↗</a>'+(x.detail ? '<small>'+esc(x.detail)+'</small>' : '')+'</li>').join('')+'</ul>'+
      '<div class="pb-post"><div><b>Post all</b><p class="pb-muted">Posting needs the YouTube, LinkedIn and Instagram connections, which are not set up yet. Until then, copy each post and upload the files from Drive. Nothing has been posted.</p></div><div class="pb-copies">'+copyable.map(pl => '<button type="button" class="pb-link" data-copy="'+esc(pl.key)+'">'+(copied === pl.key ? 'Copied' : 'Copy '+esc(PLATFORMS[pl.key] || pl.key)+' post')+'</button>').join('')+'<button type="button" class="pb-go" disabled>Post all</button></div></div></section>';
  }
  function render() {
    if (root.hidden) return;
    const focus = document.activeElement && root.contains(document.activeElement) ? document.activeElement.id : null;
    const t = job && topics().concat(window.WWIdeas?.data?.topics || []).find(x => x.id === job.topicId);
    root.innerHTML = '<div class="pb-head"><div><div class="micro">PUBLISH · DRIVE LINKS IN, POSTS OUT</div><h1 id="pb-heading">'+esc(job ? (t?.title || job.title || job.folderName || 'This video') : 'Publish a video')+'</h1><p>Paste the Drive folder, check which file is which, then Generate. Your Variety Pack opens as its own page.</p></div>'+
      (job ? '<button type="button" class="pb-link" id="pb-new"'+(busy() ? ' disabled' : '')+'>Start a new video</button>' : '')+'</div>'+steps()+
      (note ? '<div class="pb-warn" role="status"><p>'+esc(note)+'</p>'+(retry && job ? '<p class="pb-acts"><button type="button" class="pb-link" id="pb-retry"'+(starting ? ' disabled' : '')+'>Try again</button> <button type="button" class="pb-link" data-copy-run="'+esc(retry)+'">'+(copied === 'run' ? 'Copied' : 'Copy the line')+'</button></p>' : '')+'</div>' : '')+
      (!job || job.status === 'new' ? intake() : '<p class="pb-meta">Job '+esc(job.id)+' · '+(job.source?.kind === 'folder' ? 'Drive folder'+(job.folderName ? ' “'+esc(job.folderName)+'”' : '')+' · ' : '')+(job.source?.kind === 'folder' && !(job.sources || []).length ? 'files not listed yet' : esc((job.sources || []).length)+' files')+' · started '+esc(when(job.createdAt))+'</p>'+(job.status === 'check' ? checkFiles() : job.status === 'found' ? foundHtml() : job.status === 'pilot' || job.status === 'review' ? stopHtml(job.status) : '')+stages()+pack()+finals());
    if (focus && document.getElementById(focus)) document.getElementById(focus).focus();
    else if (confirm) root.querySelector('#pb-continue-yes')?.focus();
    else if (changing && focus === 'pb-change') root.querySelector('#pb-change-note')?.focus();
  }
  function readLinks(text) {
    // Split on spaces, new lines and commas; keep every link (too many are warned about, never dropped). A role belongs to
    // the file, so editing or reordering the list keeps Taylor's choices. A new link is the main only if none is yet.
    const kept = new Map();  // file → its roles in order, so a file pasted twice keeps each copy's own role
    links.forEach(l => { if (l.kind === 'folder') return; const k = l.id || l.url; kept.set(k, (kept.get(k) || []).concat({role:l.role, by:l.by})); });
    links = text.split(/[\s,]+/).filter(Boolean).map(url => { const p = parseLink(url); if (p.kind === 'folder') return {url, id:null, kind:'folder', folderId:p.folderId, role:null};
      const k = kept.get(p.id || url)?.shift(); return {url, id:p.id, kind:p.kind, role:k?.role || null, by:k?.by || null}; });
    const files = links.filter(l => l.kind !== 'folder');
    if (!files.some(l => l.role === 'main')) { const first = files.find(l => !l.role); if (first) first.role = 'main'; }
    files.forEach(l => { if (!l.role) l.role = 'reel'; });
  }
  async function save(patch) {
    if (!db || !job) return;
    const at = new Date().toISOString();
    try { await db.doc('jobs/'+job.id).update({...patch, updatedAt:at}); Object.assign(job, patch, {updatedAt:at}); note = ''; }
    catch (e) { note = 'Could not save ('+(e?.code || 'error')+'). Try again.'; render(); }
  }
  // Typing the title or brief refreshes only the checks and the topic question, so the field keeps its caret and list.
  function refreshIntake() { const c = root.querySelector('#pb-check'), q = root.querySelector('#pb-topic-q'); if (c) c.innerHTML = checkHtml(); if (q) q.innerHTML = topicHtml(); }
  root.addEventListener('input', e => { if (e.target.id === 'pb-change-note') { changeNote = e.target.value; const s = root.querySelector('#pb-change-send'); if (s) s.disabled = !changeNote.trim() || !!starting; return; } if (e.target.id === 'pb-brief') { brief = e.target.value; return; } if (e.target.id === 'pb-title') { title = e.target.value; refreshIntake(); return; } if (e.target.id === 'pb-ck-title' && ck) { ck.touched = true; ck.title = e.target.value; const c = root.querySelector('#pb-ck-check'); if (c) c.innerHTML = ckCheckHtml(); return; } if (e.target.id === 'pb-links') { readLinks(e.target.value); const box = e.target, pos = box.selectionStart; render(); const again = root.querySelector('#pb-links'); again.focus(); again.setSelectionRange(pos, pos); } });
  root.addEventListener('change', e => { if (e.target.id === 'pb-topic') { topicPick = e.target.value; const c = root.querySelector('#pb-check'); if (c) c.innerHTML = checkHtml(); return; } if (ckChange(e)) return; const r = e.target.closest('[data-role]'); if (r) { links[+r.dataset.role].role = r.value; links[+r.dataset.role].by = 'taylor'; render(); } });
  root.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.id === 'pb-generate') {
      if (!canGenerate()) { render(); return; }  // checked again here: a bad link can never start a paid session
      // Earlier work for this recording or topic: show it first; Generate needs a second, deliberate press.
      const sig = reuseSig();
      if (sig && reuseOk !== sig) { reuseSeen = sig; render(); root.querySelector('#pb-reuse')?.focus(); return; }
      b.disabled = true; await generate(); return;
    }
    if (b.id === 'pb-fresh') { if (!canGenerate()) { render(); return; } const seen = earlier().map(x => x.url || 'jobs/'+x.id); reuseOk = reuseSig(); b.disabled = true; await generate({existingSeen:seen}); return; }
    if (b.dataset.reuse !== undefined) {
      const x = earlier()[+b.dataset.reuse]; if (!x) { render(); return; }
      if (x.kind === 'job') { job = jobs.find(j => j.id === x.id) || null; resetIntake(); render(); root.querySelector('#pb-heading')?.focus(); return; }
      // An indexed pack with no job of its own: a new job that points at it, with no session (it costs nothing).
      b.disabled = true; await generate({packUrl:x.url, status:'pack', reusedFrom:{pack:x.id, url:x.url, title:x.title, at:new Date().toISOString()}}, false); return;
    }
    if (b.id === 'pb-new') { job = null; ck = null; resetIntake(); retry = null; retryExtra = null; confirm = false; changing = null; changeNote = ''; render(); root.querySelector('#pb-links')?.focus(); return; }
    if (b.dataset.pick) { job.picks = {...(job.picks || {}), [b.dataset.pick]:b.dataset.val}; render(); await save({picks:job.picks}); return; }
    if (starting && /^pb-(continue|start|retry|stop|ck|approve|change-send)/.test(b.id)) return;
    // Pilot and review stops: one press saves Taylor's answer with the session it starts (nothing is saved on a refusal).
    if (['pilot','review'].includes(job?.status)) {
      const kind = job.status, round = +((kind === 'pilot' ? job.pilot : job.cuts)?.round) || 1, at = new Date().toISOString();
      if (b.id === 'pb-approve') { await startSession(job, kind, {approvals:{...(job.approvals || {}), [kind]:{decision:'approved', round, at}}}); return; }
      if (b.id === 'pb-change') { changing = kind; render(); root.querySelector('#pb-change-note')?.focus(); return; }
      if (b.id === 'pb-change-cancel') { changing = null; render(); root.querySelector('#pb-change')?.focus(); return; }
      if (b.id === 'pb-change-send') { const n = changeNote.trim(); if (!n) return; await startSession(job, kind, {approvals:{...(job.approvals || {}), [kind]:{decision:'changes', note:n, round, at}}}); return; }
    }
    if (b.id === 'pb-ck-go') { await ckConfirm(); return; }
    if (b.dataset.use !== undefined && job?.status === 'found') {
      const x = (job.existing || []).filter(e => artifactUrl(e.url))[+b.dataset.use]; if (!x) return;
      await save({packUrl:x.url, status:'pack', reusedFrom:{url:x.url, title:x.title || null, at:new Date().toISOString()}}); render(); return;
    }
    if (b.id === 'pb-start-fresh' && job?.status === 'found') { await save({skipExisting:true}); if (!note) await startSession(job, 'pack'); else render(); return; }
    if (b.id === 'pb-continue') { confirm = true; render(); return; }
    if (b.id === 'pb-continue-no') { confirm = false; render(); root.querySelector('.pb-packgo')?.focus(); return; }
    if (b.id === 'pb-continue-yes') { confirm = false; if (canContinue()) await startSession(job, 'finals'); else render(); return; }
    if (b.id === 'pb-start') { await startSession(job, 'pack'); return; }
    if (b.id === 'pb-retry') { await startSession(job, retry || 'pack', retryExtra); return; }
    if (b.id === 'pb-retry-stuck') { await startSession(job, job.status === 'finishing' ? (LATER.includes(job.session?.step) ? job.session.step : 'finals') : 'pack'); return; }
    if (b.id === 'pb-retry-step' && failedLater()) { await startSession(job, job.session.step); return; }
    if (b.id === 'pb-stop') { const st = [...(job.stages || [])].reverse().find(x => x.state === 'run')?.name || null; await save({status:'failed', error:'Stopped by Taylor', failedStage:st, stoppedAt:new Date().toISOString()}); render(); return; }
    if (b.hasAttribute('data-copy-run')) { await copy(lineFor(b.dataset.copyRun || 'pack', job.id), 'run'); return; }
    if (b.dataset.copy) { const pl = job.pack.platforms.find(p => p.key === b.dataset.copy), i = Math.max(0, (pl.posts || []).findIndex((_, n) => job.picks?.[pl.key+'.post'] === 'v'+(n+1))); const v = pl.posts[i]; await copy(((v.title || '')+'\n\n'+(v.body || '')).trim(), pl.key); }
  });
  function resetIntake() { links = []; title = ''; brief = ''; topicPick = ''; note = ''; reuseSeen = ''; reuseOk = ''; }
  // A new job from the intake. With a patch from "Use this pack" it points at the earlier pack and starts no session.
  async function generate(patch = {}, start = true) {
    const id = new Date().toISOString().slice(0, 10)+'-'+Math.random().toString(36).slice(2, 7), at = new Date().toISOString();
    const topic = intakeTopic();
    // Every source starts unchecked: the session's Check the files stage reads each file's shape and length and
    // compares it with the role before anything is edited. A folder is listed by the session, so sources start empty.
    const f = folderMode() ? links[0] : null, tt = title.trim();
    const doc = {id, topicId:topic?.id || null, title:tt, titleBy:tt ? 'taylor' : null, brief:brief.trim(),
      source:f ? {kind:'folder', folderId:f.folderId, url:f.url} : {kind:'files'},
      sources:f ? [] : links.map(l => ({url:l.url, driveId:l.id, role:l.role, roleBy:l.by || 'default', check:'pending'})), skills:window.WWSettings?.skills || {}, status:'queued', stages:[], picks:{}, finals:[], createdAt:at, startedAt:at, updatedAt:at, ...patch};
    try { await db.doc('jobs/'+id).set(doc); job = doc; resetIntake(); render(); if (start) await startSession(doc, 'pack'); else root.querySelector('#pb-heading')?.focus(); }
    catch (err) { note = 'Could not start the job ('+(err?.code || 'error')+').'; render(); }
  }
  async function copy(text, key) { try { await navigator.clipboard.writeText(text); copied = key; } catch { note = 'Copy was blocked by the browser. Select the text and copy it instead.'; } render(); setTimeout(() => { copied = ''; render(); }, 2000); }
  async function load() {
    try { await window.WWStore?.connect(); db = window.WWStore?.db?.() || null; } catch { db = null; }
    connecting = false;
    if (db) db.collection('jobs').onSnapshot(snap => {
      jobs = snap.docs.filter(d => d.exists).map(d => ({id:d.id, ...d.data()})).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      // Follow the job on screen; with none open, show the latest one still in progress.
      job = job ? jobs.find(j => j.id === job.id) || job : jobs.find(j => j.status !== 'posted' && j.status !== 'final') || null;
      if (!canContinue()) confirm = false;
      if (changing && job?.status !== changing) { changing = null; changeNote = ''; }
      if (document.activeElement?.closest?.('#publish textarea,#publish input')) return;
      render();
    }, () => {});
    // The packs index (Phase 3): read only here. Sessions add a document for every pack they publish.
    if (db) db.collection('packs').onSnapshot(snap => {
      packs = snap.docs.filter(d => d.exists).map(d => ({id:d.id, ...d.data()}));
      if (document.activeElement?.closest?.('#publish textarea,#publish input')) { const c = root.querySelector('#pb-check'); if (c && !job) c.innerHTML = checkHtml(); return; }
      render();
    }, () => {});
    render();
  }
  setInterval(() => { if (!root.hidden && job && ['starting','running','finishing'].includes(job.status) && !document.activeElement?.closest?.('#publish select')) render(); }, 15000);
  window.addEventListener('ww:route', e => { if (e.detail[0] === 'publish') render(); });
  window.addEventListener('ww:data', render);
  load();
})();
