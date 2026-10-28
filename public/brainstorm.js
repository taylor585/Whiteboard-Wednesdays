/* Topics: creators and ideas (Taylor's pick BC, 26 October 2026, replacing the B2-C whiteboard).
   A creator database with a profile and private note sits above a four-column idea board:
   Sparks, Shortlist, then the Recording and Posting schedules side by side. Wednesday's video posts
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
  let week = current(), spark = null, drag = null, picked = null, sort = 'uploads';
  const data = () => window.WWIdeas.data;
  const topics = () => data().topics || [];
  const status = message => { $('#bs-status').textContent = message; };
  const postOf = t => t.postDate ? parse(t.postDate) : t.recordDate ? add(parse(t.recordDate), 6) : null;
  const recentOf = h => (data().videos || []).filter(v => v.handle === h && Date.parse(v.publishedAt) >= Date.now() - SPARK_DAYS*DAY);
  const latestOf = h => (data().videos || []).filter(v => v.handle === h).sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0];
  const sparks = () => (data().videos || []).filter(v => Date.parse(v.publishedAt) >= Date.now() - SPARK_DAYS*DAY).sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 12);
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
  // Creator database: one row per creator, busiest first by default, with a search box.
  function table() {
    const q = $('#bs-find').value.trim().toLowerCase();
    let list = (data().creators || []).filter(c => !q || c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q));
    const n = c => recentOf(c.handle).length, last = c => Date.parse(latestOf(c.handle)?.publishedAt || 0) || 0;
    list = list.slice().sort((a,b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'latest' ? last(b) - last(a) || a.name.localeCompare(b.name) : n(b) - n(a) || a.name.localeCompare(b.name));
    if (!picked && list[0]) picked = list[0].handle;
    $('#bs-rows').innerHTML = list.length ? list.map(c => {
      const latest = latestOf(c.handle), count = recentOf(c.handle).length;
      return '<tr class="'+(picked === c.handle ? 'is-picked' : '')+'"><th scope="row"><button type="button" data-pick="'+esc(c.handle)+'" aria-pressed="'+(picked === c.handle)+'"><span class="bs-cname">'+esc(c.name)+'</span><span class="bs-chandle">'+esc(c.handle)+'</span></button></th><td class="bs-num">'+(data().configured || latest ? count : '–')+'</td><td>'+(latest ? esc(fmt(new Date(latest.publishedAt),{day:'numeric',month:'short'})) : '–')+'</td><td class="bs-headline">'+(latest ? esc(latest.title) : '<span class="bs-muted">'+(data().configured ? 'No uploads stored' : 'Not connected yet')+'</span>')+'</td></tr>';
    }).join('') : '<tr><td colspan="4" class="bs-muted">No creator matches “'+esc(q)+'”.</td></tr>';
    root.querySelectorAll('[data-sort]').forEach(b => b.setAttribute('aria-pressed', b.dataset.sort === sort));
  }
  // Uploads per day for the last 14 days, drawn as a small line; nothing is drawn without real uploads.
  function line(h) {
    const days = Array.from({length:SPARK_DAYS}, (_, i) => recentOf(h).filter(v => Math.floor((Date.now() - Date.parse(v.publishedAt)) / DAY) === SPARK_DAYS-1-i).length);
    const max = Math.max(1, ...days), w = 240, ht = 40;
    const pts = days.map((n, i) => (i*w/(SPARK_DAYS-1)).toFixed(1)+','+(ht-4-n/max*(ht-10)).toFixed(1)).join(' ');
    return '<svg class="bs-line" viewBox="0 0 '+w+' '+ht+'" preserveAspectRatio="none" role="img" aria-label="'+days.reduce((s,n) => s+n, 0)+' uploads in the last 14 days"><polyline points="'+pts+'"/></svg>';
  }
  function profile() {
    const c = (data().creators || []).find(x => x.handle === picked);
    if (!c) { $('#bs-profile').innerHTML = '<p class="bs-muted">Choose a creator to see their profile.</p>'; return; }
    const recent = recentOf(c.handle).sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 3);
    const connected = data().configured || recentOf(c.handle).length;
    $('#bs-profile').innerHTML = '<div class="bs-ph"><h2>'+esc(c.name)+'</h2><span class="bs-chandle">'+esc(c.handle)+'</span></div>'+
      '<div class="micro">UPLOADS PER DAY · 14 DAYS</div>'+(connected ? line(c.handle) : '<p class="bs-muted">Appears once the YouTube connection is switched on.</p>')+
      '<div class="micro">RECENT HEADLINES</div>'+(recent.length ? '<ul class="bs-heads">'+recent.map(v => '<li><button type="button" data-video="'+esc(v.id)+'" aria-pressed="'+(spark === v.id)+'">'+esc(v.title)+'</button><span class="bs-meta">'+esc(ago(v.publishedAt))+'</span></li>').join('')+'</ul>' : '<p class="bs-muted">'+(connected ? 'No uploads in the last 14 days.' : 'None yet. Live headlines need the YouTube connection.')+'</p>')+
      '<label class="bs-note" for="bs-note-text"><span>Your note</span><textarea id="bs-note-text" rows="3" maxlength="4000" placeholder="Why you follow them, what to watch for"'+(data().ready ? '' : ' disabled')+'>'+esc(c.note || '')+'</textarea></label>'+
      '<div class="bs-pactions"><a class="bs-go" href="#/creator/'+encodeURIComponent(c.handle)+'">Open '+esc(c.name)+'’s page →</a><a class="bs-yt" href="https://www.youtube.com/'+encodeURIComponent(c.handle)+'" target="_blank" rel="noopener noreferrer">YouTube ↗</a></div>';
  }
  function sparkHtml() {
    const list = sparks();
    if (list.length) return list.map(v => '<button type="button" class="bs-spark" data-video="'+esc(v.id)+'" aria-pressed="'+(spark === v.id)+'"><span class="bs-meta">'+esc(v.creator)+' · '+esc(ago(v.publishedAt))+'</span><span class="bs-spark-title">'+esc(v.title)+'</span></button>').join('');
    if (!data().configured) return '<div class="bs-empty"><p><b>Live uploads appear here once the YouTube connection is switched on.</b></p><p>Until then, write your own angles on the shortlist.</p></div>';
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
  function nextUp() {
    const d = current(), list = [add(d, 2), add(d, 4)].map(day => ({day, t:topics().find(t => t.recordDate === iso(day))}));
    $('#bs-nextup').innerHTML = '<span class="micro">Recording next</span>'+list.map(x => '<span class="bs-nextup-item"><b>'+esc(fmt(x.day))+'</b> '+(x.t ? esc(x.t.title) : '<i>Not booked yet</i>')+' <span class="bs-meta">Posts '+esc(fmt(add(x.day, 6)))+'</span></span>').join('');
  }
  function render() {
    const thisWeek = iso(week) === iso(current());
    $('#bs-week').textContent = (thisWeek ? 'Recording week' : 'Week')+' of '+fmt(week,{day:'numeric',month:'long'});
    $('#bs-today').disabled = thisWeek;
    nextUp(); table(); profile();
    $('#bs-sparks').innerHTML = sparkHtml();
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
    if (el.dataset.pick) { picked = el.dataset.pick; spark = null; render(); $('[data-pick="'+CSS.escape(picked)+'"]')?.focus(); return; }
    if (el.dataset.sort) { sort = el.dataset.sort; table(); return; }
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
  $('#bs-find').addEventListener('input', table);
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
