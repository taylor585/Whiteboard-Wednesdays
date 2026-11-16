/* Publish (Taylor, 30 October 2026): one screen from Drive links to posted videos, replacing the separate Studio
   and Post screens. Paste the links, say which file is the main video and which are reels, press Generate.
   A Claude Code session runs the job with the skills chosen in Settings and writes the Variety Pack back here,
   laid out one platform at a time (pick PB-A): edit options, sixteen thumbnails (Thumbnail Tracker 4.0.0) and two post variations each.
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
   either starts the next session with a line that names the stop it continues from.
   Phase 7 (4 November 2026, Taylor's decisions 7 and 8): Approve both starts the session that makes the thumbnails
   (Thumbnail Tracker - 16 Variations, sixteen a platform, objects only) and the posts (Performance Poster, two checked variations a platform).
   It needs who the video is for (A or B, from the topic) and the booking link saved in Settings; without either it stops
   on "ask" and writes nothing. Taylor picks one thumbnail and one post per platform here, copies each text, and posts by
   hand: Post all stays off until the platforms are connected. No placeholder such as [BOOKING LINK] is ever copied.
   Phase 8a (4 November 2026): two plain text lanes under the heading, Video (#/publish, this file) and Reels
   (#/publish/reels, public/reels.js). This file draws the lane row and hands the Reels routes to reels.js; a Video job's
   reels are found from the reel job's jobId (reelsId below), so neither lane ever writes the other's documents.
   Parts (6 November 2026): Taylor records the main video in parts. Several files with role "main" are still one main
   recording, saved with "part" 1..n in the order they are joined; Check the files shows them as one main card where a
   part moves up or down, or is left out, with one tap. A job with a single main has no "part" and reads as before.
   X (10 November 2026): every job's pack also carries an X platform (key "x"): a single post and a short thread, each
   post counted the way X counts it (x-count.js) against 280. Taylor copies each post, or opens X's own compose box with the
   first post filled in; the link reply waits for his YouTube link. Nothing is posted from here.
   The line (Taylor chose P2 "Production Line" on 16 November 2026): #/publish (and its old alias #/publish/all) is every
   Video job as an index card on five stations, Drive links → Variety Pack → Finished edits → Ready to post → Posted (the
   status → station mapping and the two-link rule live in publish-line.js, window.WWLine). #/publish/new is New video: two
   required Drive file links with declared roles, the main video (16:9) and the reel (upright), saved on the job as
   links: {main, reel} and, as before, as sources with role main and reel, so every session reads them unchanged.
   Run saves and starts the job exactly as Generate did; Save to the line saves it with status "saved", which starts
   nothing and which autopilot, posting, the poster and Ready to post all ignore. #/publish/new/<id> edits a saved job's
   links. The per-job routes (#/publish/job/<id>) and their screens are unchanged. */
(() => {
  'use strict';
  const root = document.querySelector('#publish');
  const M = window.WWMotion;
  if (!root) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const MAX_REELS = 5, MAX_PARTS = 10;
  const PLATFORMS = {youtube:'YouTube', linkedin:'LinkedIn', x:'X', reels:'Instagram Reels'};
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
  // Phase 7: buyerPick is Taylor's answer to "Who is it for" on this screen (null until he changes it), for the job buyerFor;
  // ytDraft is the YouTube link he types for the LinkedIn first comment; badImg holds thumbnail images that did not load here.
  let buyerPick = null, buyerFor = null, ytDraft = null, badImg = new Set();
  // Every video, always one tap away (Taylor, 6 November 2026: an old job on "pack" left him no way back). view is what the
  // route asks for: 'line' (#/publish, and its old alias #/publish/all: every job on the line, 16 November 2026), 'new'
  // (#/publish/new: New video, whatever is running; #/publish/new/<id> a saved job's links) or 'job' (#/publish/job/<id>). routeJob is
  // that id. Internal moves push a history entry, so Back walks them in order.
  let view = 'line', routeJob = null, extNote = '';
  // New video (16 November 2026): the two links as typed, and the saved job being edited at #/publish/new/<id> (newId is
  // the id the route asks for; editId the one whose fields are loaded into the form).
  const W = window.WWLine;
  let mainUrl = '', reelUrl = '', newId = null, editId = null;
  // links (the old list) is derived from the two fields, so the existing-work check and the running-job check read it as before.
  function setLinks() { links = [['main', mainUrl], ['reel', reelUrl]].map(([role, url]) => { const p = W.driveFile(url); return p.kind === 'empty' ? null : {url:p.url, id:p.id, kind:p.kind === 'file' ? 'file' : p.kind, role, by:'taylor'}; }).filter(Boolean); }
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
    // Step 1 stays on until the files are checked: Generate never moves the strip on, and Check the files never moves it back.
    const at = s === 'new' || s === 'saved' || s === 'check' || (['queued','starting','running'].includes(s) && !filesChecked(job)) ? 0 : ['queued','starting','running','found','pack'].includes(s) ? 1 : ['finishing','pilot','review','ask'].includes(s) || (s === 'final' && !job.pack?.platforms?.length) ? 2 : failed ? (LATER.includes(job.session?.step) || job.pickedAt ? 2 : 1) : 3;
    return '<ol class="pb-steps">'+['Drive links','Variety Pack','Finished edits','Post'].map((n, i) => '<li class="'+(i < at ? 'is-done' : i === at ? (failed ? 'is-failed' : 'is-on') : '')+'"'+(i === at ? ' aria-current="step"' : '')+'><b>'+(i+1)+'</b>'+n+(i === at && failed ? ' <small>stopped</small>' : '')+'</li>').join('')+'</ol>';
  }
  // The files are checked once Taylor confirmed them, the session marked each one done, or the job is past the pack.
  const filesChecked = j => !!j && (!!j.checkedAt || ['found','pack','finishing','pilot','review','ask','thumbs','posts','final'].includes(j.status) || ((j.sources || []).length > 0 && j.sources.every(x => x.check === 'done')));
  // Every problem at once, re-checked on each change (links, roles and title) and again when Generate is pressed.
  // Folder mode: exactly one folder link and nothing else. The title can wait: Claude suggests it from the folder name.
  const folderMode = () => links.length === 1 && links[0].kind === 'folder' && !!links[0].folderId;
  // New video: the two-link rule (publish-line.js). Every problem at once, re-checked on each change and again on Run.
  function problems() { return W.checkLinks(mainUrl, reelUrl); }
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
  const JOB_WORD = {queued:'not started', starting:'starting', running:'Claude Code is working on it', check:'waiting for you to check the files', found:'found earlier work', pack:'Variety Pack ready', finishing:'edit in progress', pilot:'pilot ready to watch', review:'master and LinkedIn cut ready to watch', ask:'waiting for your booking link or buyer', thumbs:'thumbnails ready to pick', posts:'thumbnails and posts ready to pick', final:'finished', failed:'stopped, Variety Pack kept'};
  const PACK_WORD = {variety:'Variety Pack', katana:'Katana moments', reels:'Reel pack'};
  function earlier() {
    if (!links.length || problems().length) return [];
    const ids = new Set(links.map(l => l.id).filter(Boolean)), folder = folderMode() ? links[0].folderId : null, tid = intakeTopic()?.id || null;
    const why = (driveIds, folderId, topicId) => (driveIds || []).some(d => ids.has(d)) ? 'Same Drive file' : folder && folderId === folder ? 'Same Drive folder' : tid && topicId === tid ? 'Same topic' : '';
    const out = [];
    jobs.forEach(j => { if (j.id === editId || (j.status === 'failed' && !j.packUrl)) return;  // a stopped job with no pack has nothing to reuse
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
  // A running job blocks a second job for the SAME recording only (same Drive file or folder); never a new video.
  const sameRunning = () => { const ids = new Set(links.map(l => l.id).filter(Boolean)), folder = folderMode() ? links[0].folderId : null;
    return jobs.find(j => ['queued','starting','running','finishing'].includes(j.status) && ((j.sources || []).some(x => ids.has(x.driveId)) || (folder && j.source?.folderId === folder))) || null; };
  const canGenerate = () => !W.linkBlock(mainUrl, reelUrl) && db && !sameRunning() && !starting;
  // Save to the line needs one good link at least (the card then says which is missing); Run needs both.
  const saveBlock = () => W.linkBlock(mainUrl, reelUrl) === 'Add both links to run' ? 'Add a link to save' : W.checkLinks(mainUrl, reelUrl).length ? 'Fix the links to save' : '';
  const canSave = () => !saveBlock() && db && !starting;
  function checkHtml() {
    const ps = problems(), found = earlier(), shown = found.length && reuseSeen === reuseSig() && reuseOk !== reuseSeen, sr = sameRunning();
    const block = W.linkBlock(mainUrl, reelUrl), why = block || (sr ? 'This recording already has a job running' : !db ? (connecting ? 'Connecting' : 'Saving needs the app’s database, which this preview does not have') : '');
    const dis = !canGenerate() ? ' disabled aria-describedby="pb-run-why"' : '';
    return (ps.length ? '<div class="pb-warn" role="alert">'+(ps.length === 1 ? esc(ps[0]) : '<ul>'+ps.map(x => '<li>'+esc(x)+'</li>').join('')+'</ul>')+'</div>' : '')+
      (shown ? reuseHtml(found) : '<div class="pb-run"><button type="button" class="pb-go pb-run-go" id="pb-generate"'+dis+'>Run →</button><button type="button" class="pb-ghost" id="pb-save"'+(canSave() ? '' : ' disabled aria-describedby="pb-run-why"')+'>Save to the line</button></div>'+
        '<p class="pb-muted pb-run-why" id="pb-run-why">'+(why ? '<b>'+esc(why)+'.</b> ' : '')+'Run needs both links. Save to the line puts the card on Drive links without starting anything.</p>')+
      (sr ? '<div class="pb-warn" role="alert">This recording already has a job running. <a class="pb-link" href="#/publish/job/'+encodeURIComponent(sr.id)+'">Open it</a></div>' : '');
  }
  // One link as a sheet on the side panel: its role, what it becomes, and whether it is in.
  const ROLE_OF = {main:['Main video · 16:9', 'YouTube, LinkedIn', 'is-wide'], reel:['Reel · upright', 'Instagram, Facebook', 'is-tall']};
  function sideSheet(k, url, other) {
    const p = W.driveFile(url), [lab, to, shape] = ROLE_OF[k];
    const same = p.kind === 'file' && W.driveFile(other).id === p.id;
    const st = p.kind === 'empty' ? ['is-warn', 'Missing'] : p.kind !== 'file' || same ? ['is-warn', 'Check it'] : ['is-ok', 'Added'];
    return '<li class="pb-sheetrow"><span class="pb-shape '+shape+'" aria-hidden="true"></span><div><b>'+lab+'</b><small>'+(p.kind === 'empty' ? 'Not added yet' : esc(p.id ? 'Drive file …'+p.id.slice(-6) : p.url))+' · '+to+'</small></div><span class="pb-status '+st[0]+'">'+st[1]+'</span></li>';
  }
  const sideLinks = (m = mainUrl, r = reelUrl) => '<ul class="pb-sheets">'+sideSheet('main', m, r)+sideSheet('reel', r, m)+'</ul>';
  function linkField(k) {
    const main = k === 'main';
    return '<label class="pb-field pb-lnk" for="pb-'+k+'"><span class="pb-lnk-h"><span class="pb-shape '+(main ? 'is-wide' : 'is-tall')+'" aria-hidden="true"></span>'+(main ? 'Main video · 16:9 landscape' : 'Reel · upright phone recording')+' <em>Required</em></span>'+
      '<i>'+(main ? 'Becomes the YouTube video and the LinkedIn cut. Your 32:9 house recording works too.' : 'Becomes the Instagram reel and the 4:5 post (Facebook gets the same).')+' Share it “Anyone with the link”.</i>'+
      '<input id="pb-'+k+'" type="url" inputmode="url" spellcheck="false" autocomplete="off" required aria-required="true" placeholder="https://drive.google.com/file/d/…" value="'+esc(main ? mainUrl : reelUrl)+'"></label>';
  }
  function intake() {
    const ts = topics(), ed = editId && jobs.find(j => j.id === editId);
    return '<div class="pb-new"><div class="pb-big"><div class="pb-big-sheet" aria-hidden="true"></div><div class="pb-big-face"><div class="pb-cardno"><b>JOB '+esc(ed ? jobNo(ed) : String(jobs.length + 1).padStart(2, '0'))+' · '+(ed ? 'SAVED' : 'NEW')+'</b><span class="pb-hand" aria-hidden="true">on the line next</span></div><div class="pb-rows">'+
      linkField('main')+linkField('reel')+
      '<label class="pb-field" for="pb-title"><span>What is this video about? <i class="pb-opt-note">Optional: pick one of your saved topics or type it</i></span><input id="pb-title" list="pb-topic-list" maxlength="200" autocomplete="off" placeholder="Type it, or pick one of your saved topics" value="'+esc(title)+'"><datalist id="pb-topic-list">'+ts.map(t => '<option value="'+esc(t.title)+'">').join('')+'</datalist></label>'+
      '<div id="pb-topic-q">'+topicHtml()+'</div>'+
      '<label class="pb-field" for="pb-brief"><span>What you say in it, in your words (optional)</span><textarea id="pb-brief" rows="3" maxlength="2000" placeholder="The main points, any numbers you mention, who it is for. The title, description and posts are written from this and the transcript.">'+esc(brief)+'</textarea></label>'+
      '<div id="pb-check">'+checkHtml()+'</div></div></div></div>'+
      '<aside class="pb-side" aria-labelledby="pb-side-h"><h2 id="pb-side-h">Check before it runs</h2><div id="pb-side-links">'+sideLinks()+'</div>'+
      '<p class="pb-muted">Claude Code checks each file’s real shape and length first, and stops to ask you if the two look swapped or the reel is not upright, before any editing.</p>'+
      '<div class="pb-apbox">'+(window.WWAutopilot?.intakeHtml?.() || '')+'</div>'+
      '<p class="pb-skills">'+(db || !connecting ? 'The job uses the skills in Settings: <b>'+esc(skillLine())+'</b>.' : 'Connecting…')+'</p>'+readyJobs()+'</aside></div>';
  }
  const skillLine = () => { const s = window.WWSettings?.skills || {}, n = window.WWSettings?.name || (x => x); return [n(s.publishEdit), n(s.publishThumbs), n(s.publishPosts)].filter(Boolean).join(', '); };
  const busy = () => job && ['queued','starting','running','finishing'].includes(job.status);
  // Automatic start (Taylor, 3 November 2026): Generate and Continue start a Claude Code session in the cloud
  // through the viewer's Claude Code Remote connector. The session follows PUBLISH.md with the skills saved on the
  // job. If the connector is refused or unavailable, the job stays queued with the line to send instead.
  const ENV = 'env_017PLHsTGZVgThRnUnu1eoGG', REPO = 'https://github.com/taylor585/Whiteboard-Wednesdays';
  // Steps (Phase 5): 'pack' runs the job; 'finals' continues after the Variety Pack picks and builds the pilot; 'pilot' and
  // 'review' continue after Taylor's answer at those stops. The line names the stop, so PUBLISH.md says what each one does.
  // 'thumbs' (10 November 2026): a stuck or failed polish session restarts the polish, never the Variety Pack.
  const LATER = ['finals','pilot','review','thumbs'];
  const lineFor = (step, id) => step === 'pack' ? 'Run Publish job '+id : 'Continue Publish job '+id+' from '+(step === 'finals' ? 'pack' : step === 'thumbs' ? 'thumbnails' : step);
  function sessionTitle(step, j, extra) {
    const d = (extra?.approvals || j.approvals || {})[step]?.decision;
    return (step === 'pack' ? 'Publish: ' : step === 'thumbs' ? 'Publish thumbnails: ' : step === 'finals' ? 'Publish pilot: ' : step === 'pilot' ? (d === 'changes' ? 'Publish pilot changes: ' : 'Publish master: ') : (d === 'changes' ? 'Publish master changes: ' : 'Publish finals: '))+(j.title || j.id);
  }
  function sessionPrompt(step, j, line) {
    if (step === 'pack') return line+'. Follow PUBLISH.md in this repository exactly: start with its Check the files stage, run the job with the skills named on the job document, write every stage back to jobs/'+j.id+' in the Whiteboard Wednesdays app artifact, and never post anything: only a posting session posts (POSTING.md), never this one. If a pinned database write is refused because the document changed (the app may still be saving its own start record), read the job again and redo that write.'+(window.WWAutopilot?.promptLine?.(j) || '');
    const w = j.work?.savedAt ? 'Start by restoring the saved work set (saved '+j.work.savedAt+') as PUBLISH.md says, instead of transcribing, mapping or planning again' : 'Start with the work set as PUBLISH.md says: none is saved yet, so make it once and save it before rendering';
    return line+'. Follow PUBLISH.md in this repository exactly. '+w+'. Use the skills named on the job document, write every stage back to jobs/'+j.id+' in the Whiteboard Wednesdays app artifact, and never post anything: only a posting session posts (POSTING.md), never this one. If a pinned database write is refused because the document changed (the app may still be saving its own start record), read the job again and redo that write.'+(window.WWAutopilot?.promptLine?.(j) || '');
  }
  // The job's status moves on only after the session has actually started; a refusal leaves it where it was, with Try again.
  // extra is Taylor's answer at a stop (approvals), saved together with the session so a refusal saves nothing.
  async function startSession(j, step, extra = null) {
    const line = lineFor(step, j.id), requestedAt = new Date().toISOString();
    // The two-link rule (16 November 2026): a job with declared links, or saved to the line, never starts with one link.
    // Jobs from before (a folder, or a list of file links) have no declared links and keep the old rules.
    const block = step === 'pack' ? W.runBlock(j) : '';
    if (block) { retry = null; retryExtra = null; note = block+'. Nothing has started.'; render(); return false; }
    starting = step; retry = null; retryExtra = null; note = ''; render();
    try {
      const mcp = await window.claude?.use?.('mcp');
      if (!mcp) throw {code:'unavailable'};
      const r = await (window.WWStore?.createSession || ((m, a) => m.callTool('Claude Code Remote', 'create_session', a)))(mcp, {model:'claude-opus-5-5', permission_mode:'auto', environment_id:ENV, source_url:REPO, title:sessionTitle(step, j, extra), prompt:sessionPrompt(step, j, line)});
      const p = r?.payload || {}, sid = p.ccr?.id || p.session_id || p.id || p.session?.id || null;
      starting = null;
      await save({session:{id:sid, url:sid ? 'https://claude.ai/code/'+sid : null, step, requestedAt, startedAt:new Date().toISOString()},
        ...(step === 'pack' ? {status:'starting', ...(j.status === 'saved' ? {startedAt:requestedAt} : {})} : {status:'finishing', ...(step === 'finals' ? {pickedAt:requestedAt} : {})}), ...(extra || {}), ...(j.status === 'failed' ? {error:null, failedStage:null} : {}), ...(window.WWAutopilot?.answered?.(j) || {})});
      if (!note) { changing = null; changeNote = ''; }
      // A Path B reel job made while the Video session was refused starts with this job's next session (decision 10).
      if (step === 'pack' && window.WWReels?.startQueued) await window.WWReels.startQueued(j.id);
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
  const failedLater = () => job?.status === 'failed' && ['pilot','review','thumbs'].includes(job.session?.step);
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
  const ROLE = {main:'Main recording', reel:'Reel recording (phone take)', skip:'Leave it out'};
  // Master rule 4 on screen: a phone recording can never be the main, the YouTube recording can never be a reel take,
  // and an output or anything else can only be left out.
  // A file link marked with the wrong role (a phone take pasted first, so it defaulted to main) is offered with the role
  // its real shape gives it: the YouTube recording is the main, an upright phone recording a reel take.
  const SHAPE_ROLE = {'youtube-recording':'main', 'phone-recording':'reel'};
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
      // Audit 7 Nov 2026: only a file the classifier is sure of on its own evidence (fileDecision, without the role it was
      // pasted with) is preselected. Every unsure file starts on "Choose…", so Confirm cannot pass a guess with one tap.
      roles:src.map(x => { const a = allowedRoles(x.kind), sure = (x.fileDecision || x.decision) === 'accept';
        return a.length === 1 ? 'skip' : !sure ? '' : a.includes(x.role) ? x.role : x.role ? SHAPE_ROLE[x.kind] || '' : ''; }), order:[]};
    ck.order = ck.roles.map((r, i) => i).filter(i => ck.roles[i] === 'main').sort((a, b) => (src[a].part || 1e3) - (src[b].part || 1e3) || a - b);
  }
  // The parts of the main recording, in the order they are joined: a file newly set to main joins at the end.
  function ckSync() { ck.order = ck.order.filter(i => ck.roles[i] === 'main'); ck.roles.forEach((r, i) => { if (r === 'main' && !ck.order.includes(i)) ck.order.push(i); }); }
  const sizeOf = p => p?.width && p?.height ? p.width+'×'+p.height : '';
  function ckProblems() {
    const src = job.sources || [], out = [];
    if (!src.length) out.push('Claude Code has not listed any files yet.');
    if (!ck.title.trim()) out.push('Say what the video is about.');
    ck.roles.forEach((r, i) => { if (!r) out.push('Choose what file '+(i+1)+' ('+(src[i].name || 'Drive file')+') is.'); });
    ckSync();
    const mains = ck.order.length, reels = ck.roles.filter(r => r === 'reel').length;
    if (src.length && !mains) out.push(ck.roles.includes('reel') ? 'No main recording: a phone recording alone cannot make the video or its reels (they need the main recording’s screen share). Add the main recording to the folder and press Check again, or choose one here.' : 'No main recording: the job needs one landscape recording with sound. Add it to the folder and press Check again, or choose one here.');
    if (mains > MAX_PARTS) out.push('Up to '+MAX_PARTS+' parts in one main recording.');
    const sizes = [...new Set(ck.order.map(i => sizeOf(src[i].probe)).filter(Boolean))];
    if (sizes.length > 1) out.push('The parts of the main recording are not all one size ('+sizes.join(', ')+'), so they cannot be joined into one recording. Leave out the part that does not belong.');
    if (reels > MAX_REELS) out.push('Up to '+MAX_REELS+' phone reel recordings; leave '+(reels - MAX_REELS)+' out.');
    return out;
  }
  // Decision 11: the reels path follows the files as Taylor confirms them here (a phone take kept as a reel recording
  // beside the main recording is Path B), so the line under Confirm says what will start, without asking.
  const ckSources = () => (job.sources || []).map((x, i) => ({...x, role:ck.roles[i], ...(ck.roles[i] ? {roleBy:'taylor', confirmedAt:'on screen'} : {})}));
  const ckPath = () => window.WWReels?.choosePath ? window.WWReels.choosePath(ckSources()) : {path:null, takes:[]};
  const ckCheckHtml = () => { const ps = ckProblems(), pc = ckPath(), b = pc.path === 'B' && !reelsFor(job), a = pc.path === 'A' && !reelsFor(job);
    return (ps.length ? '<div class="pb-warn" role="alert">'+(ps.length === 1 ? esc(ps[0]) : '<ul>'+ps.map(x => '<li>'+esc(x)+'</li>').join('')+'</ul>')+'</div>' : '')+
    '<button type="button" class="pb-go" id="pb-ck-go"'+(ps.length || starting || !db ? ' disabled' : '')+'>Confirm and continue</button><p class="pb-muted">The main recording is edited for YouTube and LinkedIn: Claude Code makes the Variety Pack from it alone'+
    (b ? '. '+esc(pc.why)+' Confirm also starts the reels by themselves, in a separate session: Claude Code cuts reel options from your phone take, with silent screen-share B-roll from the main recording, and stops for you to keep the ones you want. Nothing short is ever cut from the YouTube video itself.</p>'
      : a ? '. Confirm also starts your reel scripts by themselves, in a separate session: Claude Code reads the main recording for its words and times only and writes six reel scripts on the title (each a hook, three highlights and a close, 60 seconds or less), then stops for you to pick two to record on your phone. Nothing short is ever cut from the main recording.</p>'
      : '. Reel recordings wait until you pick reel winners, and nothing short is ever cut from the main recording.</p>'); };
  const reelsFor = j => j && window.WWReels?.forJob?.(j.id) || null;
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
    ckSync();
    const parts = ck.order.length > 1 ? ck.order : [], name = x => x.name || 'Drive file …'+String(x.driveId || '').slice(-6);
    const why = x => { const d = x.decision || 'ask'; return '<span class="pb-ck-why"><em class="pb-badge is-'+esc(d)+'">'+esc(DECIDE[d] || d)+'</em> '+esc(x.reason || '')+'</span>'; };
    const total = parts.every(i => +src[i].probe?.seconds > 0) ? parts.reduce((a, i) => a + +src[i].probe.seconds, 0) : null;
    const allOk = parts.every(i => (src[i].decision || 'ask') === 'accept');
    // One main card for a main recorded in parts: its parts in the order they are joined, each moved or left out with one tap.
    const card = parts.length ? '<li class="pb-src pb-ck-row pb-ck-main is-'+(allOk ? 'accept' : 'ask')+'" aria-labelledby="pb-ck-main-h"><span class="pb-shape '+shape(src[parts[0]].probe)+'" aria-hidden="true"></span><div><b id="pb-ck-main-h">Main recording · '+parts.length+' parts</b>'+
      '<span class="pb-ck-meta">'+esc([sizeOf(src[parts[0]].probe), total ? clock(total)+' in all' : ''].filter(Boolean).join(' · '))+' · joined in this order into one recording</span>'+
      '<ol class="pb-mparts">'+parts.map((i, k) => { const x = src[i], n = name(x);
        return '<li class="pb-mpart"><span class="pb-mpart-n" aria-hidden="true">'+(k+1)+'</span><div><b>'+esc(n)+'</b><span class="pb-ck-meta">Part '+(k+1)+' · '+esc(meta(x.probe))+'</span>'+why(x)+'</div>'+
          '<span class="pb-mpart-acts"><button type="button" class="pb-link pb-mpart-btn" data-part-up="'+i+'" aria-label="Move '+esc(n)+' up"'+(k ? '' : ' disabled')+'>↑</button><button type="button" class="pb-link pb-mpart-btn" data-part-down="'+i+'" aria-label="Move '+esc(n)+' down"'+(k < parts.length - 1 ? '' : ' disabled')+'>↓</button><button type="button" class="pb-link" data-part-drop="'+i+'" aria-label="Leave out '+esc(n)+'">Leave out</button></span></li>'; }).join('')+
      '</ol></div></li>' : '';
    const rows = card + src.map((x, i) => { if (parts.includes(i)) return ''; const a = allowedRoles(x.kind), d = x.decision || 'ask';
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
    if (e.target.id === 'pb-ck-topic') { ck.touched = true; ck.topicId = e.target.value; const t = topics().find(x => x.id === ck.topicId);
      // A title Taylor typed (at the intake or here) is kept: the topic only fills a title that came from the folder name.
      if (t && !ck.titleTyped && job.titleBy !== 'taylor') ck.title = t.title; render(); return true; }
    const r = e.target.closest('[data-ck]'); if (r) { ck.touched = true; ck.roles[+r.dataset.ck] = r.value; ckSync(); render(); return true; }
    return false;
  }
  // One tap on a part: move it up or down the joining order, or leave it out (its file row then offers Main recording
  // again, which adds it back as the last part). Focus stays on the part, or on the main card after Leave out.
  function ckPart(b) {
    if (!ck || job?.status !== 'check') return false;
    const d = b.dataset, i = +(d.partUp ?? d.partDown ?? d.partDrop); if (d.partUp === undefined && d.partDown === undefined && d.partDrop === undefined) return false;
    ckSync(); const k = ck.order.indexOf(i); if (k < 0) return true; ck.touched = true;
    if (d.partDrop !== undefined) { ck.roles[i] = 'skip'; ckSync(); render(); (root.querySelector('#pb-ck-main-h') ? root.querySelector('[data-part-drop]') : root.querySelector('[data-ck="'+i+'"]'))?.focus(); return true; }
    const to = d.partUp !== undefined ? k - 1 : k + 1; if (to < 0 || to >= ck.order.length) return true;
    [ck.order[k], ck.order[to]] = [ck.order[to], ck.order[k]]; render();
    const again = root.querySelector('[data-part-'+(d.partUp !== undefined ? 'up' : 'down')+'="'+i+'"]');
    (again && !again.disabled ? again : root.querySelector('[data-part-'+(d.partUp !== undefined ? 'down' : 'up')+'="'+i+'"]'))?.focus();
    return true;
  }
  async function ckConfirm() {
    if (!ck || ckProblems().length || starting) { render(); return; }
    const at = new Date().toISOString(), topicId = ck.topicId && ck.topicId !== 'none' ? ck.topicId : null;
    ckSync();
    // A main in parts saves part 1..n in the joining order; a single main has no part (as before 6 November 2026).
    const sources = (job.sources || []).map((x, i) => { const {part, ...y} = x, k = ck.order.indexOf(i);
      return {...y, role:ck.roles[i], roleBy:'taylor', confirmedAt:at, ...(ck.order.length > 1 && k >= 0 ? {part:k+1} : {})}; });
    await save({sources, reelTakes:sources.filter(x => x.role === 'reel').map(x => x.driveId), title:ck.title.trim(), titleBy:'taylor', topicId, checkedAt:at});
    if (note) return;
    const j = job, started = await startSession(j, 'pack');
    // Decision 10: with a phone take beside the main recording, the reels start by themselves on Path B (their own
    // reels/<id>, linked by jobId; this job is never written for them). If the Video session was refused, the reel job
    // waits on "queued" and starts with the Video job's next session.
    // Path A (7 November 2026): with the main recording alone, the same Confirm starts the reel scripts by themselves.
    if (window.WWReels?.autoFromJob && ['A','B'].includes(window.WWReels.choosePath(j.sources).path)) { await window.WWReels.autoFromJob(j, started); render(); }
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
  // The app runs inside a claude.ai artifact frame. A pack link opens a new tab from the click itself (window.open, so a
  // blocked tab is noticed); when the frame or the browser blocks it, the page says so and the link can be copied.
  const extHtml = () => extNote ? '<div class="pb-warn pb-extnote" role="alert"><p>'+esc(extNote)+'</p></div>' : '';
  // The stage list is written by the session as it works; nothing here is simulated.
  function stages() {
    const list = job.stages || [];
    const ses = job.session?.url ? ' <a class="pb-link" href="'+esc(job.session.url)+'" target="_blank" rel="noopener noreferrer">Watch the session ↗</a>' : '';
    const stuck = stuckMinutes(), fs = job.status === 'failed' ? failedStage() : '';
    const head = job.status === 'failed' ? '<div class="pb-warn pb-failed" role="alert"><p><b>This job stopped'+(fs ? ' at “'+esc(fs)+'”' : '')+'.</b> '+esc(job.error || 'Claude Code did not say why.')+'</p><p>Nothing was posted. '+(failedLater() ? 'Your picks, your answers and the saved work are kept: Try again runs that step again from them, or start a new video.' : job.packUrl ? 'Your Variety Pack is still there: fix the problem, then press Continue, or start a new video.' : 'Press Start a new video when you are ready.')+ses+'</p>'+
        (failedLater() ? '<p class="pb-acts"><button type="button" class="pb-link" id="pb-retry-step"'+(starting ? ' disabled' : '')+'>Try again</button></p>' : '')+'</div>'
      : stuck ? '<div class="pb-warn pb-stuck" role="alert"><p><b>Claude Code has not reported back</b> for '+(stuck >= 120 ? Math.floor(stuck / 60)+' h '+(stuck % 60)+' min' : stuck+' minutes')+'. It may have stopped.</p><p class="pb-acts">'+ses+' <button type="button" class="pb-link" id="pb-retry-stuck">Try again</button> <button type="button" class="pb-link" id="pb-stop">Stop this job</button></p></div>'
      : job.status === 'queued' ? '<p class="pb-queue"><b>Not started yet.</b> <button type="button" class="pb-link" id="pb-start"'+(starting ? ' disabled' : '')+'>Start now</button> or say this in a Claude chat: <code>Run Publish job '+esc(job.id)+'</code> <button type="button" class="pb-link" data-copy-run="pack"'+M.done('run', copied === 'run')+'>'+M.label(copied === 'run', 'Copy', 'Copied')+'</button></p>'
      : job.status === 'starting' ? '<p class="pb-queue"><b>Starting Claude Code.</b> A session is opening in the cloud with your skills; the steps appear here as it works, usually within two minutes. '+esc(waitLine())+ses+'</p>'
      : ['running','finishing'].includes(job.status) ? '<p class="pb-queue pb-running"><b>Claude Code is working on this'+esc(doing())+'.</b> '+esc(waitLine())+(job.session?.startedAt ? ' Started '+esc(when(job.session.startedAt))+'.' : '')+' You can close this tab: it carries on.'+ses+'</p>' : '';
    const bar = starting === 'finals' ? '<div class="pb-bar"><span>Starting Claude Code for the pilot…</span></div>' : confirm ? confirmBar() : '<div class="pb-bar"><span>Picks made in the Variety Pack?</span><span class="pb-muted">Claude reads them from that page and builds a pilot of the first 60 to 90 seconds for you to watch.</span><button type="button" class="pb-go" id="pb-continue">Continue · build the pilot →</button></div>';
    const pr = job.packRecord || {}, ticked = Number.isFinite(pr.preticked) && pr.preticked > 0 ? ' '+pr.preticked+' designs you approved on earlier videos are already ticked'+(Number.isFinite(pr.fresh) ? '; you decide the '+pr.fresh+' new ones' : '')+'. Untick any you do not want.' : '';
    const packLink = job.packUrl && !['finishing','pilot','review','ask','thumbs','posts','final'].includes(job.status) && !failedLater() && !(window.WWAutopilot?.on?.(job) && !['pack','failed'].includes(job.status)) ? '<p class="pb-queue"><b>'+(job.reusedFrom ? 'Using your earlier Variety Pack.' : 'Your Variety Pack is ready.')+'</b> '+(job.reusedFrom ? 'Nothing was rebuilt: your picks on that page carry over. Check them there, then come back and press Continue.' : 'It opens as its own page: make your picks there, then come back and press Continue.')+esc(ticked)+' <a class="pb-go pb-packgo" href="'+esc(job.packUrl)+'" target="_blank" rel="noopener noreferrer" data-ext>Open the Variety Pack ↗</a> <button type="button" class="pb-link pb-copyurl" data-copy-url="'+esc(job.packUrl)+'"'+M.done('url:'+job.packUrl, copied === 'url:'+job.packUrl)+'>'+M.label(copied === 'url:'+job.packUrl, 'Copy the link', 'Copied')+'</button></p>'+extHtml()+(canContinue() && !job.pack?.platforms?.length ? bar : '') : '';
    return head+packLink;
  }
  // The Variety Pack once it is behind Taylor: one reference line inside "How it was made".
  const packRef = () => job.packUrl && !(job.packUrl && !['finishing','pilot','review','ask','thumbs','posts','final'].includes(job.status) && !failedLater() && !(window.WWAutopilot?.on?.(job) && !['pack','failed'].includes(job.status))) ? '<p class="pb-meta">Variety Pack '+(job.packRecord?.round ? 'round '+esc(job.packRecord.round)+' ' : '')+'· <a class="pb-link" href="'+esc(job.packUrl)+'" target="_blank" rel="noopener noreferrer" data-ext>Open it ↗</a> <button type="button" class="pb-link pb-copyurl" data-copy-url="'+esc(job.packUrl)+'"'+M.done('url:'+job.packUrl, copied === 'url:'+job.packUrl)+'>'+M.label(copied === 'url:'+job.packUrl, 'Copy the link', 'Copied')+'</button></p>'+extHtml() : '';
  // The stage list (7 November 2026, action first): below the decision, folded into "How it was made", closed whenever
  // there is something for Taylor to do or the job is final, open while a session is working.
  const working = () => !!starting || ['starting','running','finishing'].includes(job?.status);
  const hasAction = () => !working();
  function stageList() {
    const list = job.stages || [], wl = packRef()+workLine();
    if (!list.length && !wl) return '';
    const items = list.length ? '<ol>'+list.map(s => '<li class="is-'+esc(/^fail/.test(s.state || '') ? 'failed' : s.state || 'wait')+'"'+M.stage('job:'+job.id, s)+'><span class="pb-st-dot" aria-hidden="true"></span><b>'+esc(s.name)+'</b><small>'+esc(stageDetail(s))+'</small><time>'+(s.state === 'done' ? elapsed(s.startedAt, s.endedAt) : s.state === 'run' ? 'running '+elapsed(s.startedAt) : '')+'</time></li>').join('')+'</ol>' : '';
    const done = list.filter(s => s.state === 'done').length;
    return '<details class="pb-stages pb-made"'+(hasAction() ? '' : ' open')+'><summary><span>How it was made</span><small>'+(list.length ? done+' of '+list.length+' step'+(list.length === 1 ? '' : 's')+' done' : '')+'</small></summary>'+wl+items+'</details>';
  }
  // A stage the session wrote before Taylor confirmed the files never says he did.
  const stageDetail = s => { const d = String(s.detail || ''); if (job.checkedAt || !/confirmed by (you|taylor)/i.test(d)) return d;
    return d.replace(/[^.]*confirmed by (you|taylor)[^.]*\.?/ig, '').trim().replace(/\s+/g, ' ') + (job.status === 'check' ? ' Waiting for you to confirm.' : ''); };
  // How long a running step usually takes, from the real runs (6 and 7 November 2026).
  function waitLine() {
    const st = starting || job.session?.step, d = st && job.approvals?.[st]?.decision;
    if (job.status === 'starting' && st === 'pack' || job.status === 'running' || (starting === 'pack')) return filesChecked(job) ? 'The Variety Pack usually takes about 3 h.' : 'It checks the files first (a few minutes), then makes the Variety Pack: usually about 3 h.';
    if (st === 'finals') return 'The pilot usually takes about 25 min.';
    if (st === 'pilot') return d === 'changes' ? 'A change round usually takes about 3–5 h.' : 'The master and LinkedIn cut usually take about 3 h.';
    if (st === 'review') return d === 'changes' ? 'A change round usually takes about 3–5 h.' : 'The thumbnails and posts usually take about 15 min.';
    if (st === 'thumbs') return 'Polishing and sizing your picks usually takes about 15 min.';
    return '';
  }
  // ---- Thumbnail picks (7 November 2026, Thumbnail Tracker 4.0.0; PUBLISH.md "Thumbnails and posts") -------------------
  // The session stops on "thumbs" with sixteen numbered variations (pack.thumbRound). Taylor picks one for YouTube; LinkedIn
  // uses the same one unless he picks another. Polish my picks saves the picks with the session it starts, which polishes
  // only those and sizes them, then stops on "posts".
  const tvars = () => (job.pack?.thumbRound?.variations || []).filter(v => v && v.id);
  const tpicks = () => ({youtube:job.picks?.['thumbs.youtube'] || null, linkedin:job.picks?.['thumbs.linkedin'] || null});
  let liOwn = false;
  function thumbsStop() {
    const r = job.pack?.thumbRound || {}, vs = tvars(), pk = tpicks(), off = !!starting;
    const sheet = imgUrl(r.sheet);
    const tile = (k, v, i) => { const src = thumbImg(v), n = thumbNo(v, i), sel = pk[k] === v.id, label = v.words || v.label || 'Thumbnail '+n;
      return '<button type="button" class="pb-opt pb-th'+(src ? '' : ' is-text')+'" data-tpick="'+k+'" data-val="'+esc(v.id)+'" aria-pressed="'+sel+'" aria-label="Thumbnail '+n+': '+esc(label)+'"'+(off ? ' disabled' : '')+'>'+
        '<span class="pb-th-n" aria-hidden="true">'+n+'</span>'+(src ? '<img src="'+esc(src)+'" alt="" loading="lazy">' : '<span class="pb-th-txt">'+esc(label)+'</span>')+'</button>'; };
    const line = k => { const i = vs.findIndex(v => v.id === pk[k]), v = vs[i]; if (!v) return '<p class="pb-th-line pb-muted">Tap a thumbnail to pick it.</p>';
      return '<p class="pb-th-line"><b>'+thumbNo(v, i)+'</b> <span>'+esc([v.words, v.layout, v.ground].filter(Boolean).join(' · '))+'</span>'+(thumbFull(v) ? ' <a class="pb-link pb-th-open" href="'+esc(thumbFull(v))+'" target="_blank" rel="noopener noreferrer">Full size ↗</a>' : '')+'</p>'; };
    const own = liOwn || (pk.linkedin && pk.linkedin !== pk.youtube);
    const ready = !!pk.youtube && !off;
    return '<section class="pb-stop pb-tstop" aria-labelledby="pb-tstop-h">'+trackHtml(2)+'<div class="pb-pack-head"><h2 id="pb-tstop-h" tabindex="-1">Pick your thumbnail</h2><span class="micro">'+esc(vs.length+' variations'+(r.version ? ' · Thumbnail Tracker '+r.version : ''))+'</span></div>'+
      '<p class="pb-muted">Sixteen variations, every one objects only and checked for variety'+(r.check?.line ? ' ('+esc(r.check.line)+')' : '')+'. Pick one for YouTube. LinkedIn uses the same one unless you choose another. Polishing makes the YouTube, LinkedIn and 4:5 sizes of your picks only.</p>'+
      (sheet ? '<figure class="pb-sheet"><a href="'+esc(sheet)+'" target="_blank" rel="noopener noreferrer"><img src="'+esc(sheet)+'" alt="Contact sheet of all sixteen thumbnails, numbered" loading="lazy"></a><figcaption class="pb-muted">Contact sheet: each number matches a tile below.</figcaption></figure>' : '')+
      (vs.length ? '<div class="pb-q"><span class="micro">YouTube · pick 1 of '+vs.length+'</span><div class="pb-opts pb-thumbs">'+vs.map((v, i) => tile('youtube', v, i)).join('')+'</div>'+line('youtube')+'</div>' :
        '<div class="pb-warn" role="alert">Claude Code stopped for your thumbnail pick but wrote no variations. Press Try again below, or send “'+esc(lineFor('review', job.id))+'” in a Claude chat.</div>')+
      (vs.length ? '<div class="pb-q"><label class="pb-check"><input type="checkbox" id="pb-li-own"'+(own ? ' checked' : '')+(off ? ' disabled' : '')+'> Use a different thumbnail for LinkedIn</label>'+
        (own ? '<span class="micro">LinkedIn · pick 1 of '+vs.length+'</span><div class="pb-opts pb-thumbs">'+vs.map((v, i) => tile('linkedin', v, i)).join('')+'</div>'+line('linkedin') : '')+'</div>' : '')+
      '<div class="pb-bar pb-tbar"><span>'+(pk.youtube ? 'Thumbnail '+esc(String(thumbNo(vs.find(v => v.id === pk.youtube), vs.findIndex(v => v.id === pk.youtube))))+' for YouTube'+(own && pk.linkedin && pk.linkedin !== pk.youtube ? ', a different one for LinkedIn' : '') : 'Pick a thumbnail first')+'</span>'+
      '<span class="pb-muted">Starts Claude Code: about 15 min. Nothing is posted.</span><button type="button" class="pb-go" id="pb-polish"'+(ready ? '' : ' disabled')+'>Polish my picks →</button></div></section>';
  }
  // ---- Pilot and review stops (Phase 5, 4 November 2026) ----------------------------------------------------------
  // What the running session is doing, from the stop it continues and Taylor's answer there.
  function doing() {
    const st = job.session?.step, d = st && job.approvals?.[st]?.decision;
    return job.status !== 'finishing' ? '' : st === 'finals' ? ': building the pilot from your picks' : st === 'pilot' ? (d === 'changes' ? ': changing the pilot' : ': rendering the YouTube master and the LinkedIn cut') : st === 'review' ? (d === 'changes' ? ': making your changes to the master and the LinkedIn cut' : ': making the thumbnails and the posts') : '';
  }
  // The saved work set: the next session restores it instead of transcribing, mapping and planning again.
  function workLine() {
    const w = job.work; if (!w?.savedAt || job.status === 'final') return '';
    const n = Array.isArray(w.files) ? w.files.length : 0;
    return '<p class="pb-meta pb-work">Saved work: '+(n ? n+' files' : 'transcript and plan')+(w.stage ? ' after the '+esc(w.stage) : '')+', '+esc(when(w.savedAt))+'. The next session picks it up, so nothing is transcribed or planned again.</p>';
  }
  const STOP_TRACK = ['Pilot','Master and LinkedIn cut','Thumbnails and posts','Ready to post'], STOP_SHORT = ['Pilot','Master','Thumbnails','Ready'];
  // On a phone the stops use their short names, so the row stays on one line at 390 px.
  const trackHtml = at => '<ol class="pb-track" aria-label="Stops after the Variety Pack">'+STOP_TRACK.map((n, i) => '<li class="'+(i < at ? 'is-done' : i === at ? 'is-on' : '')+'"'+(i === at ? ' aria-current="step"' : '')+' data-short="'+STOP_SHORT[i]+'"><span class="pb-tl">'+n+'</span></li>').join('')+'</ol>';
  function stopHtml(kind) {
    const pilot = kind === 'pilot', d = (pilot ? job.pilot : job.cuts) || {}, a = job.approvals?.[kind];
    const url = artifactUrl(d.url) || artifactUrl(job.reviewUrl), round = +d.round || 1;
    const after = a?.decision === 'changes' && a.note && (!d.renderedAt || String(a.at) <= String(d.renderedAt)) ? '<p class="pb-muted">Round '+round+', after your note: “'+esc(a.note)+'”</p>' : '';
    const track = trackHtml(pilot ? 0 : 1);
    const watch = (label, u) => u ? '<a class="pb-go pb-watch" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+label+' ↗</a>' : '';
    const cut = (k, label, c) => { c = c || {}; const u = artifactUrl(c.url) || url;
      return '<li><span class="pb-pf pb-pf-'+k+'">'+label+'</span><b>'+esc(c.label || (k === 'youtube' ? 'YouTube master' : 'LinkedIn cut'))+'</b><small>'+esc([c.seconds && !String(c.detail || '').startsWith(clock(c.seconds)) ? clock(c.seconds) : '', c.detail || ''].filter(Boolean).join(' · ') || 'Length not reported')+'</small>'+watch('Watch it', u)+'</li>'; };
    const body = pilot
      ? '<h2 id="pb-stop-h">Your pilot is ready</h2><p class="pb-muted">The first '+(d.seconds ? clock(d.seconds) : '60 to 90 seconds')+' of the YouTube master, edited with the designs you approved. Watch it with sound before Claude Code renders the whole video.'+(d.detail ? ' '+esc(d.detail) : '')+'</p>'+after+watch('Watch the pilot', url)
      : '<h2 id="pb-stop-h">Your YouTube master and LinkedIn cut are ready</h2><p class="pb-muted">Watch both, then approve them together or say what to change. Nothing has been posted.</p>'+after+'<ul class="pb-cuts">'+cut('youtube', 'YouTube', d.master)+cut('linkedin', 'LinkedIn', d.linkedin)+'</ul>';
    const missing = url ? '' : '<div class="pb-warn" role="alert"><p>Claude Code did not leave a link to watch '+(pilot ? 'the pilot' : 'them')+'. Open the session to see why, or ask for changes.</p></div>';
    const off = starting ? ' disabled' : '';
    const acts = changing === kind
      ? '<div class="pb-change"><label class="pb-field" for="pb-change-note"><span>What should change?</span><textarea id="pb-change-note" rows="4" maxlength="2000" placeholder="'+(pilot ? 'For example: at 0:42 the caption covers the screen; use the short list instead of the cards at 1:05.' : 'Say which video and where, for example: master 12:30, the Blender shot runs long. LinkedIn: start at the second story.')+'">'+esc(changeNote)+'</textarea></label>'+
        '<p class="pb-acts"><button type="button" class="pb-go" id="pb-change-send"'+(changeNote.trim() && !starting ? '' : ' disabled')+'>Send the changes</button><button type="button" class="pb-link" id="pb-change-cancel">Cancel</button></p>'+
        '<p class="pb-muted">Claude Code changes '+(pilot ? 'the pilot' : 'what you asked for')+' from the saved plan and stops here again for you to watch.</p></div>'
      : (pilot ? '' : forHtml())+'<div class="pb-stop-acts"><button type="button" class="pb-go" id="pb-approve"'+(url ? off : ' disabled')+'>'+(pilot ? 'Approve the pilot' : 'Approve both')+'</button><button type="button" class="pb-link" id="pb-change"'+off+'>Change something</button></div>'+
        '<p class="pb-muted">'+(pilot ? 'Approving starts Claude Code: it renders the whole YouTube master and the LinkedIn cut from the saved plan, then stops here for you to watch both.' : 'Approving starts Claude Code: it makes sixteen thumbnails and two checked post variations for YouTube and for LinkedIn, then stops here for you to pick. Nothing is posted.')+'</p>';
    return '<section class="pb-stop" aria-labelledby="pb-stop-h">'+track+body+missing+acts+'</section>';
  }
  // ---- Thumbnails and posts (Phase 7, 4 November 2026) ----------------------------------------------------------
  // Who the video is for comes from the topic (Taylor's decision 7) and can be changed here; the booking link comes from
  // Settings. Both are copied into the job with Approve both, so the session never writes a post with a placeholder.
  const BUYER = {A:'A · wants AI built', B:'B · buys paid ads'};
  const jobTopic = () => job && (window.WWIdeas?.data?.topics || []).find(x => x.id === job.topicId) || null;
  const buyerNow = () => { if (buyerFor !== job?.id) { buyerPick = null; buyerFor = job?.id || null; } const v = buyerPick ?? job?.buyer ?? jobTopic()?.buyer ?? ''; return BUYER[v] ? v : ''; };
  const booking = () => { const b = window.WWSettings?.links?.booking; return b && !window.WWSettings?.bookingProblem?.(b) ? b : null; };
  const postInputs = () => { const b = buyerNow(); return {buyer:b || null, buyerBy:!b ? null : buyerPick ? 'taylor' : job.buyer ? (job.buyerBy || 'taylor') : 'topic', bookingLink:booking()}; };
  const askReady = () => !!buyerNow() && !!booking();
  function forHtml() {
    const b = buyerNow(), t = jobTopic(), link = booking(), fromTopic = b && !buyerPick && !job.buyer && t?.buyer === b;
    return '<div class="pb-for" role="group" aria-labelledby="pb-for-h"><h3 id="pb-for-h">For the thumbnails and posts</h3>'+
      '<label class="pb-field" for="pb-buyer"><span>Who is this video for?</span><select id="pb-buyer"'+(starting ? ' disabled' : '')+'><option value=""'+(b ? '' : ' selected')+'>Not set yet</option>'+Object.entries(BUYER).map(([v, l]) => '<option value="'+v+'"'+(b === v ? ' selected' : '')+'>'+l+'</option>').join('')+'</select></label>'+
      '<p class="pb-muted">'+(fromTopic ? 'From your topic “'+esc(t.title)+'”. Change it here for this video only.' : b ? 'The posts and hashtags are written for this buyer.' : '<b>Not set'+(t ? ' on the topic' : '')+'.</b> Choose one, or Claude Code stops before the posts to ask you.')+'</p>'+
      (link ? '<p class="pb-muted pb-booking">Booking link from Settings: <span class="pb-url">'+esc(link)+'</span></p>'
        : '<p class="pb-warn pb-booking" role="note"><b>No booking link saved.</b> Add it in <a href="#/settings">Settings</a>. Without it, Claude Code stops before writing the posts and asks you here, so no post ever says [BOOKING LINK].</p>')+'</div>';
  }
  // The session stopped on "ask": the booking link or the buyer was missing, so nothing was made.
  function askHtml() {
    const miss = [!booking() && 'your booking link', !buyerNow() && 'who the video is for'].filter(Boolean);
    return '<section class="pb-stop pb-ask" aria-labelledby="pb-stop-h">'+trackHtml(2)+'<h2 id="pb-stop-h">'+(miss.length ? 'Claude Code needs '+miss.join(' and ')+' before the posts' : 'Ready to make the thumbnails and posts')+'</h2>'+
      '<p class="pb-muted">'+esc(job.ask?.note || 'It stopped before making the thumbnails and posts, so nothing was written with a placeholder.')+' Your approved master and LinkedIn cut are kept.</p>'+forHtml()+
      '<div class="pb-stop-acts"><button type="button" class="pb-go" id="pb-ask-go"'+(askReady() && !starting ? '' : ' disabled')+'>Continue · make the thumbnails and posts</button></div>'+
      '<p class="pb-muted">Continue starts Claude Code again from your approved cuts. Nothing is rendered again and nothing is posted.</p></section>';
  }
  // The skill's own placeholder pattern (performance-poster limits.json). Only [YOUTUBE LINK] in a LinkedIn first comment
  // is allowed: the link exists only after Taylor posts the video, so he pastes it here and the page fills it in.
  const PH = /\[(?:[A-Z][A-Z0-9 _\/-]{2,}|your [^\]\n]{2,40})\]|\bX:XX\b/g, YT_PH = '[YOUTUBE LINK]';
  const placeholders = (x, allowYt) => [...new Set(String(x || '').match(PH) || [])].filter(m => !(allowYt && m === YT_PH));
  const httpsUrl = u => { try { const x = new URL(String(u || '').trim()); return x.protocol === 'https:' ? x.href : null; } catch { return null; } };
  const ytUrl = u => { const h = httpsUrl(u); if (!h) return null; const x = new URL(h), host = x.hostname.replace(/^(www|m)\./, '');
    return (host === 'youtube.com' && (x.searchParams.get('v') || /^\/(shorts|live)\/[\w-]{6,}/.test(x.pathname))) || (host === 'youtu.be' && /^\/[\w-]{6,}/.test(x.pathname)) ? h : null; };
  // X (key "x"): body is the first post, replies the posts after it (one link reply for a single, the rest of a thread).
  // Each is counted the way X counts it; one over 280 cannot be used. [YOUTUBE LINK] is allowed in a reply until it is filled.
  const xLen = t => window.WWX ? window.WWX.len(String(t || '').trim()) : [...String(t || '').trim()].length, X_MAX = 280;
  const xPosts = v => [v.body || '', ...(Array.isArray(v.replies) ? v.replies : [])];
  const xLong = v => xPosts(v).map((t, i) => xLen(t) > X_MAX ? 'post '+(i+1)+' is '+xLen(t)+' of '+X_MAX : '').filter(Boolean);
  const needsYt = v => [v.firstComment, ...(Array.isArray(v.replies) ? v.replies : [])].some(t => String(t || '').includes(YT_PH));
  const blocked = (v, key) => [...placeholders(v.title), ...placeholders(v.body), ...placeholders(v.firstComment, true), ...(Array.isArray(v.replies) ? v.replies : []).flatMap(r => placeholders(r, true))];
  // Why a variation cannot be used, in words: a placeholder left in it, or (X) a post over the limit.
  const unusable = (v, key) => { const ph = blocked(v), long = key === 'x' ? xLong(v) : []; return [ph.length ? 'it still has '+ph.join(', ') : '', ...long].filter(Boolean); };
  const picksOpen = () => ['posts','final'].includes(job?.status) && !starting;
  const plats = () => (job?.pack?.platforms || []).filter(pl => pl && pl.key);
  const chosenPost = pl => { const i = (pl.posts || []).findIndex((v, n) => job.picks?.[pl.key+'.post'] === 'v'+(n+1)); return i < 0 || unusable(pl.posts[i], pl.key).length ? null : pl.posts[i]; };
  const chosenThumb = pl => (pl.thumbnails || []).find(t => t.id === job.picks?.[pl.key+'.thumb']) || null;
  // A thumbnail's image (7 November 2026): preview, image or src is an image link as given; file or url only when it names
  // a .jpg, .png or .webp file. A link to a place on a page (#thumb-…) is never an image. One that failed to load here is not.
  const imgUrl = (u, typed = true) => { const s = String(u || '').trim(); if (/^data:image\/(png|jpe?g|webp);/i.test(s)) return badImg.has(s) ? null : s;
    const h = httpsUrl(s); if (!h || badImg.has(h)) return null; const x = new URL(h);
    if (/^#thumb-/i.test(x.hash)) return null;
    return typed || /\.(jpe?g|png|webp)$/i.test(x.pathname) ? h : null; };
  const thumbImg = t => t ? imgUrl(t.preview) || imgUrl(t.image) || imgUrl(t.src) || imgUrl(t.file, false) || imgUrl(t.url, false) : null;
  // Full size: the full image file when there is one, else the page the session published it on (anchors included).
  const thumbFull = t => imgUrl(t.file, false) || imgUrl(t.url, false) || httpsUrl(t.file) || httpsUrl(t.url) || thumbImg(t);
  // The contact-sheet number: t<n> in the id (Thumbnail Tracker), else its place in the list.
  const thumbNo = (t, i) => +(String(t?.n ?? '').match(/^\d+$/)?.[0] || String(t?.id || '').match(/^t(\d+)$/i)?.[1] || (i + 1));
  function pickCount() {
    let need = 0, have = 0;
    plats().forEach(pl => { (pl.questions || []).forEach(q => { need++; if (q.options?.some(o => o.id === job.picks?.[pl.key+'.'+q.id])) have++; });
      if (pl.thumbnails?.length) { need++; if (chosenThumb(pl)) have++; } if (pl.posts?.length) { need++; if (chosenPost(pl)) have++; } });
    return {need, have};
  }
  // The texts one variation gives Taylor to paste: the YouTube title and description, or the LinkedIn post and first comment.
  function parts(pl, v) {
    const yt = pl.key === 'youtube', out = [];
    if (pl.key === 'x') { const r = Array.isArray(v.replies) ? v.replies : [], thread = v.kind === 'thread', n = r.length + 1;
      return [['body', thread ? 'post 1 of '+n : 'post', v.body || ''], ...r.map((t, i) => ['reply'+(i+1), thread ? 'post '+(i+2)+' of '+n : 'reply with the link', t])]; }
    if (yt && v.title) out.push(['title', 'title', v.title]);
    out.push(['body', yt ? 'description' : pl.key === 'reels' ? 'caption' : 'post', v.body || '']);
    if (v.firstComment) out.push(['comment', 'first comment', v.firstComment]);
    return out;
  }
  const fill = x => String(x || '').split(YT_PH).join(job.youtubeUrl || YT_PH);
  function partText(key) {
    const [k, part] = key.split('|'), pl = plats().find(p => p.key === k), v = pl && chosenPost(pl), x = v && parts(pl, v).find(p => p[0] === part);
    if (!x) return null; const t = fill(x[2]);
    return placeholders(t).length ? null : t.trim();  // nothing with a placeholder is ever copied
  }
  // Open X (10 November 2026): X's own compose box in a new tab with the first post filled in. Taylor presses Post there
  // himself and adds each reply under it by hand; the page never posts.
  const xOpen = pl => { const t = pl.key === 'x' && chosenPost(pl) ? partText('x|body') : null;
    return t && window.WWX ? '<a class="pb-link pb-xopen" href="'+esc(window.WWX.intent(t))+'" target="_blank" rel="noopener noreferrer">Open X with '+(chosenPost(pl).kind === 'thread' ? 'post 1' : 'this post')+' ↗</a>' : ''; };
  const copyBtns = pl => { const v = chosenPost(pl); if (!v) return '';
    return parts(pl, v).map(([part, label]) => { const key = pl.key+'|'+part, off = !partText(key);
      return '<button type="button" class="pb-go pb-cp" data-copy-part="'+esc(key)+'"'+(off ? ' disabled' : '')+M.done(key, copied === key)+'>'+M.label(copied === key, 'Copy the '+esc(PLATFORMS[pl.key] || pl.key)+' '+label, 'Copied')+'</button>'; }).join('')+xOpen(pl); };
  const hasX = () => plats().some(pl => pl.key === 'x' && pl.posts?.length);
  const ytStatus = () => { const d = ytDraft ?? job?.youtubeUrl ?? ''; return !String(d).trim() ? 'Post the YouTube video first, then paste its link here.' : !ytUrl(d) ? 'That is not a YouTube video link.' : ytUrl(d) === job?.youtubeUrl ? (hasX() ? 'Saved. The LinkedIn first comment and the X reply use it.' : 'Saved. The first comment uses it.') : 'Not saved yet.'; };
  function ytField() {
    const d = ytDraft ?? job.youtubeUrl ?? '', ok = ytUrl(d);
    return '<div class="pb-yt"><label class="pb-field" for="pb-yt"><span>Your YouTube link, for the LinkedIn first comment'+(hasX() ? ' and the X reply' : '')+'</span><input id="pb-yt" type="url" inputmode="url" spellcheck="false" maxlength="300" placeholder="https://www.youtube.com/watch?v=…" value="'+esc(d)+'"></label>'+
      '<button type="button" class="pb-link" id="pb-yt-save"'+(ok && ok !== job.youtubeUrl ? '' : ' disabled')+'>Save link</button><small id="pb-yt-st" role="status">'+esc(ytStatus())+'</small></div>';
  }
  // The pack, one block per platform (PB-A, the approved design): the thumbnails (sixteen with Thumbnail Tracker 4.0.0), then two post variations, each picked
  // with a tap. The session writes it after Approve both (PUBLISH.md, Continue from review). Picks stay open on "final".
  function pack() {
    const p = job.pack, list = plats(); if (!list.length) return '';
    const picks = job.picks || {}, off = !picksOpen();
    const opt = (key, o, dis) => '<button type="button" class="pb-opt" data-pick="'+esc(key)+'" data-val="'+esc(o.id)+'" aria-pressed="'+(picks[key] === o.id)+'"'+(off || dis ? ' disabled' : '')+'>'+(o.tag ? '<span class="pb-tag'+(/fresh|motion|new/i.test(o.tag) ? ' is-fresh' : '')+'">'+esc(o.tag)+'</span>' : '')+'<b>'+esc(o.title)+'</b>'+(o.detail ? '<small>'+esc(o.detail)+'</small>' : '')+'</button>';
    // Thumbnails (7 November 2026, Thumbnail Tracker 4.0.0): image-only tiles numbered by their contact-sheet number,
    // two columns on a phone and four above 700 px; the label, size and Full size link sit in one line under the grid
    // for the tile picked. A tile with no image URL shows its number and label, never a blank "no preview" box.
    const thumb = (k, t, i) => { const src = thumbImg(t), n = thumbNo(t, i), sel = picks[k+'.thumb'] === t.id, label = t.label || 'Thumbnail '+n;
      return '<button type="button" class="pb-opt pb-th'+(src ? '' : ' is-text')+'" data-pick="'+esc(k+'.thumb')+'" data-val="'+esc(t.id)+'" aria-pressed="'+sel+'" aria-label="Thumbnail '+n+': '+esc(label)+(t.size ? ', '+esc(t.size) : '')+'"'+(off ? ' disabled' : '')+'>'+
        '<span class="pb-th-n" aria-hidden="true">'+n+'</span>'+(src ? '<img src="'+esc(src)+'" alt="" loading="lazy">' : '<span class="pb-th-txt">'+esc(label)+'</span>')+'</button>'; };
    const thumbLine = (k, ts) => { const i = ts.findIndex(t => t.id === picks[k+'.thumb']), t = ts[i]; if (!t) return '<p class="pb-th-line pb-muted" id="pb-th-line-'+esc(k)+'">Tap a thumbnail to pick it.</p>';
      const full = thumbFull(t);
      return '<p class="pb-th-line" id="pb-th-line-'+esc(k)+'"><b>'+thumbNo(t, i)+'</b> <span>'+esc([t.label, t.tag, t.size].filter(Boolean).join(' · '))+'</span>'+(full ? ' <a class="pb-link pb-th-open" href="'+esc(full)+'" target="_blank" rel="noopener noreferrer">Full size ↗</a>' : '')+'</p>'; };
    const sheetHtml = (s, alt) => { const u = imgUrl(s); return u ? '<figure class="pb-sheet"><a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer"><img src="'+esc(u)+'" alt="'+esc(alt)+'" loading="lazy"></a><figcaption class="pb-muted">Contact sheet: each number matches a tile below. <a class="pb-link" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">Full size ↗</a></figcaption></figure>' : ''; };
    const {need, have} = pickCount();
    const head = '<div class="pb-pack-head"><h2 id="pb-pack-h">Thumbnails and posts</h2><span class="micro">'+esc(p.note || 'Pick one of each per platform')+'</span></div>'+
      '<p class="pb-muted">One thumbnail and one post for each platform. Every post passed the Performance Poster check for '+(job.buyer && BUYER[job.buyer] ? 'buyer '+esc(BUYER[job.buyer]) : 'its buyer')+(job.bookingLink ? ', with your booking link from Settings' : '')+'.</p>'+
      sheetHtml(p.thumbRound?.sheet, 'Contact sheet of every thumbnail, numbered');
    return '<section class="pb-pack" aria-labelledby="pb-pack-h">'+(['posts','final'].includes(job.status) ? trackHtml(job.status === 'final' ? 3 : 2) : '')+head+list.map(pl => {
      const k = pl.key, post = pl.posts || [], v = chosenPost(pl), shown = v || post.find(x => !unusable(x, k).length);
      // One YouTube link field on the screen: under the first platform whose pick needs it. The others say where it is.
      const needYt = v && needsYt(v), ytHere = needYt && list.find(q => { const c = chosenPost(q); return c && needsYt(c); }) === pl;
      const xn = x => { const n = xLen(fill(x)); return '<small class="pb-xn'+(n > X_MAX ? ' is-over' : '')+'">'+n+' of '+X_MAX+' characters, counted the way X counts them</small>'; };
      return '<article class="pb-blk"><div class="pb-blk-side"><span class="pb-pf pb-pf-'+esc(k)+'">'+esc(PLATFORMS[k] || pl.label || k)+'</span>'+(pl.video?.url ? '<a class="pb-vid'+(k === 'reels' ? ' is-tall' : '')+'" href="'+esc(pl.video.url)+'" target="_blank" rel="noopener noreferrer"><span>'+esc(pl.video.label || 'Watch it')+' ↗</span></a>' : '')+(pl.note ? '<small class="pb-muted">'+esc(pl.note)+'</small>' : '')+'</div><div class="pb-blk-main">'+
        (pl.questions || []).map(q => '<div class="pb-q"><span class="micro">'+esc(q.label)+'</span><div class="pb-opts">'+q.options.map(o => opt(k+'.'+q.id, o)).join('')+'</div></div>').join('')+
        (pl.thumbnails?.length ? '<div class="pb-q"><span class="micro">Thumbnail · pick 1 of '+pl.thumbnails.length+'</span>'+(imgUrl(pl.thumbRound?.sheet) !== imgUrl(p.thumbRound?.sheet) ? sheetHtml(pl.thumbRound?.sheet, PLATFORMS[k]+' contact sheet, numbered') : '')+'<div class="pb-thumbs" data-own-fallback>'+pl.thumbnails.map((t, i) => thumb(k, t, i)).join('')+'</div>'+thumbLine(k, pl.thumbnails)+'</div>' : '')+
        (post.length ? '<div class="pb-q"><span class="micro">'+esc(pl.postLabel || 'Post')+' · pick a variation</span><div class="pb-opts pb-two">'+post.map((x, i) => { const bad = unusable(x, k);
          return opt(k+'.post', {id:'v'+(i+1), tag:'Variation '+(i+1)+(k === 'x' ? (x.kind === 'thread' ? ' · thread of '+xPosts(x).length : ' · single post') : ''), title:x.title || String(x.body || '').split('\n')[0], detail:bad.length ? 'Cannot be used: '+bad.join('; ')+'.' : x.check || ''}, bad.length); }).join('')+'</div>'+
          (shown ? '<div class="pb-chosen"><span class="micro">'+(v ? 'Your pick · variation '+(post.indexOf(v)+1) : 'Variation '+(post.indexOf(shown)+1)+' · not picked yet')+'</span>'+parts(pl, shown).map(([, label, x]) => '<div class="pb-part"><b>'+esc(label[0].toUpperCase()+label.slice(1))+'</b><pre class="pb-copy">'+esc(fill(x).trim())+'</pre>'+(k === 'x' ? xn(x) : '')+'</div>').join('')+
            (v ? '<div class="pb-copies pb-cps">'+copyBtns(pl)+'</div>'+(k === 'x' ? '<p class="pb-muted pb-xnote">Open X fills in the first post for you to post yourself. Add '+(v.kind === 'thread' ? 'each later post' : 'the reply')+' under it by hand. Nothing is posted from here.</p>' : '')+
              (ytHere ? ytField() : needYt ? '<p class="pb-muted pb-ytref">'+(job.youtubeUrl ? 'Uses the YouTube link you saved.' : 'Waits for your YouTube link: save it in the field above, after the video is live.')+'</p>' : '') : '<p class="pb-muted">Pick a variation to copy it.</p>')+'</div>' : '<div class="pb-warn" role="alert">No variation here can be used: each still has a placeholder'+(k === 'x' ? ' or a post over '+X_MAX : '')+'. Ask Claude Code to write them again.</div>')+'</div>' : '')+
        '</div></article>';
    }).join('')+(job.status === 'posts'
      ? '<div class="pb-bar"><span>'+have+' of '+need+' picked</span><span class="pb-muted">Picking costs nothing: no session runs. Nothing is posted.</span><button type="button" class="pb-go" id="pb-ready"'+(have >= need && !starting ? '' : ' disabled')+'>Ready to post →</button></div>'
      : job.status === 'final' ? '<div class="pb-bar"><span>'+have+' of '+need+' picked</span><span class="pb-muted">'+(job.readyAt ? 'Marked ready '+esc(when(job.readyAt))+'. ' : '')+'Change a pick any time; the list below follows it.</span></div>'
      : '<div class="pb-bar"><span>'+have+' of '+need+' picked</span><span class="pb-muted">Picks are locked while Claude Code works.</span></div>')+'</section>';
  }
  // ---- Ready to post (outputs.js, 10 November 2026): the finished screen draws itself from this context. ----
  const outCtx = () => ({job, plats, chosenPost, chosenThumb, thumbImg, thumbFull, parts, fill, partText, ytField, reel:reelsFor(job)});
  // ---- end Ready to post context ----
  // Finished: the files and texts ready to post by hand, one row per platform once the picks are made.
  function finals() {
    if (window.WWOutputs && job.status === 'final' && plats().length) return window.WWOutputs.video(outCtx());  // Ready to post: outputs.js
    const f = job.finals || [], list = plats().filter(pl => pl.thumbnails?.length || pl.posts?.length);
    if (!f.length && !list.length) return '';
    const ready = list.length && job.status === 'final';
    // Each file says what it is (7 November 2026): a review copy is named as one, and a full-quality file (download or
    // file on the final) gets its own link. Old finals with only url and detail read as before, with the review-copy line.
    const fileLink = x => { const review = /review copy/i.test(String(x.detail || '')) || x.kind === 'review', dl = httpsUrl(x.download) || httpsUrl(x.file), u = httpsUrl(x.url);
      return '<div class="pb-rd-file"><b>'+esc(x.label || PLATFORMS[x.platform] || 'File')+'</b>'+
        (dl ? '<a class="pb-link" href="'+esc(dl)+'" target="_blank" rel="noopener noreferrer" data-full>Full-quality file'+(x.size ? ' ('+esc(x.size)+')' : '')+' ↗</a>' : '')+
        (u && u !== dl ? '<a class="pb-link" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+(review ? 'Watch the review copy' : dl ? 'Watch it' : 'Open it')+' ↗</a>' : '')+
        (review ? '<small class="pb-rd-what">'+(dl ? 'The link above is the full-quality file to upload. The review copy (720p) is on your private page.' : 'Review copy (720p) on your private page. Full-quality files come with Drive delivery.')+'</small>' : x.detail ? '<small>'+esc(x.detail)+'</small>' : '')+'</div>'; };
    const rows = ready ? '<ul class="pb-rd-list">'+list.map(pl => { const th = chosenThumb(pl), full = th && thumbFull(th), img = th && thumbImg(th), v = chosenPost(pl), files = f.filter(x => x.platform === pl.key);
        const no = th ? thumbNo(th, (pl.thumbnails || []).indexOf(th)) : 0;
        return '<li class="pb-rd"><span class="pb-pf pb-pf-'+esc(pl.key)+'">'+esc(PLATFORMS[pl.key] || pl.key)+'</span><div class="pb-rd-files">'+files.map(fileLink).join('')+
          (th ? '<div class="pb-rd-file pb-rd-thumb">'+(img ? '<img src="'+esc(img)+'" alt="Thumbnail '+no+'" loading="lazy">' : '')+'<b>Thumbnail '+no+'</b><span>'+esc([th.label, th.size].filter(Boolean).join(' · '))+'</span>'+(full ? '<a class="pb-link" href="'+esc(full)+'" target="_blank" rel="noopener noreferrer">Full size ↗</a>' : '')+'</div>' : pl.thumbnails?.length ? '<small>Pick a thumbnail below.</small>' : pl.note ? '<small class="pb-rd-what">'+esc(pl.note)+'</small>' : '')+'</div>'+
          '<div class="pb-copies pb-rd-copy">'+(v ? copyBtns(pl) : '<small>Pick a post below.</small>')+'</div></li>'; }).join('')+'</ul>'
      : f.length ? '<ul>'+f.map(x => '<li><span class="pb-pf pb-pf-'+esc(x.platform || '')+'">'+esc(PLATFORMS[x.platform] || x.platform || '')+'</span>'+fileLink(x)+'</li>').join('')+'</ul>' : '';
    return '<section class="pb-finals" aria-labelledby="pb-fin-h"><h2 id="pb-fin-h" tabindex="-1">'+(ready ? 'Ready to post' : 'Finished')+'</h2>'+(job.finalNote ? '<p class="pb-muted">'+esc(job.finalNote)+'</p>' : '')+rows+
      (window.WWPosting ? window.WWPosting.panel(job) : '')+'</section>';  // posting.js: day and time, a row per platform, Hold, Post now
  }
  // A finished job is not opened by itself, so the videos whose posts are ready stay one tap away from the intake.
  function readyJobs() {
    const list = jobs.filter(j => j.status === 'final' && j.pack?.platforms?.length).slice(0, 3);
    return list.length ? '<div class="pb-readyjobs" role="group" aria-label="Ready to post by hand"><span class="micro">Ready to post by hand</span>'+list.map(j => '<button type="button" class="pb-link" data-open-job="'+esc(j.id)+'">'+esc(j.title || j.folderName || 'Job '+j.id)+(j.readyAt ? ' · '+esc(when(j.readyAt)) : '')+'</button>').join('')+'</div>' : '';
  }
  // The lanes: the same plain text tabs with the thin dark underline, one size down. Never a sixth top-level tab.
  const laneTabs = lane => '<nav class="pb-lanes" aria-label="Publish lanes"><a href="#/publish"'+(lane === 'video' ? ' aria-current="page"'+M.attr('pb-lane', 'draw') : '')+'>Video</a><a href="#/publish/reels"'+(lane === 'reels' ? ' aria-current="page"'+M.attr('pb-lane', 'draw') : '')+'>Reels</a></nav>';
  const reelsLane = () => /^#\/publish\/reels(\/|$)/.test(location.hash);
  // A Video job's reel job, if one started from its main recording (read from reels/<id>.jobId; nothing is stored on the job).
  // Path B (decision 9 to 11): the reels made from this video's phone take say so, with the reason in one line. A job whose
  // phone take passed Check the files without a stop (file links from before 6 November 2026) offers the same start here.
  function reelsLine() {
    const r = reelsFor(job);
    if (!r) {
      // Nothing about reels is said before the files are checked: link order never decides Path A or B (7 November 2026).
      if (job && !filesChecked(job) && ['starting','running'].includes(job.status)) return '<p class="pb-meta pb-reelsline">Reels: checking the files… Claude Code works out which file is the YouTube recording and which is a phone take.</p>';
      const pc = job && window.WWReels?.choosePath ? window.WWReels.choosePath(job.sources) : null;
      if (!pc || !['A','B'].includes(pc.path) || ['check','queued','failed'].includes(job.status) || !filesChecked(job) || (pc.path === 'B' && !(job.sources || []).every(x => x.check === 'done'))) return '';
      // Confirm and continue starts the reels by itself (Path B since 6 November, Path A since 7 November 2026): until its
      // reel job arrives here, say so, and never offer a second start.
      // After ten minutes with no reel job (none was ever saved), the one start is offered below instead.
      if (job.checkedAt && job.checkedAt >= (pc.path === 'A' ? '2026-11-07' : '2026-11-06') && Date.now() - Date.parse(job.checkedAt) < 6e5 && window.WWReels?.autoFromJob) return '<p class="pb-meta pb-reelsline">'+(pc.path === 'B' ? 'Reels from your phone take' : 'Reels from this video')+': starting…</p>';
      // Path A on a job confirmed before 7 November 2026 (nothing started then): the same reel scripts, one press away.
      return '<p class="pb-meta pb-reelsline">'+esc(pc.why)+' <button type="button" class="pb-link" id="pb-reels-auto"'+(starting || !db ? ' disabled' : '')+'>'+(pc.path === 'A' ? 'Suggest reel scripts to record' : 'Make the reels from it')+'</button></p>';
    }
    const b = r.path === 'B', q = r.status === 'queued';
    return '<p class="pb-meta pb-reelsline">'+(b ? 'Reels from your phone take' : 'Reels from this video')+': '+esc(window.WWReels.label(r))+(b ? '. '+esc(window.WWReels.pathWhy(r)) : '')+(q ? ' Claude Code has not started them yet.' : '')+' · <a class="pb-link" href="#/publish/reels/'+encodeURIComponent(r.id)+'">'+(q ? 'Open the reel job to start it' : 'Open the reel job')+'</a></p>';
  }
  // ---- Every video (Taylor, 6 November 2026) ---------------------------------------------------------------------------
  // The route decides what is on screen; the Back button walks it. A job that is open is never a trap.
  function readRoute() {
    const bits = location.hash.slice(1).split('/').filter(Boolean).map(x => { try { return decodeURIComponent(x); } catch { return x; } });
    if (bits[0] !== 'publish' || bits[1] === 'reels') return;
    // #/publish and its old alias #/publish/all are the line; #/publish/new (or /new/<saved job id>) New video.
    const v = bits[1] === 'new' ? 'new' : bits[1] === 'job' && bits[2] ? 'job' : 'line';
    if (v === 'job') { if (routeJob !== bits[2] || view !== 'job') { routeJob = bits[2]; job = jobs.find(j => j.id === routeJob) || (job?.id === routeJob ? job : null); ck = null; confirm = false; changing = null; } }
    else { routeJob = null; job = null; }
    newId = v === 'new' ? bits[2] || null : null;
    // Leaving a saved job's edit clears its fields; a new video's own typing is kept while Taylor looks at the line.
    if (editId && newId !== editId) { resetIntake(); editId = null; }
    if (newId && editId !== newId) { const s = jobs.find(j => j.id === newId && j.status === 'saved'); if (s) { const l = W.linksOf(s); resetIntake(); mainUrl = l.main?.url || ''; reelUrl = l.reel?.url || ''; title = s.title || ''; brief = s.brief || ''; topicPick = s.topicId || ''; setLinks(); editId = newId; } }
    if (v !== view) { note = ''; retry = null; retryExtra = null; extNote = ''; }
    view = v;
  }
  // An in-app move: a new history entry, then draw at once (pushState fires no hashchange; Back fires one).
  function go(hash) { if (location.hash !== hash) history.pushState(null, '', hash); readRoute(); render(); }
  const ago = iso => when(iso);
  // Back to the line from a job's screen: always at the top, a real 44 px button-sized link, never a faint one.
  // newCtl: the New video control beside it ('' for none).
  const backBar = (newCtl = '<a class="pb-go pb-newvid" href="#/publish/new" id="pb-newtop">+ New video</a>') => '<nav class="pb-back" aria-label="The line"><a class="pb-backlink" href="#/publish"><span aria-hidden="true">←</span> The line</a>'+newCtl+'</nav>';
  window.WWPublishBack = backBar;
  // ---- The line (Taylor chose P2 "Production Line", 16 November 2026) -------------------------------------------------
  // Every Video job is an index card on one of five stations (publish-line.js says which). A card opens the job's own
  // screen; a card that waits on Taylor carries its ink action, and a saved card its Run.
  const posted = j => { if (j.status === 'posted') return true; if (j.status !== 'final' || !window.WWPosting?.rows) return false;
    try { const rs = window.WWPosting.rows(j).filter(x => x.on); return rs.some(x => x.state === 'posted') && rs.every(x => ['posted','skipped','off'].includes(x.state)); } catch { return false; } };  // every switched-on platform is out, or skipped (not connected, nothing to post)
  const cardOf = j => W.card(j, {posted:posted(j)});
  const jobNo = j => { const asc = [...jobs].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))); const i = asc.findIndex(x => x.id === j.id); return String(i < 0 ? asc.length + 1 : i + 1).padStart(2, '0'); };
  const scheduleOf = j => { try { return window.WWPosting?.scheduleOf?.(j) || null; } catch { return null; } };
  const postWhen = j => { const s = scheduleOf(j); return s?.day ? dayName(s.day)+' · '+(s.time || '')+' UK' : ''; };
  const postMode = () => window.WWStore?.posting?.mode === 'auto' ? 'Posting Auto' : 'Posting Manual';
  const addLabel = b => /reel/.test(b) ? 'Add the reel link' : /16:9/.test(b) ? 'Add the 16:9 link' : /both/.test(b) ? 'Add the links' : 'Fix the links';
  const ARROW = '<svg class="pb-arrow" viewBox="0 0 32 20" aria-hidden="true" focusable="false"><path d="M3 10.5c7-.6 15-.4 24-.2M21 4.5c2.4 2.2 4.4 4 6.4 5.8-2.2 1.6-4.2 3.4-6 5.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function cardHtml(j, c) {
    const id = esc(j.id), n = jobTitle(j), href = j.status === 'saved' ? '#/publish/new/'+encodeURIComponent(j.id) : '#/publish/job/'+encodeURIComponent(j.id);
    const ap = j.autopilot?.on === true && c.at < 3, l = c.at === 0 && W.declared(j) ? W.linksOf(j) : null;
    const chip = (lab, x) => '<span'+(x ? '' : ' class="is-miss"')+'>'+lab+' '+(x ? '✓' : 'missing')+'</span>';
    const st = c.kind === 'ready' ? '<span class="pb-status'+(c.hold ? ' is-warn' : '')+'">'+(c.hold ? 'On hold' : postMode())+'</span>'+(postWhen(j) ? '<span class="pb-when">'+esc(postWhen(j))+'</span>' : '')
      : c.kind === 'done' ? '<span class="pb-when">Posted'+(postWhen(j) ? ' '+esc(postWhen(j).split(' · ')[0]) : '')+'</span>'
      : '<span class="pb-status'+(c.needs ? ' is-warn' : '')+'">'+esc(c.word)+'</span>';
    const go = c.kind === 'saved' ? '<span class="pb-card-go"><button type="button" class="pb-ink" data-run-job="'+id+'" id="pb-run-'+id+'"'+(starting ? ' disabled' : '')+' aria-label="Run '+esc(n)+'">Run →</button></span>'
      : c.kind === 'miss' ? '<span class="pb-card-go"><a class="pb-plain" href="#/publish/new/'+encodeURIComponent(j.id)+'">'+esc(addLabel(c.block))+'</a><button type="button" class="pb-ink" disabled aria-describedby="pb-why-'+id+'">Run</button><small class="pb-why" id="pb-why-'+id+'">'+esc(c.block)+'</small></span>'
      : c.needs && c.btn ? '<span class="pb-card-go"><a class="pb-ink" href="'+href+'" aria-label="'+esc(c.btn)+': '+esc(n)+'">'+esc(c.btn)+'</a></span>' : '';
    return '<article class="pb-card is-'+c.kind+'" aria-labelledby="pb-card-'+id+'"><span class="pb-no">JOB '+esc(jobNo(j))+(ap ? ' · HANDS-OFF' : '')+'</span>'+
      '<h3><a class="pb-card-open" id="pb-card-'+id+'" href="'+href+'">'+esc(n)+'</a></h3>'+(l ? '<span class="pb-lk">'+chip('16:9', l.main)+chip('Reel', l.reel)+'</span>' : '')+st+go+'</article>';
  }
  function byStation() {
    const out = W.STATIONS.map(() => []);
    jobs.forEach(j => { const c = cardOf(j); out[c.at].push([j, c]); });
    const at = j => Date.parse(scheduleOf(j)?.at || '') || Infinity;
    out[3].sort((a, b) => at(a[0]) - at(b[0]));
    return out;
  }
  const viewsNav = on => '<nav class="pb-views" aria-label="Publish views"><a href="#/publish" id="pb-view-line"'+(on === 'line' ? ' aria-current="page"'+M.attr('pb-view', 'draw') : '')+'>The line <span class="pb-ct">'+jobs.length+'</span></a>'+
    '<a href="#/publish/new" id="pb-view-new"'+(on === 'new' ? ' aria-current="page"'+M.attr('pb-view', 'draw') : '')+'><span class="pb-plus" aria-hidden="true">+</span>New video</a></nav>';
  function nextPost() {
    const r = jobs.filter(j => j.status === 'final' && !j.hold?.on && !posted(j)).map(j => [j, scheduleOf(j)]).filter(([, s]) => s?.at && Date.parse(s.at) > Date.now()).sort((a, b) => Date.parse(a[1].at) - Date.parse(b[1].at))[0];
    return r ? '<span class="pb-next">Next post <b>'+esc(postWhen(r[0]))+'</b></span>' : '';
  }
  function reelsFoot() {
    const rl = window.WWReels?.all?.() || [], r = rl.find(x => x.status !== 'final' && x.status !== 'failed') || rl[0];
    return r ? '<div class="pb-foot"><span><b>Reels</b> · '+esc(r.title || 'Reel job '+r.id)+' · '+esc(window.WWReels.label(r))+'</span><a class="pb-link" href="#/publish/reels/'+encodeURIComponent(r.id)+'">Open the reel job</a></div>' : '';
  }
  function lineHtml() {
    const st = byStation();
    const col = (name, i) => { const list = i === 4 ? st[i].slice(0, 8) : st[i];
      return '<section class="pb-st'+(i === 3 ? ' is-ready' : '')+'" aria-labelledby="pb-st-'+i+'"><div class="pb-st-h"><h2 id="pb-st-'+i+'">'+name+'</h2><span class="pb-ct" aria-label="'+plural(st[i].length, 'video')+'">'+st[i].length+'</span></div>'+(i < 4 ? ARROW : '')+
        (i === 0 ? '<a class="pb-slot" href="#/publish/new"><b><span class="pb-plus" aria-hidden="true">+</span>New video</b><small>Add the 16:9 and the reel links to put a new card on the line.</small></a>' : '')+
        list.map(([j, c]) => cardHtml(j, c)).join('')+(st[i].length > list.length ? '<p class="pb-more">and '+(st[i].length - list.length)+' more</p>' : '')+'</section>'; };
    return '<div class="pb-board">'+W.STATIONS.map(col).join('')+'</div>'+reelsFoot();
  }
  // The mini line on New video: back to the line, and what stands at each station.
  function miniLine() {
    const st = byStation();
    return '<nav class="pb-mini" aria-label="The line"><a class="pb-mini-back" href="#/publish"><span aria-hidden="true">←</span> The line</a><ol>'+W.STATIONS.map((name, i) =>
      '<li'+(i === 0 ? ' class="is-on"' : '')+'><b>'+name+'</b><small>'+(i === 0 ? 'New card here' : plural(st[i].length, 'video'))+'</small><span class="pb-sq" aria-hidden="true">'+(i === 0 ? '<i class="is-new"></i>' : '')+st[i].slice(0, 8).map(() => '<i></i>').join('')+'</span></li>').join('')+'</ol></nav>';
  }
  // A saved job's own screen (#/publish/job/<id> on a saved job): its two links and Run.
  function savedHtml() {
    const b = W.runBlock(job), l = W.linksOf(job), id = esc(job.id);
    return '<section class="pb-saved" aria-labelledby="pb-saved-h"><h2 id="pb-saved-h">On the line, not run yet</h2>'+sideLinks(l.main?.url || '', l.reel?.url || '')+
      '<div class="pb-run"><button type="button" class="pb-go pb-run-go" data-run-job="'+id+'" id="pb-run-saved"'+(b || starting ? ' disabled aria-describedby="pb-saved-why"' : '')+'>Run →</button><a class="pb-ghost" href="#/publish/new/'+encodeURIComponent(job.id)+'">'+(b ? addLabel(b) : 'Edit the links')+'</a></div>'+
      (b ? '<p class="pb-muted" id="pb-saved-why"><b>'+esc(b)+'.</b></p>' : '<p class="pb-muted">Nothing has started. Run starts Claude Code with both links, as Run on New video does.</p>')+'</section>';
  }
  // The confirmed title (7 November 2026): what Taylor confirmed, never the topic's name in its place.
  const jobTitle = j => String(j?.title || '').trim() || (window.WWIdeas?.data?.topics || []).find(x => x.id === j?.topicId)?.title || j?.folderName || (j?.id ? 'Video job '+j.id : 'This video');
  const plural = (n, w) => n+' '+w+(n === 1 ? '' : 's');
  // The line under the heading follows the stage, as on the Reels lane.
  function lede() {
    const s = job?.status, st = job?.session?.step;
    const al = job && window.WWAutopilot?.lede?.(job); if (al) return al;
    if (!job || s === 'new') return 'Paste the Drive folder, or the file links, then Generate. Claude Code checks which file is which first, and your Variety Pack opens as its own page.';
    if (s === 'saved') return W.runBlock(job) ? 'Saved on the line. It needs both Drive links before it can run.' : 'Saved on the line. Nothing has started: press Run when you are ready.';
    if (s === 'check') return 'Check the files Claude Code found, confirm the title, then Confirm and continue.';
    if (s === 'found') return 'Claude Code found earlier work for this recording: use it, or start fresh.';
    if (s === 'queued') return 'Nothing has started yet: press Start now.';
    if (s === 'starting' || s === 'running') return filesChecked(job) ? 'Claude Code is making your Variety Pack. It opens as its own page when it is ready.' : 'Claude Code is checking the files first. It stops here if anything needs you.';
    if (s === 'pack') return 'Your Variety Pack is ready: make your picks on its page, then press Continue.';
    if (s === 'finishing') return st === 'finals' ? 'Claude Code is building the pilot from your picks.' : st === 'pilot' ? 'Claude Code is rendering the YouTube master and the LinkedIn cut.' : st === 'review' ? 'Claude Code is making the thumbnails and the posts.' : st === 'thumbs' ? 'Claude Code is polishing your thumbnail picks and sizing them.' : 'Claude Code is working on the next step.';
    if (s === 'pilot') return 'Watch the pilot, then approve it or say what to change.';
    if (s === 'review') return 'Watch the YouTube master and the LinkedIn cut, then approve both or say what to change.';
    if (s === 'ask') return 'Claude Code needs one answer before it writes the posts.';
    if (s === 'thumbs') return 'Pick your thumbnail from the sixteen, then press Polish my picks.';
    if (s === 'posts') return 'Pick one thumbnail and one post for each platform, then press Ready to post.';
    if (s === 'final') return 'Everything is ready to post by hand: copy each text and open each file.';
    if (s === 'failed') return 'This job stopped. Nothing was posted; what it made so far is kept.';
    return 'Drive links in, posts out.';
  }
  // Motion (motion.js). This function rewrites the whole screen on every database snapshot and on a 15 second timer, so
  // nothing here may animate because it was drawn: the content settles only when the view on screen changed (lane, list,
  // job or reel job, read from the route), the lane underline draws only when the lane changed, and a stage bar only
  // when its stage did. Everything else is drawn finished.
  let viewKey = null, laneKey = null;
  function moved() {
    const b = location.hash.slice(1).split('/').filter(Boolean), ln = b[1] === 'reels' ? 'reels' : 'video';
    const key = ln === 'reels' ? 'reels/'+(b[2] || '') : b[1] === 'new' ? 'new/'+(b[2] || '') : b[1] === 'job' && b[2] ? 'job/'+b[2] : 'line';
    if (key !== viewKey && viewKey !== null && !M.arriving(root)) { if (ln !== laneKey) M.stamp('pb-lane'); if (/^(line|new\/)/.test(key) && /^(line|new\/)/.test(viewKey) && key.slice(0, 3) !== viewKey.slice(0, 3)) M.stamp('pb-view'); M.enter(root, 'lane'); }
    viewKey = key; laneKey = ln;
  }
  function render() {
    if (root.hidden) return;
    moved();
    if (reelsLane()) { window.WWReels?.render(root); return; }
    readRoute();
    if (job) M.stages('job:'+job.id, job.stages, M.arriving(root));
    const focus = document.activeElement && root.contains(document.activeElement) ? document.activeElement.id : null;
    const noteHtml = () => note ? '<div class="pb-warn" role="status"><p>'+esc(note)+'</p>'+(retry && job ? '<p class="pb-acts"><button type="button" class="pb-link" id="pb-retry"'+(starting ? ' disabled' : '')+'>Try again</button> <button type="button" class="pb-link" data-copy-run="'+esc(retry)+'"'+M.done('run', copied === 'run')+'>'+M.label(copied === 'run', 'Copy the line', 'Copied')+'</button></p>' : '')+'</div>' : '';
    if (view === 'line' || view === 'new') {
      const nw = view === 'new', ed = nw && newId ? jobs.find(j => j.id === newId) : null;
      const head = '<div class="pb-head pb-head-line"><div><div class="micro">PUBLISH · '+(nw ? 'NEW VIDEO' : 'DRIVE LINKS IN, POSTS OUT')+'</div><h1 id="pb-heading" tabindex="-1">'+(nw ? (editId ? 'Job '+esc(jobNo(ed))+': its two links' : 'A new card for the line') : 'The publishing line')+'</h1><p>'+
        (nw ? 'Add the two Drive links. Claude Code checks the files, then builds the Variety Pack.' : 'Drive links go in on the left. Posts come out on the right.')+'</p></div>'+viewsNav(nw ? 'new' : 'line')+'</div>';
      const sub = '<div class="pb-sub">'+laneTabs('video')+(nw ? '' : nextPost())+'</div>';
      const body = nw ? (newId && !editId ? '<div class="pb-warn" role="status">'+(connecting ? 'Loading…' : ed ? 'This video has already run, so its links cannot change here. <a href="#/publish/job/'+encodeURIComponent(ed.id)+'">Open it</a>' : 'This video isn’t in the app’s database. <a href="#/publish/new">Start a new video</a>')+'</div>' : intake())
        : (!db && !connecting ? '<div class="pb-warn" role="status">Publish jobs are saved in the app’s database, which this preview does not have.</div>' : connecting ? '<p class="pb-empty" role="status">Loading…</p>' : '')+lineHtml();
      root.innerHTML = (nw ? miniLine() : '')+head+sub+noteHtml()+body;
      if (focus && document.getElementById(focus)) document.getElementById(focus).focus();
      return;
    }
    if (view === 'job' && !job) {
      root.innerHTML = '<div class="pb-head"><div><div class="micro">PUBLISH · THE LINE</div><h1 id="pb-heading" tabindex="-1">This video</h1><p>Open a video on the line to carry on where it stopped, or start a new one.</p></div></div>'+backBar()+laneTabs('video')+
        '<div class="pb-warn" role="status">'+(connecting ? 'Loading…' : db ? 'This video isn’t in the app’s database. <a href="#/publish">The line</a>' : 'Publish jobs are saved in the app’s database, which this preview does not have.')+'</div>';
      return;
    }
    const t = job && topics().concat(window.WWIdeas?.data?.topics || []).find(x => x.id === job.topicId);
    root.innerHTML = '<div class="pb-head"><div><div class="micro">PUBLISH · DRIVE LINKS IN, POSTS OUT</div><h1 id="pb-heading">'+esc(job ? jobTitle(job) : 'Publish a video')+'</h1>'+(t && norm(t.title) !== norm(jobTitle(job)) ? '<p class="pb-topicline">Topic: '+esc(t.title)+'</p>' : '')+'<p class="pb-lede">'+esc(lede())+'</p></div>'+
      '</div>'+backBar('<button type="button" class="pb-go pb-newvid" id="pb-new">+ New video</button>')+laneTabs('video')+steps()+noteHtml()+
      (job.status === 'saved' ? '<p class="pb-meta">Job '+esc(job.id)+' · saved '+esc(when(job.savedAt || job.createdAt))+'</p>'+(window.WWAutopilot?.jobHtml?.(job) || '')+savedHtml() : '<p class="pb-meta">Job '+esc(job.id)+' · '+(job.source?.kind === 'folder' ? 'Drive folder'+(job.folderName ? ' “'+esc(job.folderName)+'”' : '')+' · ' : '')+(job.source?.kind === 'folder' && !(job.sources || []).length ? 'files not listed yet' : plural((job.sources || []).length, 'file'))+' · started '+esc(when(job.createdAt))+'</p>'+reelsLine()+(window.WWAutopilot?.jobHtml?.(job) || '')+
        // Action first (7 November 2026): the decision or picks at the top, the stage list folded below them.
        (job.status === 'check' ? checkFiles() : job.status === 'found' ? foundHtml() : job.status === 'pilot' || job.status === 'review' ? stopHtml(job.status) : job.status === 'ask' ? askHtml() : job.status === 'thumbs' ? thumbsStop() : '')+stages()+
        (job.status === 'final' ? finals()+pack() : pack()+finals())+stageList());
    if (focus && document.getElementById(focus)) document.getElementById(focus).focus();
    else if (confirm) root.querySelector('#pb-continue-yes')?.focus();
    else if (changing && focus === 'pb-change') root.querySelector('#pb-change-note')?.focus();
  }
  async function save(patch) {
    if (!db || !job) return;
    const at = new Date().toISOString();
    try { await db.doc('jobs/'+job.id).update({...patch, updatedAt:at}); Object.assign(job, patch, {updatedAt:at}); note = ''; }
    catch (e) { note = 'Could not save ('+(e?.code || 'error')+'). Try again.'; render(); }
  }
  // Typing the title or brief refreshes only the checks and the topic question, so the field keeps its caret and list.
  function refreshIntake() { const c = root.querySelector('#pb-check'), q = root.querySelector('#pb-topic-q'), l = root.querySelector('#pb-side-links'); if (c) c.innerHTML = checkHtml(); if (q) q.innerHTML = topicHtml(); if (l) l.innerHTML = sideLinks(); }
  root.addEventListener('input', e => { if (e.target.id === 'pb-yt') { ytDraft = e.target.value; const s = root.querySelector('#pb-yt-save'), ok = ytUrl(ytDraft); if (s) s.disabled = !ok || ok === job?.youtubeUrl; const st = root.querySelector('#pb-yt-st'); if (st) st.textContent = ytStatus(); return; } if (e.target.id === 'pb-change-note') { changeNote = e.target.value; const s = root.querySelector('#pb-change-send'); if (s) s.disabled = !changeNote.trim() || !!starting; return; } if (e.target.id === 'pb-brief') { brief = e.target.value; return; } if (e.target.id === 'pb-title') { title = e.target.value; refreshIntake(); return; } if (e.target.id === 'pb-ck-title' && ck) { ck.touched = true; ck.titleTyped = true; ck.title = e.target.value; const c = root.querySelector('#pb-ck-check'); if (c) c.innerHTML = ckCheckHtml(); return; } if (e.target.id === 'pb-main' || e.target.id === 'pb-reel') { if (e.target.id === 'pb-main') mainUrl = e.target.value; else reelUrl = e.target.value; setLinks(); refreshIntake(); } });
  root.addEventListener('change', e => { if (e.target.id === 'pb-li-own' && job?.status === 'thumbs') { liOwn = e.target.checked; if (!liOwn && job.picks?.['thumbs.linkedin']) { job.picks = {...job.picks, 'thumbs.linkedin':job.picks['thumbs.youtube'] || null}; save({picks:job.picks}); } render(); return; }
    if (e.target.id === 'pb-buyer' && job) { buyerNow(); buyerPick = e.target.value; render(); return; } if (e.target.id === 'pb-topic') { topicPick = e.target.value; const c = root.querySelector('#pb-check'); if (c) c.innerHTML = checkHtml(); return; } if (ckChange(e)) return; const r = e.target.closest('[data-role]'); if (r) { links[+r.dataset.role].role = r.value; links[+r.dataset.role].by = 'taylor'; render(); } });
  root.addEventListener('click', async e => {
    const a = e.target.closest('a[data-ext]');
    if (a) { e.preventDefault(); let w = null; try { w = window.open(a.href, '_blank'); } catch { w = null; }
      if (w) { try { w.opener = null; } catch {} extNote = ''; } else { extNote = 'The new tab was blocked here, so the Variety Pack did not open. Press Copy the link, then paste it into a new browser tab.'; render(); root.querySelector('.pb-copyurl')?.focus(); }
      return; }
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.dataset.copyUrl) { await copy(b.dataset.copyUrl, 'url:'+b.dataset.copyUrl); return; }
    if (ckPart(b)) return;
    if (b.id === 'pb-generate') {
      if (!canGenerate()) { render(); return; }  // checked again here: a bad link can never start a paid session
      // Earlier work for this recording or topic: show it first; Generate needs a second, deliberate press.
      const sig = reuseSig();
      if (sig && reuseOk !== sig) { reuseSeen = sig; render(); root.querySelector('#pb-reuse')?.focus(); return; }
      b.disabled = true; await generate(); return;
    }
    // Save to the line: the job waits on Drive links with status "saved"; nothing starts and nothing reads it but the line.
    if (b.id === 'pb-save') { if (!canSave()) { render(); return; } b.disabled = true; await generate({status:'saved', savedAt:new Date().toISOString()}, false); return; }
    // Run on a saved card (or on its own screen): the same start as Run on New video, with both of its links, never one.
    if (b.dataset.runJob) {
      const j = jobs.find(x => x.id === b.dataset.runJob); if (!j || j.status !== 'saved' || starting) return;
      const block = W.runBlock(j), ids = new Set(W.linksOf(j) && [W.linksOf(j).main?.driveId, W.linksOf(j).reel?.driveId].filter(Boolean));
      const busyJob = jobs.find(x => x.id !== j.id && ['queued','starting','running','finishing'].includes(x.status) && (x.sources || []).some(y => ids.has(y.driveId)));
      go('#/publish/job/'+encodeURIComponent(j.id));
      if (block) { note = block+'. Nothing has started.'; render(); return; }
      if (busyJob) { note = 'This recording already has a job running (“'+jobTitle(busyJob)+'”). Nothing has started.'; render(); return; }
      b.disabled = true; await startSession(j, 'pack'); root.querySelector('#pb-heading')?.focus(); return;
    }
    if (b.id === 'pb-fresh') { if (!canGenerate()) { render(); return; } const seen = earlier().map(x => x.url || 'jobs/'+x.id); reuseOk = reuseSig(); b.disabled = true; await generate({existingSeen:seen}); return; }
    if (b.dataset.reuse !== undefined) {
      const x = earlier()[+b.dataset.reuse]; if (!x) { render(); return; }
      if (x.kind === 'job') { resetIntake(); go('#/publish/job/'+encodeURIComponent(x.id)); root.querySelector('#pb-heading')?.focus(); return; }
      // An indexed pack with no job of its own: a new job that points at it, with no session (it costs nothing).
      b.disabled = true; await generate({packUrl:x.url, status:'pack', reusedFrom:{pack:x.id, url:x.url, title:x.title, at:new Date().toISOString()}}, false); return;
    }
    if (b.id === 'pb-new') { ck = null; resetIntake(); retry = null; retryExtra = null; confirm = false; changing = null; changeNote = ''; go('#/publish/new'); root.querySelector('#pb-main')?.focus(); return; }
    if (b.dataset.tpick && job?.status === 'thumbs') { if (starting) return; job.picks = {...(job.picks || {}), ['thumbs.'+b.dataset.tpick]:b.dataset.val}; render(); await save({picks:job.picks}); return; }
    if (b.id === 'pb-polish' && job?.status === 'thumbs') { const pk = tpicks(); if (!pk.youtube || starting) return;
      const picks = {...(job.picks || {}), 'thumbs.youtube':pk.youtube, 'thumbs.linkedin':(liOwn || pk.linkedin) && pk.linkedin ? pk.linkedin : pk.youtube};
      await startSession(job, 'thumbs', {picks, thumbsPickedAt:new Date().toISOString()}); return; }
    if (b.dataset.pick) { if (!picksOpen() || window.WWPosting?.lockedPick?.(job, b.dataset.pick)) return; job.picks = {...(job.picks || {}), [b.dataset.pick]:b.dataset.val}; render(); await save({picks:job.picks}); return; }
    if (b.dataset.openJob) { ytDraft = null; go('#/publish/job/'+encodeURIComponent(b.dataset.openJob)); root.querySelector('#pb-fin-h')?.focus(); return; }
    if (b.dataset.copyPart) { const t = partText(b.dataset.copyPart); if (t) await copy(t, b.dataset.copyPart); return; }
    if (b.id === 'pb-ready' && job?.status === 'posts') { const c = pickCount(); if (c.have < c.need) return; await save({status:'final', readyAt:new Date().toISOString(), ...(window.WWPosting?.scheduleFields?.(job) || {})}); render(); root.querySelector('#pb-fin-h')?.focus(); return; }
    if (b.id === 'pb-yt-save' && job) { const u = ytUrl(ytDraft ?? ''); if (!u) return; await save({youtubeUrl:u}); ytDraft = null; render(); return; }
    if (b.id === 'pb-ask-go' && job?.status === 'ask') { if (!askReady() || starting) return; await startSession(job, 'review', {...postInputs(), ask:null}); return; }
    if (starting && /^pb-(continue|start|retry|stop|ck|approve|change-send)/.test(b.id)) return;
    // Pilot and review stops: one press saves Taylor's answer with the session it starts (nothing is saved on a refusal).
    if (['pilot','review'].includes(job?.status)) {
      const kind = job.status, round = +((kind === 'pilot' ? job.pilot : job.cuts)?.round) || 1, at = new Date().toISOString();
      if (b.id === 'pb-approve') { await startSession(job, kind, {approvals:{...(job.approvals || {}), [kind]:{decision:'approved', round, at}}, ...(kind === 'review' ? postInputs() : {})}); return; }
      if (b.id === 'pb-change') { changing = kind; render(); root.querySelector('#pb-change-note')?.focus(); return; }
      if (b.id === 'pb-change-cancel') { changing = null; render(); root.querySelector('#pb-change')?.focus(); return; }
      if (b.id === 'pb-change-send') { const n = changeNote.trim(); if (!n) return; await startSession(job, kind, {approvals:{...(job.approvals || {}), [kind]:{decision:'changes', note:n, round, at}}}); return; }
    }
    if (b.id === 'pb-ck-go') { await ckConfirm(); return; }
    if (b.id === 'pb-reels-auto' && job && !reelsFor(job)) { b.disabled = true; await window.WWReels?.autoFromJob?.(job, true); render(); return; }
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
  });
  function resetIntake() { links = []; mainUrl = ''; reelUrl = ''; title = ''; brief = ''; topicPick = ''; note = ''; reuseSeen = ''; reuseOk = ''; }
  // A new job from New video: Run (start) or Save to the line (patch.status "saved"). With a patch from "Use this pack" it
  // points at the earlier pack and starts no session. Each link is stored with its declared role twice: links {main, reel}
  // and, for every session as before, sources with role main and reel (file links, unchecked: Check the files reads each
  // file's real shape and length and stops if the two look swapped). Editing a saved job (#/publish/new/<id>) updates it.
  async function generate(patch = {}, start = true) {
    const block = start ? W.linkBlock(mainUrl, reelUrl) : saveBlock();
    if (block) { note = block+'. Nothing was saved.'; render(); return; }  // checked again here: one link never starts a job
    const at = new Date().toISOString(), topic = intakeTopic(), tt = title.trim(), a = W.driveFile(mainUrl), r = W.driveFile(reelUrl);
    const src = (p, role) => ({url:p.url, driveId:p.id, role, roleBy:'taylor', declared:role, check:'pending'});
    const fields = {topicId:topic?.id || null, title:tt, titleBy:tt ? 'taylor' : null, brief:brief.trim(), links:{...(a.id ? {main:{url:a.url, driveId:a.id}} : {}), ...(r.id ? {reel:{url:r.url, driveId:r.id}} : {})},
      source:{kind:'files'}, sources:[a, r].map((p, i) => p.id ? src(p, i ? 'reel' : 'main') : null).filter(Boolean), skills:window.WWSettings?.skills || {}, ...(window.WWAutopilot?.newJob?.() || {})};
    const old = editId ? jobs.find(j => j.id === editId && j.status === 'saved') : null;
    const id = old ? old.id : new Date().toISOString().slice(0, 10)+'-'+Math.random().toString(36).slice(2, 7);
    const doc = old ? {...old, ...fields, status:'queued', startedAt:at, updatedAt:at, ...patch}
      : {id, ...fields, status:'queued', stages:[], picks:{}, finals:[], createdAt:at, startedAt:at, updatedAt:at, ...patch};
    if (doc.status === 'saved') doc.startedAt = null;
    try {
      if (old) await db.doc('jobs/'+id).update({...fields, status:doc.status, startedAt:doc.startedAt, updatedAt:at, ...patch}); else await db.doc('jobs/'+id).set(doc);
      job = doc; jobs = [doc, ...jobs.filter(x => x.id !== id)]; resetIntake(); editId = null;
      if (doc.status === 'saved') { go('#/publish'); root.querySelector('#pb-card-'+CSS.escape(id))?.focus(); return; }
      go('#/publish/job/'+encodeURIComponent(id)); if (start) await startSession(doc, 'pack'); else root.querySelector('#pb-heading')?.focus();
    }
    catch (err) { note = 'Could not '+(patch.status === 'saved' ? 'save' : 'start')+' the job ('+(err?.code || 'error')+').'; render(); }
  }
  async function copy(text, key) { try { await navigator.clipboard.writeText(text); copied = key; M.stamp('on:'+key); } catch { note = 'Copy was blocked by the browser. Select the text and copy it instead.'; } render(); setTimeout(() => { if (copied === key) { M.stamp('off:'+key); copied = ''; } render(); }, 1800); }
  async function load() {
    try { await window.WWStore?.connect(); db = window.WWStore?.db?.() || null; } catch { db = null; }
    connecting = false;
    if (db) db.collection('jobs').onSnapshot(snap => {
      jobs = snap.docs.filter(d => d.exists).map(d => ({id:d.id, ...d.data()})).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      // Follow the job on screen; with none open, show the latest one still in progress.
      job = job ? jobs.find(j => j.id === job.id) || job : view === 'job' ? jobs.find(j => j.id === routeJob) || null : null;
      if (!canContinue()) confirm = false;
      if (changing && job?.status !== changing) { changing = null; changeNote = ''; }
      if (document.activeElement?.closest?.('#publish textarea,#publish input')) return;
      render();
    }, () => {});
    // The reel jobs (read only here): the Video lane's reels line follows the reel job's own status as it changes.
    if (db) db.collection('reels').onSnapshot(() => { if (reelsLane() || !job || document.activeElement?.closest?.('#publish textarea,#publish input,#publish select')) return; setTimeout(render, 0); }, () => {});
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
  // Shared with the Reels lane: the same Drive link rules (Phase 2) and the same lane row.
  // sessionArgs: the title, prompt and status the button for a step uses, for autopilot's hand-off (autopilot.js).
  window.WWPublish = {parseLink, laneTabs, sessionArgs:(step, j) => ({title:sessionTitle(step, j), prompt:sessionPrompt(step, j, lineFor(step, j.id)), line:lineFor(step, j.id), status:step === 'pack' ? 'starting' : 'finishing'})};
  window.WWPublish.readyText = key => partText(key);  // Ready to post: outputs.js copies exactly what this page would
  window.addEventListener('ww:data', render);
  window.addEventListener('ww:posting', () => { if (!root.hidden && !document.activeElement?.closest?.('#publish textarea,#publish input')) render(); });
  window.addEventListener('ww:settings', () => { if (!document.activeElement?.closest?.('#publish textarea,#publish input')) render(); });
  // A thumbnail image that will not load in this page shows as its numbered text tile instead (and its Full size link).
  root.addEventListener('error', e => { const i = e.target; if (i?.tagName !== 'IMG' || !i.closest('.pb-thumbs,.pb-rd,.pb-sheet')) return; const s = i.getAttribute('src'); if (badImg.has(s)) return; badImg.add(s);
    if (i.closest('.pb-sheet')) { i.closest('.pb-sheet').remove(); return; }
    const b = i.closest('.pb-th'); if (b) { b.classList.add('is-text'); const n = document.createElement('span'); n.className = 'pb-th-txt'; n.textContent = (b.getAttribute('aria-label') || '').replace(/^Thumbnail \d+: /, '').replace(/, \d+×\d+$/, ''); i.replaceWith(n); } else i.remove(); }, true);
  load();
})();
