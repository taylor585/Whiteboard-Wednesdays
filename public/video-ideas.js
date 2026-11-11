/* Creator watchlist: the upload inbox (Taylor's pick W2-B, 26 October 2026).
   New uploads are grouped by week. Each one is sparked into Topics or marked seen; seen marks are a
   per-browser convenience kept in localStorage. Creators are listed by name and open their own page. */
(() => {
  'use strict';
  const root = document.querySelector('#video-ideas');
  const $ = s => root.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data = {creators:[], videos:[], topics:[], configured:false, ready:false}, busy = false, candidate = null, who = null, saving = null, scanNoteUntil = 0;
  // The chosen week tab (Taylor, 11 November 2026: "This week ... is going to be the most important"). Memory only.
  let tab = 'week', undoSeen = null, undoBook = null;
  // The Refresh press in the Claude app: one scan at a time, followed through scans/<id> (SCAN.md).
  //   phase: 'asking' (saving the request) → 'starting' → 'running' → 'loading' (re-reading uploads.json) → 'done'
  //          | 'refused' (the session could not start: the line to send instead) | 'failed'
  let scan = null;
  const M = window.WWMotion;
  const date = value => new Intl.DateTimeFormat('en-GB', {weekday:'short',day:'numeric',month:'short'}).format(new Date(value));
  const short = value => new Intl.DateTimeFormat('en-GB', {day:'numeric',month:'short'}).format(new Date(value));
  const DAY = 86400000, WINDOW = 30;
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
  function announce(message, extra = '') { $('#ideas-status').innerHTML = esc(message)+(extra ? ' '+extra : ''); }
  // Seen marks live only in this browser. Storage can be unavailable, so every access is guarded.
  const seen = new Set((() => { try { return JSON.parse(localStorage.getItem('ww-seen') || '[]'); } catch { return []; } })());
  function keepSeen() { try { localStorage.setItem('ww-seen', JSON.stringify([...seen].slice(-800))); } catch { /* seen marks just will not persist */ } }
  // Thumbnails: the stored image first, then YouTube's always-16:9 medium size, then a plain initial.
  // A 16:9 frame with object-fit:cover crops the black bars that YouTube bakes into 4:3 sizes.
  const safeThumb = url => /^https:\/\/i[0-9]?\.ytimg\.com\//.test(url || '') ? url : '';
  function thumb(v, name) {
    const first = safeThumb(v.thumbnail), fallback = /^[A-Za-z0-9_-]{6,20}$/.test(v.id) ? 'https://i.ytimg.com/vi/'+v.id+'/mqdefault.jpg' : '';
    const src = first || fallback;
    const initial = '<span class="vi-thumb-empty" aria-hidden="true">'+esc((name || '?').trim().charAt(0).toUpperCase())+'</span>';
    return '<a class="vi-thumb" data-own-fallback data-name="'+esc(name || '?')+'" href="https://www.youtube.com/watch?v='+encodeURIComponent(v.id)+'" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">'+(src ? '<img src="'+esc(src)+'"'+(first && fallback && first !== fallback ? ' data-fallback="'+esc(fallback)+'"' : '')+' width="320" height="180" loading="lazy" alt="">' : initial)+'</a>';
  }
  // YouTube answers a missing video with a 120×90 grey stand-in rather than an error, so treat that as missing too.
  // Listening on the document covers thumbnails on the creator page and in Topics as well.
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
  // Shared by the creator page and Topics: one spark makes a new topic with the video as its source.
  async function spark(id) {
    if (!data.ready) { announce('Topics need the app’s saved data, which is not available here.'); return false; }
    try { await api('/topic', {videoId:id}); seen.add(id); keepSeen(); scanNoteUntil = Date.now() + 8000; await load(); announce('Sparked into Topics. It waits on the shortlist.'); return true; }
    catch (error) { announce(error.message); return false; }
  }
  // Avatar shelf, design WL-B (Taylor, 30 October 2026): creators with new uploads first, a yellow count, and a grid of everyone behind "All".
  const initials = name => name.replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  const SHELF = 9;
  function whoList() {
    const counts = new Map();
    for (const v of unread(recent())) counts.set(v.handle, (counts.get(v.handle) || 0) + 1);
    const all = unread(recent()).length;
    const order = [...data.creators].sort((a, b) => (counts.get(b.handle) || 0) - (counts.get(a.handle) || 0));
    const shown = order.slice(0, SHELF);
    if (who && !shown.some(c => c.handle === who)) { const c = order.find(x => x.handle === who); if (c) shown[SHELF - 1] = c; }
    const av = c => '<button type="button" class="vi-av'+(counts.get(c.handle) ? '' : ' is-quiet')+'" data-who="'+esc(c.handle)+'" aria-pressed="'+(who === c.handle)+'"><span class="vi-mono" aria-hidden="true">'+esc(initials(c.name))+'</span>'+(counts.get(c.handle) ? '<b>'+counts.get(c.handle)+'<span class="vi-sr"> new</span></b>' : '')+'<span class="vi-av-name">'+esc(c.name)+'</span></button>';
    $('#ideas-who').innerHTML = '<button type="button" class="vi-av is-all" data-who="" aria-pressed="'+!who+'"><span class="vi-mono" aria-hidden="true">ALL</span>'+(all ? '<b>'+all+'<span class="vi-sr"> new</span></b>' : '')+'<span class="vi-av-name">Everyone</span></button>'+shown.map(av).join('')+
      (data.creators.length > SHELF ? '<button type="button" class="vi-av is-more" data-more aria-expanded="'+!$('#ideas-grid').hidden+'" aria-controls="ideas-grid"><span class="vi-mono" aria-hidden="true">+'+(data.creators.length - SHELF)+'</span><span class="vi-av-name">All '+data.creators.length+'</span></button>' : '');
    $('#ideas-grid').innerHTML = [...data.creators].sort((a, b) => a.name.localeCompare(b.name)).map(c => '<button type="button" data-who="'+esc(c.handle)+'" aria-pressed="'+(who === c.handle)+'"><span class="vi-mono" aria-hidden="true">'+esc(initials(c.name))+'</span><span>'+esc(c.name)+'</span>'+(counts.get(c.handle) ? '<b>'+counts.get(c.handle)+'</b>' : '')+'</button>').join('');
  }
  // Command strip, design W3-A: the connection as a status light beside the search and the three actions.
  function connection() {
    const last = data.creators.map(c => c.lastSuccess).filter(Boolean).sort().pop();
    $('#ideas-conn').innerHTML = data.configured
      ? '<i class="vi-lamp is-on" aria-hidden="true"></i><span><b>'+(data.store === 'claude' ? 'Public feeds' : 'YouTube connected')+'</b><span>'+(busy ? 'Asking for the latest…' : last ? 'Fetched '+date(last) : 'Not fetched yet')+' · '+data.creators.length+' creators</span></span>'
      : '<i class="vi-lamp" aria-hidden="true"></i><span><b>Not connected</b><span>Uploads need the YouTube connection</span></span>';
  }
  function item(v) {
    const linked = topicsFor(v.id), isNew = !seen.has(v.id) && !linked.length, url = 'https://www.youtube.com/watch?v='+encodeURIComponent(v.id);
    const creator = data.creators.find(c => c.handle === v.handle);
    return '<article class="vi-mail'+(isNew ? '' : ' is-read')+(linked.length ? ' is-sparked' : '')+'" data-video="'+esc(v.id)+'"><span class="vi-dot" '+(isNew ? 'role="img" aria-label="New"' : 'aria-hidden="true"')+'></span>'+thumb(v, v.creator)+
      '<div class="vi-mail-body"><a class="vi-chip" href="#/creator/'+encodeURIComponent(v.handle)+'">'+esc(creator?.name || v.creator)+'</a><h4><a href="'+url+'" target="_blank" rel="noopener noreferrer">'+esc(v.title)+'</a></h4><span class="vi-mail-meta"><time datetime="'+esc(v.publishedAt)+'">'+date(v.publishedAt)+'</time></span></div>'+
      '<div class="vi-mail-actions">'+(linked.length ? '<a class="vi-in" href="#/topics">In Topics ✓</a>' : '<button type="button" class="vi-dark" data-spark="'+esc(v.id)+'">Spark a topic</button>')+
      (!linked.length || linked.some(t => !t.recordDate) ? '<button type="button" class="vi-book" data-book="'+esc(v.id)+'">Add to schedule</button>' : '')+
      '<button type="button" class="vi-link" data-topic="'+esc(v.id)+'">Add to a topic</button>'+(isNew ? '<button type="button" class="vi-link" data-seen="'+esc(v.id)+'">Seen</button>' : !linked.length && seen.has(v.id) ? '<button type="button" class="vi-link" data-unseen="'+esc(v.id)+'">Unseen</button>' : '')+'</div></article>';
  }
  // Four plain text tabs (Taylor, 11 November 2026): This week is the default and always there; search works inside the tab.
  const TABS = [['week', 'This week', 0, 7, 'this week'], ['last', 'Last week', 7, 14, 'last week'], ['month', 'Earlier this month', 14, WINDOW, 'earlier this month'], ['all', 'All', 0, WINDOW, 'in the last '+WINDOW+' days']];
  const ageOf = v => (Date.now() - Date.parse(v.publishedAt)) / DAY;
  const inTab = (k, v) => { const t = TABS.find(x => x[0] === k); const a = ageOf(v); return a >= t[2] && a < t[3]; };
  const lastChecked = () => data.fetchedAt || data.creators.map(c => c.lastSuccess).filter(Boolean).sort().pop() || null;
  function feed() {
    const query = $('#ideas-search').value.trim().toLocaleLowerCase();
    const list = recent().filter(v => (!who || v.handle === who) && v.title.toLocaleLowerCase().includes(query)).sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
    const creator = who && data.creators.find(c => c.handle === who);
    let head = creator ? '<div class="vi-feed-head"><h2>'+esc(creator.name)+'</h2><a href="#/creator/'+encodeURIComponent(creator.handle)+'">Open '+esc(creator.name)+'’s page →</a></div>' : '';
    if (!data.configured && !data.videos.length) {
      $('#ideas-feed').innerHTML = head+'<div class="vi-empty"><h2>Uploads arrive here once YouTube is connected.</h2><p>Live retrieval still needs Google API approval and its key. Your '+data.creators.length+' creators are listed by name; open any of them to see their page and your notes.</p></div>'; return;
    }
    const counts = Object.fromEntries(TABS.map(([k]) => [k, list.filter(v => inTab(k, v)).length]));
    const tabs = '<div class="vi-tabs" role="group" aria-label="Uploads by week">'+TABS.map(([k, name]) => '<button type="button" data-tab="'+k+'" aria-pressed="'+(tab === k)+'"'+(tab === k && M ? M.attr('vi-tab', 'draw') : '')+'>'+name+' <span class="vi-tab-n">'+counts[k]+'</span></button>').join('')+'</div>';
    const here = list.filter(v => inTab(tab, v)), t = TABS.find(x => x[0] === tab);
    if (!here.length) {
      let message;
      if (query) {
        const elsewhere = TABS.filter(([k]) => k !== tab && k !== 'all' && counts[k]);
        message = elsewhere.length
          ? '<h2>No matches '+esc(t[4])+'.</h2><p>'+elsewhere.map(([k, name]) => '<button type="button" class="vi-link" data-tab="'+k+'">'+counts[k]+' in '+esc(name)+'</button>').join(' · ')+'</p>'
          : '<h2>No headlines match.</h2><p>Try another search'+(who ? ' or choose all creators' : '')+'.</p>';
      } else {
        const last = lastChecked();
        message = '<h2>No uploads '+(tab === 'week' ? 'this week yet' : esc(t[4]))+'.</h2><p>'+(last ? 'Last checked '+esc(date(last))+'.' : 'Not checked yet.')+'</p><p><button type="button" data-refresh>'+(scanBusy() ? 'Refreshing…' : 'Refresh uploads')+'</button></p>';
      }
      $('#ideas-feed').innerHTML = head+tabs+'<div class="vi-empty">'+message+'</div>'; return;
    }
    const groups = tab === 'all' ? TABS.slice(0, 3) : [t];
    $('#ideas-feed').innerHTML = head+tabs+groups.map(([k, label]) => {
      const part = here.filter(v => inTab(k, v));
      return part.length ? '<div class="vi-group'+(tab === 'all' ? '' : ' is-tab')+'">'+(tab === 'all' ? '<h3 class="micro">'+label+'</h3>' : '')+part.map(item).join('')+'</div>' : '';
    }).join('');
  }
  function tray() {
    const waiting = (data.topics || []).filter(t => t.sources.length && !t.recordDate && ['new','shortlisted'].includes(t.status));
    $('#ideas-tray').innerHTML = '<h2 class="micro" id="ideas-tray-h">TOPICS TRAY</h2><p>Sparked videos wait on the Topics shortlist for Monday’s planning.</p>'+(waiting.length ? '<ol>'+waiting.slice(0, 8).map(t => '<li>'+esc(t.title)+'</li>').join('')+'</ol>' : '<p class="vi-tray-empty">Nothing sparked yet.</p>')+'<a class="vi-tray-go" href="#/topics">Open Topics →</a>';
  }
  function render() {
    const fresh = unread(recent()).length;
    $('#ideas-heading').textContent = fresh ? fresh+' new since you last looked' : 'Creator watchlist';
    // Never silently off: a press always answers, and while a scan is under way the label says so.
    const running = busy || scanBusy();
    $('#ideas-refresh').disabled = running;
    $('#ideas-refresh').innerHTML = '<span aria-hidden="true">↻</span> '+(running ? 'Refreshing…' : 'Refresh');
    scanLine();
    $('#ideas-add').disabled = data.canAdd === false || !data.configured;
    $('#ideas-add').title = data.canAdd === false ? 'Adding a channel needs the YouTube API. Ask Claude to add it to the list.' : '';
    $('#ideas-seen').disabled = !fresh;
    $('#ideas-seen-label').textContent = fresh ? 'Mark '+fresh+' seen' : 'Mark all seen';
    const failed = data.creators.filter(c => c.error);
    $('#ideas-warning').hidden = !failed.length;
    $('#ideas-warning').textContent = failed.length + ' creator refresh'+(failed.length===1?'':'es')+' failed. Previously loaded videos remain visible. Retry refresh to check for missing uploads.';
    // The inbox is heavy (hundreds of cards), so draw it only while the screen is showing; the route handler draws it on open.
    if (root.hidden) { root.dataset.stale = '1'; return; }
    delete root.dataset.stale; connection(); whoList(); feed(); tray();
  }
  function emit() { window.dispatchEvent(new CustomEvent('ww:data', {detail:data})); }
  async function load(auto=false) {
    try { data = {...await api(''), ready:true}; data.topics ||= []; render(); emit(); if (Date.now() > scanNoteUntil) announce(data.configured ? 'Watchlist loaded. Refresh to check for new uploads.' : 'Uploads have not been fetched yet. Press Refresh uploads.'); if(auto && data.store !== 'claude' && location.hash.startsWith('#/watchlist') && data.configured && data.creators.some(c=>!c.lastSuccess || Date.now()-Date.parse(c.lastSuccess)>=3600000)) await refresh(); }
    catch (error) {
      try { const response = await fetch('creators.json'); const seed = await response.json(); data.creators = seed.creators; } catch { /* Keep the readable connection error. */ }
      if (!store && window.WWStore) { store = await window.WWStore.connect().catch(() => null); if (store) return load(auto); }
      data.ready = false; render(); emit(); announce(error.message);
    }
  }
  // ---- Refresh in the Claude app (Taylor, 11 November 2026: "when I hit refresh, it does not actually do anything") ----
  const STUCK = {starting:15*60000, running:40*60000};
  const scanBusy = () => !!scan && ['asking','starting','running','loading'].includes(scan.phase);
  const sessionLink = () => scan?.session?.url ? ' <a href="'+esc(scan.session.url)+'" target="_blank" rel="noopener noreferrer">Open the session</a>' : '';
  function scanLine() {
    const el = $('#ideas-scan'); if (!el) return;
    if (!scan) { el.hidden = true; el.innerHTML = ''; return; }
    const late = STUCK[scan.phase] && Date.now() - scan.since > STUCK[scan.phase];
    const d = '<i class="vi-diamond" aria-hidden="true"></i>';
    let cls = '', html = '';
    if (scan.phase === 'asking') html = d+'<span>Starting…</span>';
    else if (late) { cls = ' is-fail'; html = d+'<span>'+(scan.phase === 'starting' ? 'The session has not started yet.' : 'The session has not reported back.')+'</span>'+sessionLink()+' <button type="button" class="vi-link" data-rescan>Try again</button>'; }
    else if (scan.phase === 'starting') html = d+'<span>Starting a Claude Code session…</span>'+sessionLink();
    else if (scan.phase === 'running') html = d+'<span>Fetching uploads…</span>'+sessionLink();
    else if (scan.phase === 'loading') html = d+'<span>Loading the new uploads…</span>';
    else if (scan.phase === 'done') { cls = ' is-ok'; const mins = Math.floor((Date.now() - scan.since) / 60000); html = d+'<span>Updated '+(mins < 1 ? 'just now' : mins === 1 ? '1 minute ago' : mins+' minutes ago')+' · '+scan.fresh+' new</span>'; }
    else if (scan.phase === 'refused') { cls = ' is-fail'; html = d+'<span>'+esc(scan.why)+' Send this in a Claude chat instead:</span> <code>'+esc(scan.line)+'</code> <button type="button" class="vi-link" data-copy="'+esc(scan.line)+'">Copy</button> <button type="button" class="vi-link" data-rescan>Try again</button>'; }
    else { cls = ' is-fail'; html = d+'<span>The refresh did not finish. '+esc(scan.error || 'No reason was given.')+'</span>'+sessionLink()+' <button type="button" class="vi-link" data-rescan>Try again</button>'; }
    el.className = 'vi-scan'+cls; el.innerHTML = html; el.hidden = false;
  }
  function setScan(patch) { const moved = patch.phase && patch.phase !== scan?.phase; scan = {...scan, ...patch}; if (moved) scan.since = Date.now(); render(); }
  function follow(id) {
    scan.unsub?.();
    const unsub = store?.watchDoc?.('scans', id, doc => {
      if (!doc || scan?.id !== id || ['loading','done'].includes(scan.phase)) return;
      if (doc.session?.url && !scan.session?.url) scan.session = doc.session;
      if (doc.status === 'running') setScan({phase:'running'});
      else if (doc.status === 'starting' && scan.phase !== 'running') setScan({phase:'starting'});
      else if (doc.status === 'done') finish(doc);
      else if (doc.status === 'failed') { scan.unsub?.(); scan.unsub = null; setScan({phase:'failed', error:String(doc.reason || doc.error || doc.note || '').slice(0, 300)}); }
    });
    scan.unsub = typeof unsub === 'function' ? unsub : null;
  }
  async function finish(doc) {
    scan.unsub?.(); scan.unsub = null;
    const before = new Set(data.videos.map(v => v.id));
    setScan({phase:'loading'});
    try { await store.reloadUploads({fresh:true}); } catch { /* load() below still redraws */ }
    await load();
    const fresh = data.videos.filter(v => !before.has(v.id)).length;
    scanNoteUntil = Date.now() + 60000;
    setScan({phase:'done', fresh, fetched:doc.fetched});
    announce(fresh ? fresh+' new upload'+(fresh === 1 ? '' : 's')+' since the last check.' : 'No new uploads since the last check.');
  }
  async function startScan() {
    scan?.unsub?.(); scan = null; setScan({phase:'asking', id:null, session:null});
    try {
      const r = await api('/refresh', {});
      scan.id = r.id;
      if (r.started) setScan({phase:'starting', session:r.session}); else setScan({phase:'refused', why:r.why, line:r.line});
      follow(r.id);
    } catch (error) { setScan({phase:'failed', error:error.message}); }
  }
  async function refresh() {
    if (busy || scanBusy()) return;
    if (data.store === 'claude') return startScan();
    if (!data.configured) { announce(data.ready ? 'Refreshing needs the YouTube connection, which is not set up yet.' : 'Refreshing needs the Claude app’s saved data, which this preview does not have.'); return; }
    busy = true; render(); let successes=0, failures=0;
    for (const [index,c] of data.creators.entries()) {
      announce('Checking '+c.name+' · '+(index+1)+' of '+data.creators.length);
      try { await api('/refresh',{handle:c.handle}); successes++; }
      catch { failures++; }
    }
    busy=false; await load(); announce('Refresh finished: '+successes+' creators updated'+(failures?', '+failures+' could not be refreshed.':'.')); render();
  }
  function choose(handle) {
    who = handle || null; render();
    history.replaceState(null, '', who ? '#/watchlist/creator/'+encodeURIComponent(who) : '#/watchlist');
  }
  $('#ideas-refresh').addEventListener('click', refresh);
  $('#ideas-search').addEventListener('input', () => feed());
  $('#ideas-seen').addEventListener('click', () => { undoSeen = [...seen]; for (const v of recent()) seen.add(v.id); keepSeen(); render(); scanNoteUntil = Date.now() + 60000; announce('All caught up.', '<button type="button" class="vi-link" data-undo-seen>Undo</button>'); });
  // Add to schedule (Taylor, 11 November 2026): the video becomes a planned topic on the next free recording day.
  async function book(id) {
    if (!data.ready) { announce('Scheduling needs the app’s saved data, which is not available here.'); return false; }
    const P = window.WWStore?.posting, slot = P?.nextFreeSlot(data.topics, P.today());
    if (!slot) { announce('No free recording day was found.'); return false; }
    const at = iso => date(iso+'T12:00:00Z'), post = P.dateFor(data.topics, slot);
    const linked = topicsFor(id).find(t => !t.recordDate), wasSeen = seen.has(id);
    try {
      if (linked) {
        await api('/topic-update', {id:linked.id, recordDate:slot, ...(['new','shortlisted'].includes(linked.status) ? {status:'planned'} : {})});
        undoBook = {id:linked.id, created:false, status:linked.status, video:id, wasSeen};
      } else {
        const r = await api('/topic', {videoId:id, recordDate:slot});
        if (r.recordDate !== slot) await api('/topic-update', {id:r.id, recordDate:slot, status:'planned'});
        undoBook = {id:r.id, created:true, video:id, wasSeen};
      }
    } catch (error) { announce(error.message); return false; }
    seen.add(id); keepSeen(); scanNoteUntil = Date.now() + 60000; await load();
    announce('Booked for '+at(slot)+(post ? ' · posts '+at(post) : '')+'.', '<button type="button" class="vi-link" data-undo-book>Undo</button> <a href="#/schedule">Open Schedule →</a>');
    return true;
  }
  async function unbook() {
    const u = undoBook; if (!u) return; undoBook = null;
    try {
      if (u.created) await api('/topic-delete', {id:u.id});
      else await api('/topic-update', {id:u.id, recordDate:null, status:u.status});
    } catch (error) { announce(error.message); return; }
    if (!u.wasSeen) { seen.delete(u.video); keepSeen(); }
    scanNoteUntil = Date.now() + 8000; await load(); announce(u.created ? 'Undone: the booking and its topic are gone.' : 'Undone: the topic is off the schedule again.');
  }
  root.addEventListener('click', async event => {
    const b = event.target.closest('button'); if (!b) return;
    if (b.dataset.more !== undefined) { const g = $('#ideas-grid'); g.hidden = !g.hidden; b.setAttribute('aria-expanded', String(!g.hidden)); return; }
    if (b.dataset.who !== undefined) { const fromGrid = !!b.closest('#ideas-grid'); if (fromGrid) $('#ideas-grid').hidden = true; choose(b.dataset.who); $('#ideas-who [data-who="'+CSS.escape(b.dataset.who)+'"]')?.focus(); return; }
    if (b.dataset.seen) { seen.add(b.dataset.seen); keepSeen(); render(); $('[data-unseen="'+CSS.escape(b.dataset.seen)+'"]')?.focus(); return; }
    if (b.dataset.unseen) { seen.delete(b.dataset.unseen); keepSeen(); render(); $('[data-seen="'+CSS.escape(b.dataset.unseen)+'"]')?.focus(); return; }
    if (b.dataset.undoSeen !== undefined) { if (undoSeen) { seen.clear(); for (const id of undoSeen) seen.add(id); keepSeen(); undoSeen = null; render(); announce('Undone: those uploads are new again.'); } return; }
    if (b.dataset.undoBook !== undefined) { b.disabled = true; await unbook(); return; }
    if (b.dataset.book) { b.disabled = true; b.textContent = 'Booking…'; if (!await book(b.dataset.book)) { b.disabled = false; b.textContent = 'Add to schedule'; } return; }
    if (b.dataset.tab) { if (tab !== b.dataset.tab) { tab = b.dataset.tab; M?.stamp('vi-tab'); feed(); } $('#ideas-feed [data-tab="'+tab+'"][aria-pressed]')?.focus(); return; }
    if (b.dataset.refresh !== undefined || b.dataset.rescan !== undefined) { refresh(); return; }
    if (b.dataset.copy) { try { await navigator.clipboard.writeText(b.dataset.copy); announce('Copied. Paste it into a Claude chat.'); } catch { announce('Copy this line into a Claude chat: '+b.dataset.copy); } return; }
    if (b.dataset.spark) { b.disabled = true; b.textContent = 'Sparking…'; if (!await spark(b.dataset.spark)) { b.disabled = false; b.textContent = 'Spark a topic'; } return; }
    if (b.dataset.topic) openTopicDialog(b.dataset.topic);
  });
  // Add to a topic: a new topic, or add the video as another source for an existing one.
  const topicDialog = document.querySelector('#topic-dialog'), topicForm = document.querySelector('#topic-form'), existing = document.querySelector('#topic-existing'), topicStatus = document.querySelector('#topic-dialog-status');
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
    try {
      await api('/topic', toExisting ? {videoId:saving.id, topicId:existing.value} : {videoId:saving.id});
      seen.add(saving.id); keepSeen();
      topicDialog.close(); await load(); announce(toExisting ? 'Added to the topic as another source.' : 'Saved as a new topic. Find it on the Topics shortlist.');
    } catch (error) { topicStatus.textContent = error.message; }
    finally { button.disabled = false; }
  });
  const dialog=document.querySelector('#creator-dialog'), form=document.querySelector('#creator-form'), handle=document.querySelector('#creator-handle'), status=document.querySelector('#creator-status'), confirm=document.querySelector('#creator-confirm');
  $('#ideas-add').addEventListener('click',()=>{candidate=null;confirm.hidden=true;status.textContent='';dialog.showModal();handle.focus();});
  document.querySelector('#creator-close').addEventListener('click',()=>dialog.close());
  handle.addEventListener('input',()=>{candidate=null;confirm.hidden=true;status.textContent='';});
  form.addEventListener('submit',async event=>{event.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;status.textContent='Looking up this creator…';try{candidate=await api('/resolve',{handle:handle.value});status.textContent=candidate.name+' · '+candidate.handle;confirm.hidden=false;}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});
  confirm.addEventListener('click',async()=>{if(!candidate)return;confirm.disabled=true;try{await api('/creators',{handle:candidate.handle});dialog.close();await load();announce(candidate.name+' added. Refresh to load their uploads.');}catch(error){status.textContent=error.message;}finally{confirm.disabled=false;}});
  window.addEventListener('ww:route', event => {
    const bits = event.detail;
    if (bits[0] !== 'watchlist') return;
    who = bits[1] === 'creator' && bits[2] ? bits[2] : null; render();
    if (data.ready && data.store !== 'claude' && data.configured && data.creators.some(c=>!c.lastSuccess || Date.now()-Date.parse(c.lastSuccess)>=3600000)) refresh();
  });
  window.addEventListener('ww:store', () => { if (store) load(); });
  // An in-page confirmation, because a Claude artifact cannot show the browser's own confirm box.
  function ask(message, yes='Confirm') {
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
  // Shared with Topics, Schedule and the creator page so every screen uses one data load and one request helper.
  window.WWIdeas = {api, esc, ask, thumb, spark, topicsFor, get data() { return data; }, reload: () => load(), openTopicDialog};
  load(location.hash.startsWith('#/watchlist') || location.hash.startsWith('#/video-ideas'));
})();
