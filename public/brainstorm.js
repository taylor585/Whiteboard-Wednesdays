/* Topics: creators and ideas (Taylor's picks TC-C and T2-B, 30 October 2026, replacing the BC table).
   The four-column idea board takes the page (Sparks, Shortlist, then the Recording and Posting
   schedules side by side) and the creators sit beside it as cards; choosing one opens its profile
   over the rail, so the board never moves. Wednesday's video posts
   the next Tuesday and Friday's the next Thursday (PROCESS.md), unless a post date is set by hand. */
(() => {
  'use strict';
  const root = document.querySelector('#brainstorm');
  if (!root || !window.WWIdeas) return;
  const {api, esc, ask} = window.WWIdeas;
  const $ = s => root.querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
  const parse = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d, 12); };
  const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
  const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 12); };
  const monday = d => add(d, -((d.getDay()+6) % 7));
  const fmt = (d, o={weekday:'short',day:'numeric',month:'short'}) => new Intl.DateTimeFormat('en-GB', o).format(d);
  const ago = v => { const days = Math.floor((Date.now() - Date.parse(v)) / 86400000); return days < 1 ? 'today' : days === 1 ? 'yesterday' : days < 7 ? days+' days ago' : Math.floor(days/7) === 1 ? '1 week ago' : Math.floor(days/7)+' weeks ago'; };
  const SPARK_DAYS = 14, OPEN = ['new','shortlisted','planned'], DAY = 86400000;
  // From Saturday the board looks ahead to next week, so Monday's planning can start at the weekend.
  const current = () => monday(add(today(), 2));
  let week = current(), spark = null, drag = null, picked = null, ticked = new Set(), scanned = null;
  const data = () => window.WWIdeas.data;
  const topics = () => data().topics || [];
  const status = message => { $('#bs-status').textContent = message; };
  const postOf = t => t.postDate ? parse(t.postDate) : t.recordDate ? add(parse(t.recordDate), 6) : null;
  // One index per data load: each creator's uploads newest first, the last 14 days, and a per-day count.
  // Built once and reused, so a tap on a card costs nothing measurable even with 600+ videos loaded.
  let idxFor = null, idx = new Map(), sortedAll = [];
  function index() {
    const vids = data().videos || [];
    if (idxFor === vids) return idx;
    idxFor = vids; idx = new Map(); const now = Date.now(), cut = now - SPARK_DAYS*DAY;
    sortedAll = vids.map(v => ({v, t:Date.parse(v.publishedAt)})).sort((a,b) => b.t - a.t);
    for (const {v, t} of sortedAll) {
      let e = idx.get(v.handle); if (!e) idx.set(v.handle, e = {all:[], recent:[], days:new Array(SPARK_DAYS).fill(0)});
      e.all.push(v);
      if (t >= cut && t <= now) { e.recent.push(v); const d = Math.floor((now - t) / DAY); if (d >= 0 && d < SPARK_DAYS) e.days[SPARK_DAYS-1-d]++; }
    }
    return idx;
  }
  const recentOf = h => index().get(h)?.recent || [];
  const latestOf = h => index().get(h)?.all[0];
  const SCAN_EACH = 5;
  // Sparks: the latest uploads across everyone, or, after Scan for topics, the latest five from each ticked creator.
  const sparks = () => {
    const ix = index();
    if (scanned) return [...scanned].flatMap(h => (ix.get(h)?.all || []).slice(0, SCAN_EACH));
    const cut = Date.now() - SPARK_DAYS*DAY;
    return sortedAll.filter(x => x.t >= cut).slice(0, 12).map(x => x.v);
  };
  const angles = () => topics().filter(t => !t.recordDate && OPEN.includes(t.status));
  const slots = () => [add(week, 2), add(week, 4)].map(d => ({day:d, topic:topics().find(t => t.recordDate === iso(d)), past:iso(d) < iso(today())}));
  async function mutate(path, body, success) {
    try { const result = await api(path, body); await window.WWIdeas.reload(); if (success) status(success); return result; }
    catch (error) {
      if (error.status === 409 && error.result?.conflict && body.recordDate && !body.swap) {
        if (await ask('“'+error.result.conflict.title+'” is already booked for '+fmt(parse(body.recordDate))+'. Swap them?', 'Swap')) return mutate(path, {...body, swap:true}, 'Swapped. “'+error.result.conflict.title+'” moved back to the shortlist.');
        status('Booking cancelled. That day is already taken.'); return null;
      }
      status(error.message); return null;
    }
  }
  const initials = name => name.replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  // Creator cards: busiest first, each with its 14-day upload bars; nothing is drawn without real uploads.
  function bars(h) {
    const days = index().get(h)?.days || new Array(SPARK_DAYS).fill(0);
    const max = Math.max(1, ...days);
    return '<span class="bs-bars" aria-hidden="true">'+days.map(n => '<i style="height:'+(n ? 20+Math.round(n/max*80) : 8)+'%"'+(n ? '' : ' class="z"')+'></i>').join('')+'</span>';
  }
  function cards() {
    const q = $('#bs-find').value.trim().toLowerCase();
    const n = c => recentOf(c.handle).length;
    const list = (data().creators || []).filter(c => !q || c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q)).sort((a,b) => n(b) - n(a) || a.name.localeCompare(b.name));
    const connected = c => data().configured || recentOf(c.handle).length;
    // Tap a card to tick it; Scan for topics pulls the latest five from each ticked creator into Sparks.
    const anyData = (data().creators || []).some(connected);
    $('#bs-cards').innerHTML = '<div id="bs-scanbar-slot"></div>'+(anyData ? '' : '<p class="bs-rail-note">Upload counts appear once the watchlist has fetched uploads.</p>')+(list.length ? list.map(c => '<div class="bs-card'+(ticked.has(c.handle) ? ' is-ticked' : '')+'"><button type="button" class="bs-tick" data-tick="'+esc(c.handle)+'" aria-pressed="'+ticked.has(c.handle)+'"><span class="bs-box" aria-hidden="true"></span><span class="bs-card-who"><span class="bs-mono" aria-hidden="true">'+esc(initials(c.name))+'</span><span><span class="bs-cname">'+esc(c.name)+'</span><span class="bs-chandle">'+esc(c.handle)+'</span></span></span></button>'+(connected(c) ? '<span class="bs-card-ft"><span><b class="bs-count">'+n(c)+'</b> <span class="bs-meta">uploads · 14 d</span></span>'+bars(c.handle)+'</span>' : '')+'<button type="button" class="bs-prof" data-pick="'+esc(c.handle)+'" aria-pressed="'+(picked === c.handle)+'" aria-label="Profile: '+esc(c.name)+'">Profile</button></div>').join('') : '<p class="bs-muted">No creator matches “'+esc(q)+'”.</p>');
  }
  function scanBar() {
    const slot = $('#bs-scanbar-slot'); if (!slot) return;
    const anyData = (data().creators || []).some(c => data().configured || recentOf(c.handle).length);
    slot.innerHTML = ticked.size ? '<div class="bs-scanbar"><span>'+ticked.size+' ticked</span><button type="button" id="bs-scan" class="bs-scan"'+(anyData ? '' : ' disabled')+'>Scan for topics</button><button type="button" class="bs-quiet" id="bs-untick">Clear</button></div>' : '';
  }
  // Uploads per day for the last 14 days, drawn as a small line; nothing is drawn without real uploads.
  function line(h) {
    const days = index().get(h)?.days || new Array(SPARK_DAYS).fill(0);
    const max = Math.max(1, ...days), w = 240, ht = 40;
    const pts = days.map((n, i) => (i*w/(SPARK_DAYS-1)).toFixed(1)+','+(ht-4-n/max*(ht-10)).toFixed(1)).join(' ');
    return '<svg class="bs-line" viewBox="0 0 '+w+' '+ht+'" preserveAspectRatio="none" role="img" aria-label="'+days.reduce((s,n) => s+n, 0)+' uploads in the last 14 days"><polyline points="'+pts+'"/></svg>';
  }
  function profile() {
    const c = (data().creators || []).find(x => x.handle === picked);
    $('#bs-profile').hidden = !c;
    if (!c) { $('#bs-profile').innerHTML = ''; return; }
    const recent = recentOf(c.handle).sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 3);
    const connected = data().configured || recentOf(c.handle).length;
    $('#bs-profile').innerHTML = '<div class="bs-ph"><div><h2>'+esc(c.name)+'</h2><span class="bs-chandle">'+esc(c.handle)+'</span></div><button type="button" class="bs-close" id="bs-close" aria-label="Close profile">✕</button></div>'+
      '<div class="micro">UPLOADS PER DAY · 14 DAYS</div>'+(connected ? line(c.handle) : '<p class="bs-muted">Appears once the YouTube connection is switched on.</p>')+
      '<div class="micro">RECENT HEADLINES</div>'+(recent.length ? '<ul class="bs-heads">'+recent.map(v => '<li><button type="button" data-video="'+esc(v.id)+'" aria-pressed="'+(spark === v.id)+'">'+esc(v.title)+'</button><span class="bs-meta">'+esc(ago(v.publishedAt))+'</span></li>').join('')+'</ul>' : '<p class="bs-muted">'+(connected ? 'No uploads in the last 14 days.' : 'None yet. Live headlines need the YouTube connection.')+'</p>')+
      '<label class="bs-note" for="bs-note-text"><span>Your note</span><textarea id="bs-note-text" rows="3" maxlength="4000" placeholder="Why you follow them, what to watch for"'+(data().ready ? '' : ' disabled')+'>'+esc(c.note || '')+'</textarea></label>'+
      '<div class="bs-pactions"><a class="bs-go" href="#/creator/'+encodeURIComponent(c.handle)+'">Open '+esc(c.name)+'’s page →</a><a class="bs-yt" href="https://www.youtube.com/'+encodeURIComponent(c.handle)+'" target="_blank" rel="noopener noreferrer">YouTube ↗</a></div>';
  }
  function sparkHtml() {
    const list = sparks();
    if (list.length) return list.map(v => '<button type="button" class="bs-spark" data-video="'+esc(v.id)+'" aria-pressed="'+(spark === v.id)+'"><span class="bs-meta">'+esc(v.creator)+' · '+esc(ago(v.publishedAt))+'</span><span class="bs-spark-title">'+esc(v.title)+'</span></button>').join('');
    if (!data().configured) return '<div class="bs-empty"><p><b>Uploads appear here once the Creator watchlist has fetched them.</b></p><p>Press Refresh uploads there, or write your own angles on the shortlist.</p></div>';
    return '<div class="bs-empty"><p>No uploads in the last '+SPARK_DAYS+' days.</p></div>';
  }
  function angleHtml(t) {
    const open = slots().filter(s => !s.past), src = t.sources[0];
    return '<li class="bs-stk" draggable="true" data-topic="'+esc(t.id)+'"><span class="bs-stk-title">'+esc(t.title)+'</span>'+(src ? '<span class="bs-meta">From '+esc(src.creator)+': '+esc(src.title)+'</span>' : '')+
      '<span class="bs-stk-actions">'+open.map(s => '<button type="button" data-book="'+iso(s.day)+'">Book '+esc(fmt(s.day,{weekday:'short',day:'numeric'}))+'</button>').join('')+'<button type="button" class="bs-quiet" data-remove="'+esc(t.id)+'" aria-label="Remove “'+esc(t.title)+'”">Remove</button></span></li>';
  }
  function slotHtml(s) {
    return '<div class="bs-slot'+(s.topic ? ' is-booked' : '')+(s.past ? ' is-past' : '')+'" data-slot="'+iso(s.day)+'"><span class="bs-slot-day">'+esc(fmt(s.day))+'</span><span class="bs-meta">Posts '+esc(fmt(add(s.day, 6)))+'</span>'+
      (s.topic ? '<div class="bs-booked"><span>'+esc(s.topic.title)+'</span><span class="bs-booked-actions"><a href="#/schedule">Schedule →</a>'+(s.past ? '' : '<button type="button" data-unbook="'+esc(s.topic.id)+'">Unbook</button>')+'</span></div>'
        : '<p class="bs-put">'+(s.past ? 'Nothing was recorded.' : 'Drop an angle here, or press Book on the shortlist.')+'</p>')+'</div>';
  }
  // Posting runs alongside: this week's Tuesday and Thursday, then the following week's, when this week's recordings go out.
  function postHtml() {
    const days = [add(week, 1), add(week, 3), add(week, 8), add(week, 10)];
    return days.map((d, i) => {
      const going = topics().filter(t => { const p = postOf(t); return p && iso(p) === iso(d); });
      const past = iso(d) < iso(today());
      return (i === 2 ? '<h3 class="bs-post-sub micro">FROM THIS WEEK’S RECORDINGS</h3>' : '')+'<div class="bs-post'+(going.length ? ' is-set' : '')+(past ? ' is-past' : '')+'"><span class="bs-slot-day">'+esc(fmt(d))+'</span>'+
        (going.length ? going.map(t => '<span class="bs-post-title">'+esc(t.title)+'</span><span class="bs-meta">'+(t.recordDate ? (t.recordDate < iso(today()) ? 'Recorded ' : 'Records ')+esc(fmt(parse(t.recordDate))) : '')+(t.status === 'posted' ? ' · Posted' : '')+'</span>').join('') : '<p class="bs-put">'+(past ? 'Nothing was posted.' : 'Nothing booked to post.')+'</p>')+'</div>';
    }).join('');
  }
  function render() {
    const thisWeek = iso(week) === iso(current());
    $('#bs-week').textContent = (thisWeek ? 'Recording week' : 'Week')+' of '+fmt(week,{day:'numeric',month:'long'});
    $('#bs-today').disabled = thisWeek;
    cards(); scanBar(); profile();
    $('#bs-sparks').innerHTML = (scanned ? '<p class="bs-scanned">Latest '+SCAN_EACH+' from '+scanned.size+' creator'+(scanned.size === 1 ? '' : 's')+' <button type="button" class="bs-quiet" id="bs-untick">Show everyone</button></p>' : '')+sparkHtml();
    const list = angles();
    $('#bs-angles').innerHTML = list.length ? list.map(angleHtml).join('') : '<li class="bs-empty"><p>No angles waiting. Write one below, or spark one from the Creator watchlist.</p></li>';
    const chosen = spark && (data().videos || []).find(v => v.id === spark);
    $('#bs-from').innerHTML = chosen ? 'From: '+esc(chosen.title)+' <button type="button" class="bs-quiet" id="bs-clear">Clear</button>' : '';
    $('#bs-slots').innerHTML = slots().map(slotHtml).join('');
    $('#bs-posts').innerHTML = postHtml();
    const offline = 'Topics need the app’s saved data, which is not available here.';
    if (!data().ready) status(offline); else if ($('#bs-status').textContent === offline) status('');
    $('#bs-form').querySelectorAll('input,button').forEach(el => { el.disabled = !data().ready; });
  }
  async function book(id, day) {
    const t = topics().find(x => x.id === id);
    if (!t) return;
    await mutate('/topic-update', {id, recordDate:day, ...(t.status === 'new' ? {status:'planned'} : {})}, '“'+t.title+'” booked for '+fmt(parse(day))+'. It posts '+fmt(add(parse(day), 6))+'.');
  }
  root.addEventListener('click', async event => {
    const el = event.target.closest('button');
    if (!el) return;
    if (el.dataset.tick) {
      const h = el.dataset.tick, card = el.closest('.bs-card');
      if (ticked.has(h)) ticked.delete(h); else ticked.add(h);
      if (scanned && !ticked.size) { scanned = null; render(); } else { card.classList.toggle('is-ticked', ticked.has(h)); el.setAttribute('aria-pressed', String(ticked.has(h))); scanBar(); }
      $('[data-tick="'+CSS.escape(h)+'"]')?.focus(); return;
    }
    if (el.id === 'bs-scan') { scanned = new Set(ticked); render(); const first = sparks()[0]; status(first ? 'Showing the latest '+SCAN_EACH+' uploads from each of '+scanned.size+' creators. Tap one to write an angle.' : 'No uploads stored for those creators yet. Refresh the Creator watchlist first.'); $('#bs-sparks-h').scrollIntoView({block:'nearest'}); return; }
    if (el.id === 'bs-untick') { ticked.clear(); scanned = null; render(); $('#bs-find').focus(); return; }
    if (el.dataset.pick) { picked = picked === el.dataset.pick ? null : el.dataset.pick; spark = null; render(); (picked ? $('#bs-close') : $('[data-pick="'+CSS.escape(el.dataset.pick)+'"]'))?.focus(); return; }
    if (el.id === 'bs-close') { const was = picked; picked = null; render(); $('[data-pick="'+CSS.escape(was)+'"]')?.focus(); return; }
    if (el.dataset.video) { spark = spark === el.dataset.video ? null : el.dataset.video; render(); $('#bs-title').focus(); return; }
    if (el.id === 'bs-clear') { spark = null; render(); return; }
    if (el.dataset.book) { await book(el.closest('[data-topic]').dataset.topic, el.dataset.book); return; }
    if (el.dataset.unbook) { const t = topics().find(x => x.id === el.dataset.unbook); await mutate('/topic-update', {id:el.dataset.unbook, recordDate:null}, t ? '“'+t.title+'” is back on the shortlist.' : ''); return; }
    if (el.dataset.remove) {
      const t = topics().find(x => x.id === el.dataset.remove);
      if (t && await ask('Remove “'+t.title+'”? Its notes and subtopics are deleted too.', 'Remove')) await mutate('/topic-delete', {id:t.id}, 'Removed “'+t.title+'”.');
      return;
    }
    if (el.id === 'bs-prev') { week = add(week, -7); render(); }
    if (el.id === 'bs-next') { week = add(week, 7); render(); }
    if (el.id === 'bs-today') { week = current(); render(); }
  });
  $('#bs-find').addEventListener('input', () => { cards(); scanBar(); });
  root.addEventListener('change', async event => {
    if (event.target.id !== 'bs-note-text') return;
    const c = (data().creators || []).find(x => x.handle === picked); if (!c) return;
    try { await api('/creator-note', {handle:c.handle, note:event.target.value}); c.note = event.target.value; status('Note on '+c.name+' saved.'); }
    catch (error) { status(error.message); }
  });
  $('#bs-form').addEventListener('submit', async event => {
    event.preventDefault();
    const input = $('#bs-title'), title = input.value.trim();
    if (!title) { status('Write the angle first.'); input.focus(); return; }
    const done = await mutate('/topic', spark ? {title, videoId:spark} : {title}, 'Angle added. Book it into Wednesday or Friday when you are ready.');
    if (done) { input.value = ''; spark = null; render(); input.focus(); }
  });
  root.addEventListener('dragstart', event => { const st = event.target.closest?.('.bs-stk'); if (!st) return; drag = st.dataset.topic; event.dataTransfer.setData('text/plain', drag); event.dataTransfer.effectAllowed = 'move'; st.classList.add('is-dragging'); });
  root.addEventListener('dragend', () => { drag = null; root.querySelectorAll('.is-dragging,.is-over').forEach(el => el.classList.remove('is-dragging','is-over')); });
  root.addEventListener('dragover', event => { const slot = event.target.closest('.bs-slot'); if (!slot || !drag || slot.classList.contains('is-past')) return; event.preventDefault(); slot.classList.add('is-over'); });
  root.addEventListener('dragleave', event => { const slot = event.target.closest('.bs-slot'); if (slot && !slot.contains(event.relatedTarget)) slot.classList.remove('is-over'); });
  root.addEventListener('drop', async event => { const slot = event.target.closest('.bs-slot'); if (!slot || !drag || slot.classList.contains('is-past')) return; event.preventDefault(); slot.classList.remove('is-over'); const id = drag; drag = null; await book(id, slot.dataset.slot); });
  // Do not redraw under someone typing a note; the next data change catches up.
  window.addEventListener('ww:data', () => { if (document.activeElement?.id !== 'bs-note-text') render(); });
  window.addEventListener('ww:route', event => { if (event.detail[0] === 'topics') render(); });
})();
