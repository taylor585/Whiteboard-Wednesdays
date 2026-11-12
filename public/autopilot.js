/* Autopilot (Taylor, 10 November 2026): "I really want to be able to post just two Google drive links ... and have all the
   videos come out the other end fully edited", and "Claude will make every creative pick itself ... so nothing waits on you".
   The rules, fields and how sessions chain are in PUBLISH.md "Autopilot". This module is the app's side of it, kept out of
   publish.js, reels.js and settings.js, which only call it through window.WWAutopilot:
   - the switch on the new-video screen ("Hands-off: Claude makes the picks"), on by default, and its defaults in Settings
     (settings/autopilot: on, the buyer when the topic has none, music on or off);
   - on a job or reel job with autopilot on: which step is running, the time so far against the usual, every automatic pick
     with its reason, a Change this pick link that stops the job at that step and reopens its usual screen, and the plain
     message of an allowed stop (autopilot.needsYou);
   - the hand-off when a session could not start the next step itself (autopilot.next with no sessionId): while Publish is
     open the page starts it, once, after a claim it reads back; the hourly watchdog does the same when it is closed.
   Nothing here animates: the panel is drawn finished on every redraw (motion's play-once rule). Nothing here posts. */
(() => {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const DEFAULTS = {on:true, buyer:'A', music:true};
  const BUYER = {A:'A · wants AI built', B:'B · buys paid ads'};
  const ENV = 'env_017PLHsTGZVgThRnUnu1eoGG', REPO = 'https://github.com/taylor585/Whiteboard-Wednesdays', CCR = 'Claude Code Remote';
  let saved = {...DEFAULTS, updatedAt:null}, draft = null, ref = null, db = null, loaded = false, setMsg = '', busy = false;
  let intakeOn = null;              // the switch on the new-video screen: null follows Settings until Taylor flips it
  let jobs = [], reels = [];
  const on = d => d?.autopilot?.on === true;
  const now = () => new Date().toISOString();
  const mins = (a, b = Date.now()) => { const t = Date.parse(a); return isFinite(t) ? Math.max(0, Math.round((b - t) / 60000)) : null; };
  const dur = m => m == null ? '' : m < 60 ? m+' min' : Math.floor(m / 60)+' h'+(m % 60 ? ' '+(m % 60)+' min' : '');
  // How long each leg usually takes (PUBLISH.md "Autopilot", "How the steps chain").
  const USUAL = {job:{pack:180, finals:210, review:45, thumbs:15, pilot:200}, reel:{pack:{A:30, B:135}, recordings:135, options:75, music:75}};
  const usual = (d, kind) => kind === 'reel' ? (d.session?.step === 'pack' || !d.session?.step ? USUAL.reel.pack[d.path === 'B' ? 'B' : 'A'] : USUAL.reel[d.session.step]) : USUAL.job[d.session?.step || 'pack'];
  const DOING = {job:{pack:'Checking the files and making the Variety Pack, then approving its designs', finals:'Building and checking the pilot, then rendering and checking the YouTube master and the LinkedIn cut', pilot:'Rendering and checking the YouTube master and the LinkedIn cut', review:'Making the thumbnails and the posts, then picking and polishing them', thumbs:'Polishing the thumbnail'},
    reel:{pack:{A:'Writing six reel scripts and picking two winners', B:'Cutting split-screen reel options from your phone take, keeping the best two and finishing them'}, recordings:'Building your split-screen reels from your takes, then the music and the finish', options:'Finishing the reels it kept', music:'Adding the music and finishing your reels'}};
  const doing = (d, kind) => kind === 'reel' ? (d.session?.step === 'pack' || !d.session?.step ? DOING.reel.pack[d.path === 'B' ? 'B' : 'A'] : DOING.reel[d.session.step]) : DOING.job[d.session?.step || 'pack'];
  const WORKING = ['starting','running','finishing','building'];
  // The picks in the order they happen, with the stop each one reopens (PUBLISH.md "Change this pick").
  const KINDS = {
    job:[['files','The files and the title'], ['earlier','Earlier work'], ['variety','Variety Pack designs'], ['pilot','The pilot'], ['review','YouTube master and LinkedIn cut'], ['buyer','Who it is for'], ['thumbs','Thumbnail'], ['posts','Posts and Ready to post']],
    reel:[['winners','Reel winners'], ['keep','Reels kept'], ['music','Music']]};
  const NEEDS = {files:'Claude could not tell your files apart', qa:'A check still fails after two automatic fixes', booking:'Your booking link is not saved', takes:'Waiting for your phone takes'};

  // ---- What Change this pick writes: the stop it reopens, only when that stop can still be shown -----------------------
  function reopen(kind, d, col) {
    const a = {...(d.autopilot || {}), on:false, stoppedAt:now(), stoppedFor:kind, stoppedBy:'taylor', next:null, needsYou:null};
    if (col === 'reels') {
      if (kind === 'keep' && d.options) return {autopilot:a, status:'options', keepSavedAt:null};
      if (kind === 'winners' && d.pack && !(d.recordings || []).length) return {autopilot:a, status:'pack', winnersSavedAt:null};
      if (kind === 'music' && (d.built || []).length) return {autopilot:a, status:'music'};
      return null;
    }
    const ap = {...(d.approvals || {})};
    if (kind === 'files' && (d.sources || []).length) return {autopilot:a, status:'check', checkedAt:null};
    if (kind === 'earlier' && (d.existing || []).some(x => x?.url)) return {autopilot:a, status:'found', packUrl:null, reusedFrom:null};
    // The pack is reopened only before the thumbnails and posts exist: after that the Continue from the pack has nothing to redo.
    if (kind === 'variety' && d.packUrl && !(d.pack?.platforms || []).length) return {autopilot:a, status:'pack'};
    if (kind === 'pilot' && (d.pilot?.url || d.reviewUrl)) { ap.pilot = null; return {autopilot:a, status:'pilot', approvals:ap}; }
    if ((kind === 'review' || kind === 'buyer') && (d.cuts?.url || d.reviewUrl)) { ap.review = null; return {autopilot:a, status:'review', approvals:ap}; }
    if (kind === 'thumbs' && d.pack?.thumbRound) return {autopilot:a, status:'thumbs'};
    if (kind === 'posts' && (d.pack?.platforms || []).length) return {autopilot:a, status:'posts', readyAt:null};
    return null;
  }

  // ---- The panel on a job or reel job ----------------------------------------------------------------------------------
  const picksOf = (d, kind) => KINDS[kind].map(([k, label]) => ({k, label, p:d.autoPicks?.[k]})).filter(x => x.p && x.p.by === 'claude');
  const evLine = e => { if (!e || typeof e !== 'object') return typeof e === 'string' ? e : '';
    return Object.entries(e).filter(([, v]) => v != null && v !== '' && (typeof v !== 'object' || Array.isArray(v))).slice(0, 4).map(([k, v]) => k+': '+(Array.isArray(v) ? v.join(', ') : v)).join(' · '); };
  function panel(d, kind) {
    if (!d) return '';
    const list = picksOf(d, kind), live = on(d), off = d.autopilot && d.autopilot.on === false && d.autopilot.stoppedFor;
    if (!live && !list.length) return '';
    const col = kind === 'reel' ? 'reels' : 'jobs', st = d.status, nd = live && d.autopilot?.needsYou;
    const work = live && WORKING.includes(st), so = mins(d.session?.startedAt || d.session?.requestedAt), u = usual(d, kind);
    const head = '<div class="ap-head"><h2 id="ap-h-'+esc(d.id)+'">Hands-off</h2><span class="micro">'+(live ? 'Claude makes the picks' : 'turned off for this '+(kind === 'reel' ? 'reel job' : 'video'))+'</span></div>';
    const lines = [];
    if (nd) lines.push('<div class="pb-warn ap-needs" role="alert" data-needs="'+esc(nd.reason)+'"><p><b>'+esc(NEEDS[nd.reason] || 'Claude needs you')+'.</b> '+esc(nd.note || '')+'</p></div>');
    else if (work) lines.push('<p class="ap-now" role="status"><b>Now:</b> '+esc(doing(d, kind) || 'Working on the next step')+'. <span class="ap-time">'+(so != null ? esc(dur(so))+' so far' : 'Just started')+(u ? ', usually about '+esc(dur(u)) : '')+'.</span></p>');
    else if (live && d.autopilot?.next && !d.autopilot.next.sessionId) lines.push('<p class="ap-now" role="status"><b>Next:</b> starting '+esc(d.autopilot.next.line || 'the next step')+'. '+(starter ? 'Starting it now…' : 'It starts by itself in a few minutes.')+'</p>');
    else if (live && st === 'final') lines.push('<p class="ap-now">Every pick below was Claude’s, with its reason. Change any of them and that step opens for you.</p>');
    if (off) lines.push('<p class="pb-muted ap-off">You changed '+esc((KINDS[kind].find(x => x[0] === d.autopilot.stoppedFor) || [0, 'a pick'])[1].toLowerCase())+(d.autopilot.stoppedAt ? ' on '+esc(new Intl.DateTimeFormat('en-GB', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}).format(new Date(d.autopilot.stoppedAt))) : '')+', so this '+(kind === 'reel' ? 'reel job' : 'video')+' waits for you at every step now.</p>');
    const items = list.map(({k, label, p}) => { const can = live && !!reopen(k, d, col);
      return '<li class="ap-pick" data-kind="'+esc(k)+'"><div><b>'+esc(label)+'</b><span class="ap-why">'+esc(p.reason || 'Picked by Claude.')+'</span>'+(evLine(p.evidence) ? '<small>'+esc(evLine(p.evidence))+'</small>' : '')+'</div>'+
        (can ? '<button type="button" class="pb-link ap-change" id="ap-change-'+esc(k)+'" data-ap-change="'+esc(k)+'" data-ap-col="'+col+'" data-ap-id="'+esc(d.id)+'">Change this pick</button>' : '')+'</li>'; }).join('');
    return '<section class="ap" aria-labelledby="ap-h-'+esc(d.id)+'">'+head+lines.join('')+(items ? '<ol class="ap-picks" aria-label="Claude’s picks">'+items+'</ol>' : '<p class="pb-muted ap-none">No pick made yet. Each one appears here with its reason as Claude makes it.</p>')+'</section>';
  }
  function lede(d) {
    if (!on(d)) return '';
    if (d.autopilot?.needsYou) return 'Hands-off is paused: '+(NEEDS[d.autopilot.needsYou.reason] || 'Claude needs you')+'.';
    if (WORKING.includes(d.status) || d.status === 'queued') return 'Hands-off: Claude makes every pick and carries on to Ready to post by itself. You can close this tab.';
    if (d.status === 'final') return 'Ready to post, made hands-off. Every pick is listed below with its reason.';
    return '';
  }

  // ---- The switch on the new-video screen --------------------------------------------------------------------------------
  const intakeNow = () => intakeOn ?? saved.on;
  const intakeHtml = () => '<label class="pb-check ap-switch" for="ap-intake"><input type="checkbox" id="ap-intake" role="switch"'+(intakeNow() ? ' checked' : '')+' aria-describedby="ap-intake-d"> <span><b>Hands-off: Claude makes the picks</b></span></label>'+
    '<p class="pb-muted ap-intake-d" id="ap-intake-d">'+(intakeNow() ? 'Claude picks the designs, the thumbnail, the posts and the reels, and carries on to Ready to post. It stops only if it cannot tell your files apart, a check still fails after two fixes, or your booking link is not saved. Change any pick afterwards.' : 'Off: Claude stops at every step for you to pick, as before.')+'</p>';
  const newJob = () => ({autopilot:{on:!!intakeNow(), setBy:intakeOn === null ? 'app' : 'taylor', setAt:now()}});
  const forReel = j => j?.autopilot ? {autopilot:{on:!!j.autopilot.on, setBy:'app', setAt:now(), from:'jobs/'+j.id}} : {};
  const promptLine = d => on(d) ? ' This job is on autopilot (Taylor, 10 November 2026): follow PUBLISH.md "Autopilot", make every pick yourself and record it, carry on without stopping except for the reasons it allows, and start the next step\'s session yourself.' : '';
  // Answering an allowed stop (Confirm, Continue on ask, Try again, Build) starts a session: the stop's message goes with it.
  const answered = d => on(d) && d.autopilot?.needsYou ? {autopilot:{...d.autopilot, needsYou:null}} : {};

  // ---- Settings: Hands-off defaults (settings/autopilot) -------------------------------------------------------------
  const sNow = () => draft || saved;
  const sChanged = () => !!draft && ['on','buyer','music'].some(k => draft[k] !== saved[k]);
  function settingsHtml() {
    const d = sNow(), dis = ref ? '' : ' disabled';
    return '<section class="se-grp ap-set" id="ap-settings" aria-label="Hands-off"><h2>Hands-off <span class="micro">Claude makes the picks</span></h2>'+
      '<div class="ap-set-grid"><label class="pb-check ap-switch" for="ap-set-on"><input type="checkbox" id="ap-set-on" role="switch"'+(d.on ? ' checked' : '')+dis+'> <span><b>New videos start hands-off</b><small>The switch on Publish starts in this position.</small></span></label>'+
      '<label class="se-field" for="ap-set-buyer"><span>Who a video is for when its topic does not say</span><select id="ap-set-buyer"'+dis+'>'+Object.entries(BUYER).map(([v, l]) => '<option value="'+v+'"'+(d.buyer === v ? ' selected' : '')+'>'+l+'</option>').join('')+'</select></label>'+
      '<label class="pb-check ap-switch" for="ap-set-music"><input type="checkbox" id="ap-set-music" role="switch"'+(d.music ? ' checked' : '')+dis+'> <span><b>Reels get music</b><small>Claude takes the first track it proposes from your Drive music folder.</small></span></label></div>'+
      '<p class="se-note">Claude records every pick with its reason on Publish, where you can change it. It still stops for files it cannot tell apart, a check that fails after two fixes, a missing booking link, and your phone takes on reels from the YouTube recording alone.</p>'+
      '<p class="ap-set-bar"><span class="se-when" id="ap-set-st" role="status">'+esc(setMsg || (sChanged() ? 'Not saved yet' : saved.updatedAt ? 'Saved' : ref ? 'Using the defaults: hands-off, buyer A, music on' : loaded ? 'Saving needs the app’s database, which this preview does not have' : 'Loading…'))+'</span>'+
      '<button type="button" class="se-btn se-btn-sm" id="ap-set-save"'+(sChanged() && ref && !busy ? '' : ' disabled')+'>'+(busy ? 'Saving…' : 'Save hands-off')+'</button></p></section>';
  }
  const paintSettings = () => { const el = document.getElementById('ap-settings'); if (!el) return; const id = document.activeElement?.id; el.outerHTML = settingsHtml(); if (id) document.getElementById(id)?.focus({preventScroll:true}); };

  // ---- Events (delegated: the screens redraw their own markup) -------------------------------------------------------------
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'ap-intake') { intakeOn = t.checked; const d = document.getElementById('ap-intake-d'); if (d) d.outerHTML = intakeHtml().split('</label>').slice(1).join('</label>'); return; }
    if (/^ap-set-/.test(t.id)) { draft = {...sNow()}; if (t.id === 'ap-set-on') draft.on = t.checked; if (t.id === 'ap-set-music') draft.music = t.checked; if (t.id === 'ap-set-buyer' && BUYER[t.value]) draft.buyer = t.value; setMsg = ''; paintSettings(); }
  });
  document.addEventListener('click', async e => {
    const b = e.target.closest?.('button'); if (!b || b.disabled) return;
    if (b.id === 'ap-set-save' && ref && sChanged()) {
      busy = true; paintSettings();
      try { const v = {on:!!draft.on, buyer:draft.buyer, music:!!draft.music, updatedAt:now()}; await ref.set(v); saved = v; draft = null; setMsg = 'Saved'; intakeOn = null; window.dispatchEvent(new CustomEvent('ww:settings')); }
      catch { setMsg = 'Could not save. Try again.'; }
      busy = false; paintSettings(); return;
    }
    if (b.dataset.apChange) {
      const col = b.dataset.apCol, id = b.dataset.apId, kind = b.dataset.apChange, d = (col === 'reels' ? reels : jobs).find(x => x.id === id) || null;
      const patch = d && reopen(kind, d, col); if (!patch || !db) return;
      b.disabled = true; b.textContent = 'Opening…';
      try { await db.doc(col+'/'+id).update({...patch, updatedAt:now()}); } catch { b.disabled = false; b.textContent = 'Change this pick'; }
    }
  });

  // ---- The hand-off when the session could not start the next one (PUBLISH.md "The hand-off", "The app") -------------
  let starter = null, timer = null;
  const GRACE = 3 * 60000, CLAIM = 10 * 60000;
  const due = d => { const n = on(d) && d.autopilot?.next; if (!n || n.sessionId || !n.step) return false;
    if (Date.now() - Date.parse(n.at || 0) < GRACE) return false; return !(n.claimedAt && Date.now() - Date.parse(n.claimedAt) < CLAIM); };
  async function allowed(mcp) {
    // Never pop a permission question by itself (31 October 2026: a prompt froze the desktop app): only when already allowed.
    const perms = await Promise.resolve(window.claude?.use?.('permissions')).catch(() => null);
    const ps = perms?.state ? await perms.state('mcp:'+CCR).catch(() => 'unavailable') : null;
    return !!mcp && ps !== 'denied' && ps !== 'prompt';
  }
  async function handOff(col, d) {
    const args = col === 'reels' ? window.WWReels?.sessionArgs?.(d, d.autopilot.next.step) : window.WWPublish?.sessionArgs?.(d.autopilot.next.step, d);
    if (!args) return;
    const mcp = await window.claude?.use?.('mcp').catch?.(() => null); if (!(await allowed(mcp))) return;
    const claim = Math.random().toString(36).slice(2, 10), docRef = db.doc(col+'/'+d.id);
    starter = col+'/'+d.id;
    try {
      await docRef.update({autopilot:{...d.autopilot, next:{...d.autopilot.next, claimedBy:'app', claimedAt:now(), claim}}});
      await new Promise(r => setTimeout(r, 1500));
      const again = (await docRef.get()).data();
      if (again?.autopilot?.next?.claim !== claim || again.autopilot.next.sessionId || !on(again)) return;
      const requestedAt = now();
      const r = await (window.WWStore?.createSession || ((m, a) => m.callTool('Claude Code Remote', 'create_session', a)))(mcp, {model:'claude-opus-5-5', permission_mode:'auto', environment_id:ENV, source_url:REPO, title:args.title, prompt:args.prompt});
      const p = r?.payload || {}, sid = p.ccr?.id || p.session_id || p.id || p.session?.id || null;
      if (!sid) return;
      await docRef.update({session:{id:sid, url:'https://claude.ai/code/'+sid, step:again.autopilot.next.step, requestedAt, startedAt:now()}, status:args.status,
        autopilot:{...again.autopilot, next:{...again.autopilot.next, sessionId:sid, by:'app'}}, updatedAt:now()});
    } catch {} finally { starter = null; }
  }
  async function reelFromJob(j) {
    // Leg 1 makes the reel job itself; when it could not, the open page does (PUBLISH.md "The reel job from leg 1").
    if (!window.WWReels?.autoFromJob || window.WWReels.forJob(j.id)) return;
    const pc = window.WWReels.choosePath(j.sources); if (!['A','B'].includes(pc.path)) return;
    starter = 'reel-of/'+j.id; try { await window.WWReels.autoFromJob(j, true); } catch {} finally { starter = null; }
  }
  async function tick() {
    if (!db || starter || document.hidden) return;
    for (const [col, list] of [['jobs', jobs], ['reels', reels]]) for (const d of list) if (due(d)) { await handOff(col, d); return; }
    for (const j of jobs) if (on(j) && j.checkedBy === 'claude' && Date.now() - Date.parse(j.checkedAt || 0) > GRACE && window.WWReels?.forJob && !window.WWReels.forJob(j.id) && !['check','failed'].includes(j.status)) { await reelFromJob(j); return; }
  }

  async function load() {
    try { await window.WWStore?.connect(); db = window.WWStore?.db?.() || null; } catch { db = null; }
    if (db) {
      try { ref = db.doc('settings/autopilot'); const d = (await ref.get()).data(); if (d) saved = {on:d.on !== false, buyer:BUYER[d.buyer] ? d.buyer : DEFAULTS.buyer, music:d.music !== false, updatedAt:d.updatedAt || null}; } catch { ref = null; }
      db.collection('jobs').onSnapshot(s => { jobs = s.docs.filter(x => x.exists).map(x => ({...x.data(), id:x.id})); setTimeout(tick, 0); }, () => {});
      db.collection('reels').onSnapshot(s => { reels = s.docs.filter(x => x.exists).map(x => ({...x.data(), id:x.id})); setTimeout(tick, 0); }, () => {});
      timer = setInterval(tick, 30000);
    }
    loaded = true; paintSettings();
    const box = document.getElementById('ap-intake'); if (box && box.checked !== !!intakeNow()) box.checked = !!intakeNow();
    window.dispatchEvent(new CustomEvent('ww:settings'));
  }
  window.WWAutopilot = {
    on, newJob, forReel, promptLine, answered, intakeHtml, settingsHtml, lede, reopen,
    jobHtml: j => panel(j, 'job'), reelHtml: r => panel(r, 'reel'),
    get settings() { return {...saved}; }, tick
  };
  load();
})();
