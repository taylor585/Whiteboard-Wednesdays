/* Posting on the page (Taylor, 10 November 2026: "a finished video posts by itself on its posting day and time, and I can
   hold it or change a pick before then"). Once a video job is Ready to post this draws its posting block: the posting day
   and time, one row per platform (Scheduled · Posting · Posted with its link · Skipped: not connected · Off · Needs a look),
   Hold and Release, Post now, a switch per platform that starts from Posting settings, and Change a pick. The Schedule's
   posting cards and the Reels lane read the same rows. The page never posts: Post now starts a posting session through the
   Claude Code Remote connector (the same create_session call Publish uses), and that session follows POSTING.md.
   The rules themselves are public/posting-core.js, shared with the session. */
(() => {
  'use strict';
  const C = window.WWPostingCore; if (!C) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ENV = 'env_017PLHsTGZVgThRnUnu1eoGG', REPO = 'https://github.com/taylor585/Whiteboard-Wednesdays';
  const RUN_FRESH_MS = 20 * 60e3;  // a Post now press this recent, with no end written yet, is still running
  let db = null, jobs = [], reels = [], starting = null, confirming = null, note = {}, syncing = new Set();
  const store = () => window.WWStore?.posting || null;
  const settings = () => store()?.settings || {days:['tue','thu'], time:'15:00', mode:'manual', platforms:{youtube:true, linkedin:true, instagram:true, facebook:true, x:false}};
  // Read on every draw: today a frozen object of false, later a live one from the Connections screen.
  const connected = () => { const c = store()?.CONNECTED; return c && typeof c === 'object' ? c : {}; };
  // Auto is live once it is chosen, a switched-on platform is connected, and the daily poster is running. The poster runs
  // as a scheduled task the main session creates once accounts are connected (POSTING.md); it then writes
  // settings/poster {daily: true}, which this file reads and hands to WWStore.posting.posterLive. Until then Auto is an intent.
  const anyConnected = () => { const s = settings(); return C.ORDER.some(k => s.platforms?.[k] && C.isConnected(connected(), k)); };
  const posterOn = () => store()?.posterLive === true;
  const live = () => settings().mode === 'auto' && anyConnected() && posterOn();
  const now = () => new Date().toISOString();
  const allJobs = () => jobs;
  const reelFor = j => (window.WWReels?.forJob?.(j.id)) || reels.find(r => r.jobId === j.id && r.status !== 'failed') || null;
  const httpsUrl = u => { try { const x = new URL(String(u || '').trim()); return x.protocol === 'https:' ? x.href : null; } catch { return null; } };
  const dayWord = d => { const x = new Date(String(d)+'T12:00:00Z'); return isNaN(x) ? String(d || '') : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][x.getUTCDay()]+' '+x.getUTCDate()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][x.getUTCMonth()]; };
  const when = iso => iso ? new Intl.DateTimeFormat('en-GB', {weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit', timeZone:C.TZ}).format(new Date(iso)) : '';

  // ---- The schedule ----------------------------------------------------------------------------------------------------
  let api = null;
  const topicsList = () => api?.topics || window.WWIdeas?.data?.topics || [];
  const planDay = j => { if (!j?.topicId || !store()) return null; try { return store().dates(topicsList()).get(j.topicId) || null; } catch { return null; } };
  const computed = j => C.scheduleFor(planDay(j), settings(), now());
  // What a press of Ready to post saves with the job (publish.js hook): the day and time, worked out once.
  const scheduleFields = j => ({schedule:{...computed(j), by:'app', setAt:now()}});
  const scheduleOf = j => j?.schedule?.day ? j.schedule : computed(j);
  // A job marked Ready to post before automatic posting existed may already be posted by hand: it is never given a schedule
  // by itself (so the daily run can never post it twice). Post now still works on it, as Taylor's own choice.
  const ENGINE_FROM = '2026-11-11T00:00:00Z';
  const legacy = j => !j?.schedule?.day && Boolean(j?.readyAt) && j.readyAt < ENGINE_FROM;
  const anyOut = j => { const r = reelFor(j); return [...Object.values(j?.posting || {}), ...Object.values(r?.posting || {})].some(e => e && (e.state === 'posting' || e.state === 'posted')); };
  // Keep the saved schedule in step with Posting settings and the topic's day until anything has gone out. Taylor's own day
  // (by 'taylor') is never moved. Written from data changes only, never from a draw.
  async function sync() {
    if (!db) return;
    for (const j of jobs) {
      if (j.status !== 'final' || legacy(j) || anyOut(j) || j.schedule?.by === 'taylor' || syncing.has(j.id)) continue;
      const s = j.schedule, want = computed(j);
      const stale = !s?.day || (Date.parse(s.at) > Date.now() && (s.time !== want.time || (s.planned || null) !== (want.planned || null) || (!want.late && s.day !== want.day)));
      if (!stale) continue;
      syncing.add(j.id);
      try { await db.doc('jobs/'+j.id).update({schedule:{...want, by:'app', setAt:now()}, updatedAt:now()}); } catch { /* shown as computed; tried again on the next change */ }
      setTimeout(() => syncing.delete(j.id), 4000);
    }
  }

  // ---- Rows ----------------------------------------------------------------------------------------------------------
  const rowsOf = (j, r) => C.rows(j, r === undefined ? reelFor(j) : r, {settings:settings(), connected:connected(), now:now()});
  const runOpen = j => { const p = j?.postingRun; return Boolean(p?.requestedAt && !p.endedAt && Date.now() - Date.parse(p.requestedAt) < RUN_FRESH_MS); };
  const pending = rs => rs.filter(x => x.on && x.connected && ['scheduled', 'partial', 'retry'].includes(x.state));
  const MARK = {posted:'◆ ', look:'◆ ', skipped:'', off:'', scheduled:'', posting:'', partial:'', retry:'◆ ', held:'', waiting:'', none:''};
  const linkWord = (k, i, n) => (k === 'instagram' || k === 'facebook') ? (n > 2 ? 'Open post '+(i+1) : i ? 'Open the 4:5 post' : 'Open the reel') : k === 'x' ? 'Open on X' : 'Open on '+C.LABEL[k];
  function rowHtml(j, x, {controls = true} = {}) {
    const locked = ['posting', 'posted', 'partial'].includes(x.state);
    const links = x.urls.map(httpsUrl).filter(Boolean).map((u, i, a) => '<a class="wp-link" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+esc(linkWord(x.key, i, a.length))+' ↗</a>').join('');
    const why = x.why && ['look', 'retry'].includes(x.state) ? '<small class="wp-why">'+esc(x.why)+'</small>' : '';
    const sw = controls ? '<button type="button" class="wp-sw" role="switch" aria-checked="'+x.on+'" data-wp="toggle" data-job="'+esc(j.id)+'" data-k="'+x.key+'" id="wp-sw-'+esc(j.id)+'-'+x.key+'" aria-label="Post to '+esc(x.label)+' for this video"'+(locked || starting ? ' disabled' : '')+'>'+(x.on ? 'On' : 'Off')+'</button>' : '';
    const check = controls && x.state === 'look' && ['youtube', 'linkedin', 'x'].includes(x.key) && j.posting?.[x.key]?.state === 'check'
      ? '<span class="wp-checkacts"><button type="button" class="wp-btn" data-wp="clear-yes" data-job="'+esc(j.id)+'" data-k="'+x.key+'" id="wp-cy-'+esc(j.id)+'-'+x.key+'">It is posted</button><button type="button" class="wp-btn" data-wp="clear-no" data-job="'+esc(j.id)+'" data-k="'+x.key+'" id="wp-cn-'+esc(j.id)+'-'+x.key+'">It isn’t: try again</button></span>' : '';
    return '<li class="wp-row is-'+x.state+'" data-platform="'+x.key+'" data-state="'+x.state+'"><span class="wp-pf">'+esc(x.label)+'</span><span class="wp-st">'+MARK[x.state]+esc(x.text)+why+'</span><span class="wp-out">'+links+check+'</span>'+sw+'</li>';
  }
  // The sentence under the heading: when it goes out, and how.
  function whenLine(j, rs) {
    const s = scheduleOf(j), at = s.day ? dayWord(s.day)+', '+s.time+' (UK time)' : '';
    if (j.hold?.on) return 'On hold: nothing posts until you release it.';
    if (legacy(j) && !rs.some(x => x.state === 'posted' || x.state === 'posting')) return 'Marked ready before automatic posting began, so it never posts by itself. If you already posted it by hand, leave it; if not, press Post now.';
    const ons = rs.filter(x => x.on), done = ons.length && ons.every(x => x.state === 'posted');
    if (done) return 'Posted. Every switched-on platform has its link below.';
    if (runOpen(j)) return 'Posting now: Claude Code is posting it, platform by platform. This page shows each link as it goes out.';
    const passed = s.at && Date.parse(s.at) <= Date.now();
    const late = s.late && s.planned ? ' It was ready after its planned day ('+dayWord(s.planned)+'), so it moved to the next posting day.' : '';
    const mode = store()?.mode === 'auto' ? 'auto' : 'manual';
    if (live()) return (passed ? 'Its posting time ('+at+') has come: it posts on the next run, or press Post now.' : 'Posts by itself on '+at+'. Hold it or change a pick before then.')+late;
    if (mode === 'auto') return (anyConnected() ? 'Auto posting is chosen, but the daily poster is not running yet, so press Post now on the day: ' : 'Auto posting is chosen, but no account is connected yet, so press Post now on the day: ')+at+'.'+late;
    return (passed ? 'Manual posting: its posting day was '+at+'. Press Post now when you are ready.' : 'Manual posting: nothing goes out until you press Post now. Its posting day is '+at+'.')+late;
  }
  // ---- The posting block on a Ready to post job (replaces the old disabled Post all) ---------------------------------------
  function panel(j, {only = null} = {}) {
    if (!j) return '';
    if (j.status !== 'final') return '<div class="wp wp-later"><b>Posting</b><p class="pb-muted">Once you press Ready to post, this video gets its posting day and posts on it'+(live() ? ' by itself' : ' when you press Post now')+'. Nothing has been posted.</p></div>';
    const rs = rowsOf(j), id = esc(j.id), pend = pending(rs), busy = starting === j.id || runOpen(j);
    const can = !j.hold?.on && pend.length && !busy;
    const why = j.hold?.on ? 'Release it first.' : busy ? 'A posting session is already running for this video.' : !pend.length ? (rs.some(x => x.on && !x.connected && x.state === 'skipped') ? 'Nothing can post yet: no switched-on platform is connected. Connect accounts in Settings.' : 'Nothing is left to post.') : '';
    const names = pend.map(x => x.label), list = names.length < 2 ? names.join('') : names.slice(0, -1).join(', ')+' and '+names[names.length-1];
    const confirm = confirming === j.id && can ? '<div class="wp-confirm" role="group" aria-labelledby="wp-cq-'+id+'"><span id="wp-cq-'+id+'"><b>Post to '+esc(list)+' now?</b> It goes out publicly, in this order, as soon as Claude Code starts.</span><button type="button" class="wp-btn" data-wp="cancel" data-job="'+id+'">Not yet</button><button type="button" class="pb-go wp-go" data-wp="go" data-job="'+id+'" id="wp-go-'+id+'">Yes, post now</button></div>' : '';
    const run = j.postingRun, last = run?.note ? '<p class="pb-muted wp-last">'+esc(run.note)+(run.endedAt ? ' · '+esc(when(run.endedAt)) : '')+'</p>' : '';
    const alert = j.alert?.text ? '<div class="pb-warn wp-alert" role="status">'+esc(j.alert.text)+'</div>' : '';
    const n = note[j.id] ? '<div class="pb-warn" role="status">'+esc(note[j.id])+'</div>' : '';
    return '<section class="wp" aria-labelledby="wp-h-'+id+'"><div class="wp-head"><h3 id="wp-h-'+id+'">Posting</h3><span class="micro">'+(live() ? 'AUTO' : 'MANUAL')+(j.hold?.on ? ' · ON HOLD' : '')+'</span></div>'+
      '<p class="wp-when" id="wp-when-'+id+'">'+esc(whenLine(j, rs))+'</p>'+(only && only.length < rs.length ? '<p class="pb-muted wp-where">Each platform’s row, with its switch and its link once posted, is in its section below.</p>' : '')+alert+n+
      (only ? (only.length ? '<ul class="wp-rows" aria-label="Other platforms">'+rs.filter(x => only.includes(x.key)).map(x => rowHtml(j, x)).join('')+'</ul>' : '') : '<ul class="wp-rows" aria-label="Each platform">'+rs.map(x => rowHtml(j, x)).join('')+'</ul>')+
      '<div class="wp-acts">'+(j.hold?.on ? '<button type="button" class="pb-go wp-hold" data-wp="release" data-job="'+id+'" id="wp-hold-'+id+'">Release</button>' : '<button type="button" class="wp-btn wp-hold" data-wp="hold" data-job="'+id+'" id="wp-hold-'+id+'"'+(busy ? ' disabled' : '')+'>Hold</button>')+
        '<button type="button" class="pb-go wp-now" data-wp="now" data-job="'+id+'" id="wp-now-'+id+'" aria-describedby="wp-why-'+id+'"'+(can && confirming !== j.id ? '' : ' disabled')+'>'+(busy ? 'Posting…' : 'Post now')+'</button>'+
        '<button type="button" class="wp-btn" data-wp="picks" data-job="'+id+'" id="wp-picks-'+id+'">Change a pick</button></div>'+
      '<p class="pb-muted wp-whynot" id="wp-why-'+id+'">'+esc(why || (live() ? 'Post now posts it straight away instead of waiting for its day.' : 'Post now starts Claude Code, which posts it platform by platform.'))+'</p>'+confirm+last+'</section>';
  }
  // The Reels lane's Ready to post: the reels post with their video, after YouTube is live.
  function reelPanel(r, {only = null} = {}) {
    const j = r?.jobId ? jobs.find(x => x.id === r.jobId) : null;
    if (!j) return '<div class="wp wp-later"><b>Posting</b><p class="pb-muted">These reels are not linked to a video job, so they do not post by themselves. Post them by hand with the steps '+(only ? 'under the reels' : 'above')+'.</p></div>';
    const rs = rowsOf(j, r).filter(x => x.key === 'instagram' || x.key === 'facebook');
    return '<section class="wp" aria-label="Posting the reels"><div class="wp-head"><h3>Posting</h3><span class="micro">INSTAGRAM AND FACEBOOK</span></div><p class="wp-when">'+esc(j.status === 'final' ? 'They post on Instagram and on your Facebook Page with the same caption, after the YouTube video is live: '+whenLine(j, rowsOf(j, r)) : 'They post with their video once it is Ready to post.')+'</p>'+
      (only ? (only.length ? '<ul class="wp-rows" aria-label="Other platforms">'+rs.filter(x => only.includes(x.key)).map(x => rowHtml(j, x, {controls:false})).join('')+'</ul>' : '') : '<ul class="wp-rows">'+rs.map(x => rowHtml(j, x, {controls:false})).join('')+'</ul>')+'<p class="pb-muted"><a class="pb-link" href="#/publish/job/'+encodeURIComponent(j.id)+'">Hold, switch a platform or post now on the video ↗</a></p></section>';
  }
  // ---- Ready to post (outputs.js): the same posting block, split over the screen ---------------------------------------
  // outputs.js draws one slot per platform section and asks for its row with WWPostingSlot(platform, ctx); the job-level part
  // (posting day, mode, Hold or Release, Post now, Change a pick, the confirm and any warning) is WWPostingHead(ctx, placed),
  // at the top of the screen, with the row of any platform no section drew (placed lists the slots drawn), so every row
  // appears exactly once. ctx is publish.js's context (job, reel) on the Video screen, {reel} on the Reels lane. Both are
  // drawn from state on every redraw; the presses are the delegated listener below.
  const ctxJob = ctx => ctx?.job || (ctx?.reel?.jobId ? jobs.find(x => x.id === ctx.reel.jobId) || window.WWPublishJob?.(ctx.reel.jobId) || null : null);
  const laneOnly = ctx => !ctx?.job && Boolean(ctx?.reel);
  function slotRow(platform, ctx) {
    const j = ctxJob(ctx), k = String(platform || ''); if (!j || !C.ORDER.includes(k)) return '';
    if (!laneOnly(ctx) && j.status !== 'final') return '';
    if (laneOnly(ctx) && k !== 'instagram' && k !== 'facebook') return '';
    const x = (laneOnly(ctx) ? rowsOf(j, ctx.reel) : rowsOf(j)).find(r => r.key === k); if (!x) return '';
    return '<div class="wp wp-slot"><ul class="wp-rows" aria-label="Posting on '+esc(x.label)+'">'+rowHtml(j, x, {controls:!laneOnly(ctx)})+'</ul></div>';
  }
  function slotHead(ctx, placed) {
    const got = new Set((placed || []).filter(k => slotRow(k, ctx))), rest = k => !got.has(k);
    if (laneOnly(ctx)) return reelPanel(ctx.reel, {only:['instagram', 'facebook'].filter(rest)});
    const j = ctxJob(ctx); if (!j) return '';
    return panel(j, {only:C.ORDER.filter(rest)});
  }
  window.WWPostingSlot = (platform, ctx) => slotRow(platform, ctx);
  window.WWPostingHead = (ctx, placed) => slotHead(ctx, placed);
  // ---- The Schedule: posting cards and the topic panel -------------------------------------------------------------------
  const jobForTopic = id => jobs.filter(j => j.topicId === id && j.status === 'final').sort((a, b) => String(b.readyAt || b.updatedAt || '').localeCompare(String(a.readyAt || a.updatedAt || '')))[0] || null;
  function badge(topicId) {
    const j = jobForTopic(topicId); if (!j) return '';
    const rs = rowsOf(j).filter(x => x.on), posted = rs.filter(x => x.state === 'posted').length, s = scheduleOf(j);
    const [cls, t] = j.hold?.on ? ['held', 'On hold'] : legacy(j) && !rs.some(x => x.state === 'posted') ? ['legacy', 'Ready · by hand'] : rs.length && posted === rs.length ? ['posted', 'Posted'] : posted ? ['partial', 'Posted '+posted+' of '+rs.length] : rs.some(x => x.state === 'look') ? ['look', 'Needs a look'] : ['scheduled', (live() ? 'Scheduled ' : 'Ready · ')+s.time];
    return '<span class="wp-badge is-'+cls+'" data-wp-badge="'+cls+'">'+esc(t)+'</span>';
  }
  function receipts(topicId) {
    const j = jobForTopic(topicId); if (!j) return '';
    const rs = rowsOf(j);
    return '<div class="wp wp-topic"><div class="wp-head"><h3>Posting</h3><span class="micro">'+esc(dayWord(scheduleOf(j).day))+' · '+esc(scheduleOf(j).time)+'</span></div><p class="wp-when">'+esc(whenLine(j, rs))+'</p><ul class="wp-rows">'+rs.map(x => rowHtml(j, x, {controls:false})).join('')+'</ul><p class="tp-muted"><a href="#/publish/job/'+encodeURIComponent(j.id)+'">Open it on Publish</a></p></div>';
  }
  // A pick may change until its platform starts posting.
  function lockedPick(j, key) {
    const e = j?.posting?.[String(key || '').split('.')[0]];
    return Boolean(e && (e.state === 'posting' || e.state === 'posted'));
  }
  // ---- Actions ---------------------------------------------------------------------------------------------------------
  const redraw = () => window.dispatchEvent(new CustomEvent('ww:posting'));
  async function save(j, patch) {
    if (!db) { note[j.id] = 'Saving needs the app’s database, which this preview does not have.'; redraw(); return false; }
    try { await db.doc('jobs/'+j.id).update({...patch, updatedAt:now()}); Object.assign(j, patch); note[j.id] = ''; redraw(); return true; }
    catch (e) { note[j.id] = 'Could not save ('+(e?.code || 'error')+'). Try again.'; redraw(); return false; }
  }
  const line = j => 'Post job '+j.id;
  const prompt = j => line(j)+'. Follow POSTING.md in this repository exactly: this is a posting session, started by Taylor’s Post now press. Read jobs/'+j.id+' and its reel job in the Whiteboard Wednesdays app artifact, stop at once if it is on Hold or not Ready to post, and post only to platforms that are switched on and connected in Composio, in the order YouTube, LinkedIn, X, Instagram, Facebook. Write each receipt (posting) to the job before and after every platform call, pinned to the version you read, never post anything twice, never post a review copy, and end with one sentence saying what posted and what did not.';
  // One press, one session: the press is refused while one is opening, and for 20 minutes after while the session has not
  // written its end. A refusal saves nothing.
  async function postNow(j) {
    if (starting || runOpen(j) || j.hold?.on || j.status !== 'final') return false;
    starting = j.id; confirming = null; note[j.id] = ''; redraw();
    const requestedAt = now();
    try {
      const mcp = await window.claude?.use?.('mcp'); if (!mcp) throw {code:'unavailable'};
      const r = await mcp.callTool('Claude Code Remote', 'create_session', {environment_id:ENV, source_url:REPO, title:'Post: '+(j.title || j.id), prompt:prompt(j)});
      const p = r?.payload || {}, sid = p.ccr?.id || p.session_id || p.id || p.session?.id || null;
      starting = null;
      await save(j, {postingRun:{line:line(j), sessionId:sid, url:sid ? 'https://claude.ai/code/'+sid : null, requestedAt, startedAt:now(), endedAt:null, by:'taylor'}});
      return true;
    } catch (e) {
      starting = null;
      const why = e?.code === 'not_granted' ? 'You did not allow the Claude Code connection, so posting could not start.' : e?.code === 'unavailable' ? 'The Claude Code connection is not available in this view.' : 'Claude Code could not be started ('+(e?.code || e?.message || 'error')+').';
      note[j.id] = why+' Nothing was posted. Press Post now again, or send “'+line(j)+'” in a Claude chat.'; redraw(); return false;
    }
  }
  document.addEventListener('click', async e => {
    const b = e.target.closest?.('[data-wp]'); if (!b || b.disabled) return;
    const j = jobs.find(x => x.id === b.dataset.job) || window.WWPublishJob?.(b.dataset.job); if (!j) return;
    const act = b.dataset.wp, k = b.dataset.k, at = now();
    if (act === 'hold') { await save(j, {hold:{on:true, at, by:'taylor'}}); return; }
    if (act === 'release') { await save(j, {hold:{on:false, at, by:'taylor'}}); return; }
    if (act === 'now') { confirming = j.id; redraw(); document.getElementById('wp-go-'+j.id)?.focus(); return; }
    if (act === 'cancel') { confirming = null; redraw(); return; }
    if (act === 'go') { await postNow(j); return; }
    if (act === 'picks') { const h = document.getElementById('pb-pack-h'); if (h) { h.setAttribute('tabindex', '-1'); h.scrollIntoView({block:'start'}); h.focus({preventScroll:true}); } return; }
    if (act === 'toggle' && k) { const on = C.isOn(j, settings(), k); await save(j, {postTo:{...(j.postTo || {}), [k]:!on}}); return; }
    if ((act === 'clear-yes' || act === 'clear-no') && k && j.posting?.[k]?.state === 'check') {
      try { const next = C.transition(j.posting[k], 'clear', at, {posted:act === 'clear-yes'}); await save(j, {posting:{...j.posting, [k]:{...next, clearedBy:'taylor'}}}); } catch { /* the receipt moved meanwhile */ }
    }
  });
  async function load() {
    try { api = await window.WWStore?.connect(); db = window.WWStore?.db?.() || null; } catch { db = null; }
    if (!db) return;
    db.collection('jobs').onSnapshot(snap => { jobs = snap.docs.filter(d => d.exists).map(d => ({id:d.id, ...d.data()})); sync(); redraw(); }, () => {});
    db.collection('reels').onSnapshot(snap => { reels = snap.docs.filter(d => d.exists).map(d => ({...d.data(), id:d.id})); redraw(); }, () => {});
    // The daily poster's switch (POSTING.md "The scheduled tasks"): written by the main session, read here only.
    try { const ref = db.doc('settings/poster'), apply = snap => { const on = snap?.data?.()?.daily === true; if (store() && store().posterLive !== on) store().posterLive = on; };
      apply(await ref.get()); if (typeof ref.onSnapshot === 'function') ref.onSnapshot(apply, () => {}); } catch { /* the poster reads as not running */ }
  }
  window.addEventListener('ww:settings', () => { sync(); });
  window.addEventListener('ww:store', () => { sync(); });
  window.addEventListener('ww:connections', redraw);
  window.WWPosting = {panel, reelPanel, slot:slotRow, head:slotHead, badge, receipts, lockedPick, scheduleFields, scheduleOf, rows:rowsOf, postNow, get jobs() { return allJobs().slice(); }};
  load();
})();
