/* Inspiration (#/watchlist): A3 "Depth by paper", Taylor's pick on 13 November 2026 ("depth by paper please").
   One paper command field with two verbs: Ask (the Trending Topics skill, ideaRuns/<id>, SKILL-IDEAS.md) and Refresh creators
   (the watchlist scan, scans/<id>, SCAN.md). Five suggestion chips, one quiet cost line, then one stream grouped by run,
   newest first, with filter lanes. Every card can be sparked onto the Topics shortlist, added to the schedule or dismissed.
   Dismissed uploads are a per-browser convenience kept in localStorage; dismissed ideas are saved on their run. */
(() => {
  'use strict';
  const root = document.querySelector('#video-ideas');
  const $ = s => root.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data = {creators:[], videos:[], topics:[], configured:false, ready:false}, who = null, scanNoteUntil = 0, undo = null;
  const M = window.WWMotion;
  const fmt = (value, o) => new Intl.DateTimeFormat('en-GB', o).format(new Date(value));
  const date = value => fmt(value, {weekday:'short',day:'numeric',month:'short'});
  const short = value => fmt(value, {day:'numeric',month:'short'});
  const clock = value => fmt(value, {hour:'2-digit',minute:'2-digit'});
  const DAY = 86400000, WINDOW = 30, MIN = 60000;
  // Inside a Claude artifact there is no server, so topics are kept in the page's own database (ww-store.js).
  let store = null;
  async function api(path, body) {
    if (store) return store.call(path, body);
    const response = await fetch('/api/ideas' + path, body === undefined ? {cache:'no-store'} : {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('The YouTube connection is not configured yet. Your creator list is ready.');
    const result = await response.json();
    if (!response.ok) { const error = new Error(result.error || 'The request could not be completed. Please try again.'); error.status = response.status; error.result = result; throw error; }
    return result;
  }
  // The status line. `extra` is ready-made HTML (an Undo, a link), never anything typed or fetched.
  function announce(message, extra = '') { const el = $('#ideas-status'); el.innerHTML = message ? esc(message)+(extra ? ' '+extra : '') : ''; el.classList.toggle('is-on', !!message); }
  // Dismissed uploads live only in this browser (the "seen" marks of the inbox before). Storage can be unavailable.
  const seen = new Set((() => { try { return JSON.parse(localStorage.getItem('ww-seen') || '[]'); } catch { return []; } })());
  function keepSeen() { try { localStorage.setItem('ww-seen', JSON.stringify([...seen].slice(-800))); } catch { /* dismissals just will not persist */ } }
  // Thumbnails: the stored image first, then YouTube's always-16:9 medium size, then a plain initial.
  const safeThumb = url => /^https:\/\/i[0-9]?\.ytimg\.com\//.test(url || '') ? url : '';
  function thumb(v, name) {
    const first = safeThumb(v.thumbnail), fallback = /^[A-Za-z0-9_-]{6,20}$/.test(v.id) ? 'https://i.ytimg.com/vi/'+v.id+'/mqdefault.jpg' : '';
    const src = first || fallback;
    const initial = '<span class="vi-thumb-empty" aria-hidden="true">'+esc((name || '?').trim().charAt(0).toUpperCase())+'</span>';
    return '<a class="vi-thumb" data-own-fallback data-name="'+esc(name || '?')+'" href="https://www.youtube.com/watch?v='+encodeURIComponent(v.id)+'" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">'+(src ? '<img src="'+esc(src)+'"'+(first && fallback && first !== fallback ? ' data-fallback="'+esc(fallback)+'"' : '')+' width="320" height="180" loading="lazy" alt="">' : initial)+'</a>';
  }
  // YouTube answers a missing video with a 120×90 grey stand-in rather than an error, so treat that as missing too.
  document.addEventListener('load', event => { const img = event.target; if (img instanceof HTMLImageElement && img.closest('.vi-thumb') && img.naturalWidth <= 120) img.dispatchEvent(new Event('error')); }, true);
  document.addEventListener('error', event => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || !img.closest('.vi-thumb')) return;
    if (img.dataset.fallback) { const next = img.dataset.fallback; delete img.dataset.fallback; img.src = next; return; }
    const name = img.closest('.vi-thumb').dataset.name || '?';
    img.replaceWith(Object.assign(document.createElement('span'), {className:'vi-thumb-empty', textContent:name.trim().charAt(0).toUpperCase()}));
  }, true);
  const topicsFor = id => (data.topics || []).filter(t => t.sources.some(s => s.id === id));
  const recent = () => data.videos.filter(v => { const t = Date.parse(v.publishedAt); return t >= Date.now() - WINDOW*DAY && t <= Date.now(); });
  const unread = list => list.filter(v => !seen.has(v.id) && !topicsFor(v.id).length);
  // Spark, on Inspiration and on a creator page: a topic with the video as its source, straight onto the Topics shortlist.
  async function spark(id) {
    if (!data.ready) { announce('Topics need the app’s saved data, which is not available here.'); return false; }
    try {
      const r = await api('/topic', {videoId:id, status:'shortlisted'});
      if (!store && r?.id) await api('/topic-update', {id:r.id, status:'shortlisted'}).catch(() => {});
      seen.add(id); keepSeen(); scanNoteUntil = Date.now() + 8000; await load();
      announce('Sparked onto the Topics shortlist.', '<a href="#/topics">Open Topics →</a>'); return true;
    } catch (error) { announce(error.message); return false; }
  }
  const initials = name => name.replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

  // ---- The creators: an avatar stack and "42 creators" in the corner, opening the list of everyone ----
  function creators() {
    const counts = new Map();
    for (const v of unread(recent())) counts.set(v.handle, (counts.get(v.handle) || 0) + 1);
    const order = [...data.creators].sort((a, b) => (counts.get(b.handle) || 0) - (counts.get(a.handle) || 0) || a.name.localeCompare(b.name));
    const n = data.creators.length;
    $('#ideas-avs').innerHTML = order.slice(0, 3).map(c => '<i class="vi-av">'+esc(initials(c.name))+'</i>').join('')+(n > 3 ? '<i class="vi-av is-ink">+'+(n - 3)+'</i>' : '');
    $('#ideas-who-n').textContent = n ? n+' creator'+(n === 1 ? '' : 's') : 'Your creators';
    $('#ideas-grid').innerHTML = [...data.creators].sort((a, b) => a.name.localeCompare(b.name)).map(c => '<a href="#/creator/'+encodeURIComponent(c.handle)+'"><span class="vi-mono" aria-hidden="true">'+esc(initials(c.name))+'</span><span>'+esc(c.name)+'</span>'+(counts.get(c.handle) ? '<b>'+counts.get(c.handle)+'<span class="vi-sr"> new</span></b>' : '')+'</a>').join('');
  }

  // ---- Runs: Ask (ideaRuns/<id>) and Refresh creators (scans/<id>), each one group in the stream ----
  const MODES = () => window.WWStore?.ideas?.MODES || {};
  const CHIP_TEXT = {week7:'This week’s 7', giants:'What the giants said on X', mywork:'From my work', breakouts:'Creator breakouts', month30:'Plan the month (30)'};
  const EST = {ask:15, month30:30, refresh:2};   // minutes, said as "about"
  const LATE = {refresh:{starting:15, running:40}, ask:{starting:15, running:90}};
  const LINE = {refresh:id => 'Run watchlist scan '+id, ask:id => 'Run topic ideas '+id};
  const COL = {refresh:'scans', ask:'ideaRuns'};
  // What this page is starting right now, before the job document says anything: {id, t0, open (the call has not answered)}.
  const local = {refresh:null, ask:null};
  let chip = null;          // the suggestion chip pressed, while the field still holds its text
  let lane = 'all', week = 'week';
  const more = new Set(), openPts = new Set(), showGone = new Set(), landed = new Set(), fresh = new Map();
  let firstData = true;
  const runs = () => (data.ideaRuns || []);
  const scans = () => (data.scans || []);
  const srcOf = idea => idea.source === 'creator' ? 'creator' : idea.source === 'x' ? 'x' : 'work';
  const SRC_LABEL = {creator:'Creators', work:'My work', x:'X giants'};
  const ideasOf = run => (run.ideas || []).slice().sort((a, b) => (a.rank || 99) - (b.rank || 99));
  const onList = (run, idea) => (data.topics || []).find(t => t.origin?.runId === run.id && t.origin?.ideaId === idea.id) || (run.added?.[idea.id] && (data.topics || []).find(t => t.id === run.added[idea.id]));
  const gone = (run, idea) => !!run.dismissed?.[idea.id];
  const pointsOf = idea => window.WWStore?.ideas?.points ? window.WWStore.ideas.points(idea) : (idea.points || []).slice(0, 4);
  const busy = kind => { const g = kind === 'ask' ? runs()[0] : scans()[0]; return !!local[kind] || (!!g && ['requested','queued','starting','running'].includes(g.status) && !late(kind, g) && !orphan(kind, g)); };
  const since = g => Date.parse(g?.session?.startedAt || g?.runningAt || g?.createdAt || 0);
  function late(kind, g) { const lim = LATE[kind][g.status === 'running' ? 'running' : 'starting']; return ['starting','running'].includes(g.status) && Date.now() - since(g) > lim*MIN; }
  // A request saved but never started (the page was closed while it started), and nobody here is starting it.
  const orphan = (kind, g) => ['requested','queued'].includes(g.status) && local[kind]?.id !== g.id && Date.now() - Date.parse(g.createdAt || 0) > 2*MIN;
  const mmss = ms => { const s = Math.max(0, Math.floor(ms / 1000)), m = Math.floor(s / 60); return m >= 60 ? Math.floor(m / 60)+' h '+String(m % 60).padStart(2, '0')+' min' : String(m).padStart(2, '0')+':'+String(s % 60).padStart(2, '0'); };
  const took = ms => { const s = Math.round(ms / 1000); return s < 60 ? s+' s' : s < 600 ? Math.floor(s / 60)+' min '+(s % 60)+' s' : Math.round(s / 60)+' min'; };
  const ago = t => { const m = Math.floor((Date.now() - t) / MIN); return m < 1 ? 'just now' : m < 60 ? m+' minute'+(m === 1 ? '' : 's')+' ago' : m < 1440 ? Math.floor(m / 60)+' hour'+(Math.floor(m / 60) === 1 ? '' : 's')+' ago' : Math.floor(m / 1440) === 1 ? 'yesterday' : Math.floor(m / 1440)+' days ago'; };
  const estOf = (kind, run) => kind === 'refresh' ? EST.refresh : run?.mode === 'month30' ? EST.month30 : EST.ask;
  const promptOf = run => run.prompt || MODES()[run.mode]?.label || (run.mix === 'five-and-five' ? 'Ten topics' : 'Ask');

  // A run's live part (elapsed time and its meter) is redrawn every second on its own, so nothing else moves.
  function meterTicks(n, on) { let h = ''; for (let i = 0; i < n; i++) h += '<i'+(i < on ? ' class="on"' : '')+'></i>'; return '<span class="vi-ticks" aria-hidden="true">'+h+'</span>'; }
  function liveHtml(kind, g) {
    const el = Date.now() - since(g), est = estOf(kind, g);
    if (Array.isArray(g.progress) && g.progress.length) {
      return g.progress.slice(0, 4).map(p => { const total = Math.max(0, Number(p.total) || 0), done = Math.max(0, Math.min(total, Number(p.done) || 0)), n = 30;
        return '<div class="vi-meter"><b>'+esc(String(p.label || '').slice(0, 40))+'</b>'+meterTicks(n, total ? Math.round(done / total * n) : 0)+'<span>'+esc(p.note ? String(p.note).slice(0, 40) : total ? done+' of '+total : '')+'</span></div>'; }).join('');
    }
    const n = kind === 'refresh' ? 24 : 30, on = Math.min(n, Math.round(el / (est*MIN) * n));
    return '<div class="vi-meter"><b>'+(kind === 'refresh' ? 'Fetching '+data.creators.length+' creators' : 'Elapsed')+'</b>'+meterTicks(n, on)+'<span>'+(kind === 'refresh' ? Math.floor(el / 1000)+' s' : Math.floor(el / MIN))+' of about '+est+' min</span></div>';
  }
  const ASKING = {
    week7:'Trending Topics is reading the giants on X, your last 30 days of work and your creators’ breakouts, and picks 7, one a day.',
    giants:'Trending Topics is reading the last posts of the AI and paid-media giants on X.',
    mywork:'Trending Topics is reading your last 30 days of Claude Code sessions, repositories and skills.',
    breakouts:'Trending Topics is looking for your creators’ breakout videos.',
    month30:'Trending Topics is reading 160 posts from the giants on X and planning the best 30 videos for the month.',
    ask:'Trending Topics is answering your question from the giants on X, your last 30 days of work and your creators’ breakouts.'};
  const d = '<i class="vi-dia" aria-hidden="true"></i>';
  const sessionA = g => g?.session?.url ? '<a href="'+esc(g.session.url)+'" target="_blank" rel="noopener noreferrer">Open the session<span aria-hidden="true">&nbsp;↗</span></a>' : '';
  const copyLine = line => '<p class="vi-copyline"><code>'+esc(line)+'</code><button type="button" class="vi-btn" data-copy="'+esc(line)+'">Copy</button>';
  // The state of one run, from its document and what this page is doing. Nothing says Running before a session started.
  function runState(kind, g) {
    const loc = local[kind] && local[kind].id === g.id ? local[kind] : null, what = kind === 'refresh' ? 'uploads' : 'ideas', id = g.id;
    const leave = '<span class="vi-leave">You can leave this page; '+(kind === 'refresh' ? 'new uploads land here.' : 'the ideas land here.')+'</span>';
    const again = '<button type="button" class="vi-btn is-ink" data-again="'+kind+'" data-id="'+esc(id)+'">Try again</button>';
    const st = g.status;
    if (st === 'done') return null;
    if (st === 'failed') return {cls:'is-fail', html:'<p class="vi-st is-warn">'+d+'Failed</p><p>'+esc(String(g.error || g.reason || g.note || 'No reason was given.').slice(0, 300))+'</p><p class="vi-links">'+sessionA(g)+again+'</p>'};
    if (st === 'running' || st === 'starting') {
      if (late(kind, g)) return {cls:'is-late', html:'<p class="vi-st is-warn">'+d+'This is taking longer than usual</p><p>The session has not reported back.</p><p class="vi-links">'+sessionA(g)+again+'</p>'};
      if (st === 'starting') return {cls:'is-run', html:'<p class="vi-st">'+d+'Starting<em> · a Claude Code session is starting</em></p><p class="vi-links">'+sessionA(g)+leave+'</p>'};
      return {cls:'is-run', html:'<p class="vi-st">'+d+'Running<em> · <span data-live-time="'+kind+'">'+mmss(Date.now() - since(g))+'</span> of about '+estOf(kind, g)+' minutes</em></p>'+
        (kind === 'ask' ? '<p>'+esc(ASKING[g.mode] || ASKING.ask)+' Each idea comes back with 4 talking points.</p>' : '')+
        '<div class="vi-meters" data-live-meter="'+kind+'">'+liveHtml(kind, g)+'</div><p class="vi-links">'+sessionA(g)+leave+'</p>'};
    }
    // Not started: the connector refused or is unavailable (waiting), the 60 second watchdog fired, or nobody is starting it.
    const fallback = why => ({cls:'is-fail', html:'<p class="vi-st is-warn">'+d+'Not started</p><p>'+esc(why)+' Send this in a Claude chat and the '+what+' land here:</p>'+copyLine(LINE[kind](id))+again+'</p>'+
      (loc?.open ? '<p class="vi-leave">If it later starts by itself, this group moves on to Running.</p>' : g.code === 'not_granted' || /did not allow/.test(g.note || '') ? '<p class="vi-leave">To let it start by itself, allow Claude Code on its <a href="#/settings/connections/claudecode">Connections card</a>.</p>' : '')});
    if (st === 'waiting') return fallback(g.note && !/within a minute/.test(g.note) ? g.note : 'Claude could not start the session from this view.');
    if (loc?.open) {
      const el = Date.now() - loc.t0;
      if (el >= MIN) return fallback('Claude could not start the session from this view.');
      if (el >= 5000) return {cls:'is-wait', html:'<p class="vi-st is-wait">'+d+'Waiting for Claude to allow the Claude Code connection</p><p>Approve it in the card Claude shows, or press its Retry. Nothing has started yet.</p>'};
      return {cls:'is-wait', html:'<p class="vi-st">'+d+'Starting<em> · asking Claude to start a Claude Code session</em></p>'};
    }
    if (orphan(kind, g)) return fallback('The session did not start.');
    return {cls:'is-wait', html:'<p class="vi-st">'+d+'Starting<em> · asking Claude to start a Claude Code session</em></p>'};
  }

  // ---- Cards: one anatomy for creator uploads and skill ideas ----
  // "N x their normal": the video's views against the median of the same creator's other fetched uploads, only when
  // there are at least four others with views, and only when it is clearly above (1.2x). Otherwise nothing is said.
  let normFor = null, norms = new Map();
  function normal(v) {
    if (normFor !== data.videos) { normFor = data.videos; norms = new Map(); for (const x of data.videos) { if (!(x.views > 0)) continue; const l = norms.get(x.handle) || []; l.push(x); norms.set(x.handle, l); } }
    const others = (norms.get(v.handle) || []).filter(x => x.id !== v.id).map(x => x.views).sort((a, b) => a - b);
    if (!(v.views > 0) || others.length < 4) return null;
    const mid = others.length % 2 ? others[(others.length - 1) / 2] : (others[others.length / 2 - 1] + others[others.length / 2]) / 2;
    const r = v.views / mid; return r >= 1.2 ? r : null;
  }
  const views = n => n >= 1e6 ? (n / 1e6).toFixed(n < 1e7 ? 1 : 0).replace(/\.0$/, '')+'M' : n >= 1e3 ? Math.round(n / 1e3)+'K' : String(n);
  const days = v => { const n = Math.floor((Date.now() - Date.parse(v.publishedAt)) / DAY); return n < 1 ? 'today' : n === 1 ? '1 day' : n+' days'; };
  const inTopics = (t, open) => '<span class="vi-in">In Topics</span>'+(t?.recordDate ? '<span class="vi-booked">Records '+esc(date(t.recordDate+'T12:00:00Z'))+'</span><a class="vi-go" href="#/schedule">Open Schedule<span aria-hidden="true">&nbsp;→</span></a>' : '<a class="vi-go" href="#/topics">'+(open || 'Open Topics')+'<span aria-hidden="true">&nbsp;→</span></a>');
  function uploadCard(v) {
    const linked = topicsFor(v.id), t = linked[0], c = data.creators.find(x => x.handle === v.handle), url = 'https://www.youtube.com/watch?v='+encodeURIComponent(v.id), x = normal(v), dismissed = seen.has(v.id) && !linked.length;
    const acts = linked.length ? inTopics(t)+(linked.some(l => !l.recordDate) ? '<button type="button" class="vi-btn" data-book="'+esc(v.id)+'">Add to schedule</button>' : '')
      : dismissed ? '<button type="button" class="vi-btn is-text" data-unseen="'+esc(v.id)+'">Unseen</button>'
      : '<button type="button" class="vi-btn is-ink" data-spark="'+esc(v.id)+'">Spark</button><button type="button" class="vi-btn" data-book="'+esc(v.id)+'">Add to schedule</button><button type="button" class="vi-btn is-text" data-seen="'+esc(v.id)+'">Dismiss</button>';
    return '<article class="vi-card is-upload'+(linked.length ? ' is-in' : '')+(dismissed ? ' is-gone' : '')+'" data-video="'+esc(v.id)+'">'+thumb(v, v.creator)+
      '<div class="vi-cb"><p class="vi-src">Creator · <a href="#/creator/'+encodeURIComponent(v.handle)+'"><b>'+esc(c?.name || v.creator)+'</b></a> · '+days(v)+(x ? ' · '+x.toFixed(1)+'x their normal' : '')+'</p>'+
      '<h3><a href="'+url+'" target="_blank" rel="noopener noreferrer">'+esc(v.title)+'</a></h3><p class="vi-meta"><time datetime="'+esc(v.publishedAt)+'">'+esc(date(v.publishedAt))+'</time>'+(v.views > 0 ? ' · '+views(v.views)+' views' : '')+'</p></div>'+
      '<div class="vi-acts">'+acts+'</div></article>';
  }
  // Evidence words come wrapped in [[ ]] from the session (SKILL-IDEAS.md) and are drawn as highlight marks.
  const why = s => esc(String(s || '')).replace(/\[\[(.+?)\]\]/g, '<mark>$1</mark>');
  function tagOf(idea) {
    if (idea.tag) return String(idea.tag).slice(0, 40);
    const h = idea.evidence?.handles || [];
    if (h.length) return String(h[0]).replace(/^@/, '').slice(0, 30)+(h.length > 1 ? ' +'+(h.length - 1) : '');
    const n = (idea.evidence?.videos || []).length + (idea.evidence?.posts || []).length;
    return n ? n+' source'+(n === 1 ? '' : 's') : '';
  }
  function ideaCard(run, idea, i) {
    const t = onList(run, idea), key = run.id+'/'+idea.id, pts = pointsOf(idea), src = srcOf(idea), tag = tagOf(idea), isGone = gone(run, idea) && !t;
    const acts = t ? inTopics(t)
      : isGone ? '<button type="button" class="vi-btn is-text" data-restore="'+esc(idea.id)+'" data-run="'+esc(run.id)+'">Restore</button>'
      : '<button type="button" class="vi-btn is-ink" data-spark-idea="'+esc(idea.id)+'" data-run="'+esc(run.id)+'">Spark</button><button type="button" class="vi-btn" data-book-idea="'+esc(idea.id)+'" data-run="'+esc(run.id)+'">Add to schedule</button><button type="button" class="vi-btn is-text" data-dismiss-idea="'+esc(idea.id)+'" data-run="'+esc(run.id)+'">Dismiss</button>';
    return '<article class="vi-card is-idea'+(t ? ' is-in' : '')+(isGone ? ' is-gone' : '')+'" data-idea="'+esc(idea.id)+'" data-run="'+esc(run.id)+'"><span class="vi-rank" aria-hidden="true">'+String(idea.rank || i + 1).padStart(2, '0')+'</span>'+
      '<div class="vi-cb"><p class="vi-src">Skill · <b>'+SRC_LABEL[src]+'</b>'+(tag ? ' · '+esc(tag) : '')+'</p><h3>'+esc(idea.title)+'</h3>'+(idea.why ? '<p class="vi-why">'+why(idea.why)+'</p>' : '')+
      (pts.length ? '<p class="vi-peek"><b>01</b> '+esc(pts[0])+'</p><details class="vi-tp" data-key="'+esc(key)+'"'+(openPts.has(key) ? ' open' : '')+'><summary>'+pts.length+' talking point'+(pts.length === 1 ? '' : 's')+'</summary><ol>'+pts.map(p => '<li>'+esc(p)+'</li>').join('')+'</ol></details>' : '')+
      '</div><div class="vi-acts">'+acts+'</div></article>';
  }

  // ---- The stream ----
  const WEEKS = {week:[0, 7, 'this week'], last:[7, 14, 'last week'], month:[14, WINDOW, 'earlier this month'], all:[0, WINDOW, 'in the last '+WINDOW+' days']};
  const ageOf = v => (Date.now() - Date.parse(v.publishedAt)) / DAY;
  const inWeek = v => { const [a, b] = WEEKS[week]; const g = ageOf(v); return g >= a && g < b; };
  const uploadsShown = () => recent().filter(v => inWeek(v) && (!who || v.handle === who)).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const uploadsLive = () => uploadsShown().filter(v => !seen.has(v.id) || topicsFor(v.id).length);
  // Ask groups on screen: the newest run whatever its state, then up to four more that finished with ideas.
  function askGroups() {
    const all = runs().slice(), out = [];
    if (local.ask && !all.some(r => r.id === local.ask.id)) all.unshift({id:local.ask.id, status:'requested', createdAt:new Date(local.ask.t0).toISOString(), prompt:local.ask.prompt, mode:local.ask.mode});
    all.forEach((r, i) => { if (i === 0 || (r.status === 'done' && (r.ideas || []).length)) out.push(r); });
    return out.slice(0, 5);
  }
  const ideasLive = (run, f) => ideasOf(run).filter(x => (!f || srcOf(x) === f) && (!gone(run, x) || onList(run, x)));
  const laneSrc = () => lane === 'mywork' ? 'work' : lane === 'x' ? 'x' : null;
  function counts() {
    const done = askGroups().filter(r => r.status === 'done');
    const n = f => done.reduce((s, r) => s + ideasLive(r, f).length, 0);
    const c = uploadsLive().length, k = n(null);
    return {all:c + k, creators:c, skill:k, mywork:n('work'), x:n('x')};
  }
  function lanes() {
    const n = counts(), L = [['all','All'],['creators','Creators'],['skill','Skill'],['mywork','My work'],['x','X giants']];
    $('#ideas-lanes').innerHTML = L.map(([k, name]) => '<button type="button" data-lane="'+k+'" aria-pressed="'+(lane === k)+'"'+(lane === k && M ? M.attr('vi-lane', 'draw') : '')+'>'+name+' <span>'+n[k]+'</span></button>').join('');
    $('#ideas-week').value = week;
  }
  function head(kind, label, meta) { return '<h2 class="vi-gh"><span class="vi-gp"><b>'+kind+'</b> '+esc(label)+'</span><span class="vi-gm">'+meta+'</span></h2>'; }
  function refreshGroup() {
    const g = local.refresh && !scans().some(s => s.id === local.refresh.id) ? {id:local.refresh.id, status:'queued', createdAt:new Date(local.refresh.t0).toISOString()} : scans()[0];
    const s = g ? runState('refresh', g) : null, list = uploadsShown(), live = list.filter(v => !seen.has(v.id) || topicsFor(v.id).length), hidden = list.length - live.length;
    const creator = who && data.creators.find(c => c.handle === who), at = data.fetchedAt || data.creators.map(c => c.lastSuccess).filter(Boolean).sort().pop();
    const fresh1 = g && g.status === 'done' && fresh.has(g.id) ? fresh.get(g.id) : null, newN = unread(list).length;
    const meta = s ? 'Started '+esc(clock(g.createdAt)) : at ? esc(date(at))+' · '+esc(clock(at))+' · '+newN+' new' : 'Not fetched yet';
    let body = '';
    if (s) body += '<div class="vi-run '+s.cls+'">'+s.html+'</div>';
    else if (g?.status === 'done' || at) {
      const dur = g?.status === 'done' && g.finishedAt ? ' · '+took(Date.parse(g.finishedAt) - since(g)) : '';
      body += '<p class="vi-st is-ok">'+d+'Done · '+(fresh1 !== null ? fresh1+' new upload'+(fresh1 === 1 ? '' : 's') : newN+' new '+esc(WEEKS[week][2]))+'<em>'+dur+'</em></p>';
    }
    if (creator) body += '<p class="vi-who">Showing '+esc(creator.name)+' only · <a href="#/creator/'+encodeURIComponent(creator.handle)+'">Open '+esc(creator.name)+'’s page</a> · <button type="button" class="vi-btn is-text" data-everyone>Show everyone</button></p>';
    if (!data.configured && !data.videos.length) body += '<div class="vi-empty"><p><b>No uploads fetched yet.</b></p><p>Press Refresh creators: a Claude Code session reads your '+data.creators.length+' creators’ public feeds, in about 2 minutes.</p></div>';
    else if (!live.length) body += '<div class="vi-empty"><p><b>No uploads '+esc(WEEKS[week][2])+(week === 'week' ? ' yet' : '')+'.</b></p><p>'+(at ? 'Last checked '+esc(date(at))+'.' : 'Not checked yet.')+(week !== 'all' ? ' <button type="button" class="vi-btn is-text" data-week="all">Show the last '+WINDOW+' days</button>' : '')+'</p></div>';
    else {
      const k = 'refresh', open = more.has(k), shown = open ? live : live.slice(0, 3);
      if (s && s.cls !== 'is-fail') body += '<p class="vi-old">Earlier result · stays until the new one lands</p>';
      body += '<div class="vi-cards'+(s && s.cls !== 'is-fail' ? ' is-old' : '')+'">'+shown.map(uploadCard).join('')+'</div>';
      if (live.length > 3) body += '<button type="button" class="vi-more" data-more="'+k+'" aria-expanded="'+open+'">'+(open ? 'Show fewer uploads' : 'Show '+(live.length - 3)+' more upload'+(live.length - 3 === 1 ? '' : 's'))+'</button>';
    }
    if (hidden) {
      const on = showGone.has('refresh');
      body += '<p class="vi-gone-line">'+hidden+' dismissed · <button type="button" class="vi-btn is-text" data-gone="refresh" aria-expanded="'+on+'">'+(on ? 'Hide them' : 'Show them')+'</button>'+(on ? '' : '')+'</p>'+(on ? '<div class="vi-cards is-gone">'+list.filter(v => seen.has(v.id) && !topicsFor(v.id).length).map(uploadCard).join('')+'</div>' : '');
    }
    return '<section class="vi-group'+(s ? ' is-live' : '')+'" data-group="refresh" data-t="'+(Date.parse(g?.createdAt || at || 0) || 0)+'">'+head('Refresh', data.creators.length+' creators', meta)+body+'</section>';
  }
  function askGroup(run, olderThanLive) {
    const s = runState('ask', run), f = laneSrc(), list = ideasLive(run, f), all = ideasOf(run).filter(x => !f || srcOf(x) === f), hidden = all.filter(x => gone(run, x) && !onList(run, x));
    const n = (run.ideas || []).length;
    const meta = s ? 'Started '+esc(clock(run.createdAt)) : esc(date(run.createdAt))+' · '+esc(clock(run.finishedAt || run.createdAt))+(run.status === 'done' ? ' · '+n+' idea'+(n === 1 ? '' : 's') : '');
    let body = '';
    if (s) body += '<div class="vi-run '+s.cls+'">'+s.html+'</div>';
    else body += '<p class="vi-st is-ok">'+d+'Done · '+n+' idea'+(n === 1 ? '' : 's')+'<em>'+(run.finishedAt ? ' · '+took(Date.parse(run.finishedAt) - since(run)) : '')+'</em></p>'+(run.note ? '<p class="vi-note">'+esc(String(run.note).slice(0, 300))+'</p>' : '');
    if (run.status === 'done') {
      const k = 'ask:'+run.id, open = more.has(k), shown = open ? list : list.slice(0, 3);
      if (olderThanLive) body += '<p class="vi-old">Earlier result · stays until the new one lands</p>';
      body += shown.length ? '<div class="vi-cards'+(olderThanLive ? ' is-old' : '')+'">'+shown.map((x, i) => ideaCard(run, x, i)).join('')+'</div>' : '<div class="vi-empty"><p>'+(f ? 'No '+SRC_LABEL[f]+' ideas in this run.' : 'Every idea in this run is dismissed.')+'</p></div>';
      if (list.length > 3) body += '<button type="button" class="vi-more" data-more="'+esc(k)+'" aria-expanded="'+open+'">'+(open ? 'Show fewer ideas' : 'Show '+(list.length - 3)+' more idea'+(list.length - 3 === 1 ? '' : 's'))+'</button>';
      if (hidden.length) { const gk = 'ask:'+run.id, on = showGone.has(gk); body += '<p class="vi-gone-line">'+hidden.length+' dismissed · <button type="button" class="vi-btn is-text" data-gone="'+esc(gk)+'" aria-expanded="'+on+'">'+(on ? 'Hide them' : 'Show them')+'</button></p>'+(on ? '<div class="vi-cards is-gone">'+hidden.map((x, i) => ideaCard(run, x, i)).join('')+'</div>' : ''); }
    }
    return '<section class="vi-group'+(s ? ' is-live' : '')+'" data-group="ask:'+esc(run.id)+'" data-t="'+(Date.parse(run.createdAt) || 0)+'">'+head('Ask', promptOf(run), meta)+body+'</section>';
  }
  function stream() {
    if (root.hidden) { root.dataset.stale = '1'; return; }
    delete root.dataset.stale;
    const groups = [], asks = askGroups(), liveAsk = asks[0] && !['done','failed'].includes(asks[0].status) && runState('ask', asks[0])?.cls !== 'is-fail';
    if (lane === 'all' || lane === 'creators') groups.push({t:Number((scans()[0]?.createdAt && Date.parse(scans()[0].createdAt)) || (local.refresh?.t0) || Date.parse(data.fetchedAt || 0) || 0), html:refreshGroup()});
    if (lane !== 'creators') asks.forEach((r, i) => {
      if (laneSrc() && r.status === 'done' && !ideasOf(r).some(x => srcOf(x) === laneSrc())) return;
      groups.push({t:Date.parse(r.createdAt) || 0, html:askGroup(r, i > 0 && liveAsk && r === asks.find((x, j) => j > 0 && x.status === 'done'))});
    });
    groups.sort((a, b) => b.t - a.t);
    const focus = document.activeElement && root.contains(document.activeElement) ? focusKey(document.activeElement) : null;
    $('#ideas-stream').innerHTML = groups.map(g => g.html).join('') || '<div class="vi-empty"><p>Nothing here yet. Ask for ideas, or press Refresh creators.</p></div>';
    if (focus) restoreFocus(focus);
    lanes(); dock();
  }
  const ATTRS = ['data-spark','data-book','data-seen','data-unseen','data-spark-idea','data-book-idea','data-dismiss-idea','data-restore','data-more','data-gone','data-lane','data-copy','data-again'];
  function focusKey(el) { if (el.closest('#ideas-stream,#ideas-lanes') === null) return null; const a = ATTRS.find(x => el.hasAttribute(x)); const card = el.closest('[data-video],[data-idea]'); return a ? {a, v:el.getAttribute(a), card:card ? (card.dataset.video || card.dataset.run+'/'+card.dataset.idea) : null} : el.tagName === 'SUMMARY' ? {sum:el.parentElement.dataset.key} : null; }
  function restoreFocus(k) {
    let el = null;
    if (k.sum) el = $('#ideas-stream details[data-key="'+CSS.escape(k.sum)+'"] summary');
    else el = $('['+k.a+'="'+CSS.escape(k.v)+'"]');
    if (!el && k.card) { const [r, i] = k.card.split('/'); const card = i ? $('[data-run="'+CSS.escape(r)+'"][data-idea="'+CSS.escape(i)+'"]') : $('[data-video="'+CSS.escape(r)+'"]'); el = card?.querySelector('button,a.vi-go'); }
    el?.focus({preventScroll:true});
  }
  // The hero's own state: the verbs, the chips and the cost line.
  function hero() {
    const asking = busy('ask'), refreshing = busy('refresh');
    $('#ideas-ask-label').textContent = asking ? 'Asking' : 'Ask';
    $('#ideas-ask').classList.toggle('is-busy', asking); $('#ideas-ask').setAttribute('aria-disabled', String(asking));
    root.querySelector('[data-dock-ask]').textContent = asking ? 'Asking' : 'Ask';
    $('#ideas-refresh-label').textContent = refreshing ? 'Refreshing' : 'Refresh creators';
    $('#ideas-refresh').setAttribute('aria-disabled', String(refreshing));
    root.querySelectorAll('[data-chip]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.chip === chip)));
    const last = runs().find(r => r.status === 'done' && (r.ideas || []).length);
    $('#ideas-cost').textContent = asking ? 'Asking now · about 15 minutes, about $20 · one Ask at a time'
      : (last ? 'Last Ask '+ago(Date.parse(last.finishedAt || last.createdAt))+', '+last.ideas.length+' idea'+(last.ideas.length === 1 ? '' : 's')+' below · ' : '')+'Ask: about 15 minutes, about $20 · Refresh: about 2 minutes';
  }
  function render() { hero(); creators(); stream(); }
  // Every second while something runs: the elapsed time and meters, the 5 and 60 second steps of a start. Only text moves.
  let ticking = null;
  function tick() {
    const live = ['refresh','ask'].filter(k => local[k] || root.querySelector('[data-live-time="'+k+'"]'));
    if (!live.length || root.hidden) { clearInterval(ticking); ticking = null; return; }
    for (const k of live) {
      const g = k === 'ask' ? runs()[0] : scans()[0];
      if (local[k]?.open) { const el = Date.now() - local[k].t0; if ((el >= 5000 && !local[k].s5) || (el >= MIN && !local[k].s60)) { local[k].s5 = el >= 5000; if (el >= MIN && !local[k].s60) { local[k].s60 = true; watchdog(k); } stream(); hero(); return; } }
      if (!g) continue;
      const t = root.querySelector('[data-live-time="'+k+'"]'); if (t) t.textContent = mmss(Date.now() - since(g));
      const m = root.querySelector('[data-live-meter="'+k+'"]'); if (m) m.innerHTML = liveHtml(k, g);
    }
  }
  function ensureTick() { if (!ticking) ticking = setInterval(tick, 1000); }
  // 60 seconds and still no answer from the connector: say so on the job (status waiting) and offer the line to send.
  async function watchdog(kind) { const l = local[kind]; if (!l?.open) return; try { await api('/job-wait', {col:COL[kind], id:l.id, note:'Claude did not answer within a minute.'}); } catch { /* the page still shows the fallback */ } }
  const newId = () => window.WWStore?.ideas?.jobId ? window.WWStore.ideas.jobId() : new Date().toISOString().slice(0, 10)+'-'+Math.random().toString(36).slice(2, 7).padEnd(5, '0');
  async function begin(kind, body, path) {
    const id = body.id || newId(), l = {id, t0:Date.now(), open:true, prompt:body.prompt, mode:body.mode};
    local[kind] = l; M?.stamp('vi-start:'+kind); render(); ensureTick();
    try {
      const r = await api(path, {...body, id});
      l.open = false;
      if (local[kind] === l) local[kind] = null;
      await load();
      if (!r.started) announce(r.why ? r.why+' Send the line in the group to a Claude chat.' : 'Claude could not start the session.');
      else announce(kind === 'ask' ? 'Claude is finding ideas. They land here when the session finishes.' : 'Claude is fetching your creators’ uploads.');
    } catch (error) { l.open = false; if (local[kind] === l) local[kind] = null; await load(); announce(error.status === 404 ? 'Ask needs the Claude app; this server does not have it.' : error.message); }
    render();
  }
  function ask(text) {
    if (!data.ready) { announce('Ask needs the app’s saved data, which is not available here.'); return; }
    if (busy('ask')) { announce('One Ask at a time. The running one is at the top of the stream.'); $('#ideas-stream [data-group^="ask:"]')?.scrollIntoView({block:'start', behavior:'smooth'}); return; }
    const typed = String(text ?? '').trim(), mode = chip && typed ? chip : typed ? 'ask' : 'week7';
    const prompt = chip && typed === CHIP_TEXT[chip] ? '' : typed;
    begin('ask', {prompt, mode}, '/idea-run');
  }
  function refresh() {
    if (busy('refresh')) { announce('Your creators are already being refreshed.'); $('#ideas-stream [data-group=refresh]')?.scrollIntoView({block:'start', behavior:'smooth'}); return; }
    if (data.store !== 'claude' && !data.ready) { announce('Refreshing needs the Claude app’s saved data, which this preview does not have.'); return; }
    if (data.store !== 'claude') return serverRefresh();
    begin('refresh', {}, '/refresh');
  }
  async function serverRefresh() {
    if (!data.configured) { announce('Refreshing needs the YouTube connection, which is not set up yet.'); return; }
    let ok = 0, bad = 0;
    for (const [i, c] of data.creators.entries()) { announce('Checking '+c.name+' · '+(i+1)+' of '+data.creators.length); try { await api('/refresh', {handle:c.handle}); ok++; } catch { bad++; } }
    await load(); announce('Refresh finished: '+ok+' creators updated'+(bad ? ', '+bad+' could not be refreshed.' : '.'));
  }
  async function again(kind, id) {
    if (kind === 'refresh') { local.refresh = null; return refresh(); }
    if (local.ask?.open) return;
    const l = {id, t0:Date.now(), open:true}; local.ask = l; render(); ensureTick();
    try { const r = await api('/idea-start', {id}); l.open = false; if (local.ask === l) local.ask = null; await load(); if (!r.started) announce(r.why || 'Claude could not start the session.'); }
    catch (error) { l.open = false; if (local.ask === l) local.ask = null; await load(); announce(error.message); }
    render();
  }
  // A scan that turns done while the page is open: fetch uploads.json again past the cache, and count what is new.
  async function landScans() {
    for (const s of scans()) {
      if (s.status !== 'done' || landed.has(s.id)) continue;
      landed.add(s.id);
      if (firstData) continue;
      const before = new Set(data.videos.map(v => v.id));
      try { await store?.reloadUploads({fresh:true}); } catch { /* load below still redraws */ }
      await load();
      const n = data.videos.filter(v => !before.has(v.id)).length;
      fresh.set(s.id, n); scanNoteUntil = Date.now() + 60000;
      announce(n ? n+' new upload'+(n === 1 ? '' : 's')+' since the last check.' : 'No new uploads since the last check.');
      render();
    }
    firstData = false;
  }
  function emit() { window.dispatchEvent(new CustomEvent('ww:data', {detail:data})); }
  async function load() {
    try {
      data = {...await api(''), ready:true}; data.topics ||= [];
      const failed = data.creators.filter(c => c.error);
      $('#ideas-warning').hidden = !failed.length;
      $('#ideas-warning').textContent = failed.length+' creator refresh'+(failed.length === 1 ? '' : 'es')+' failed. Previously loaded videos remain visible. Refresh creators to check for missing uploads.';
      render(); emit(); landScans();
      if (root.querySelector('[data-live-time]')) ensureTick();
    } catch (error) {
      try { const response = await fetch('creators.json'); const seed = await response.json(); data.creators = seed.creators; } catch { /* keep the readable error */ }
      if (!store && window.WWStore) { store = await window.WWStore.connect().catch(() => null); if (store) return load(); }
      data.ready = false; render(); emit(); announce(error.message);
    }
  }
  // Add to schedule (Taylor, 11 November 2026): the video becomes a planned topic on the next free recording day.
  const slotNow = () => { const P = window.WWStore?.posting; return P ? P.nextFreeSlot(data.topics, P.today()) : null; };
  const bookedLine = slot => { const P = window.WWStore.posting, post = P.dateFor(data.topics, slot), at = iso => date(iso+'T12:00:00Z'); return 'Booked for '+at(slot)+(post ? ' · posts '+at(post) : '')+'.'; };
  async function book(id) {
    if (!data.ready) { announce('Scheduling needs the app’s saved data, which is not available here.'); return false; }
    const slot = slotNow(); if (!slot) { announce('No free recording day was found.'); return false; }
    const linked = topicsFor(id).find(t => !t.recordDate), wasSeen = seen.has(id);
    try {
      if (linked) { await api('/topic-update', {id:linked.id, recordDate:slot, ...(['new','shortlisted'].includes(linked.status) ? {status:'planned'} : {})}); undo = {kind:'book', id:linked.id, created:false, status:linked.status, video:id, wasSeen}; }
      else { const r = await api('/topic', {videoId:id, recordDate:slot}); if (r.recordDate !== slot) await api('/topic-update', {id:r.id, recordDate:slot, status:'planned'}); undo = {kind:'book', id:r.id, created:true, video:id, wasSeen}; }
    } catch (error) { announce(error.message); return false; }
    const line = bookedLine(slot);
    seen.add(id); keepSeen(); scanNoteUntil = Date.now() + 60000; await load();
    announce(line, '<button type="button" class="vi-btn is-text" data-undo>Undo</button> <a href="#/schedule">Open Schedule →</a>');
    return true;
  }
  async function bookIdea(runId, ideaId) {
    const slot = slotNow(); if (!slot) { announce('No free recording day was found.'); return; }
    const run = runs().find(r => r.id === runId), idea = run && ideasOf(run).find(x => x.id === ideaId), had = run && idea && onList(run, idea);
    try { const line = bookedLine(slot); const r = await api('/idea-add', {runId, ideaId, recordDate:slot}); undo = {kind:'book', id:r.id, created:!!r.created, status:had?.status || 'shortlisted'}; await load(); announce(line, '<button type="button" class="vi-btn is-text" data-undo>Undo</button> <a href="#/schedule">Open Schedule →</a>'); }
    catch (error) { announce(error.message); }
  }
  async function undoIt() {
    const u = undo; if (!u) return; undo = null;
    try {
      if (u.kind === 'seen') { for (const id of u.ids) seen.delete(id); keepSeen(); render(); announce('Undone: back in the stream.'); return; }
      if (u.kind === 'idea') { await api('/idea-dismiss', {runId:u.runId, ideaId:u.ideaId, undo:true}); await load(); announce('Undone: the idea is back.'); return; }
      if (u.created) await api('/topic-delete', {id:u.id}); else await api('/topic-update', {id:u.id, recordDate:null, status:u.status});
    } catch (error) { announce(error.message); return; }
    if (u.video && !u.wasSeen) { seen.delete(u.video); keepSeen(); }
    await load(); announce(u.created ? 'Undone: the booking and its topic are gone.' : 'Undone: the topic is off the schedule again.');
  }
  const busyBtn = (b, label) => { b.disabled = true; b.dataset.was = b.textContent; b.textContent = label; };
  const freeBtn = b => { if (b.isConnected) { b.disabled = false; b.textContent = b.dataset.was || b.textContent; } };
  root.addEventListener('click', async event => {
    const b = event.target.closest('button'); if (!b || !root.contains(b)) return;
    if (b.id === 'ideas-refresh' || b.dataset.dockRefresh !== undefined) { refresh(); return; }
    if (b.id === 'ideas-who-btn') { const dr = $('#ideas-drawer'); dr.hidden = !dr.hidden; b.setAttribute('aria-expanded', String(!dr.hidden)); if (!dr.hidden) dr.querySelector('a')?.focus(); return; }
    if (b.id === 'ideas-drawer-close') { $('#ideas-drawer').hidden = true; $('#ideas-who-btn').setAttribute('aria-expanded', 'false'); $('#ideas-who-btn').focus(); return; }
    if (b.dataset.chip) { chip = chip === b.dataset.chip ? null : b.dataset.chip; for (const q of ['#ideas-q','#ideas-dq']) $(q).value = chip ? CHIP_TEXT[chip] : ''; hero(); $('#ideas-q').focus(); return; }
    if (b.dataset.lane) { if (lane !== b.dataset.lane) { lane = b.dataset.lane; M?.stamp('vi-lane'); M?.enter($('#ideas-stream'), 'lane'); stream(); } $('#ideas-lanes [data-lane="'+lane+'"]')?.focus(); return; }
    if (b.dataset.week) { week = b.dataset.week; stream(); return; }
    if (b.dataset.everyone !== undefined) { who = null; history.replaceState(null, '', '#/watchlist'); render(); return; }
    if (b.dataset.more) { const k = b.dataset.more; if (more.has(k)) more.delete(k); else more.add(k); stream(); return; }
    if (b.dataset.gone) { const k = b.dataset.gone; if (showGone.has(k)) showGone.delete(k); else showGone.add(k); stream(); return; }
    if (b.dataset.undo !== undefined) { b.disabled = true; await undoIt(); return; }
    if (b.dataset.copy) { try { await navigator.clipboard.writeText(b.dataset.copy); announce('Copied. Paste it into a Claude chat.'); } catch { announce('Copy this line into a Claude chat: '+b.dataset.copy); } return; }
    if (b.dataset.again) { again(b.dataset.again, b.dataset.id); return; }
    if (b.dataset.seen) { seen.add(b.dataset.seen); keepSeen(); undo = {kind:'seen', ids:[b.dataset.seen]}; render(); announce('Dismissed.', '<button type="button" class="vi-btn is-text" data-undo>Undo</button>'); return; }
    if (b.dataset.unseen) { seen.delete(b.dataset.unseen); keepSeen(); render(); announce('Back in the stream.'); return; }
    if (b.dataset.spark) { busyBtn(b, 'Sparking…'); if (!await spark(b.dataset.spark)) freeBtn(b); return; }
    if (b.dataset.book) { busyBtn(b, 'Booking…'); if (!await book(b.dataset.book)) freeBtn(b); return; }
    if (b.dataset.sparkIdea) {
      busyBtn(b, 'Sparking…');
      const run = runs().find(r => r.id === b.dataset.run), idea = run && ideasOf(run).find(x => x.id === b.dataset.sparkIdea), n = idea ? pointsOf(idea).length : 0;
      try { const r = await api('/idea-add', {runId:b.dataset.run, ideaId:b.dataset.sparkIdea}); await load(); announce(r.existing ? 'Already in Topics as “'+((data.topics.find(t => t.id === r.id) || {}).title || '')+'”.' : '“'+(idea?.title || '')+'” is on the Topics shortlist, word for word'+(n ? ', with its '+n+' talking points' : '')+'.', '<a href="#/topics">Open Topics →</a>'); }
      catch (error) { announce(error.message); freeBtn(b); }
      return;
    }
    if (b.dataset.bookIdea) { busyBtn(b, 'Booking…'); await bookIdea(b.dataset.run, b.dataset.bookIdea); freeBtn(b); return; }
    if (b.dataset.dismissIdea || b.dataset.restore) {
      const ideaId = b.dataset.dismissIdea || b.dataset.restore, back = !!b.dataset.restore;
      try { await api('/idea-dismiss', {runId:b.dataset.run, ideaId, undo:back}); undo = back ? null : {kind:'idea', runId:b.dataset.run, ideaId}; await load(); announce(back ? 'Back in the stream.' : 'Dismissed.', back ? '' : '<button type="button" class="vi-btn is-text" data-undo>Undo</button>'); }
      catch (error) { announce(error.message); }
      return;
    }
  });
  // Open talking points stay open across redraws (a snapshot or the timer never closes them).
  root.addEventListener('toggle', event => { const t = event.target; if (t.matches?.('details.vi-tp')) { if (t.open) openPts.add(t.dataset.key); else openPts.delete(t.dataset.key); } }, true);
  $('#ideas-week').addEventListener('change', event => { week = event.target.value; stream(); });
  // The field: typing keeps a chip's mode only while the field still holds words; clearing it lets the chip go.
  function typed(event) { const v = event.target.value; for (const q of ['#ideas-q','#ideas-dq']) if ($(q) !== event.target) $(q).value = v; if (!v.trim() && chip) { chip = null; hero(); } }
  $('#ideas-q').addEventListener('input', typed); $('#ideas-dq').addEventListener('input', typed);
  $('#ideas-cf').addEventListener('submit', event => { event.preventDefault(); ask($('#ideas-q').value); });
  $('#ideas-dock').addEventListener('submit', event => { event.preventDefault(); ask($('#ideas-dq').value); });
  // Phones: once the hero's field has scrolled away and there is a stream, the field docks at the foot like a composer.
  let heroSeen = true;
  const phone = matchMedia('(max-width: 720px)');
  function dock() { const on = phone.matches && !heroSeen && !root.hidden && !!$('#ideas-stream .vi-group'); $('#ideas-dock').hidden = !on; root.classList.toggle('is-docked', on); }
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { for (const e of entries) heroSeen = e.isIntersecting; dock(); }).observe($('#ideas-cf'));
  phone.addEventListener?.('change', dock);
  window.addEventListener('ww:route', event => {
    const bits = event.detail;
    if (bits[0] !== 'watchlist') { if (ticking) { clearInterval(ticking); ticking = null; } return; }
    who = bits[1] === 'creator' && bits[2] ? bits[2] : null; render(); ensureTick();
  });
  window.addEventListener('ww:store', () => { if (store) load(); });
  // An in-page confirmation, because a Claude artifact cannot show the browser's own confirm box.
  function confirmBox(message, yes = 'Confirm') {
    const dialog = document.querySelector('#ww-confirm');
    return new Promise(resolve => {
      dialog.querySelector('#ww-confirm-text').textContent = message;
      dialog.querySelector('#ww-confirm-yes').textContent = yes;
      const back = document.activeElement;
      const done = value => { dialog.onclose = null; if (dialog.open) dialog.close(); back?.focus?.(); resolve(value); };
      dialog.querySelector('#ww-confirm-yes').onclick = () => done(true);
      dialog.querySelector('#ww-confirm-no').onclick = () => done(false);
      dialog.onclose = () => done(false);
      dialog.showModal();
    });
  }
  // Add to a topic: a new topic, or the video as another source for an existing one (the dialog in index.html).
  const topicDialog = document.querySelector('#topic-dialog'), topicForm = document.querySelector('#topic-form'), existing = document.querySelector('#topic-existing'), topicStatus = document.querySelector('#topic-dialog-status');
  let saving = null;
  function openTopicDialog(id) {
    if (!data.ready) { announce('Topics need the app’s saved data, which is not available here.'); return; }
    const video = data.videos.find(v => v.id === id); if (!video) return;
    saving = video;
    document.querySelector('#topic-dialog-video').textContent = video.title+' · '+video.creator;
    const open = data.topics.filter(t => t.status !== 'posted');
    existing.innerHTML = open.length ? open.map(t => '<option value="'+esc(t.id)+'">'+esc(t.title)+(t.recordDate ? ' · '+short(t.recordDate+'T12:00:00Z') : '')+'</option>').join('') : '<option value="">No open topics yet</option>';
    topicForm.elements['topic-dest'].value = 'new'; existing.disabled = true;
    topicForm.querySelector('[value=existing]').disabled = !open.length;
    topicStatus.textContent = ''; topicDialog.showModal();
  }
  topicForm.addEventListener('change', () => { existing.disabled = topicForm.elements['topic-dest'].value !== 'existing'; });
  document.querySelector('#topic-dialog-close').addEventListener('click', () => topicDialog.close());
  topicForm.addEventListener('submit', async event => {
    event.preventDefault(); if (!saving) return;
    const button = topicForm.querySelector('[type=submit]'), toExisting = topicForm.elements['topic-dest'].value === 'existing';
    button.disabled = true; topicStatus.textContent = 'Saving…';
    try { await api('/topic', toExisting ? {videoId:saving.id, topicId:existing.value} : {videoId:saving.id, status:'shortlisted'}); seen.add(saving.id); keepSeen(); topicDialog.close(); await load(); announce(toExisting ? 'Added to the topic as another source.' : 'Saved on the Topics shortlist.'); }
    catch (error) { topicStatus.textContent = error.message; }
    finally { button.disabled = false; }
  });
  // Shared with Topics, Schedule and the creator page so every screen uses one data load and one request helper.
  window.WWIdeas = {api, esc, ask:confirmBox, thumb, spark, topicsFor, get data() { return data; }, reload: () => load(), openTopicDialog};
  load();
})();
