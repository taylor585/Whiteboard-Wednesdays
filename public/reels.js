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
   from there. Nothing here is ever cut from the main recording: it is read only for its transcript and its times.
   Two paths (Taylor's decisions 9 to 11, 6 November 2026), chosen by the app from the files, never asked:
   Path A, only the main recording (in one file or in parts): the ideas-first reels above. Since 7 November 2026 Confirm
   and continue on a Video job with the main recording alone starts it by itself too, and its pack (version 2) is the
   skill's reel scripts in full: each with its length at reel pace, why it works and its B-roll plan (the silent,
   face-free screen share of each highlight's own lines, and the Katana, Blender and motion graphic shots on its words).
   Path B, the main recording AND one or more phone takes that Check the files classified as phone recordings: no
   highlight ideas. The session cuts reel options straight from the take(s) (60 s max each, hook from frame 1, silent
   face-free screen-share B-roll from the main recording, captions, Katana and Blender), Taylor keeps the ones he wants
   (each with its Add music switch), then the existing Music and Ready to post steps follow ("Continue Reels job <id>
   from options"). Confirm and continue on a Video job whose files hold a phone take creates the Path B reel job by
   itself (WWReels.autoFromJob), linked by jobId: the Video job is never written from here.
   Split screen (Taylor, 10 November 2026; Split Screen Katana's master rule 10): every reel, on either path, is split
   screen: his face from the phone take in the bottom half, Katana, Blender, story films, B-roll and web clips in the top
   half. The session checks each reel (scripts/check-split-screen.py) and writes the result: options[].split on Path B,
   splitScreen.<reelId> at the finish. This lane says so where it describes what will be made, refuses to keep an option
   that failed the check, and shows each finished reel's check at Ready to post. */
(() => {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ENV = 'env_017PLHsTGZVgThRnUnu1eoGG', REPO = 'https://github.com/taylor585/Whiteboard-Wednesdays';
  const STEPS = ['Drive link','Highlight pack','Your recordings','Music','Ready to post'];
  const BUSY = ['queued','starting','running'];
  const STATUS_WORD = {queued:'not started', starting:'starting', running:'Claude Code is making the highlight pack', found:'found earlier reel work', pack:'highlight pack ready: pick 2 winners', recording:'winners saved: record and match your takes', building:'Claude Code is building your reels', music:'reels built: choose the music', finishing:'Claude Code is finishing your reels', final:'ready to post', failed:'stopped'};
  // The three session lines, one per stop (PUBLISH.md "Reels jobs"), and the status the app sets once each session opened.
  const LINE = {pack:'Run Reels job <id>', recordings:'Continue Reels job <id> from recordings', options:'Continue Reels job <id> from options', music:'Continue Reels job <id> from music'};
  const NEXT = {pack:'starting', recordings:'building', options:'finishing', music:'finishing'};
  // Path B (decision 9): its own step names; the music and Ready to post steps are the same as Path A's.
  const STEPS_B = ['Drive link','Reel options','Pick reels','Music','Ready to post'];
  // The shorter step names a phone shows, so no word is broken inside its cell (the full name stays in the page text).
  const SHORT = {'Highlight pack':'Pack', 'Your recordings':'Record'};
  const STATUS_B = {running:'Claude Code is cutting reel options from your phone take', options:'reel options ready: pick the ones to keep'};
  let root = null, db = null, connecting = true, reels = [], jobs = [], packs = [];
  const M = window.WWMotion;   // motion.js: nothing here animates because it was redrawn, only because it changed
  // Intake: from is a Video job id or 'link'; link the pasted text; title and trim as typed.
  let from = null, linkText = '', title = '', titleTouched = false, trim = '', reuseSeen = '', reuseOk = '';
  // A reel job on screen: openId from the route; sel the selected idea; draft the picks and music ticks before Save.
  let openId = null, sel = null, draft = null, draftFor = null, refused = '', note = '', retry = false, starting = false, copied = false, changing = false;
  // Phase 8b: retryStep the line Try again restarts after a refusal; takeText the Drive links being typed; takeWarn the
  // refusals of the last Add; matchNote a refused match {winner, text}; copiedKey which Copy button just copied.
  let retryStep = null, takeText = '', takeWarn = [], matchNote = null, copiedKey = '';
  // The paste box in each winner's take slot (7 November 2026): slotText the link being typed per winner, slotWarn its refusals.
  let slotText = {}, slotWarn = {};
  // Path B: kd the keeps and music ticks on the reel options before Keep is pressed; retryExtra the answer saved with the
  // session Try again starts after a refusal (nothing is saved on a refusal).
  let kd = null, kdFor = null, retryExtra = null, keepNote = '';
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
  const reelSkills = () => { const s = S(); return {reelsEdit:s.reelsEdit || 'suby-shots-split-screen-katana', reelsCopy:s.reelsCopy || 'finishing-touches-copy-and-scripts', reelsPosts:s.reelsPosts || 'performance-poster'}; };
  const skillLine = () => Object.values(reelSkills()).map(skillName).join(', ');
  const current = () => reels.find(r => r.id === openId) || null;
  const narrow = matchMedia('(max-width: 700px)');

  // ---- Images and placeholders (7 November 2026 review) --------------------------------------------------------------
  // A tile shows a real picture only when the document has one: a still, cover, poster or image field, or a url whose path
  // ends in .jpg, .png or .webp. A page anchor (…#final-A-cover) is the review page, not an image. Otherwise the tile is a
  // designed placeholder that says where the file opens, never a blank block.
  const picUrl = u => { const h = httpsUrl(u); if (!h) return null; try { const x = new URL(h); return x.hash ? null : h; } catch { return null; } };
  const fileImg = u => { const h = picUrl(u); try { return h && /\.(jpe?g|png|webp)$/i.test(new URL(h).pathname) ? h : null; } catch { return null; } };
  const imageOf = (...xs) => { for (const x of xs) { if (!x || typeof x !== 'object') continue; for (const k of ['still','cover','poster','image']) { const h = picUrl(x[k]); if (h) return h; } const u = fileImg(x.url); if (u) return u; } return null; };
  const ph = (shape, words) => '<span class="rl-ph" data-shape="'+esc(shape)+'"><span class="rl-ph-sh" aria-hidden="true">'+esc(shape)+'</span><span class="rl-ph-t">'+esc(words)+'</span></span>';
  const OPENS = 'Opens on your review page';
  const SPLIT = 'Every reel is split screen: your face from your phone take in the bottom half, Katana, Blender, story films, B-roll and web clips in the top half.';
  // The split-screen check the session wrote ({pass, line}), in plain words; nothing when it was not written (older reels).
  const splitRest = c => String(c.line || '').replace(/^(PASS|FAIL)\s*·?\s*/, '').replace(/^(only\s+)?split screen\s*/i, '').trim();
  const splitLine = c => !c || typeof c !== 'object' ? '' : c.pass === true ? '✓ Split screen'+(/^in /.test(splitRest(c)) ? ' '+splitRest(c) : '') : c.pass === false ? 'Not split screen'+(splitRest(c) ? ' ('+splitRest(c)+')' : '') : '';
  // Title and hook that say the same thing (3 ways… / Three ways…): the hook is shown only when it adds something.
  const NUMW = {1:'one',2:'two',3:'three',4:'four',5:'five',6:'six',7:'seven',8:'eight',9:'nine',10:'ten'};
  const toks = s => norm(s).split(' ').filter(Boolean).map(w => NUMW[w] || w);
  const nearSame = (a, b) => { const x = new Set(toks(a)), y = new Set(toks(b)); if (!x.size || !y.size) return false; let n = 0; x.forEach(w => { if (y.has(w)) n++; }); return n / Math.max(x.size, y.size) >= 0.75; };
  // How long a running stage usually takes, from the real runs of 6 and 7 November 2026 (Path B options about 1 h,
  // finishing with music about 1 h 15 min; Path A scripts under 30 min). Shown as "usually …", never as a promise.
  function waitWord(r) {
    if (!r) return '';
    if (r.status === 'starting') return 'usually within two minutes';
    if (r.status === 'running') return r.path === 'B' ? 'usually about 1 h' : r.path === null && r.source?.kind === 'folder' ? '' : 'usually under 30 min';
    if (r.status === 'building') return 'usually about 1 h';
    if (r.status === 'finishing') return 'usually about 1 h 15 min';
    return '';
  }
  const waitHtml = r => { const w = waitWord(r); return w && r.status !== 'starting' ? ' <span class="rl-wait">This '+esc(w.replace(/^usually /, 'usually takes '))+'.</span>' : ''; };

  // ---- Where a reel job's recording comes from ---------------------------------------------------------------------
  // A Video job offers its main recording only (role main, a real Drive file). A phone reel recording never can.
  // Since 6 November 2026 a main may be recorded in parts (role main, part 1..n): mainParts gives them all, in part order,
  // and mainOf the first, so a job with one main reads exactly as before.
  const mainParts = j => (j.sources || []).filter(s => s.role === 'main' && s.driveId).map((s, i) => ({s, i})).sort((a, b) => (a.s.part || 0) - (b.s.part || 0) || a.i - b.i).map(x => x.s);
  const mainOf = j => mainParts(j)[0] || null;
  // ---- Which path (Taylor's decision 11): decided from the files, never asked -----------------------------------------
  // A phone take is a source Check the files classified as a phone recording and Taylor kept as a reel recording.
  // Audit 7 Nov 2026: a take counts only when the classifier accepted it or Taylor chose it on Check the files
  // (the same rule as the classifier's reels_path), never an unconfirmed "ask".
  const phoneTakes = srcs => (srcs || []).filter(s => s && s.driveId && s.role === 'reel' && s.kind === 'phone-recording' && (s.decision === 'accept' || (s.roleBy === 'taylor' && s.confirmedAt)));
  const PATH_WHY = {A:'Only the main recording is here, so Claude suggests six reel ideas for you to pick from and record.', B:n => n > 1 ? 'You added '+n+' phone recordings, so reels are cut straight from them.' : 'You added a phone recording, so reels are cut straight from it.'};
  function choosePath(srcs) {
    const mains = (srcs || []).filter(s => s && s.role === 'main' && s.driveId), takes = phoneTakes(srcs);
    if (!mains.length) return {path:null, takes, why:takes.length ? 'A phone recording alone cannot make reels: the main recording has to be in the folder too, for the screen-share B-roll.' : 'There is no main recording.'};
    return takes.length ? {path:'B', takes, why:PATH_WHY.B(takes.length)} : {path:'A', takes:[], why:PATH_WHY.A};
  }
  const isB = r => r?.path === 'B';
  // Older reel jobs (before 6 November 2026) have no path: they are Path A.
  const pathWhy = r => r?.pathWhy || (r?.path === 'B' ? PATH_WHY.B((r.takes || []).length || 1) : r?.path === null && r?.source?.kind === 'folder' ? 'Claude Code reads the folder first: with a phone recording beside the main recording, reels are cut straight from it; with the main recording alone, it suggests six reel ideas for you to record.' : PATH_WHY.A);
  const pathTag = r => r?.path === 'B' ? 'Cut from your phone take' : r?.path === null && r?.source?.kind === 'folder' ? 'Decided from the folder' : 'Ideas first';
  const pathLine = r => '<p class="rl-path" data-path="'+esc(r?.path === undefined ? 'A' : r.path ?? 'folder')+'"><span class="rl-path-tag">'+esc(pathTag(r))+'</span> <span>'+esc(pathWhy(r))+'</span></p>';
  const takeOf = t => ({driveId:t.driveId, url:t.url || null, name:t.name || null, kind:t.kind || null, decision:t.decision || null, probe:t.probe || null});
  const STEPS_OF = r => isB(r) ? STEPS_B : STEPS;
  const statusWord = r => (isB(r) && STATUS_B[r.status]) || (isB(r) && r.status === 'finishing' && r.session?.step === 'options' ? 'Claude Code is finishing the reels you kept' : '') || STATUS_WORD[r?.status] || r?.status || '';
  const videoJobs = () => jobs.filter(j => mainOf(j) && !(j.status === 'failed' && !j.packUrl && !j.pack)).slice(0, 6);
  const reelTake = id => id && jobs.some(j => (j.reelTakes || []).includes(id) || (j.sources || []).some(s => s.driveId === id && s.role === 'reel'));
  // Until Taylor chooses, the newest Video job with a main recording is offered first (or the link box when there is none).
  const fromNow = () => from ?? (videoJobs()[0]?.id || 'link');
  function source() {
    const from = fromNow();
    if (from !== 'link') { const j = jobs.find(x => x.id === from), m = j && mainOf(j), ps = j ? mainParts(j) : [];
      const pc = choosePath(j?.sources);
      return m ? {kind:'job', jobId:j.id, driveId:m.driveId, url:m.url || null, fromJob:true, ...(ps.length > 1 ? {driveIds:ps.map(x => x.driveId), urls:ps.map(x => x.url || null), seconds:partsSeconds(ps)} : {}), path:pc.path, why:pc.why, takes:pc.takes} : null; }
    const parts = linkText.split(/[\s,]+/).filter(Boolean); if (parts.length !== 1) return parts.length ? {kind:'many', n:parts.length} : null;
    const p = parse(parts[0]);
    // A file link is the main recording alone (Path A); a folder is listed by the session, which decides the path from it.
    return p.kind === 'file' ? {kind:'file', driveId:p.id, url:parts[0], fromJob:false, path:'A', why:PATH_WHY.A, takes:[]} : p.kind === 'folder' && p.folderId ? {kind:'folder', folderId:p.folderId, url:parts[0], fromJob:false, path:null, takes:[]} : {kind:'bad', why:p.kind, url:parts[0]};
  }
  const partsSeconds = ps => ps.every(x => Number.isFinite(+x.probe?.seconds) && x.probe.seconds > 0) ? Math.round(ps.reduce((a, x) => a + x.probe.seconds, 0) * 10) / 10 : null;
  const clockS = sec => { sec = Math.round(+sec || 0); return sec >= 3600 ? Math.floor(sec/3600)+':'+String(Math.floor(sec%3600/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0') : Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'); };
  const partsWord = s => s.driveIds?.length > 1 ? s.driveIds.length+' parts, joined in order'+(s.seconds ? ' · '+clockS(s.seconds)+' in all' : '') : 'Drive file …'+String(s.driveId).slice(-6);
  const srcLabel = s => !s ? '' : s.kind === 'job' ? 'The main recording of “'+(jobs.find(j => j.id === s.jobId)?.title || 'your video')+'” · '+partsWord(s) : s.kind === 'file' ? 'Drive file …'+String(s.driveId).slice(-6) : s.kind === 'folder' ? 'Drive folder …'+String(s.folderId).slice(-6)+' · Claude takes the one main recording in it' : '';
  const trimVal = () => { const t = String(trim).trim(); if (!t) return null; const n = Number(t); return Number.isFinite(n) && n >= 0 && n <= 600 ? Math.round(n * 10) / 10 : NaN; };
  const sameSource = (r, s) => s && r.source && ((s.driveId && (r.source.driveIds || [r.source.driveId]).some(d => (s.driveIds || [s.driveId]).includes(d))) || (s.folderId && r.source.folderId === s.folderId) || (s.jobId && r.jobId === s.jobId));
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
    const why = (driveIds, folderId, topicId, jobId) => s.driveId && (driveIds || []).some(d => (s.driveIds || [s.driveId]).includes(d)) ? 'Same Drive file' : s.folderId && folderId === s.folderId ? 'Same Drive folder' : s.jobId && jobId === s.jobId ? 'Same video' : tid && topicId === tid ? 'Same topic' : '';
    reels.forEach(r => { if (r.status === 'failed' && !r.pack) return;
      const w = why(r.source?.driveIds || [r.source?.driveId], r.source?.folderId, r.topicId, r.jobId); if (w) out.push({kind:'reel', id:r.id, why:w, title:r.title || 'Reel job '+r.id, detail:STATUS_WORD[r.status] || r.status, at:r.createdAt}); });
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
      (s && !['many','bad'].includes(s.kind) && !ps.length ? pathLine({path:s.path, pathWhy:s.path === 'B' ? s.why : null, takes:s.takes, source:{kind:s.kind}}) : '')+
      (shown ? reuseHtml(found) : '<button type="button" class="pb-go" id="rl-generate"'+(canGenerate() ? '' : ' disabled')+'>'+(s?.path === 'B' ? 'Generate reel options' : 'Generate Reel highlight pack')+'</button>')+
      '<p class="pb-muted">'+(db ? (s?.path === 'B' ? 'Claude Code checks your phone take, finds its best sections (60 seconds or less each, the hook from the first frame), adds silent screen-share B-roll from the main recording with no face in it, captions, Katana and Blender, then stops for you to keep the reels you want. Nothing short is cut from the YouTube video itself. '+SPLIT+' Uses '+esc(skillLine())+' from Settings.' : 'Claude Code reads the recording for its words and times only: nothing is cut from it. It writes six reel ideas here, then stops for you to pick two. '+SPLIT+' Uses '+esc(skillLine())+' from Settings.') : connecting ? 'Connecting…' : 'Reel jobs are saved in the app’s database, which this preview doesn’t have.')+'</p>';
  }
  function intake() {
    const vj = videoJobs();
    const from = fromNow();
    if (!titleTouched && from !== 'link') { const j = jobs.find(x => x.id === from), t = j && allTopics().find(x => x.id === j.topicId); title = t?.title || j?.title || ''; }
    const opts = vj.map(j => '<label class="rl-choice"><input type="radio" name="rl-from" value="'+esc(j.id)+'"'+(from === j.id ? ' checked' : '')+'><span><b>'+esc(j.title || j.folderName || 'Video job '+j.id)+'</b><small>Use this video’s main recording'+(mainParts(j).length > 1 ? ' ('+mainParts(j).length+' parts, in order)' : '')+' · '+esc(when(j.createdAt))+'</small></span></label>').join('');
    const list = reels.slice(0, 5);
    return '<section class="pb-intake rl-intake" aria-labelledby="rl-in-h"><div><h2 id="rl-in-h">Where the reels come from</h2>'+
      '<p class="pb-muted">The main recording of the video (landscape). Claude reads its words and times to find the highlights; your reels are recorded fresh on your phone after you pick.</p>'+
      '<fieldset class="rl-start"><legend>Start from</legend>'+(vj.length ? opts : '<p class="pb-muted">No Video job with a main recording yet.</p>')+
      '<label class="rl-choice"><input type="radio" name="rl-from" value="link"'+(from === 'link' ? ' checked' : '')+'><span><b>Paste a Drive link</b><small>The main recording’s file link, or the folder it is in</small></span></label></fieldset>'+
      (from === 'link' ? '<label class="pb-field" for="rl-link"><span>Drive link</span><input id="rl-link" type="url" inputmode="url" spellcheck="false" autocomplete="off" maxlength="500" placeholder="https://drive.google.com/file/d/…" value="'+esc(linkText)+'"></label>' : '')+
      '<label class="pb-field" for="rl-title"><span>The video’s title, word for word <i class="pb-opt-note">The title decides what the highlights teach</i></span><input id="rl-title" list="rl-topic-list" maxlength="200" autocomplete="off" value="'+esc(title)+'"><datalist id="rl-topic-list">'+topics().map(t => '<option value="'+esc(t.title)+'">').join('')+'</datalist></label>'+
      '<label class="pb-field rl-trim" for="rl-trim"><span>YouTube trim in seconds (optional) <i class="pb-opt-note">If the YouTube video starts later than the recording, times are shown as the YouTube video’s own</i></span><input id="rl-trim" inputmode="decimal" maxlength="6" autocomplete="off" placeholder="0" value="'+esc(trim)+'"></label></div>'+
      '<div><h2>Check before it runs</h2><div id="rl-check">'+checkHtml()+'</div>'+
      (list.length ? '<div class="rl-jobs" role="group" aria-label="Your reel jobs"><span class="micro">Your reel jobs</span>'+list.map(r => '<a class="pb-link" href="#/publish/reels/'+encodeURIComponent(r.id)+'">'+esc(r.title || 'Reel job '+r.id)+' · '+esc(statusWord(r))+'</a>').join('')+'</div>' : '')+'</div></section>';
  }

  // ---- Steps, head and the session ---------------------------------------------------------------------------------
  // The step follows the job's own status; a failed job stays on the step its last session was working on.
  const STEP_OF = {new:0, queued:1, starting:1, running:1, found:1, pack:1, recording:2, building:2, music:3, finishing:4, final:4};
  const stepOfSession = r => ({pack:1, recordings:2, music:3})[r?.session?.step] ?? 1;
  // Path B: building options (1), pick reels (2, and 2 again while the kept reels are finished), music (3), ready (4).
  const STEP_OF_B = {new:0, queued:1, starting:1, running:1, found:1, options:2, music:3, final:4};
  const stepOfB = r => r.status === 'failed' ? ({pack:1, options:2, music:3})[r.session?.step] ?? 1 : r.status === 'finishing' ? (r.session?.step === 'options' ? 2 : 4) : STEP_OF_B[r.status] ?? 1;
  function steps(r) {
    const s = r?.status || 'new', failed = s === 'failed', b = isB(r), at = b ? stepOfB(r) : failed ? stepOfSession(r) : STEP_OF[s] ?? 1, done = s === 'final';
    const noMusic = r && (b ? r.keepSavedAt && at >= 2 && !Object.values(r.keep || {}).some(k => k?.music) : r.winnersSavedAt && at >= 2 && !winnersOf(r).some(w => w.music));
    const small = i => i === at && failed ? 'stopped' : i === at && s === 'building' ? 'building' : i === at && s === 'finishing' ? 'finishing' : i === at && b && ['queued','starting','running'].includes(s) ? 'building' : i === 3 && noMusic ? 'none chosen' : '';
    // Ready to post is the current step once the reels are final, highlighted like every other current step.
    return '<ol class="pb-steps rl-steps" aria-label="Reel steps">'+STEPS_OF(r).map((n, i) => '<li class="'+(i < at ? 'is-done' : i === at ? (failed ? 'is-failed' : 'is-on') : '')+'"'+(i === at ? ' aria-current="step"' : '')+'><b>'+(i+1)+'</b><span class="rl-st"'+(SHORT[n] ? ' data-short="'+SHORT[n]+'"' : '')+'>'+n+'</span>'+(small(i) ? ' <small>'+small(i)+'</small>' : '')+'</li>').join('')+'</ol>';
  }
  const lineFor = (id, step = 'pack') => LINE[step].replace('<id>', id);
  // The step a Start, Try again or Copy belongs to: the one the job's last session was on, or the pack for a new job.
  const stepFor = r => retryStep || (['queued','starting','running','found'].includes(r.status) ? 'pack' : r.status === 'options' ? 'options' : r.session?.step || 'pack');
  const RULES = 'use the skills named on the reels document, write every stage back to reels/<id> in the Whiteboard Wednesdays app artifact';
  function prompt(r, step) {
    const rules = RULES.replace('<id>', r.id);
    if (step === 'recordings') return lineFor(r.id, step)+'. Follow PUBLISH.md "Reels jobs" in this repository exactly: '+rules+', check every phone take (upright, with sound, youtube_guard check-media and check-words) before anything is cut, never cut anything from the YouTube recording except the skill\'s own silent, face-free screen share, never use an AI voice, stop on "music" when a winner has music, and never post anything: only a posting session posts (POSTING.md), never this one.';
    if (step === 'music') return lineFor(r.id, step)+'. Follow PUBLISH.md "Reels jobs" in this repository exactly: '+rules+', use only the tracks Taylor picked from his Drive music folder (no music where he chose none), never use an AI voice, and never post anything: only a posting session posts (POSTING.md), never this one.';
    if (step === 'options') return lineFor(r.id, step)+'. Follow PUBLISH.md "Reels jobs", "Path B", in this repository exactly: '+rules+', restore the saved work set, finish only the reel options Taylor kept (keep), stop on "music" when a kept reel has music, never use an AI voice, and never post anything: only a posting session posts (POSTING.md), never this one.';
    if (isB(r)) return lineFor(r.id)+'. Follow PUBLISH.md "Reels jobs", "Path B", in this repository exactly: this job has the main recording and a phone take, so make no highlight ideas: '+rules+', check every phone take (upright, with sound, youtube_guard check-media and check-words) before anything is cut, cut reel options straight from the take (60 s or less each, the hook from frame 1), use nothing from the YouTube recording except silent, face-free screen-share B-roll, never use an AI voice, stop on "options" for Taylor to keep the ones he wants, and never post anything: only a posting session posts (POSTING.md), never this one.';
    if (r.path === null && r.source?.kind === 'folder') return lineFor(r.id)+'. Follow PUBLISH.md "Reels jobs" in this repository exactly: '+rules+', decide the path from what the folder holds (Path B when a phone recording is beside the main recording, Path A otherwise) and write it, never cut anything from the YouTube recording except the Path B screen share, stop on "pack" (Path A) or "options" (Path B), and never post anything: only a posting session posts (POSTING.md), never this one.';
    return lineFor(r.id)+'. Follow PUBLISH.md "Reels jobs", "Run Reels job", in this repository exactly: this job has only the main recording, so write the reel scripts for Taylor to record on his phone in the skill\'s Reel highlight pack format (pack version 2: six scripts on the title word for word, each a hook from frame 1, three highlights with the value given to the end user and their source lines, a close, 60 s or less at reel pace, why it works and its B-roll plan), checked by reels.py highlights; use the skills named on the reels document, read the recording only for its words and times (never cut anything from it), write every stage back to reels/'+r.id+' in the Whiteboard Wednesdays app artifact, stop on "pack" for Taylor to pick two winners, never use an AI voice, and never post anything: only a posting session posts (POSTING.md), never this one.';
  }
  async function save(r, patch, quiet = false) {
    if (!db || !r) return false;
    const at = new Date().toISOString();
    try { await db.doc('reels/'+r.id).update({...patch, updatedAt:at}); Object.assign(r, patch, {updatedAt:at}); if (!quiet) note = ''; return true; }
    catch (e) { if (!quiet) { note = 'Could not save ('+(e?.code || 'error')+'). Try again.'; render(); } return false; }
  }
  // The status moves on only after the session has opened; a refusal leaves the job where it was, with Try again.
  // Taylor's answers (takes, music) are already saved on the document, so the line also works when sent in a chat.
  // extra is Taylor's answer saved together with the session it starts (Path B's keeps), so a refusal saves nothing.
  // quiet: started from the Video lane (decision 10), which shows the reel job's state in its own line; a refusal there
  // leaves the reel job on "queued" with Start now on the Reels lane and changes nothing on screen here.
  async function startSession(r, step = 'pack', {extra = null, quiet = false} = {}) {
    const requestedAt = new Date().toISOString(); starting = true; if (!quiet) { retry = false; note = ''; } render();
    try {
      const mcp = await window.claude?.use?.('mcp'); if (!mcp) throw {code:'unavailable'};
      const res = await (window.WWStore?.createSession || ((m, a) => m.callTool('Claude Code Remote', 'create_session', a)))(mcp, {model:'claude-opus-5-5', permission_mode:'auto', environment_id:ENV, source_url:REPO, title:(step === 'options' ? 'Reels finish: ' : 'Reels: ')+(r.title || r.id), prompt:prompt(r, step)+(window.WWAutopilot?.promptLine?.(r) || '')});
      const p = res?.payload || {}, sid = p.ccr?.id || p.session_id || p.id || p.session?.id || null;
      starting = false; if (!quiet) { retryStep = null; retryExtra = null; }
      await save(r, {status:NEXT[step], session:{id:sid, url:sid ? 'https://claude.ai/code/'+sid : null, step, requestedAt, startedAt:new Date().toISOString()}, ...(extra || {}), ...(r.status === 'failed' ? {error:null, failedStage:null} : {}), ...(window.WWAutopilot?.answered?.(r) || {})}, quiet);
      if (extra) kdFor = null;
      render(); return true;
    } catch (e) {
      starting = false;
      if (quiet) { render(); return false; }
      const why = e?.code === 'not_granted' ? 'You did not allow the Claude Code connection, so it could not start by itself.' : e?.code === 'unavailable' ? 'The Claude Code connection is not available in this view.' : 'Claude Code could not be started ('+(e?.code || e?.message || 'error')+').';
      retry = true; retryStep = step; retryExtra = extra; note = why+' Nothing has started'+(extra ? ' and your choice is not saved yet' : '')+'. Press Try again, or send “'+lineFor(r.id, step)+'” in a Claude chat.'; render(); return false;
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
    const head = r.status === 'failed' ? '<div class="pb-warn pb-failed" role="alert"><p><b>This reel job stopped'+(failedStage(r) ? ' at “'+esc(failedStage(r))+'”' : '')+'.</b> '+esc(r.error || 'Claude Code did not say why.')+'</p><p>'+(isB(r) ? (r.session?.step === 'options' ? 'Nothing was posted. The reels you kept and their music switches are kept.' : r.session?.step === 'music' ? 'Nothing was posted. Your kept reels and music picks are kept.' : r.options ? 'Nothing was posted. Your reel options are kept.' : 'Nothing was posted, and nothing was cut from the YouTube recording.') : later ? 'Nothing was posted. Your winners'+(r.session.step === 'music' ? ', takes and music picks are' : ' and takes are')+' kept.' : 'Nothing was recorded, built or posted.')+ses+'</p><p class="pb-acts"><button type="button" class="pb-link" id="rl-retry"'+off+'>Try again</button></p></div>'
      : stuck ? '<div class="pb-warn pb-stuck" role="alert"><p><b>Claude Code has not reported back</b> for '+(stuck >= 120 ? Math.floor(stuck/60)+' h '+(stuck%60)+' min' : stuck+' minutes')+'. It may have stopped.</p><p class="pb-acts">'+ses+' <button type="button" class="pb-link" id="rl-retry"'+off+'>Try again</button> <button type="button" class="pb-link" id="rl-stop">Stop this job</button></p></div>'
      : r.status === 'queued' ? '<p class="pb-queue"><b>Not started yet.</b> <button type="button" class="pb-link" id="rl-start"'+off+'>Start now</button> or say this in a Claude chat: <code>'+esc(lineFor(r.id))+'</code> <button type="button" class="pb-link" id="rl-copy"'+M.done('rl-line', copied)+'>'+M.label(copied, 'Copy', 'Copied')+'</button></p>'
      : r.status === 'starting' ? '<p class="pb-queue"><b>Starting Claude Code.</b> A session is opening in the cloud with your skills; the steps appear here as it works, usually within two minutes.'+ses+'</p>'
      : r.status === 'running' ? (isB(r) ? '<p class="pb-meta rl-working"><b>Claude Code is cutting reel options from your phone take.</b> It checks the take first (upright, with sound, not from the YouTube video), then finds its best sections, adds the screen-share B-roll, captions, Katana and Blender.'+waitHtml(r)+' You can close this tab.'+ses+'</p>'
        : r.path === null && r.source?.kind === 'folder' ? '<p class="pb-meta">Claude Code is reading the folder: what it holds decides the path. You can close this tab.'+ses+'</p>' : '<p class="pb-meta rl-working"><b>Claude Code is writing your reel scripts.</b>'+waitHtml(r)+' You can close this tab.'+ses+'</p>')
      : r.status === 'finishing' && r.session?.step === 'options' ? '<p class="pb-meta rl-working"><b>Claude Code is finishing the reels you kept.</b> '+(Object.values(r.keep || {}).some(k => k?.music) ? 'It lists your music folder for the reels with music and stops for you to choose; the others get' : 'Each gets')+' the cover, the 4:5 post and the caption.'+waitHtml(r)+' You can close this tab.'+ses+'</p>'
      : r.status === 'building' ? '<p class="pb-meta rl-working"><b>Claude Code is building your reels.</b> It checks each take first, then cuts, adds the B-roll and the sound.'+waitHtml(r)+' You can close this tab.'+ses+'</p>'
      : r.status === 'finishing' ? '<p class="pb-meta rl-working"><b>Claude Code is finishing your reels:</b> the music you chose, the cover, the 4:5 post and the caption.'+waitHtml(r)+' You can close this tab.'+ses+'</p>' : '';
    const empty = (['building','finishing'].includes(r.status) || (isB(r) && r.status === 'running')) && !list.length ? '<p class="pb-empty">No stage reported yet. Each one appears here when Claude Code starts it.</p>' : '';
    return '<section class="pb-stages" aria-label="Progress">'+head+empty+(list.length ? '<ol>'+list.map(s => '<li class="is-'+esc(/^fail/.test(s.state || '') ? 'failed' : s.state || 'wait')+'"'+M.stage('reel:'+r.id, s)+'><b>'+esc(s.name)+'</b><small>'+esc(s.detail || '')+'</small><time>'+(s.state === 'done' ? elapsed(s.startedAt, s.endedAt) : s.state === 'run' ? 'running '+elapsed(s.startedAt) : '')+'</time></li>').join('')+'</ol>' : '')+'</section>';
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
  // The skill's own limits hold on every pack: 60 s or less spoken at reel pace (160 words a minute, reels.py highlights).
  // A version 2 pack (7 November 2026, Path A reel scripts) also carries why each script works and its B-roll plan: every
  // highlight's B-roll is the silent, face-free screen share of its own lines (master rule 4's one exception), and at
  // least one Katana shot on the script's words (master rule 8). Older packs (no version) show as they always did.
  const maxS = r => +r.pack?.maxSeconds > 0 ? Math.min(60, +r.pack.maxSeconds) : 60;
  const wpm = r => +r.pack?.wpm > 0 ? +r.pack.wpm : 160;
  const scriptOf = i => [i.hook, ...(i.highlights || []).map(h => h.say), i.close].map(x => String(x || '').trim()).filter(Boolean);
  const wordsOf = i => scriptOf(i).reduce((a, x) => a + x.split(/\s+/).filter(Boolean).length, 0);
  const secsOf = (r, i) => Math.round(wordsOf(i) / (wpm(r) / 60));
  const isV2 = r => +r.pack?.version >= 2;
  const shotsOf = (i, k) => (Array.isArray(i[k]) ? i[k] : []).filter(x => x && typeof x === 'object');
  const brollOk = b => b && b.silent === true && b.face === false && String(b.what || '').trim();
  function packOk(r) {
    const p = r.pack || {}, ideas = ideasOf(r), n = +p.ideaCount || 6, per = +p.highlightsPer || 3, v2 = isV2(r), max = maxS(r);
    return ideas.length === n && ideas.every(i => i && i.id && i.hook && i.close && Array.isArray(i.highlights) && i.highlights.length === per &&
      i.highlights.every(h => String(h.value || '').trim() && String(h.say || '').trim() && Number.isFinite(+h.t0) && Number.isFinite(+h.t1) && +h.t1 > +h.t0 && (!v2 || brollOk(h.broll))) &&
      wordsOf(i) <= max * wpm(r) / 60 && !(+i.seconds > max) &&
      (!v2 || (String(i.why || '').trim() && shotsOf(i, 'katana').length > 0 && shotsOf(i, 'katana').every(k => String(k.words || '').trim() && String(k.concept || '').trim()) &&
        shotsOf(i, 'blender').every(k => String(k.concept || '').trim())))) && new Set(ideas.map(i => i.id)).size === ideas.length;
  }
  // The words to say, one block per part, as the skill's approved pack writes a winning script (§0B).
  const sayText = (r, i, label) => [label+' · about '+secsOf(r, i)+' s at reel pace (60 s maximum)', '', i.hook, '', ...i.highlights.map((h, n) => (n+1)+'. '+h.say+'\n   Value given to the end user: '+h.value), '', i.close].join('\n');
  const KATANA = {'word-punch':'word punch', 'stretch-morph':'stretch and morph', 'interface-story':'interface story', 'fly-through':'3D fly-through', 'camera-language':'camera language'};
  // The B-roll plan of one script: per highlight, the silent screen share of its own lines; then the shots on its words.
  function planHtml(r, i) {
    const k = shotsOf(i, 'katana'), bl = shotsOf(i, 'blender'), g = shotsOf(i, 'graphics');
    const shots = [...k.map(x => '<li><b>Katana</b> '+esc(KATANA[x.concept] || x.concept || '')+' on “'+esc(x.words || '')+'”</li>'),
      ...bl.map(x => '<li><b>Blender</b> '+esc(x.concept || '')+(x.on ? ' on “'+esc(x.on)+'”' : '')+'</li>'),
      ...g.map(x => '<li><b>Motion graphic</b> '+esc(x.kind || '')+(x.on ? ': '+esc(x.on) : '')+'</li>')];
    const per = i.highlights.map((h, n) => brollOk(h.broll) ? '<li><b>Highlight '+(n+1)+'</b> screen share of '+esc(span(r, h))+', silent, no face: '+esc(h.broll.what)+'</li>' : '').join('');
    return per || shots.length ? '<div class="rl-sec rl-plan"><h4>B-roll plan <span>cut after you record, from your take and the main recording’s silent screen share</span></h4><ul class="rl-plan-l">'+per+shots.join('')+'</ul></div>' : '';
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
  // The chart's length is the file's real length (recordingSeconds, written by the session from its probe; else the
  // Video job's main recording probe or the joined parts), less the YouTube trim when the times are the video's own.
  // pack.durationS (the transcript's last word) is used only when nothing better is known.
  const fileSecs = r => { const v = +r.recordingSeconds; if (v > 0) return v; if (+r.source?.seconds > 0) return +r.source.seconds;
    const j = jobs.find(x => x.id === r.jobId), ps = j ? mainParts(j) : []; const t = ps.length ? partsSeconds(ps) : null; return t > 0 ? t : 0; };
  const dur = r => { const f = fileSecs(r), off = timesWord(r) === 'video' && +r.offsetS > 0 ? +r.offsetS : 0; if (f > 0) return Math.max(1, f - off); const d = +r.pack?.durationS; if (d > 0) return d; return Math.max(60, ...ideasOf(r).flatMap(i => i.highlights.map(h => +h.t1 || 0))) * 1.02; };
  const pct = (r, t) => (Math.min(Math.max(+t || 0, 0), dur(r)) / dur(r) * 100).toFixed(3)+'%';
  const span = (r, h) => (h.yt0 && h.yt1 ? h.yt0+'–'+h.yt1 : clock(h.t0)+'–'+clock(h.t1));
  const timesWord = r => r.pack?.timesIn === 'youtube' || Number.isFinite(+r.offsetS) && +r.offsetS > 0 ? 'video' : 'recording';
  function mapHtml(r) {
    const ideas = ideasOf(r), d = dur(r), picked = new Set(draft.picked);
    const lanes = ideas.map((i, n) => '<span class="rl-lab'+(i.id === sel ? ' is-on' : '')+'">R'+(n+1)+'</span><div class="rl-track">'+i.highlights.map(h =>
      '<button type="button" class="rl-seg'+(i.id === sel ? ' is-sel' : picked.has(i.id) ? ' is-win' : '')+'" data-rl-sel="'+esc(i.id)+'" style="left:'+pct(r, h.t0)+';width:'+(Math.max(0, Math.min(+h.t1, d) - Math.max(+h.t0, 0)) / d * 100).toFixed(3)+'%" aria-label="Reel '+(n+1)+' · '+esc(i.name || '')+' · '+esc(h.head || '')+' · '+esc(span(r, h))+'" title="Reel '+(n+1)+' · '+esc(h.head || '')+' · '+esc(span(r, h))+'"></button>').join('')+'</div>').join('');
    // Ticks far enough apart to read: every 5 or 10 minutes on a wide screen, 10 or 20 on a phone; none in the last 6 %.
    const ticks = [], mins = d / 60, step = narrow.matches ? (mins > 45 ? 20 : mins > 12 ? 10 : 5) : (mins > 40 ? 10 : 5);
    for (let m = 0; m * 60 <= d * 0.94 || m === 0; m += step) ticks.push('<span style="left:'+pct(r, m*60)+'">'+m+':00</span>');
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
      '<p class="rl-len"><span>About '+esc(secsOf(r, i))+' s</span> at reel pace · '+esc(wordsOf(i))+' words · 60 s maximum · hook from the first frame</p>'+
      (String(i.why || '').trim() ? '<p class="rl-why"><b>Why it works</b> '+esc(i.why)+'</p>' : '')+
      '<div class="rl-sec"><h4>Hook <span>the title, said as a contrast, on screen from frame 1</span></h4><p class="rl-hook">'+esc(i.hook)+'</p></div>'+
      '<div class="rl-sec"><h4>Three highlights <span>the proof, each one leading into the next</span></h4><ol class="rl-hls">'+i.highlights.map(h => { const ls = lineList(h), still = httpsUrl(h.still);
        return '<li class="rl-hl">'+(h.head ? '<h5>'+esc(h.head)+'</h5>' : '')+'<p class="rl-say">'+esc(h.say)+'</p><p class="rl-value"><b>Value given to the end user:</b> '+esc(h.value)+'</p>'+
          '<div class="rl-from'+(still ? '' : ' no-still')+'"><details'+(phone.matches ? '' : ' open')+'><summary>From the '+timesWord(r)+' <span>'+esc(span(r, h))+'</span></summary>'+(ls.length ? '<ol class="rl-tr">'+ls.map(l => '<li><span class="rl-tc">'+esc(l.t || '')+'</span><span>'+esc(l.text)+'</span></li>').join('')+'</ol>' : '<p class="pb-muted">Claude Code did not write the lines for this section.</p>')+'</details>'+
          (still ? '<figure class="rl-still"><img src="'+esc(still)+'" alt="The screen at '+esc(span(r, h).split('–')[0])+', face-free" loading="lazy"><figcaption>Screen at '+esc(span(r, h).split('–')[0])+'</figcaption></figure>' : '')+'</div></li>'; }).join('')+'</ol></div>'+
      '<div class="rl-sec"><h4>Close <span>back to the title</span></h4><p class="rl-close">'+esc(i.close)+'</p></div>'+
      planHtml(r, i)+
      '<p class="pb-acts rl-say-copy"><button type="button" class="pb-link" id="rl-ps-'+esc(i.id)+'" data-rl-pscript="'+esc(i.id)+'"'+M.done('pscript:'+i.id, copiedKey === 'pscript:'+i.id)+'>'+M.label(copiedKey === 'pscript:'+i.id, 'Copy the words to say', 'Copied')+'</button></p>'+
      musicHtml(r, i)+
      '<button type="button" class="rl-pick" data-rl-pick="'+esc(i.id)+'" aria-pressed="'+on+'"'+(on ? M.attr('on:pick:'+i.id, 'fill') : '')+(off ? ' disabled' : full ? ' aria-disabled="true"' : '')+'>'+(on ? 'Winner ✓' : 'Pick as a winner')+'</button>'+
      (refused === i.id ? '<p class="rl-note" role="alert">You’ve picked '+toPick(r)+'. Unpick one first.</p>' : full && !off ? '<p class="rl-note">You’ve picked '+toPick(r)+'. Unpick one first.</p>' : '');
  }
  function packHtml(r) {
    ensureDraft(r);
    if (!packOk(r)) return '<div class="pb-warn rl-badpack" role="alert"><p><b>This pack didn’t pass the checker.</b> It needs '+esc(r.pack?.ideaCount || 6)+' reels with '+esc(r.pack?.highlightsPer || 3)+' highlights each, every one with its value and its times. Ask Claude to run it again: nothing is picked from a pack the app cannot show whole.</p><p class="pb-acts"><button type="button" class="pb-link" id="rl-again"'+(starting ? ' disabled' : '')+'>Run the pack again</button></p></div>';
    const ideas = ideasOf(r), picked = new Set(draft.picked), need = toPick(r), n = draft.picked.length;
    const rows = ideas.map((i, k) => { const on = picked.has(i.id), cur = i.id === sel;
      return '<li class="rl-item'+(cur ? ' is-cur' : '')+'"><button type="button" class="rl-row'+(on ? ' is-win' : '')+'" data-rl-sel="'+esc(i.id)+'" aria-'+(phone.matches ? 'expanded' : 'current')+'="'+cur+'"'+(phone.matches ? ' aria-controls="rl-card-'+esc(i.id)+'"' : ' aria-controls="rl-detail"')+'>'+
        '<span class="rl-row-top"><span class="micro">Reel '+(k+1)+' of '+ideas.length+(i.seconds ? ' · about '+esc(Math.round(i.seconds))+' s' : '')+'</span>'+(on ? '<span class="rl-chip">Winner ✓'+(draft.music[i.id] ? ' · ♪' : '')+'</span>' : draft.music[i.id] ? '<span class="rl-chip is-music">♪ music</span>' : '')+'</span><b>'+esc(i.name || 'Reel '+(k+1))+'</b>'+(i.angle ? '<small>'+esc(i.angle)+'</small>' : '')+
        '<span class="rl-mini" aria-hidden="true">'+i.highlights.map(h => '<i style="left:'+pct(r, h.t0)+';width:'+((+h.t1 - +h.t0) / dur(r) * 100).toFixed(3)+'%"></i>').join('')+'</span></button>'+
        (phone.matches && cur ? '<div class="rl-card" id="rl-card-'+esc(i.id)+'">'+detail(r, i, k)+'</div>' : '')+'</li>'; }).join('');
    const k = ideas.findIndex(i => i.id === sel), names = ideas.filter(i => picked.has(i.id)).map(i => 'Reel '+(ideas.indexOf(i)+1)+' '+(i.name || '')+(draft.music[i.id] ? ' (music)' : ''));
    const bar = r.status === 'pack'
      ? '<div class="pb-bar rl-bar'+(n ? ' is-float' : '')+'" role="region" aria-label="Your winners"><span class="rl-count" aria-live="polite">Picked <b>'+n+'</b> of '+need+(names.length ? '<span class="rl-names"> · '+esc(names.join(', '))+'</span>' : '')+'</span><span class="pb-muted rl-hint">'+(n < need ? 'Pick '+(need - n === 1 ? 'one more' : need - n)+'. Nothing is recorded or built until you save.' : 'Ready. Saving starts nothing: your recording sheets come next.')+'</span><button type="button" class="pb-go" id="rl-save"'+(n === need && !starting ? '' : ' disabled')+'>Save my '+need+' winners</button></div>' : '';
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
  const mainIds = r => new Set([r.source?.driveId, ...(r.source?.driveIds || []), ...jobs.flatMap(j => (j.sources || []).filter(s => s.role === 'main' || s.kind === 'youtube-recording').map(s => s.driveId))].filter(Boolean));
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
  // A take is named by its file name (IMG_3094.MOV) as soon as Claude Code has listed it; until then by its place in the
  // list and the end of its Drive id, with a line saying the name comes once it is checked (two takes never look alike).
  const nameOf = (r, t) => t?.name || (r && t?.driveId ? (known(r, t.driveId)?.name || (r.takeLinks || []).find(x => x.driveId === t.driveId)?.name || (r.takes || []).find(x => x.driveId === t.driveId)?.name) : null) || null;
  const NONAME = 'name appears once Claude Code checks it';
  const takeName = (t, r = null, k = -1) => nameOf(r, t) || (k >= 0 ? 'Take '+(k+1)+' · ' : '')+'Drive file …'+String(t.driveId || '').slice(-6);
  const takeNote = (t, r = null) => nameOf(r, t) ? '' : NONAME;
  const poolIx = (r, id) => takePool(r).findIndex(x => x.driveId === id);
  const hasFolder = r => { const vj = jobs.find(j => j.id === r.jobId); return !!(vj && (vj.source?.kind === 'folder' || vj.source?.folderId || vj.folderId)) || r.source?.kind === 'folder' || !!(r.takeFolders || []).length; };
  const pendingFolders = r => (r.takeFolders || []).filter(f => !(r.foldersListed || []).includes(f.folderId));
  const editTakes = r => !starting && (r.status === 'recording' || (r.status === 'failed' && r.session?.step === 'recordings'));
  const scriptText = (i, k, r) => ['Winner '+(k+1)+': '+(i.name || '')+(r ? ' · about '+secsOf(r, i)+' s at reel pace (60 s maximum)' : ''), '', 'Hook: '+i.hook, '', ...i.highlights.map((h, n) => (n+1)+'. '+h.say+'\n   Value given to the end user: '+h.value), '', 'Close: '+i.close].join('\n');
  function checkLine(r, w, rec) {
    const c = (r.checks || {})[w.i.id]; if (!c || !rec || c.driveId !== rec.driveId) return '';
    if (c.state === 'ok') return '<p class="rl-ck is-ok">✓ '+esc([c.shape || '9:16', c.seconds ? clock(c.seconds) : '', c.voice ? 'voice found' : '', c.guard === 'pass' ? 'not from the YouTube video' : ''].filter(Boolean).join(' · '))+'</p>';
    return '<div class="pb-warn rl-ck" role="alert">'+esc(c.note || 'Claude Code could not use this take.')+'</div>';
  }
  function sheetHtml(r, w, k, pool, recs, edit) {
    const {i} = w, rec = recs[i.id], other = id => Object.entries(recs).find(([wid, x]) => wid !== i.id && x.driveId === id);
    const usable = pool.filter(t => verdict(r, t).ok);
    const ix = id => poolIx(r, id);
    const slot = rec ? '<div class="rl-take is-matched"><span class="pb-shape is-tall" aria-hidden="true"></span><div><b>'+esc(takeName(rec, r, ix(rec.driveId)))+'</b><small>'+esc(takeMeta(rec) || 'Drive file …'+String(rec.driveId).slice(-6))+'</small>'+(takeNote(rec, r) ? '<small class="rl-noname">'+esc(takeNote(rec, r))+'</small>' : '')+'</div>'+(edit ? '<button type="button" class="pb-link" id="rl-un-'+esc(i.id)+'" data-rl-unmatch="'+esc(i.id)+'">Change</button>' : '')+'</div>'+checkLine(r, w, rec)
      : (!usable.length ? '<p class="pb-empty">No phone take yet. Paste its Drive link here.</p>'
      : '<p class="rl-slot-q" id="rl-slot-q-'+esc(i.id)+'">Which take is this reel? Tap it, or paste its link below.</p><div class="rl-slot-opts">'+usable.map(t => { const o = other(t.driveId), nn = takeNote(t, r);
          return '<button type="button" class="rl-takebtn" id="rl-m-'+esc(i.id)+'-'+esc(t.driveId)+'" data-rl-match="'+esc(i.id)+'" data-take="'+esc(t.driveId)+'"'+(edit ? '' : ' disabled')+(o ? ' aria-disabled="true"' : '')+' aria-describedby="rl-slot-q-'+esc(i.id)+'"><b>'+esc(takeName(t, r, ix(t.driveId)))+'</b><small>'+esc(o ? 'Matched to Winner '+(winnersOf(r).findIndex(x => x.i.id === o[0])+1) : takeMeta(t))+'</small>'+(nn && !o ? '<small class="rl-noname">'+esc(nn)+'</small>' : '')+'</button>'; }).join('')+'</div>')+
        (edit ? '<div class="rl-slot-add"><label class="pb-field" for="rl-slot-link-'+esc(i.id)+'"><span>Paste this take’s Drive link <i class="pb-opt-note">it is added and matched to Winner '+(k+1)+' in one go</i></span><input id="rl-slot-link-'+esc(i.id)+'" data-rl-slotlink="'+esc(i.id)+'" type="url" inputmode="url" spellcheck="false" autocomplete="off" maxlength="500" placeholder="https://drive.google.com/file/d/…" value="'+esc(slotText[i.id] || '')+'"></label><button type="button" class="pb-go rl-add-go" id="rl-slot-add-'+esc(i.id)+'" data-rl-slotadd="'+esc(i.id)+'">Add and match</button></div>'+
          ((slotWarn[i.id] || []).length ? '<div class="pb-warn" role="alert">'+esc(slotWarn[i.id].join(' '))+'</div>' : '') : '');
    return '<article class="rl-sheet" aria-labelledby="rl-sh-'+esc(i.id)+'"><span class="micro">Winner '+(k+1)+(i.seconds ? ' · about '+esc(Math.round(i.seconds))+' s' : '')+' · '+(w.music ? '♪ with music' : 'no music')+'</span>'+
      '<h3 id="rl-sh-'+esc(i.id)+'">'+esc(i.name || 'Reel '+(w.n+1))+'</h3>'+
      '<div class="rl-sh-sec"><h4>Hook <span>say it first: it is on screen from frame 1</span></h4><p class="rl-sh-hook">'+esc(i.hook)+'</p></div>'+
      '<ol class="rl-sh-hls">'+i.highlights.map((h, n) => '<li><span class="rl-sh-n" aria-hidden="true">'+(n+1)+'</span><div>'+(h.head ? '<h5>'+esc(h.head)+'</h5>' : '')+'<p class="rl-sh-say">'+esc(h.say)+'</p><p class="rl-sh-val"><b>Value given to the end user:</b> '+esc(h.value)+'</p>'+(brollOk(h.broll) ? '<p class="rl-sh-broll"><span class="rl-lbl">B-roll</span><span>The screen at '+esc(span(r, h))+', silent, no face: '+esc(h.broll.what)+'</span></p>' : '')+'</div></li>').join('')+'</ol>'+
      '<div class="rl-sh-sec"><h4>Close <span>back to the title</span></h4><p class="rl-sh-close">'+esc(i.close)+'</p></div>'+
      '<p class="rl-sh-rules">Front camera · upright 9:16 · chest-up, your face near the middle: it fills the bottom half of the split screen · your own words · the finished reel is 60 seconds or less, so a longer take is fine</p>'+
      '<p class="pb-acts"><button type="button" class="pb-link" id="rl-cs-'+esc(i.id)+'" data-rl-script="'+esc(i.id)+'"'+M.done('script:'+i.id, copiedKey === 'script:'+i.id)+'>'+M.label(copiedKey === 'script:'+i.id, 'Copy the words to say', 'Copied')+'</button></p>'+
      '<div class="rl-slot" role="group" aria-label="Your take for Winner '+(k+1)+'"><span class="micro">Your take</span>'+slot+
      (matchNote?.winner === i.id ? '<p class="rl-note" role="alert">'+esc(matchNote.text)+'</p>' : '')+'</div></article>';
  }
  function takesHtml(r, pool, recs, edit) {
    const by = Object.fromEntries(Object.entries(recs).map(([wid, x]) => [x.driveId, wid])), wins = winnersOf(r);
    const rows = pool.map(t => { const v = verdict(r, t), wid = by[t.driveId], k = wins.findIndex(x => x.i.id === wid);
      return '<li class="rl-take '+(v.ok === true ? 'is-ok' : v.ok ? 'is-unchecked' : 'is-bad')+'"><span class="pb-shape '+(!t.probe ? 'is-other' : +t.probe.height > +t.probe.width ? 'is-tall' : t.probe.band === 'ultrawide' ? 'is-ultra' : 'is-wide')+'" aria-hidden="true"></span><div><b>'+esc(takeName(t, r, pool.indexOf(t)))+'</b><small>'+esc(takeMeta(t))+'</small>'+(takeNote(t, r) ? '<small class="rl-noname">'+esc(takeNote(t, r))+'</small>' : '')+'<small class="rl-why">'+(v.ok ? '' : '<em class="pb-badge is-reject">Cannot be used</em> ')+esc(v.why)+'</small></div>'+
        (k >= 0 ? '<span class="rl-chip is-static">Winner '+(k+1)+'</span>' : edit && t.from === 'link' ? '<button type="button" class="pb-link" id="rl-rm-'+esc(t.driveId)+'" data-rl-remove="'+esc(t.driveId)+'">Remove</button>' : '')+'</li>'; });
    const folders = pendingFolders(r).map(f => '<li class="rl-take is-unchecked"><span class="pb-shape is-folder" aria-hidden="true"></span><div><b>Drive folder …'+esc(String(f.folderId).slice(-6))+'</b><small class="rl-why">Claude Code lists it and checks each file (a few MB each), then you match each take here.</small></div>'+(edit ? '<button type="button" class="pb-link" id="rl-rmf-'+esc(f.folderId)+'" data-rl-remove-folder="'+esc(f.folderId)+'">Remove</button>' : '')+'</li>');
    const all = rows.concat(folders);
    return '<section class="rl-takes" aria-labelledby="rl-takes-h"><h3 id="rl-takes-h">Your phone takes</h3><p class="pb-muted">'+(hasFolder(r) ? 'From the video’s Drive folder and any links you add.' : 'From the links you add, here or in each winner’s slot above.')+' The YouTube recording, landscape files and files with no sound are refused.</p>'+
      (all.length ? '<ul class="rl-take-list">'+all.join('')+'</ul>' : '<p class="pb-empty">No phone takes yet. Record each winner, put the takes in Drive, and add the link here.</p>')+
      (edit ? '<div class="rl-add"><label class="pb-field" for="rl-take-link"><span>Add phone takes from Drive: <i class="pb-opt-note">a file link for each take, or the folder they are in</i></span><input id="rl-take-link" type="url" inputmode="url" spellcheck="false" autocomplete="off" maxlength="1000" placeholder="https://drive.google.com/file/d/…" value="'+esc(takeText)+'"></label><button type="button" class="pb-go rl-add-go" id="rl-take-add">Add</button></div>'+
        (takeWarn.length ? '<div class="pb-warn" id="rl-take-warn" role="alert">'+(takeWarn.length === 1 ? esc(takeWarn[0]) : '<ul>'+takeWarn.map(x => '<li>'+esc(x)+'</li>').join('')+'</ul>')+'</div>' : '') : '')+'</section>';
  }
  function recordHtml(r) {
    const wins = winnersOf(r), pool = takePool(r), edit = editTakes(r);
    const recs = Object.fromEntries(matched(r).map(x => [x.winnerId, {...x, ...(pool.find(t => t.driveId === x.driveId) || {})}]));
    const good = wins.filter(w => recs[w.i.id] && verdict(r, recs[w.i.id]).ok).length, folders = pendingFolders(r).length;
    const listOnly = good < wins.length && folders > 0;
    const can = db && edit && (good === wins.length || listOnly);
    const hint = good === wins.length ? 'Claude Code checks each take, then builds '+(wins.length === 2 ? 'both reels' : 'your reels')+'. This runs by itself and uses your Claude plan’s usage.' : listOnly ? 'Claude Code lists your folder and checks each file, then stops for you to match them here.' : 'Match a take to each winner. Nothing is built until you press Build.';
    const bar = edit ? '<div class="pb-bar rl-bar'+(good ? ' is-float' : '')+'" role="region" aria-label="Your takes"><span class="rl-count" aria-live="polite">Matched <b>'+good+'</b> of '+wins.length+'</span><span class="pb-muted rl-hint">'+esc(hint)+'</span><button type="button" class="pb-go" id="rl-build"'+(can ? '' : ' disabled')+'>'+(listOnly ? 'List my folder →' : 'Build my reels →')+'</button></div>' : '';
    return '<section class="rl-rec" aria-labelledby="rl-rec-h"><div class="rl-rec-head"><h2 id="rl-rec-h" tabindex="-1">Record your '+wins.length+' winners</h2><p class="pb-muted">On your phone: front camera, upright, in your own words. Put the takes in Drive, then tap the take that belongs to each reel.</p></div>'+
      (r.checkNote && ['recording','failed'].includes(r.status) ? '<div class="pb-warn" role="alert">'+esc(r.checkNote)+'</div>' : '')+
      '<div class="rl-sheets">'+wins.map((w, k) => sheetHtml(r, w, k, pool, recs, edit)).join('')+'</div>'+takesHtml(r, pool, recs, edit)+bar+'</section>';
  }
  // R5 Building: the matched takes, under the stages the session writes.
  function takesLine(r) {
    const wins = winnersOf(r), pool = takePool(r), recs = Object.fromEntries(matched(r).map(x => [x.winnerId, {...x, ...(pool.find(t => t.driveId === x.driveId) || {})}]));
    return '<ul class="rl-using">'+wins.map((w, k) => '<li><span class="micro">Winner '+(k+1)+(w.music ? ' · ♪ with music' : ' · no music')+'</span><b>'+esc(w.i.name || '')+'</b><small>'+(recs[w.i.id] ? 'Take: '+esc(takeName(recs[w.i.id], r, pool.findIndex(t => t.driveId === recs[w.i.id].driveId)))+(takeNote(recs[w.i.id], r) ? ' ('+esc(takeNote(recs[w.i.id], r))+')' : '') : 'No take matched')+'</small>'+checkLine(r, w, recs[w.i.id])+'</li>').join('')+'</ul>';
  }

  // ---- Path B: reel options cut straight from the phone take; keep the ones you want, music per reel --------------------
  // The session writes options (PUBLISH.md "Path B"); the app never repairs them: each reel needs a name, a hook, a length
  // of 60 s or less, its sections of a known take, a preview on the review page and youtube_guard's pass, and every
  // B-roll moment is silent screen share with no face in it. Otherwise nothing can be kept.
  const optsOf = r => (Array.isArray(r.options?.reels) ? r.options.reels : []).filter(Boolean);
  const takeIds = r => new Set([...(r.takes || []), ...(r.options?.takes || [])].map(t => t?.driveId).filter(Boolean));
  const brollOf = o => Array.isArray(o.broll) ? o.broll : [];
  const cutsOf = o => Array.isArray(o.cuts) ? o.cuts : [];
  function optionsOk(r) {
    const list = optsOf(r), max = +r.options?.maxSeconds || 60, ids = takeIds(r);
    return list.length > 0 && new Set(list.map(o => o.id)).size === list.length && list.every(o => o.id && String(o.name || '').trim() && String(o.hook || '').trim() &&
      +o.seconds > 0 && +o.seconds <= max && ids.has(o.take) && httpsUrl(o.preview) && o.guard === 'pass' && cutsOf(o).length > 0 && cutsOf(o).every(c => Number.isFinite(+c.t0) && +c.t1 > +c.t0) &&
      brollOf(o).every(x => x && x.silent === true && x.face === false && Number.isFinite(+x.src0) && +x.src1 > +x.src0));
  }
  function ensureKeep(r) {
    const key = r.id+'|'+(r.keepSavedAt || '')+'|'+(r.options?.checkedAt || '');
    if (kdFor === key && kd) return; kdFor = key;
    const k = r.keep || {}, ids = new Set(optsOf(r).map(o => o.id));
    kd = {keep:new Set(Object.keys(k).filter(id => ids.has(id) && k[id])), music:Object.fromEntries(Object.entries(k).filter(([id]) => ids.has(id)).map(([id, v]) => [id, !!v?.music]))};
    keepNote = '';
  }
  const keepOpen = r => r.status === 'options' && !starting;
  const takeLabel = (r, id) => { const t = [...(r.takes || []), ...(r.options?.takes || [])].find(x => x?.driveId === id); return t?.name || 'your phone take'; };
  function optCard(r, o) {
    const on = kd.keep.has(o.id), m = !!kd.music[o.id], open = keepOpen(r), b = brollOf(o), cuts = cutsOf(o);
    const ext = [...(Array.isArray(o.katana) ? o.katana.map(k => 'Katana '+(k.concept || '')+(k.at != null ? ' at '+clock(k.at) : '')) : []), ...(Array.isArray(o.blender) ? o.blender.map(k => 'Blender '+(k.concept || '')+(k.at != null ? ' at '+clock(k.at) : '')) : [])];
    return '<li class="rl-ocard'+(on ? ' is-kept' : '')+'"><article aria-labelledby="rl-oc-'+esc(o.id)+'">'+previewHtml(o, 'option '+o.id)+
      '<div class="rl-oc-main"><span class="micro">Option '+esc(o.id)+' · '+esc(clock(o.seconds))+' · from '+esc(takeLabel(r, o.take))+' '+esc(cuts.map(c => clock(c.t0)+'–'+clock(c.t1)).join(', '))+'</span>'+
      '<h3 id="rl-oc-'+esc(o.id)+'">'+esc(o.name)+'</h3>'+(nearSame(o.name, o.hook) ? '' : '<p class="rl-oc-hook"><span class="rl-lbl">Hook</span>'+esc(o.hook)+'</p>')+(o.why ? '<p class="rl-oc-why">'+esc(o.why)+'</p>' : '')+
      '<ul class="rl-oc-facts">'+(b.length ? '<li><b>Screen-share B-roll</b> '+esc(b.length)+' moment'+(b.length > 1 ? 's' : '')+', silent, no face: '+b.map(x => esc((x.at != null ? clock(x.at)+' ' : '')+(x.what || 'screen')+' (main recording '+(x.yt0 && x.yt1 ? x.yt0+'–'+x.yt1 : clock(x.src0)+'–'+clock(x.src1))+')')).join('; ')+'</li>' : '<li><b>No B-roll</b> your take only</li>')+
        (ext.length ? '<li><b>Shots</b> '+esc(ext.join(' · '))+'</li>' : '')+'<li><b>Captions</b> '+esc(o.captions || 'style C')+'</li><li><b>Layout</b> split screen: your face below, the motion above</li>'+(splitLine(o.split) ? '<li class="rl-oc-split'+(o.split.pass === false ? ' is-bad' : '')+'">'+esc(splitLine(o.split))+'</li>' : '')+'<li class="rl-oc-guard">✓ youtube_guard: your own take, not from the YouTube video</li></ul>'+
      '<button type="button" class="rl-pick rl-keep" data-rl-keep="'+esc(o.id)+'" aria-pressed="'+on+'"'+(on ? M.attr('on:pick:'+o.id, 'fill') : '')+(open && o.split?.pass !== false ? '' : ' disabled')+'>'+(o.split?.pass === false ? 'Not split screen: cannot be kept' : on ? 'Kept ✓' : 'Keep this reel')+'</button>'+
      musicSwitch('rl-omusic-'+o.id, 'data-rl-omusic', o.id, m, !open || !on, on ? (m ? 'Music goes under this reel, from your Drive music folder. You choose the track next.' : 'Off: this reel has your voice and sound effects only, no music.') : 'Keep this reel to choose music for it.')+
      '</div></article></li>';
  }
  function musicSwitch(id, attr, val, on, off, words) {
    return '<label class="rl-music'+(on ? ' is-on' : '')+'" for="'+esc(id)+'"><input type="checkbox" class="rl-music-in" id="'+esc(id)+'" '+attr+'="'+esc(val)+'"'+(on ? ' checked' : '')+(off ? ' disabled' : '')+' aria-describedby="'+esc(id)+'-d">'+
      '<span class="rl-music-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></svg></span>'+
      '<span class="rl-music-t"><b>Add music</b><small id="'+esc(id)+'-d">'+esc(words)+'</small></span><span class="rl-music-sw" aria-hidden="true"></span></label>';
  }
  function optionsHtml(r) {
    ensureKeep(r);
    if (!optionsOk(r)) return '<div class="pb-warn rl-badpack" role="alert"><p><b>These reel options didn’t pass the checker.</b> Each needs a name, a hook, 60 seconds or less, its sections of your phone take, a preview on your review page and youtube_guard’s pass, with only silent, face-free screen share from the main recording. Nothing can be kept from options the app cannot show whole.</p><p class="pb-acts"><button type="button" class="pb-link" id="rl-again"'+(starting ? ' disabled' : '')+'>Make the options again</button></p></div>';
    const list = optsOf(r), n = kd.keep.size, open = keepOpen(r), takes = [...(r.options?.takes || r.takes || [])];
    const names = list.filter(o => kd.keep.has(o.id)).map(o => 'Option '+o.id+(kd.music[o.id] ? ' (music)' : ''));
    const bar = r.status === 'options' ? '<div class="pb-bar rl-bar'+(n ? ' is-float' : '')+'" role="region" aria-label="The reels you keep"><span class="rl-count" aria-live="polite">Keeping <b>'+n+'</b> of '+list.length+(names.length ? '<span class="rl-names"> · '+esc(names.join(', '))+'</span>' : '')+'</span><span class="pb-muted rl-hint">'+(n ? ([...kd.keep].some(id => kd.music[id]) ? 'Claude Code finishes these, then asks you for the music.' : 'Claude Code finishes these: cover, 4:5 post and caption.')+' This uses your Claude plan’s usage.' : 'Keep one or more. Nothing is finished until you press Finish.')+'</span><button type="button" class="pb-go" id="rl-keep-go"'+(n && open && db ? '' : ' disabled')+'>Finish the reels I kept →</button></div>' : '';
    return '<section class="rl-opts" aria-labelledby="rl-opts-h"><h2 id="rl-opts-h" tabindex="-1">Your reel options</h2><p class="pb-muted">'+esc(r.options?.note || 'Cut straight from '+(takes.length > 1 ? 'your phone takes' : takeLabel(r, takes[0]?.driveId))+'. Each is 60 seconds or less, with your hook from the first frame. Watch them on your review page, then keep the ones you want.')+(httpsUrl(r.reviewUrl) ? ' <a class="pb-link" href="'+esc(httpsUrl(r.reviewUrl))+'" target="_blank" rel="noopener noreferrer">Open the review page ↗</a>' : '')+'</p>'+
      (keepNote ? '<p class="rl-note" role="alert">'+esc(keepNote)+'</p>' : '')+
      '<ul class="rl-ogrid" aria-label="Reel options">'+list.map(o => optCard(r, o)).join('')+'</ul>'+bar+'</section>';
  }
  const keptSummary = r => { const list = optsOf(r).filter(o => (r.keep || {})[o.id]); return list.length ? '<ul class="rl-using">'+list.map(o => '<li><span class="micro">Option '+esc(o.id)+' · '+esc(clock(o.seconds))+'</span><b>'+esc(o.name)+'</b><small>'+((r.keep || {})[o.id]?.music ? '♪ With music: you choose the track next' : 'No music')+'</small></li>').join('')+'</ul>' : ''; };
  const takesUsing = r => (r.takes || []).length ? '<ul class="rl-using">'+r.takes.map((t, k) => '<li><span class="micro">Phone take</span><b>'+esc(takeName(t, r, r.takes.length > 1 ? k : -1))+'</b>'+(takeNote(t, r) ? '<small>'+esc(takeNote(t, r))+'</small>' : '')+'<small>'+esc(takeMeta({...t, from:''}) || 'Drive file')+'</small></li>').join('')+'</ul>' : '';

  // ---- R6 Music: only the reels whose winner has Add music on (decision 6); a track from the Drive folder, or off ----
  const builtOf = r => (Array.isArray(r.built) ? r.built : []).filter(b => b && b.id);
  const reelName = (r, b) => { const w = winnersOf(r).find(x => x.i.id === b.winnerId), o = optsOf(r).find(x => x.id === (b.optionId || b.id)); return w?.i.name || (isB(r) && o?.name) || 'Reel '+b.id; };
  const tracks = r => (Array.isArray(r.music?.tracks) ? r.music.tracks : []).filter(t => t && t.n != null);
  const trackLabel = t => String(t.n).padStart(2, '0')+' '+(t.title || 'Track')+(t.seconds ? ' · '+clock(t.seconds) : '');
  const pickOf = (r, id) => (r.musicPicks || {})[id] || null;
  const musicDone = (r, b) => { const p = pickOf(r, b.id); return !!p && (p.off === true || tracks(r).some(t => String(t.n) === String(p.track))); };
  const editMusic = r => !starting && (r.status === 'music' || (r.status === 'failed' && r.session?.step === 'music'));
  // sub: the music line under Watch (no music yet, the picked track, or no music); the picture is the still or cover when
  // the document has one, else the placeholder that says it opens on the review page.
  function previewHtml(b, name, sub = 'no music yet') {
    const url = httpsUrl(b.preview), still = imageOf(b);
    const pic = still ? '<img src="'+esc(still)+'" alt="" loading="lazy">' : ph('9:16', url ? OPENS : 'No preview yet');
    return url ? '<a class="rl-prev" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+pic+'<span class="rl-prev-t"><span class="rl-prev-w">Watch '+esc(name)+' ↗</span>'+(sub ? '<small>'+esc(sub)+'</small>' : '')+'</span></a>' : '<span class="rl-prev is-none">'+pic+'<span class="rl-prev-t">No preview link</span></span>';
  }
  // Path A reels are named by their winner everywhere (Winner 1, Winner 2), as on the recording sheets; Path B by the
  // letter of the option they were cut as (Reel A).
  const reelTag = (r, b) => { const w = isB(r) ? -1 : winnersOf(r).findIndex(x => x.i.id === b.winnerId); return w >= 0 ? 'Winner '+(w+1) : 'Reel '+b.id; };
  const musicWord = (r, b) => { const p = pickOf(r, b.id); if (b.music === false || p?.off) return 'no music'; const t = p?.track != null ? tracks(r).find(x => String(x.n) === String(p.track)) : null; return t ? '♪ '+(t.title || 'Track '+t.n) : 'no music yet'; };
  function musicCard(r, b, edit) {
    const lib = tracks(r), prop = ((r.music?.proposals || {})[b.id] || []).map(n => lib.find(t => String(t.n) === String(n))).filter(Boolean);
    const p = pickOf(r, b.id), cur = p?.off ? 'off' : p?.track != null ? String(p.track) : '', rest = lib.filter(t => !prop.includes(t)), name = reelName(r, b), dis = edit ? '' : ' disabled';
    const g = 'rl-tr-'+b.id, tag = reelTag(r, b);
    const radio = (val, body, extra = '') => '<div class="rl-trk'+(cur === val ? ' is-on' : '')+'"><label for="'+esc(g+'-'+val)+'"><input type="radio" name="'+esc(g)+'" id="'+esc(g+'-'+val)+'" value="'+esc(val)+'" data-rl-track="'+esc(b.id)+'"'+(cur === val ? ' checked' : '')+dis+'>'+body+'</label>'+extra+'</div>';
    const play = t => httpsUrl(t.url) ? '<a class="pb-link rl-play" href="'+esc(httpsUrl(t.url))+'" target="_blank" rel="noopener noreferrer" aria-label="Play '+esc(trackLabel(t))+' on Drive">Play ↗</a>' : '';
    const other = rest.find(t => String(t.n) === cur);
    return '<article class="rl-mcard" aria-labelledby="rl-mc-'+esc(b.id)+'">'+previewHtml(b, tag, musicWord(r, b))+'<div class="rl-mc-main"><span class="micro">'+esc(tag)+(b.seconds ? ' · '+esc(clock(b.seconds)) : '')+'</span><h3 id="rl-mc-'+esc(b.id)+'">'+esc(name)+'</h3>'+
      '<fieldset class="rl-tracks"><legend>Music for '+esc(tag)+'</legend>'+
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
      (without.length ? '<ul class="rl-nomusic">'+without.map(b => '<li>'+previewHtml(b, reelTag(r, b), 'no music')+'<div><span class="micro">'+esc(reelTag(r, b))+(b.seconds ? ' · '+esc(clock(b.seconds)) : '')+'</span><b>'+esc(reelName(r, b))+'</b><small>No music: you left Add music off. It is finished as it is.</small></div></li>').join('')+'</ul>' : '')+
      (edit ? '<div class="pb-bar rl-bar'+(done ? ' is-float' : '')+'" role="region" aria-label="Your music"><span class="rl-count" aria-live="polite">Chosen <b>'+done+'</b> of '+withM.length+'</span><span class="pb-muted rl-hint">'+(done < withM.length ? 'Choose a track or No music for every reel with music.' : 'Claude Code adds the music, the cover, the 4:5 post and the caption.')+'</span>'+
        (!lib.length && r.status === 'music' ? '<button type="button" class="pb-link rl-bar-link" id="rl-music-retry">Try again</button>' : '')+'<button type="button" class="pb-go" id="rl-finish"'+(can ? '' : ' disabled')+'>Finish my reels →</button></div>' : '')+'</section>';
  }

  // ---- R7 Ready to post: per reel the 9:16 reel, the 4:5 post, the cover and the caption with Copy (decision 8) -----
  const PH = /\[[A-Z][A-Z0-9 _-]{2,}\]|\{\{|\}\}/;
  // ---- Ready to post (outputs.js, 10 November 2026): the reel job's finished files and captions for the shared screen ----
  function readyCtx(r) {
    const built = builtOf(r), finals = Array.isArray(r.finals) ? r.finals : [], caps = Array.isArray(r.captions) ? r.captions : [];
    const ids = built.length ? built.map(b => b.id) : [...new Set(finals.map(f => f.reelId))];
    const items = ids.map(id => { const b = built.find(x => x.id === id) || {id}, fs = finals.filter(f => f.reelId === id && httpsUrl(f.url)), p = pickOf(r, id);
      const tr = p?.track != null && !p.off ? tracks(r).find(t => String(t.n) === String(p.track)) : null;
      const cap = caps.find(c => c.reelId === id && (c.kind || 'reel') === 'reel') || caps.find(c => c.reelId === id), post = caps.find(c => c.reelId === id && c.kind === 'post');
      return {id, name:reelName(r, b), len:b.seconds ? clock(b.seconds) : '', music:b.music === false || p?.off ? 'no music' : tr ? 'music: '+trackLabel(tr).replace(/ · .*$/, '') : '',
        reel:fs.find(f => f.kind === 'reel') || null, post:fs.find(f => f.kind === 'post') || null, cover:fs.find(f => f.kind === 'cover') || null,
        image:imageOf(...fs.filter(f => f.kind === 'cover'), ...fs, b), caption:cap?.text || '', postCaption:post?.text || '',
        // The split-screen check (Split Screen Katana, 10 November 2026), worded exactly as the reel's own Ready to post said it.
        split:(() => { const sc = (r.splitScreen || {})[id], sl = splitLine(sc); return sl ? {text:sl+(sc.post && splitLine(sc.post) ? ' · 4:5 post: '+(sc.post.pass ? 'split screen too' : 'not split screen') : ''), bad:sc.pass === false} : null; })()}; });
    return {r, id:r.id, path:r.path, reviewUrl:httpsUrl(r.reviewUrl), finalNote:r.finalNote || '', items};
  }
  // ---- end Ready to post context ----
  function readyHtml(r) {
    if (window.WWOutputs) return window.WWOutputs.reelsLane(readyCtx(r));  // Ready to post: outputs.js
    const built = builtOf(r), finals = Array.isArray(r.finals) ? r.finals : [], caps = Array.isArray(r.captions) ? r.captions : [];
    const ids = built.length ? built.map(b => b.id) : [...new Set(finals.map(f => f.reelId))];
    const KIND = {reel:'9:16 reel', post:'4:5 post', cover:'Cover'};
    const card = id => { const b = built.find(x => x.id === id) || {id}, fs = finals.filter(f => f.reelId === id && httpsUrl(f.url)), c = caps.find(x => x.reelId === id), p = pickOf(r, id);
      const tr = p?.track != null && !p.off ? tracks(r).find(t => String(t.n) === String(p.track)) : null;
      const music = b.music === false || p?.off ? 'no music' : tr ? 'music: '+trackLabel(tr).replace(/ · .*$/, '') : '';
      const cover = fs.find(f => f.kind === 'cover');
      const bad = c && PH.test(c.text || '');
      // One picture for the reel's three tiles when the session wrote any (a still, the cover JPG, a poster), else the placeholder.
      const pic = imageOf(...fs.filter(f => f.kind === 'cover'), ...fs, b, c);
      const SHAPE = {reel:'9:16', post:'4:5', cover:'9:16'};
      const frame = (k, on) => '<span class="rl-fr"><span class="rl-fr-in">'+(on && pic ? '<img src="'+esc(pic)+'" alt="" loading="lazy">' : on ? ph(SHAPE[k], OPENS) : ph(SHAPE[k], 'Not written yet'))+'</span></span>';
      const sc = (r.splitScreen || {})[id], sl = splitLine(sc);
      return '<article class="rl-rd" aria-labelledby="rl-rd-'+esc(id)+'"><div class="rl-rd-head"><span class="micro">'+esc(reelTag(r, b))+(b.seconds ? ' · '+esc(clock(b.seconds)) : '')+(music ? ' · '+esc(music) : '')+'</span><h3 id="rl-rd-'+esc(id)+'">'+esc(reelName(r, b))+'</h3>'+
        (sl ? '<p class="rl-split'+(sc.pass === false ? ' is-bad' : '')+'" role="'+(sc.pass === false ? 'alert' : 'note')+'">'+esc(sl)+(sc.post && splitLine(sc.post) ? ' · 4:5 post: '+esc(sc.post.pass ? 'split screen too' : 'not split screen') : '')+'</p>' : '<p class="rl-split is-none">Split-screen check: not recorded for this reel</p>')+'</div>'+
        '<div class="rl-rd-body"><div class="rl-files">'+['reel','post','cover'].map(k => { const f = fs.find(x => x.kind === k);
          return f ? '<a class="rl-file is-'+k+'" href="'+esc(httpsUrl(f.url))+'" target="_blank" rel="noopener noreferrer">'+frame(k, true)+'<b>'+esc(f.label || KIND[k])+' ↗</b>'+(f.detail ? '<small>'+esc(f.detail)+'</small>' : '')+'</a>' : '<span class="rl-file is-'+k+' is-none">'+frame(k, false)+'<b>'+KIND[k]+'</b><small>Not written yet</small></span>'; }).join('')+'</div>'+
        '<div class="rl-cap"><span class="micro">Caption'+(c?.check ? ' · '+(c.check === 'pass' ? 'checked by Performance Poster' : esc(c.check)) : '')+'</span>'+(c?.text ? '<pre class="pb-copy" id="rl-cap-'+esc(id)+'">'+esc(c.text)+'</pre>'+
          (bad ? '<div class="pb-warn" role="alert">This caption still has a placeholder, so it cannot be copied. Ask Claude Code to write it again.</div>' : '<p class="pb-acts"><button type="button" class="pb-go rl-copy-cap" id="rl-cc-'+esc(id)+'" data-rl-cap="'+esc(id)+'"'+M.done('cap:'+id, copiedKey === 'cap:'+id)+'>'+M.label(copiedKey === 'cap:'+id, 'Copy caption', 'Copied')+'</button></p>') : '<p class="pb-muted">No caption written yet.</p>')+'</div></div></article>'; };
    return '<section class="rl-ready" aria-labelledby="rl-ready-h"><h2 id="rl-ready-h" tabindex="-1">Your reels are ready to post</h2><p class="pb-muted">'+esc(r.finalNote || 'Every file is on your private review page. Nothing has been posted.')+(httpsUrl(r.reviewUrl) ? ' <a class="pb-link" href="'+esc(httpsUrl(r.reviewUrl))+'" target="_blank" rel="noopener noreferrer">Open the review page ↗</a>' : '')+'</p>'+
      ids.map(card).join('')+
      '<div class="rl-howto"><b>Posting by hand on Instagram</b><ol><li>Post the 9:16 file as a Reel. At the crop step choose <b>Original</b>: Instagram starts on a square that cuts the top and bottom off.</li><li>Post the 4:5 file as a post, and open the crop out before Next. A post’s crop cannot be changed after it is shared.</li><li>Set the cover from the cover image.</li><li>Post on or after the YouTube video goes out: each caption says the full video is on YouTube.</li></ol></div>'+
      (window.WWPosting ? window.WWPosting.reelPanel(r) : '')+'</section>';  // posting.js: Instagram and Facebook rows
  }
  function musicSummary(r) {
    const built = builtOf(r); if (!built.length) return '';
    return '<ul class="rl-using">'+built.map(b => { const p = pickOf(r, b.id), tr = p?.track != null && !p.off ? tracks(r).find(t => String(t.n) === String(p.track)) : null;
      return '<li><span class="micro">'+esc(reelTag(r, b))+'</span><b>'+esc(reelName(r, b))+'</b><small>'+(b.music === false || p?.off ? 'No music' : tr ? 'Music: '+esc(trackLabel(tr)) : 'Music not chosen')+'</small></li>'; }).join('')+'</ul>';
  }
  // The pack stays one tap away once the winners are saved, closed so the recording sheets come first.
  const packBelow = r => '<details class="rl-whole"><summary>The whole highlight pack</summary>'+packHtml(r)+'</details>';

  // ---- Render ------------------------------------------------------------------------------------------------------
  // Where the reel job's files come from, named as Taylor knows them (7 November 2026 review): on Path B the phone take(s)
  // by file name (takes[].name, e.g. IMG_3094.MOV) and the video by its title; on Path A the video by its title. Never the
  // YouTube recording's Drive id where the phone take is meant.
  function fromLine(r) {
    const vj = jobs.find(j => j.id === r.jobId), main = vj ? mainOf(vj) : null;
    const vt = vj?.title || r.source?.title || (main?.name || r.source?.name || '').replace(/\.[a-z0-9]{2,4}$/i, '');
    const video = vt ? '“'+vt+'”' : 'the YouTube recording';
    if (isB(r)) {
      const seen = new Set(), ts = [...(r.takes || []), ...(r.options?.takes || [])].filter(t => t?.driveId && !seen.has(t.driveId) && seen.add(t.driveId));
      const names = ts.map((t, k) => nameOf(r, t) || 'phone take '+(ts.length > 1 ? (k+1)+' ' : '')+'(…'+String(t.driveId).slice(-6)+', '+NONAME+')');
      return 'cut from your phone take'+(names.length > 1 ? 's ' : ' ')+(names.join(', ') || '('+NONAME+')')+' · screen-share B-roll from '+video+(r.source?.driveIds?.length > 1 ? ' ('+partsWord(r.source)+')' : '');
    }
    if (r.source?.kind === 'job') return 'reel scripts from the words of '+video+(r.source.driveIds?.length > 1 ? ' · '+partsWord(r.source) : '');
    if (r.source?.kind === 'folder') return 'from Drive folder …'+String(r.source.folderId || '').slice(-6);
    return 'from '+(r.source?.name ? r.source.name : 'Drive file …'+String(r.source?.driveId || '').slice(-6));
  }
  const tabs = () => window.WWPublish?.laneTabs ? window.WWPublish.laneTabs('reels') : '';
  // Path B: building options, pick reels (with the Add music switch), then the same Music and Ready to post as Path A.
  function bodyB(r) {
    const s = r.status, step = r.session?.step || 'pack';
    if (s === 'found') return foundHtml(r)+stages(r);
    if (s === 'options') return optionsHtml(r);
    if (s === 'failed') return stages(r)+(step === 'music' && builtOf(r).length ? musicBoard(r) : r.options ? optionsHtml(r) : takesUsing(r));
    if (s === 'finishing') return stages(r)+(step === 'options' ? keptSummary(r) : musicSummary(r));
    if (s === 'music') return (r.stages?.length ? '<details class="rl-whole"><summary>How the reels were made</summary>'+stages(r, true)+'</details>' : '')+musicBoard(r);
    if (s === 'final') return readyHtml(r)+(r.stages?.length ? '<details class="rl-whole"><summary>How it was made</summary>'+stages(r, true)+'</details>' : '');
    return stages(r)+takesUsing(r);
  }
  function body(r) {
    const s = r.status, step = r.session?.step || 'pack';
    if (isB(r)) return bodyB(r);
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
    if (!root || root.hidden || !isReels()) return;
    const a = document.activeElement, fid = a && root.contains(a) ? a.id || (a.dataset?.rlSel ? 'sel:'+a.dataset.rlSel+':'+(a.classList.contains('rl-row') ? 'row' : 'seg') : a.dataset?.rlPick ? 'pick:'+a.dataset.rlPick : '') : '';
    const caret = a && /^(INPUT|TEXTAREA)$/.test(a.tagName) && a.type !== 'checkbox' && a.type !== 'radio' ? [a.selectionStart, a.selectionEnd] : null;
    const r = openId ? current() : null;
    if (r) M.stages('reel:'+r.id, r.stages, M.arriving(root));
    const head = r ? (allTopics().find(t => t.id === r.topicId)?.title || r.title || 'Reels') : 'Reels from this week’s video';
    const LEDE = {recording:'Record your two winners on your phone, then match each take to its reel. Claude Code builds the reels from your takes, never from the YouTube video.', building:'Claude Code is building your reels from your phone takes. Each stage appears below as it happens.', music:'Your reels are built. Choose the music for each reel that has Add music on.', finishing:'Claude Code is finishing your reels. Each stage appears below as it happens.', final:'Your split-screen reels, their 4:5 posts, covers and captions, ready to post by hand.'};
    const lede = r ? (LEDE[r.status] || (r.status === 'failed' && LEDE[{recordings:'recording', music:'music'}[r.session?.step]]) || (['pack'].includes(r.status) && packOk(r) ? 'Six reels on the title, three highlights each. Pick the two you’ll record on your phone. Nothing is recorded or built until you save your winners.' : 'Claude Code makes six reel ideas from the recording’s words, three highlights each, and stops for you to pick two.')) : 'Start from a video’s main recording. Claude Code makes six reel ideas on its title, three highlights each, and you pick the two you’ll record on your phone.';
    const LEDE_B = {queued:'Split-screen reels cut straight from your phone take. Claude Code finds the best sections and stops for you to keep the ones you want.', starting:'Split-screen reels cut straight from your phone take. Claude Code finds the best sections and stops for you to keep the ones you want.', running:'Claude Code is cutting reel options straight from your phone take. Each stage appears below as it happens.', found:'Claude Code found earlier reel work for this recording.', options:'Split-screen reel options cut straight from your phone take, 60 seconds or less each: your face below, the motion above. Keep the ones you want, and add music to any of them.', failed:'This reel job stopped. Nothing was posted.', finishing:'Claude Code is finishing your reels. Each stage appears below as it happens.', music:LEDE.music, final:LEDE.final};
    const ledeNow = r && isB(r) ? LEDE_B[r.status] || lede : lede;
    const EYEBROW = {recording:'YOUR RECORDINGS', building:'BUILDING YOUR REELS', music:'MUSIC', finishing:'READY TO POST', final:'READY TO POST'};
    const eyebrow = r && isB(r) ? ({options:'PICK YOUR REELS', music:'MUSIC', final:'READY TO POST'}[r.status] || (r.status === 'finishing' ? (r.session?.step === 'options' ? 'FINISHING YOUR REELS' : 'READY TO POST') : 'REEL OPTIONS')) : EYEBROW[r?.status] || 'REEL HIGHLIGHT PACK';
    root.innerHTML = '<div class="pb-head"><div><div class="micro">PUBLISH · REELS · '+eyebrow+'</div><h1 id="pb-heading">'+esc(head)+'</h1><p>'+esc(ledeNow)+'</p></div>'+(r ? '<a class="pb-link rl-new" href="#/publish/reels">Start new reels</a>' : '')+'</div>'+(window.WWPublishBack ? window.WWPublishBack() : '')+tabs()+
      (openId && !r ? '<div class="pb-warn" role="status">'+(db ? 'This reel job isn’t in the app’s database. <a href="#/publish/reels">Start new reels</a>' : connecting ? 'Loading…' : 'Reel jobs are saved in the app’s database, which this preview doesn’t have.')+'</div>' : steps(r))+
      (note ? '<div class="pb-warn" role="status"><p>'+esc(note)+'</p>'+(retry && r ? '<p class="pb-acts"><button type="button" class="pb-link" id="rl-retry"'+(starting ? ' disabled' : '')+'>Try again</button> <button type="button" class="pb-link" id="rl-copy"'+M.done('rl-line', copied)+'>'+M.label(copied, 'Copy the line', 'Copied')+'</button></p>' : '')+'</div>' : '')+
      (!openId ? intake() : !r ? '' : '<p class="pb-meta">Reel job '+esc(r.id)+' · '+esc(fromLine(r))+
        (r.pack?.skill ? ' · written by '+esc(skillName(r.pack.skill)) : '')+(r.pack?.builtWith ? ' · checked by '+esc(r.pack.builtWith) : '')+(Number.isFinite(+r.offsetS) && +r.offsetS > 0 ? ' · YouTube trim '+esc(r.offsetS)+' s' : '')+(r.auto ? ' · started by itself when you confirmed the files' : '')+' · started '+esc(when(r.createdAt))+'</p>'+pathLine(r)+(window.WWAutopilot?.reelHtml?.(r) || '')+
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
    const src = s.kind === 'job' ? {kind:'job', jobId:s.jobId, driveId:s.driveId, url:s.url, fromJob:true, ...(s.driveIds ? {driveIds:s.driveIds, urls:s.urls, seconds:s.seconds} : {})} : s.kind === 'file' ? {kind:'file', driveId:s.driveId, url:s.url, fromJob:false} : {kind:'folder', folderId:s.folderId, url:s.url, fromJob:false};
    const doc = {id, jobId:s.jobId || null, topicId:t?.id || null, title:title.trim(), titleBy:'taylor', source:src, offsetS:trimVal(), skills:reelSkills(), status:'queued', stages:[], winners:{}, createdAt:at, startedAt:at, updatedAt:at,
      ...pathFields(s.path, s.takes, at), ...extra};
    try { starting = true; await db.doc('reels/'+id).set(doc); reels = [doc, ...reels.filter(x => x.id !== id)]; starting = false;
      from = null; linkText = ''; title = ''; titleTouched = false; trim = ''; reuseSeen = ''; reuseOk = '';
      location.hash = '#/publish/reels/'+id; openId = id; await startSession(doc); }
    catch (e) { starting = false; note = 'Could not start the reel job ('+(e?.code || 'error')+').'; render(); }
  }
  // The path on a new reel job: written once by the app (a pasted folder leaves it null for the session to decide).
  const pathFields = (path, takes, at) => ({path:path ?? null, pathWhy:path === 'B' ? PATH_WHY.B(takes.length) : path === 'A' ? PATH_WHY.A : null, pathBy:path ? 'app' : null, pathAt:path ? at : null,
    ...(path === 'B' ? {takes:takes.map(takeOf), keep:{}} : {})});
  // Decision 10: Confirm and continue on a Video job whose files hold a phone take starts its reels by itself, on Path B.
  // One reel job per video (a stopped one with nothing made can be replaced); the Video job is read, never written.
  // start is false when the Video session was refused: the reel job then waits on "queued" and starts with the next
  // Video session (startQueued), or from Start now on the Reels lane.
  // Path A (7 November 2026): the same Confirm with the main recording alone starts the reel scripts by themselves, so the
  // suggested scripts to record on the phone are waiting on the Reels lane without opening it first.
  async function autoFromJob(j, start = true) {
    if (!db || !j?.id) return null;
    const pc = choosePath(j.sources), m = mainOf(j), ps = mainParts(j);
    if (!['A','B'].includes(pc.path) || !m) return null;
    if (reels.some(r => r.jobId === j.id && !(r.status === 'failed' && !r.pack && !r.options))) return null;
    const id = new Date().toISOString().slice(0, 10)+'-'+Math.random().toString(36).slice(2, 7), at = new Date().toISOString();
    const topic = j.topicId ? allTopics().find(t => t.id === j.topicId) : null;
    const src = {kind:'job', jobId:j.id, driveId:m.driveId, url:m.url || null, fromJob:true, ...(ps.length > 1 ? {driveIds:ps.map(x => x.driveId), urls:ps.map(x => x.url || null), seconds:partsSeconds(ps)} : {})};
    const doc = {id, jobId:j.id, topicId:j.topicId || null, title:String(j.title || topic?.title || '').trim(), titleBy:'taylor', source:src, offsetS:null, skills:reelSkills(), status:'queued', stages:[], winners:{},
      auto:true, createdAt:at, startedAt:at, updatedAt:at, ...pathFields(pc.path, pc.takes, at), ...(window.WWAutopilot?.forReel?.(j) || {})};
    try { await db.doc('reels/'+id).set(doc); reels = [doc, ...reels.filter(x => x.id !== id)]; } catch { return null; }
    if (start) await startSession(doc, 'pack', {quiet:true});
    return doc;
  }
  const startQueued = async jobId => { const r = reels.find(x => x.jobId === jobId && x.auto && x.status === 'queued'); if (r && !starting) await startSession(r, 'pack', {quiet:true}); return r || null; };
  // ---- Phase 8b actions: add takes, match one with a tap, Build, music picks, Finish, Copy --------------------------
  // wid: pasted in that winner's take slot, so the one file it adds (or a take already here) is matched to it at once.
  async function addTakes(r, wid = null) {
    if (!editTakes(r)) return;
    const text = wid ? slotText[wid] || '' : takeText, field = wid ? 'rl-slot-link-'+wid : 'rl-take-link', warn = list => { if (wid) slotWarn = {...slotWarn, [wid]:list}; else takeWarn = list; };
    const parts = text.split(/[\s,]+/).filter(Boolean), out = [], links = [...(r.takeLinks || [])], folders = [...(r.takeFolders || [])], at = new Date().toISOString(), pool = takePool(r);
    if (!parts.length) { warn(['Paste the Drive link of a phone take'+(wid ? '.' : ', or of the folder your takes are in.')]); render(); document.getElementById(field)?.focus(); return; }
    if (wid && parts.length > 1) { warn(['Paste one link here: the take for this reel.']); render(); document.getElementById(field)?.focus(); return; }
    const left = []; let hit = null;
    for (const u of parts) {
      const p = parse(u);
      if (p.kind === 'file') {
        const t = {driveId:p.id, url:u, from:'link', ...(known(r, p.id) || {})}, v = verdict(r, t);
        if (mainIds(r).has(p.id)) { out.push('That is the YouTube recording, not a phone take. Reels are never cut from it.'); left.push(u); }
        else if (pool.some(x => x.driveId === p.id) || links.some(x => x.driveId === p.id)) { if (wid) hit = p.id; else out.push('That take is already here.'); }
        else if (!v.ok) { out.push(v.why); left.push(u); }
        else if (links.length >= 10) { out.push('Up to 10 take links. Remove one first.'); left.push(u); }
        else { links.push({driveId:p.id, url:u, at}); hit = p.id; }
      } else if (p.kind === 'folder' && p.folderId) {
        if (wid) { out.push('That is a folder. Paste it under Your phone takes below: Claude Code lists it first, then you match each take.'); left.push(u); }
        else if (folders.some(f => f.folderId === p.folderId)) out.push('That folder is already here.');
        else folders.push({folderId:p.folderId, url:u, at});
      } else { out.push(p.kind === 'doc' ? 'That is a Google Docs, Sheets or Slides link, not a video.' : p.kind === 'folder' ? 'That is not a shared Drive folder link. Open the folder in Drive, choose Share, Copy link, and paste that.' : 'That isn’t a Google Drive link.'); left.push(u); }
    }
    warn([...new Set(out)]);
    const changed = links.length !== (r.takeLinks || []).length || folders.length !== (r.takeFolders || []).length;
    if (changed && !(await save(r, {takeLinks:links, takeFolders:folders}))) return;
    if (wid) { slotText = {...slotText, [wid]:left.join(' ')}; if (hit && !out.length) { await matchTake(r, wid, hit); return; } render(); document.getElementById(field)?.focus(); return; }
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
    try { await navigator.clipboard.writeText(text); copiedKey = key; M.stamp('on:'+key); } catch { note = 'Copy was blocked by the browser. Select the text and copy it instead.'; }
    render(); const k = key; setTimeout(() => { if (copiedKey === k) { copiedKey = ''; M.stamp('off:'+k); render(); } }, 1800);
  }
  async function clickLater(b, r) {
    const d = b.dataset;
    if (b.id === 'rl-take-add') { await addTakes(r); return true; }
    if (d.rlSlotadd !== undefined) { await addTakes(r, d.rlSlotadd); return true; }
    if (d.rlMatch !== undefined) { await matchTake(r, d.rlMatch, d.take); return true; }
    if (d.rlUnmatch !== undefined) { if (!editTakes(r)) return true; matchNote = null; const wid = d.rlUnmatch; if (await save(r, {recordings:matched(r).filter(x => x.winnerId !== wid)})) { render(); root.querySelector('[data-rl-match="'+CSS.escape(wid)+'"]')?.focus(); } return true; }
    if (d.rlRemove !== undefined) { if (!editTakes(r) || matched(r).some(x => x.driveId === d.rlRemove)) return true; if (await save(r, {takeLinks:(r.takeLinks || []).filter(x => x.driveId !== d.rlRemove)})) { render(); document.getElementById('rl-take-link')?.focus(); } return true; }
    if (d.rlRemoveFolder !== undefined) { if (!editTakes(r)) return true; if (await save(r, {takeFolders:(r.takeFolders || []).filter(x => x.folderId !== d.rlRemoveFolder)})) { render(); document.getElementById('rl-take-link')?.focus(); } return true; }
    if (d.rlScript !== undefined) { const w = winnersOf(r), k = w.findIndex(x => x.i.id === d.rlScript); if (k >= 0) await copyText('script:'+d.rlScript, scriptText(w[k].i, k, r)); return true; }
    if (d.rlPscript !== undefined) { const ideas = ideasOf(r), k = ideas.findIndex(x => x.id === d.rlPscript); if (k >= 0 && packOk(r)) await copyText('pscript:'+d.rlPscript, sayText(r, ideas[k], 'Reel '+(k+1)+' of '+ideas.length+': '+(ideas[k].name || ''))); return true; }
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
      if (e.target.dataset?.rlSlotlink !== undefined) { slotText = {...slotText, [e.target.dataset.rlSlotlink]:e.target.value}; return; }
    });
    el.addEventListener('change', e => {
      if (!isReels()) return;
      if (e.target.name === 'rl-from') { from = e.target.value; if (from !== 'link') titleTouched = false; else if (!titleTouched) title = ''; render(); root.querySelector('input[name="rl-from"]:checked')?.focus(); return; }
      const tk = e.target.dataset?.rlTrack ?? e.target.dataset?.rlOther;
      if (tk !== undefined) { const r = current(); if (!r || !editMusic(r)) { render(); return; } const v = e.target.value; if (!v) return;
        const fid = e.target.id; pickMusic(r, tk, v).then(() => document.getElementById(fid)?.focus()); return; }
      const om = e.target.dataset?.rlOmusic; if (om !== undefined) { const r = current(); if (!r || !keepOpen(r)) { render(); return; } ensureKeep(r); if (!kd.keep.has(om)) { render(); return; } kd.music[om] = e.target.checked; render(); root.querySelector('[data-rl-omusic="'+CSS.escape(om)+'"]')?.focus(); return; }
      const m = e.target.dataset?.rlMusic; if (m !== undefined) { const r = current(); if (!r || locked(r)) { render(); return; } draft.music[m] = e.target.checked; render(); root.querySelector('[data-rl-music="'+CSS.escape(m)+'"]')?.focus(); }
    });
    el.addEventListener('keydown', e => {
      if (isReels() && e.key === 'Enter' && e.target.id === 'rl-take-link') { e.preventDefault(); const r = current(); if (r) addTakes(r); return; }
      if (isReels() && e.key === 'Enter' && e.target.dataset?.rlSlotlink !== undefined) { e.preventDefault(); const r = current(); if (r) addTakes(r, e.target.dataset.rlSlotlink); return; }
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
        else { draft.picked.push(id); refused = ''; M.stamp('on:pick:'+id); }
        render(); root.querySelector('[data-rl-pick="'+CSS.escape(id)+'"]')?.focus(); return;
      }
      if (b.id === 'rl-generate') { const sig = reuseSig(); if (sig && reuseOk !== sig) { reuseSeen = sig; render(); root.querySelector('#rl-reuse')?.focus(); return; } b.disabled = true; await generate(); return; }
      if (b.id === 'rl-fresh') { const seen = earlier().map(x => x.url || 'reels/'+x.id); reuseOk = reuseSig(); b.disabled = true; await generate({existingSeen:seen}); return; }
      if (!r) return;
      if (b.id === 'rl-start' || b.id === 'rl-again') { if (starting) return; await startSession(r); return; }
      if (b.id === 'rl-retry') { if (starting) return; await startSession(r, stepFor(r), {extra:retryStep ? retryExtra : null}); return; }
      // Path B: keep a reel option (one tap, any number), then Finish saves the keeps with the session it starts.
      if (b.dataset.rlKeep !== undefined) {
        if (!keepOpen(r)) return; ensureKeep(r); const id = b.dataset.rlKeep;
        if (kd.keep.has(id)) { kd.keep.delete(id); kd.music[id] = false; } else { if (optsOf(r).find(o => o.id === id)?.split?.pass === false) return; kd.keep.add(id); M.stamp('on:pick:'+id); }
        keepNote = ''; render(); root.querySelector('[data-rl-keep="'+CSS.escape(id)+'"]')?.focus(); return;
      }
      if (b.id === 'rl-keep-go') {
        if (!keepOpen(r) || !optionsOk(r)) return; ensureKeep(r);
        if (!kd.keep.size) { keepNote = 'Keep one or more reels first.'; render(); return; }
        const at = new Date().toISOString(), keep = Object.fromEntries([...kd.keep].map(id => [id, {music:!!kd.music[id], at}]));
        await startSession(r, 'options', {extra:{keep, keepSavedAt:at}}); return;
      }
      if (b.id === 'rl-music-retry') { if (starting || r.status !== 'music') return; await startSession(r, 'music'); return; }
      if (b.id === 'rl-start-fresh' && r.status === 'found') { if (await save(r, {skipExisting:true})) await startSession(r); return; }
      if (b.id === 'rl-stop') { const st = [...(r.stages || [])].reverse().find(x => x.state === 'run')?.name || null; await save(r, {status:'failed', error:'Stopped by Taylor', failedStage:st, stoppedAt:new Date().toISOString()}); render(); return; }
      if (b.id === 'rl-copy') { try { await navigator.clipboard.writeText(lineFor(r.id, stepFor(r))); copied = true; M.stamp('on:rl-line'); } catch { note = 'Copy was blocked by the browser. Select the line and copy it instead.'; } render(); setTimeout(() => { if (copied) M.stamp('off:rl-line'); copied = false; render(); }, 1800); return; }
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
  function statusOf(r) {
    if (!r) return null;
    const at = isB(r) ? stepOfB(r) : r.status === 'failed' ? stepOfSession(r) : STEP_OF[r.status] ?? 1;
    return {id:r.id, path:r.path ?? null, status:r.status || null, label:statusWord(r), wait:waitWord(r), step:at + 1, stepName:STEPS_OF(r)[at] || null, updatedAt:r.updatedAt || null, href:'#/publish/reels/'+encodeURIComponent(r.id)};
  }
  // When a reel job changes while Taylor is on the Video lane, tell it: "ww:reels" carries every job's status, and the
  // Video lane, which re-renders on "ww:settings" (keeping a field being typed in), redraws its reels line from WWReels.
  let reelSig = '';
  function announce() {
    const sig = reels.map(r => r.id+':'+r.status+':'+(r.updatedAt || '')).join('|'); if (sig === reelSig) return; reelSig = sig;
    window.dispatchEvent(new CustomEvent('ww:reels', {detail:{reels:reels.map(statusOf)}}));
    if (/^#\/publish(\/|$)/.test(location.hash) && !isReels()) window.dispatchEvent(new CustomEvent('ww:settings'));
  }
  function routeTo(bits) {
    // #/publish/reels, #/publish/reels/<id>, #/publish/reels/<id>/reel/<ideaId>
    const id = bits[2] || null;
    if (id !== openId) { openId = id; note = ''; retry = false; retryStep = null; retryExtra = null; draftFor = null; kdFor = null; keepNote = ''; sel = null; takeText = ''; takeWarn = []; slotText = {}; slotWarn = {}; matchNote = null; copiedKey = ''; }
    if (bits[3] === 'reel' && bits[4]) sel = bits[4];
  }
  async function load() {
    try { await window.WWStore?.connect(); db = window.WWStore?.db?.() || null; } catch { db = null; }
    connecting = false;
    const live = () => { if (!root?.hidden && isReels() && !typing()) render(); else if (isReels() && !openId) refreshCheck(); };
    if (db) {
      db.collection('reels').onSnapshot(snap => { reels = snap.docs.filter(d => d.exists).map(d => ({...d.data(), id:d.id})).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))); live(); announce(); }, () => {});
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
    all: () => reels.slice(),
    // The live words for a reel job, with how long its running stage usually takes ("… · usually about 1 h").
    label: r => { const w = waitWord(r); return statusWord(r)+(w ? ' · '+w : ''); },
    // The reel job's live status for the Video lane (7 November 2026): read from the live reels/<id> snapshot, so it moves
    // on as the session writes. {id, path, status, label, wait, step, stepName, updatedAt, href}, or null.
    status: jobId => statusOf(reels.find(r => r.jobId === jobId) || null),
    statusOf: r => statusOf(r),
    // Decision 11: the path a Video job's files decide ({path: "A" | "B" | null, takes, why}), and decision 10: the
    // Path B reel job made by Confirm and continue, and its start once a refused Video session is started again.
    choosePath, autoFromJob, startQueued,
    // The title, prompt and status the Reels lane uses to start a step, for autopilot's hand-off (autopilot.js).
    sessionArgs: (r, step = 'pack') => ({title:(step === 'options' ? 'Reels finish: ' : 'Reels: ')+(r.title || r.id), prompt:prompt(r, step)+(window.WWAutopilot?.promptLine?.(r) || ''), line:lineFor(r.id, step), status:NEXT[step]}),
    readyCtx: r => readyCtx(r),  // Ready to post: outputs.js
    pathWhy: r => pathWhy(r)
  };
  phone.addEventListener('change', () => { if (isReels()) render(); });
  setInterval(() => { const r = current(); if (root && !root.hidden && isReels() && r && ['starting','running','building','finishing'].includes(r.status) && !typing()) render(); }, 15000);
  window.addEventListener('ww:data', () => { if (isReels() && !typing()) render(); });
  window.addEventListener('ww:settings', () => { if (isReels() && !typing()) render(); });
  window.addEventListener('ww:posting', () => { if (isReels() && !typing()) render(); });
  load();
})();
