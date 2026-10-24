/* Topics: the Monday brainstorm whiteboard (Taylor's pick B2-C, 24 October 2026).
   Sparks are recent uploads from the creator watchlist, angles are unbooked topics, and the two
   slots are the week's Wednesday and Friday recordings. Wednesday's video posts the next Tuesday,
   Friday's the next Thursday (PROCESS.md). */
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
  const SPARK_DAYS = 14, OPEN = ['new','shortlisted','planned'];
  // From Saturday the board looks ahead to next week, so Monday's brainstorm can start at the weekend.
  const current = () => monday(add(today(), 2));
  let week = current(), creator = null, spark = null, drag = null, showAll = false;
  const RAIL_LIMIT = 11;
  const data = () => window.WWIdeas.data;
  const topics = () => data().topics || [];
  const status = message => { $('#bs-status').textContent = message; };
  const sparks = () => (data().videos || []).filter(v => Date.parse(v.publishedAt) >= Date.now() - SPARK_DAYS*86400000 && (!creator || v.handle === creator)).slice(0, 12);
  const angles = () => topics().filter(t => !t.recordDate && OPEN.includes(t.status));
  const slots = () => [add(week, 2), add(week, 4)].map(d => ({day:d, post:add(d, 6), topic:topics().find(t => t.recordDate === iso(d)), past:iso(d) < iso(today())}));
  async function mutate(path, body, success) {
    try { const result = await api(path, body); await window.WWIdeas.reload(); if (success) status(success); return result; }
    catch (error) {
      if (error.status === 409 && error.result?.conflict && body.recordDate && !body.swap) {
        if (await ask('“'+error.result.conflict.title+'” is already booked for '+fmt(parse(body.recordDate))+'. Swap them?', 'Swap')) return mutate(path, {...body, swap:true}, 'Swapped. “'+error.result.conflict.title+'” moved back to the angles.');
        status('Booking cancelled. That day is already taken.'); return null;
      }
      status(error.message); return null;
    }
  }
  function rail() {
    const counts = new Map();
    for (const v of data().videos || []) if (Date.parse(v.publishedAt) >= Date.now() - SPARK_DAYS*86400000) counts.set(v.handle, (counts.get(v.handle) || 0) + 1);
    const list = (data().creators || []).slice().sort((a,b) => (counts.get(b.handle) || 0) - (counts.get(a.handle) || 0));
    // Square name tiles so every creator is recognisable; the busiest show first and the rest open on request.
    const shown = showAll ? list : list.slice(0, RAIL_LIMIT);
    $('#bs-rail').innerHTML = '<button type="button" class="bs-rc bs-rc-all" data-creator="" aria-pressed="'+!creator+'"><span class="bs-rc-name">All creators</span><b>'+list.length+'</b></button>'
      +shown.map(c => '<button type="button" class="bs-rc" data-creator="'+esc(c.handle)+'" aria-pressed="'+(creator === c.handle)+'"><span class="bs-rc-name">'+esc(c.name)+'</span><b>'+(counts.get(c.handle) ? counts.get(c.handle)+' new' : '<span class="bs-sr">no new uploads</span>')+'</b></button>').join('')
      +(list.length > RAIL_LIMIT ? '<button type="button" class="bs-rc bs-rc-more" id="bs-rail-more" aria-expanded="'+showAll+'">'+(showAll ? 'Show fewer' : 'Show all '+list.length)+'</button>' : '');
  }
  function nextUp() {
    const d = current(), list = [add(d, 2), add(d, 4)].map(day => ({day, t:topics().find(t => t.recordDate === iso(day))}));
    $('#bs-nextup').innerHTML = '<span class="micro">Recording next</span>'+list.map(x => '<span class="bs-nextup-item"><b>'+esc(fmt(x.day,{weekday:'short',day:'numeric',month:'short'}))+'</b> '+(x.t ? esc(x.t.title) : '<i>Not booked yet</i>')+' <span class="bs-meta">Posts '+esc(fmt(add(x.day, 6),{weekday:'short',day:'numeric',month:'short'}))+'</span></span>').join('');
  }
  function sparkHtml() {
    const list = sparks();
    if (list.length) return list.map(v => '<button type="button" class="bs-spark" data-video="'+esc(v.id)+'" aria-pressed="'+(spark === v.id)+'"><span class="bs-meta">'+esc(v.creator)+' · '+esc(ago(v.publishedAt))+'</span><span class="bs-spark-title">'+esc(v.title)+'</span></button>').join('');
    if (!data().configured) return '<div class="bs-empty"><p><b>Live uploads appear here once the YouTube connection is switched on.</b></p><p>Until then, write your own angles. Your creators are listed above.</p></div>';
    return '<div class="bs-empty"><p>No uploads in the last '+SPARK_DAYS+' days'+(creator ? ' from this creator' : '')+'.</p></div>';
  }
  function angleHtml(t, i) {
    const open = slots().filter(s => !s.past);
    const src = t.sources[0];
    return '<li class="bs-stk" draggable="true" data-topic="'+esc(t.id)+'" data-from="'+esc(src ? src.id : '')+'" style="--r:'+[-1.4,1.1,-.6,.8][i % 4]+'deg">'
      +'<span class="bs-stk-title">'+esc(t.title)+'</span>'
      +(src ? '<span class="bs-meta">From '+esc(src.creator)+': '+esc(src.title)+'</span>' : '')
      +'<span class="bs-stk-actions">'+open.map(s => '<button type="button" data-book="'+iso(s.day)+'">Book '+esc(fmt(s.day,{weekday:'short',day:'numeric'}))+'</button>').join('')
      +'<button type="button" class="bs-quiet" data-remove="'+esc(t.id)+'" aria-label="Remove “'+esc(t.title)+'”">Remove</button></span></li>';
  }
  function slotHtml(s) {
    const label = fmt(s.day,{weekday:'short',day:'numeric',month:'short'});
    return '<div class="bs-slot'+(s.topic ? ' is-booked' : '')+(s.past ? ' is-past' : '')+'" data-slot="'+iso(s.day)+'"><span class="bs-slot-day">'+esc(label)+' · Record</span><span class="bs-meta">Posts '+esc(fmt(s.post,{weekday:'short',day:'numeric',month:'short'}))+'</span>'
      +(s.topic ? '<div class="bs-booked"><span>'+esc(s.topic.title)+'</span><span class="bs-booked-actions"><a href="#/schedule">Post &amp; Record →</a>'+(s.past ? '' : '<button type="button" data-unbook="'+esc(s.topic.id)+'">Unbook</button>')+'</span></div>'
        : '<p class="bs-put">'+(s.past ? 'This day has passed.' : 'Drop an angle here, or press Book on an angle.')+'</p>')+'</div>';
  }
  function render() {
    const thisWeek = iso(week) === iso(current());
    $('#bs-week').textContent = (thisWeek ? 'Recording week' : 'Week')+' of '+fmt(week,{day:'numeric',month:'long'});
    $('#bs-today').disabled = thisWeek;
    rail();
    nextUp();
    $('#bs-sparks').innerHTML = sparkHtml();
    const list = angles();
    $('#bs-angles').innerHTML = list.length ? list.map(angleHtml).join('') : '<li class="bs-empty"><p>No open angles yet. Write one below.</p></li>';
    const chosen = spark && (data().videos || []).find(v => v.id === spark);
    $('#bs-from').innerHTML = chosen ? 'From: '+esc(chosen.title)+' <button type="button" class="bs-quiet" id="bs-clear">Clear</button>' : '';
    $('#bs-slots').innerHTML = slots().map(slotHtml).join('');
    const offline = 'Topics need the app’s saved data, which is not available here.';
    if (!data().ready) status(offline); else if ($('#bs-status').textContent === offline) status('');
    $('#bs-form').querySelectorAll('input,button').forEach(el => { el.disabled = !data().ready; });
    requestAnimationFrame(lines);
  }
  // Marker lines from each angle back to the spark it came from, drawn only when both are on screen side by side.
  function lines() {
    const board = $('.bs-board'), svg = $('#bs-links');
    if (!board || root.hidden || getComputedStyle(svg).display === 'none') { if (svg) svg.innerHTML = ''; return; }
    const b = board.getBoundingClientRect(); let paths = '';
    root.querySelectorAll('.bs-stk[data-from]').forEach(st => {
      if (!st.dataset.from) return;
      const sp = root.querySelector('.bs-spark[data-video="'+CSS.escape(st.dataset.from)+'"]');
      if (!sp) return;
      const a = sp.getBoundingClientRect(), c = st.getBoundingClientRect();
      const x1 = a.right-b.left, y1 = a.top+a.height/2-b.top, x2 = c.left-b.left, y2 = c.top+Math.min(28, c.height/2)-b.top;
      paths += '<path d="M'+x1+' '+y1+' C '+(x1+32)+' '+y1+', '+(x2-32)+' '+y2+', '+x2+' '+y2+'"/>';
    });
    svg.setAttribute('viewBox', '0 0 '+b.width+' '+b.height);
    svg.innerHTML = paths;
  }
  async function book(id, day) {
    const t = topics().find(x => x.id === id);
    if (!t) return;
    await mutate('/topic-update', {id, recordDate:day, ...(t.status === 'new' ? {status:'planned'} : {})}, '“'+t.title+'” booked for '+fmt(parse(day))+'. It posts '+fmt(add(parse(day), 6))+'.');
  }
  root.addEventListener('click', async event => {
    const el = event.target.closest('button');
    if (!el) return;
    if (el.dataset.creator !== undefined) { creator = el.dataset.creator || null; spark = null; render(); root.querySelector('.bs-rc[data-creator="'+CSS.escape(el.dataset.creator)+'"]')?.focus(); return; }
    if (el.dataset.video) { spark = spark === el.dataset.video ? null : el.dataset.video; render(); $('#bs-title').focus(); return; }
    if (el.id === 'bs-rail-more') { showAll = !showAll; render(); $('#bs-rail-more')?.focus(); return; }
    if (el.id === 'bs-clear') { spark = null; render(); return; }
    if (el.dataset.book) { await book(el.closest('[data-topic]').dataset.topic, el.dataset.book); return; }
    if (el.dataset.unbook) { const t = topics().find(x => x.id === el.dataset.unbook); await mutate('/topic-update', {id:el.dataset.unbook, recordDate:null}, t ? '“'+t.title+'” is back with the angles.' : ''); return; }
    if (el.dataset.remove) {
      const t = topics().find(x => x.id === el.dataset.remove);
      if (t && await ask('Remove “'+t.title+'”? Its notes and subtopics are deleted too.', 'Remove')) await mutate('/topic-delete', {id:t.id}, 'Removed “'+t.title+'”.');
      return;
    }
    if (el.id === 'bs-prev') { week = add(week, -7); render(); }
    if (el.id === 'bs-next') { week = add(week, 7); render(); }
    if (el.id === 'bs-today') { week = current(); render(); }
  });
  $('#bs-form').addEventListener('submit', async event => {
    event.preventDefault();
    const input = $('#bs-title'), title = input.value.trim();
    if (!title) { status('Write the angle first.'); input.focus(); return; }
    const body = spark ? {title, videoId:spark} : {title};
    const done = await mutate('/topic', body, 'Angle added. Book it into Wednesday or Friday when you are ready.');
    if (done) { input.value = ''; spark = null; render(); input.focus(); }
  });
  root.addEventListener('dragstart', event => { const st = event.target.closest?.('.bs-stk'); if (!st) return; drag = st.dataset.topic; event.dataTransfer.setData('text/plain', drag); event.dataTransfer.effectAllowed = 'move'; st.classList.add('is-dragging'); });
  root.addEventListener('dragend', () => { drag = null; root.querySelectorAll('.is-dragging,.is-over').forEach(el => el.classList.remove('is-dragging','is-over')); });
  root.addEventListener('dragover', event => { const slot = event.target.closest('.bs-slot'); if (!slot || !drag || slot.classList.contains('is-past')) return; event.preventDefault(); slot.classList.add('is-over'); });
  root.addEventListener('dragleave', event => { const slot = event.target.closest('.bs-slot'); if (slot && !slot.contains(event.relatedTarget)) slot.classList.remove('is-over'); });
  root.addEventListener('drop', async event => { const slot = event.target.closest('.bs-slot'); if (!slot || !drag || slot.classList.contains('is-past')) return; event.preventDefault(); slot.classList.remove('is-over'); const id = drag; drag = null; await book(id, slot.dataset.slot); });
  new ResizeObserver(() => requestAnimationFrame(lines)).observe(root);
  window.addEventListener('ww:data', render);
  window.addEventListener('ww:route', event => { if (event.detail[0] === 'topics') render(); });
})();
