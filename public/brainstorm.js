/* Topics: the review step before scheduling (13 November 2026). Ideas are found and sparked on Inspiration
   (#/watchlist); here they are reviewed and booked. The four-column board (Taylor's pick T2-B, 30 October 2026):
   New from Inspiration, Shortlist, then the Recording and Posting schedules side by side. Each week has three recording slots, Monday, Wednesday and Friday
   (Taylor, 11 November 2026), and each video posts on the day Posting settings give it (WWStore.posting in ww-store.js;
   Tuesday, Thursday and Saturday by default), unless a post date is set by hand. */
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
  const OPEN = ['new','shortlisted','planned'];
  // From Saturday the board looks ahead to next week, so Monday's planning can start at the weekend.
  const current = () => monday(add(today(), 2));
  let week = current(), drag = null;
  const M = window.WWMotion; let booking = null;   // motion.js: a week change settles the two schedules, a booking its two new cards
  const data = () => window.WWIdeas.data;
  const topics = () => data().topics || [];
  const status = message => { $('#bs-status').textContent = message; };
  // Posting days come from the one rule in ww-store.js: postOf for a topic, postFor for a recording day (booked or not).
  const posting = () => window.WWStore.posting;
  const postOf = t => { const d = posting().dates(topics()).get(t.id); return d ? parse(d) : null; };
  const postFor = day => parse(posting().dateFor(topics(), typeof day === 'string' ? day : iso(day)));
  // Sparked on Inspiration before 13 November (status new, with a video or a skill origin): they wait in New from Inspiration
  // until Taylor shortlists, books or removes them. Everything else not yet booked is the shortlist.
  const fresh = t => t.status === 'new' && !t.recordDate && (t.sources.length > 0 || !!t.origin);
  const angles = () => topics().filter(t => !t.recordDate && OPEN.includes(t.status) && !fresh(t));
  const newOnes = () => topics().filter(fresh);
  const slots = () => [0, 1, 2, 3, 4, 5, 6].map(i => add(week, i)).filter(d => posting().isRecordingDay(iso(d))).map(d => ({day:d, topic:topics().find(t => t.recordDate === iso(d)), past:iso(d) < iso(today())}));
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
  // Each shortlist card offers one day: the first takes the next free Monday, Wednesday or Friday from today across the
  // whole schedule, the next card the one after, and so on, so no card ever offers a day that is already booked or that
  // another card offers (Taylor, 12 November 2026). Booking one re-renders, so the cards below move up the queue.
  function offerDays(list) {
    const P = window.WWStore?.posting, out = new Map();
    if (!P?.nextFreeSlot) return out;
    const held = [...topics()], from = P.today ? P.today() : iso(new Date());
    for (const t of list) { const day = P.nextFreeSlot(held, from); if (!day) break; out.set(t.id, day); held.push({id:'\u0000'+t.id, recordDate:day}); }
    return out;
  }
  function newHtml(t, day) {
    const src = t.sources[0];
    return '<li class="bs-new" data-topic="'+esc(t.id)+'"><span class="bs-new-title">'+esc(t.title)+'</span>'+(src ? '<span class="bs-meta">From '+esc(src.creator)+': '+esc(src.title)+'</span>' : t.origin?.kind === 'skill' ? '<span class="bs-meta">From the skill</span>' : '')+
      '<span class="bs-stk-actions"><button type="button" data-shortlist="'+esc(t.id)+'">Shortlist</button>'+(day ? '<button type="button" data-book="'+day+'">Book '+esc(fmt(parse(day),{weekday:'short',day:'numeric',month:'short'}))+'</button>' : '')+'<button type="button" class="bs-quiet" data-remove="'+esc(t.id)+'" aria-label="Remove “'+esc(t.title)+'”">Remove</button></span></li>';
  }
  function angleHtml(t, day) {
    const open = day ? [{day:parse(day)}] : [], src = t.sources[0];
    return '<li class="bs-stk" draggable="true" data-topic="'+esc(t.id)+'"><span class="bs-stk-title">'+esc(t.title)+'</span>'+(src ? '<span class="bs-meta">From '+esc(src.creator)+': '+esc(src.title)+'</span>' : t.origin?.kind === 'skill' ? '<span class="bs-meta">From the skill · '+(t.skillLock === 'locked' ? 'title locked' : 'title locks on the next run')+'</span>' : '')+
      '<span class="bs-stk-actions">'+open.map(s => '<button type="button" data-book="'+iso(s.day)+'">Book '+esc(fmt(s.day,{weekday:'short',day:'numeric',month:'short'}))+'</button>').join('')+'<button type="button" class="bs-quiet" data-remove="'+esc(t.id)+'" aria-label="Remove “'+esc(t.title)+'”">Remove</button></span></li>';
  }
  function slotHtml(s) {
    return '<div class="bs-slot'+(s.topic ? ' is-booked' : '')+(s.past ? ' is-past' : '')+'" data-slot="'+iso(s.day)+'"><span class="bs-slot-day">'+esc(fmt(s.day))+'</span><span class="bs-meta">Posts '+esc(fmt(postFor(s.day)))+'</span>'+
      (s.topic ? '<div class="bs-booked"'+M.attr('bs-book:'+iso(s.day), 'in')+'><span>'+esc(s.topic.title)+'</span><span class="bs-booked-actions"><a href="#/schedule">Schedule →</a>'+(s.past ? '' : '<button type="button" data-unbook="'+esc(s.topic.id)+'">Unbook</button>')+'</span></div>'
        : '<p class="bs-put">'+(s.past ? 'Nothing was recorded.' : 'Drop an angle here, or press Book on the shortlist.')+'</p>')+'</div>';
  }
  // Everything booked after the week on screen, so a topic booked weeks ahead is visible from Topics (Taylor, 4 November).
  function laterHtml() {
    const end = iso(add(week, 6)), list = topics().filter(t => t.recordDate && t.recordDate > end).sort((a,b) => a.recordDate.localeCompare(b.recordDate));
    if (!list.length) return '';
    return '<h3 class="bs-post-sub micro">BOOKED LATER</h3><ul class="bs-later">'+list.map(t => '<li><button type="button" data-goto="'+esc(t.recordDate)+'"><span class="bs-slot-day">'+esc(fmt(parse(t.recordDate)))+'</span><span class="bs-later-title">'+esc(t.title)+'</span><span class="bs-meta">Posts '+esc(fmt(postOf(t)))+'</span></button></li>').join('')+'</ul>';
  }
  // Posting runs alongside: this week's posting days (from Posting settings), then the following week's.
  function postHtml() {
    const out = new Set(topics().map(t => postOf(t)).filter(Boolean).map(iso));
    const days = Array.from({length:14}, (_, i) => add(week, i)).filter(d => posting().isPostingDay(iso(d)) || out.has(iso(d))), split = days.findIndex(d => d >= add(week, 7));
    return days.map((d, i) => {
      const going = topics().filter(t => { const p = postOf(t); return p && iso(p) === iso(d); });
      const past = iso(d) < iso(today());
      return (i === split ? '<h3 class="bs-post-sub micro">THE WEEK AFTER</h3>' : '')+'<div class="bs-post'+(going.length ? ' is-set' : '')+(past ? ' is-past' : '')+'"'+M.attr('bs-post:'+iso(d), 'in2')+'><span class="bs-slot-day">'+esc(fmt(d))+'</span>'+
        (going.length ? going.map(t => '<span class="bs-post-title">'+esc(t.title)+'</span><span class="bs-meta">'+(t.recordDate ? (t.recordDate < iso(today()) ? 'Recorded ' : 'Records ')+esc(fmt(parse(t.recordDate))) : '')+(t.status === 'posted' ? ' · Posted' : '')+'</span>').join('') : '<p class="bs-put">'+(past ? 'Nothing was posted.' : 'Nothing booked to post.')+'</p>')+'</div>';
    }).join('');
  }
  function render() {
    // A booking settles only its two new cards (the recording slot, then its posting day), on the render that first shows them.
    const got = booking && topics().find(t => t.id === booking.id && t.recordDate === booking.day);
    if (got) { M.stamp('bs-book:'+booking.day); const p = postOf(got); if (p) M.stamp('bs-post:'+iso(p)); booking = null; }
    const thisWeek = iso(week) === iso(current());
    $('#bs-week').textContent = (thisWeek ? 'Recording week' : 'Week')+' of '+fmt(week,{day:'numeric',month:'long'});
    $('#bs-today').disabled = thisWeek;
    const list = angles(), waiting = newOnes(), offers = offerDays([...list, ...waiting]);
    $('#bs-sparks').innerHTML = waiting.length ? waiting.map(t => newHtml(t, offers.get(t.id))).join('') : '<li class="bs-empty"><p>Nothing new. Ideas you spark on Inspiration go straight onto the shortlist.</p></li>';
    $('#bs-angles').innerHTML = list.length ? list.map(t => angleHtml(t, offers.get(t.id))).join('') : '<li class="bs-empty"><p>No angles waiting. Write one below, or spark one from Inspiration.</p></li>';
    $('#bs-slots').innerHTML = slots().map(slotHtml).join('')+laterHtml();
    $('#bs-posts').innerHTML = postHtml();
    const offline = 'Topics need the app’s saved data, which is not available here.';
    if (!data().ready) status(offline); else if ($('#bs-status').textContent === offline) status('');
    $('#bs-form').querySelectorAll('input,button').forEach(el => { el.disabled = !data().ready; });
  }
  async function book(id, day) {
    const t = topics().find(x => x.id === id);
    if (!t) return;
    booking = {id, day};
    await mutate('/topic-update', {id, recordDate:day, ...(t.status === 'new' ? {status:'planned'} : {})}, '“'+t.title+'” booked for '+fmt(parse(day))+'. It posts '+fmt(postFor(day))+'.');
  }
  root.addEventListener('click', async event => {
    const el = event.target.closest('button');
    if (!el) return;
    if (el.dataset.shortlist) { const t = topics().find(x => x.id === el.dataset.shortlist); await mutate('/topic-update', {id:el.dataset.shortlist, status:'shortlisted'}, t ? '“'+t.title+'” is on the shortlist.' : ''); return; }
    if (el.dataset.book) { await book(el.closest('[data-topic]').dataset.topic, el.dataset.book); return; }
    if (el.dataset.unbook) { const t = topics().find(x => x.id === el.dataset.unbook); await mutate('/topic-update', {id:el.dataset.unbook, recordDate:null}, t ? '“'+t.title+'” is back on the shortlist.' : ''); return; }
    if (el.dataset.remove) {
      const t = topics().find(x => x.id === el.dataset.remove);
      if (t && await ask('Remove “'+t.title+'”? Its notes and subtopics are deleted too.', 'Remove')) await mutate('/topic-delete', {id:t.id}, 'Removed “'+t.title+'”.');
      return;
    }
    if (el.dataset.goto) { week = monday(parse(el.dataset.goto)); render(); $('#bs-week').scrollIntoView({block:'nearest'}); return; }
    if (el.id === 'bs-prev') { week = add(week, -7); M.enter(root, 'week'); render(); }
    if (el.id === 'bs-next') { week = add(week, 7); M.enter(root, 'week'); render(); }
    if (el.id === 'bs-today') { week = current(); M.enter(root, 'week'); render(); }
  });
  $('#bs-form').addEventListener('submit', async event => {
    event.preventDefault();
    const input = $('#bs-title'), title = input.value.trim();
    if (!title) { status('Write the angle first.'); input.focus(); return; }
    const done = await mutate('/topic', {title}, 'Angle added. Book it into Monday, Wednesday or Friday when you are ready.');
    if (done) { input.value = ''; render(); input.focus(); }
  });
  root.addEventListener('dragstart', event => { const st = event.target.closest?.('.bs-stk'); if (!st) return; drag = st.dataset.topic; event.dataTransfer.setData('text/plain', drag); event.dataTransfer.effectAllowed = 'move'; st.classList.add('is-dragging'); });
  root.addEventListener('dragend', () => { drag = null; root.querySelectorAll('.is-dragging,.is-over').forEach(el => el.classList.remove('is-dragging','is-over')); });
  root.addEventListener('dragover', event => { const slot = event.target.closest('.bs-slot'); if (!slot || !drag || slot.classList.contains('is-past')) return; event.preventDefault(); slot.classList.add('is-over'); });
  root.addEventListener('dragleave', event => { const slot = event.target.closest('.bs-slot'); if (slot && !slot.contains(event.relatedTarget)) slot.classList.remove('is-over'); });
  root.addEventListener('drop', async event => { const slot = event.target.closest('.bs-slot'); if (!slot || !drag || slot.classList.contains('is-past')) return; event.preventDefault(); slot.classList.remove('is-over'); const id = drag; drag = null; await book(id, slot.dataset.slot); });
  window.addEventListener('ww:data', () => render());
  window.addEventListener('ww:settings', () => { if (!root.hidden) render(); });
  window.addEventListener('ww:route', event => { if (event.detail[0] === 'topics') render(); });
})();
